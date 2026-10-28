# PROJECT-PLAN — DreamHouse Lite 부동산 매물 관리 시스템

> Cheatsheet STEP 4 산출물 (Lab 6.1, project_manager).
> 입력: `docs/REQUIREMENT.md` v1.1 · `docs/phase-0/FIT-GAP-NUD.md` v1.1 · `docs/phase-0/ACCEPTANCE-CRITERIA.md` v1.0 · `docs/EXECUTION-PLAN.md`(환경)
> 이후 `docs/phases/PHASE-PLAN-01.md`(STEP 5), `docs/work-items/WI-1.nnn-*.md`(STEP 6), DevOps Center Work Item(STEP 8)은 모두 이 문서의 `WI-p.nnn` 을 기준으로 한다.

---

## 0. 문서 정보

| 항목 | 내용 |
|---|---|
| 문서명 | PROJECT-PLAN — DreamHouse Lite |
| 버전 | v1.3 (Draft — PM 결정 I-01/I-02/I-03/I-11 반영 + WI 문서 기준 정합성 보정 + DevOps Center Work Item 등록 매핑, 2026-10-28) |
| 작성일 | 2026-10-28 |
| 작성자 | 최정혁 (PM 역할, project_manager 에이전트 활용) |
| 상태 | Draft. 목업 리뷰(Lab 7) 결과와 잔여 OQ/CK 해소 결과는 DROP / ENHANCE / ADD 로 반영 |

### 0.1 변경 이력

| 버전 | 일자 | 작성자 | 유형 | 변경 내용 |
|---|---|---|---|---|
| v1.0 | 2026-10-28 | 최정혁 | 최초 작성 | Phase 0 / Phase 1 / Phase 2(후보) 구성, WI-1.001~WI-1.005(Must) + WI-1.006~WI-1.007(Could, 선택) 확정, 일정·리소스·REQ↔AC↔WI 매핑 |
| v1.1 | 2026-10-28 | 최정혁 | ENHANCE / ADD | PHASE-PLAN-01 §12 PM 결정 반영 — I-01: 탭 의존 화면 AC 이월처를 WI-1.005 전체 UI 회귀로 통일, §7.2 회귀 목록 보완 / I-02: LMS 채널 `PropertyUpdated__c` ADD(WI-1.005 소유) / I-03: `Property__c` 오브젝트 탭을 WI-1.001 로 이동(WI-1.001 Description ENHANCE) / I-11: 임시 테스트 하네스 미사용 / I-08: DH-HUB(PROD) 통화·로캘 변경은 사용자 명시 승인 전 실행 안 함(확인 필요 유지). WI ID·선행·공수 변경 없음 |
| v1.2 | 2026-10-28 | 최정혁 | ENHANCE | WI 문서(docs/work-items/WI-1.001~1.005) 기준 정합성 보정 — §5.2 WI-1.005 `propertyDetail` 조회 방식 `lightning-record-view-form` → `getRecord`(LDS) / §5.2 WI-1.002 "Jest(선택)·목업/검증 페이지 1차" 취소선(I-11) / §7.2 AC-032 공동 매핑(WI-1.003 = 목록·건수 렌더링, WI-1.004 = 가격 조건) 명시. WI ID·선행·공수 변경 없음 |
| v1.3 | 2026-10-28 | 최정혁 | ENHANCE / ADD | STEP 8(Lab 8.3) — DevOps Center(DH-HUB) Work Item 5건(WI-1.001~1.005) 등록, §6 번호 매핑 표 기입 + 등록 메모 ADD(번호가 선행 순서와 다른 이유, 3건 Description 코드 예시 일부 생략 — 원문은 저장소 문서). Feature Branch 미생성. WI ID·선행·공수 변경 없음 |

> 갱신 규칙: 재작성 금지, DROP / ENHANCE / ADD 로만 반영. **`WI-p.nnn` ID 는 한 번 부여하면 변경·재번호·재사용하지 않는다.**

---

## 1. 프로젝트 개요·목적 (REQUIREMENT 요약)

| 항목 | 내용 |
|---|---|
| 고객 | ○○ 부동산 중개사무소 (매물을 엑셀로 관리 → 검색·공유·최신화 비효율) |
| 솔루션 | **DreamHouse Lite** — Lightning Experience 앱. `Property__c` 커스텀 오브젝트 + Apex 조회 컨트롤러 + LWC(카드·목록·필터·상세) + Lightning App Page + 권한 세트 2종 |
| 목적 | ① 매물 데이터 단일 원천화 ② 상담원이 조건(키워드·가격·침실 수)으로 실시간 검색하고 카드 목록·상세 패널로 즉시 제시 ③ 관리자의 등록·수정·삭제·상태 변경을 화면에 즉시 반영 ④ 차세대 DevOps Center 파이프라인(DEV → SIT → UAT → PROD)과 AI 코딩(Claude)을 쓰는 프로토타입 우선·반복형 개발 실습 |
| 범위 (Phase 1 MVP) | REQ-001~REQ-012 (Must, RFP F1~F5·S1~S3). Could REQ-013/014 는 여유 시에만. Won't REQ-015~018 은 Phase 2 후보 |
| 범위 외 | 외부 부동산 API, 사진 파일 업로드(URL 만), 엑셀 이관(OQ-06), 다국어, Experience Cloud, CI 필수 도입 |
| 주요 고객 결정 (2026-10-28) | OQ-02 KRW 단일 통화·원 단위 전체 금액 표시 / OQ-04 판매완료 기본 노출·배지 초록/주황/회색 / OQ-07 관리자만 물리 삭제·상태 변경, 상담원 조회 전용 / OQ-10 상세 = 탐색 화면 내 패널 |
| FIT/GAP/NUD 요약 | Must 12건: FIT 5(REQ-001/002/003/004/010) · GAP 7(REQ-005~009, 011, 012) — Must 공수 약 13.5h. Could 2건 NUD(REQ-013/014). REQ-011 은 OQ-11 결과에 따라 NUD 로 바뀔 수 있음 |

### 1.1 환경 (EXECUTION-PLAN 기준)

| 별칭 | 용도 | 파이프라인 단계 / 브랜치 |
|---|---|---|
| DH-HUB (= core) | Developer Edition Hub · Dev Hub · DevOps Center · **PROD** | PROD / `main` |
| DH-DEV | Scratch Org — 개발 + 목업 겸용 (만료 2026-11-27) | DEV (WI 별 Feature Branch) |
| DH-SIT | Scratch Org — 통합 테스트 | SIT / `sit` |
| DH-UAT | Scratch Org — 수용 테스트 | UAT / `uat` |

- 저장소: `https://github.com/1ll1ll1ll1li1i1l/homework` (DX 프로젝트 = 저장소 루트). Pipeline `DreamHouse Pipeline` 단계 구성 완료.
- **착수 전 미완료 전제**: Pipeline Activate + DevOps Center Project `DreamHouse Lite` 생성·연결(EXECUTION-PLAN Phase D) — Lab 8(Work Item 등록) 전에 완료해야 한다.
- `config/project-scratch-def.json` 은 `language: en_US` 만 지정 → 기존 Scratch Org 3개와 DH-HUB 의 기본 통화가 USD 일 수 있다. KRW 확인·조정은 WI-1.001 첫 체크 항목(D-16, CK-15).

---

## 2. 프로젝트 리소스 요약 (1인 겸임)

| 역할 | 담당 | 주요 책임 | 사용 에이전트 (`.claude/agents/`) | 가용성 |
|---|---|---|---|---|
| PM | 최정혁 | 일정·범위·리스크, PROJECT-PLAN/PHASE-PLAN, 고객 커뮤니케이션 | project_manager | 2일 × 100% (역할 간 배분) |
| PL / RM | 최정혁 | Work Item·Feature Branch·Promotion, 릴리스 승인(사람 전담) | project_manager, work_item_manager | 상동 |
| BA | 최정혁 | REQUIREMENT, AC, 고객 결정 반영 | requirements_analyst, solution_architect | 상동 |
| Senior Developer | 최정혁 + AI | Apex·데이터 모델·권한 | backend_developer | 상동 |
| Junior Developer | (없음 → AI 대체) | LWC 초안·목업 | frontend_developer | AI 상시 |
| QA | 최정혁 + AI | Apex 테스트, Playwright E2E, 품질 게이트 | test_engineer, code_reviewer | 상동 |
| 고객(역할 대행) | 최정혁 | 목업 리뷰·UAT 승인 | — | Lab 7, Lab 12 |
| 문서 | 최정혁 + AI | DELIVERABLES, Release Notes | documentation_writer | Lab 13 |

- **가용 공수**: Phase 1 = 1인 × 2일 = **2.0 M/D (16h)**. Phase 0 = 2026-10-28 1일.
- 1인 겸임이라 4-eyes 리뷰가 불가 → code_reviewer 에이전트 리뷰 + Apex 테스트·Code Analyzer·Playwright 게이트로 보완(R-02).

---

## 3. 일정 (AI 코딩 적극 도입 기준)

### 3.1 산정 기준

- **Man-day = FIT-GAP-NUD 예상 공수(h) ÷ 8h**, 0.05 M/D 단위 올림. FIT-GAP-NUD 공수는 설계·구현·단위 테스트 포함, AI 초안 생성 → 사람 리뷰·보강 1~2회(A-05)를 전제로 한 값으로 본다. Playwright E2E·리뷰·Promotion 은 §3.3 공통 활동으로 따로 잡는다.
- REQ-012(공통 UX, 1.0h)는 UI WI 4개(WI-1.002~1.005)에 0.25h 씩 나눈다. REQ-011(1.0h)은 목록 갱신(WI-1.003) 0.5h + 상세 반영(WI-1.005) 0.5h 로 나눈다. REQ-005(2.0h)는 기본 조회(WI-1.003) 1.5h + 조건 확장(WI-1.004) 0.5h 로 나눈다.
- **NUD 가중**: NUD 항목은 공수 × 1.5 (스파이크·규칙 확정 후 재작업 위험 반영). 조건부 NUD(REQ-011, OQ-11)는 확정 시 +1~2h 를 위험 버퍼로 둔다.
- 진행 방식: 프로토타입 우선(Lab 7 목업) → WI 별 반복(AI 초안 → DH-DEV 배포 → 리뷰 → 보강).

### 3.2 Phase 구성

| Phase | 명칭 | 기간 | 범위 | 상태 |
|---|---|---|---|---|
| Phase 0 | 본 개발 전 고객 협의 | **2026-10-28** (목업 리뷰는 2026-10-29 오전 첫 슬롯에서 마감, M1) | FIT/GAP/NUD + 인수기준(AC) + 고객 결정 + 계획(STEP 4~6) + 목업 리뷰(프로토타이핑) | 진행 중 (핵심 산출물 3종 완료) |
| Phase 1 | MVP | **2026-10-29(목) ~ 2026-10-30(금), 2일 / 1 스프린트** | REQ-001~REQ-012 → WI-1.001~WI-1.005. Could WI-1.006/1.007 은 선택(일정 미배정) | 예정 |
| Phase 2 (후보) | 확장 | 미정 | REQ-015~018(Won't, 재평가), Phase 1 미착수 REQ-013/014. **Phase 1 에서는 WI 를 만들지 않는다** | 후보 |

### 3.3 상세 일정 (Lab 단계 매핑)

| 일자 | 시간대(목표) | Lab | 활동 | 대상 WI / 산출물 | 공수(h) | 마일스톤 |
|---|---|---|---|---|---|---|
| 10-28 (수) | 종일 | Lab 5 | REQUIREMENT v1.1 · FIT-GAP-NUD v1.1 · ACCEPTANCE-CRITERIA · 고객 결정(OQ-02/04/07/10) | Phase 0 | (완료) | M0 ✅ |
| 10-28 (수) | 오후~ | Lab 6 | STEP 4 PROJECT-PLAN → STEP 5 PHASE-PLAN-01 → STEP 6 WORKITEM 문서 → PM 검토 게이트 | Phase 0 (계획) | 1.5 | M2(앞당김) |
| 10-29 (목) | 09:00–10:30 | **Lab 7** | 목업 프로토타이핑 — **DH-DEV 겸용, `mockup` 브랜치**, MWI 정적 LWC → 부록 D 리뷰(고객 역할) → 결정 반영 → `main` 병합 | Phase 0 마감 | 1.5 | **M1** Phase 0 완료 |
| 10-29 (목) | 10:30–11:00 | **Lab 8** | DevOps Center Work Item 등록(STEP 8, `sf data import bulk -o DH-HUB`) → §6 번호 매핑 기록 | WI-1.001~1.005 | 0.5 | M2 계획 확정 |
| 10-29 (목) | 11:00–13:30 | **Lab 9** | 개발 | WI-1.001 | 2.5 | |
| 10-29 (목) | 13:30–15:45 | **Lab 9** | 개발 | WI-1.002 | 2.25 | |
| 10-29 (목) | 15:45–19:30 | **Lab 9** | 개발 (+ test_engineer 가 WI-1.001~1.003 spec 초안 병행) | WI-1.003 | 3.75 | **M3** REQ-001~007 DEV 반영 |
| 10-30 (금) | 09:00–11:45 | **Lab 9** | 개발 | WI-1.004 | 2.75 | |
| 10-30 (금) | 11:45–14:30 | **Lab 9** | 개발 (App Page 조립 후 전체 UI 회귀) | WI-1.005 | 2.75 | **M4** MVP 완성(DEV) |
| 10-30 (금) | 14:30–15:30 | **Lab 10** | Playwright E2E 전체 실행(DH-DEV)·결과 표 기록 — spec 작성은 WI 개발과 병행 | `tests/e2e/WI-1.00n-*.spec.ts` | 1.0 | |
| 10-30 (금) | 15:30–16:00 | **Lab 11** | Mark as In Review → code_reviewer 셀프 리뷰 → Merge → Ready to Promote | 전체 WI | 0.5 | |
| 10-30 (금) | 16:00–18:00 | **Lab 12** | Promote **SIT**(샘플 데이터 적재 AC-008 + E2E 회귀) → **UAT**(부록 D + E2E, 고객 승인) → **PROD**(DH-HUB, Run all tests) → 스모크 | 전체 WI | 2.0 | **M5** SIT→UAT, **M6** PROD |
| 10-30 (금) | 18:00–18:30 | **Lab 13** | DELIVERABLES·추적성 매트릭스·Release Notes, 태그 `v1.0-sprint1`, 회고, 산출물 DROP/ENHANCE/ADD 반영 | — | 0.5 | 종료 |
| (여유 시) | — | Lab 9 | Stretch — **선택**, Must 완료·품질 게이트 통과 후에만 | WI-1.006 / WI-1.007 | (3.75 / 3.0) | — |

### 3.4 공수 요약

| 구분 | 공수(h) | M/D |
|---|---|---|
| Phase 1 개발 WI (WI-1.001~1.005) | 14.0 | 1.8 |
| Phase 1 공통 활동 (Lab 7 목업 1.5 + Lab 8 0.5 + Lab 10 1.0 + Lab 11 0.5 + Lab 12 2.0 + Lab 13 0.5) | 6.0 | 0.75 |
| **Phase 1 합계** | **20.0** | **2.55** |
| 가용 (1인 × 2일) | 16.0 | 2.0 |
| **초과** | **4.0** | **0.55** |
| (선택) Stretch WI-1.006 + WI-1.007 | 6.75 | 0.9 |

> ⚠ **용량 초과 약 0.55 M/D**. 대응: ① spec 작성(test_engineer)과 리뷰(code_reviewer)를 개발과 병행(AI 병렬) ② Lab 6 계획 문서를 Phase 0 일(10-28)로 앞당김(반영 완료) ③ Stretch 는 일정에 넣지 않음 ④ 일 1~2h 연장 버퍼 ⑤ 지연 시 우선 순위: WI-1.005 의 Should AC(AC-068) → Lab 13 문서 일부를 다음 날로 이월. Promotion(Lab 12)은 이월하지 않는다(R-01).

### 3.5 마일스톤

| ID | 마일스톤 | 목표 | 완료 기준 | 상태 |
|---|---|---|---|---|
| M0 | 요구사항 기준선 | 2026-10-28 | REQUIREMENT v1.1 | [X] |
| M1 | Phase 0 완료 | 2026-10-29 오전 | FIT-GAP-NUD·AC 완료 + 목업 리뷰 결정 반영 + 잔여 OQ 처리 방침 확정 | [ ] |
| M2 | 계획 확정 | 2026-10-29 오전 | PROJECT-PLAN·PHASE-PLAN-01·WI 문서 + DevOps Center Work Item 등록 | [ ] |
| M3 | 데이터 모델·핵심 목록 | 2026-10-29 종료 | WI-1.001~1.003 `[X]` (REQ-001~007 DEV 반영, Apex 테스트 통과) | [ ] |
| M4 | MVP 완성 (DEV) | 2026-10-30 오후 초 | WI-1.004~1.005 `[X]` (REQ-008~012) | [ ] |
| M5 | SIT → UAT | 2026-10-30 오후 | Pre-Promotion 테스트 + Playwright E2E 통과, UAT 승인 | [ ] |
| M6 | PROD 릴리스 | 2026-10-30 종료 | PROD Promotion, Release Notes | [ ] |

---

## 4. Phase 0 — 본 개발 전 고객 협의 (2026-10-28)

> Phase 0 활동은 DevOps Center Work Item 으로 등록하지 않으므로 `WI-0.nnn` 대신 활동 ID(`P0-nn`)를 쓴다. STEP 8 등록 대상은 Phase 1 WI 뿐이다.

| Status | ID | 활동 | 선행(Depends-on) | 산출물 | 담당 에이전트 | 일자 |
|---|---|---|---|---|---|---|
| [X] | P0-01 | REQUIREMENT 작성 (REQ-001~018, NFR-001~010) | - | `docs/REQUIREMENT.md` v1.1 | requirements_analyst | 2026-10-28 완료 |
| [X] | P0-02 | FIT/GAP/NUD 분석 + Decision Log | P0-01 | `docs/phase-0/FIT-GAP-NUD.md` v1.1 | solution_architect | 2026-10-28 완료 |
| [X] | P0-03 | 상세 인수기준 (AC-001~070, SD-01~10, CK-01~15) | P0-01, P0-02 | `docs/phase-0/ACCEPTANCE-CRITERIA.md` | requirements_analyst | 2026-10-28 완료 |
| [X] | P0-04 | 고객 결정 반영 (OQ-02/04/07/10 → D-11, D-16~18) | P0-02, P0-03 | REQUIREMENT v1.1, FIT-GAP-NUD v1.1 | requirements_analyst / solution_architect | 2026-10-28 완료 |
| [ ] | P0-05 | PROJECT-PLAN (STEP 4) | P0-04 | 본 문서 | project_manager | 2026-10-28 |
| [ ] | P0-06 | PHASE-PLAN-01 (STEP 5) · WORKITEM 문서 (STEP 6) | P0-05 | `docs/phases/PHASE-PLAN-01.md`, `docs/work-items/WI-1.00n-*.md` | project_manager / work_item_manager | 2026-10-28 |
| [ ] | P0-07 | PM 검토 게이트 (REQ·선후관계·분류·AC·WI) | P0-06 | EXECUTION-PLAN 체크 | 사람(PM) | 2026-10-28 |
| [ ] | P0-08 | 목업 프로토타이핑·고객 리뷰 (Lab 7) + 잔여 OQ/CK 협의 | P0-07 | `docs/mockup/*`, `docs/mockup/reviews/REVIEW-01.md`, 결정 반영 | frontend_developer / requirements_analyst | 2026-10-29 오전 (M1) |

**P0-08 에서 처리할 잔여 협의 항목**: OQ-01(주소·State__c, CK-11) · OQ-03(필수값·유효성, CK-05) · OQ-05(사진 CSP·대체 이미지, CK-10) · OQ-06(엑셀 이관) · OQ-09(정렬·LIMIT, CK-06) · OQ-11(즉시 반영 범위, CK-08 — NUD 전환 여부) · OQ-12(모바일, CK-13) · OQ-13(Could 착수, CK-12) · OQ-14 · OQ-15(가격 축약, CK-02) · CK-01/03/04/07/09/14/15 · D-02(표준 폼) · D-12(즉시 반영 한정).

---

## 5. Phase 1 — MVP Work Item 목록 (2026-10-29 ~ 2026-10-30)

| Status | ID | Description | 선행(Depends-on) | 분류(FIT/GAP/NUD) | Man-day (M/D) |
|---|---|---|---|---|---|
| [ ] | WI-1.001 | `Property__c` 오브젝트·필드(Status 기본값 Available, Price KRW Currency(12,0)) + 권한 세트 2종(상담원 Read 전용 / 관리자 CRUD+Modify All) + 표준 레코드 페이지·페이지 레이아웃(등록·수정·삭제, 필수값) + `매물` 오브젝트 탭(`Property__c`) + **KRW 통화/로케일 확인·조정**(DEV/SIT/UAT/HUB) — REQ-001, REQ-002, REQ-004 (ENHANCED 2026-10-28: I-03 — `Property__c` 오브젝트 탭을 WI-1.005 에서 WI-1.001 로 이동, 공수 변경 없음) | - | FIT | 0.3 (2.5h = REQ-001 1.0 + REQ-002 0.5 + REQ-004 0.5 + KRW/로케일 0.5) |
| [ ] | WI-1.002 | 샘플 데이터 플랜(SD-01~SD-10, `sf data import tree --plan`) + **Property Tile/Card LWC** `propertyTile`(사진·대체 이미지, KRW 가격, 주소/도시, 침실·욕실, 상태 색상 배지, 선택 이벤트 발행) + 공통 UX 기반 — REQ-003, REQ-006, REQ-012 | WI-1.001 | GAP (REQ-003 은 FIT) | 0.3 (2.25h = 0.5 + 1.5 + 0.25) |
| [ ] | WI-1.003 | **Property List LWC** `propertyList`(반응형 그리드·건수·빈 결과·스피너·에러 토스트) + **Apex 컨트롤러** `PropertyController.getProperties(PropertyFilter)` 기본 조회(`with sharing`·`WITH USER_MODE`·`cacheable`·LIMIT) + `PropertyControllerTest` + 목록 즉시 갱신(`refreshApex`) — REQ-005, REQ-007, REQ-011, REQ-012 | WI-1.002 | GAP (REQ-011 은 OQ-11 에 따라 NUD 가능) | 0.5 (3.75h = 1.5 + 1.5 + 0.5 + 0.25) |
| [ ] | WI-1.004 | **검색 필터 패널** `propertyFilter`(키워드·최소/최대 가격(원)·최소 침실 수·초기화, 300ms 디바운스, LMS `PropertyFilter__c`) + **Apex 조건 확장**(키워드 Name/City 부분 일치·가격 경계 포함·침실 이상, 바인드 변수) — REQ-008 (+REQ-005 조건, REQ-012) | WI-1.003 | GAP | 0.35 (2.75h = REQ-005 0.5 + REQ-008 2.0 + 0.25) |
| [ ] | WI-1.005 | **상세 패널** `propertyDetail`(LMS `PropertySelected__c` 구독, 큰 사진 + 전체 속성, 관리자 전용 편집·상태 변경, 저장 후 카드·배지·상세 즉시 반영) + **DreamHouse Lite 앱·Lightning App Page** "매물 탐색"(좌 필터 + 중앙 그리드 + 우 상세) + 앱/탭 권한 보강 — REQ-009, REQ-010, REQ-011, REQ-012 | WI-1.003, WI-1.004 | GAP (REQ-010 은 FIT) | 0.35 (2.75h = 1.5 + 0.5 + 0.5 + 0.25) |
| [ ] | WI-1.006 | (Could · **선택**, 일정 미배정) 상세 위치 지도 `lightning-map` — 스파이크(샘플 주소 3~5건 지오코딩) 선행, 실패 시 대안 B/C — REQ-013 | WI-1.005 | NUD | 0.5 ((1.5h + 스파이크 1.0h) × 1.5 = 3.75h) |
| [ ] | WI-1.007 | (Could · **선택**, 일정 미배정) 유사 매물 추천 — OQ-13 판정 기준 확정 후 착수(잠정: 동일 City + 가격 ±20% + 침실 ±1, 자기 자신·판매완료 제외) — REQ-014 | WI-1.005 | NUD | 0.4 (2.0h × 1.5 = 3.0h, 기준 확정 후 재산정) |
| | | **합계** | | Must 5건 / Could 2건 | **Must 1.8** · Could 0.9 |

- Won't(REQ-015~018): Phase 1 WI 없음 (D-05~D-08, Phase 2 후보).
- WI-1.006/1.007 은 Must 5건 완료 + 품질 게이트 통과 + 고객 착수 결정(OQ-13, D-13) 이 모두 충족될 때만 시작한다. 미착수 시 Phase 2 로 이관(ENHANCE 기록).
- DevOps Center 등록(STEP 8): WI-1.001~WI-1.005 필수. WI-1.006/1.007 은 착수 결정 시 등록.

### 5.1 실행 순서 (위상정렬)

선행 간선: WI-1.001 → WI-1.002 → WI-1.003 → WI-1.004 → WI-1.005, WI-1.003 → WI-1.005, WI-1.005 → WI-1.006, WI-1.005 → WI-1.007. 모든 간선이 작은 ID → 큰 ID 방향 → **DAG, 순환 없음**.

| 순서 | 계층 | WI | 선행 | 병렬 | 근거 (REQUIREMENT §7) |
|---|---|---|---|---|---|
| 1 | L0 | WI-1.001 | - | - | REQ-001 루트, REQ-002/004 는 REQ-001 의존 |
| 2 | L1 | WI-1.002 | WI-1.001 | - | REQ-003/006 → REQ-001 |
| 3 | L2 | WI-1.003 | WI-1.002 | - | REQ-007 → REQ-005, REQ-006 / REQ-011 → REQ-004, REQ-007 |
| 4 | L3 | WI-1.004 | WI-1.003 | - | REQ-008 → REQ-007 |
| 5 | L4 | WI-1.005 | WI-1.003, WI-1.004 | - | REQ-009 → REQ-007, REQ-010 → REQ-008, REQ-009 |
| 6 | Stretch | WI-1.006, WI-1.007 | WI-1.005 | **서로 병렬 가능** (선택) | REQ-013 → REQ-009, REQ-014 → REQ-005, REQ-009 |

- **크리티컬 패스**: WI-1.001 → WI-1.002 → WI-1.003 → WI-1.004 → WI-1.005 (1인이므로 Must 는 전부 직렬). Day 1 에 WI-1.003 까지 끝내야 Day 2 Promotion 이 가능하다.
- REQ 수준에서는 REQ-005(Apex)가 REQ-006 과 병렬 가능하지만, CLAUDE.md 진행 규칙 1(선행 WI 미완 시 시작 금지)에 따라 WI 단위는 직렬로 진행한다. 대신 test_engineer 의 spec 초안 작성은 개발과 병행한다.

### 5.2 Work Item 별 체크리스트

> 공통 완료 조건(CLAUDE.md 진행 규칙): 전문 에이전트 사용 · 선행 WI `[X]` 확인 · 단위 테스트 + 대응 AC Playwright 통과(실패/문제 해결 전 완료 금지, 잠정 AC 제외) · PROJECT-PLAN/PHASE-PLAN/WI 문서 체크리스트·Status `[X]` · `sf project deploy start --dry-run` → `sf project deploy start` · `WI-1.nnn-description` 이름으로 커밋 · 비밀정보 미커밋(AC-067).

#### WI-1.001 — 데이터 모델 + 권한 세트 + 표준 CRUD + KRW (FIT)
- [ ] DH-DEV/SIT/UAT/HUB 기본 통화 확인 (`UserInfo.getDefaultCurrency()`) → KRW 아니면 Company Information 통화 로케일(ko_KR) 조정, scratch def `country`/locale 보강 검토 (D-16, CK-15) — **PROD(DH-HUB) 포함** (ENHANCED 2026-10-28: I-08 — DH-HUB 는 점검만 자동 수행, 통화·로캘 **변경은 사용자 명시 승인 후에만**(Lab 12 전). 자동 변경 계획 없음 — 확인 필요 유지)
- [ ] `Property__c` + 필드 9개(Name, Address__c, City__c, State__c(OQ-01 결과), Price__c Currency(12,0), Bedrooms__c, Bathrooms__c, Picture_URL__c, Status__c 기본값 Available·라벨 판매중/계약중/판매완료)
- [ ] OWD Public Read Only (AD-03)
- [ ] 권한 세트 `DreamHouse_Agent`(Read 전용) / `DreamHouse_Admin`(CRUD + Modify All) — Apex 클래스·앱 권한은 WI-1.003/1.005 에서 ENHANCE
- [ ] 페이지 레이아웃 필수값(Name·Price__c·Status__c), 유효성 규칙(가격 > 0 — CK-05 확정 시), 표준 New/Edit/Delete
- [ ] `Property__c` 오브젝트 탭 `매물`(`tabs/Property__c.tab-meta.xml`) + 두 권한 세트 `tabSettings` Visible — 표준 목록·레코드 페이지를 URL 직접 입력 없이 진입 (ADDED 2026-10-28: I-03)
- [ ] `PropertyModelTest` (AC-001~005, AC-053) 통과
- [ ] Playwright `WI-1.001-property-crud.spec.ts` (AC-006, 009~012, 060) — 탐색 탭 검증 부분은 WI-1.005 회귀에서 확인
- [ ] dry-run → deploy (DH-DEV), 커밋 `WI-1.001-property-data-model`

#### WI-1.002 — 샘플 데이터 + Property Tile/Card LWC (GAP)
- [ ] 데이터 플랜(JSON) SD-01~SD-10 저장소 커밋, DH-DEV 적재 → 10건·6/2/2·도시 7개 확인 (AC-007)
- [ ] 재실행 중복 방지 절차 문서화 (AC-008 — SIT/UAT 검증은 Lab 12)
- [ ] 대체 이미지 정적 리소스 `propertyPlaceholder`
- [ ] `propertyTile`: `data-testid` 규약(§1.6), KRW `lightning-formatted-number`, 배지 `slds-theme_success`/`slds-theme_warning`/기본 + `data-status`, `aria-label`(매물명·가격), 클릭 시 `PropertySelected__c` 발행
- [ ] ~~Jest(선택)~~ Jest(1차 검증, 필수) + Playwright `WI-1.002-property-tile.spec.ts` (AC-020~023, 전부 `@explore`) — ~~목업/검증 페이지에서 1차, WI-1.005 에서 최종~~ 1차 = CLI(데이터 분포) + Jest, Playwright 최종 = WI-1.005 전체 UI 회귀 (ENHANCED 2026-10-28: 정합성 보정 — 구 문구 취소선, WI-1.002 문서와 일치) (ENHANCED 2026-10-28: I-11 — 임시 검증 페이지(하네스) 미사용. 1차는 Jest, spec 은 `@explore` 로 작성해 WI-1.005 전체 UI 회귀에서 최종)
- [ ] code_reviewer 리뷰(SLDS·접근성), dry-run → deploy, 커밋 `WI-1.002-sample-data-property-tile`

#### WI-1.003 — Property List LWC + Apex 컨트롤러 (GAP)
- [ ] `PropertyController`(`with sharing`) `@AuraEnabled(cacheable=true) getProperties(PropertyFilter)` — `WITH USER_MODE`, 상수 LIMIT·정렬(CK-06 확정값, 미확정 시 임시값 명시), 0건 시 빈 List
- [ ] `PropertyFilter` 파라미터 객체 (NFR-009), Apex 권한을 두 권한 세트에 ENHANCE
- [ ] `PropertyControllerTest`(`@testSetup` + `PropertyTestDataFactory`): AC-004(조회부), 013, 018, 019, 055(Apex), 062(잠정) / 커버리지 ≥ 85% 목표 (AC-066)
- [ ] `propertyList`: 반응형 그리드, `result-count`(`{n}건`), `empty-state`, `loading-spinner`, 오류 토스트, `refreshApex` 갱신 경로 (AC-044) (ENHANCED 2026-10-28: I-02 — WI-1.003 은 `@api refresh()` 까지. `PropertyUpdated__c` 구독 연결은 WI-1.005)
- [ ] Playwright `WI-1.003-property-list.spec.ts` (AC-024, 025, 032, 046, 047, 063 — 필터 입력이 필요한 단계는 WI-1.004 에서 확인) (ENHANCED 2026-10-28: I-01 — 1차는 Jest, AC-024·025·032·044·046·047 E2E 는 `@explore` 로 작성해 WI-1.005 전체 UI 회귀에서 실행. AC-063 은 Lab 12)
- [ ] `sf code-analyzer` High 0건 (AC-065), dry-run → deploy, 커밋 `WI-1.003-property-list-apex`

#### WI-1.004 — 검색 필터 + Apex 조건 확장 (GAP)
- [ ] Apex 조건: 키워드 Name/City 부분 일치(바인드 변수), 가격 ≥/≤, 침실 이상, 공백 키워드 처리(CK-04)
- [ ] `PropertyControllerTest` 확장: AC-014~017, 056, 057
- [ ] `propertyFilter`: 라벨 `키워드`/`최소 가격`/`최대 가격`/`최소 침실 수`, 침실 선택지 `전체`~`5개 이상`, 300ms 디바운스, LMS `PropertyFilter__c` 발행, `filter-reset`, 음수·비숫자 차단, min > max 처리(CK-03)
- [ ] `propertyList` 가 LMS 필터 구독
- [ ] Playwright `WI-1.004-search-filter.spec.ts` (AC-027~034, 057~059, 064) + WI-1.003 의 필터 의존 AC(025, 032, 046, 047) 확인 (ENHANCED 2026-10-28: I-01 — WI-1.004 에서는 필터 입력 로직을 Jest 로 1차 확인만 한다. AC-027~034·059 와 WI-1.003 의 AC-025·032·046·047 E2E 는 WI-1.005 전체 UI 회귀, AC-064 는 Lab 12)
- [ ] AC-065·066·070 재확인, dry-run → deploy, 커밋 `WI-1.004-search-filter`

#### WI-1.005 — 상세 패널 + Lightning App Page (GAP)
- [ ] `propertyDetail`: `PropertySelected__c` 구독, `detail-empty` 초기 문구, ~~`lightning-record-view-form`~~ `getRecord`(LDS, `lightning/uiRecordApi`) 로 전체 속성·큰 사진·대체 이미지, 관리자 전용 `detail-edit-button`(상담원 미노출) (ENHANCED 2026-10-28: 정합성 보정 — 조회는 `getRecord`, 편집 폼만 `lightning-record-edit-form`. PHASE-PLAN-01 §8.2·§8.3.1, WI-1.005 문서와 일치)
- [ ] 저장 성공 시 `notifyRecordUpdateAvailable` + 목록 `refreshApex` → 카드·배지·상세 즉시 반영 (REQ-011, 같은 사용자 화면 — D-12/OQ-11)
- [ ] LMS 채널 `PropertyUpdated__c`(필드 `recordId`) 생성 — `propertyDetail` 이 저장·상태 변경 성공 후 발행, `propertyList` 가 구독해 `refreshApex` 호출 (AC-042, 043) (ADDED 2026-10-28: I-02 — 채널 메타데이터·구독 연결 모두 WI-1.005 소유)
- [ ] Lightning 앱 `DreamHouse Lite` + App Page `매물 탐색`(3영역) + `매물` 탭, 앱·탭 권한을 권한 세트에 ENHANCE (ENHANCED 2026-10-28: I-03 — `매물` 오브젝트 탭은 WI-1.001 에서 생성됨. WI-1.005 는 앱 내비게이션에 추가 + `매물 탐색` App Page 탭 생성·`tabSettings` 만)
- [ ] Playwright `WI-1.005-property-detail.spec.ts` (AC-026, 035~043, 054, 055 UI) + `WI-1.005-layout-a11y.spec.ts` (AC-045, 048, 068)
- [ ] **전체 UI 회귀**: WI-1.001/1.002 의 탐색 탭 의존 AC(AC-009, 011, 012, 020~023, 060) 재실행 (ENHANCED 2026-10-28: I-01 — 회귀 범위 = AC-009, 011, 012, 060(WI-1.001) / AC-020~023(WI-1.002) / AC-024, 025, 032, 044, 046, 047(WI-1.003) / AC-027~034, 059(WI-1.004), 잠정 AC-057/058/061 은 CK 해소 시 포함. PHASE-PLAN-01 §3.4 와 동일, `npx playwright test` 전체)
- [ ] dry-run → deploy, 커밋 `WI-1.005-property-detail-app-page`

#### WI-1.006 — 상세 위치 지도 (NUD, 선택)
- [ ] 착수 조건 확인: Must 5건 `[X]`, OQ-01·OQ-13 결정
- [ ] 스파이크 30~60분 (샘플 주소 3~5건) → 대안 A/B/C 결정 기록
- [ ] `propertyDetail` 에 `detail-map`, Playwright AC-049, 050
- [ ] dry-run → deploy, 커밋 `WI-1.006-property-map`

#### WI-1.007 — 유사 매물 추천 (NUD, 선택)
- [ ] 착수 조건 확인: Must 5건 `[X]`, OQ-13 판정 기준 확정(CK-12) → 공수 재산정
- [ ] Apex 유사 매물 조회 + 테스트, `similar-list`/`similar-card`/`similar-empty`
- [ ] Playwright AC-051, 052
- [ ] dry-run → deploy, 커밋 `WI-1.007-similar-properties`

---

## 6. DevOps Center Work Item 번호 매핑 (STEP 8 에서 기록)

| WI (문서) | DevOps Center Work Item 번호 | Feature Branch | 비고 |
|---|---|---|---|
| WI-1.001 | WI-000003 (`1fkbm000001DYo5AAG`) | (STEP 9 개발 시작 시 생성) | 2차 등록. Description 에서 §4.4~4.8 코드 예시 생략(원문 참조) (ENHANCED 2026-10-28: STEP 8 등록) |
| WI-1.002 | WI-000001 (`1fkbm000001DYmTAAW`) | (STEP 9 개발 시작 시 생성) | 문서 전체 포함 (ENHANCED 2026-10-28: STEP 8 등록) |
| WI-1.003 | WI-000002 (`1fkbm000001DYmUAAW`) | (STEP 9 개발 시작 시 생성) | 문서 전체 포함 (ENHANCED 2026-10-28: STEP 8 등록) |
| WI-1.004 | WI-000004 (`1fkbm000001DYo6AAG`) | (STEP 9 개발 시작 시 생성) | 2차 등록. Description 에서 §5.6~5.7 코드 예시 생략(원문 참조) (ENHANCED 2026-10-28: STEP 8 등록) |
| WI-1.005 | WI-000005 (`1fkbm000001DYo7AAG`) | (STEP 9 개발 시작 시 생성) | 2차 등록. Description 에서 §4.1, §4.3~4.7 코드 예시 생략(원문 참조) (ENHANCED 2026-10-28: STEP 8 등록) |
| WI-1.006 (선택) | | | 착수 결정 시 등록 |
| WI-1.007 (선택) | | | 착수 결정 시 등록 |

> (ADDED 2026-10-28: STEP 8 / Lab 8.3 등록 결과) Hub = DH-HUB, Project `DreamHouse Lite`(`1Qgbm000000KqthCAC`), 담당자 = junghyuck.choi.85647fe082a1@agentforce.com(`005bm00000aeAiHAAU`), Status = NEW, Development Environment 미지정(STEP 9 에서 지정). 적재: CSV + `sf data import bulk -s WorkItem`, 필드 `Subject`·`Description`(리치텍스트, 최대 32,768자)·`DevopsProjectId`·`AssignedToId`.
> - **DevOps Center 번호는 선행 순서와 다르다.** 1차 일괄 등록에서 WI-1.001·1.004·1.005 가 Description 리치텍스트 길이 초과(STRING_TOO_LONG — Salesforce 가 저장 시 표 셀마다 `colspan`/`rowspan` 속성을 붙여 길이가 늘어남)로 실패해, 성공한 WI-1.002·1.003 이 WI-000001·000002 가 되고 실패분을 2차로 등록해 WI-000003~000005 가 되었다. 실행 순서는 번호가 아니라 이 문서의 WI ID·선행(§5) 을 따른다.
> - WI-1.001·1.004·1.005 의 Description 은 길이 한도 때문에 일부 "코드 예시" 하위 절을 생략했다(해당 위치에 생략 표시와 원문 경로 기재). **원문은 저장소 문서 `docs/work-items/WI-1.00n-*.md` 이다.**

---

## 7. 추적성 — REQ ↔ AC ↔ WI 매핑

> "담당 WI" = 구현·1차 검증 WI. "최종 검증" = 화면 의존성 때문에 Playwright 를 뒤 WI 에서 회귀 실행해야 하는 경우. 잠정 AC(CK 미해소)는 WI 완료 조건에서 제외(AC 문서 §1.2).

### 7.1 REQ → AC → WI

| REQ | MoSCoW | 분류 | AC | 담당 WI |
|---|---|---|---|---|
| REQ-001 | Must | FIT | AC-001, 002, 003 | WI-1.001 |
| REQ-002 | Must | FIT | AC-004, 005, 006, 053, 054, 055, 067 | WI-1.001 (Apex 권한 WI-1.003, 앱 권한 WI-1.005 ENHANCE) |
| REQ-003 | Must | FIT | AC-007, 008 | WI-1.002 |
| REQ-004 | Must | FIT | AC-009, 010, 011, 012, 060, 061(잠정) · 공유 AC-006, 038, 044, 053, 054 | WI-1.001 |
| REQ-005 | Must | GAP | AC-013, 018, 019, 055, 062(잠정), 065, 066 / AC-014~017, 056, 057(잠정), 070 | WI-1.003 / WI-1.004(조건 확장) |
| REQ-006 | Must | GAP | AC-020, 021, 022, 023 · 공유 AC-019, 039 | WI-1.002 |
| REQ-007 | Must | GAP | AC-024, 025, 032, 046, 047, 063 / AC-026 | WI-1.003 / WI-1.005 |
| REQ-008 | Must | GAP | AC-027~034, 057(잠정), 058(잠정), 059, 064, 070 · 공유 AC-043 | WI-1.004 |
| REQ-009 | Must | GAP | AC-026, 035~039, 054 · 공유 AC-042 | WI-1.005 |
| REQ-010 | Must | FIT | AC-040, 041, 055(UI) | WI-1.005 |
| REQ-011 | Must | GAP (→NUD 가능) | AC-044 / AC-042, 043, 054 | WI-1.003 / WI-1.005 |
| REQ-012 | Must | GAP | AC-045, 046, 047, 048, 068 | WI-1.002~1.005 공통, 최종 WI-1.005 |
| REQ-013 | Could | NUD | AC-049(잠정), 050(잠정) | WI-1.006 (선택) |
| REQ-014 | Could | NUD | AC-051(잠정), 052(잠정) | WI-1.007 (선택) |
| REQ-015~018 | Won't | — | — | — (Phase 2 후보) |
| NFR 공통 | — | — | AC-067(비밀정보), AC-069(변경 추적성) | 전 WI / Phase 1 종료 시(Lab 13) |

### 7.2 WI → AC (완료 판정용)

| WI | Must AC (완료 조건) | Should AC | 잠정 AC (CK 해소 후) | 최종 검증 이월 |
|---|---|---|---|---|
| WI-1.001 | AC-001, 002, 003, 004(권한 벡터), 005, 006, 009, 010, 011, 012, 053, 060, 067 | — | AC-061 (CK-05) | AC-004 조회 10건 → WI-1.003 / AC-009·011·012·060 탐색 탭 부분 → WI-1.005 |
| WI-1.002 | AC-007, 008, 020, 021, 022, 023, 067 | — | — | AC-008 SIT/UAT → Lab 12 / AC-020~023 → WI-1.005 |
| WI-1.003 | AC-004(조회부), 013, 018, 019, 024, 025, 032(공동 — 목록·건수 렌더링 부분), 046, 047, 055(Apex), 063, 065, 066, 067 | AC-044, 070 | AC-062 (CK-06) | ~~AC-025·032·046·047 필터 입력 → WI-1.004~~ AC-024·025·032·046·047·044(Should) → WI-1.005 전체 UI 회귀 (필터 입력 로직 Jest 1차 확인은 WI-1.004) / AC-063 DH-SIT 측정 → Lab 12 (ENHANCED 2026-10-28: I-01 — WI-1.004 에도 `매물 탐색` 탭이 없어 E2E 불가) |
| WI-1.004 | AC-014, 015, 016, 017, 027, 028, 029, 030, 031, 032(공동 — 가격 조건 부분), 033, 056, 059, 064, 065, 066, 067 | AC-034, 070 | AC-057 (CK-04), AC-058 (CK-03) | AC-027~034(AC-034 Should 포함)·059 화면 부분 → WI-1.005 전체 UI 회귀 (잠정 AC-057/058 UI 는 CK 해소 시) / AC-064 DH-SIT 측정 → Lab 12 (ENHANCED 2026-10-28: I-01) |
| WI-1.005 | AC-026, 035, 036, 037, 038, 039, 040, 041, 042, 043, 045, 048, 054, 055(UI), 067 + 회귀(AC-009, 011, 012, 020~023, 060) + 회귀 보완(AC-024, 025, 032, 046, 047 / AC-027~033, 059) | AC-068 + 회귀 AC-034, 044 | 회귀 AC-057, 058, 061 (CK 해소 시) | — (ENHANCED 2026-10-28: I-01 — 회귀 목록을 WI-1.001~1.004 의 탭 의존 화면 AC 전체로 보완, PHASE-PLAN-01 §3.4 와 동일. AC-042·043 의 목록 갱신은 LMS `PropertyUpdated__c`(I-02)로 검증) |
| WI-1.006 | — (Could) | — | AC-049, 050 (CK-11) | — |
| WI-1.007 | — (Could) | — | AC-051, 052 (CK-12) | — |
| Phase 1 종료 | — | AC-069 | — | Lab 13 |

**AC 커버리지 확인**: AC-001~AC-070 중 Must 61개(잠정 4개 포함 — AC-057/058/061/062)가 모두 1개 이상의 WI 에 매핑됨. Should 5개(AC-034, 044, 068, 069, 070) · Could 4개(AC-049~052) 도 매핑됨(61 + 5 + 4 = 70). **미매핑 AC 없음.**

- **AC-032 공동 매핑** (ENHANCED 2026-10-28: 정합성 보정 — WI-1.003·WI-1.004 문서 ac-ids 모두 포함) — WI-1.003 = 목록·건수 렌더링 부분(상태 조건이 없어 Sold·Under Contract 가 기본 노출됨을 Apex AC-013 으로 확인), WI-1.004 = 가격 조건 부분(최소 900000000 → 5건 Apex). WI-1.003 의 1차 검증은 가격 조건 Apex 검증을 주장하지 않는다(PHASE-PLAN-01 §6.4). E2E 는 양쪽 spec 의 `@explore` 테스트를 WI-1.005 전체 UI 회귀에서 실행.

---

## 8. 리스크 (계획 관점)

| ID | 리스크 | 영향 | 대응 |
|---|---|---|---|
| R-01 | Phase 1 공수 20h vs 가용 16h (초과 0.55 M/D) | 높음 | §3.4 대응. Stretch 미배정, Promotion 우선 |
| R-04 | Pipeline Activate·Project 생성 미완료 → Lab 8 지연 | 높음 | P0-07 전후로 완료(👤 UI 작업) |
| R-08 | 기존 Scratch Org·DH-HUB 기본 통화 USD → AC-003·KRW 표시 AC 실패 | 중 | WI-1.001 첫 체크 항목, 4개 오그 모두 확인 (ENHANCED 2026-10-28: I-08 — DH-HUB(PROD) 변경은 사용자 명시 승인 후 Lab 12 전 실행, 자동 변경하지 않음. 미승인 시 PROD `PropertyModelTest.ac003` 실패 위험 — 확인 필요) |
| R-09 | 화면 의존 AC(탐색 탭 필요)를 앞 WI 에서 Playwright 로 검증 불가 → 완료 판정 지연 | 중 | §7.2 "최종 검증 이월" 규칙 적용, WI-1.005 에서 전체 회귀. PHASE-PLAN-01 에서 각 WI 의 1차 검증 방법(목업 페이지/Jest/Apex) 명시 (ENHANCED 2026-10-28: I-01/I-03/I-11 — 임시 하네스 미사용, 1차 = Jest·Apex·CLI·탭 비의존 Playwright. `매물` 오브젝트 탭을 WI-1.001 로 당겨 표준 화면 AC 는 바로 실행, `매물 탐색` 의존 AC 는 전부 WI-1.005 회귀) |
| R-10 | OQ-11 이 사용자 간 실시간 반영으로 결정 → REQ-011 NUD, +1~2h | 높음 | Phase 1 은 같은 사용자 화면으로 한정 권고(D-12), 결정 시 Phase 2 또는 변경 요청 |
| R-11 | OQ-09 페이지네이션 필요 시 WI-1.003 +1h | 중 | 미결정 시 상수 LIMIT 으로 진행, Phase 2 후보 |
| R-02/03/05/07 | 리뷰 부재 / AI 보안 누락 / Playwright 불안정 / 사진 CSP | 중 | REQUIREMENT §10.3 대응 유지 |
