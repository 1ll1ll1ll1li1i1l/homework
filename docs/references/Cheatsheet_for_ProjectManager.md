# PM Cheatsheet — 요구사항 · 계획 문서 생성 & AI 코딩 워크플로우

> 원본: PM Cheatsheet 요구사항.docx (Markdown 변환본)

**대상**: Salesforce(또는 일반) 프로젝트의 프로젝트 매니저가 AI 코딩(Claude Code)을 적극 도입해 REQUIREMENT → PROJECT-PLAN → PHASE-PLAN-nn → WORKITEM 문서를 단계별 프롬프트로 생성·갱신하는 치트시트.

**방법론 (Assessment/Design 단계)**: 문서 취합 → 계획 → AI 프로토타이핑 → 고객 리뷰 → 문서 갱신(DROP·ENHANCE·ADD) → 반복

**관련**: PM How-To 가이드 · DX Developer Cheatsheet · 01 Overview

---

## 1. DevOps 개발환경에서 PM이 챙길 일반 사항

### 1.1 표준 문서 폴더 구조

```text
프로젝트 루트/
├─ CLAUDE.md                          # AI 진행 규칙(항상 참조됨) — /init 으로 생성
├─ .claude/
│  └─ agents/                         # 전문 분야별 서브에이전트(9종) — 모든 작업은 여기 에이전트로 진행
│                                     # requirements_analyst, solution_architect, project_manager,
│                                     # work_item_manager, frontend_developer, backend_developer,
│                                     # test_engineer, code_reviewer, documentation_writer
├─ docs/
│  ├─ inputs/                         # 입력 문서
│  │  ├─ RPF
│  │  ├─ FeatureRequest
│  │  └─ CustomerRequirement
│  ├─ phase-0/                        # ⓪ 본 개발 전 고객 협의 산출물 (Phase 0)
│  │  ├─ FIT-GAP-NUD.md               # ⓪ FIT/GAP/NUD 분석 (표준적합/개발필요/신규·고유·난이도)
│  │  └─ ACCEPTANCE-CRITERIA.md       # ⓪ 상세 인수기준(AC-nnn) — 테스트
│  ├─ phases/
│  │  ├─ PHASE-PLAN-01.md             # ② 단계별 상세 (의존 관계 = 실행 순서)
│  │  └─ PHASE-PLAN-nn.md
│  ├─ work-items/
│  │  ├─ WI-1.001-customer-object.md  # ② 워크아이템 (개발자용 단독 문서)
│  │  └─ WI-p.nnn-description.md
│  ├─ mockup/                         # UI 목업 산출물 (협의용, mockup 브랜치) — 본 docs 와 분리
│  │  ├─ MOCKUP-PROJECT-PLAN.md
│  │  └─ work-items/MWI-p.nnn-*.md
│  ├─ REQUIREMENT.md                  # ① 요구사항 통합(단일 기준) — REQ-nnn + 기능 선후관계 시나리오의 기준 문서
│  ├─ PROJECT-PLAN.md                 # ② Phase + Work Item 목록 (일정/리소스/선후관계)
│  └─ DELIVERABLES.md                 # 산출물 인덱스 + 추적성 매트릭스
├─ tests/e2e/                         # Playwright UI 기능 테스트(*.spec.ts) — AC-nnn 기반
└─ .github/workflows/                 # (선택) GitHub Actions(CI) — 안정화 후 도입
```

### 1.2 코드네임(ID) 규칙 — 절대 유지

- 요구사항: `REQ-nnn`
- 인수기준: `AC-nnn`
- 워크아이템: `WI-p.nnn` (p=Phase 번호, nnn=일련번호)

문서를 갱신할 때 기존 코드네임을 바꾸지 않습니다. (DROP/ENHANCE/ADD 시에도 ID 보존)

- DevOps Center의 Work Item(WI-xxxx)과 문서의 WI-p.nnn을 1:1 매핑해 추적성을 유지.
- 추적성 사슬: REQ-nnn → AC-nnn(인수기준) → WI-p.nnn(개발) → Playwright *.spec.ts(검증)를 ID로 연결.

#### 1.2.1 기능 선후관계(종속관계) — 모든 문서에서 일관 유지

- 모든 기능 요구사항/워크아이템에 선행(Depends-on) 관계를 명시합니다. (예: WI-1.005는 WI-1.001(객체) 완료 후 가능)
- 순환 종속 금지. 실행 순서는 종속관계를 위반하지 않는 위상정렬(topological order)로 배치합니다.
- 종속관계는 REQUIREMENT(REQ 간) → PROJECT-PLAN(WI 표의 "선행" 컬럼) → PHASE-PLAN(실행 순서) → WORKITEM(depends-on)으로 동일하게 전파합니다.

### 1.3 문서 갱신 원칙 (재작성 ✗)

| 액션 | 의미 | 표기 |
|---|---|---|
| DROP | 제거된 항목 — 삭제하지 말고 취소선 + (DROPPED) 표시 후 사유 | WI-1.003 (DROPPED: 고객 철회) |
| ENHANCE | 기존 항목 보강/수정 — ID 유지, 변경 이력 1줄 추가 | WI-1.002 (ENHANCED 2026-06-01: 필드 3개 추가) |
| ADD | 신규 항목 — 다음 일련번호로 추가 | WI-1.014 (ADDED) |

### 1.4 AI 코딩(Claude Code) 기본기

```powershell
claude                                    # 프로젝트 폴더에서 대화형 시작
/init                                     # CLAUDE.md 생성 (프로젝트 규칙 기록)
# (플랜 모드) 큰 작업 전 계획부터: 세션에서 "계획만 세워줘" → 검토 후 진행
claude -p "docs/REQUIREMENT.md 요약해줘"    # 비대화형 단발 실행
```

CLAUDE.md에 진행 규칙(아래 3장)을 적어두면 모든 작업에 자동 적용. 문서·개발·테스트는 단계별(아래 STEP 1→13)로, 큰 변경은 플랜 검토 후 실행.

> ⚠ **필수 규칙 — 전문 에이전트 사용**: 모든 단계(문서·개발·테스트·배포)는 `.claude/agents/`에 정의된 분야별 서브에이전트로 진행합니다. 아래 STEP 프롬프트도 "적합한 전문 에이전트에게 위임"을 전제로 작성되어 있습니다. (상세 3장)

### 1.5 PM 운영 체크 (요약)

- [ ] `.claude/agents/` 전문 에이전트 정의 확인 - ⚠ 모든 작업은 분야별 에이전트로 진행 (필수)
- [ ] docs/ 폴더 + CLAUDE.md 준비 (/init)
- [ ] 입력 문서(RFP/Proposal/Feature Request) 수집
- [ ] STEP1 REQUIREMENT(REQ-nnn + 선후관계)
- [ ] ⓪ Phase 0: → STEP2 FIT/GAP/NUD(고객 협의) → STEP3 Acceptance Criteria(AC-nnn)
- [ ] STEP4 PROJECT-PLAN(선행/분류 컬럼) → STEP5 PHASE-PLAN(위상정렬) → STEP6 Work Item 문서(depends-on·AC·테스트)
- [ ] STEP7 UI 목업 프로토타이핑 (생성 → 리뷰 → 반영 → 재리뷰 → 본 산출물 반영, 코드 공유)
- [ ] STEP8 Work Item 일괄 등록 (DevOps Center 레코드)
- [ ] STEP9 개발(AI 코딩) → STEP10 Playwright spec(AC-nnn 기반) — 테스터 수동 실행. CI(GitHub Actions)는 ⚠ 선택 · 안정화 후
- [ ] STEP11 코드 리뷰(셀프 PR) → STEP12 산출물 정리·추적성
- [ ] AI 프로토타이핑 → 고객 리뷰 → STEP13 문서 갱신(DROP/ENHANCE/ADD, 코드네임 유지)
- [ ] DevOps Center Work Item ↔ WI-p.nnn 매핑 확인 · 선후관계(Depends-on) 위반 없는지 확인
- [ ] 문서·테스트 변경도 Git 커밋

---

## 2. 단계별 프롬프트 (복사해서 사용)

**사용법**: claude 세션에 아래 블록을 붙여넣고, 대괄호 `[ ]` 안의 입력값을 채우세요. 누락 시 Claude가 되묻도록 했습니다.

> ⚠ 각 STEP은 반드시 해당 분야의 `.claude/agents/` 전문 에이전트로 수행하세요. 프롬프트 맨 앞에 각 STEP에 표기된 권장 에이전트로 한 줄을 붙입니다:
>
> `이 작업은 .claude/agents/ 의 requirements_analyst 에이전트로 진행해줘.` (예시)

**단계별 권장**:

| STEP | 권장 에이전트 |
|---|---|
| STEP 1 | requirements_analyst |
| STEP 2 | solution_architect |
| STEP 3 | requirements_analyst |
| STEP 4 | project_manager |
| STEP 5 | project_manager |
| STEP 6 | work_item_manager |
| STEP 7 | frontend_developer(목업) / requirements_analyst(본 반영) |
| STEP 8 | project_manager |
| STEP 9 | backend_developer / frontend_developer |
| STEP 10 | test_engineer |
| STEP 11 | code_reviewer |
| STEP 12 | documentation_writer |
| STEP 13 | requirements_analyst(+ 해당 문서 담당) |

순서는 실습 교재 [Training_Lab_DevOps_Center.md](Training_Lab_DevOps_Center.md)의 Lab 진행 순서와 동일합니다.

| STEP | Lab |
|---|---|
| STEP1~6 | Lab 5~6 |
| STEP7 | Lab 7 |
| STEP8 | Lab 8 |
| STEP9 | Lab 9 |
| STEP10 | Lab 10 |
| STEP11 | Lab 11 |
| STEP12·13 | Lab 13 |

### STEP 1 — docs/REQUIREMENT.md 생성 프롬프트 ★ (기반 문서)

권장 에이전트: **requirements_analyst** · 실습: Lab 5.3

```text
[역할] 너는 Salesforce 프로젝트의 비즈니스 분석가(BA) 겸 솔루션 아키텍트다.

[입력 자료] 아래 문서들을 취합·정리해 단일 기준 문서를 만든다.
- RFP: [경로 또는 내용 / 예: docs/inputs/RFP.md]
- Proposal: [경로 또는 내용]
- Feature Request: [경로 또는 내용]
- Customer Requirement: [경로 또는 내용]
(없는 항목은 비워두고, 부족하면 나에게 질문할 것)

[프로젝트 입력값]
- 팀 구성원: [역할 이름 스킬 가용성.
  - 예: PM 홍길동 / PL 김리드(Apex,LWC) / BA 이분석 / Senior Dev 박개발(Apex) / Junior Dev 최주니어 / QA 정테스터]
- 프로젝트 기간: [시작 YYYY-MM-DD ~ 종료 YYYY-MM-DD] (또는 총 [N]주)
- 대상 조직/에디션: [예: Salesforce EE, Sandbox 기반]
- AI 코딩 도입 방침: 적극 도입 (프로토타이핑 우선, 반복 개발)

[작업] 위 자료를 분석·취합하여 `docs/REQUIREMENT.md` 를 작성하라.
이 문서는 이후 PROJECT-PLAN / PHASE-PLAN / WORKITEM 문서를 도출하는 **단일 기준 문서**가 되어야 한다.

[REQUIREMENT.md 에 포함할 내용]
1. 문서 정보(버전, 작성일, 변경 이력 표) — 갱신은 DROP/ENHANCE/ADD 방식, ID/코드네임 유지 원칙 명시
2. 프로젝트 개요·배경·목적 (RFP/Proposal 취합)
3. 이해관계자 & 팀 구성 — 역할·이름·스킬·가용성 표 (PM/PL/BA/Senior/Junior/QA)
4. 프로젝트 기간 & 주요 마일스톤 (입력 기간 기반)
5. 범위 정의 — In-Scope / Out-of-Scope
6. 기능 요구사항 — 각 항목에 **`REQ-nnn` ID** + 우선순위(MoSCoW: Must/Should/Could/Won't) 표
7. **기능 선후관계(종속관계) 표**
   - `REQ-nnn` 간 선행/후행을 표로 정리 (컬럼: REQ-ID | 설명 | 선행(Depends-on) | 비고).
   - 순환 종속이 없도록 점검하고 실행 가능한 순서의 근거를 제시.
8. 비기능 요구사항 — 성능·보안·확장성·규정/컴플라이언스
9. 데이터 모델 개요(주요 객체/관계) & 외부 통합(API) 개요
10. 가정(Assumptions)·제약(Constraints)·리스크(초기 식별)
11. **AI 코딩 적용 전략**
   - 어떤 영역을 AI로 적극 개발/프로토타이핑할지, 사람이 검증할 품질 기준(테스트 커버리지 등)
12. **테스트 전략 개요**
   - 단위 테스트(Apex)·UI 기능 자동화(Playwright)
   - CI(GitHub Actions)
   - 품질 게이트 방향성 (상세는 Phase 0 인수기준 + STEP 10)
13. Phase 후보 & 상위 Work Item 후보(개략) — 이후 PROJECT-PLAN 도출용 힌트 (REQ→WI 매핑 초안)
   - ⓪ **Phase 0(본 개발 전 고객 협의)** 후보 명시: FIT/GAP/NUD 분석 + 상세 인수기준(Acceptance Criteria) 작성

[규칙]
- 모든 요구사항에 추적 가능한 `REQ-nnn` ID 부여 (이후 절대 변경 금지).
- **각 `REQ-nnn` 의 선행 요구사항(Depends-on)을 반드시 식별**하고 순환 종속이 없는지 검증.
- AI 코딩을 전제로 일정·범위를 가늠 (프로토타입 → 리뷰 → 보강 반복을 가정).
- 불명확/누락 정보는 추측하지 말고 **질문 목록(Open Questions)**으로 문서 말미에 정리.
```

### STEP 2 — docs/phase-0/FIT-GAP-NUD.md 생성 프롬프트 ⓪ (Phase 0 · 고객 협의 리뷰)

권장 에이전트: **solution_architect** · 실습: Lab 5.4

본격 개발 전(Phase 0)에 표준 기능 대비 요구사항을 분석해 고객과 합의하는 문서. FIT(표준으로 충족) / GAP(개발 필요) / NUD(New·Unique·Difficult = 신규·고유·고난도)로 분류.

```text
[작업] `docs/REQUIREMENT.md` 를 분석해서, 본 개발 전 고객 협의용 **FIT/GAP/NUD 분석 문서**를 `docs/phase-0/FIT-GAP-NUD.md` 로 작성하라. (Salesforce 표준 기능 대비 적합성 분석)

[분류 기준]
- FIT : 표준 기능/설정(Config)으로 충족 — 커스텀 코드 불필요
- GAP : 표준으로 불충족 → 커스터마이징/개발(Apex/LWC/Flow) 필요
- NUD : New(신규)·Unique(고유 업무)·Difficult(고난도/고위험) → 추가 분석·PoC·아키텍처 결정 필요

[문서에 포함할 내용]
1. 개요 — Phase 0의 목적(고객 협의·범위 합의), 분석 기준 설명
2. FIT/GAP/NUD 분석 표 — 모든 `REQ-nnn` 에 대해:
   | REQ-ID | 요구사항 | 분류(FIT/GAP/NUD) | 표준기능명 또는 개발사유 | 표준 대체안 | 예상 공수 | 리스크 |
3. GAP 항목 상세 — 무엇을 개발할지(객체/Apex/LWC/Flow/통합) 개략 설계
4. NUD 항목 상세 — 왜 신규/고유/고난도인지, PoC·스파이크 필요 여부, 대안·결정 사항
5. **고객 협의 결과(Decision Log)** — 항목별 합의/보류/대체/철회 + 결정일·결정자
6. 범위 영향 — FIT/GAP/NUD 결과가 In/Out-of-Scope, 일정, 우선순위에 미치는 영향 요약

[규칙]
- `REQ-nnn` 코드네임을 그대로 사용(추적성). 분류 결과는 PROJECT-PLAN의 공수·우선순위 산정 근거가 된다.
- NUD/GAP는 리스크와 대안을 명확히. 표준으로 가능한 부분(FIT)은 과도한 커스텀을 지양하도록 권고.
- 고객 협의로 결정되지 않은 항목은 **Open Questions / 협의 필요**로 분리해 표기(추측 금지).
```

### STEP 3 — docs/phase-0/ACCEPTANCE-CRITERIA.md 생성 프롬프트 ⓪ (Phase 0 · 테스트 기준)

권장 에이전트: **requirements_analyst** · 실습: Lab 5.5

테스트 시나리오의 기준이 되는 상세 인수기준 문서. 이후 단위 테스트·UI 자동화(Playwright)·QA 시나리오가 모두 이 문서에서 파생됩니다.

```text
[작업] `docs/REQUIREMENT.md` 와 `docs/phase-0/FIT-GAP-NUD.md` 를 분석해서, 검증 가능한 **상세 인수기준 문서**를 `docs/phase-0/ACCEPTANCE-CRITERIA.md` 로 작성하라.

[원칙] 각 인수기준은 **모호하지 않고 측정/검증 가능**해야 하며, 그대로 테스트 시나리오로 변환될 수 있어야 한다.

[문서에 포함할 내용]
1. 개요 — 인수기준의 목적(테스트 시나리오의 단일 기준), 작성 규칙(Given/When/Then)
2. 요구사항별 인수기준 — 각 `REQ-nnn` 에 1개 이상의 `AC-nnn` 부여, 아래 형식:
   - AC-ID: AC-001
   - 연결 REQ: REQ-003
   - 시나리오명: (예) 가격 범위로 매물 필터링
   - **Given / When / Then** (전제 / 행동 / 기대결과)
   - 검증 데이터 (예시 입력값·기대 출력값)
   - 검증 방법: 단위(Apex) | UI 자동화(Playwright) | 수동 QA
   - 우선순위: Must/Should/Could
3. 추적성 매트릭스 — `REQ-nnn ↔ AC-nnn ↔ (예정) WI-p.nnn ↔ (예정) 테스트 파일` 표
4. 경계/예외 케이스 — 빈 값, 권한 없음, 한도 초과 등 음성(negative) 시나리오 포함
5. 비기능 인수기준 — 성능(응답시간), 권한/보안, 접근성 등 측정 기준

[규칙]
- 모든 `AC-nnn` 에 ID 부여(이후 변경 금지). 각 AC는 반드시 하나 이상의 `REQ-nnn` 에 연결.
- Given/When/Then은 **구체적 데이터**로 작성(추상적 "정상 동작" 금지).
- UI 화면이 있는 AC는 **검증 방법에 Playwright(UI 자동화)**를 우선 지정 (STEP 10에서 spec으로 구현).
- 불명확한 기대결과는 추측하지 말고 **확인 필요 목록**으로 분리.
```

### STEP 4 — docs/PROJECT-PLAN.md 생성 프롬프트

권장 에이전트: **project_manager** · 실습: Lab 6.1

```text
[작업] `docs/REQUIREMENT.md` 와 `docs/phase-0/FIT-GAP-NUD.md`, `docs/phase-0/ACCEPTANCE-CRITERIA.md` 를 분석해서 여러 개의 Phase와 그에 따르는 다수의 Work Item 목록을 포함하는 `docs/PROJECT-PLAN.md` 를 작성하라.

[문서에 포함할 내용]
- 프로젝트 개요·목적 (REQUIREMENT 요약)
- 프로젝트 리소스 요약 — REQUIREMENT의 팀 구성(PM/PL/BA/Senior Dev/Junior Dev/QA) 역할·가용성
- **Phase 0(본 개발 전)**을 일정에 포함 — FIT/GAP/NUD 분석 + 인수기준 작성 + 고객 협의(프로토타이핑)
- 일정 — **AI 코딩을 적극 도입했을 때**의 Phase/Work Item 소요·예상 일정
  (프로토타이핑 우선, 반복 개발 전제. man-day는 AI 보조 + FIT/GAP/NUD 분류(NUD는 가중) 기준으로 산정)
- Phase 단위로 분류된 Work Item 목록을 아래 컬럼의 **표**로 구성:
  | Status | ID | Description | 선행(Depends-on) | 분류(FIT/GAP/NUD) | Man-day (M/D) |
  - Status: 완료 전 `[ ]`, 완료 후 `[X]`
  - ID: `WI-p.nnn` (p=Phase 번호) — 한 번 부여하면 변경 금지
  - **선행(Depends-on): 이 WI가 의존하는 선행 WI ID** (없으면 "-")
  - 분류: FIT-GAP-NUD 문서의 분류를 매핑 (공수·리스크 산정 근거)
- **Work Item 실행 순서는 선행(Depends-on)을 위반하지 않는 위상정렬**로 제시 (순환 종속 금지)
- Work Item 목록 표 다음에, **각 Work Item 별 간단한 체크리스트** 구성

[규칙]
- REQUIREMENT의 `REQ-nnn`, 인수기준 `AC-nnn`, `WI-p.nnn` 의 매핑을 표 또는 비고로 남겨 추적성 확보.
- 선행(Depends-on) 관계는 REQUIREMENT의 기능 선후관계 표와 일관되게 유지.
- 일정은 시작/종료(또는 N주) 입력 기간 안에 들어오도록 Phase를 배분 (Phase 0 포함).

[CLAUDE.md 에 기록할 진행 규칙] (없으면 추가, 있으면 보강)
- 각 Work Item을 종료한 후에는:
  1) 코드 테스트 수행, 문제 발생 시 해결 — **해결 전에는 완료로 표시 금지**
  2) PROJECT-PLAN·PHASE-PLAN 및 해당 Work Item 문서의 **체크리스트/Status를 완료(`[X]`)로 표기**
  3) (Salesforce 프로젝트) `sf project deploy start --dry-run` 후 `sf project deploy start`
  4) (Git 활성 시) **Work Item 이름(WI-p.nnn-description)으로 커밋**
```

### STEP 5 — docs/phases/PHASE-PLAN-nn.md 생성 프롬프트

권장 에이전트: **project_manager** · 실습: Lab 6.2

```text
[작업] `docs/PROJECT-PLAN.md` 를 분석해서, 더 상세한 정보를 포함하는 `PHASE-PLAN-nn.md` 문서를 `docs/phases/` 폴더에 (Phase 수만큼) 만들어라. (nn = 01, 02, … 0n)

[각 Work Item 에 포함할 상세 정보]
- 세부 작업 (sub-tasks)
- 주요 타입/API — **코드 예시 포함** (Apex/LWC/SOQL 등 해당 기술)
- 수락 기준 — **Phase 0 인수기준의 `AC-nnn` 을 인용/연결**하고, 성능 수치·테스트 통과 조건 등 검증 가능한 형태로 구체화
- **의존 관계(선후)** — 이 Work Item의 **선행(Depends-on) WI**와 후행 WI를 명시 (PROJECT-PLAN의 선행 컬럼과 일치)
- 테스트 — 단위 테스트 + **UI 자동화(Playwright) 대상 AC** 표시 (STEP 10에서 spec으로 구현)
- 체크리스트 — **체크박스(`[ ]`)**로 완료 마킹 가능하게 구성

[규칙]
- PROJECT-PLAN의 `WI-p.nnn` ID·설명과 정확히 일치 (코드네임 유지).
- **Phase 내 Work Item 실행 순서를 선행(Depends-on) 종속관계 기준의 위상정렬**로 제시 (순환 종속 금지, 병렬 가능 항목 표시).
- 수락 기준은 반드시 `AC-nnn` 으로 추적 가능하게 연결.
- AI 코딩 전제: 각 Work Item에 "AI로 먼저 프로토타입 → 사람이 수락기준(AC)으로 검증" 흐름을 반영.
```

### STEP 6 — docs/work-items/WI-p.nnn-description.md 생성 프롬프트

권장 에이전트: **work_item_manager** · 실습: Lab 6.3

````text
[작업] `docs/PROJECT-PLAN.md` 와 `docs/phases/` 폴더 문서를 분석해서, `WI-p.nnn-description.md` 형식의 파일명을 갖는 워크아이템 문서를 `docs/work-items/` 폴더에 만들어라. (예: `WI-1.001-customer-object.md`)

[원칙] 워크아이템 문서는 **개발자가 다른 문서 참조 없이 이 문서만 보고 개발할 수 있도록** 충분한 정보를 담아야 한다.

[각 워크아이템 문서의 내용]
- YAML FrontMatter
  ```yaml
  ---
  subject: 'WI-1.001 워크아이템 제목'   # Workitem의 Subject 필드와 Sync
  assignee: 'username@domain.com'      # User Id로 변환하여 Sync에 사용
  # ⬇ 도구가 자동 stamp (절대 손으로 편집)
  project_id: null                     # Project의 record id
  workitem_no: null                    # Workitem의 Name 필드값
  salesforce_id: null                  # Workitem의 record id
  status: null                         # Workitem의 Status 필드값
  synced_at: null                      # Sync 타임스탬프
  ---
  ```
- 헤더: Phase, 모듈 설명, 우선순위, 상태, **선행/후행 의존성**, 예상 소요기간
- 상세 개요 (2~3 단락)
- (UI 개발인 경우) **Wireframe Mockup** 포함 (ASCII/마크다운 목업)
- 선행 조건(체크박스) — **선행(Depends-on) WI 완료 여부 포함**
- 번호 매긴 세부 작업 (Numbered sub-tasks)
- 주요 모듈 타입/API (코드 예시)
- 자세한 수락 기준(체크박스) — **각 항목을 Phase 0의 `AC-nnn` 에 매핑**(Given/When/Then 인용)
- 테스트 요구사항
  - 단위 테스트(Apex)·커버리지 목표 (예: 75%↑)
  - **UI 기능 자동화(Playwright): 구현할 `tests/e2e/WI-p.nnn-*.spec.ts` 와 대응 `AC-nnn` 명시** (시나리오 = Given/When/Then)
- 통합 체크리스트 — 배포·**Playwright 테스트 통과**·**자동 Git commit 규칙 포함**(완료 시 WI 이름으로 커밋)
- 참고 자료

[규칙]
- 파일명·`wi-id`·설명은 PROJECT-PLAN/PHASE-PLAN과 일치 (코드네임 유지).
- **`depends-on` 은 PROJECT-PLAN의 선행 컬럼과 일치**해야 한다 (선행 미완 시 시작 불가를 선행 조건에 명시).
- 수락 기준은 `AC-nnn` 에, UI 검증은 Playwright spec 파일명에 1:1로 연결 (추적성).
- Salesforce 프로젝트면 배포 단계(`deploy --dry-run` → `deploy`)와 **CI(GitHub Actions) 통과**를 통합 체크리스트에 포함.
````

### STEP 7 — UI 목업 프로토타이핑 프롬프트 ★ (프로토타입 → 리뷰 → 반영 → 본 산출물 반영)

권장 에이전트: **frontend_developer**(목업) · **requirements_analyst**(본 반영) · 실습: Lab 7

**실행 순서**: STEP 6(WORKITEM) 직후 · 본 개발 착수 전에 수행. 워크아이템 문서로 UI 목업을 빠르게 만들어 고객과 협의하고, 확정 결정을 본 산출물에 반영한 뒤 개발에 들어갑니다.

> 💡 **코드 공유 원칙**: 목업과 본 프로젝트는 같은 Git 저장소·같은 force-app 사용 → 목업 컴포넌트가 그대로 본 개발의 출발점. 문서만 분리 (본 = docs/, 목업 = docs/mockup/). 목업은 mockup 브랜치에서 진행.

**사이클**: ①목업 문서·UI 생성 → ②리뷰(부록 체크리스트) → ③리뷰를 목업에 반영 → ④재리뷰(②~③ 반복) → ⑤본 산출물 반영 + 코드 병합.

#### 프롬프트 ① — 목업 문서·UI 생성 (목업 계획·워크아이템 + 정적 데이터 LWC)

권장 에이전트: **frontend_developer**

```text
이 작업은 .claude/agents/ 의 frontend_developer 에이전트로 진행해줘.

[작업] docs/work-items/ 와 docs/PROJECT-PLAN.md 를 분석해서 UI/화면 검증용 목업을 만들어라.
1) docs/mockup/MOCKUP-PROJECT-PLAN.md (목업 계획) — 검증할 화면 목록 + "고객 확인 포인트" + 본 WI(WI-p.nnn) ↔ 목업(MWI-p.nnn) 1:1 매핑 표
2) docs/mockup/work-items/MWI-p.nnn-*.md (목업 워크아이템) — 화면 목적·Wireframe·구현 범위·확인 포인트
3) 위 MWI에 따라 목업 LWC(force-app)를 구현 — 정적/샘플 데이터로 화면·레이아웃·흐름에 집중 (실제 Apex/DB/권한/테스트는 스텁 또는 생략)

[규칙] 코드는 본 프로젝트와 동일한 force-app 사용 (별도 코드베이스 금지). MWI/WI 코드네임 유지.

[출력] 배포 명령(예: sf project deploy start -o <목업오그>)과 확인 절차를 알려줘.
```

#### 프롬프트 ② — 리뷰를 목업에 반영 (목업 문서 + 목업 코드 동시 갱신)

권장 에이전트: **frontend_developer**

```text
이 작업은 .claude/agents/ 의 frontend_developer 에이전트로 진행해줘.

[리뷰 결정사항] ← 화면 리뷰(부록 체크리스트) 결과를 붙여넣기
- (예) 매물 카드에 상태 배지 추가 → ENHANCE MWI-1.002
- (예) 침실 필터 제외 → DROP(일부) MWI-1.004
- (예) 지도 보기 신규 → ADD MWI-1.006

[작업] 위 리뷰 결정을 목업에만 반영하라 (본 산출물은 아직 건드리지 말 것).
1) docs/mockup/MOCKUP-PROJECT-PLAN.md 와 docs/mockup/work-items/* 를 재작성하지 말고
   DROP(취소선 + 사유)/ENHANCE(ID 유지·이력 1줄)/ADD(다음 MWI 번호)로 갱신 (MWI 코드네임 유지)
2) 변경된 MWI에 맞춰 목업 LWC(force-app) 수정 — 정적/샘플 데이터 유지, 화면·흐름 중심

[출력] 변경 요약(추가/변경/취소 건수)과 재배포 명령.
```

→ 재배포 후 다시 리뷰 (②~③ 반복).

#### 프롬프트 ③ — 본 프로젝트 산출물에 반영 (리뷰 종료 후 1회 · STEP 13에서도 재사용)

권장 에이전트: **requirements_analyst**

```text
이 작업은 .claude/agents/ 의 requirements_analyst 에이전트로 진행해줘.

[입력] docs/mockup/* (리뷰로 확정된 최종본)
[반영 대상] docs/REQUIREMENT.md, docs/phase-0/*, docs/PROJECT-PLAN.md, docs/phases/*, docs/work-items/*
[매핑] 목업 MWI-p.nnn ↔ 본 WI-p.nnn (MOCKUP-PROJECT-PLAN의 대응표)

[작업] 목업 최종 결정(DROP/ENHANCE/ADD)을 본 산출물에 재작성 없이 점진 반영하라.
- DROP   : 본 항목 ~~취소선~~ + (DROPPED YYYY-MM-DD: 사유)
- ENHANCE: ID(REQ/AC/WI) 유지한 채 보강 + 변경 이력 1줄 (ENHANCED YYYY-MM-DD: …)
- ADD    : 다음 번호로 신규 항목 추가 (ADDED) — REQUIREMENT의 REQ·해당 Phase의 WI 모두
- 화면/UI 변경은 WORKITEM의 Wireframe·수락 기준에, 바뀐 인수기준은 ACCEPTANCE-CRITERIA의 AC-nnn에 반영
- 선후관계/일정/범위 변동 시 PROJECT-PLAN 표·PHASE-PLAN 체크리스트도 갱신

[규칙] 코드네임(REQ/AC/WI) 절대 변경 금지. 매핑 불명확하면 추측 말고 "확인 필요 목록"으로 질문.

[출력] 변경된 파일 목록 + 변경 요약 표.

[커밋] docs: reflect mockup decisions (DROP/ENHANCE/ADD)
```

→ 이어서 목업 코드를 본 개발 출발점으로 병합:

```powershell
git checkout main && git merge mockup && git push
```

> 💡 STEP 7은 [Training_Lab_DevOps_Center.md](Training_Lab_DevOps_Center.md) Lab 7의 프롬프트와 동일합니다. 세 번째 프롬프트(③ 본 프로젝트 산출물에 반영, DROP/ENHANCE/ADD)는 이후 반복 고객 리뷰 사이클(STEP 13)에서도 그대로 재사용합니다 (재작성 ✗ · 코드네임 유지).

### STEP 8 — DevOps Center Work Item 일괄 등록 프롬프트 (백로그 → WorkItem 레코드)

권장 에이전트: **project_manager** · 실습: Lab 8.3 (방법 B)

docs/work-items/ 의 워크아이템과 PROJECT-PLAN을 읽어 DevOps Center Work Item 레코드를 한 번에 생성합니다. (항목이 많을 때 유용 — 적은 경우는 UI에서 수동 New Work Item)

```text
이 작업은 .claude/agents/ 의 project_manager 에이전트로 진행해줘.

[목표] docs/work-items/ 의 워크아이템과 docs/PROJECT-PLAN.md 를 읽어, DevOps Center(Hub = DH-HUB)에 Work Item 레코드를 일괄 생성한다.

[절차]
1) 차세대 DevOps Center의 Work Item 객체는 **`WorkItem`** 이다. 필드 구성을 먼저 describe로 확인:
   sf sobject describe -o DH-HUB --sobject WorkItem
   Subject·Project lookup·Assignee·Development Environment 등 필드/필수값 확인
2) 'DreamHouse Lite' 프로젝트 Id 조회
   - WorkItem describe에서 확인한 **Project lookup 필드의 참조 객체**로 조회:
     (예) sf data query -o DH-HUB \
            -q "SELECT Id,Name FROM DevopsProject WHERE Name='DreamHouse Lite'"
3) 각 WI-p.nnn 문서 → `WorkItem` 레코드 필드 매핑 (정확한 API명은 1)의 describe 결과 사용):
   - Subject = 문서 제목 그대로 (예: "WI-1.001 Property__c 오브젝트·필드") ← 코드네임 유지
   - Description = ★ 해당 WI 문서(docs/work-items/WI-p.nnn-*.md)의 **markdown 전체 내용을 HTML로 변환**한 값.
     (요약 ✗ — 문서 전체를 담는다. WorkItem의 Description은 **리치텍스트(HTML)** 필드)
       · 변환 규칙: 제목 #→<h1>/<h2>…, 굵게/기울임 **→<strong>·<em>, 목록 →<ul>/<ol><li>, 링크 →<a href>, 표 →<table>, 코드블록 →<pre><code>·인라인 `→<code>, 문단 →<p>.
       · YAML FrontMatter는 본문에서 제외(또는 표로 요약), 나머지 본문 섹션은 모두 포함.
       · script 등 위험 태그·미지원 태그는 넣지 말 것.
       · 리치텍스트(Rich Text) 길이 한도(필드 maxLength — describe로 확인, 보통 최대 131,072자) 초과 시:
         핵심 섹션 우선 포함 + 말미에 "원문: docs/work-items/WI-p.nnn-*.md" 경로를 남긴다.
   - Project(lookup) = 위 프로젝트 Id, Assignee = 본인 사용자
   - Development Environment = (선택) 비워둠 → 개발 시작 시 지정
     (미리 지정하려면 DH-DEV 환경 레코드 Id)
4) 모든 Workitem을 **선행(Depends-on) 순서대로** `WorkItem` 에 생성:
   sf data create record -s WorkItem ... (소량)
   또는  CSV 생성 후  sf data import bulk -s WorkItem ... (대량)
5) 생성된 레코드 Id와 **문서 WI-p.nnn ↔ DevOps Center 번호 매핑 표**를 출력하고,
   그 표를 docs/PROJECT-PLAN.md 비고에 추가(커밋).

[주의]
- ⚠ **Feature Branch는 만들지 않는다**(여기선 레코드만 생성).
  Feature Branch는 "개발 시작"(STEP 9) 시 생성된다.
- 객체는 **`WorkItem`**. 필드 API명은 describe 결과를 그대로 사용(필수 필드 누락 금지).
- **Description은 HTML 리치텍스트**다. HTML에는 따옴표·`<>`·줄바꿈이 많으므로
  `-v "Description=..."` 인라인은 깨지기 쉽다 → **CSV 파일 + `sf data import bulk`** 로 적재하고,
  CSV 값은 규칙대로 escape(따옴표 `""`, 셀 전체를 `"`로 감싸기)한다. 적재 후 한 건 열어 서식이 보이는지 확인.
- 코드네임(WI-p.nnn)은 Subject에 **그대로 유지**.
```

> 💡 일괄 생성한 Work Item은 개발 환경이 "연결"되지 않습니다. 각 WI를 열어 우측 상단 ▼ → Change Development Environment 로 DEV 환경을 지정하거나, 개발 시작(STEP 9) 시 지정합니다.

### STEP 9 — 개발 (AI 코딩) 프롬프트

권장 에이전트: 오브젝트/Apex = **backend_developer** · LWC/화면 = **frontend_developer** · 실습: Lab 9.3

워크아이템 문서를 그대로 개발 에이전트에 전달해 구현합니다. 작업 성격(서버/화면)에 맞는 에이전트를 선택하세요.

```text
이 작업은 .claude/agents/ 의 backend_developer 에이전트로 진행해줘.
(오브젝트/Apex = backend_developer · LWC/화면 = frontend_developer 로 선택)

[입력] 해당 Work Item 문서(docs/work-items/WI-p.nnn-*.md)의 전체 내용을 아래에 붙여넣는다.
--
(여기에 Workitem md 파일 내용 붙여넣기)
--

[작업] 문서의 세부 작업과 수락 기준(AC-nnn)에 따라 force-app 에 구현하라.
- 선행(Depends-on) WI가 모두 완료됐는지 먼저 확인(미완이면 시작 금지).
- 수락 기준(AC-nnn)을 충족하도록 구현하고, 단위 테스트(Apex)도 함께 작성(커버리지 목표 75%↑).
- 코드네임(WI-p.nnn)·파일명은 문서와 일치 유지.

[출력] 변경 파일 목록 + 배포 명령(sf project deploy start) + 로컬 점검 방법
       (sf apex run test / sf code-analyzer run).
```

### STEP 10 — 테스트 자동화 구성 프롬프트 (Playwright UI 테스트 · CI는 선택)

권장 에이전트: **test_engineer** · 실습: Lab 10.3

Phase 0 인수기준(AC-nnn)을 Playwright UI 기능 테스트로 구현합니다. CI(GitHub Actions)는 선택 사항 — 안정화 후 도입하세요.

> ⚠ 미완성/불안정한 CI는 PR·프로모트(배포) 절차를 방해할 수 있습니다(필수 체크 실패로 머지·승격 차단 등).
> 초기에는 CI를 붙이지 말고, 테스터가 각 환경(DEV/SIT/UAT)에서 Playwright를 수동 실행해 검증하세요(아래 [1][2]만 수행).
> spec·앱이 안정되고 인증/시크릿 운영이 검증된 후에 [3] GitHub Actions를 도입합니다.

(참고) 실습 교재([Training_Lab_DevOps_Center.md](Training_Lab_DevOps_Center.md) Lab 10)는 CI 없이 테스터 수동 실행으로 진행합니다.

```text
[작업] 이 프로젝트에 UI 기능 테스트(Playwright)를 구성하라. ([3] CI는 "선택" — 지시할 때만 수행)
입력: docs/phase-0/ACCEPTANCE-CRITERIA.md (AC-nnn), docs/work-items/* (ac-ids),
     기존 LWC/Apex 소스.

[1) Playwright 설치·설정]
- `tests/e2e/` 에 Playwright(@playwright/test, TypeScript) 구성: playwright.config.ts,
  package.json 스크립트(`test:e2e`).
- baseURL 은 환경변수/`sf org open` 으로 얻은 Scratch Org(또는 SIT) URL 을 사용하도록 구성.
- 로그인 처리: `sf org open --url-only` 로 받은 프론트도어 URL 또는 저장된 storageState 로 세션 재사용.

[2) AC → spec 변환]
- 각 `AC-nnn` 의 Given/When/Then 을 `tests/e2e/WI-p.nnn-*.spec.ts` 의 test() 로 1:1 변환.
- 각 test 에 주석으로 `// AC-nnn / REQ-nnn / WI-p.nnn` 추적 태그를 남길 것.
- 경계/예외(negative) 시나리오도 포함. 선택자는 안정적인 값(data-* 속성/접근성 역할) 우선.
- 실행은 환경변수로 대상 오그를 지정해 **테스터가 수동 실행**
  (예: `SF_TARGET_ORG=DH-DEV ... npx playwright test`).

[3) GitHub Actions(CI) 워크플로우 — ⚠ 선택, 안정화 후에만] — `.github/workflows/ci.yml`
- 트리거: pull_request, 그리고 DevOps Center 작업 브랜치 push.
- 단계:
  1. Node 22 + Salesforce CLI(sf) 설치
  2. Dev Hub 인증 — `sf org login sfdx-url` (시크릿 `SFDX_AUTH_URL` 사용, 평문 금지)
  3. Scratch Org 생성 → 소스 배포(`sf project deploy start`)
     → Apex 테스트(`sf apex run test -c -r human`)
  4. `npx playwright install --with-deps` → `npm run test:e2e` (대상 org URL 주입)
  5. Code Analyzer(`sf code-analyzer run`) 정적분석
  6. 항상 Scratch Org 삭제(`sf org delete scratch -p`) + Playwright 리포트 아티팩트 업로드
- 실패 시 PR 머지/프로모트를 막도록 필수 체크(required status check)로 설정하라는 안내 주석 추가.

[4) DevOps Center 연동 설명(문서)]
- DevOps Center는 GitHub를 소스컨트롤로 사용 → Work Item Feature Branch의 PR에서 위 CI가 자동 실행됨.
- 품질 게이트(DevOps Testing/Code Analyzer)와 GitHub Actions 결과를 **프로모트 전 검증 기준**으로
  함께 사용하도록 `docs/` 에 1페이지 설명 추가.

[규칙]
- 비밀정보(인증 URL/토큰)는 **GitHub Secrets** 로만 사용(코드/로그에 노출 금지).
- 테스트는 결정적(deterministic)이어야 하며, 시드 데이터는 스크립트로 준비/정리.
- 모든 spec 은 `AC-nnn` 추적 태그를 가져야 한다(추적성). 누락된 AC는 보고.
```

> 💡 **추적성 사슬**: REQ-nnn(요구) → AC-nnn(인수기준) → WI-p.nnn(개발) → *.spec.ts(Playwright) → 테스터 실행 결과 → DevOps Center 프로모트. (CI 도입 시 그 사이에 자동 검증이 추가됨)

### STEP 11 — 코드 리뷰 (셀프 PR) 프롬프트

권장 에이전트: **code_reviewer** · 실습: Lab 11.2

Work Item을 In Review로 전환하면 생성되는 PR(또는 작업 브랜치)의 변경을 리뷰합니다. 1인 실습에선 만든사람이 리뷰어를 겸합니다("셀프 PR").

```text
이 작업은 .claude/agents/ 의 code_reviewer 에이전트로 진행해줘.
이 PR의 변경(force-app)을 품질·보안·Governor Limits 관점에서 리뷰하고 개선점을 알려줘.

[대상] Work Item feature branch ↔ 상위 단계 브랜치의 diff

[점검 항목]
- 코딩 표준·가독성·중복, 보안 취약점(공유 모델·CRUD/FLS·하드코딩 ID 등)
- Governor Limits(루프 내 SOQL/DML, 벌크화), 예외 처리
- 단위 테스트 커버리지(75%↑)와 수락 기준(AC-nnn) 충족 여부

[출력] 심각도(High/Medium/Low)별 지적사항 + 구체적 수정 제안.
```

(반영이 필요하면 코드를 고쳐 다시 커밋 → PR 자동 갱신 → 재리뷰)

### STEP 12 — 산출물 정리 & 추적성 매트릭스 프롬프트

권장 에이전트: **documentation_writer** · 실습: Lab 13.1

저장소의 산출물을 인덱스로 정리하고 추적성 매트릭스를 생성해 프로젝트를 마무리·패키징합니다.

```text
이 작업은 .claude/agents/ 의 documentation_writer 에이전트로 진행해줘.
저장소의 산출물을 docs/DELIVERABLES.md 로 정리해줘 — 각 항목에 경로·설명·상태(완료/진행).
그리고 추적성 매트릭스(REQ-nnn → AC-nnn → WI-p.nnn → tests/e2e/*.spec.ts → 테스터 실행 결과)를 표로 생성해줘.
```

### STEP 13 — (반복) 고객 리뷰 후 문서 갱신 (DROP/ENHANCE/ADD)

권장 에이전트: **requirements_analyst** · 실습: 반복 피드백 사이클

별도 프롬프트가 없습니다 — 위 STEP 7의 세 번째 프롬프트("프롬프트 ③ — 본 프로젝트 산출물에 반영", DROP/ENHANCE/ADD)를 그대로 재사용합니다.

고객 리뷰/검수(예: 부록 D 체크리스트) 결과를 "리뷰 결정사항"으로 정리해 그 프롬프트의 입력([리뷰 결정사항])에 넣으면, docs/REQUIREMENT.md·docs/PROJECT-PLAN.md·docs/phase-0/*·docs/phases/*·docs/work-items/*·(영향 시) tests/e2e/* 가 재작성 없이 DROP/ENHANCE/ADD 로 점진 갱신됩니다.

> ⚠ **핵심 규칙(STEP 7 ③과 동일)**: 코드네임/ID(REQ-nnn·AC-nnn·WI-p.nnn) 유지(재번호 금지) · 변경 이력 1줄 · 선후관계(Depends-on)·AC-nnn↔Playwright spec 추적성 동반 갱신 · 영향받는 Work Item의 Status/체크리스트 재검토. → 갱신된 WI를 다음 사이클로 재개발.

---

## 3. CLAUDE.md 에 기록할 진행 규칙

STEP 4에서 자동 생성/보강되지만, PM이 직접 CLAUDE.md에 아래를 명시해 두면 모든 AI 작업에 적용됩니다.

```markdown
## ⚠ 에이전트 사용 규칙 (최우선·필수)
- **모든 작업은 `.claude/agents/` 에 정의된 전문 분야별 서브에이전트를 사용해서 진행한다.** (예외 없음)
- 작업 성격에 맞는 **전문 에이전트에게 위임**한다. 적합한 에이전트가 없으면 **임의로 직접 처리하지 말고**
  먼저 알리고 에이전트 추가/선정을 요청한다.
- 단계 → 에이전트 매핑(실제 9종):
  - REQUIREMENT·인수기준(AC) → **requirements_analyst**
  - FIT/GAP/NUD·아키텍처·데이터 모델 → **solution_architect**
  - PROJECT-PLAN·PHASE-PLAN → **project_manager**
  - WORKITEM(Task 분해) → **work_item_manager**
  - LWC/UI·목업 → **frontend_developer** · Apex/서버·오브젝트 → **backend_developer**
  - 인수기준→테스트·Playwright·Apex/Jest 테스트 → **test_engineer**
  - 코드 리뷰(품질·보안·성능) → **code_reviewer**
  - 산출물/문서 정리·Release Notes → **documentation_writer**
- 여러 전문 영역이 걸친 작업은 **각 영역을 해당 에이전트로 분담**하고, 결과를 PM이 취합한다.

## 진행 규칙 (Work Item 완료 기준)
각 Work Item을 "완료"로 표시하기 전에 반드시:
0. **해당 작업에 맞는 `.claude/agents/` 전문 에이전트를 사용**했는지 확인(미사용 시 진행 금지).
1. **선행(Depends-on) Work Item이 모두 완료**되었는지 확인 — 미완이면 시작 금지.
2. 코드 테스트 수행 — 단위 테스트 + **Playwright UI 테스트(대응 AC-nnn)** 통과, 실패/문제 해결 전에는
   **완료 불가**.
3. PROJECT-PLAN.md · PHASE-PLAN-nn.md · 해당 work-item 문서의 **체크리스트와 Status를 `[X]`로** 갱신.
4. (Salesforce) `sf project deploy start --dry-run` → 성공 시 `sf project deploy start`.
5. (CI 활성) **GitHub Actions(ci.yml) 통과** 확인.
6. (Git 활성) **Work Item 이름(WI-p.nnn-description)으로 커밋**.

## 문서 규칙
- 코드네임/ID(REQ-nnn, AC-nnn, WI-p.nnn)는 **절대 변경하지 않는다**.
- 문서 갱신은 **재작성이 아니라 DROP / ENHANCE / ADD** 로 한다.
- **선후관계(Depends-on)** 는 REQUIREMENT→PROJECT-PLAN→PHASE-PLAN→WORKITEM 에서 일관되게 유지(순환 금지).
- **추적성**: REQ → AC → WI → spec 연결을 유지하고, 한쪽이 바뀌면 연결된 문서/테스트를 함께 갱신.
- 큰 변경은 **계획(plan)을 먼저 제시**하고 승인 후 실행한다.
```

---

## 4. 빠른 참조

| STEP | 산출물 | 입력 | 권장 에이전트 | 실습 |
|---|---|---|---|---|
| STEP 1 | `docs/REQUIREMENT.md` (REQ-nnn + 선후관계) | RFP·Proposal·Feature Request + 팀·기간 | requirements_analyst | Lab 5.3 |
| STEP 2 ⓪ | `docs/phase-0/FIT-GAP-NUD.md` | REQUIREMENT | solution_architect | Lab 5.4 |
| STEP 3 ⓪ | `docs/phase-0/ACCEPTANCE-CRITERIA.md` (AC-nnn) | REQUIREMENT + FIT/GAP/NUD | requirements_analyst | Lab 5.5 |
| STEP 4 | `docs/PROJECT-PLAN.md` (선행·분류 컬럼) | REQUIREMENT + Phase 0 | project_manager | Lab 6.1 |
| STEP 5 | `docs/phases/PHASE-PLAN-nn.md` | PROJECT-PLAN | project_manager | Lab 6.2 |
| STEP 6 | `docs/work-items/WI-p.nnn-*.md` | PROJECT-PLAN + phases | work_item_manager | Lab 6.3 |
| STEP 7 | `docs/mockup/*` + 목업 코드 | work-items | frontend_developer / requirements_analyst | Lab 7 |
| STEP 8 | DevOps Center Work Item 레코드 | work-items + PROJECT-PLAN | project_manager | Lab 8.3 |
| STEP 9 | `force-app/*` (구현 + 단위테스트) | 해당 WI 문서 | backend_developer / frontend_developer | Lab 9.3 |
| STEP 10 | `tests/e2e/*.spec.ts` (CI는 선택) | ACCEPTANCE-CRITERIA + work-items | test_engineer | Lab 10.3 |
| STEP 11 | 코드 리뷰 결과(개선점) | PR diff(force-app) | code_reviewer | Lab 11.2 |
| STEP 12 | `docs/DELIVERABLES.md` + 추적성 매트릭스 | 전체 산출물·테스트 결과 | documentation_writer | Lab 13.1 |
| STEP 13 | 위 문서·테스트 갱신(DROP/ENHANCE/ADD) — STEP 7 ③ 프롬프트 재사용 | 고객 리뷰 결과 | requirements_analyst | 반복 사이클 |

- **ID 체계**: REQ-nnn(요구) → AC-nnn(인수기준) → WI-p.nnn(워크아이템, p=Phase) → *.spec.ts(테스트) — 부여 후 불변.
- **선후관계**: 모든 단계에서 Depends-on 위상정렬 유지(순환 금지).
- **Status**: `[ ]` 미완 · `[X]` 완료(테스트·CI·배포·커밋 후).

---

## 관련 문서

- PM How-To 가이드 · RM 가이드 · Developer 가이드 · QA 가이드
- DX Developer Cheatsheet — sf CLI · git · claude 명령 + 개발 프롬프트
- 방법론 다이어그램: `../theme/Assessment-Design-Flow.png`

> 💡 프롬프트는 프로젝트 특성에 맞게 조정하세요. Claude는 누락 정보를 질문하도록 작성되어 있으나, AI 산출 문서·코드는 PM/팀이 검토 후 확정합니다.

문서 기준: 2026년 6월 · AI 코딩(Claude Code) 적극 도입 워크플로우
