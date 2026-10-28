# CLAUDE.md — DreamHouse Lite (Next Generation DevOps Center 1인 실습)

Salesforce DX 프로젝트. 부동산 매물 관리 LWC 앱 "DreamHouse Lite" 를 차세대 DevOps Center 파이프라인(DEV → SIT → UAT → PROD)으로 개발한다.
진행 계획: [docs/EXECUTION-PLAN.md](docs/EXECUTION-PLAN.md) · 원본 가이드: [docs/references/](docs/references/)

## 환경

| 별칭 | 용도 | 비고 |
|---|---|---|
| DH-HUB (= core) | Developer Edition Hub · Dev Hub · DevOps Center · **PROD** | 기본 Dev Hub |
| DH-DEV | Scratch Org — 개발 + 목업 겸용 | 기본 target-org |
| DH-SIT | Scratch Org — 통합 테스트 | |
| DH-UAT | Scratch Org — 수용 테스트 | |

- 셸: Windows PowerShell 7. 작업 시작 전 항상 `git checkout main ; git pull` (Feature Branch 작업은 DevOps Center 가 만든 브랜치를 fetch/checkout).
- `sf project deploy start` = 로컬 → 오그, `sf project retrieve start` = 오그 → 로컬 (오그에서 직접 바꾼 경우에만).

## ⚠ 에이전트 사용 규칙 (최우선·필수)

- **모든 작업은 `.claude/agents/` 에 정의된 전문 분야별 서브에이전트를 사용해서 진행한다.** (예외 없음)
- 작업 성격에 맞는 **전문 에이전트에게 위임**한다. 적합한 에이전트가 없으면 **임의로 직접 처리하지 말고** 먼저 알리고 에이전트 추가/선정을 요청한다.
- 단계 → 에이전트 매핑 (9종):
  - REQUIREMENT·인수기준(AC) → **requirements_analyst**
  - FIT/GAP/NUD·아키텍처·데이터 모델 → **solution_architect**
  - PROJECT-PLAN·PHASE-PLAN·WorkItem 일괄 등록 → **project_manager**
  - WORKITEM(Task 분해) → **work_item_manager**
  - LWC/UI·목업 → **frontend_developer** · Apex/서버·오브젝트 → **backend_developer**
  - 인수기준→테스트·Playwright·Apex/Jest 테스트 → **test_engineer**
  - 코드 리뷰(품질·보안·성능) → **code_reviewer**
  - 산출물/문서 정리·Release Notes → **documentation_writer**
- 여러 전문 영역에 걸친 작업은 **각 영역을 해당 에이전트로 분담**하고, 결과를 PM 이 취합한다.

## 진행 규칙 (Work Item 완료 기준)

각 Work Item 을 "완료"로 표시하기 전에 반드시:

0. **해당 작업에 맞는 `.claude/agents/` 전문 에이전트를 사용**했는지 확인 (미사용 시 진행 금지).
1. **선행(Depends-on) Work Item 이 모두 완료**되었는지 확인 — 미완이면 시작 금지.
2. 코드 테스트 수행 — 단위 테스트 + **Playwright UI 테스트(대응 AC-nnn)** 통과, 실패/문제 해결 전에는 **완료 불가**.
3. PROJECT-PLAN.md · PHASE-PLAN-nn.md · 해당 work-item 문서의 **체크리스트와 Status 를 `[X]` 로** 갱신.
4. (Salesforce) `sf project deploy start --dry-run` → 성공 시 `sf project deploy start`.
5. (CI 활성 시) GitHub Actions(ci.yml) 통과 확인. — 현재 CI 미도입(선택·안정화 후).
6. (Git 활성) **Work Item 이름(WI-p.nnn-description)으로 커밋**.

## 문서 규칙

- 코드네임/ID(REQ-nnn, AC-nnn, WI-p.nnn, MWI-p.nnn)는 **절대 변경하지 않는다**.
- 문서 갱신은 **재작성이 아니라 DROP / ENHANCE / ADD** 로 한다.
  - DROP: `~~항목~~ (DROPPED YYYY-MM-DD: 사유)` · ENHANCE: ID 유지 + `(ENHANCED YYYY-MM-DD: …)` 이력 1줄 · ADD: 다음 일련번호 + `(ADDED)`
- **선후관계(Depends-on)** 는 REQUIREMENT → PROJECT-PLAN → PHASE-PLAN → WORKITEM 에서 일관되게 유지(순환 금지, 위상정렬).
- **추적성**: REQ → AC → WI → spec 연결을 유지하고, 한쪽이 바뀌면 연결된 문서/테스트를 함께 갱신.
- 큰 변경은 **계획(plan)을 먼저 제시**하고 승인 후 실행한다.
- 단계별 프롬프트 원문: [docs/references/Cheatsheet_for_ProjectManager.md](docs/references/Cheatsheet_for_ProjectManager.md) (STEP 1~13)

## 코드 규칙

- Apex: `with sharing`, CRUD/FLS(`WITH USER_MODE`), 루프 내 SOQL/DML 금지, 테스트 커버리지 75%↑.
- LWC: SLDS, 반응형, Playwright 용 `data-testid` 와 접근성 라벨.
- 품질 게이트: `sf apex run test -l RunLocalTests -c -r human`, `sf code-analyzer run --workspace . --view table` (High 이상 0건).
- 비밀정보(accessToken, sfdx-url, tests/e2e/.auth/)는 커밋 금지.
