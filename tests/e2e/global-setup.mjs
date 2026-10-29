// Lab 10.2 — Salesforce 로그인 세션 저장 (storageState)
// 사용: node tests/e2e/global-setup.mjs   (대상 org: $env:SF_TARGET_ORG, 기본 DH-DEV)
// 출력: tests/e2e/.auth/state.json (세션 쿠키 포함 — 커밋 금지, .gitignore 처리됨)
//       + 역할 세션 tests/e2e/.auth/agent.json · admin.json · noaccess.json (ADDED 2026-10-29, WI-1.005)
//
// 역할 세션(AC 문서 §1.3): 대상 org 가 DH-DEV/SIT/UAT(support/org.ts 가드)일 때만.
//   1) tests/e2e/setup-users.mjs 로 역할 사용자 생성·권한 세트 할당(멱등) — E2E_SKIP_USERS=1 이면 생략
//   2) 역할 사용자는 Minimum Access 프로필(API Enabled 없음)이라 `sf org open -o <username>` / `sf org generate password` 가
//      'API is disabled for this User' 로 불가하고, '로그인 대상(Login As)' 도 org 설정상 '권한 부족'(2026-10-29 DH-DEV 관측).
//      → 실행할 때마다 1회용 무작위 암호를 관리자 익명 Apex `System.setPassword`(stdin 전달, 파일·화면 출력 없음)로 지정하고
//        로그인 화면(username → password 2단계)으로 로그인. '암호 변경' 화면이 나오면 새 무작위 암호로 변경. 암호는 메모리에만 둔다.
//      로그인 후 Lightning `$SObjectType.CurrentUser.Id` 가 대상 사용자인지 확인(아니면 저장하지 않음).
//   역할 세션 생략: E2E_ROLES=none (또는 E2E_STORAGE_STATE 지정 시), 일부만: E2E_ROLES=agent,admin
//
// 참고: 현재 org 는 `frontdoor.jsp?sid=<accessToken>` 직접 접속을 로그인 화면으로 돌려보낸다.
//       그래서 sf CLI 가 발급하는 1회용 frontdoor URL(`sf org open --url-only`, otp 방식)을 먼저 쓰고,
//       실패할 때만 Lab 원문의 sid 방식으로 시도한다. 토큰/URL 은 절대 출력하지 않는다.
import { execSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { chromium } from '@playwright/test';

const org = process.env.SF_TARGET_ORG ?? 'DH-DEV';
const statePath = process.env.E2E_STORAGE_STATE ?? 'tests/e2e/.auth/state.json';

// Windows 에서도 sf.cmd 가 실행되도록 shell 사용, 출력은 화면에 흘리지 않음
const sfJson = (cmd) =>
  JSON.parse(execSync(cmd, { shell: true, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })).result;

// 1) 로그인 URL 후보 (민감정보 — 출력 금지)
const loginUrls = [];
let instanceUrl;
try {
  const info = sfJson(`sf org display -o ${org} --json`);
  instanceUrl = info.instanceUrl;
  try {
    loginUrls.push(sfJson(`sf org open -o ${org} --url-only --json`).url);
  } catch {
    /* sf org open 실패 시 sid 방식만 시도 */
  }
  loginUrls.push(`${info.instanceUrl}/secur/frontdoor.jsp?sid=${encodeURIComponent(info.accessToken)}`);
} catch {
  console.error(`sf org display 실패 (org=${org}). sf org login 상태를 확인하세요.`);
  process.exit(1);
}

// 2) frontdoor 로 즉시 로그인 → Lightning 진입 확인 → state.json 저장
mkdirSync(dirname(statePath), { recursive: true });
const browser = await chromium.launch();
let saved = false;
try {
  for (const url of loginUrls) {
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      await page.goto(url, { waitUntil: 'commit' });
      await page.waitForURL(/\/lightning\/|\/home\/home\.jsp|\/setup\//, { timeout: 60_000, waitUntil: 'commit' });
      await context.storageState({ path: statePath });
      saved = true;
      break;
    } catch {
      // 다음 방식으로 재시도 (에러 메시지에 URL/토큰이 포함될 수 있어 출력하지 않음)
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}

if (saved) {
  console.log(`로그인 세션 저장 완료: org=${org} ${instanceUrl} -> ${statePath}`);
} else {
  console.error(`frontdoor 로그인 실패 (org=${org}). 세션 만료 시 sf org login 후 재시도하세요.`);
  process.exit(1);
}

// 3) 역할 세션 (agent / admin / noaccess)
const roles = (process.env.E2E_ROLES ?? 'agent,admin,noaccess')
  .split(',')
  .map((r) => r.trim())
  .filter(Boolean);
if (roles.includes('none') || process.env.E2E_STORAGE_STATE) {
  console.log('역할 세션 저장 생략 (E2E_ROLES=none 또는 E2E_STORAGE_STATE 지정)');
  process.exit(0);
}
const { assertSafeOrg, sfResult } = await import('./support/org.ts');
const { setupUsers, roleUsernames } = await import('./setup-users.mjs');
try {
  assertSafeOrg(); // DH-DEV/SIT/UAT 외(DH-HUB/core 등)는 throw — 역할 사용자를 만들거나 전환하지 않음
} catch (e) {
  console.error(`${e.message} → 역할 세션 저장 생략`);
  process.exit(0);
}
if (!process.env.E2E_SKIP_USERS) {
  const { summary } = await setupUsers();
  for (const u of summary) console.log(`  사용자 ${u.role}: ${u.username} (${u.profile}; ${u.permsets}; ${u.action})`);
}
const usernames = roleUsernames();
const pwd = () => `Dh${randomBytes(15).toString('base64url')}!7a`; // 대문자·소문자·숫자·특수문자 포함

/** 관리자 익명 Apex 로 암호 지정 — 코드는 stdin 으로만 전달(파일·로그 없음). 대상 org 는 가드 통과 org */
function setPassword(userId, password) {
  const raw = execSync(`sf apex run -o ${assertSafeOrg()} --json`, {
    encoding: 'utf8',
    input: `System.setPassword('${userId}', '${password}');`,
    stdio: ['pipe', 'pipe', 'ignore'],
    env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1', SF_DISABLE_COLORS: 'true' },
  });
  // eslint-disable-next-line no-control-regex
  const res = JSON.parse(raw.replace(/\u001b\[[0-9;]*m/g, '').slice(raw.indexOf('{'))).result;
  if (!res?.success) throw new Error('System.setPassword 실패');
}

let failed = 0;
const roleBrowser = await chromium.launch();
try {
  for (const role of roles) {
    const username = usernames[role];
    if (!username) continue;
    const userId = sfResult(
      `sf data query -q "SELECT Id FROM User WHERE Username = '${username}' AND IsActive = true"`,
    ).records[0]?.Id;
    if (!userId) {
      console.error(`  ${role}: 사용자 없음(${username}) — node tests/e2e/setup-users.mjs 실행 필요`);
      failed++;
      continue;
    }
    const rolePath = `tests/e2e/.auth/${role}.json`;
    const context = await roleBrowser.newContext();
    const page = await context.newPage();
    try {
      let password = pwd();
      setPassword(userId, password);
      await page.goto(`${instanceUrl}/`);
      await page.locator('#username').fill(username);
      await page.locator('#Login').click(); // 2단계 로그인: 사용자 이름 → 암호
      await page.locator('#password').fill(password);
      await page.locator('#Login').click();
      // 로그인 후 중간 화면 처리: 암호 변경(ChangePassword) → 전화번호 등록 권유(AddPhoneNumber, 건너뛰기) → Lightning
      for (let step = 0; step < 4; step++) {
        await page.waitForURL(/\/lightning\/|\/one\/one\.app|ChangePassword|AddPhoneNumber/, { timeout: 90_000, waitUntil: 'commit' });
        if (/\/lightning\/|\/one\/one\.app/.test(page.url())) break;
        if (/ChangePassword/.test(page.url())) {
          // 관리자가 지정한 암호는 첫 로그인 시 변경 요구 → 새 무작위 암호로 변경
          const next = pwd();
          await page.locator('#currentpassword').fill(password);
          await page.locator('#newpassword').fill(next);
          await page.locator('#confirmpassword').fill(next);
          if (await page.locator('#question').count()) {
            await page.locator('#question').selectOption({ index: 1 });
            await page.locator('#answer').fill(randomBytes(8).toString('hex'));
          }
          await page.locator('#password-button').click();
          password = next;
          await page.waitForURL((u) => !/ChangePassword/.test(u.pathname), { timeout: 90_000, waitUntil: 'commit' });
        } else {
          // 전화번호 등록 권유 → "등록하지 않음" 링크(ko/en)
          await page.getByRole('link', { name: /등록하지 않|Don.t Want|Remind Me Later|나중에/ }).first().click();
          await page.waitForURL((u) => !/AddPhoneNumber/.test(u.pathname), { timeout: 90_000, waitUntil: 'commit' });
        }
      }
      // 로그인 사용자 확인: Lightning 런타임의 현재 사용자 Id
      const current = await page
        .waitForFunction(
          () => {
            try {
              return window.$A?.get?.('$SObjectType.CurrentUser.Id');
            } catch {
              return null; // Aura 초기화 전
            }
          },
          null,
          { timeout: 90_000, polling: 1_000 },
        )
        .then((h) => h.jsonValue());
      if (String(current).slice(0, 15) !== userId.slice(0, 15)) throw new Error('로그인 사용자 불일치');
      await context.storageState({ path: rolePath });
      console.log(`  역할 세션 저장: ${role} (${username}) -> ${rolePath}`);
    } catch (e) {
      failed++;
      // URL·암호가 섞이지 않도록 첫 줄만, URL 제거 후 출력
      const msg = String(e.message).split('\n')[0].replace(/https?:\/\/\S+/g, '<url>');
      console.error(`  ${role}: 세션 저장 실패 — ${msg} (현재 경로: ${new URL(page.url()).pathname})`);
    } finally {
      await context.close();
    }
  }
} finally {
  await roleBrowser.close();
}
if (failed) process.exit(1);
