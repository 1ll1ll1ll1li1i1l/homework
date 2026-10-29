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
npx playwright test --grep-invert "@explore" --pass-with-no-tests  # 매물 탐색 탭 생성 전 1차 실행 (WI-1.002 처럼 전부 @explore 인 spec 은 0건)
npx playwright test tests/e2e/WI-1.001-property-crud.spec.ts --grep-invert "@explore"
npx playwright test --headed                         # 브라우저 보며 실행
npx playwright test --ui                             # UI 모드

# 5) 리포트
npx playwright show-report
```

- spec 규칙: `tests/e2e/WI-p.nnn-<기능>.spec.ts`, 각 test 에 `// AC-nnn / REQ-nnn / WI-p.nnn` 주석.
- 매물 탐색 탭이 필요한 테스트는 `{ tag: '@explore' }` (PHASE-PLAN-01 §3.3). `$env:E2E_SKIP_EXPLORE = "1"` 로도 제외 가능.
- 필터 입력 → 서버 조회 조건 연결(WI-1.004)이 필요한 테스트는 `@filter` 를 추가로 단다. WI-1.004 이전: `npx playwright test tests/e2e/WI-1.003 --grep-invert "@filter|@perf"`. 성능 AC(`@perf`)는 `SF_TARGET_ORG=DH-SIT`(또는 `E2E_PERF=1`)일 때만 실행.
- Aura 네트워크 모의 헬퍼: `tests/e2e/support/aura.ts` — `delayGetProperties`(AC-046), `failGetProperties`(AC-047), `emptyGetProperties`(빈 결과). boxcar 요청 안에서 `PropertyController.getProperties` action 만 바꾼다.
- 데이터를 바꾸는 테스트(AC-044)는 `afterEach` 에서 `sf data update record` 로 복원한다(대상 org = `SF_TARGET_ORG`).
- 대상 org 가드(ADDED 2026-10-29, 코드 리뷰 L-4): sf 명령·데이터 변경 spec 은 `tests/e2e/support/org.ts` 의 `assertSafeOrg()`/`sfResult()` 를 거친다 — `DH-DEV`/`DH-SIT`/`DH-UAT`(Scratch Org) 만 허용, `DH-HUB`/`core`(PROD)·기타 별칭, `SF_INSTANCE_URL` 불일치는 throw. `sfResult` 호출부에 `-o` 지정 금지.
- 필터 입력 헬퍼: `tests/e2e/support/filter.ts` — 가격 입력은 `setPrice()`(lightning-input 이 포커스 시 표시값을 바꿔 `fill` 이 기존 값 뒤에 이어 붙는 문제 회피). 잠정 AC 활성화: `$env:E2E_CK04 = "1"`(AC-057) / `$env:E2E_CK03 = "1"`(AC-058).
- 다른 사용자 상태 파일 사용: `$env:E2E_STORAGE_STATE = "tests/e2e/.auth/agent.json"`.
- `tests/e2e/.auth/`, `playwright-report/`, `test-results/` 는 커밋 금지(.gitignore 처리됨).
- 공용 헬퍼: `tests/e2e/support/explorer.ts` — `gotoExplorer(page)`("매물 탐색" `/lightning/n/Property_Explorer` 진입·대기), `cardByName()`, `storageStateFor('agent'|'admin')`(역할 파일이 없으면 기본 state.json 으로 대체하고 리포트에 `auth` annotation).
- 역할 사용자(`agent`/`admin`/`noaccess`) 생성·`.auth/<role>.json` 저장 스크립트는 아직 없음(이월). 만들 때 프로필은 `Minimum Access - Salesforce`(코드 리뷰 H-2), Property__c 권한은 권한 세트로만 부여.
