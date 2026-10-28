# E2E 테스트 (Playwright) — 실행 방법

Lab 10.4 기준. 테스터 수동 실행(CI 없음). PowerShell 7, 프로젝트 루트에서 실행.

```powershell
# 0) 최초 1회
npm install
npx playwright install chromium

# 1) 대상 org (DH-DEV / DH-SIT / DH-UAT)
$env:SF_TARGET_ORG = "DH-DEV"

# 2) 로그인 세션 저장 (처음 / 만료 / org 변경 시) → tests/e2e/.auth/state.json
node tests/e2e/global-setup.mjs

# 3) baseURL 주입
$env:SF_INSTANCE_URL = (sf org display -o $env:SF_TARGET_ORG --json | ConvertFrom-Json).result.instanceUrl

# 4) 실행
npx playwright test                                  # 전체 (WI-1.005 회귀)
npx playwright test --grep-invert "@explore"         # 매물 탐색 탭 생성 전 1차 실행
npx playwright test tests/e2e/WI-1.001-property-crud.spec.ts --grep-invert "@explore"
npx playwright test --headed                         # 브라우저 보며 실행
npx playwright test --ui                             # UI 모드

# 5) 리포트
npx playwright show-report
```

- spec 규칙: `tests/e2e/WI-p.nnn-<기능>.spec.ts`, 각 test 에 `// AC-nnn / REQ-nnn / WI-p.nnn` 주석.
- 매물 탐색 탭이 필요한 테스트는 `{ tag: '@explore' }` (PHASE-PLAN-01 §3.3). `$env:E2E_SKIP_EXPLORE = "1"` 로도 제외 가능.
- 다른 사용자 상태 파일 사용: `$env:E2E_STORAGE_STATE = "tests/e2e/.auth/agent.json"`.
- `tests/e2e/.auth/`, `playwright-report/`, `test-results/` 는 커밋 금지(.gitignore 처리됨).
