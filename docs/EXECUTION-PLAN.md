# 진행 계획 — DreamHouse Lite × Next Generation DevOps Center (1인 실습)

| 항목 | 내용 |
|---|---|
| 작성일 | 2026-10-28 |
| 작성 | 최정혁 (PM) + Claude Code |
| 기준 문서 | [Training_Lab_DevOps_Center.md](references/Training_Lab_DevOps_Center.md) · [Cheatsheet_for_ProjectManager.md](references/Cheatsheet_for_ProjectManager.md) · [Setup_Developer_Environment.md](references/Setup_Developer_Environment.md) |
| 프로젝트 폴더 | `C:\homework` (Salesforce DX 프로젝트 루트 = 저장소 루트) |
| 저장소 | https://github.com/1ll1ll1ll1li1i1l/homework (`main`) |

## 1. 세 문서의 관계

```text
Setup_Developer_Environment  ──▶  도구 설치 (Lab 0 전제)
Training_Lab_DevOps_Center   ──▶  "무엇을 어떤 순서로" — Lab 1~13 진행 순서의 기준
Cheatsheet_for_ProjectManager ──▶ "어떻게" — Lab 5~13 에서 Claude 에 넣는 STEP 1~13 프롬프트 + CLAUDE.md 규칙
```

| Cheatsheet STEP | 산출물 | 에이전트 | Lab |
|---|---|---|---|
| 1 | docs/REQUIREMENT.md | requirements_analyst | 5.3 |
| 2 | docs/phase-0/FIT-GAP-NUD.md | solution_architect | 5.4 |
| 3 | docs/phase-0/ACCEPTANCE-CRITERIA.md | requirements_analyst | 5.5 |
| 4 | docs/PROJECT-PLAN.md | project_manager | 6.1 |
| 5 | docs/phases/PHASE-PLAN-01.md | project_manager | 6.2 |
| 6 | docs/work-items/WI-1.nnn-*.md | work_item_manager | 6.3 |
| 7 | docs/mockup/* + 목업 LWC | frontend_developer / requirements_analyst | 7 |
| 8 | DevOps Center WorkItem 레코드 | project_manager | 8 |
| 9 | force-app/* + Apex 테스트 | backend_developer / frontend_developer | 9 |
| 10 | tests/e2e/*.spec.ts | test_engineer | 10 |
| 11 | 셀프 PR 리뷰 | code_reviewer | 11 |
| 12 | docs/DELIVERABLES.md | documentation_writer | 13 |
| 13 | DROP/ENHANCE/ADD 반영 | requirements_analyst | 13.4 |

## 2. 현재 상태 점검 (2026-10-28)

| 항목 | 상태 | 비고 |
|---|---|---|
| Salesforce CLI | ✅ 2.155.8 (npm) | |
| code-analyzer 플러그인 | ✅ 5.16.0 | PMD 엔진은 JDK 필요 |
| Node.js | ✅ v24.16.0 | 가이드는 22 LTS — 20 이상이면 CLI 동작, 그대로 진행 |
| Git | ✅ | |
| **JDK 21** | ❌ 미설치 | Code Analyzer PMD·VS Code Apex 언어서버에 필요 → **사용자 설치** (Setup 2장, `C:\Utils\Zulu21`) |
| GitHub CLI (`gh`) | ❌ 없음 | 저장소 생성은 웹에서 수동 |
| Hub 조직 (Developer Edition) | ✅ 연결됨 | 별칭 `DH-HUB` (= `core`), orgfarm-2f47fca2c2-dev-ed |
| Dev Hub | ✅ 활성 | ScratchOrgInfo 조회 성공. 기본 Dev Hub = DH-HUB |
| DevOps Center 활성화 | ⏳ 미확인 | Setup 에서 수동 (Lab 2) |
| DX 프로젝트 | ✅ 저장소 루트에 생성 | config/ 를 실습용으로 수정 |
| `.claude/agents/` 9종 + CLAUDE.md | ✅ 작성 | 교재의 `claude_salesforce.zip` 이 없어 문서 기준으로 직접 작성 |

## 3. 실습 교재 대비 조정 사항

| 교재 | 이 프로젝트 | 이유 |
|---|---|---|
| GitHub 에 `dreamhouse-lite` 생성 → clone → 그 안에서 DX 초기화 | 기존 `homework` 저장소 루트에 DX 프로젝트를 두고 push (교재의 dreamhouse-lite 자리에 homework 사용) | 사용자 결정(2026-10-28). "저장소가 기준" 원칙은 push 이후부터 동일하게 적용 |
| 원본 docx 는 저장소 밖 | `docs/references/original/` 에 보관 (기존 README 는 homework-README.md) | 원본 추적 |
| `claude_salesforce.zip` 압축 해제 | `.claude/agents/` 9종 + CLAUDE.md 를 Cheatsheet 3장 기준으로 작성 | zip 미제공 |
| 원본 문서 *.md | docx → `docs/references/*.md` 변환 | 교재가 md 파일명으로 서로 참조 |
| Hub 별칭 `DH-HUB` | `DH-HUB` 와 `core` 둘 다 같은 org | 앞서 `core` 로 로그인 |

> ✅ **저장소 구조 (결정 2026-10-28)** — DevOps Center 파이프라인은 "DX 프로젝트 구조 + 저장소 1개당 파이프라인 1개" 를 요구하므로 `sfdx-project.json` 을 **저장소 루트**에 둔다. 처음 만든 `salesforce-core/` 하위 폴더를 `C:\homework` 루트로 올렸고, Lab 4 파이프라인에는 `https://github.com/1ll1ll1ll1li1i1l/homework` 를 연결한다.

## 4. 진행 단계

담당: 🤖 = Claude Code 가 수행 · 👤 = 사용자가 브라우저/Setup 에서 수행 (UI 전용 기능)

### Phase A — 준비 (Lab 0~1)

- [X] 🤖 문서 3종 → `docs/references/*.md` 변환
- [X] 🤖 DX 프로젝트 생성, Hub 로그인, 별칭 `DH-HUB`, 기본 Dev Hub 지정
- [X] 🤖 `config/project-scratch-def.json` 실습용 수정, `.gitignore` 에 Playwright 인증 파일 추가
- [X] 🤖 `.claude/agents/` 9종, `CLAUDE.md`, `docs/` 폴더 구조, `docs/inputs/RFP.md`
- [X] 👤 JDK 21 설치 + `JAVA_HOME` (Setup 2장) — `C:\Utils\Zulu21`, OpenJDK 21.0.13 확인
- [X] 👤 저장소 결정 — 기존 `homework` 저장소 사용, DX 프로젝트를 루트로 이동
- [X] 🤖 첫 커밋 `chore: init Salesforce DX project + claude 설정` → `main` push

### Phase B — DevOps Center 설정 (Lab 2) 👤 UI 전용

- [X] Setup → DevOps Center 토글 On + DX Tools 약관 Accept
- [X] 권한 세트 4종 할당 — ⚠ 이 org 에서는 라벨이 **"Lifecycle Center …"** 로 표시됨 (API: DevOpsCenter / DevOpsCenterManager / DevOpsCenterReleaseManager / DevopsTestingManager). CLI `sf org assign permset` 로 할당
- [ ] DevOps Center 앱 → Connect to Version Control → GitHub 인가
- [ ] 권한 세트 Access DevOps Center Named Credentials 할당 (연결 후 표시됨)

### Phase C — Scratch Org (Lab 3) 🤖

- [X] DH-DEV(기본) / DH-SIT / DH-UAT 생성 (`-y 30`, DE 한도 = 활성 3개) — 2026-10-28 생성, **만료 2026-11-27**
- [X] 각 org 비밀번호 생성 — 문서에 기록하지 않음. 필요 시 `sf org display -o DH-DEV --verbose` 로 Username/Password/Instance URL 확인

### Phase D — 파이프라인 & 프로젝트 (Lab 4) 👤 UI 전용

- [ ] Pipeline `DreamHouse Pipeline` — GitHub · **Connect to a repository** · dreamhouse-lite URL
- [ ] Staging 단계 삭제 → DEV(DH-DEV) / Integration(DH-SIT, `sit`) / UAT(DH-UAT, `uat`) / Production(DH-HUB, `main`)
- [ ] Activate Pipeline → Project `DreamHouse Lite` 생성·연결
- [ ] (선택) Tests 탭 Provider 3종 구성 — Suite 배정은 Lab 9.6 에서

> 🤖 Phase B~D 와 **병행**해서 Phase E~F(문서 작업)를 진행할 수 있습니다. 문서는 org/저장소 없이도 작성 가능.

### Phase E — 산출물 ① REQUIREMENT + Phase 0 (Lab 5) 🤖

- [X] STEP 1 `docs/REQUIREMENT.md` — requirements_analyst (REQ-001~018, OQ-01~14)
  - 입력값: RFP=`docs/inputs/RFP.md` · 팀=1인(PM·BA·Dev·QA·RM 겸임) · 기간=2일(1 스프린트, Phase 1) · 조직=DE Hub + Scratch(DEV/SIT/UAT), PROD=Hub · AI 코딩 적극 도입
- [X] STEP 2 `docs/phase-0/FIT-GAP-NUD.md` — solution_architect (FIT 8 / GAP 8 / NUD 2, Decision Log D-01~15)
- [X] STEP 3 `docs/phase-0/ACCEPTANCE-CRITERIA.md` — requirements_analyst (AC-001~070, 샘플 데이터 SD-01~10, 확인 필요 CK-01~15)
- [X] 고객 결정 반영 (2026-10-28): OQ-02 KRW · OQ-04 판매완료 기본 노출+회색 배지 · OQ-07 관리자만 삭제 · OQ-10 탐색 화면 내 상세 패널
- [ ] 👤 **PM 검토 게이트** — REQ/선후관계/분류/AC 확인 후 Phase F 진행

### Phase F — 산출물 ② 계획 (Lab 6) 🤖

- [ ] STEP 4 `docs/PROJECT-PLAN.md` — project_manager (CLAUDE.md 진행 규칙 보강 포함)
- [ ] STEP 5 `docs/phases/PHASE-PLAN-01.md` — project_manager
- [ ] STEP 6 `docs/work-items/WI-1.nnn-*.md` (교재 예상 5건) — work_item_manager
- [ ] 커밋 `docs: REQUIREMENT/Phase0/PROJECT-PLAN/PHASE-PLAN/WORKITEMS 초안` → push

### Phase G — 목업 프로토타이핑 (Lab 7)

- [ ] 🤖 `mockup` 브랜치 · MOCKUP-PROJECT-PLAN + MWI 문서 — frontend_developer
- [ ] 🤖 전체 MWI 정적 LWC 구현 → DH-DEV 배포
- [ ] 👤 부록 D 체크리스트로 리뷰 → `docs/mockup/reviews/REVIEW-01.md` (고객 역할)
- [ ] 🤖 리뷰 반영(DROP/ENHANCE/ADD) → 재배포 → 반복
- [ ] 🤖 최종 결정 본 산출물 반영 — requirements_analyst → `main` 병합

### Phase H — Work Item 등록 (Lab 8)

- [ ] 🤖 방법 B: `WorkItem` describe → CSV(Description=WI 문서 HTML) → `sf data import bulk -o DH-HUB`
- [ ] 🤖 문서 WI-1.nnn ↔ DevOps Center 번호 매핑 → PROJECT-PLAN 비고

### Phase I — 개발 (Lab 9) — WI 마다 반복, 선행 순서 준수

- [ ] 👤 Work Item 열기 → 개발 환경 DH-DEV 지정 → **Mark as In Progress** (Feature Branch 생성)
- [ ] 🤖 `git fetch` → feature branch checkout → 개발(backend/frontend_developer) → `deploy --dry-run` → `deploy -o DH-DEV`
- [ ] 🤖 `sf apex run test` · `sf code-analyzer run` 통과
- [ ] 👤 DX Inspector 로 Commit (또는 🤖 feature branch 에 git commit/push)
- [ ] 👤 (최초 1회) Tests 탭 Sync → DEV=Review, SIT·UAT=Pre-Promotion 배정
- [ ] 🤖 문서 Status `[X]`

### Phase J — Playwright E2E (Lab 10) 🤖 + 👤

- [ ] 🤖 Playwright 설치·`playwright.config.ts`·`global-setup.mjs` — test_engineer
- [ ] 🤖 AC-nnn → `tests/e2e/WI-1.nnn-*.spec.ts`
- [ ] 👤🤖 DEV 에서 실행·결과 표 기록

### Phase K — 리뷰·프로모트 (Lab 11~12)

- [ ] 👤 Mark as In Review (PR 자동 생성) → 🤖 code_reviewer 셀프 리뷰 → 👤 Merge → Ready to Promote
- [ ] 👤 Promote → SIT (🤖 E2E 재실행) → UAT (부록 D + E2E) → Production(DH-HUB, Run all tests) → 스모크

### Phase L — 마무리 (Lab 13)

- [ ] 🤖 `docs/DELIVERABLES.md` + 추적성 매트릭스 — documentation_writer
- [ ] 🤖 태그 `v1.0-sprint1` · 회고 · (학습 종료 시) Scratch Org 삭제

## 5. 리스크 / 유의사항

| 리스크 | 대응 |
|---|---|
| `.claude/agents/` 는 Claude 세션 시작 시 로드됨 | 루트로 옮겼으므로 다음 세션부터 자동 로드. 현재 세션에서는 에이전트 정의를 프롬프트로 전달해 동일 역할로 위임 |
| Scratch Org 30일 만료 · 활성 3개 한도 · 일일 생성 6개 | 만료 전 실습 완료. 재생성 시 파이프라인 환경 재연결 |
| DevOps Center UI 는 릴리스마다 바뀔 수 있음 | 교재와 화면이 다르면 그 시점의 화면 기준으로 진행하고 차이를 이 문서에 기록 |
| JDK 미설치 시 Code Analyzer PMD 규칙 미동작 | Phase I 전에 설치 |
| accessToken·비밀번호 노출 | `.gitignore`(`.sf/`, `tests/e2e/.auth/`) 유지, 비밀번호는 문서에 기록하지 않음 |

## 6. 변경 이력

| 일자 | 변경 |
|---|---|
| 2026-10-28 | 최초 작성 |
