import { defineConfig, devices } from '@playwright/test';

// Lab 10.1 — Playwright 공통 설정
// 실행 전: node tests/e2e/global-setup.mjs (state.json 생성) + $env:SF_INSTANCE_URL 주입 (tests/e2e/README.md)
// 태그: 매물 탐색 탭(WI-1.005) 이 필요한 테스트는 `@explore` (PHASE-PLAN-01 §3.3)
//   - 1차 실행(탭 생성 전): $env:E2E_SKIP_EXPLORE = "1"  또는  npx playwright test --grep-invert "@explore"
//   - WI-1.005 전체 UI 회귀: 환경변수 없이 npx playwright test
export default defineConfig({
  testDir: './tests/e2e', // 테스트(spec) 파일 위치
  timeout: 60_000, // 테스트 1건 제한시간 — Salesforce 는 느릴 수 있어 넉넉히
  expect: { timeout: 15_000 },
  fullyParallel: false, // 같은 org 데이터를 공유하므로 결정성을 위해 직렬
  workers: 1,
  retries: 0, // 결정성 우선. 원인 분석 시 --retries=1 로 실행하면 trace 기록
  grepInvert: process.env.E2E_SKIP_EXPLORE ? /@explore/ : undefined,
  use: {
    baseURL: process.env.SF_INSTANCE_URL, // 대상 org 주소 (DEV/SIT/UAT 전환)
    storageState: process.env.E2E_STORAGE_STATE ?? 'tests/e2e/.auth/state.json', // Lab 10.2 로그인 상태
    viewport: { width: 1440, height: 900 }, // AC 공통 전제 §1.3
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } }],
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
});
