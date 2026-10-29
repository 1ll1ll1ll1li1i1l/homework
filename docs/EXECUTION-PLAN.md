# 진행 계획 — DreamHouse Lite × Next Generation DevOps Center (1인 실습)

| 항목          | 내용                                                                                                                                                                                                                                      |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 작성일        | 2026-10-28                                                                                                                                                                                                                                |
| 작성          | 최정혁 (PM) + Claude Code                                                                                                                                                                                                                 |
| 기준 문서     | [Training_Lab_DevOps_Center.md](references/Training_Lab_DevOps_Center.md) · [Cheatsheet_for_ProjectManager.md](references/Cheatsheet_for_ProjectManager.md) · [Setup_Developer_Environment.md](references/Setup_Developer_Environment.md) |
| 프로젝트 폴더 | `C:\homework` (Salesforce DX 프로젝트 루트 = 저장소 루트)                                                                                                                                                                                 |
| 저장소        | https://github.com/1ll1ll1ll1li1i1l/homework (`main`)                                                                                                                                                                                     |

## 1. 세 문서의 관계

```text
Setup_Developer_Environment  ──▶  도구 설치 (Lab 0 전제)
Training_Lab_DevOps_Center   ──▶  "무엇을 어떤 순서로" — Lab 1~13 진행 순서의 기준
Cheatsheet_for_ProjectManager ──▶ "어떻게" — Lab 5~13 에서 Claude 에 넣는 STEP 1~13 프롬프트 + CLAUDE.md 규칙
```

| Cheatsheet STEP | 산출물                              | 에이전트                                  | Lab  |
| --------------- | ----------------------------------- | ----------------------------------------- | ---- |
| 1               | docs/REQUIREMENT.md                 | requirements_analyst                      | 5.3  |
| 2               | docs/phase-0/FIT-GAP-NUD.md         | solution_architect                        | 5.4  |
| 3               | docs/phase-0/ACCEPTANCE-CRITERIA.md | requirements_analyst                      | 5.5  |
| 4               | docs/PROJECT-PLAN.md                | project_manager                           | 6.1  |
| 5               | docs/phases/PHASE-PLAN-01.md        | project_manager                           | 6.2  |
| 6               | docs/work-items/WI-1.nnn-*.md       | work_item_manager                         | 6.3  |
| 7               | docs/mockup/* + 목업 LWC            | frontend_developer / requirements_analyst | 7    |
| 8               | DevOps Center WorkItem 레코드       | project_manager                           | 8    |
| 9               | force-app/* + Apex 테스트           | backend_developer / frontend_developer    | 9    |
| 10              | tests/e2e/*.spec.ts                 | test_engineer                             | 10   |
| 11              | 셀프 PR 리뷰                        | code_reviewer                             | 11   |
| 12              | docs/DELIVERABLES.md                | documentation_writer                      | 13   |
| 13              | DROP/ENHANCE/ADD 반영               | requirements_analyst                      | 13.4 |

## 2. 현재 상태 점검 (2026-10-28)

| 항목                              | 상태                  | 비고                                                                                            |
| --------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------- |
| Salesforce CLI                    | ✅ 2.155.8 (npm)      |                                                                                                 |
| code-analyzer 플러그인            | ✅ 5.16.0             | PMD 엔진은 JDK 필요                                                                             |
| Node.js                           | ✅ v24.16.0           | 가이드는 22 LTS — 20 이상이면 CLI 동작, 그대로 진행                                             |
| Git                               | ✅                    |                                                                                                 |
| **JDK 21**                        | ❌ 미설치             | Code Analyzer PMD·VS Code Apex 언어서버에 필요 → **사용자 설치** (Setup 2장, `C:\Utils\Zulu21`) |
| GitHub CLI (`gh`)                 | ❌ 없음               | 저장소 생성은 웹에서 수동                                                                       |
| Hub 조직 (Developer Edition)      | ✅ 연결됨             | 별칭 `DH-HUB` (= `core`), orgfarm-2f47fca2c2-dev-ed                                             |
| Dev Hub                           | ✅ 활성               | ScratchOrgInfo 조회 성공. 기본 Dev Hub = DH-HUB                                                 |
| DevOps Center 활성화              | ⏳ 미확인             | Setup 에서 수동 (Lab 2)                                                                         |
| DX 프로젝트                       | ✅ 저장소 루트에 생성 | config/ 를 실습용으로 수정                                                                      |
| `.claude/agents/` 9종 + CLAUDE.md | ✅ 작성               | 교재의 `claude_salesforce.zip` 이 없어 문서 기준으로 직접 작성                                  |

## 3. 실습 교재 대비 조정 사항

| 교재                                                           | 이 프로젝트                                                                                         | 이유                                                                        |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| GitHub 에 `dreamhouse-lite` 생성 → clone → 그 안에서 DX 초기화 | 기존 `homework` 저장소 루트에 DX 프로젝트를 두고 push (교재의 dreamhouse-lite 자리에 homework 사용) | 사용자 결정(2026-10-28). "저장소가 기준" 원칙은 push 이후부터 동일하게 적용 |
| 원본 docx 는 저장소 밖                                         | `docs/references/original/` 에 보관 (기존 README 는 homework-README.md)                             | 원본 추적                                                                   |
| `claude_salesforce.zip` 압축 해제                              | `.claude/agents/` 9종 + CLAUDE.md 를 Cheatsheet 3장 기준으로 작성                                   | zip 미제공                                                                  |
| 원본 문서 *.md                                                 | docx → `docs/references/*.md` 변환                                                                  | 교재가 md 파일명으로 서로 참조                                              |
| Hub 별칭 `DH-HUB`                                              | `DH-HUB` 와 `core` 둘 다 같은 org                                                                   | 앞서 `core` 로 로그인                                                       |

> ✅ **저장소 구조 (결정 2026-10-28)** — DevOps Center 파이프라인은 "DX 프로젝트 구조 + 저장소 1개당 파이프라인 1개" 를 요구하므로 `sfdx-project.json` 을 **저장소 루트**에 둔다. 처음 만든 `salesforce-core/` 하위 폴더를 `C:\homework` 루트로 올렸고, Lab 4 파이프라인에는 `https://github.com/1ll1ll1ll1li1i1l/homework` 를 연결한다.

## 4. 진행 단계

담당: 🤖 = Claude Code 가 수행 · 👤 = 사용자가 브라우저/Setup 에서 수행 (UI 전용 기능)

### Phase A — 준비 (Lab 0~1)

- [x] 🤖 문서 3종 → `docs/references/*.md` 변환
- [x] 🤖 DX 프로젝트 생성, Hub 로그인, 별칭 `DH-HUB`, 기본 Dev Hub 지정
- [x] 🤖 `config/project-scratch-def.json` 실습용 수정, `.gitignore` 에 Playwright 인증 파일 추가
- [x] 🤖 `.claude/agents/` 9종, `CLAUDE.md`, `docs/` 폴더 구조, `docs/inputs/RFP.md`
- [x] 👤 JDK 21 설치 + `JAVA_HOME` (Setup 2장) — `C:\Utils\Zulu21`, OpenJDK 21.0.13 확인
- [x] 👤 저장소 결정 — 기존 `homework` 저장소 사용, DX 프로젝트를 루트로 이동
- [x] 🤖 첫 커밋 `chore: init Salesforce DX project + claude 설정` → `main` push

### Phase B — DevOps Center 설정 (Lab 2) 👤 UI 전용

- [x] Setup → DevOps Center 토글 On + DX Tools 약관 Accept
- [x] 권한 세트 4종 할당 — ⚠ 이 org 에서는 라벨이 **"Lifecycle Center …"** 로 표시됨 (API: DevOpsCenter / DevOpsCenterManager / DevOpsCenterReleaseManager / DevopsTestingManager). CLI `sf org assign permset` 로 할당
- [x] DevOps Center 앱 → Connect to Version Control → GitHub 인가 (Named Credential `ALMDevOpsGitHub` 생성 확인)
- [x] 권한 세트 Access Lifecycle Center Named Credentials (`AccessDevOpsCenterNamedCredentials`) — 연결 시 자동 할당 확인

### Phase C — Scratch Org (Lab 3) 🤖

- [x] DH-DEV(기본) / DH-SIT / DH-UAT 생성 (`-y 30`, DE 한도 = 활성 3개) — 2026-10-28 생성, **만료 2026-11-27**
- [x] 각 org 비밀번호 생성 — 문서에 기록하지 않음. 필요 시 `sf org display -o DH-DEV --verbose` 로 Username/Password/Instance URL 확인

### Phase D — 파이프라인 & 프로젝트 (Lab 4) 👤 UI 전용

- [x] Pipeline `DreamHouse Pipeline` — GitHub · **Connect to a repository** · https://github.com/1ll1ll1ll1li1i1l/homework
- [x] 단계 DEV(DH-DEV) / SIT(DH-SIT, `sit`) / UAT(DH-UAT, `uat`) / PROD(DH-HUB, `main`) — 처음에 Integration 이 삭제되고 Staging 이 남아 단계 이름을 변경해 맞춤 (2026-10-28)
- [x] 환경 4종 연결 확인 (2026-10-28, `DevopsEnvironment` 조회): DH-DEV/SIT/UAT = SANDBOX, **DH-HUB = PRODUCTION**
  - ⚠ 교훈: Hub(DE) 를 Production 단계에 연결할 때 유형을 **Production** 으로 골라야 함. Sandbox 로 고르면 OrgIdentifier 가 비고 "Error with org authentication" 발생
  - 실패 시도로 남은 빈 환경 레코드 3건(DH-DEV ×2, DH-HUB SANDBOX ×1)은 사용하지 않음
- [x] 브랜치 `sit`, `uat` 를 GitHub 에 생성(main 기준) 후 단계에 지정
- [x] Activate Pipeline
- [x] Project `DreamHouse Lite` 생성·파이프라인 연결 (DevopsProject `1Qgbm000000KqthCAC`)
- [ ] (선택) Tests 탭 Provider 3종 구성 — Suite 배정은 Lab 9.6 에서

> 🤖 Phase B~D 와 **병행**해서 Phase E~F(문서 작업)를 진행할 수 있습니다. 문서는 org/저장소 없이도 작성 가능.

### Phase E — 산출물 ① REQUIREMENT + Phase 0 (Lab 5) 🤖

- [x] STEP 1 `docs/REQUIREMENT.md` — requirements_analyst (REQ-001~018, OQ-01~14)
  - 입력값: RFP=`docs/inputs/RFP.md` · 팀=1인(PM·BA·Dev·QA·RM 겸임) · 기간=2일(1 스프린트, Phase 1) · 조직=DE Hub + Scratch(DEV/SIT/UAT), PROD=Hub · AI 코딩 적극 도입
- [x] STEP 2 `docs/phase-0/FIT-GAP-NUD.md` — solution_architect (FIT 8 / GAP 8 / NUD 2, Decision Log D-01~15)
- [x] STEP 3 `docs/phase-0/ACCEPTANCE-CRITERIA.md` — requirements_analyst (AC-001~070, 샘플 데이터 SD-01~10, 확인 필요 CK-01~15)
- [x] 고객 결정 반영 (2026-10-28): OQ-02 KRW · OQ-04 판매완료 기본 노출+회색 배지 · OQ-07 관리자만 삭제 · OQ-10 탐색 화면 내 상세 패널
- [ ] 👤 **PM 검토 게이트** — REQ/선후관계/분류/AC 확인 후 Phase F 진행

### Phase F — 산출물 ② 계획 (Lab 6) 🤖

- [x] STEP 4 `docs/PROJECT-PLAN.md` — project_manager (WI-1.001~1.005 Must + 1.006/1.007 Could, CLAUDE.md 규칙은 기존으로 충족)
- [ ] STEP 5 `docs/phases/PHASE-PLAN-01.md` — project_manager
- [ ] STEP 6 `docs/work-items/WI-1.nnn-*.md` (교재 예상 5건) — work_item_manager
- [ ] 커밋 `docs: REQUIREMENT/Phase0/PROJECT-PLAN/PHASE-PLAN/WORKITEMS 초안` → push

### Phase G — 목업 프로토타이핑 (Lab 7)

- [x] 🤖 `mockup` 브랜치 · MOCKUP-PROJECT-PLAN + MWI-1.002~1.005 문서 — frontend_developer (WI-1.001 은 N/A)
- [x] 🤖 전체 MWI 정적 LWC 구현 → DH-DEV 배포 (앱 DreamHouse Lite · 탭 매물 탐색)
- [x] 👤 리뷰 → [REVIEW-01.md](mockup/reviews/REVIEW-01.md) — **목업 승인** (역할 토글 UI 결함 1건 수정)
- [x] 🤖 리뷰 반영 — DROP/ENHANCE/ADD 대상 없음, 미결 CP 는 현 가정 유지
- [x] 🤖 본 산출물 반영(변경 없음) → `mockup` 을 `main` 에 병합 (2026-10-28)

### Phase H — Work Item 등록 (Lab 8)

- [x] 🤖 방법 B: `WorkItem` describe → CSV(Description=WI 문서 HTML) → `sf data import bulk -o DH-HUB` — 5건 등록 (2026-10-28)
  - ⚠ 교훈: Description(리치텍스트 32,768자)은 저장 시 `<td>` 마다 colspan/rowspan 이 붙어 길어짐 → 표 많은 문서 3건이 1차 STRING_TOO_LONG, 코드 예시 일부 생략 후 재등록
- [x] 🤖 문서 WI-1.nnn ↔ DevOps Center 번호 매핑 → PROJECT-PLAN §6 (WI-1.001=WI-000003, 1.002=000001, 1.003=000002, 1.004=000004, 1.005=000005)

### Phase I — 개발 (Lab 9) — WI 마다 반복, 선행 순서 준수

> ✅ **실제로 동작한 WI 1건 흐름 (WI-1.001 = WI-000003, 2026-10-28 검증)**
>
> 1. 👤 Hub → Lifecycle Center → Work Item 열기 → 개발 환경 DH-DEV → In Progress (브랜치 `WI-0000nn` 생성, 기준 = `sit`)
> 2. 🤖 브랜치 checkout → 개발 → DH-DEV 배포 → Apex 테스트 → git 커밋·push
> 3. 👤 **DH-DEV** 화면 → **DX Inspector → Change Management** → 해당 WI 컴포넌트만 체크 → **Commit Options** → WI 선택 → Commit → "Review for WI-… was created" (= GitHub PR 생성, 상태 IN_REVIEW)
>    - ⚠ Hub 의 Work Item 화면에는 "Mark as In Review" 버튼이 없음. git 커밋만으로는 리뷰 생성 불가 — DX Inspector 커밋이 필요
> 4. 🤖 code_reviewer 리뷰 → 수정 커밋 push (PR 자동 갱신) → `sit` 로 머지 → 👤 Hub 새로고침 시 **Ready to Promote**
>
> - ⚠ WI-000003 은 `sit` 이 오래된 상태에서 생성돼 main 최신으로 fast-forward 함 → 목업·문서 커밋도 이 WI 의 Change List 에 포함됨 (이후 WI 는 `sit` 최신 기준)
>
> | WI             | DevOps Center                  | 상태                                                                                                           |
> | -------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------- |
> | WI-1.001       | WI-000003                      | ✅ Ready to Promote (PR #1 머지, Apex 7/7) — Playwright 대기 (ENHANCED 2026-10-29: PROD 프로모션 완료, CLOSED) |
> | WI-1.002~1.005 | WI-000001/000002/000004/000005 | 대기 (ENHANCED 2026-10-29: 전부 개발·리뷰·SIT→UAT→PROD 프로모션 완료, CLOSED — WI-1.005 는 PR #5)              |

- [x] 👤 Work Item 열기 → 개발 환경 DH-DEV 지정 → **Mark as In Progress** (Feature Branch 생성) (ENHANCED 2026-10-29: WI-000001~000005 전부, 브랜치 `WI-0000nn`)
- [x] 🤖 `git fetch` → feature branch checkout → 개발(backend/frontend_developer) → `deploy --dry-run` → `deploy -o DH-DEV` (ENHANCED 2026-10-29: WI-1.001~1.005 DH-DEV 배포 완료)
- [x] 🤖 `sf apex run test` · `sf code-analyzer run` 통과 (ENHANCED 2026-10-29: Apex RunLocalTests 47/47·Org Wide 100%, Jest 76/76, Code Analyzer High·Critical 0 — Critical 1건은 flow 엔진 Python 미설치 환경 오류)
- [x] 👤 DX Inspector 로 Commit (또는 🤖 feature branch 에 git commit/push) (ENHANCED 2026-10-29: DX Inspector 커밋으로 리뷰(PR) 생성)
  - ⚠ 교훈: DX Inspector 재커밋은 소스 서식을 바꾸고 `__tests__`(Jest) 를 삭제함 → 커밋 후 diff 확인 필수. WI-1.005 에서 Jest 4종을 git 커밋으로 복구
- [ ] 👤 (최초 1회) Tests 탭 Sync → DEV=Review, SIT·UAT=Pre-Promotion 배정 (ENHANCED 2026-10-29: 저장소에 수행 기록 없음 — 확인 필요. Apex 는 Promotion 시 실행, E2E 는 test_engineer 가 단계별 수동 실행)
- [ ] 🤖 문서 Status `[X]` (ENHANCED 2026-10-29: 결과는 WI 문서 ENHANCE 로 기록됐으나 WI 헤더 상태·PROJECT-PLAN §5/§3.5·PHASE-PLAN-01 §3.4 의 `[X]` 갱신 미완 — [DELIVERABLES §2.4 B-03](DELIVERABLES.md), project_manager/work_item_manager 위임 필요)

### Phase J — Playwright E2E (Lab 10) 🤖 + 👤

- [x] 🤖 Playwright 설치·`playwright.config.ts`·`global-setup.mjs` — test_engineer (ENHANCED 2026-10-29: + `setup-users.mjs`·`config/users/*` 역할 사용자 3명, `support/org.ts` 대상 org 가드)
- [x] 🤖 AC-nnn → `tests/e2e/WI-1.nnn-*.spec.ts` (ENHANCED 2026-10-29: spec 6개·56 test, 잠정 AC-057/058/061 `test.fixme`, 성능 AC-063/064 `@perf`)
- [x] 👤🤖 DEV 에서 실행·결과 표 기록 (ENHANCED 2026-10-29: DH-DEV 최종 전체 회귀 49 passed / 2 failed(flaky AC-044·034, 단독 재실행 통과) / 5 skipped — WI-1.005 §6, [DELIVERABLES §3](DELIVERABLES.md))

### Phase K — 리뷰·프로모트 (Lab 11~12)

- [x] 👤 Mark as In Review (PR 자동 생성) → 🤖 code_reviewer 셀프 리뷰 → 👤 Merge → Ready to Promote (ENHANCED 2026-10-29: DX Inspector 커밋 → PR → code_reviewer 리뷰 → `sit` 머지. Low 잔여는 DELIVERABLES §5)
- [x] 👤 Promote → SIT (🤖 E2E 재실행) → UAT (부록 D + E2E) → Production(DH-HUB, Run all tests) → 스모크 (ENHANCED 2026-10-29: SIT 52/1/3 — AC-044 테스트 코드 timeout 수정 후 통과, 성능 AC-063 중앙값 571ms·AC-064 서버 중앙값 210ms / UAT 51/0/5 / PROD Promotion RunLocalTests 성공. WI-000001~000005 CLOSED)
  - ⚠ 교훈 (Lab 12): 로컬에서 `sit`/`uat` 를 git 으로 직접 병합하면 DevOps Center 가 **"External merge detected"**·**"Environment Out of Sync"** 를 표시 → **Complete Promotion** 으로 상태 정리. 빈 org 로는 **"All changes in stage branch"** 옵션으로 프로모션. 삭제(목업 컴포넌트) 반영은 대상 org 에 목업을 **임시 재배포**한 뒤 삭제를 프로모션
  - ⚠ 교훈: SIT/UAT 샘플 적재 전 관리자에게 `DreamHouse_Admin` 할당 필요(미할당 시 `FlsError Address__c`). Scratch Org 기본 통화 USD → Company Information 에서 KRW 로 변경
  - ⚠ 교훈: 테스트 사용자 admin·noaccess 는 라이선스 사정으로 `Standard Platform User`, agent 는 `Minimum Access - Salesforce` + 권한 세트 `LightningExperienceUser`
  - ⚠ 사용량 한도로 세션이 중간에 끊김 → 단계마다 문서 ENHANCE 로 결과를 남겨 재개 지점 유지
  - DevOps Center 지표 Change Failure Rate 66.7% — 원인 분석은 후속(DELIVERABLES §5 K-09)

### Phase L — 마무리 (Lab 13)

- [x] 🤖 `docs/DELIVERABLES.md` + 추적성 매트릭스 — documentation_writer (ENHANCED 2026-10-29: [DELIVERABLES.md](DELIVERABLES.md) — 산출물 인덱스·AC 단위 매트릭스·테스트 결과·Release Notes·알려진 이슈·회고, 끊긴 사슬 B-01~B-07 별도 표시)
- [ ] 🤖 태그 `v1.0-sprint1` · 회고 · (학습 종료 시) Scratch Org 삭제 (ENHANCED 2026-10-29: 아래 3줄로 분리)
  - [x] 태그 `v1.0-sprint1` — 생성·push 완료 (ENHANCED 2026-10-29: eaf398c)
  - [x] 회고 — DELIVERABLES §6 (잘된 점 / 막힌 점 L-01~L-10 / 개선)
  - [ ] Scratch Org 삭제 (DH-DEV/SIT/UAT) — **의도적으로 보류**: 제출·검토가 끝난 뒤 삭제 (만료 2026-11-27)
- [ ] (선택) STEP 13 피드백 사이클 — 잠정 CK-03/04/05/06, 코드 리뷰 Low 잔여, 문서 Status 갱신 (DELIVERABLES §5) (ADDED 2026-10-29)

## 5. 리스크 / 유의사항

| 리스크                                                | 대응                                                                                                          |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `.claude/agents/` 는 Claude 세션 시작 시 로드됨       | 루트로 옮겼으므로 다음 세션부터 자동 로드. 현재 세션에서는 에이전트 정의를 프롬프트로 전달해 동일 역할로 위임 |
| Scratch Org 30일 만료 · 활성 3개 한도 · 일일 생성 6개 | 만료 전 실습 완료. 재생성 시 파이프라인 환경 재연결                                                           |
| DevOps Center UI 는 릴리스마다 바뀔 수 있음           | 교재와 화면이 다르면 그 시점의 화면 기준으로 진행하고 차이를 이 문서에 기록                                   |
| JDK 미설치 시 Code Analyzer PMD 규칙 미동작           | Phase I 전에 설치                                                                                             |
| accessToken·비밀번호 노출                             | `.gitignore`(`.sf/`, `tests/e2e/.auth/`) 유지, 비밀번호는 문서에 기록하지 않음                                |

## 6. 변경 이력

| 일자       | 변경                                                                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-28 | 최초 작성                                                                                                                                                 |
| 2026-10-29 | ENHANCE — Phase I~L 진행 결과 반영(개발·E2E·리뷰·SIT→UAT→PROD 프로모션, DELIVERABLES), Lab 12 교훈 ADD, 잔여 항목(태그 미생성·Scratch Org 삭제 보류) 명시 |
