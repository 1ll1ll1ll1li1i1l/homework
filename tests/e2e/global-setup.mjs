// Lab 10.2 — Salesforce 로그인 세션 저장 (storageState)
// 사용: node tests/e2e/global-setup.mjs   (대상 org: $env:SF_TARGET_ORG, 기본 DH-DEV)
// 출력: tests/e2e/.auth/state.json (세션 쿠키 포함 — 커밋 금지, .gitignore 처리됨)
//
// 참고: 현재 org 는 `frontdoor.jsp?sid=<accessToken>` 직접 접속을 로그인 화면으로 돌려보낸다.
//       그래서 sf CLI 가 발급하는 1회용 frontdoor URL(`sf org open --url-only`, otp 방식)을 먼저 쓰고,
//       실패할 때만 Lab 원문의 sid 방식으로 시도한다. 토큰/URL 은 절대 출력하지 않는다.
import { execSync } from 'node:child_process';
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
