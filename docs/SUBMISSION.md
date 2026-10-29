# 과제 제출서 — DreamHouse Lite × Next Generation DevOps Center (1인 실습)

> 평가자용 요약 문서입니다. 상세 근거(추적성 매트릭스·테스트 결과·Release Notes·회고)의 원본은 [DELIVERABLES.md](DELIVERABLES.md) 입니다.

## 1. 제출 개요

| 항목        | 내용                                                                                                                                                                                                     |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 과제명      | Next Generation DevOps Center 1인 핸즈온 실습 — 부동산 매물 관리 LWC 앱 "DreamHouse Lite" ([실습 교재](references/Training_Lab_DevOps_Center.md) Lab 0~13)                                               |
| 제출자      | 최정혁                                                                                                                                                                                                   |
| 제출일      | 2026-10-29                                                                                                                                                                                               |
| 저장소      | https://github.com/1ll1ll1ll1li1i1l/homework (`main` = PROD 반영본)                                                                                                                                      |
| 릴리스 태그 | `v1.0-sprint1`                                                                                                                                                                                           |
| 한 줄 요약  | RFP → 요구사항·AC → WI 5건을 DevOps Center 파이프라인 `DreamHouse Pipeline`(DEV → SIT → UAT → PROD)으로 개발·테스트·프로모션해 Phase 1 MVP(REQ-001~012)를 PROD(DH-HUB)에 릴리스, WI-000001~000005 CLOSED |

## 2. 학습 목표 대비 수행 결과 (교재 0.1)

| #   | 학습 목표                                          | 결과 | 증거                                                                                                                                                                                                                                   |
| --- | -------------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | DE 가입 → Dev Hub → 저장소 → Scratch Org 환경 구성 | ✅   | [EXECUTION-PLAN](EXECUTION-PLAN.md) Phase A·C — DH-HUB(Dev Hub) + DH-DEV/SIT/UAT. 교재의 clone 대신 기존 `homework` 저장소 루트에 DX 프로젝트 배치(§3 조정 사항)                                                                       |
| 2   | DevOps Center 활성화·권한·소스 컨트롤 연결         | ✅   | [EXECUTION-PLAN](EXECUTION-PLAN.md) Phase B — 권한 세트 4종(이 org 라벨 "Lifecycle Center …"), GitHub 연결(Named Credential `ALMDevOpsGitHub`)                                                                                         |
| 3   | 파이프라인(DEV → SIT → UAT → PROD)·프로젝트 생성   | ✅   | [EXECUTION-PLAN](EXECUTION-PLAN.md) Phase D — `DreamHouse Pipeline`, 브랜치 `sit`/`uat`/`main`, 프로젝트 `DreamHouse Lite`                                                                                                             |
| 4   | 산출물 REQUIREMENT → Phase 0 → PLAN · WORKITEM     | ✅   | [REQUIREMENT](REQUIREMENT.md) · [FIT-GAP-NUD](phase-0/FIT-GAP-NUD.md) · [ACCEPTANCE-CRITERIA](phase-0/ACCEPTANCE-CRITERIA.md) · [PROJECT-PLAN](PROJECT-PLAN.md) · [PHASE-PLAN-01](phases/PHASE-PLAN-01.md) · [work-items](work-items/) |
| 5   | 목업으로 고객 협의 → 문서 반영                     | ✅   | [MOCKUP-PROJECT-PLAN](mockup/MOCKUP-PROJECT-PLAN.md) · [REVIEW-01](mockup/reviews/REVIEW-01.md) (목업 승인, 결함 1건 수정, DROP/ENHANCE/ADD 없음)                                                                                      |
| 6   | Work Item 등록 → 개발 → Commit(DX Inspector)       | ✅   | [EXECUTION-PLAN](EXECUTION-PLAN.md) Phase H·I, [PROJECT-PLAN §6](PROJECT-PLAN.md) WI 번호 매핑 — 5건 bulk 등록, DX Inspector 커밋으로 리뷰(PR) 생성                                                                                    |
| 7   | Playwright E2E 작성·실행 (AC-nnn → spec)           | ✅   | [tests/e2e/](../tests/e2e/) spec 6개·56 test, [DELIVERABLES §3](DELIVERABLES.md#3-테스트-결과-요약) DEV/SIT/UAT 결과                                                                                                                   |
| 8   | Code Review → Promote → SIT → PROD 릴리스          | ✅   | PR #1(WI-1.001), PR #5(WI-1.005, 병합 커밋 `3d4f722`), code_reviewer 지적 [DELIVERABLES §5](DELIVERABLES.md#5-알려진-이슈--후속-step-13-후보), Promotion DEV→SIT→UAT→PROD(병합 커밋 `79807e2`, `97101a4`)                              |
| 9   | 산출물 정리·패키징 (문서·코드·테스트·추적성)       | ✅   | [DELIVERABLES](DELIVERABLES.md) (커밋 `eaf398c`) · 태그 `v1.0-sprint1` · 이 문서                                                                                                                                                       |

## 3. 제출 산출물 목록

추적성 매트릭스 원본(REQ → AC → WI → spec → 실행 결과, AC 70개 단위)과 산출물 전체 인덱스는 **[DELIVERABLES.md](DELIVERABLES.md)** §1~§2 를 보십시오.

| 구분          | 산출물                                                                                                                                                                                                                                                                                                                                                      |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 문서          | [RFP](inputs/RFP.md) · [REQUIREMENT](REQUIREMENT.md) · [FIT-GAP-NUD](phase-0/FIT-GAP-NUD.md) · [ACCEPTANCE-CRITERIA](phase-0/ACCEPTANCE-CRITERIA.md) · [PROJECT-PLAN](PROJECT-PLAN.md) · [PHASE-PLAN-01](phases/PHASE-PLAN-01.md) · [WI-1.001~1.005](work-items/) · [목업](mockup/) · [EXECUTION-PLAN](EXECUTION-PLAN.md) · [DELIVERABLES](DELIVERABLES.md) |
| 코드          | [force-app/main/default/](../force-app/main/default/) — `Property__c`, 권한 세트 `DreamHouse_Agent`/`DreamHouse_Admin`, Apex `PropertyController`/`PropertyFilter`, LWC `propertyTile`/`propertyList`/`propertyFilter`/`propertyDetail`, LMS 3종, 앱 `DreamHouse Lite`·App Page `매물 탐색`                                                                 |
| 테스트        | Apex `PropertyModelTest`·`PropertyControllerTest` · Jest `lwc/*/__tests__/` (4 suites) · Playwright [tests/e2e/](../tests/e2e/) + [playwright.config.ts](../playwright.config.ts) · 데이터 [data/sample/](../data/sample/) · 스크립트 [scripts/](../scripts/)                                                                                               |
| 결과          | [DELIVERABLES §3](DELIVERABLES.md#3-테스트-결과-요약) 결과 표, 각 WI 문서의 ENHANCE 기록. `playwright-report/` 는 `.gitignore` 대상이라 저장소에 없음(§6 캡처로 대체)                                                                                                                                                                                       |
| 에이전트 규칙 | [CLAUDE.md](../CLAUDE.md) · [.claude/agents/](../.claude/agents/) (전문 에이전트 9종)                                                                                                                                                                                                                                                                       |

## 4. 결과 요약 수치

| 항목           | 결과                                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------ |
| Apex (DH-DEV)  | RunLocalTests **47/47 Pass, Org Wide 100%** (SIT 배포 시 45/45 — 차이는 DELIVERABLES §2.4 B-04)                    |
| LWC Jest       | **4 suites / 76 tests 통과**, ESLint 0                                                                             |
| Playwright DEV | 49 passed / 2 failed / 5 skipped — 실패 2건은 flaky(AC-044·034), 단독 재실행 통과                                  |
| Playwright SIT | 52 passed / 1 failed / 3 skipped — AC-044 테스트 코드 timeout 수정 후 통과                                         |
| Playwright UAT | **51 passed / 0 failed / 5 skipped** (skip = `@perf` 2 + 잠정 AC fixme 3)                                          |
| 성능 (DH-SIT)  | AC-063 초기 목록 중앙값 **571ms**·최대 698ms (≤1,000) · AC-064 서버 중앙값 **210ms**, UI 중앙값 732~992ms (≤1,300) |
| 정적 분석      | Code Analyzer High·Critical 0 (Critical 1건은 flow 엔진 Python 미설치 환경 오류)                                   |
| PROD 배포      | DH-HUB Promotion RunLocalTests 성공, Work Item **WI-000001~000005 전부 CLOSED**                                    |

## 5. 평가자 확인 방법

**저장소 둘러보는 순서**: [README](../README.md) → 이 문서 → [DELIVERABLES](DELIVERABLES.md) (§2 매트릭스·§3 결과) → [work-items/](work-items/) (WI 별 지침·AC·결과 ENHANCE) → 코드 [force-app/](../force-app/main/default/) · 테스트 [tests/e2e/](../tests/e2e/)

**로컬 테스트 실행** (PowerShell 7, 저장소 루트):

```powershell
npm install
npm run test:unit                       # LWC Jest — org 불필요

# Playwright — Salesforce org 접근 권한 필요 (DH-DEV/DH-SIT/DH-UAT 만 허용, PROD 는 가드로 차단)
npx playwright install chromium
$env:SF_TARGET_ORG = "DH-UAT"
node tests/e2e/global-setup.mjs         # 세션·역할 사용자(agent/admin/noaccess) 준비
$env:SF_INSTANCE_URL = (sf org display -o $env:SF_TARGET_ORG --json | ConvertFrom-Json).result.instanceUrl
npx playwright test ; npx playwright show-report
```

상세 옵션은 [tests/e2e/README.md](../tests/e2e/README.md). **org 동작 확인은 제출자 시연 또는 §6 캡처로 대신합니다** — org 자격 증명은 이 문서와 저장소에 포함하지 않습니다.

## 6. 첨부 권장 캡처 (제출자가 직접 촬영)

| #   | 캡처                                  | 위치 (org · 메뉴 경로)                                                                                                                               |
| --- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| C-1 | 파이프라인 — Production 단계에 WI 5건 | DH-HUB · 앱 런처 → DevOps Center(이 org 표시명 "Lifecycle Center") → 프로젝트 `DreamHouse Lite` → Pipeline                                           |
| C-2 | Work Items 목록 CLOSED                | DH-HUB · 같은 프로젝트 → Work Items 탭 (WI-000001~000005, 상태 CLOSED)                                                                               |
| C-3 | PROD 매물 탐색 화면 (1440px)          | DH-HUB · 앱 런처 → `DreamHouse Lite` → `매물 탐색` 탭 — 브라우저 창 너비 1440px, 필터·목록·상세 3영역이 보이게                                       |
| C-4 | 상세 패널·관리자 편집                 | DH-HUB · `매물 탐색` → 카드 클릭(상세 패널) → 관리자 편집(상태 변경) 진입 화면                                                                       |
| C-5 | Playwright HTML 리포트                | 로컬 · `SF_TARGET_ORG=DH-UAT`(또는 DH-SIT) 실행 후 `npx playwright show-report` 요약 화면                                                            |
| C-6 | Apex 테스트 결과                      | 로컬 · `sf apex run test -o DH-DEV -l RunLocalTests -c -r human` 출력, 또는 DH-HUB · DevOps Center → PROD Promotion 의 Activity History(테스트 성공) |

## 7. 실습 교재 대비 차이·교훈 (요약)

- 교재의 `dreamhouse-lite` clone 대신 기존 `homework` 저장소 루트를 DX 프로젝트로 사용, `claude_salesforce.zip` 미제공으로 에이전트 9종을 직접 작성 ([EXECUTION-PLAN §3](EXECUTION-PLAN.md#3-실습-교재-대비-조정-사항)).
- Hub(DE)는 Production 유형으로 연결해야 하고, 리뷰(PR)는 Hub 가 아니라 DH-DEV 의 DX Inspector 커밋으로 생성됨.
- DX Inspector 재커밋이 Jest `__tests__` 를 삭제 → git 커밋으로 복구, 커밋 후 diff 확인을 교훈으로 정리.
- 로컬 git 병합 후 "External merge detected"/"Environment Out of Sync" → Complete Promotion 으로 정리. Scratch Org 기본 통화 USD → KRW 조정.
- 전체 회고(잘된 점·막힌 점 L-01~L-10·개선): [DELIVERABLES §6](DELIVERABLES.md#6-회고)

## 8. 유의사항

- **PROD 데모 데이터**: DH-HUB 의 매물 가격은 시연용 예시값이며 실제 시세가 아닙니다.
- **매물 이미지**: PROD 시연 데이터의 사진은 나무위키 이미지를 과제 시연 목적으로만 연결했습니다(DH-HUB CSP Trusted URL `i.namu.wiki`). 저장소의 샘플 데이터는 정적 리소스 `propertySamplePhotos` 를 사용하며, 이 Trusted URL 설정은 org 설정으로 저장소에는 포함되지 않습니다.
- **Scratch Org**: DH-DEV/SIT/UAT 는 **2026-11-27 만료**, 평가 종료 후 삭제 예정입니다(교재 13.3 정리 단계를 의도적으로 보류).
- **알려진 이슈**: 잠정 AC 4건(AC-057/058/061/062, CK 미해소), 코드 리뷰 Low 잔여, Change Failure Rate 66.7%, WI·계획 문서 Status `[X]` 미갱신 — [DELIVERABLES §5](DELIVERABLES.md#5-알려진-이슈--후속-step-13-후보) · [§2.4](DELIVERABLES.md#24-끊긴-사슬--불일치-lab-132-추적성-검증-결과)
- Could(REQ-013/014)·Won't(REQ-015~018)는 Phase 1 범위 외입니다 ([DELIVERABLES §4.2](DELIVERABLES.md#42-미포함)).
