// Playwright 역할 사용자(agent / admin / noaccess) 생성 — AC 문서 §1.3, WI-1.001 §4.6, WI-1.005 §2
// 사용: node tests/e2e/setup-users.mjs        (대상 org: $env:SF_TARGET_ORG, 기본 DH-DEV)
//
// - 대상 org 가드: support/org.ts 의 assertSafeOrg() — DH-DEV / DH-SIT / DH-UAT(Scratch Org)만. DH-HUB/core(PROD) 는 throw.
// - 정의 파일: config/users/<role>-user-def.json
//     Username 의 `{orgId}` 는 대상 org Id(소문자)로 치환 → org 마다 전역 고유·결정적(멱등 판단 기준)
//     profileName = `Minimum Access - Salesforce`(코드 리뷰 H-2). 라이선스 부족(LICENSE_LIMIT_EXCEEDED 등)이면 fallbackProfileName
//     (`Standard Platform User`)으로 재시도. Property__c 권한은 권한 세트로만 부여(permsets). noaccess 는 권한 세트 없음.
// - 멱등: 이미 있는 사용자는 만들지 않고, 빠진 권한 세트만 할당. noaccess 에 DreamHouse_* 가 할당돼 있으면 실패 처리.
// - 권한 세트(앱·탭 가시성 포함) 배포 전이면 할당이 실패할 수 있어 재시도한다(E2E_USER_RETRIES, 기본 10회 × 30초).
// - 비밀번호·토큰·로그인 URL 은 만들지도 출력하지도 않는다. 세션 저장은 global-setup.mjs 가 처리한다:
//   `Minimum Access - Salesforce` 사용자는 API Enabled 가 없어 `sf org open -o <username>` 이 불가('API is disabled for this User')
//   → 시스템 관리자 세션에서 '로그인 대상(Login As)'(`/servlet/servlet.su`)으로 전환해 storageState 저장.
import { execSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { assertSafeOrg, sfResult } from './support/org.ts';

export const ROLES = /** @type {const} */ (['agent', 'admin', 'noaccess']);
const RETRIES = Number(process.env.E2E_USER_RETRIES ?? 10);
const RETRY_MS = 30_000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** sf 명령 실행(가드 없이 -o 를 직접 지정해야 하는 경우만 — 대상은 항상 assertSafeOrg 통과 org/사용자). 실패 시 sf 의 message 만 담아 throw */
function sfRaw(cmd) {
  let raw;
  try {
    raw = execSync(`${cmd} --json`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1', SF_DISABLE_COLORS: 'true' },
    });
  } catch (e) {
    raw = String(e.stdout ?? '');
  }
  // eslint-disable-next-line no-control-regex
  const clean = raw.replace(/\u001b\[[0-9;]*m/g, '');
  let json;
  try {
    json = JSON.parse(clean.slice(clean.indexOf('{')));
  } catch {
    throw new Error(`sf 출력 파싱 실패: ${cmd.split(' ').slice(0, 4).join(' ')}`);
  }
  if (json.status !== 0) {
    const err = new Error(String(json.message ?? json.name ?? 'sf 명령 실패'));
    err.sfName = json.name;
    throw err;
  }
  return json.result;
}

/** 대상 org 기준 역할 사용자 정의 (Username 치환 완료) */
export function userDef(role, orgId) {
  const def = JSON.parse(readFileSync(`config/users/${role}-user-def.json`, 'utf8'));
  def.Username = def.Username.replace('{orgId}', orgId.slice(0, 15).toLowerCase());
  return def;
}

/** 역할별 Username 목록 (global-setup 에서도 사용) */
export function roleUsernames() {
  assertSafeOrg();
  const orgId = sfResult('sf org display').id;
  return Object.fromEntries(ROLES.map((r) => [r, userDef(r, orgId).Username]));
}

function queryUser(username) {
  return sfResult(
    `sf data query -q "SELECT Id, Username, IsActive, Profile.Name FROM User WHERE Username = '${username}'"`,
  ).records[0];
}

function assignedPermsets(userId) {
  return sfResult(
    `sf data query -q "SELECT PermissionSet.Name FROM PermissionSetAssignment WHERE AssigneeId = '${userId}' AND PermissionSet.IsOwnedByProfile = false"`,
  ).records.map((r) => r.PermissionSet.Name);
}

const LICENSE_ERR = /LICENSE_LIMIT_EXCEEDED|license|라이선스/i;

/**
 * 프로필 + 권한 세트 조합이 Lightning Experience 사용 권한(PermissionsLightningExperienceUser)을 주는지.
 * `Minimum Access - Salesforce` 프로필은 LEX 권한이 없어, 권한 세트가 주지 않으면 로그인 시 Classic(/home/home.jsp)으로 간다
 * (2026-10-29 DH-DEV 관측). 이 경우 E2E(매물 탐색 App Page) 를 실행할 수 없으므로 fallbackProfileName 을 쓴다.
 */
function lexGranted(profileName, permsets) {
  const names = permsets.map((n) => `'${n}'`).join(',');
  const where = names ? `(Profile.Name = '${profileName}' OR Name IN (${names}))` : `Profile.Name = '${profileName}'`;
  return sfResult(`sf data query -q "SELECT Id FROM PermissionSet WHERE ${where} AND PermissionsLightningExperienceUser = true"`).records.length > 0;
}

/** 역할 정의에 맞는 프로필 결정: 기본(Minimum Access) → LEX 미부여면 대체 프로필 */
function chooseProfile(role, def) {
  if (!def.fallbackProfileName || lexGranted(def.profileName, def.permsets ?? [])) return { profile: def.profileName };
  return { profile: def.fallbackProfileName, reason: `'${def.profileName}'+권한 세트에 LightningExperienceUser 없음` };
}

function createUser(org, role, def, profileName0) {
  const { fallbackProfileName, permsets: _ignored, ...base } = def; // 권한 세트는 생성 후 별도 할당(멱등·재시도)
  const dir = mkdtempSync(join(tmpdir(), 'dh-user-'));
  const tryProfile = (profileName) => {
    const file = join(dir, `${role}.json`);
    writeFileSync(file, JSON.stringify({ ...base, profileName }), 'utf8');
    sfRaw(`sf org create user -o ${org} --definition-file "${file}" --set-alias ${org}-${role}`);
    return profileName;
  };
  try {
    try {
      return tryProfile(profileName0);
    } catch (e) {
      if (!fallbackProfileName || profileName0 === fallbackProfileName || !LICENSE_ERR.test(e.message)) throw e;
      console.log(`  ${role}: '${profileName0}' 라이선스 부족 → '${fallbackProfileName}' 로 재시도`);
      return tryProfile(fallbackProfileName);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

async function assignPermset(org, username, permset) {
  for (let i = 1; ; i++) {
    try {
      sfRaw(`sf org assign permset -o ${org} -n ${permset} -b ${username}`);
      return;
    } catch (e) {
      if (/duplicate|already/i.test(e.message)) return;
      if (i >= RETRIES) throw new Error(`${permset} 할당 실패(${username}): ${e.message}`);
      console.log(`  ${permset} 할당 대기(${i}/${RETRIES}) — 권한 세트 배포 확인 중: ${e.message.split('\n')[0]}`);
      await sleep(RETRY_MS);
    }
  }
}

export async function setupUsers() {
  const org = assertSafeOrg();
  const orgId = sfResult('sf org display').id;
  const summary = [];
  for (const role of ROLES) {
    const def = userDef(role, orgId);
    let user = queryUser(def.Username);
    let action = 'exists';
    const choice = chooseProfile(role, def);
    if (choice.reason) console.log(`  ${role}: ${choice.reason} → '${choice.profile}' 사용`);
    if (!user) {
      try {
        createUser(org, role, def, choice.profile);
      } catch (e) {
        // Minimum Access 프로필은 API Enabled 가 없어, 사용자 생성 직후 sf 가 새 사용자 인증 파일을 만들 때
        // 'API is disabled for this User' 로 실패한다(사용자 자체는 생성됨). 사용자가 있으면 정상으로 본다.
        if (!queryUser(def.Username)) throw e;
      }
      user = queryUser(def.Username);
      action = 'created';
    } else {
      // 기존 사용자: alias 만 보장(sf 인증 파일이 없는 PC 라면 global-setup 이 경고)
      try {
        sfRaw(`sf alias set ${org}-${role}=${def.Username}`);
      } catch {
        /* alias 실패는 무시 */
      }
    }
    if (!user) throw new Error(`${role} 사용자 생성 후 조회 실패: ${def.Username}`);
    if (!user.IsActive) throw new Error(`${role} 사용자 비활성: ${def.Username}`);
    if (choice.reason && user.Profile?.Name === def.profileName) {
      // 기존 사용자가 LEX 없는 기본 프로필이면 대체 프로필로 변경(라이선스 여유 필요)
      const pid = sfResult(`sf data query -q "SELECT Id FROM Profile WHERE Name = '${choice.profile}'"`).records[0].Id;
      sfResult(`sf data update record -s User -i ${user.Id} -v "ProfileId=${pid}"`);
      user = queryUser(def.Username);
      action = 'profile-changed';
    } else if (!choice.reason && def.fallbackProfileName && user.Profile?.Name === def.fallbackProfileName && action === 'exists') {
      // 권한 세트가 LEX 를 부여하게 됨 → 기본 프로필(Minimum Access)로 되돌린다. 라이선스가 부족하면 현재 프로필 유지
      const pid = sfResult(`sf data query -q "SELECT Id FROM Profile WHERE Name = '${def.profileName}'"`).records[0].Id;
      try {
        sfResult(`sf data update record -s User -i ${user.Id} -v "ProfileId=${pid}"`);
        user = queryUser(def.Username);
        action = 'profile-restored';
      } catch {
        console.log(`  ${role}: '${def.profileName}' 로 되돌리기 실패(라이선스 부족 등) → '${def.fallbackProfileName}' 유지`);
      }
    }

    const have = assignedPermsets(user.Id);
    for (const ps of def.permsets ?? []) {
      if (!have.includes(ps)) await assignPermset(org, def.Username, ps);
    }
    const final = assignedPermsets(user.Id);
    if ((def.permsets ?? []).length === 0 && final.some((n) => n.startsWith('DreamHouse_'))) {
      throw new Error(`noaccess 사용자에 DreamHouse 권한 세트가 할당돼 있음(${final.join(', ')}) — AC-055 전제 위반`);
    }
    summary.push({ role, username: def.Username, profile: user.Profile?.Name, permsets: final.join(', ') || '(없음)', action });
  }
  return { org, summary };
}

// 직접 실행 시
if (/setup-users\.mjs$/.test(process.argv[1] ?? '')) {
  try {
    const { org, summary } = await setupUsers();
    console.log(`역할 사용자 준비 완료 (org=${org})`);
    console.table(summary);
  } catch (e) {
    console.error(`역할 사용자 준비 실패: ${e.message}`);
    process.exit(1);
  }
}
