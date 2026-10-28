# PHASE-PLAN-01 — Phase 1 MVP (DreamHouse Lite)

> Cheatsheet STEP 5 산출물 (Lab 6.2, project_manager).
> 입력: `docs/PROJECT-PLAN.md` v1.1 (기준) (ENHANCED 2026-10-28: v1.0 → v1.1) · `docs/phase-0/ACCEPTANCE-CRITERIA.md` v1.0 · `docs/phase-0/FIT-GAP-NUD.md` v1.1 · `docs/REQUIREMENT.md` v1.1
> 다음 단계: `docs/work-items/WI-1.nnn-*.md`(STEP 6, work_item_manager)는 이 문서의 세부 작업·코드 예시·AC 연결을 기준으로 만든다.
> Phase 2 는 후보 단계이고 WI 가 없으므로 `PHASE-PLAN-02` 는 만들지 않는다(PROJECT-PLAN §3.2).

---

## 0. 문서 정보

| 항목 | 내용 |
|---|---|
| 문서명 | PHASE-PLAN-01 — Phase 1 MVP |
| 버전 | v1.2 (Draft — PM 결정 I-01/I-02/I-03/I-11 반영 + WI 문서 기준 정합성 보정, 2026-10-28) |
| 작성일 | 2026-10-28 |
| 작성자 | 최정혁 (PM 역할, project_manager 에이전트 활용) |
| 기간 | 2026-10-29(목) ~ 2026-10-30(금), 2일 / 1 스프린트 |
| 상태 | Draft. 목업 리뷰(Lab 7)·잔여 OQ/CK 해소 결과는 DROP / ENHANCE / ADD 로 반영 |

### 0.1 변경 이력

| 버전 | 일자 | 작성자 | 유형 | 변경 내용 |
|---|---|---|---|---|
| v1.0 | 2026-10-28 | 최정혁 | 최초 작성 | WI-1.001~WI-1.005(Must) 상세 계획, WI-1.006/1.007(Could·선택) 요약, 위상정렬 실행 순서, WI 별 1차 검증 방법과 WI-1.005 전체 UI 회귀로 이월하는 AC 정의 |
| v1.1 | 2026-10-28 | 최정혁 | ENHANCE / ADD | §12 PM 결정 반영 — I-01 해결(PROJECT-PLAN §7.2 회귀 목록 보완, §3.4 ⚠ 해소) / I-02 해결(LMS `PropertyUpdated__c` 확정, WI-1.005 소유, `propertyList` 구독 코드 ADD) / I-03 해결(`Property__c` 오브젝트 탭 WI-1.001 로 이동, WI-1.001 Description ENHANCE) / I-11 해결(임시 하네스 미사용) / I-08 확인 필요 유지(DH-HUB 변경은 사용자 명시 승인 후). WI ID·선행·공수 변경 없음 |
| v1.2 | 2026-10-28 | 최정혁 | ENHANCE | WI 문서(docs/work-items/WI-1.001~1.005) 기준 정합성 보정 — §4.5 표준 목록 진입 경로의 URL 직접 접근 문구 취소선(I-03, `매물` 탭 진입) / §6.4·§7.4·§11 AC-032 공동 매핑(WI-1.003 = 목록·건수 렌더링, WI-1.004 = 가격 조건), WI-1.003 1차 검증에서 가격 조건 Apex 주장 제거. WI ID·선행·공수 변경 없음 |

> 갱신 규칙: 재작성 금지, DROP / ENHANCE / ADD 로만 반영. `WI-p.nnn` · `AC-nnn` · `REQ-nnn` ID 는 바꾸지 않는다.
> 표기: **(확인 필요)** = 실제 오그에서 검증하지 않은 방식 또는 사실. 구현 전에 담당 에이전트가 확인하고 결과를 ENHANCE 로 기록한다.

---

## 1. Phase 1 개요

### 1.1 목표와 완료 기준

| 항목 | 내용 |
|---|---|
| 목표 | REQ-001~REQ-012(Must)를 DH-DEV 에서 구현·검증하고 DEV → SIT → UAT → PROD(DH-HUB)로 Promotion |
| 범위 | WI-1.001~WI-1.005 (Must). WI-1.006/1.007 은 Could·선택(일정 미배정, 착수 조건 충족 시에만) |
| 완료 기준 | ① WI-1.001~1.005 Status `[X]` ② Must AC(잠정 제외) 테스트 통과 — Apex(`RunLocalTests`) 실패 0·커버리지 ≥ 75%(PropertyController ≥ 85% 목표), WI-1.005 전체 UI 회귀 Playwright 통과 ③ Code Analyzer High 이상 0건 ④ M5(SIT→UAT)·M6(PROD) 달성 |
| 공수 | 개발 WI 14.0h(1.8 M/D) + 공통 활동 6.0h = 20.0h, 가용 16.0h → 초과 0.55 M/D (PROJECT-PLAN §3.4, R-01) |

### 1.2 Work Item 목록 (PROJECT-PLAN §5 와 동일)

| Status | ID | Description | 선행(Depends-on) | 분류(FIT/GAP/NUD) | Man-day (M/D) |
|---|---|---|---|---|---|
| [ ] 1차 완료(Playwright 대기) | WI-1.001 | `Property__c` 오브젝트·필드(Status 기본값 Available, Price KRW Currency(12,0)) + 권한 세트 2종(상담원 Read 전용 / 관리자 CRUD+Modify All) + 표준 레코드 페이지·페이지 레이아웃(등록·수정·삭제, 필수값) + `매물` 오브젝트 탭(`Property__c`) + **KRW 통화/로케일 확인·조정**(DEV/SIT/UAT/HUB) — REQ-001, REQ-002, REQ-004 (ENHANCED 2026-10-28: I-03 — `Property__c` 오브젝트 탭을 WI-1.005 에서 WI-1.001 로 이동, 공수 변경 없음) | - | FIT | 0.3 (2.5h = REQ-001 1.0 + REQ-002 0.5 + REQ-004 0.5 + KRW/로케일 0.5) |
| [ ] | WI-1.002 | 샘플 데이터 플랜(SD-01~SD-10, `sf data import tree --plan`) + **Property Tile/Card LWC** `propertyTile`(사진·대체 이미지, KRW 가격, 주소/도시, 침실·욕실, 상태 색상 배지, 선택 이벤트 발행) + 공통 UX 기반 — REQ-003, REQ-006, REQ-012 | WI-1.001 | GAP (REQ-003 은 FIT) | 0.3 (2.25h = 0.5 + 1.5 + 0.25) |
| [ ] | WI-1.003 | **Property List LWC** `propertyList`(반응형 그리드·건수·빈 결과·스피너·에러 토스트) + **Apex 컨트롤러** `PropertyController.getProperties(PropertyFilter)` 기본 조회(`with sharing`·`WITH USER_MODE`·`cacheable`·LIMIT) + `PropertyControllerTest` + 목록 즉시 갱신(`refreshApex`) — REQ-005, REQ-007, REQ-011, REQ-012 | WI-1.002 | GAP (REQ-011 은 OQ-11 에 따라 NUD 가능) | 0.5 (3.75h = 1.5 + 1.5 + 0.5 + 0.25) |
| [ ] | WI-1.004 | **검색 필터 패널** `propertyFilter`(키워드·최소/최대 가격(원)·최소 침실 수·초기화, 300ms 디바운스, LMS `PropertyFilter__c`) + **Apex 조건 확장**(키워드 Name/City 부분 일치·가격 경계 포함·침실 이상, 바인드 변수) — REQ-008 (+REQ-005 조건, REQ-012) | WI-1.003 | GAP | 0.35 (2.75h = REQ-005 0.5 + REQ-008 2.0 + 0.25) |
| [ ] | WI-1.005 | **상세 패널** `propertyDetail`(LMS `PropertySelected__c` 구독, 큰 사진 + 전체 속성, 관리자 전용 편집·상태 변경, 저장 후 카드·배지·상세 즉시 반영) + **DreamHouse Lite 앱·Lightning App Page** "매물 탐색"(좌 필터 + 중앙 그리드 + 우 상세) + 앱/탭 권한 보강 — REQ-009, REQ-010, REQ-011, REQ-012 | WI-1.003, WI-1.004 | GAP (REQ-010 은 FIT) | 0.35 (2.75h = 1.5 + 0.5 + 0.5 + 0.25) |
| [ ] | WI-1.006 | (Could · **선택**, 일정 미배정) 상세 위치 지도 `lightning-map` — 스파이크(샘플 주소 3~5건 지오코딩) 선행, 실패 시 대안 B/C — REQ-013 | WI-1.005 | NUD | 0.5 ((1.5h + 스파이크 1.0h) × 1.5 = 3.75h) |
| [ ] | WI-1.007 | (Could · **선택**, 일정 미배정) 유사 매물 추천 — OQ-13 판정 기준 확정 후 착수(잠정: 동일 City + 가격 ±20% + 침실 ±1, 자기 자신·판매완료 제외) — REQ-014 | WI-1.005 | NUD | 0.4 (2.0h × 1.5 = 3.0h, 기준 확정 후 재산정) |
| | | **합계** | | Must 5건 / Could 2건 | **Must 1.8** · Could 0.9 |

---

## 2. Phase 내 실행 순서 (위상정렬)

### 2.1 의존 그래프

```
WI-1.001 ──▶ WI-1.002 ──▶ WI-1.003 ──▶ WI-1.004 ──▶ WI-1.005 ──┬──▶ WI-1.006 (Could, 선택)
                              │                       ▲          └──▶ WI-1.007 (Could, 선택)
                              └───────────────────────┘
```

- 간선: 1.001→1.002, 1.002→1.003, 1.003→1.004, 1.003→1.005, 1.004→1.005, 1.005→1.006, 1.005→1.007. 모든 간선이 작은 ID → 큰 ID 방향이므로 **DAG, 순환 없음**.

### 2.2 실행 순서

| 순서 | 계층 | WI | 선행 | 후행 | WI 단위 병렬 | WI 안에서 AI 병렬로 돌릴 수 있는 작업 | 일정 (PROJECT-PLAN §3.3) |
|---|---|---|---|---|---|---|---|
| 1 | L0 | WI-1.001 | - | WI-1.002 | 불가 (루트) | KRW/로케일 점검(사람, 오그 4개) ∥ 메타데이터 초안 작성(backend_developer) ∥ `PropertyModelTest` 초안(test_engineer) | 10-29 11:00–13:30 |
| 2 | L1 | WI-1.002 | WI-1.001 | WI-1.003 | 불가 | 데이터 플랜 JSON ∥ `propertyTile` 초안 ∥ Jest·`WI-1.002-property-tile.spec.ts` 초안 | 10-29 13:30–15:45 |
| 3 | L2 | WI-1.003 | WI-1.002 | WI-1.004, WI-1.005 | 불가 | `PropertyController`+테스트(backend) ∥ `propertyList`(frontend) ∥ spec 초안(test_engineer) | 10-29 15:45–19:30 (M3) |
| 4 | L3 | WI-1.004 | WI-1.003 | WI-1.005 | 불가 | Apex 조건 확장 ∥ `propertyFilter` ∥ spec 초안 | 10-30 09:00–11:45 |
| 5 | L4 | WI-1.005 | WI-1.003, WI-1.004 | WI-1.006, WI-1.007 | 불가 | `propertyDetail` ∥ 앱/App Page/탭 메타데이터 ∥ 전체 UI 회귀 spec 정리 | 10-30 11:45–14:30 (M4) |
| 6 | Stretch | WI-1.006, WI-1.007 | WI-1.005 | - | **서로 병렬 가능** (선택) | 스파이크 ∥ 판정 기준 확정 | 일정 미배정 |

- **Must 는 WI 단위로 전부 직렬**이다. CLAUDE.md 진행 규칙 1(선행 WI 가 완료되지 않으면 시작 금지)과 1인 진행 때문이다. REQ 수준에서는 REQ-005(Apex)와 REQ-006(카드)을 병렬로 할 수 있지만(REQUIREMENT §7.1 L1), WI 경계를 바꾸지 않는다. 대신 각 WI 안에서 전문 에이전트 초안 작업을 병렬로 돌린다(위 표).
- **크리티컬 패스**: WI-1.001 → 1.002 → 1.003 → 1.004 → 1.005. Day 1 종료(M3) 전에 WI-1.003 이 끝나야 Day 2 Promotion(Lab 12)을 지킬 수 있다.

---

## 3. 공통 규칙

### 3.1 WI 공통 흐름 — "AI 로 먼저 프로토타입 → 사람이 AC 로 검증"

| 단계 | 누가 | 내용 | 산출물 |
|---|---|---|---|
| ① 착수 확인 | 사람(PL) | 선행 WI `[X]` 확인, `git checkout main ; git pull`, DevOps Center 가 만든 Feature Branch fetch/checkout | — |
| ② AI 프로토타입 | 전문 에이전트 | 이 문서의 세부 작업·코드 예시·AC 를 입력으로 메타데이터/Apex/LWC 초안 생성 (backend_developer / frontend_developer) | 소스 초안 |
| ③ 테스트 초안 | test_engineer (②와 병렬) | 연결 AC 의 Apex 테스트·Jest·Playwright spec 초안. 이월 AC 는 `@explore` 태그(§3.3) | 테스트 초안 |
| ④ 배포·1차 검증 | 사람 + AI | `sf project deploy start --dry-run` → `sf project deploy start -o DH-DEV`, WI 별 "1차 검증 방법"(각 WI §5) 실행 | 결과 기록 |
| ⑤ 사람의 AC 판정 | 사람(QA 역할) | AC 의 Then 을 하나씩 대조. 실패 → 원인 정리 후 ②로 되돌림(보강 1~2회, A-05) | AC 판정표 |
| ⑥ 리뷰·게이트 | code_reviewer | 보안(`with sharing`·USER_MODE·바인드), SLDS·접근성, Code Analyzer High 0건 | 리뷰 메모 |
| ⑦ 완료 처리 | 사람 | 체크리스트·Status `[X]`(PROJECT-PLAN·본 문서·WI 문서), `WI-1.nnn-description` 이름으로 커밋, 이월 AC 는 §3.4 추적표에 남김 | 커밋 |

### 3.2 검증 수단 정의

| 수단 | 명령/도구 | 검증 가능한 범위 | 비고 |
|---|---|---|---|
| Apex 단위 | `sf apex run test -n <Class> -o DH-DEV -c -r human` | 스키마·권한·DML·조회 로직(AC-001~005, 013~019, 053, 055 Apex, 056, 057, 062) | 오그 데이터 비의존(`@testSetup` + `PropertyTestDataFactory`) |
| LWC Jest | `npm run test:unit` (`sfdx-lwc-jest`, 이미 `package.json` 에 있음) | 컴포넌트 렌더링·`data-testid`·배지 클래스·대체 이미지 분기·디바운스·LMS 발행/구독·`@wire` 모의 | lint-staged 가 `lwc/**` 변경 시 관련 Jest 를 자동 실행. 실제 Lightning 렌더링·FLS·네트워크는 검증 불가 |
| CLI 수동 | `sf data import tree`, `sf data query`, 익명 Apex | 샘플 데이터 분포(AC-007/008), 오그 통화·로케일(AC-003 사전 점검) | 결과를 WI 문서에 붙여 넣는다 |
| 배포 + 수동 확인 | DH-DEV 화면 | 표준 레코드 페이지(새로 만들기/편집/삭제·필수값), 권한 세트별 진입점 | AC-006/010 은 Playwright 로 바로 자동화 가능 |
| Playwright E2E | `npx playwright test tests/e2e/WI-1.nnn-*.spec.ts` | 화면 AC 전체 | "매물 탐색" 탭은 WI-1.005 에서 생긴다 → 탭 의존 AC 는 §3.4 이월 |
| 코드 리뷰·정적 분석 | code_reviewer, `sf code-analyzer run --workspace . --view table` | AC-065, 070 | High 이상 0건 |

### 3.3 "매물 탐색" 탭 의존 문제와 처리 원칙 (PROJECT-PLAN R-09 대응)

**문제**: 화면 AC 대부분의 Given 은 "매물 탐색 탭(Lightning App Page)"이고(AC 문서 §1.3), 이 탭은 WI-1.005 에서 만들어진다. 필터 입력 요소(`filter-*`)도 WI-1.004 에서 생긴다. 그래서 WI-1.001~1.004 는 자기 AC 일부를 완료 시점에 Playwright 로 돌릴 수 없다.

**처리 원칙** (PROJECT-PLAN §7.2 "최종 검증 이월" 규칙을 구체화):

1. **1차 검증 = 완료 판정 근거**: 각 WI 는 §5 에 적은 1차 검증(Apex / Jest / CLI / 배포 후 수동 확인 / 탭 비의존 Playwright)을 모두 통과해야 `[X]` 로 표시한다. 1차 검증이 없는 AC 는 두지 않는다.
2. **Playwright spec 은 그 WI 에서 작성한다**: 이월 AC 의 `test()` 도 담당 WI 의 spec 파일(`tests/e2e/WI-1.00n-*.spec.ts`)에 쓴다. 작성 시점에 실행할 수 없는 테스트에는 `@explore` 태그를 단다.
   ```ts
   // tests/e2e/WI-1.003-property-list.spec.ts
   test('AC-024 초기 진입 시 전체 목록과 건수', { tag: '@explore' }, async ({ page }) => { /* ... */ });
   ```
   - WI-1.001~1.004 의 1차 실행: `npx playwright test tests/e2e/WI-1.001-property-crud.spec.ts --grep-invert @explore`
   - WI-1.005 전체 UI 회귀: `npx playwright test` (태그 제외 없이 전체)
3. **최종 검증 = WI-1.005 전체 UI 회귀**: WI-1.005 는 자기 AC 와 함께 §3.4 의 이월 AC 를 모두 통과해야 `[X]` 가 된다. 회귀에서 결함이 나오면 원인 WI 의 Feature Branch(Lab 11 Merge 전이라 아직 열려 있음)에 `WI-1.00n-*` 이름으로 수정 커밋하고, 그 WI 의 이월 AC 칸을 `[X]` 로 바꾼다.
4. **측정 AC 는 Lab 12**: AC-063/064(성능)는 DH-SIT 측정이 기준이므로 Lab 12 로 이월한다. AC-008(SIT/UAT 재현성)도 Lab 12.
5. **임시 테스트 하네스(선택, 기본 미사용)**: 탭 없이 화면 AC 를 먼저 돌려 보고 싶으면 DH-DEV 에만 임시 App Page(`WI_Harness`)를 배포하는 방법이 있다. 단, ① 저장소에 커밋하지 않고(`.forceignore` 또는 별도 폴더) ② DevOps Center Work Item 변경 목록에 넣지 않으며 ③ WI-1.005 배포 후 DH-DEV 에서 삭제한다. NFR-010(오그 직접 변경 금지)과 충돌할 수 있으므로 **사용 여부는 PM 이 결정(확인 필요)**. 기본안은 Jest + Apex + 탭 비의존 Playwright 로 1차 검증하는 것이다. (ENHANCED 2026-10-28: I-11 PM 결정 — **임시 테스트 하네스 사용 안 함(off)**. 1차 검증은 Jest + Apex + CLI + 탭 비의존 Playwright 만 사용하고, `WI_Harness` 는 만들지 않는다.)
6. **`매물` 오브젝트 탭은 WI-1.001 에서 생성** (ADDED 2026-10-28: I-03 PM 결정): 표준 목록·레코드 페이지(AC-006/009~012/060 의 표준 화면 부분)는 WI-1.001 부터 탭으로 진입해 바로 Playwright 로 실행한다. `매물 탐색` App Page 탭은 WI-1.005 에 그대로 둔다.

### 3.4 이월 AC 추적표 (WI-1.005 전체 UI 회귀 · Lab 12)

| 담당 WI | AC | 1차 검증 (담당 WI 안) | 최종 검증 | 최종 spec | 이월 완료 |
|---|---|---|---|---|---|
| WI-1.001 | AC-004 (조회 10건) | 권한 벡터는 `PropertyModelTest` | WI-1.003 `PropertyControllerTest` | (Apex) | [ ] |
| WI-1.001 | AC-009, 011, 012 | 표준 레코드 페이지 부분(토스트·상태 `판매중`·가격·삭제 후 SOQL 0건) Playwright | "매물 탐색" `성수` 검색 부분 → WI-1.005 | `WI-1.001-property-crud.spec.ts` | [ ] |
| WI-1.001 | AC-060 | 13자리 저장 실패·12자리 저장 성공 Playwright | 카드 `₩999,999,999,999` 표시 → WI-1.005 | `WI-1.001-property-crud.spec.ts` | [ ] |
| WI-1.002 | AC-008 | DH-DEV 재실행·중복 방지 절차 확인(CLI) | DH-SIT/UAT 적재 → Lab 12 | (수동 QA) | [ ] |
| WI-1.002 | AC-020, 021, 022, 023 | Jest(`propertyTile`) | WI-1.005 | `WI-1.002-property-tile.spec.ts` | [ ] |
| WI-1.003 | AC-024 | Jest(`propertyList` 10건 모의 → `10건`) | WI-1.005 | `WI-1.003-property-list.spec.ts` | [ ] |
| WI-1.003 | AC-025, 032, 046, 047 | Jest(빈 결과·스피너·오류 토스트 분기) | 필터 입력 로직은 WI-1.004 Jest, E2E 는 WI-1.005 | `WI-1.003-property-list.spec.ts` | [ ] |
| WI-1.003 | AC-044 (Should) | Jest(`refresh()` → `refreshApex` 호출) | WI-1.005 | `WI-1.003-property-list.spec.ts` | [ ] |
| WI-1.003 | AC-063 | — | DH-SIT 측정 → Lab 12 | `WI-1.003-property-list.spec.ts` | [ ] |
| WI-1.004 | AC-027~033, 059, 034(Should), 058(잠정) | Jest(디바운스·LMS 발행·초기화·음수 차단) + Apex 조건 테스트 | WI-1.005 | `WI-1.004-search-filter.spec.ts` | [ ] |
| WI-1.004 | AC-064 | — | DH-SIT 측정 → Lab 12 | `WI-1.004-search-filter.spec.ts` | [ ] |

> ⚠ PROJECT-PLAN §7.2 는 WI-1.003 의 AC-025·032·046·047 을 "→ WI-1.004" 로 이월한다고 적었지만, WI-1.004 시점에도 탭이 없어 Playwright 실행은 불가하다. 본 문서는 "필터 입력 로직의 1차 검증(Jest) = WI-1.004, E2E = WI-1.005" 로 해석한다. 또 §7.2 의 WI-1.005 회귀 목록(AC-009, 011, 012, 020~023, 060)에는 WI-1.003/1.004 의 화면 AC 가 빠져 있다 → **PROJECT-PLAN §7.2 ENHANCE 필요(§12 이슈 I-01)**.
> (ENHANCED 2026-10-28: I-01 해결 — PROJECT-PLAN v1.1 §7.2 가 본 표와 같게 ENHANCE 됨. AC-025·032·046·047 을 포함해 `매물 탐색` 탭이 필요한 화면 AC 는 전부 WI-1.004 가 아닌 WI-1.005 전체 UI 회귀에서 최종 검증한다. WI-1.004 는 필터 입력 로직 Jest 1차 확인만 담당.)

### 3.5 공통 완료 조건 (PROJECT-PLAN §5.2 · CLAUDE.md)

- [ ] 해당 작업에 맞는 `.claude/agents/` 전문 에이전트 사용
- [ ] 선행 WI `[X]` 확인
- [ ] 1차 검증 통과(Apex / Jest / CLI / 탭 비의존 Playwright). 잠정 AC 는 CK 해소 전까지 완료 조건에서 제외
- [ ] 이월 AC 를 §3.4 에 기록하고 spec 에 `@explore` 태그로 작성
- [ ] PROJECT-PLAN·본 문서·WI 문서 체크리스트와 Status `[X]`
- [ ] `sf project deploy start --dry-run` → `sf project deploy start` (DH-DEV)
- [ ] AC-067: `git ls-files | grep -E "\.auth/|sfdx-url|accessToken"` 결과 0줄, `.gitignore` 에 `tests/e2e/.auth/`
- [ ] `WI-1.nnn-description` 이름으로 커밋

### 3.6 data-testid 규약 (AC 문서 §1.6 그대로 — 구현 시 이름 변경 금지)

| 컴포넌트 | data-testid | 구현 WI |
|---|---|---|
| propertyFilter | `filter-panel`, `filter-keyword`, `filter-min-price`, `filter-max-price`, `filter-min-bedrooms`, `filter-reset`, `filter-price-error`(CK-03 확정 시에만) | WI-1.004 |
| propertyList | `property-list`, `result-count`, `empty-state`, `loading-spinner` | WI-1.003 |
| propertyTile | `property-card`(+ `data-id`, `data-name`), `property-card-image`, `property-card-name`, `property-card-price`, `property-card-address`, `property-card-rooms`, `property-status-badge`(+ `data-status`) | WI-1.002 |
| propertyDetail | `property-detail`, `detail-empty`, `detail-image`, `detail-name`, `detail-address`, `detail-city`, `detail-state`(OQ-01), `detail-price`, `detail-bedrooms`, `detail-bathrooms`, `detail-status-badge`, `detail-edit-button`, `detail-edit-form`, `detail-status-input`, `detail-save-button` | WI-1.005 |
| (Could) | `detail-map`, `similar-list`, `similar-card`, `similar-empty` | WI-1.006 / WI-1.007 |

- 대체 이미지 정적 리소스 이름 `propertyPlaceholder` (`img src` 포함 여부로 검증). 토스트는 `getByRole('alert')`/텍스트로 검증.
- `data-testid` 를 붙인 요소의 텍스트가 AC 의 기대값과 **정확히** 같아야 한다(예: `property-card-price` = `₩850,000,000`). 라벨과 값을 한 요소에 같이 넣지 않는다.

### 3.7 메타데이터·소스 배치 (예정)

```
force-app/main/default/
├─ objects/Property__c/ (object-meta, fields/*.field-meta.xml, listViews/All.listView-meta.xml)
├─ layouts/Property__c-Property Layout.layout-meta.xml
├─ permissionsets/DreamHouse_Agent.permissionset-meta.xml, DreamHouse_Admin.permissionset-meta.xml
├─ classes/PropertyFilter.cls, PropertyController.cls, PropertyTestDataFactory.cls, PropertyModelTest.cls, PropertyControllerTest.cls
├─ messageChannels/PropertyFilter.messageChannel-meta.xml, PropertySelected.messageChannel-meta.xml (+ PropertyUpdated — WI-1.005 제안) (ENHANCED 2026-10-28: I-02 확정 — `PropertyUpdated.messageChannel-meta.xml` 은 WI-1.005 에서 생성)
├─ staticresources/propertyPlaceholder.svg (+ .resource-meta.xml)
├─ lwc/propertyTile, propertyList, propertyFilter, propertyDetail
├─ applications/DreamHouse_Lite.app-meta.xml
├─ flexipages/Property_Explorer.flexipage-meta.xml
└─ tabs/Property__c.tab-meta.xml, Property_Explorer.tab-meta.xml (ENHANCED 2026-10-28: I-03 — `Property__c.tab` 은 WI-1.001, `Property_Explorer.tab` 은 WI-1.005)
data/sample/property-plan.json, data/sample/Property__c.json
config/users/agent-user-def.json, admin-user-def.json, noaccess-user-def.json
tests/e2e/WI-1.00n-*.spec.ts
```

- `messageChannels/` 폴더는 아직 없으므로 WI-1.002 에서 만든다.

---

## 4. WI-1.001 — 데이터 모델 + 권한 세트 + 표준 CRUD + KRW (FIT)

| 항목 | 내용 |
|---|---|
| Description | `Property__c` 오브젝트·필드(Status 기본값 Available, Price KRW Currency(12,0)) + 권한 세트 2종(상담원 Read 전용 / 관리자 CRUD+Modify All) + 표준 레코드 페이지·페이지 레이아웃(등록·수정·삭제, 필수값) + `매물` 오브젝트 탭(`Property__c`) + **KRW 통화/로케일 확인·조정**(DEV/SIT/UAT/HUB) — REQ-001, REQ-002, REQ-004 (ENHANCED 2026-10-28: I-03 — `Property__c` 오브젝트 탭을 WI-1.005 에서 WI-1.001 로 이동, 공수 변경 없음) |
| 분류 / Man-day | FIT / 0.3 (2.5h) |
| 선행 / 후행 | - / WI-1.002 |
| 담당 에이전트 | backend_developer(메타데이터·Apex 테스트), test_engineer(Playwright), code_reviewer |
| 일정 | 10-29 11:00–13:30 (Lab 9) |
| 커밋명 | `WI-1.001-property-data-model` |

### 4.1 AI 프로토타입 → 사람 검증 흐름

1. 사람: §4.2 작업 1(KRW·로케일 점검)을 먼저 시작한다. 결과는 오그 설정이라 AI 가 대신 확정할 수 없다.
2. backend_developer: 오브젝트·필드·레이아웃·권한 세트·리스트 뷰 XML 과 `PropertyTestDataFactory`·`PropertyModelTest` 초안을 생성한다.
3. test_engineer(병렬): `WI-1.001-property-crud.spec.ts` 초안과 Playwright 사용자 인증 상태(`tests/e2e/.auth/*.json`, 커밋 금지) 준비.
4. 사람: DH-DEV 배포 → Apex 테스트 → 권한 세트별 수동 확인 → AC 판정.

### 4.2 세부 작업

| # | 작업 | 산출물 | 비고 |
|---|---|---|---|
| 1 | **오그 기본 통화 KRW·로케일 확인/조정 (D-16, CK-15, R-08)** — DH-DEV/SIT/UAT/HUB 4개 모두 | 점검 결과표(WI 문서) | §4.3.1 상세 절차. DH-HUB 는 PROD |
| 2 | `Property__c` 오브젝트(라벨 `매물`, Name = Text `매물명`, OWD Public Read Only = `sharingModel` `Read`, AD-03) | `objects/Property__c/Property__c.object-meta.xml` | |
| 3 | 필드: Address__c Text(255), City__c Text(100), State__c Text(100)(OQ-01 결과 — 미확정 시 생성하고 레이아웃에서 선택), Price__c Currency(12,0) 필수, Bedrooms__c Number(2,0), Bathrooms__c Number(2,0), Picture_URL__c URL, Status__c Picklist 필수·기본값 Available | `fields/*.field-meta.xml` | 라벨 한글(A-04): 판매중/계약중/판매완료 |
| 4 | 페이지 레이아웃: 필수 Name·Price__c·Status__c, 표준 New/Edit/Delete 버튼 | `layouts/Property__c-Property Layout.layout-meta.xml` | D-02(표준 폼) 전제 |
| 5 | 유효성 규칙 `Price_Must_Be_Positive` (가격 > 0, 문구 `가격은 0보다 커야 합니다.`) | `validationRules/` | **CK-05 확정 시에만** — 미확정이면 만들지 않음(AC-061 잠정) |
| 6 | 리스트 뷰 `All`(전체 매물) — 표준 목록 화면용 | `listViews/All.listView-meta.xml` | AC-006/009 진입 |
| 6-1 | `Property__c` 오브젝트 탭(라벨 `매물`) + 두 권한 세트에 `tabSettings` `Property__c` = Visible (ADDED 2026-10-28: I-03) | `tabs/Property__c.tab-meta.xml`, permissionsets | 표준 목록·레코드 페이지 진입점(URL 직접 입력 불필요). 앱 내비게이션 추가는 WI-1.005 |
| 7 | 권한 세트 `DreamHouse_Agent`(Read 전용) / `DreamHouse_Admin`(CRUD + View All + Modify All) | `permissionsets/*.permissionset-meta.xml` | Apex 클래스 권한은 WI-1.003, 앱·탭 권한은 WI-1.005 에서 ENHANCE (ENHANCED 2026-10-28: I-03 — `Property__c` 탭 권한은 WI-1.001(작업 6-1), WI-1.005 는 앱 + `Property_Explorer` 탭만) |
| 8 | Playwright 사용자 3명(agent/admin/noaccess) 생성 정의 — 로케일 ko_KR, 언어 ko, 시간대 Asia/Seoul | `config/users/*-user-def.json` | §4.3.5. 라이선스 수 확인 필요(§12 I-04) |
| 9 | `PropertyTestDataFactory`(SD-01~SD-10 생성, 권한 세트 사용자 생성 헬퍼) + `PropertyModelTest` | `classes/` | AC-001~005, 053 |
| 10 | `WI-1.001-property-crud.spec.ts` (탭 비의존 부분 1차 실행, 나머지 `@explore`) | `tests/e2e/` | AC-006, 009~012, 060 |
| 11 | dry-run → deploy(DH-DEV), 권한 세트 할당, 수동 확인, 커밋 | — | |

### 4.3 주요 타입/API · 코드 예시

#### 4.3.1 작업 1 — KRW 통화·로케일 확인/조정 (D-16 / CK-15)

**전제 사실**
- DH-DEV / DH-SIT / DH-UAT 는 `config/project-scratch-def.json` 으로 만든 Scratch Org 이다. 이 정의에는 `"language": "en_US"` 만 있고 `country`·로캘·통화 지정이 없다 → 기본 통화가 USD, 로캘 en_US 로 만들어졌을 가능성이 높다.
- DH-HUB 는 Developer Edition 이며 Dev Hub·DevOps Center·**PROD** 를 겸한다. 설정 변경은 운영 변경이므로 사람(PM/RM)이 승인한다.
- AC-003 은 `UserInfo.getDefaultCurrency() = 'KRW'`, `isMultiCurrencyOrganization() = false` 를 Apex 로 검증한다. 이 테스트는 실행 오그의 설정에 의존하므로, **DH-HUB 가 KRW 가 아니면 Lab 12 PROD Promotion(Run all tests)에서 실패한다.**

**① 점검 (4개 오그 모두, 읽기 전용)**

```powershell
# scripts/apex/check-org-locale.apex (커밋 가능, 읽기 전용)
#   System.debug('CURRENCY=' + UserInfo.getDefaultCurrency());
#   System.debug('MULTI=' + UserInfo.isMultiCurrencyOrganization());
#   System.debug('LOCALE=' + UserInfo.getLocale() + ' TZ=' + UserInfo.getTimeZone().getID());
foreach ($o in 'DH-DEV','DH-SIT','DH-UAT','DH-HUB') {
  sf apex run --file scripts/apex/check-org-locale.apex -o $o | Select-String 'CURRENCY=|MULTI=|LOCALE='
  sf data query -q "SELECT DefaultLocaleSidKey, LanguageLocaleKey, TimeZoneSidKey FROM Organization" -o $o
}
```

| 오그 | 통화 | 다중 통화 | 조직 로캘 | 시간대 | 조치 필요 |
|---|---|---|---|---|---|
| DH-DEV | (점검) | (점검) | (점검) | (점검) | |
| DH-SIT | | | | | |
| DH-UAT | | | | | |
| DH-HUB (PROD) | | | | | |

**② 조정 — 이미 만들어진 오그 (권장안 A)**

| 순서 | 방법 | 대상 | 상태 |
|---|---|---|---|
| A-1 | Setup → **Company Information → Edit** → `Currency Locale` = `Korean (South Korea) - KRW`, `Default Locale` = `Korean (South Korea)`(ko_KR), `Default Time Zone` = `(GMT+09:00) Korean Standard Time (Asia/Seoul)` → Save | DH-DEV, DH-SIT, DH-UAT | 단일 통화 오그에서 쓰는 표준 화면. 각 오그 UI 에서 실제 항목명 **확인 필요** |
| A-2 | DH-HUB 도 같은 방법. Property 데이터가 아직 없으므로 금액 변환 영향 없음. 단, DevOps Center 화면의 날짜·숫자 표시 형식이 ko_KR 로 바뀐다 | DH-HUB (PROD) | **사람 승인 후** 실행. Lab 12 PROD Promotion 전에 완료 (ENHANCED 2026-10-28: I-08 — **사용자 명시 승인 전에는 실행하지 않으며 자동 변경 계획 없음**. WI-1.001 에서는 ① 점검만 수행, 확인 필요 유지) |
| A-3 | **다중 통화(Multi-Currency)는 켜지 않는다.** 한 번 켜면 끌 수 없고 AC-003(`isMultiCurrencyOrganization() = false`)이 실패한다 | 전체 | 고정 규칙 |
| A-4 | 조정 후 ① 점검을 다시 실행해 `CURRENCY=KRW`, `MULTI=false` 확인 | 전체 | |

- 오그 설정은 메타데이터로 배포하지 않는다(소스 추적 대상 아님). NFR-010 의 "오그 직접 변경 금지" 예외로 보고, 4개 오그의 점검·조정 결과를 WI-1.001 문서와 커밋 메시지 본문에 남겨 추적성을 확보한다.
- `CurrencyIsoCode` 레코드 필드는 다중 통화 오그에서만 생긴다. 단일 통화 오그에서는 레코드 단위 통화 지정이 없으므로 조직 설정(Currency Locale)만 맞추면 된다.

**③ 조정 — 앞으로 새로 만들 Scratch Org (대안 B, 확인 필요)**

```json
// config/project-scratch-def.json — 제안 (WI-1.001 에서 반영, 실제 효과 확인 필요)
{
  "orgName": "DreamHouse Lite",
  "edition": "Developer",
  "country": "KR",
  "language": "en_US",
  "features": ["EnableSetPasswordInApi"],
  "settings": {
    "lightningExperienceSettings": { "enableS1DesktopEnabled": true },
    "mobileSettings": { "enableS1EncryptedStoragePref2": false }
  }
}
```

- `country` 는 Scratch Org 정의에서 쓰는 설정이지만, 이것이 **기본 통화(KRW)·조직 로캘(ko_KR)까지 바꾸는지는 확인 필요**하다. 확인 방법: 테스트용 Scratch Org 1개를 `sf org create scratch -f config/project-scratch-def.json -a DH-TMP -d 1` 로 만들어 ① 점검 스크립트 실행 후 삭제.
- 통화를 직접 지정하는 scratch def 설정(`settings` 안의 메타데이터 설정)은 확인된 것이 없다 → 확인 필요. 효과가 없으면 Scratch Org 생성 직후 A-1 을 수동으로 하는 절차를 README/EXECUTION-PLAN 에 남긴다.
- 기존 DH-DEV/SIT/UAT 를 재생성하는 방식(대안 C)은 DevOps Center 파이프라인 단계 연결·Lab 7 목업 배포를 다시 해야 하므로 **권고하지 않는다**.

**④ Playwright 사용자의 언어** — AC-006/009~012 는 표준 버튼 `새로 만들기`·`편집`·`삭제`·`저장` 을 한글로 찾는다. 조직 기본 언어가 en_US 여도 사용자 언어(`LanguageLocaleKey`)를 `ko` 로 만들면 된다(§4.3.5).

#### 4.3.2 필드 메타데이터

```xml
<!-- objects/Property__c/fields/Price__c.field-meta.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Price__c</fullName>
    <label>가격</label>
    <type>Currency</type>
    <precision>12</precision>
    <scale>0</scale>
    <required>true</required>
    <trackTrending>false</trackTrending>
</CustomField>
```

```xml
<!-- objects/Property__c/fields/Status__c.field-meta.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Status__c</fullName>
    <label>상태</label>
    <type>Picklist</type>
    <required>true</required>
    <valueSet>
        <restricted>true</restricted>
        <valueSetDefinition>
            <sorted>false</sorted>
            <value><fullName>Available</fullName><default>true</default><label>판매중</label></value>
            <value><fullName>Under Contract</fullName><default>false</default><label>계약중</label></value>
            <value><fullName>Sold</fullName><default>false</default><label>판매완료</label></value>
        </valueSetDefinition>
    </valueSet>
</CustomField>
```

```xml
<!-- objects/Property__c/Property__c.object-meta.xml (발췌) -->
<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
    <label>매물</label>
    <pluralLabel>매물</pluralLabel>
    <nameField><label>매물명</label><type>Text</type></nameField>
    <sharingModel>Read</sharingModel>          <!-- Public Read Only (AD-03) -->
    <externalSharingModel>Read</externalSharingModel>
    <deploymentStatus>Deployed</deploymentStatus>
    <enableSearch>true</enableSearch>
</CustomObject>
```

- Bedrooms__c / Bathrooms__c: `<type>Number</type><precision>2</precision><scale>0</scale>` (AC-001 은 DOUBLE 2·0 기대).
- Name 은 표준 Text(80) — AC-001 STRING 80.

#### 4.3.3 권한 세트

```xml
<!-- permissionsets/DreamHouse_Agent.permissionset-meta.xml (발췌) -->
<PermissionSet xmlns="http://soap.sforce.com/2006/04/metadata">
    <label>DreamHouse Agent</label>
    <description>상담원 — Property__c 조회 전용 (OQ-07, D-18)</description>
    <hasActivationRequired>false</hasActivationRequired>
    <objectPermissions>
        <object>Property__c</object>
        <allowRead>true</allowRead>
        <allowCreate>false</allowCreate>
        <allowEdit>false</allowEdit>
        <allowDelete>false</allowDelete>
        <viewAllRecords>false</viewAllRecords>
        <modifyAllRecords>false</modifyAllRecords>
    </objectPermissions>
    <fieldPermissions><field>Property__c.Address__c</field><readable>true</readable><editable>false</editable></fieldPermissions>
    <fieldPermissions><field>Property__c.City__c</field><readable>true</readable><editable>false</editable></fieldPermissions>
    <!-- State__c, Bedrooms__c, Bathrooms__c, Picture_URL__c 동일 -->
    <!-- Price__c·Status__c 는 필수 필드 → fieldPermissions 에 넣으면 배포 오류. 오브젝트 권한으로 제어 -->
    <!-- (WI-1.003 ENHANCE) <classAccesses><apexClass>PropertyController</apexClass><enabled>true</enabled></classAccesses> -->
    <!-- (WI-1.005 ENHANCE) applicationVisibilities DreamHouse_Lite, tabSettings Property__c / Property_Explorer -->
    <!-- (ENHANCED 2026-10-28: I-03) tabSettings Property__c 는 WI-1.001 에서 추가, WI-1.005 는 Property_Explorer 만 추가 -->
    <tabSettings><tab>Property__c</tab><visibility>Visible</visibility></tabSettings>
</PermissionSet>
```

```xml
<!-- permissionsets/DreamHouse_Admin.permissionset-meta.xml (발췌) -->
<objectPermissions>
    <object>Property__c</object>
    <allowRead>true</allowRead><allowCreate>true</allowCreate>
    <allowEdit>true</allowEdit><allowDelete>true</allowDelete>
    <viewAllRecords>true</viewAllRecords>        <!-- Modify All 의 전제 -->
    <modifyAllRecords>true</modifyAllRecords>    <!-- 타인 소유 레코드 수정·삭제 (AD-03) -->
</objectPermissions>
<fieldPermissions><field>Property__c.Address__c</field><readable>true</readable><editable>true</editable></fieldPermissions>
<!-- 나머지 비필수 필드 editable=true -->
```

- 필수 필드(`Price__c`, `Status__c`)의 FLS 는 항상 읽기·편집 가능으로 취급된다. 상담원의 `Status__c.isUpdateable()` 이 AC-004 기대값 `false` 를 돌려주는지는 **확인 필요**(오브젝트 Edit 권한이 없을 때의 describe 결과). `false` 가 아니면 AC-004 해석을 requirements_analyst 와 협의하고, 상담원 상태 변경 불가는 AC-053(USER_MODE DML 거부)으로 보장한다(§12 I-05).

#### 4.3.4 Apex 테스트 (`PropertyModelTest`)

```apex
@IsTest
private class PropertyModelTest {
    @TestSetup
    static void setup() {
        PropertyTestDataFactory.createSampleProperties();          // SD-01~SD-10
        PropertyTestDataFactory.createUserWithPermSet('agent', 'DreamHouse_Agent');
        PropertyTestDataFactory.createUserWithPermSet('admin', 'DreamHouse_Admin');
    }

    @IsTest
    static void ac001_fieldTypes() {
        Map<String, Schema.SObjectField> f = Schema.SObjectType.Property__c.fields.getMap();
        Schema.DescribeFieldResult price = f.get('Price__c').getDescribe();
        Assert.areEqual(Schema.DisplayType.CURRENCY, price.getType());
        Assert.areEqual(12, price.getPrecision());
        Assert.areEqual(0, price.getScale());
        Assert.areEqual(Schema.DisplayType.PICKLIST, f.get('Status__c').getDescribe().getType());
        // Address__c 255, City__c 100, Bedrooms__c/Bathrooms__c DOUBLE, Picture_URL__c URL ...
    }

    @IsTest
    static void ac003_currencyIsKrwSingle() {
        Assert.areEqual('KRW', UserInfo.getDefaultCurrency(), 'D-16: 오그 기본 통화 KRW');
        Assert.isFalse(UserInfo.isMultiCurrencyOrganization());
    }

    @IsTest
    static void ac053_agentDmlDenied() {
        Property__c sd02 = [SELECT Id FROM Property__c WHERE Name = '해운대 오션뷰' LIMIT 1];
        System.runAs(PropertyTestDataFactory.getUser('agent')) {
            try {
                Database.insert(new Property__c(Name = '[E2E] 상담원 등록', Price__c = 100000000), AccessLevel.USER_MODE);
                Assert.fail('상담원 insert 는 거부되어야 한다');
            } catch (Exception e) { /* 기대: 권한 부족 */ }
            // update(Status__c = 'Sold'), delete 도 같은 패턴
        }
        Assert.areEqual('Available', [SELECT Status__c FROM Property__c WHERE Id = :sd02.Id].Status__c);
    }
}
```

#### 4.3.5 Playwright 사용자 정의

```json
// config/users/agent-user-def.json (예시 — 비밀번호·토큰 미포함)
{
  "Username": "agent.dreamhouse@example.invalid",
  "LastName": "Agent",
  "Email": "junghyuck.choi@dkbmc.com",
  "profileName": "Standard User",
  "permsets": ["DreamHouse_Agent"],
  "LocaleSidKey": "ko_KR",
  "LanguageLocaleKey": "ko",
  "TimeZoneSidKey": "Asia/Seoul"
}
```

```powershell
sf org create user --definition-file config/users/agent-user-def.json -o DH-DEV
```

- Username 은 전역 고유여야 하므로 오그별 접미사를 붙인다. 인증 상태 파일 `tests/e2e/.auth/*.json` 은 커밋 금지(AC-067).
- Developer Edition Scratch Org 의 Salesforce 라이선스 수가 3명(+기본 관리자)을 수용하는지 **확인 필요** → 부족하면 상담원·noaccess 를 `Standard Platform User` 프로필(Salesforce Platform 라이선스)로 만든다(§12 I-04).

### 4.4 수락 기준 (AC 연결)

| AC | 검증 가능한 조건 (요약) | 방법 | WI-1.001 판정 범위 |
|---|---|---|---|
| AC-001 | 필드 9개 타입·길이 일치 (Price__c CURRENCY 12·0 등), State__c 는 CK-11 | Apex `ac001_fieldTypes` | 전체 |
| AC-002 | 활성 값 3개, 기본값 Available, Status 미지정 insert → `Available` | Apex | 전체 |
| AC-003 | `getDefaultCurrency()='KRW'`, `isMultiCurrencyOrganization()=false`, 2500000000 저장·조회 일치 | Apex + §4.3.1 점검표 | DH-DEV 전체. SIT/UAT/HUB 는 점검표로 확인, 테스트는 Lab 12 에서 각 오그 실행 |
| AC-004 | 상담원 R=true/C=false/U=false/D=false, Status__c.isUpdateable=false | Apex | 권한 벡터. "조회 10건" 은 WI-1.003 |
| AC-005 | 관리자 USER_MODE insert/update/delete 성공, 이후 COUNT 0 | Apex | 전체 |
| AC-006 | 상담원: 목록 `새로 만들기` 없음, 레코드 `편집`·`삭제`·연필 아이콘 없음, 값 `해운대 오션뷰`·`₩850,000,000` 표시 | Playwright (`agent`) | 전체 (표준 화면만 사용) |
| AC-009 | 관리자 등록 → 성공 토스트, 상태 `판매중`, 가격 `₩1,100,000,000` | Playwright (`admin`) | 표준 화면 부분. 탐색 탭 검색 부분 → WI-1.005 |
| AC-010 | 매물명/가격 누락 시 저장 차단, `[E2E] 필수값%` COUNT 0 | Playwright | 전체 |
| AC-011 | 가격 1050000000·침실 3 수정 저장 | Playwright | 표준 화면 저장 성공까지. 카드 `₩1,050,000,000`·`침실 3 · 욕실 1` → WI-1.005 |
| AC-012 | 삭제 성공 토스트, COUNT 0 | Playwright + SOQL | 표준 화면 부분. `empty-state`·`0건`·`10건` → WI-1.005 |
| AC-053 | 상담원 USER_MODE insert/update/delete 모두 예외, SD-02 불변 | Apex | 전체 |
| AC-060 | 13자리 저장 실패·12자리 저장 성공 | Playwright | 저장 부분. 카드 `₩999,999,999,999` → WI-1.005 |
| AC-061 (잠정) | 가격 0/-1 → `가격은 0보다 커야 합니다.` | Playwright | CK-05 해소 전 완료 조건 제외 |
| AC-067 | 비밀정보 미커밋 | 수동 QA | 전체 |

### 4.5 1차 검증 방법 · 이월

| 구분 | 내용 |
|---|---|
| 1차 검증 | ① §4.3.1 오그 4개 점검표 작성(DH-DEV 는 KRW 조정 완료) ② `sf apex run test -n PropertyModelTest -o DH-DEV -c -r human` 통과 ③ 배포 후 수동 확인: 관리자/상담원으로 표준 목록·레코드 페이지 진입 ④ Playwright `WI-1.001-property-crud.spec.ts --grep-invert @explore` (AC-006, 010 전체 + AC-009/011/012/060 표준 화면 부분) |
| 표준 목록 진입 경로 | ~~`매물` 탭은 PROJECT-PLAN 상 WI-1.005 에서 만든다. WI-1.001 에서는 URL `/lightning/o/Property__c/list?filterName=All` 로 직접 들어간다 — 탭 없이 접근 가능한지 **확인 필요**. 안 되면 `Property__c` 오브젝트 탭 생성만 WI-1.001 로 앞당기는 ENHANCE 를 PM 에 요청(§12 I-03)~~ 앱 런처 → `매물` 오브젝트 탭(`Property__c`, WI-1.001 §4.2 작업 6-1 에서 생성·두 권한 세트 Visible) → 표준 목록·레코드 페이지 (ENHANCED 2026-10-28: 정합성 보정 — 구 문구 취소선, WI-1.001 문서와 일치) (ENHANCED 2026-10-28: I-03 PM 결정 — `매물` 오브젝트 탭을 WI-1.001 작업 6-1 에서 생성. 표준 목록은 `매물` 탭으로 진입하며 URL 직접 입력 방식은 쓰지 않는다) |
| 이월 | AC-004 조회 10건 → WI-1.003 / AC-009·011·012·060 탐색 탭 부분 → WI-1.005 (`@explore`) / AC-003 SIT·UAT·HUB 테스트 실행 → Lab 12 |

### 4.6 테스트

| 종류 | 대상 | AC | 목표 |
|---|---|---|---|
| Apex | `PropertyModelTest` (+ `PropertyTestDataFactory`) | AC-001, 002, 003, 004(권한 벡터), 005, 053 | 실패 0 |
| Playwright | `tests/e2e/WI-1.001-property-crud.spec.ts` (`test.describe.serial` — AC-009→011→012 같은 레코드) | AC-006, 009, 010, 011, 012, 060 (AC-061 잠정 `test.fixme`) | 1차: `@explore` 제외 통과 / 최종: WI-1.005 회귀 |
| 수동 | 오그 점검표, AC-067 | AC-003(오그별), 067 | — |

### 4.7 체크리스트

- [X] 선행 없음 확인, Feature Branch checkout (`WI-000003`)
- [X] **(첫 작업)** DH-DEV/SIT/UAT/HUB 통화·로캘·시간대 점검표 작성 (D-16, CK-15) (2026-10-28: 전부 USD·단일 통화, WI-1.001 문서 §4.1)
- [ ] DH-DEV/SIT/UAT Company Information 조정 → 재점검 `KRW`/`false` (2026-10-28: UI 전용 — 사용자 수동 조정 대기)
- [ ] DH-HUB(PROD) 조정 — 사람 승인 후, Lab 12 전 완료 (ENHANCED 2026-10-28: I-08 — 사용자 명시 승인 없이는 실행 금지, 확인 필요) (2026-10-28: 점검만 완료, 미변경)
- [ ] scratch def `country: "KR"` 효과 확인(임시 오그) → 반영 여부 결정 (확인 필요)
- [X] `Property__c` + 필드 9개, Status 기본값 Available·라벨 판매중/계약중/판매완료, Price Currency(12,0)
- [X] OWD Public Read Only (AD-03)
- [X] 페이지 레이아웃 필수값(Name·Price__c·Status__c), 리스트 뷰 All
- [X] `Property__c` 오브젝트 탭 `매물` + 권한 세트 `tabSettings` Visible (ADDED 2026-10-28: I-03)
- [ ] 유효성 규칙(가격 > 0) — CK-05 확정 시에만 (2026-10-28: CK-05 미확정 → 미생성)
- [X] 권한 세트 `DreamHouse_Agent` / `DreamHouse_Admin` (Modify All)
- [ ] Playwright 사용자 3명(ko / ko_KR / Asia/Seoul), `.auth/` 미커밋
- [ ] `PropertyModelTest` 통과 (AC-001~005, 053) (2026-10-28: 5/6 통과, ac003 KRW 조정 대기)
- [ ] Playwright `WI-1.001-property-crud.spec.ts` 1차(`--grep-invert @explore`) 통과 (Lab 10 미구성 — 대기)
- [ ] 이월 AC §3.4 기록
- [ ] dry-run → deploy (DH-DEV), 커밋 `WI-1.001-property-data-model` (2026-10-28: deploy 완료 0Afgw000000b6x1CAA, 커밋 대기)

---

## 5. WI-1.002 — 샘플 데이터 + Property Tile/Card LWC (GAP)

| 항목 | 내용 |
|---|---|
| Description | 샘플 데이터 플랜(SD-01~SD-10, `sf data import tree --plan`) + **Property Tile/Card LWC** `propertyTile`(사진·대체 이미지, KRW 가격, 주소/도시, 침실·욕실, 상태 색상 배지, 선택 이벤트 발행) + 공통 UX 기반 — REQ-003, REQ-006, REQ-012 |
| 분류 / Man-day | GAP (REQ-003 은 FIT) / 0.3 (2.25h) |
| 선행 / 후행 | WI-1.001 / WI-1.003 |
| 담당 에이전트 | frontend_developer(LWC), backend_developer(데이터 플랜), test_engineer, code_reviewer |
| 일정 | 10-29 13:30–15:45 (Lab 9) |
| 커밋명 | `WI-1.002-sample-data-property-tile` |

### 5.1 AI 프로토타입 → 사람 검증 흐름

1. frontend_developer: Lab 7 목업(정적 LWC)·리뷰 결정(`docs/mockup/reviews/REVIEW-01.md`)을 입력으로 `propertyTile` 초안 생성. 목업 결정이 AC 와 다르면 AC 를 ENHANCE 한 뒤 구현한다.
2. backend_developer(병렬): §1.4 SD 표 → 데이터 플랜 JSON 생성.
3. test_engineer(병렬): Jest + `WI-1.002-property-tile.spec.ts`(전부 `@explore`).
4. 사람: CLI 로 데이터 분포 확인(AC-007), Jest 결과와 AC-020~023 기대값 대조.

### 5.2 세부 작업

| # | 작업 | 산출물 | 비고 |
|---|---|---|---|
| 1 | 데이터 플랜 SD-01~SD-10 (§1.4 값 그대로, SD-09 사진 빈 값, SD-10 깨진 URL) | `data/sample/property-plan.json`, `Property__c.json` | 유효 사진 URL 도메인은 CK-10/OQ-05 |
| 2 | DH-DEV 적재 + 분포 확인(10건, 6/2/2, City 7개) | 결과 붙여 넣기 | AC-007 |
| 3 | 재실행 중복 방지 절차: 적재 전 COUNT 확인 → 0 이 아니면 적재 중단 또는 초기화 스크립트 실행 | `scripts/apex/reset-sample-data.apex`(SIT/UAT 전용), 절차 문서 | AC-008 (SIT/UAT 실행은 Lab 12) |
| 4 | 대체 이미지 정적 리소스 `propertyPlaceholder` (SVG, `width`/`height` 지정 → `naturalWidth > 0`) | `staticresources/propertyPlaceholder.*` | AC-022 |
| 5 | LMS 채널 `PropertySelected__c` (필드 `recordId`) | `messageChannels/PropertySelected.messageChannel-meta.xml` | AD-01 |
| 6 | `propertyTile`: `@api property`, testid 규약, KRW 포맷, 배지 매핑 + `data-status`, 이미지 `onerror` → 대체 이미지, `aria-label`(매물명·가격), 클릭·Enter 시 `PropertySelected__c` 발행 | `lwc/propertyTile/*` | REQ-006, REQ-012 |
| 7 | 공통 UX 기반: SLDS 클래스만 사용, 키보드 포커스(`tabindex="0"`, `role="button"`), 상태 라벨 텍스트로 색상 외 전달 | — | AC-048, 068 기반 |
| 8 | Jest `propertyTile.test.js` | `lwc/propertyTile/__tests__/` | 1차 검증 |
| 9 | Playwright `WI-1.002-property-tile.spec.ts` (AC-020~023, 전부 `@explore`) | `tests/e2e/` | 최종 WI-1.005 |
| 10 | code_reviewer(SLDS·접근성), dry-run → deploy, 커밋 | — | |

### 5.3 주요 타입/API · 코드 예시

```json
// data/sample/property-plan.json
[
  { "sobject": "Property__c", "saveRefs": false, "resolveRefs": false, "files": ["Property__c.json"] }
]
```

```json
// data/sample/Property__c.json (발췌)
{
  "records": [
    {
      "attributes": { "type": "Property__c", "referenceId": "SD01" },
      "Name": "강남 래미안 아파트",
      "Address__c": "서울특별시 강남구 테헤란로 101",
      "City__c": "서울",
      "Price__c": 2500000000,
      "Bedrooms__c": 4,
      "Bathrooms__c": 2,
      "Status__c": "Available",
      "Picture_URL__c": "https://<CK-10 확정 도메인>/sd01.jpg"
    },
    {
      "attributes": { "type": "Property__c", "referenceId": "SD10" },
      "Name": "서면 스카이 빌라", "Address__c": "부산광역시 부산진구 서면로 10", "City__c": "부산",
      "Price__c": 720000000, "Bedrooms__c": 2, "Bathrooms__c": 1, "Status__c": "Available",
      "Picture_URL__c": "https://invalid.example.invalid/none.jpg"
    }
  ]
}
```

```powershell
sf data query -q "SELECT COUNT() FROM Property__c" -o DH-DEV          # 0 이어야 적재
sf data import tree --plan data/sample/property-plan.json -o DH-DEV
sf data query -q "SELECT Status__c, COUNT(Id) FROM Property__c GROUP BY Status__c" -o DH-DEV
```

```xml
<!-- messageChannels/PropertySelected.messageChannel-meta.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<LightningMessageChannel xmlns="http://soap.sforce.com/2006/04/metadata">
    <masterLabel>PropertySelected</masterLabel>
    <isExposed>true</isExposed>
    <description>카드 선택 → 상세 패널 (OQ-10, AD-01)</description>
    <lightningMessageFields>
        <fieldName>recordId</fieldName>
        <description>선택한 Property__c Id</description>
    </lightningMessageFields>
</LightningMessageChannel>
```

```html
<!-- lwc/propertyTile/propertyTile.html -->
<template>
    <article class="slds-card property-card" data-testid="property-card"
             data-id={property.Id} data-name={property.Name}
             tabindex="0" role="button" aria-label={ariaLabel}
             onclick={handleSelect} onkeydown={handleKeydown}>
        <img data-testid="property-card-image" src={imageUrl} alt={property.Name}
             onerror={handleImageError} class="property-card__image" />
        <div class="slds-p-around_small">
            <h3 data-testid="property-card-name" class="slds-text-heading_small slds-truncate">{property.Name}</h3>
            <p data-testid="property-card-price">
                <lightning-formatted-number value={property.Price__c} format-style="currency"
                    currency-code="KRW" currency-display-as="symbol" maximum-fraction-digits="0">
                </lightning-formatted-number>
            </p>
            <p data-testid="property-card-address">{property.Address__c} · {property.City__c}</p>
            <p data-testid="property-card-rooms">{roomsLabel}</p>
            <span data-testid="property-status-badge" class={badgeClass}
                  data-status={property.Status__c}>{statusLabel}</span>
        </div>
    </article>
</template>
```

```js
// lwc/propertyTile/propertyTile.js
import { LightningElement, api, wire } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import PROPERTY_SELECTED from '@salesforce/messageChannel/PropertySelected__c';
import PLACEHOLDER from '@salesforce/resourceUrl/propertyPlaceholder';

const STATUS = {
    Available: { label: '판매중', cls: 'slds-badge slds-theme_success' },
    'Under Contract': { label: '계약중', cls: 'slds-badge slds-theme_warning' },
    Sold: { label: '판매완료', cls: 'slds-badge' } // 회색 기본 배지 (CK-14)
};
const KRW = new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 });

export default class PropertyTile extends LightningElement {
    @api property;
    imageFailed = false;
    @wire(MessageContext) messageContext;

    get imageUrl() {
        return !this.imageFailed && this.property?.Picture_URL__c ? this.property.Picture_URL__c : PLACEHOLDER;
    }
    get statusLabel() { return STATUS[this.property?.Status__c]?.label ?? ''; }
    get badgeClass()  { return STATUS[this.property?.Status__c]?.cls ?? 'slds-badge'; }
    get roomsLabel()  { return `침실 ${this.property?.Bedrooms__c ?? '-'} · 욕실 ${this.property?.Bathrooms__c ?? '-'}`; }
    get ariaLabel()   { return `${this.property?.Name}, ${KRW.format(this.property?.Price__c ?? 0)}`; } // AC-048

    handleImageError() { this.imageFailed = true; }               // AC-022
    handleKeydown(e)   { if (e.key === 'Enter') this.handleSelect(); }
    handleSelect() {
        publish(this.messageContext, PROPERTY_SELECTED, { recordId: this.property.Id });
    }
}
```

- 상태 라벨은 LWC 상수로 두었다(배지 클래스와 같은 곳에서 관리). 선택목록 라벨이 바뀌면 함께 ENHANCE 한다.
- `Intl` 의 `ko-KR` KRW 포맷 결과(`₩` 기호 형태)와 `lightning-formatted-number` 출력이 AC 의 `₩850,000,000` 과 같은 문자인지 Jest/DH-DEV 에서 **확인 필요**(전각 `￦` 와 반각 `₩` 차이 가능, §12 I-06).
- 대안(선택): 타일은 `select` CustomEvent 만 보내고 `propertyList` 가 LMS 로 발행하는 구조. PROJECT-PLAN 체크리스트는 "타일이 발행" 이므로 기본안을 유지한다.

```js
// lwc/propertyTile/__tests__/propertyTile.test.js (발췌)
import { createElement } from 'lwc';
import PropertyTile from 'c/propertyTile';
import { publish } from 'lightning/messageService';

const SD02 = { Id: 'a00000000000002', Name: '해운대 오션뷰', Address__c: '부산광역시 해운대구 해운대해변로 22',
               City__c: '부산', Price__c: 850000000, Bedrooms__c: 3, Bathrooms__c: 2, Status__c: 'Available',
               Picture_URL__c: 'https://example.invalid/sd02.jpg' };

it('AC-020/021 요약·배지', () => {
    const el = createElement('c-property-tile', { is: PropertyTile });
    el.property = SD02;
    document.body.appendChild(el);
    const q = (id) => el.shadowRoot.querySelector(`[data-testid="${id}"]`);
    expect(q('property-card-name').textContent).toBe('해운대 오션뷰');
    expect(q('property-card-rooms').textContent).toBe('침실 3 · 욕실 2');
    expect(q('property-status-badge').dataset.status).toBe('Available');
    expect(q('property-status-badge').classList).toContain('slds-theme_success');
});

it('AC-022 이미지 오류 → propertyPlaceholder', async () => { /* img error 이벤트 dispatch 후 src 확인 */ });
it('AC-026 기반 클릭 → PropertySelected 발행', () => { /* publish 호출 인자 { recordId } 확인 */ });
```

### 5.4 수락 기준 (AC 연결)

| AC | 검증 가능한 조건 (요약) | 1차 검증 (WI-1.002) | 최종 |
|---|---|---|---|
| AC-007 | 10건, Available 6 / Under Contract 2 / Sold 2, City 7개, 값이 §1.4 와 일치 | CLI (DH-DEV) | 완료 |
| AC-008 | SIT/UAT 결과 10행 = DH-DEV, 재실행 시 20건 아님 또는 절차 문서화 | 절차 문서 + DH-DEV 재실행 시 COUNT 확인 | Lab 12 (SIT/UAT) |
| AC-020 | SD-02 카드: 이름·`₩850,000,000`·주소+도시·`침실 3 · 욕실 2`·`판매중`·alt | Jest | WI-1.005 |
| AC-021 | SD-01 `slds-theme_success` / SD-03 `slds-theme_warning` / SD-05 둘 다 없음, 배지 6/2/2 | Jest(클래스·`data-status`) | WI-1.005 |
| AC-022 | SD-09/SD-10 `src` 에 `propertyPlaceholder`, `naturalWidth > 0`, SD-02 는 미포함 | Jest(분기), `naturalWidth` 는 브라우저 필요 | WI-1.005 |
| AC-023 | `₩2,500,000,000`, `₩350,000,000`, 목록에 `억`/`만원`/`$`/`KRW` 없음 | Jest(가능 범위) | WI-1.005 |
| AC-067 | 비밀정보 미커밋 | 수동 QA | 완료 |

### 5.5 1차 검증 방법 · 이월

| 구분 | 내용 |
|---|---|
| 1차 검증 | ① CLI: AC-007 분포 쿼리 결과 ② Jest `propertyTile` 통과(testid·배지·대체 이미지 분기·발행) ③ DH-DEV 배포 성공(컴포넌트·정적 리소스·채널) ④ (선택) Lab 7 목업과 시각 비교 |
| 이월 | AC-020~023 → WI-1.005 (`WI-1.002-property-tile.spec.ts` 전부 `@explore`) / AC-008 SIT·UAT → Lab 12 |

### 5.6 테스트

| 종류 | 대상 | AC |
|---|---|---|
| Jest | `propertyTile.test.js` | AC-020~023(로직), AC-026·048 기반(발행·aria-label) |
| CLI 수동 | 데이터 플랜 적재·분포 | AC-007, 008 |
| Playwright | `tests/e2e/WI-1.002-property-tile.spec.ts` | AC-020, 021, 022, 023 (`@explore`, 최종 WI-1.005) |

### 5.7 체크리스트

- [ ] 선행 WI-1.001 `[X]` 확인
- [ ] 데이터 플랜 SD-01~SD-10 커밋, DH-DEV 적재 → 10건·6/2/2·도시 7개 (AC-007)
- [ ] 재실행 중복 방지 절차·초기화 스크립트 (AC-008)
- [ ] 정적 리소스 `propertyPlaceholder`
- [ ] LMS 채널 `PropertySelected__c`
- [ ] `propertyTile`: testid 규약, KRW 포맷, 배지 매핑 + `data-status`, `aria-label`, 키보드 Enter, 발행
- [ ] `₩` 문자 형태 확인 (확인 필요, I-06)
- [ ] Jest 통과
- [ ] `WI-1.002-property-tile.spec.ts` 작성(`@explore`), §3.4 기록
- [ ] code_reviewer 리뷰(SLDS·접근성), dry-run → deploy, 커밋 `WI-1.002-sample-data-property-tile`

---

## 6. WI-1.003 — Property List LWC + Apex 컨트롤러 (GAP)

| 항목 | 내용 |
|---|---|
| Description | **Property List LWC** `propertyList`(반응형 그리드·건수·빈 결과·스피너·에러 토스트) + **Apex 컨트롤러** `PropertyController.getProperties(PropertyFilter)` 기본 조회(`with sharing`·`WITH USER_MODE`·`cacheable`·LIMIT) + `PropertyControllerTest` + 목록 즉시 갱신(`refreshApex`) — REQ-005, REQ-007, REQ-011, REQ-012 |
| 분류 / Man-day | GAP (REQ-011 은 OQ-11 에 따라 NUD 가능) / 0.5 (3.75h) |
| 선행 / 후행 | WI-1.002 / WI-1.004, WI-1.005 |
| 담당 에이전트 | backend_developer(Apex), frontend_developer(LWC), test_engineer, code_reviewer |
| 일정 | 10-29 15:45–19:30 (Lab 9) — M3 |
| 커밋명 | `WI-1.003-property-list-apex` |

### 6.1 AI 프로토타입 → 사람 검증 흐름

1. backend_developer: `PropertyFilter`·`PropertyController`(기본 조회)·`PropertyControllerTest` 초안. 보안 규칙(`with sharing`, `WITH USER_MODE`, 상수 LIMIT)을 프롬프트에 명시.
2. frontend_developer(병렬): `propertyList` 초안 — `@wire` + 상태(로딩/빈 결과/오류) + `refresh()`.
3. test_engineer(병렬): Jest(`@wire` 모의) + `WI-1.003-property-list.spec.ts`(`@explore`).
4. 사람: Apex 테스트·커버리지·Code Analyzer 결과로 AC 판정, code_reviewer 보안 리뷰.

### 6.2 세부 작업

| # | 작업 | 산출물 | 비고 |
|---|---|---|---|
| 1 | `PropertyFilter` 파라미터 객체(keyword, minPrice, maxPrice, minBedrooms, `@AuraEnabled`) | `classes/PropertyFilter.cls` | NFR-009 |
| 2 | `PropertyController`(`with sharing`) `@AuraEnabled(cacheable=true) getProperties(PropertyFilter)` — 조건 없는 기본 조회, `WITH USER_MODE`, 상수 정렬·LIMIT, 0건 시 빈 List, 접근 거부 시 `AuraHandledException` | `classes/PropertyController.cls` | 정렬·LIMIT 은 CK-06 미확정 → 임시값(`ORDER BY Name`, `LIMIT 200`) 명시 |
| 3 | 권한 세트 2종에 `PropertyController` 클래스 접근 ENHANCE | permissionsets | REQ-002 |
| 4 | `PropertyControllerTest` (`@testSetup` + `PropertyTestDataFactory`, `System.runAs`) | `classes/PropertyControllerTest.cls` | AC-004(조회부), 013, 018, 019, 055, 062(잠정) |
| 5 | `propertyList`: `property-list` 그리드(`lightning-layout multiple-rows`, `size=12 medium-device-size=6 large-device-size=4`), `result-count` `{n}건`, `empty-state`, `loading-spinner`(대체 텍스트 `로딩 중`), 오류 토스트 | `lwc/propertyList/*` | REQ-007, REQ-012 |
| 6 | `refreshApex` 갱신 경로: `@api refresh()` + (WI-1.005 에서 연결할) 갱신 메시지 수신 지점, 탭 재진입 시 갱신 | `propertyList.js` | REQ-011, AC-044 (ENHANCED 2026-10-28: I-02 — WI-1.003 은 `refresh()` 메서드까지만 만든다. `PropertyUpdated__c` 채널 생성·구독 연결은 WI-1.005 §8.2 작업 3·4. WI-1.003 에서 채널을 미리 만들지 않음) |
| 7 | Jest `propertyList.test.js` (`@wire` 모의: 10건/0건/오류) | `__tests__/` | 1차 검증 |
| 8 | Playwright `WI-1.003-property-list.spec.ts` (`@explore`) | `tests/e2e/` | AC-024, 025, 032, 046, 047, 063, 044 |
| 9 | Code Analyzer High 0건, 커버리지 확인, dry-run → deploy, 커밋 | — | AC-065, 066 |

### 6.3 주요 타입/API · 코드 예시

```apex
// classes/PropertyFilter.cls
public with sharing class PropertyFilter {
    @AuraEnabled public String keyword { get; set; }
    @AuraEnabled public Decimal minPrice { get; set; }
    @AuraEnabled public Decimal maxPrice { get; set; }
    @AuraEnabled public Integer minBedrooms { get; set; }
}
```

```apex
// classes/PropertyController.cls — WI-1.003 기본 조회
public with sharing class PropertyController {
    @TestVisible
    private static final Integer MAX_RESULTS = 200; // CK-06/OQ-09 확정 전 임시값

    @AuraEnabled(cacheable=true)
    public static List<Property__c> getProperties(PropertyFilter filter) {
        try {
            return [
                SELECT Id, Name, Address__c, City__c, State__c, Price__c,
                       Bedrooms__c, Bathrooms__c, Picture_URL__c, Status__c
                FROM Property__c
                WITH USER_MODE
                ORDER BY Name          // CK-06 확정 전 임시 정렬 (AC 는 순서 미검증)
                LIMIT :MAX_RESULTS
            ];
        } catch (QueryException e) {   // USER_MODE 접근 거부 (AC-055)
            AuraHandledException ex = new AuraHandledException('매물 정보를 불러오지 못했습니다.');
            ex.setMessage('매물 정보를 불러오지 못했습니다.');
            throw ex;
        }
    }
}
```

- 판매완료 포함 전체 상태 조회(OQ-04, D-17) — 상태 조건 없음.
- `filter` 는 WI-1.003 에서 받기만 하고, 조건은 WI-1.004 에서 확장한다(시그니처를 미리 고정해 LWC 를 다시 만들지 않기 위함).
- `noaccess` 사용자의 예외가 `QueryException` 인지 다른 유형인지는 **확인 필요** → 테스트는 "예외 발생 + 반환 없음" 으로 검증(AC-055 는 두 유형 모두 허용).

```apex
// classes/PropertyControllerTest.cls (발췌)
@IsTest
private class PropertyControllerTest {
    @TestSetup static void setup() {
        PropertyTestDataFactory.createSampleProperties();
        PropertyTestDataFactory.createUserWithPermSet('agent', 'DreamHouse_Agent');
        PropertyTestDataFactory.createUserWithoutPermSet('noaccess');
    }

    @IsTest static void ac013_noFilterReturnsAllIncludingSold() {
        System.runAs(PropertyTestDataFactory.getUser('agent')) {
            List<Property__c> rows = PropertyController.getProperties(new PropertyFilter());
            Assert.areEqual(10, rows.size());
            Integer sold = 0;
            for (Property__c p : rows) { if (p.Status__c == 'Sold') sold++; }
            Assert.areEqual(2, sold);
        }
    }

    @IsTest static void ac055_noAccessUserBlocked() {
        System.runAs(PropertyTestDataFactory.getUser('noaccess')) {
            try {
                PropertyController.getProperties(new PropertyFilter());
                Assert.fail('권한 세트 미할당 사용자는 조회할 수 없어야 한다');
            } catch (AuraHandledException e) {
                Assert.areEqual('매물 정보를 불러오지 못했습니다.', e.getMessage());
            }
        }
    }
    // ac004_agentQueryReturns10, ac018_emptyListNotNull(WI-1.004 키워드 후), ac019_fieldsAccessible,
    // ac062_limit (잠정 — CK-06: MAX_RESULTS + 1 건 생성 후 반환 = MAX_RESULTS)
}
```

```html
<!-- lwc/propertyList/propertyList.html -->
<template>
    <section data-testid="property-list" class="slds-is-relative">
        <p data-testid="result-count" class="slds-text-title">{resultCountLabel}</p>
        <template lwc:if={isLoading}>
            <lightning-spinner data-testid="loading-spinner" alternative-text="로딩 중" size="medium"></lightning-spinner>
        </template>
        <template lwc:if={isEmpty}>
            <p data-testid="empty-state" class="slds-p-around_medium">조건에 맞는 매물이 없습니다.</p>
        </template>
        <lightning-layout multiple-rows>
            <template for:each={properties} for:item="p">
                <lightning-layout-item key={p.Id} size="12" medium-device-size="6" large-device-size="4" padding="around-small">
                    <c-property-tile property={p}></c-property-tile>
                </lightning-layout-item>
            </template>
        </lightning-layout>
    </section>
</template>
```

```js
// lwc/propertyList/propertyList.js (WI-1.003 범위)
import { LightningElement, api, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getProperties from '@salesforce/apex/PropertyController.getProperties';

export default class PropertyList extends LightningElement {
    filter = {};               // WI-1.004 에서 LMS PropertyFilter__c 로 갱신
    properties = [];
    isLoading = true;
    wiredResult;

    @wire(getProperties, { filter: '$filter' })
    wiredProperties(result) {
        this.wiredResult = result;
        const { data, error } = result;
        if (data) {
            this.properties = data;
            this.isLoading = false;
        } else if (error) {
            this.properties = [];
            this.isLoading = false;
            this.dispatchEvent(new ShowToastEvent({ title: '매물 정보를 불러오지 못했습니다.', variant: 'error' }));
        }
    }

    connectedCallback() {
        // AC-044: 탭 재진입 시 cacheable 캐시의 이전 값 방지 — 컴포넌트 재사용 시 동작은 확인 필요
        if (this.wiredResult) this.refresh();
    }

    @api
    async refresh() {           // REQ-011: WI-1.005 저장 성공 시 호출 (ENHANCED 2026-10-28: I-02 — PropertyUpdated__c 구독 핸들러가 호출, §8.3.1)
        this.isLoading = true;
        try { await refreshApex(this.wiredResult); } finally { this.isLoading = false; }
    }

    get resultCountLabel() { return `${this.properties.length}건`; }
    get isEmpty() { return !this.isLoading && this.properties.length === 0; }
}
```

```js
// lwc/propertyList/__tests__/propertyList.test.js (발췌)
import { createElement } from 'lwc';
import PropertyList from 'c/propertyList';
import getProperties from '@salesforce/apex/PropertyController.getProperties';
// sfdx-lwc-jest 의 Apex wire 모의: getProperties.emit(data) / getProperties.error()
it('AC-024 기반 10건 → "10건"', async () => {
    const el = createElement('c-property-list', { is: PropertyList });
    document.body.appendChild(el);
    getProperties.emit(TEN_RECORDS);
    await Promise.resolve();
    expect(el.shadowRoot.querySelector('[data-testid="result-count"]').textContent).toBe('10건');
    expect(el.shadowRoot.querySelectorAll('c-property-tile').length).toBe(10);
});
it('AC-025 기반 0건 → empty-state 문구', async () => { /* emit([]) */ });
it('AC-047 기반 오류 → error 토스트, 스피너 없음', async () => { /* getProperties.error() + ShowToastEvent 리스너 */ });
```

### 6.4 수락 기준 (AC 연결)

| AC | 검증 가능한 조건 (요약) | 1차 검증 (WI-1.003) | 최종 |
|---|---|---|---|
| AC-004 (조회부) | `runAs(agent)` 조건 없음 → 10건 | Apex | 완료 |
| AC-013 | 10건, 6/2/2, Sold 2건 포함 | Apex | 완료 |
| AC-018 | 결과 0건 → `size()=0`, null 아님 | Apex (기본 조회에서 데이터 0건 상황으로 1차, 키워드 `강릉` 은 WI-1.004) | WI-1.004 재확인 |
| AC-019 | SD-01 필드 9개 접근 시 `SObjectException` 없음 | Apex (키워드 대신 Name 으로 찾음) | 완료 |
| AC-055 (Apex) | noaccess → 예외, 반환 없음 | Apex | 완료 (UI 부분은 WI-1.005) |
| AC-062 (잠정) | 반환 = N | Apex | CK-06 해소 후 |
| AC-024 | 초기 진입 카드 10개 `10건`, Sold 포함 | Jest | WI-1.005 |
| AC-025 | `강릉` → 1초 안에 0개 `0건` + 빈 결과 문구 | Jest(0건 분기) | WI-1.005 |
| AC-032 (공동 — 목록·건수 렌더링 부분) | 최소 가격 900000000 → 5건, Sold 2·Under Contract 2, "판매완료 제외" 옵션 없음 | ~~Apex(조건은 WI-1.004)~~ Apex(AC-013 — 상태 조건이 없어 Sold·Under Contract 가 기본 포함됨만 확인). 가격 조건 Apex 검증은 이 WI 범위 아님 → WI-1.004 §7.4 (ENHANCED 2026-10-28: AC-032 공동 매핑, WI-1.003 문서와 일치) | WI-1.005 |
| AC-046 | 1,500ms 지연 중 스피너(대체 텍스트), 응답 후 사라짐 | Jest(로딩 분기) | WI-1.005 |
| AC-047 | 오류 응답 → error 토스트 `매물 정보를 불러오지 못했습니다.`, 스피너 없음 | Jest | WI-1.005 |
| AC-063 | DH-SIT 5회 중앙값 ≤ 1,000ms, 최대 ≤ 1,500ms | — | Lab 12 |
| AC-065 | `with sharing`, `WITH USER_MODE`, 문자열 연결 SOQL 0, 루프 내 SOQL/DML 0, Code Analyzer High 0 | code_reviewer + `sf code-analyzer` | 완료 |
| AC-066 | 실패 0, 조직 ≥ 75%, PropertyController ≥ 85% | `sf apex run test -l RunLocalTests -c -r human` | 완료 |
| AC-067 | 비밀정보 미커밋 | 수동 | 완료 |
| AC-044 (Should) | 표준 페이지에서 상태 변경 후 탭 복귀 시 새 값 | Jest(`refresh` 호출) | WI-1.005 |
| AC-070 (Should) | cacheable·상수 LIMIT·파라미터 객체 (디바운스는 WI-1.004) | code_reviewer | WI-1.004 재확인 |

### 6.5 1차 검증 방법 · 이월

| 구분 | 내용 |
|---|---|
| 1차 검증 | ① `sf apex run test -n PropertyControllerTest,PropertyModelTest -o DH-DEV -c -r human` 통과·커버리지 ② `npm run test:unit -- propertyList` 통과 ③ `sf code-analyzer run --workspace . --view table` High 0건 ④ code_reviewer 보안 리뷰 ⑤ DH-DEV 배포 성공 |
| 이월 | AC-024·025·032·046·047·044 → 필터 입력 로직은 WI-1.004 Jest, E2E 는 WI-1.005 / AC-063 → Lab 12 (DH-SIT) |

### 6.6 테스트

| 종류 | 대상 | AC | 목표 |
|---|---|---|---|
| Apex | `PropertyControllerTest` | AC-004(조회부), 013, 018, 019, 055, 062(잠정) | `PropertyController` 커버리지 ≥ 85% |
| Jest | `propertyList.test.js` | AC-024/025/046/047/044 로직 | 통과 |
| 정적 분석 | Code Analyzer, code_reviewer | AC-065, 070 | High 0건 |
| Playwright | `tests/e2e/WI-1.003-property-list.spec.ts` | AC-024, 025, 032, 044, 046, 047, 063 (`@explore`; AC-063 은 DH-SIT 프로젝트로 분리) | 최종 WI-1.005 / Lab 12 |

### 6.7 체크리스트

- [ ] 선행 WI-1.002 `[X]` 확인
- [ ] `PropertyFilter` 파라미터 객체
- [ ] `PropertyController`(`with sharing`, cacheable, `WITH USER_MODE`, 임시 정렬·LIMIT 명시, 빈 List, 접근 거부 처리)
- [ ] 권한 세트 2종에 Apex 클래스 접근 ENHANCE
- [ ] `PropertyControllerTest` 통과, 커버리지 ≥ 85% 목표 (AC-066)
- [ ] `propertyList`: 반응형 그리드, `result-count`, `empty-state`, `loading-spinner`, 오류 토스트, `refresh()`
- [ ] Jest 통과
- [ ] `WI-1.003-property-list.spec.ts` 작성(`@explore`), §3.4 기록
- [ ] Code Analyzer High 0건 (AC-065)
- [ ] dry-run → deploy, 커밋 `WI-1.003-property-list-apex`

---

## 7. WI-1.004 — 검색 필터 + Apex 조건 확장 (GAP)

| 항목 | 내용 |
|---|---|
| Description | **검색 필터 패널** `propertyFilter`(키워드·최소/최대 가격(원)·최소 침실 수·초기화, 300ms 디바운스, LMS `PropertyFilter__c`) + **Apex 조건 확장**(키워드 Name/City 부분 일치·가격 경계 포함·침실 이상, 바인드 변수) — REQ-008 (+REQ-005 조건, REQ-012) |
| 분류 / Man-day | GAP / 0.35 (2.75h) |
| 선행 / 후행 | WI-1.003 / WI-1.005 |
| 담당 에이전트 | backend_developer(Apex), frontend_developer(LWC), test_engineer, code_reviewer |
| 일정 | 10-30 09:00–11:45 (Lab 9) |
| 커밋명 | `WI-1.004-search-filter` |

### 7.1 AI 프로토타입 → 사람 검증 흐름

1. backend_developer: 조건 확장 + 테스트(AC-014~017, 056, 057). 입력은 바인드 변수로만 SOQL 에 들어가야 한다는 규칙을 프롬프트에 명시.
2. frontend_developer(병렬): `propertyFilter` + `propertyList` LMS 구독.
3. test_engineer(병렬): Jest(가짜 타이머 디바운스) + `WI-1.004-search-filter.spec.ts`(`@explore`).
4. 사람: §1.4 기대값 계산표와 Apex 결과 대조, 인젝션 케이스 확인.

### 7.2 세부 작업

| # | 작업 | 산출물 | 비고 |
|---|---|---|---|
| 1 | Apex 조건: 키워드 Name/City__c 부분 일치(`LIKE :keywordLike`), 가격 `>= :minPrice` / `<= :maxPrice`, `Bedrooms__c >= :minBedrooms`, 공백 키워드 trim → 조건 미적용(CK-04 잠정) | `PropertyController.cls` | 사용자 입력 문자열 연결 금지 |
| 2 | `PropertyControllerTest` 확장 | AC-014~017, 018(`강릉`), 056, 057(잠정) | §1.4 계산표 |
| 3 | LMS 채널 `PropertyFilter__c` (필드 `keyword`, `minPrice`, `maxPrice`, `minBedrooms`) | `messageChannels/PropertyFilter.messageChannel-meta.xml` | |
| 4 | `propertyFilter`: `filter-panel`, 라벨 `키워드`/`최소 가격`/`최대 가격`/`최소 침실 수`, 침실 선택지 `전체`~`5개 이상`(0~5), 300ms 디바운스 발행, `filter-reset`, 숫자 입력 `min="0"`(음수 → `aria-invalid`, 발행 안 함), min > max 처리(CK-03 확정 시 `filter-price-error`) | `lwc/propertyFilter/*` | REQ-008, REQ-012 |
| 5 | `propertyList` 가 `PropertyFilter__c` 구독 → `this.filter = { ...message }` (새 객체로 바꿔 `@wire` 재호출), 로딩 표시 | `propertyList.js` ENHANCE | |
| 6 | Jest: 디바운스(300ms 안 연속 입력 → 발행 1회), 초기화, 음수 차단, 구독 → 필터 반영 | `__tests__/` | |
| 7 | Playwright `WI-1.004-search-filter.spec.ts` (`@explore`) | `tests/e2e/` | AC-027~034, 057~059, 064 |
| 8 | AC-065·066·070 재확인, dry-run → deploy, 커밋 | — | |

### 7.3 주요 타입/API · 코드 예시

```apex
// classes/PropertyController.cls — WI-1.004 조건 확장 (WHERE 절은 상수 조각만 조합, 값은 모두 바인드)
@AuraEnabled(cacheable=true)
public static List<Property__c> getProperties(PropertyFilter filter) {
    PropertyFilter f = (filter == null) ? new PropertyFilter() : filter;
    List<String> where = new List<String>();
    Map<String, Object> binds = new Map<String, Object>{ 'maxResults' => MAX_RESULTS };

    String keyword = String.isBlank(f.keyword) ? null : f.keyword.trim();   // CK-04 (잠정)
    if (keyword != null) {
        where.add('(Name LIKE :keywordLike OR City__c LIKE :keywordLike)');
        binds.put('keywordLike', '%' + keyword + '%');   // 값은 바인드로만 전달 (AC-056)
    }
    if (f.minPrice != null)    { where.add('Price__c >= :minPrice');       binds.put('minPrice', f.minPrice); }
    if (f.maxPrice != null)    { where.add('Price__c <= :maxPrice');       binds.put('maxPrice', f.maxPrice); }
    if (f.minBedrooms != null && f.minBedrooms > 0) {
        where.add('Bedrooms__c >= :minBedrooms');  binds.put('minBedrooms', f.minBedrooms);
    }

    String soql = 'SELECT Id, Name, Address__c, City__c, State__c, Price__c, Bedrooms__c, Bathrooms__c, '
                + 'Picture_URL__c, Status__c FROM Property__c'
                + (where.isEmpty() ? '' : ' WHERE ' + String.join(where, ' AND '))
                + ' ORDER BY Name LIMIT :maxResults';
    try {
        return Database.queryWithBinds(soql, binds, AccessLevel.USER_MODE);
    } catch (QueryException e) {
        AuraHandledException ex = new AuraHandledException('매물 정보를 불러오지 못했습니다.');
        ex.setMessage('매물 정보를 불러오지 못했습니다.');
        throw ex;
    }
}
```

- 동적 SOQL 은 `Database.queryWithBinds(..., AccessLevel.USER_MODE)` 로 실행한다. AC-065 는 `WITH USER_MODE` 또는 `AccessLevel.USER_MODE` 를 모두 허용한다. 문자열 안에 `WITH USER_MODE` 를 함께 넣는 방식이 `AccessLevel.USER_MODE` 와 충돌 없이 동작하는지는 **확인 필요** — 기본안은 `AccessLevel.USER_MODE` 하나만 쓰는 것이다.
- 대안(정적 SOQL): 조건이 4개로 고정되어 있으므로 `WITH USER_MODE` 정적 SOQL 에 기본값 바인드(`keywordLike='%'`, `maxPrice=999999999999`)를 쓰는 방법도 있다. 단, `Bedrooms__c` 가 null 인 레코드 처리 때문에 식이 복잡해져 기본안으로 채택하지 않는다.
- Code Analyzer 가 동적 SOQL 을 `ApexSOQLInjection` 으로 표시하면, WHERE 조각이 상수뿐이라는 근거를 code_reviewer 메모에 남긴다(High 이상이면 정적 SOQL 대안으로 전환).

```xml
<!-- messageChannels/PropertyFilter.messageChannel-meta.xml -->
<LightningMessageChannel xmlns="http://soap.sforce.com/2006/04/metadata">
    <masterLabel>PropertyFilter</masterLabel>
    <isExposed>true</isExposed>
    <description>필터 패널 → 목록 (REQ-008, NFR-009)</description>
    <lightningMessageFields><fieldName>keyword</fieldName></lightningMessageFields>
    <lightningMessageFields><fieldName>minPrice</fieldName></lightningMessageFields>
    <lightningMessageFields><fieldName>maxPrice</fieldName></lightningMessageFields>
    <lightningMessageFields><fieldName>minBedrooms</fieldName></lightningMessageFields>
</LightningMessageChannel>
```

```html
<!-- lwc/propertyFilter/propertyFilter.html (발췌) -->
<template>
    <div data-testid="filter-panel" class="slds-p-around_small">
        <lightning-input data-testid="filter-keyword" label="키워드" type="search"
                         value={keyword} onchange={handleKeyword}></lightning-input>
        <lightning-input data-testid="filter-min-price" label="최소 가격" type="number" min="0" step="1"
                         value={minPrice} onchange={handleMinPrice}></lightning-input>
        <lightning-input data-testid="filter-max-price" label="최대 가격" type="number" min="0" step="1"
                         value={maxPrice} onchange={handleMaxPrice}></lightning-input>
        <lightning-combobox data-testid="filter-min-bedrooms" label="최소 침실 수" value={minBedrooms}
                            options={bedroomOptions} onchange={handleBedrooms}></lightning-combobox>
        <lightning-button data-testid="filter-reset" label="초기화" onclick={handleReset}></lightning-button>
    </div>
</template>
```

```js
// lwc/propertyFilter/propertyFilter.js (발췌)
import { LightningElement, wire } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import PROPERTY_FILTER from '@salesforce/messageChannel/PropertyFilter__c';
const DEBOUNCE_MS = 300;   // NFR-002, AC-034/070

export default class PropertyFilter extends LightningElement {
    keyword = ''; minPrice = ''; maxPrice = ''; minBedrooms = '0';
    bedroomOptions = [
        { label: '전체', value: '0' }, { label: '1개 이상', value: '1' }, { label: '2개 이상', value: '2' },
        { label: '3개 이상', value: '3' }, { label: '4개 이상', value: '4' }, { label: '5개 이상', value: '5' }
    ];
    @wire(MessageContext) messageContext;
    timer;

    handleKeyword(e)  { this.keyword = e.target.value; this.schedule(); }
    handleMinPrice(e) { if (this.isValid(e.target)) { this.minPrice = e.target.value; this.schedule(); } }
    handleMaxPrice(e) { if (this.isValid(e.target)) { this.maxPrice = e.target.value; this.schedule(); } }
    handleBedrooms(e) { this.minBedrooms = e.detail.value; this.schedule(); }
    handleReset() {
        this.keyword = ''; this.minPrice = ''; this.maxPrice = ''; this.minBedrooms = '0';
        this.publishNow();                                      // AC-033
    }
    isValid(input) { return input.reportValidity(); }           // 음수 → aria-invalid, 발행 안 함 (AC-059)
    schedule() {
        clearTimeout(this.timer);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.timer = setTimeout(() => this.publishNow(), DEBOUNCE_MS);
    }
    publishNow() {
        publish(this.messageContext, PROPERTY_FILTER, {
            keyword: this.keyword || null,
            minPrice: this.minPrice === '' ? null : Number(this.minPrice),
            maxPrice: this.maxPrice === '' ? null : Number(this.maxPrice),
            minBedrooms: Number(this.minBedrooms) || null
        });
    }
}
```

```js
// lwc/propertyList/propertyList.js — WI-1.004 ENHANCE (구독)
import { subscribe, unsubscribe, MessageContext } from 'lightning/messageService';
import PROPERTY_FILTER from '@salesforce/messageChannel/PropertyFilter__c';
// ...
@wire(MessageContext) messageContext;
subscription;
connectedCallback() {
    this.subscription = subscribe(this.messageContext, PROPERTY_FILTER, (msg) => {
        this.isLoading = true;
        this.filter = { ...msg };     // 새 객체 → @wire 재호출
    });
}
disconnectedCallback() { unsubscribe(this.subscription); this.subscription = null; }
```

- min > max(AC-058, CK-03): 확정 전에는 구현하지 않는다(기본 동작: 서버 조건 그대로 → 0건). 확정 시 `filter-price-error` 문구 `최소 가격이 최대 가격보다 클 수 없습니다.` + 0건 표시.

### 7.4 수락 기준 (AC 연결)

| AC | 검증 가능한 조건 (요약) | 1차 검증 (WI-1.004) | 최종 |
|---|---|---|---|
| AC-014 | `래미안` 1 / `부산` 2 / `센트럴` 2 / `강남구` 0 | Apex | 완료 |
| AC-015 | (a) 4건 (b) 1건 (c) 6건 (d) 4건 | Apex | 완료 |
| AC-016 | 침실 3 → 7, 4 → 3, 6 → 0 | Apex | 완료 |
| AC-017 | (a) 1건 SD-08 Sold (b) 3건 | Apex | 완료 |
| AC-056 | 인젝션 문자열 2종 → 예외 없이 0건 | Apex | 완료 |
| AC-057 (잠정) | `''`·`'   '` → 10건 | Apex(CK-04 해소 전 제외) | UI 부분 WI-1.005 |
| AC-027 | `서울` 입력 1,300ms 안에 3개 `3건` | Jest(디바운스 → 발행 인자) | WI-1.005 |
| AC-028 | 최대 1000000000 → 6개 | Apex(AC-015c) + Jest | WI-1.005 |
| AC-029 | (a) 4개 (b) 1개 | Apex + Jest | WI-1.005 |
| AC-030 | `3개 이상` 7개, `4개 이상` 3개 | Apex + Jest(선택지 값) | WI-1.005 |
| AC-031 | 3 → 2 → 1건, SD-08 `판매완료` | Apex(AC-017a) | WI-1.005 |
| AC-032 (공동 — 가격 조건 부분) | 최소 900000000 → 5건, Sold 2 | Apex(가격 조건 — 이 WI 소유분. 목록·건수 렌더링은 WI-1.003) (ENHANCED 2026-10-28: AC-032 공동 매핑) | WI-1.005 |
| AC-033 | 초기화 → 입력값 빈 값·`전체`, 10건 | Jest | WI-1.005 |
| AC-059 | `-100` → `aria-invalid`, 10건 유지 / `abc` 입력 안 됨 | Jest(`reportValidity` 모의, 발행 안 함) | WI-1.005 |
| AC-064 | DH-SIT 응답 중앙값 ≤ 1,000ms, 반영 ≤ 1,300ms | — | Lab 12 |
| AC-065, 066 | 보안 규칙·커버리지 재확인 | code_reviewer, Code Analyzer, Apex | 완료 |
| AC-067 | 비밀정보 미커밋 | 수동 | 완료 |
| AC-034 (Should) | `송파 잠실` 50ms 간격 입력 → 요청 1회(최대 2회) | Jest(가짜 타이머 → 발행 1회) | WI-1.005 |
| AC-070 (Should) | 디바운스 300ms(±50) + cacheable + LIMIT + 파라미터 객체 | code_reviewer | 완료 |
| AC-058 (잠정) | min > max → `filter-price-error` + 0건 | CK-03 해소 후 | WI-1.005 |

### 7.5 1차 검증 방법 · 이월

| 구분 | 내용 |
|---|---|
| 1차 검증 | ① `PropertyControllerTest` 확장분 통과(§1.4 계산표 값) ② Jest `propertyFilter`·`propertyList`(구독) 통과 ③ Code Analyzer High 0건 + code_reviewer(바인드·디바운스) ④ DH-DEV 배포 성공 |
| 이월 | AC-027~034, 059, 058·057 UI(잠정) → WI-1.005 (`WI-1.004-search-filter.spec.ts` `@explore`) / WI-1.003 에서 넘어온 AC-025·032·046·047 은 필터 입력 로직을 여기서 Jest 로 1차 확인하고 E2E 는 WI-1.005 / AC-064 → Lab 12 |
| Jest 한계 | `lightning-input` 은 Jest 에서 스텁이라 실제 `aria-invalid`·숫자 입력 차단은 확인할 수 없다 → AC-059 는 WI-1.005 Playwright 가 최종 근거 |

### 7.6 테스트

| 종류 | 대상 | AC |
|---|---|---|
| Apex | `PropertyControllerTest` 확장 | AC-014, 015, 016, 017, 018, 056, 057(잠정) |
| Jest | `propertyFilter.test.js`, `propertyList.test.js`(구독) | AC-027, 033, 034, 059 로직 |
| 정적 분석 | Code Analyzer, code_reviewer | AC-065, 070 |
| Playwright | `tests/e2e/WI-1.004-search-filter.spec.ts` | AC-027~034, 057, 058, 059, 064 (`@explore`, AC-057/058 잠정은 `test.fixme`) |

### 7.7 체크리스트

- [ ] 선행 WI-1.003 `[X]` 확인
- [ ] Apex 조건(키워드 Name/City 부분 일치·가격 경계 포함·침실 이상, 바인드 변수, 공백 trim)
- [ ] `PropertyControllerTest` 확장 통과 (AC-014~017, 056)
- [ ] LMS 채널 `PropertyFilter__c`
- [ ] `propertyFilter`: 라벨 4종, 침실 선택지 `전체`~`5개 이상`, 300ms 디바운스, `filter-reset`, 음수·비숫자 차단
- [ ] min > max 처리 — CK-03 확정 시에만
- [ ] `propertyList` LMS 구독
- [ ] Jest 통과
- [ ] `WI-1.004-search-filter.spec.ts` 작성(`@explore`), §3.4 기록
- [ ] AC-065·066·070 재확인, dry-run → deploy, 커밋 `WI-1.004-search-filter`

---

## 8. WI-1.005 — 상세 패널 + Lightning App Page (GAP)

| 항목 | 내용 |
|---|---|
| Description | **상세 패널** `propertyDetail`(LMS `PropertySelected__c` 구독, 큰 사진 + 전체 속성, 관리자 전용 편집·상태 변경, 저장 후 카드·배지·상세 즉시 반영) + **DreamHouse Lite 앱·Lightning App Page** "매물 탐색"(좌 필터 + 중앙 그리드 + 우 상세) + 앱/탭 권한 보강 — REQ-009, REQ-010, REQ-011, REQ-012 |
| 분류 / Man-day | GAP (REQ-010 은 FIT) / 0.35 (2.75h) |
| 선행 / 후행 | WI-1.003, WI-1.004 / WI-1.006, WI-1.007 |
| 담당 에이전트 | frontend_developer(LWC·App Page), backend_developer(앱·탭·권한 세트), test_engineer(전체 UI 회귀), code_reviewer |
| 일정 | 10-30 11:45–14:30 (Lab 9) — M4. 전체 회귀는 Lab 10(14:30–15:30)과 이어서 실행 |
| 커밋명 | `WI-1.005-property-detail-app-page` |

### 8.1 AI 프로토타입 → 사람 검증 흐름

1. frontend_developer: `propertyDetail` 초안 + App Page 배치. backend_developer(병렬): 앱·탭·권한 세트 ENHANCE.
2. test_engineer(병렬): `WI-1.005-property-detail.spec.ts`, `WI-1.005-layout-a11y.spec.ts` 작성, 이전 WI spec 의 `@explore` 테스트 실행 준비.
3. 사람: DH-DEV 배포 → **전체 Playwright 회귀**(`npx playwright test`) → 실패 AC 를 원인 WI 로 분류(§3.3-3) → 수정 → 재실행.

### 8.2 세부 작업

| # | 작업 | 산출물 | 비고 |
|---|---|---|---|
| 1 | `propertyDetail`: `PropertySelected__c` 구독, `detail-empty` 초기 문구, `getRecord`(LDS) 로 전체 속성·큰 사진·대체 이미지, testid 규약, 상태 배지(타일과 같은 매핑) | `lwc/propertyDetail/*` | REQ-009 |
| 2 | 관리자 전용 편집: `getObjectInfo` 의 `updateable` 이 true 일 때만 `detail-edit-button` 렌더 → `lightning-record-edit-form`(`detail-edit-form`, Status = `detail-status-input`, `detail-save-button`) | 같은 컴포넌트 | 상담원 0개(AC-054). 표준 Edit 모달 대안은 AC 문서 §1.6 비고 |
| 3 | 저장 성공 시 `notifyRecordUpdateAvailable([{recordId}])` + 목록 갱신 신호 발행 → `propertyList.refresh()` | `propertyDetail.js`, `propertyList.js` | REQ-011, 같은 사용자 화면(D-12/OQ-11) (ENHANCED 2026-10-28: I-02 — 저장·상태 변경 성공 후 `PropertyUpdated__c` 발행, `propertyList` 가 구독해 `refreshApex` 호출(§8.3.1). AC-042·043 근거) |
| 4 | 목록 갱신 신호용 LMS 채널 `PropertyUpdated__c` (필드 `recordId`) — **(제안)** | `messageChannels/PropertyUpdated.messageChannel-meta.xml` | PROJECT-PLAN 에 없는 메타데이터 → §12 I-02 (ENHANCED 2026-10-28: I-02 PM 승인 — **확정**. 채널 메타데이터 소유 WI = WI-1.005, PROJECT-PLAN v1.1 §5.2 에 ADD) |
| 5 | Lightning 앱 `DreamHouse_Lite`(라벨 `DreamHouse Lite`, 내비게이션 `매물 탐색`·`매물`) | `applications/DreamHouse_Lite.app-meta.xml` | REQ-010 |
| 6 | App Page `Property_Explorer`(라벨 `매물 탐색`) — 좌 `propertyFilter` / 중앙 `propertyList` / 우 `propertyDetail` | `flexipages/Property_Explorer.flexipage-meta.xml` | 템플릿·반응형은 §8.3.3 |
| 7 | 탭: `Property_Explorer`(App Page 탭), `Property__c`(오브젝트 탭 `매물`) | `tabs/*` | WI-1.001 로 앞당겼으면 앱 내비게이션에만 추가 (ENHANCED 2026-10-28: I-03 — `Property__c` 탭은 WI-1.001 에서 생성됨. WI-1.005 는 `Property_Explorer` 탭만 생성하고 `Property__c` 는 앱 내비게이션에 추가) |
| 8 | 권한 세트 ENHANCE: `applicationVisibilities`(DreamHouse_Lite), `tabSettings`(두 탭 Visible). `noaccess` 는 앱 미노출(AC-055 UI) | permissionsets | REQ-002 (ENHANCED 2026-10-28: I-03 — `tabSettings` 는 `Property_Explorer` 만 추가, `Property__c` 는 WI-1.001 에서 이미 Visible) |
| 9 | Jest `propertyDetail.test.js`(미선택·선택·관리자/상담원 분기·저장 후 발행) | `__tests__/` | (ENHANCED 2026-10-28: I-02 — `propertyList.test.js` 에 `PropertyUpdated__c` 수신 → `refreshApex` 호출 케이스 추가) |
| 10 | Playwright `WI-1.005-property-detail.spec.ts`, `WI-1.005-layout-a11y.spec.ts` | `tests/e2e/` | |
| 11 | **전체 UI 회귀**: §3.4 의 모든 `@explore` 테스트 + WI-1.005 spec | 결과표 | 실패 시 원인 WI 수정 |
| 12 | code_reviewer, dry-run → deploy, 커밋 | — | |

### 8.3 주요 타입/API · 코드 예시

#### 8.3.1 propertyDetail

```js
// lwc/propertyDetail/propertyDetail.js (발췌)
import { LightningElement, wire } from 'lwc';
import { subscribe, unsubscribe, publish, MessageContext } from 'lightning/messageService';
import { getRecord, getFieldValue, notifyRecordUpdateAvailable } from 'lightning/uiRecordApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import PROPERTY_SELECTED from '@salesforce/messageChannel/PropertySelected__c';
import PROPERTY_UPDATED from '@salesforce/messageChannel/PropertyUpdated__c';   // (제안) I-02 → (ENHANCED 2026-10-28: 확정, WI-1.005 생성)
import PROPERTY_OBJECT from '@salesforce/schema/Property__c';
import NAME from '@salesforce/schema/Property__c.Name';
import PRICE from '@salesforce/schema/Property__c.Price__c';
import STATUS from '@salesforce/schema/Property__c.Status__c';
// Address__c, City__c, State__c, Bedrooms__c, Bathrooms__c, Picture_URL__c 동일

const FIELDS = [NAME, PRICE, STATUS /* ... */];

export default class PropertyDetail extends LightningElement {
    recordId;
    isEditing = false;
    canEdit = false;
    @wire(MessageContext) messageContext;

    @wire(getObjectInfo, { objectApiName: PROPERTY_OBJECT })
    objectInfo({ data }) { this.canEdit = data?.updateable === true; }   // 상담원 false (AC-054)

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    record;

    connectedCallback() {
        this.sub = subscribe(this.messageContext, PROPERTY_SELECTED, (m) => {
            this.recordId = m.recordId;      // URL 변경 없음 (AC-026, 035)
            this.isEditing = false;
        });
    }
    disconnectedCallback() { unsubscribe(this.sub); }

    get hasSelection() { return !!this.recordId; }
    get name() { return getFieldValue(this.record.data, NAME); }

    handleEdit() { this.isEditing = true; }
    async handleSuccess() {                  // lightning-record-edit-form onsuccess
        this.isEditing = false;
        await notifyRecordUpdateAvailable([{ recordId: this.recordId }]);   // 상세 갱신
        publish(this.messageContext, PROPERTY_UPDATED, { recordId: this.recordId }); // 목록 refreshApex
        this.dispatchEvent(new ShowToastEvent({ title: '저장되었습니다.', variant: 'success' }));
    }
}
```

```html
<!-- lwc/propertyDetail/propertyDetail.html (발췌) -->
<template>
    <section data-testid="property-detail" class="slds-card slds-p-around_medium">
        <template lwc:if={hasSelection}>
            <img data-testid="detail-image" src={imageUrl} alt={name} onerror={handleImageError} class="detail-image" />
            <h2 data-testid="detail-name" class="slds-text-heading_medium">{name}</h2>
            <dl class="slds-dl_horizontal">
                <dt>주소</dt><dd data-testid="detail-address">{address}</dd>
                <dt>도시</dt><dd data-testid="detail-city">{city}</dd>
                <dt>가격</dt><dd data-testid="detail-price"><lightning-formatted-number value={price}
                    format-style="currency" currency-code="KRW" maximum-fraction-digits="0"></lightning-formatted-number></dd>
                <dt>침실</dt><dd data-testid="detail-bedrooms">{bedrooms}</dd>
                <dt>욕실</dt><dd data-testid="detail-bathrooms">{bathrooms}</dd>
            </dl>
            <span data-testid="detail-status-badge" class={badgeClass} data-status={status}>{statusLabel}</span>
            <template lwc:if={canEdit}>
                <lightning-button data-testid="detail-edit-button" label="편집" onclick={handleEdit}></lightning-button>
            </template>
            <template lwc:if={isEditing}>
                <lightning-record-edit-form data-testid="detail-edit-form" object-api-name="Property__c"
                                            record-id={recordId} onsuccess={handleSuccess}>
                    <lightning-input-field field-name="Name"></lightning-input-field>
                    <lightning-input-field field-name="Price__c"></lightning-input-field>
                    <lightning-input-field data-testid="detail-status-input" field-name="Status__c"></lightning-input-field>
                    <lightning-button data-testid="detail-save-button" type="submit" label="저장" variant="brand"></lightning-button>
                </lightning-record-edit-form>
            </template>
        </template>
        <template lwc:else>
            <p data-testid="detail-empty">매물을 선택하면 상세 정보가 표시됩니다.</p>
        </template>
    </section>
</template>
```

- 값 요소와 라벨을 나눠 `detail-price` = `₩1,650,000,000` 처럼 텍스트가 정확히 일치하게 한다(`lightning-output-field` 는 라벨이 함께 렌더링되므로 기본안에서 제외).
- 상태 배지 매핑·대체 이미지 로직은 타일과 같다. 중복을 피하려면 공용 모듈 `c/propertyUtils`(STATUS 맵·KRW 포맷)로 분리한다(code_reviewer 판단).
- `lightning-input-field` 의 Status 콤보박스를 Playwright 에서 고르는 셀렉터는 test_engineer 와 협의(`getByTestId('detail-status-input').getByRole('combobox')` 등).

**`PropertyUpdated__c` 채널과 목록 구독** (ADDED 2026-10-28: I-02 PM 승인 — 채널·구독 모두 WI-1.005)

```xml
<!-- messageChannels/PropertyUpdated.messageChannel-meta.xml (WI-1.005) -->
<?xml version="1.0" encoding="UTF-8"?>
<LightningMessageChannel xmlns="http://soap.sforce.com/2006/04/metadata">
    <masterLabel>PropertyUpdated</masterLabel>
    <isExposed>true</isExposed>
    <description>상세 패널 저장·상태 변경 성공 → 목록 refreshApex (REQ-011, I-02)</description>
    <lightningMessageFields>
        <fieldName>recordId</fieldName>
        <description>저장된 Property__c Id</description>
    </lightningMessageFields>
</LightningMessageChannel>
```

```js
// lwc/propertyList/propertyList.js — WI-1.005 ENHANCE (PropertyUpdated__c 구독, WI-1.004 의 PropertyFilter__c 구독에 추가)
import PROPERTY_UPDATED from '@salesforce/messageChannel/PropertyUpdated__c';
// ...
updatedSubscription;
connectedCallback() {
    // (WI-1.004) PropertyFilter__c 구독 유지
    this.updatedSubscription = subscribe(this.messageContext, PROPERTY_UPDATED, () => this.refresh()); // AC-042, 043
}
disconnectedCallback() {
    unsubscribe(this.subscription);        this.subscription = null;
    unsubscribe(this.updatedSubscription); this.updatedSubscription = null;
}
```

- `refresh()` 는 현재 `filter` 를 유지한 채 `refreshApex(this.wiredResult)` 만 다시 호출하므로 AC-043(필터값 유지·`대전` 1건 유지)과 AC-042(`10건` 유지·`window.__noReload`)를 함께 만족한다.
- 상세는 `notifyRecordUpdateAvailable` 로, 카드·배지·건수는 `PropertyUpdated__c` → `refreshApex` 로 갱신한다(두 경로 모두 페이지 새로고침 없음).

#### 8.3.2 카드 → 상세 선택 전달 (LMS vs 부모 상태)

| 안 | 구조 | 장점 | 단점 | 채택 |
|---|---|---|---|---|
| A. LMS (AD-01) | App Page 에 형제로 배치, `PropertySelected__c` / `PropertyFilter__c` / `PropertyUpdated__c`(제안 → ENHANCED 2026-10-28: I-02 확정) | App Builder 로 배치 변경 가능(REQ-010 FIT), 느슨한 결합(NFR-009) | 채널 메타데이터 3개 | **기본안** |
| B. 부모 상태 | 컨테이너 LWC `propertyExplorer` 가 필터·목록·상세를 자식으로 두고 `@api` 속성/CustomEvent 로 전달 | 반응형 레이아웃을 LWC 로 완전히 통제(AC-045), 채널 불필요 | App Builder 배치 자유도 감소, 컨테이너 공수 추가 | §8.3.3 반응형 확인 결과 템플릿이 모바일 폭에서 세로로 쌓이지 않으면 전환 |

#### 8.3.3 App Page · 앱 · 탭

```xml
<!-- flexipages/Property_Explorer.flexipage-meta.xml (발췌) -->
<FlexiPage xmlns="http://soap.sforce.com/2006/04/metadata">
    <masterLabel>매물 탐색</masterLabel>
    <type>AppPage</type>
    <template><name>flexipage:appHomeTemplateThreeColumns</name></template>   <!-- 템플릿명 확인 필요 -->
    <flexiPageRegions>
        <name>region1</name><type>Region</type>
        <itemInstances><componentInstance><componentName>propertyFilter</componentName></componentInstance></itemInstances>
    </flexiPageRegions>
    <flexiPageRegions>
        <name>region2</name><type>Region</type>
        <itemInstances><componentInstance><componentName>propertyList</componentName></componentInstance></itemInstances>
    </flexiPageRegions>
    <flexiPageRegions>
        <name>region3</name><type>Region</type>
        <itemInstances><componentInstance><componentName>propertyDetail</componentName></componentInstance></itemInstances>
    </flexiPageRegions>
</FlexiPage>
```

```xml
<!-- applications/DreamHouse_Lite.app-meta.xml (발췌) -->
<CustomApplication xmlns="http://soap.sforce.com/2006/04/metadata">
    <label>DreamHouse Lite</label>
    <navType>Standard</navType>
    <uiType>Lightning</uiType>
    <formFactors>Large</formFactors>
    <formFactors>Small</formFactors>
    <tabs>Property_Explorer</tabs>
    <tabs>Property__c</tabs>
</CustomApplication>
```

```xml
<!-- tabs/Property_Explorer.tab-meta.xml -->
<CustomTab xmlns="http://soap.sforce.com/2006/04/metadata">
    <label>매물 탐색</label>
    <flexiPage>Property_Explorer</flexiPage>
    <motif>Custom24: Building</motif>
</CustomTab>
```

- 각 LWC 의 `js-meta.xml` 에 `<isExposed>true</isExposed>` + `<target>lightning__AppPage</target>`.
- 3열 App Page 템플릿 이름과, 데스크톱 브라우저를 375px 로 줄였을 때 열이 세로로 쌓이는지(AC-045 (b): 필터가 목록 위, 가로 스크롤 없음)는 **확인 필요**. 쌓이지 않으면 §8.3.2 안 B(1영역 템플릿 + `propertyExplorer` 의 `lightning-layout` `size="12" large-device-size="3/6/3"`)로 바꾼다. 결정은 Lab 7 목업 배포 때 미리 확인하는 것을 권장한다.

### 8.4 수락 기준 (AC 연결)

| AC | 검증 가능한 조건 (요약) | 방법 |
|---|---|---|
| AC-026 | SD-04 클릭 → `detail-name` = `마포 한강 오피스텔`, URL 불변 | Playwright |
| AC-035 | SD-07 클릭 → 전체 속성 값·`detail-image` 너비 > 카드 이미지·`계약중`(`slds-theme_warning`) | Playwright |
| AC-036 | SD-07 → SD-02 교체, `property-detail` 1개, 목록 10건 유지 | Playwright |
| AC-037 | 진입 직후 `detail-empty` 문구, `detail-name` 없음 | Playwright |
| AC-038 | 관리자 `detail-edit-button` 활성 → 편집 폼 매물명 `해운대 오션뷰`, 탐색 경로 유지 | Playwright (`admin`) |
| AC-039 | SD-09 → `detail-image` 에 `propertyPlaceholder`, alt, `₩350,000,000` | Playwright |
| AC-040 | 앱 `DreamHouse Lite`, 탭 `매물 탐색`·`매물`, x 좌표 filter < list < detail (1440×900) | Playwright |
| AC-041 | 관리자 10건·3영역 | Playwright (`admin`) |
| AC-042 | SD-02 `계약중` 저장 → 2초 안 토스트, 카드·상세 배지 `계약중`, `10건`, `window.__noReload === true`, 복원 | Playwright (`admin`) + Jest(`PropertyUpdated__c` 발행/구독 → `refreshApex`) (ENHANCED 2026-10-28: I-02) |
| AC-043 | `대전` 1건 → `판매완료` 저장 → 1건 유지, 회색 배지, 필터값 유지, 복원 | Playwright (`admin`) + Jest(구독 시 `filter` 유지) (ENHANCED 2026-10-28: I-02) |
| AC-045 | 1440: 첫 행 카드 ≥ 3, 필터 왼쪽 / 375: 행당 1개, 필터 위, `scrollWidth ≤ 375` | Playwright |
| AC-048 | 라벨 4종 1개씩, 카드 `aria-label` 매물명+가격, Tab→Enter → `detail-name` | Playwright |
| AC-054 | 상담원 `detail-edit-button`/`detail-edit-form`/`detail-status-input` 0개 | Playwright (`agent`) |
| AC-055 (UI) | `noaccess` 앱 런처 `DreamHouse Lite` 검색 결과 0건 | Playwright (`noaccess`) |
| AC-067 | 비밀정보 미커밋 | 수동 |
| AC-068 (Should) | axe serious/critical 0건(3영역 한정) | Playwright + `@axe-core/playwright` |
| **회귀(이월)** | AC-009, 011, 012, 060 (WI-1.001) / AC-020~023 (WI-1.002) / AC-024, 025, 032, 044, 046, 047 (WI-1.003) / AC-027~034, 059 (WI-1.004) — 잠정 AC-057/058/061 은 CK 해소 시 포함 | Playwright 전체 (ENHANCED 2026-10-28: I-01 — PROJECT-PLAN v1.1 §7.2 WI-1.005 회귀 목록과 동일) |

### 8.5 1차 검증 방법 · 이월

| 구분 | 내용 |
|---|---|
| 1차 검증 | ① Jest `propertyDetail` ② DH-DEV 배포 후 3개 사용자로 수동 스모크(앱 진입·카드 클릭·관리자 편집) ③ **전체 Playwright 회귀** `npx playwright test` (태그 제외 없음) |
| 이월 | 없음(Phase 1 최종 UI 검증 지점). 성능 AC-063/064·AC-008 은 Lab 12, AC-069 는 Lab 13 |
| 완료 판정 | WI-1.005 자체 Must AC + §3.4 이월 AC 전부 통과해야 `[X]`. 일정 지연 시 AC-068(Should) 만 이월 가능(PROJECT-PLAN §3.4 대응 ⑤) |

### 8.6 테스트

| 종류 | 대상 | AC |
|---|---|---|
| Jest | `propertyDetail.test.js` | AC-037·054 로직, 저장 후 발행 |
| Jest | `propertyList.test.js` (`PropertyUpdated__c` 구독) | AC-042·043 로직 — 수신 시 `refreshApex` 호출, `filter` 유지 (ADDED 2026-10-28: I-02) |
| Playwright | `tests/e2e/WI-1.005-property-detail.spec.ts` | AC-026, 035~043, 054, 055(UI) |
| Playwright | `tests/e2e/WI-1.005-layout-a11y.spec.ts` | AC-045, 048, 068 |
| Playwright 회귀 | `WI-1.001-property-crud.spec.ts`, `WI-1.002-property-tile.spec.ts`, `WI-1.003-property-list.spec.ts`, `WI-1.004-search-filter.spec.ts` 의 `@explore` | §3.4 |
| Apex | `RunLocalTests` 전체 재실행 | AC-066 |

### 8.7 체크리스트

- [ ] 선행 WI-1.003, WI-1.004 `[X]` 확인
- [ ] `propertyDetail`: 구독, `detail-empty`, 전체 속성·큰 사진·대체 이미지, testid 규약
- [ ] 관리자 전용 `detail-edit-button`(상담원 미노출), 편집 폼·상태 입력·저장
- [ ] 저장 성공 → `notifyRecordUpdateAvailable` + 목록 `refreshApex` (채널 `PropertyUpdated__c` 제안 승인 여부 I-02) (ENHANCED 2026-10-28: I-02 승인)
- [ ] LMS 채널 `PropertyUpdated__c` 생성, `propertyDetail` 발행 + `propertyList` 구독 → `refreshApex` (ADDED 2026-10-28: I-02)
- [ ] 앱 `DreamHouse Lite` + App Page `매물 탐색`(3영역) + `매물` 탭 (ENHANCED 2026-10-28: I-03 — `매물` 탭은 WI-1.001 생성분을 앱 내비게이션에 추가만)
- [ ] 375px 반응형 확인 → 안 A 유지 / 안 B 전환 결정
- [ ] 권한 세트 앱·탭 권한 ENHANCE, `noaccess` 앱 미노출
- [ ] Jest 통과
- [ ] `WI-1.005-property-detail.spec.ts`, `WI-1.005-layout-a11y.spec.ts` 통과
- [ ] **전체 UI 회귀**(§3.4 이월 AC 전부) 통과, §3.4 이월 완료 칸 `[X]`
- [ ] dry-run → deploy, 커밋 `WI-1.005-property-detail-app-page`

---

## 9. WI-1.006 — 상세 위치 지도 (NUD, Could · 선택)

| 항목 | 내용 |
|---|---|
| Description | (Could · **선택**, 일정 미배정) 상세 위치 지도 `lightning-map` — 스파이크(샘플 주소 3~5건 지오코딩) 선행, 실패 시 대안 B/C — REQ-013 |
| 분류 / Man-day | NUD / 0.5 (3.75h) |
| 선행 / 후행 | WI-1.005 / - (WI-1.007 과 병렬 가능) |
| 착수 조건 | Must 5건 `[X]` + 품질 게이트 통과 + OQ-01(주소 체계)·OQ-13(착수) 결정 |
| 커밋명 | `WI-1.006-property-map` |

**흐름**: 사람이 착수 조건 확인 → AI 가 스파이크용 최소 컴포넌트 생성 → DH-DEV 에서 SD 주소 3~5건 표시 성공률 확인 → 사람이 대안 A/B/C 결정 → AI 구현 → AC-049/050 검증.

| # | 세부 작업 |
|---|---|
| 1 | 착수 조건 확인, 결과 기록 |
| 2 | 스파이크 30~60분: `lightning-map` 에 SD-01/02/04/07 주소 입력 → 마커 표시 여부 |
| 3 | 대안 결정: (A) 주소 문자열 `lightning-map` / (B) Geolocation 필드 + 좌표 데이터 / (C) `HYPERLINK` 수식 필드(FIT) |
| 4 | `propertyDetail` 에 `detail-map` 추가(주소 없으면 미표시) |
| 5 | Playwright `WI-1.006-property-map.spec.ts` |

```html
<!-- propertyDetail.html 추가 (대안 A) -->
<template lwc:if={hasAddress}>
    <lightning-map data-testid="detail-map" map-markers={mapMarkers} zoom-level="15"></lightning-map>
</template>
```
```js
get mapMarkers() {
    return [{ location: { Street: this.address, City: this.city, Country: 'KR' }, title: this.name }];
}
```

| AC | 조건 | 방법 / 1차 검증 |
|---|---|---|
| AC-049 (잠정 — CK-11) | SD-01 → `detail-map` 1개, 마커 1개, 제목 `강남 래미안 아파트` | Playwright (탭 존재하므로 바로 실행 가능) |
| AC-050 (잠정 — CK-11) | 주소 없는 매물 → `detail-map` 미표시, 오류 토스트 없음 | Playwright |

- [ ] 착수 조건 확인 (Must `[X]`, OQ-01·OQ-13)
- [ ] 스파이크 → 대안 A/B/C 결정 기록
- [ ] `detail-map` 구현, Playwright AC-049, 050 통과
- [ ] dry-run → deploy, 커밋 `WI-1.006-property-map`
- [ ] 미착수 시 Phase 2 이관 ENHANCE 기록

---

## 10. WI-1.007 — 유사 매물 추천 (NUD, Could · 선택)

| 항목 | 내용 |
|---|---|
| Description | (Could · **선택**, 일정 미배정) 유사 매물 추천 — OQ-13 판정 기준 확정 후 착수(잠정: 동일 City + 가격 ±20% + 침실 ±1, 자기 자신·판매완료 제외) — REQ-014 |
| 분류 / Man-day | NUD / 0.4 (3.0h, 기준 확정 후 재산정) |
| 선행 / 후행 | WI-1.005 / - (WI-1.006 과 병렬 가능) |
| 착수 조건 | Must 5건 `[X]` + 품질 게이트 통과 + OQ-13 판정 기준 확정(CK-12) |
| 커밋명 | `WI-1.007-similar-properties` |

**흐름**: 사람이 판정 기준 확정 → AI 가 Apex 메서드·테스트·LWC 초안 → 사람이 AC-051/052 로 검증.

| # | 세부 작업 |
|---|---|
| 1 | 판정 기준 확정 → 공수 재산정, AC-051/052 잠정 해제 ENHANCE |
| 2 | `PropertyController.getSimilarProperties(Id propertyId)` (cacheable, `WITH USER_MODE`, 바인드) + 테스트 |
| 3 | `propertyDetail` 하단 `similar-list`/`similar-card`/`similar-empty` |
| 4 | Playwright `WI-1.007-similar-properties.spec.ts` |

```apex
@AuraEnabled(cacheable=true)
public static List<Property__c> getSimilarProperties(Id propertyId) {
    Property__c base = [SELECT City__c, Price__c, Bedrooms__c FROM Property__c WHERE Id = :propertyId WITH USER_MODE];
    Decimal low = base.Price__c * 0.8, high = base.Price__c * 1.2;          // 잠정 ±20% (CK-12)
    Decimal bedLow = base.Bedrooms__c - 1, bedHigh = base.Bedrooms__c + 1;
    return [
        SELECT Id, Name, Price__c, Bedrooms__c, Bathrooms__c, City__c, Status__c, Picture_URL__c
        FROM Property__c
        WHERE City__c = :base.City__c AND Id != :propertyId AND Status__c != 'Sold'
          AND Price__c >= :low AND Price__c <= :high
          AND Bedrooms__c >= :bedLow AND Bedrooms__c <= :bedHigh
        WITH USER_MODE
        LIMIT 3
    ];
}
```

| AC | 조건 | 방법 |
|---|---|---|
| AC-051 (잠정 — CK-12) | SD-02 → `similar-card` 1개 = `서면 스카이 빌라` | Apex + Playwright |
| AC-052 (잠정 — CK-12) | SD-07 → `similar-card` 0개, `similar-empty` | Playwright |

- [ ] 착수 조건 확인 (Must `[X]`, OQ-13 기준 확정) → 공수 재산정
- [ ] Apex 유사 매물 조회 + 테스트
- [ ] `similar-list`/`similar-card`/`similar-empty`, Playwright AC-051, 052 통과
- [ ] dry-run → deploy, 커밋 `WI-1.007-similar-properties`
- [ ] 미착수 시 Phase 2 이관 ENHANCE 기록

---

## 11. 추적성 요약 — WI → AC → 테스트

| WI | Must AC (완료 조건, PROJECT-PLAN §7.2) | 1차 검증 수단 | Apex 테스트 | Jest | Playwright spec |
|---|---|---|---|---|---|
| WI-1.001 | AC-001~006, 009~012, 053, 060, 067 | Apex + 탭 비의존 Playwright + 오그 점검 | `PropertyModelTest` | — | `WI-1.001-property-crud.spec.ts` |
| WI-1.002 | AC-007, 008, 020~023, 067 | CLI + Jest | — | `propertyTile` | `WI-1.002-property-tile.spec.ts` |
| WI-1.003 | AC-004(조회부), 013, 018, 019, 024, 025, 032, 046, 047, 055(Apex), 063, 065, 066, 067 | Apex + Jest + Code Analyzer | `PropertyControllerTest` | `propertyList` | `WI-1.003-property-list.spec.ts` |
| WI-1.004 | AC-014~017, 027~033, 056, 059, 064, 065, 066, 067 | Apex + Jest + Code Analyzer | `PropertyControllerTest` | `propertyFilter`, `propertyList` | `WI-1.004-search-filter.spec.ts` |
| WI-1.005 | AC-026, 035~043, 045, 048, 054, 055(UI), 067 + 회귀 | 전체 Playwright 회귀 | (전체 재실행) | `propertyDetail`, `propertyList`(`PropertyUpdated__c` 구독 — ENHANCED 2026-10-28: I-02) | `WI-1.005-property-detail.spec.ts`, `WI-1.005-layout-a11y.spec.ts` |
| WI-1.006 | — (Could) AC-049, 050 잠정 | Playwright | — | — | `WI-1.006-property-map.spec.ts` |
| WI-1.007 | — (Could) AC-051, 052 잠정 | Apex + Playwright | `PropertyControllerTest` | — | `WI-1.007-similar-properties.spec.ts` |

- Should: AC-034·070(WI-1.004), AC-044(WI-1.003 → WI-1.005 검증), AC-068(WI-1.005), AC-069(Lab 13). 잠정: AC-057·058·061·062 (CK 해소 후 완료 조건 포함).
- AC-032 는 WI-1.003(목록·건수 렌더링)·WI-1.004(가격 조건, "027~033" 에 포함) **공동 매핑** — WI-1.003 1차 검증은 가격 조건 Apex 를 주장하지 않는다(§6.4). (ENHANCED 2026-10-28: 정합성 보정, PROJECT-PLAN §7.2 와 일치)

---

## 12. 이슈 / 확인 필요 (PM 검토 게이트 P0-07 에서 처리)

| ID | 내용 | 영향 | 제안 | 담당 |
|---|---|---|---|---|
| I-01 | PROJECT-PLAN §7.2 는 WI-1.003 의 AC-025·032·046·047 을 "→ WI-1.004" 로 이월하지만 WI-1.004 에도 탭이 없어 E2E 불가. 또 WI-1.005 회귀 목록에 WI-1.003/1.004 의 화면 AC(024, 025, 027~034, 044, 046, 047, 059)가 빠져 있음 | WI-1.005 회귀 범위 증가(약 +0.5h, Lab 10 의 1.0h 에서 흡수) | PROJECT-PLAN §7.2 "최종 검증 이월" 칸 ENHANCE (본 문서 §3.4 기준) | project_manager — **해결 (ENHANCED 2026-10-28: PM 최정혁 수용. PROJECT-PLAN v1.1 §7.2·§5.2 에서 AC-025/032/046/047 포함 탭 의존 화면 AC 를 WI-1.004 가 아닌 WI-1.005 전체 UI 회귀로 이월, WI-1.005 회귀 목록을 §3.4 와 동일하게 보완)** |
| I-02 | 상세 저장 후 형제 컴포넌트 `propertyList` 를 갱신할 신호가 PROJECT-PLAN 채널(PropertyFilter__c, PropertySelected__c)에 없음 | WI-1.005 메타데이터 1개 추가 | LMS 채널 `PropertyUpdated__c` ADD (또는 안 B 부모 상태) | PM 승인 → frontend_developer — **해결 (ENHANCED 2026-10-28: PM 최정혁 승인. `PropertyUpdated__c`(필드 `recordId`) ADD, 채널 메타데이터·`propertyList` 구독 모두 WI-1.005 소유(WI-1.003 은 `refresh()` 만). `propertyDetail` 저장·상태 변경 성공 후 발행 → `propertyList` `refreshApex`. §8.2 작업 3·4, §8.3.1, AC-042/043 연결, PROJECT-PLAN v1.1 §5.2 반영)** |
| I-03 | `매물` 오브젝트 탭이 WI-1.005 에 있어 WI-1.001 의 AC-006/009 진입("매물 탭")을 URL 직접 접근으로 대신함. 탭 없이 오브젝트 목록 접근 가능한지 확인 필요 | WI-1.001 1차 검증 | 불가 시 `Property__c` 탭 생성만 WI-1.001 로 이동(ENHANCE), WI-1.005 는 앱 내비게이션 추가만 | backend_developer 확인 → PM — **해결 (ENHANCED 2026-10-28: PM 최정혁 결정. 확인 결과와 무관하게 `Property__c` 오브젝트 탭을 WI-1.001(§4.2 작업 6-1)에서 생성, URL 직접 접근 방식 미사용. `매물 탐색` App Page 탭은 WI-1.005 유지. WI-1.001 Description 을 두 문서에서 동일하게 ENHANCE)** |
| I-04 | Developer Edition Scratch Org 의 Salesforce 라이선스로 Playwright 사용자 3명을 만들 수 있는지 확인 필요 | AC-004/006/054/055 테스트 사용자 | 부족 시 `Standard Platform User` 프로필 사용 또는 scratch def `edition` 검토 | backend_developer |
| I-05 | 필수 필드(Price__c, Status__c)는 권한 세트 FLS 에 넣을 수 없음 → 상담원의 `Status__c.isUpdateable()` 이 AC-004 기대값 `false` 인지 확인 필요 | AC-004 | `true` 로 나오면 AC-004 ENHANCE 협의(상태 변경 불가는 AC-053 으로 보장) | requirements_analyst / test_engineer |
| I-06 | `₩` 문자: `lightning-formatted-number`·`Intl`·표준 레코드 페이지(ko_KR)의 KRW 출력이 AC 의 반각 `₩` 와 같은지, 표준 페이지가 `KRW 850,000,000` 형식으로 보이지 않는지 확인 필요 | AC-006, 009, 020, 023, 035 | DH-DEV 에서 실제 출력 확인 후 AC 기대값 또는 구현 ENHANCE | frontend_developer / test_engineer |
| I-07 | scratch def `country: "KR"` 의 효과(기본 통화·로캘) 미검증. Company Information 조정은 오그 직접 변경이라 NFR-010 예외 기록 필요 | AC-003, R-08 | 임시 Scratch Org 로 확인, 결과를 EXECUTION-PLAN/README 에 기록 | backend_developer |
| I-08 | DH-HUB(PROD) 통화·로캘 변경은 DevOps Center Hub 화면 표시 형식까지 바꿈 | AC-003 PROD 실행 | 사람 승인 후 Lab 12 전 실행. 미변경 시 PROD 배포의 `PropertyModelTest.ac003` 실패 | PM / RM — **확인 필요 유지 (ENHANCED 2026-10-28: DH-HUB(PROD) 통화·로캘 변경은 Lab 12 전 사용자 명시 승인이 있어야 실행. 자동 변경 계획 없음, WI-1.001 은 점검만)** |
| I-09 | 3열 App Page 템플릿 이름·모바일 폭 세로 쌓임 미검증 | AC-040, 045 | Lab 7 목업 배포 때 확인, 안 되면 §8.3.2 안 B | frontend_developer |
| I-10 | 탭 재진입 시 cacheable 캐시 갱신(AC-044, Should): App Page 컴포넌트가 재사용되면 `connectedCallback` 이 다시 불리지 않을 수 있음 | AC-044 | WI-1.005 회귀에서 확인, 실패 시 Should 로 이월 | frontend_developer |
| I-11 | 임시 테스트 하네스(§3.3-5) 사용 여부 | 1차 검증 범위 | 기본 미사용. 사용 시 PM 결정 + DH-DEV 정리 절차 | PM — **해결 (ENHANCED 2026-10-28: PM 최정혁 결정 — 임시 테스트 하네스 사용 안 함(off). §3.3-5 반영)** |
| I-12 | 용량 초과 0.55 M/D (R-01) 유지 | 전체 일정 | PROJECT-PLAN §3.4 대응 유지. 본 문서는 공수를 바꾸지 않음 | PM |
