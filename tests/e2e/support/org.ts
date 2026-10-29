// 공용 E2E 헬퍼 — 대상 org 가드 + sf CLI 실행 (코드 리뷰 WI-1.003 L-4 이월)
// sf 명령을 실행하거나 데이터를 바꾸는(UI 편집 포함) spec 은 반드시 이 헬퍼를 거친다.
// 허용 대상: DH-DEV / DH-SIT / DH-UAT (Scratch Org) 만. DH-HUB(= core, PROD) 및 그 밖의 별칭은 거부(throw).
//   1) 별칭 allowlist
//   2) `sf org display` 결과가 Scratch Org(devHubId·expirationDate 존재)이고 Dev Hub 사용자 자신이 아님
//   3) SF_INSTANCE_URL(Playwright baseURL)이 대상 org 의 instanceUrl 과 같은 호스트 — 별칭은 DEV 인데 브라우저는 PROD 를 여는 사고 방지
// 토큰 등 민감정보는 출력·반환하지 않는다.
import { execSync } from 'node:child_process';

export const ALLOWED_ORGS = ['DH-DEV', 'DH-SIT', 'DH-UAT'] as const;
export type AllowedOrg = (typeof ALLOWED_ORGS)[number];

/** 대상 org 별칭 (SF_TARGET_ORG, 기본 DH-DEV) — 가드 없음(조건 판단용) */
export function targetOrg(): string {
  return process.env.SF_TARGET_ORG ?? 'DH-DEV';
}

/** sf CLI 실행 → result. 색상 끄고 ANSI 제거 후 파싱 (출력은 화면에 흘리지 않음) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function runSf(cmd: string): any {
  const raw = execSync(`${cmd} --json`, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
    env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1', SF_DISABLE_COLORS: 'true' },
  });
  // eslint-disable-next-line no-control-regex
  const clean = raw.replace(/\u001b\[[0-9;]*m/g, '');
  return JSON.parse(clean.slice(clean.indexOf('{'))).result;
}

let verified: { org: AllowedOrg; instanceUrl: string } | undefined;

/**
 * 대상 org 가 안전한지 확인하고 별칭을 돌려준다. 허용되지 않으면 Error.
 * 프로세스당 1회만 sf org display 를 호출한다(캐시).
 */
export function assertSafeOrg(): AllowedOrg {
  const org = targetOrg();
  if (!(ALLOWED_ORGS as readonly string[]).includes(org)) {
    throw new Error(
      `[org guard] SF_TARGET_ORG='${org}' 은 허용되지 않음. 데이터 변경/sf 명령 spec 은 ${ALLOWED_ORGS.join(' / ')} 에서만 실행 (DH-HUB/core = PROD 금지)`,
    );
  }
  if (verified?.org === org) return verified.org;

  let info: { instanceUrl?: string; username?: string; devHubId?: string; expirationDate?: string };
  try {
    info = runSf(`sf org display -o ${org}`);
  } catch {
    throw new Error(`[org guard] sf org display 실패 (org=${org}) — sf org login 상태 확인`);
  }
  if (!info.devHubId || !info.expirationDate || info.username === info.devHubId) {
    throw new Error(`[org guard] '${org}' 가 Scratch Org 가 아님(devHubId/expirationDate 없음 또는 Dev Hub 사용자) — 실행 중단`);
  }
  const baseUrl = process.env.SF_INSTANCE_URL;
  if (baseUrl && info.instanceUrl && new URL(baseUrl).host !== new URL(info.instanceUrl).host) {
    throw new Error(`[org guard] SF_INSTANCE_URL 이 '${org}' 의 instanceUrl 과 다름 — 브라우저 대상과 sf 대상 불일치, 실행 중단`);
  }
  verified = { org: org as AllowedOrg, instanceUrl: info.instanceUrl ?? '' };
  return verified.org;
}

/**
 * 가드를 통과한 대상 org 로 sf 명령 실행. `-o <org>` 는 이 함수가 붙인다(호출부에서 지정 금지).
 * 예: sfResult(`sf data query -q "SELECT Id FROM Property__c"`)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sfResult(cmd: string): any {
  if (/\s(-o|--target-org)\s/.test(` ${cmd} `)) {
    throw new Error('[org guard] sfResult 호출부에서 -o/--target-org 를 지정하지 말 것 (가드된 SF_TARGET_ORG 사용)');
  }
  const org = assertSafeOrg();
  return runSf(`${cmd} -o ${org}`);
}
