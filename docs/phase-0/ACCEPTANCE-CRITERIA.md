# ACCEPTANCE CRITERIA — DreamHouse Lite 부동산 매물 관리 시스템

> Phase 0(본 개발 전 고객 협의) 산출물. 기준 문서 `docs/REQUIREMENT.md` **v1.1** 의 `REQ-nnn` / `NFR-nnn` 과 `docs/phase-0/FIT-GAP-NUD.md` v1.0 을 근거로 작성한 **검증 가능한 상세 인수기준**이다.
> 이후 Apex 단위 테스트·Playwright UI 자동화(`tests/e2e/WI-1.nnn-*.spec.ts`)·수동 QA 시나리오는 모두 이 문서의 `AC-nnn` 에서 파생한다(Cheatsheet STEP 3 → STEP 10).

---

## 0. 문서 정보

| 항목 | 내용 |
|---|---|
| 문서명 | ACCEPTANCE-CRITERIA — DreamHouse Lite |
| 버전 | v1.1 (Draft — 고객 합의 전, 추적성 WI 확정·테스트 사용자 확인 필요 반영) |
| 작성일 | 2026-10-28 |
| 작성자 | 최정혁 (BA 역할, requirements_analyst 에이전트 활용) |
| 기준 문서 | `docs/REQUIREMENT.md` v1.1 (OQ-02/04/07/10 해결 반영), `docs/phase-0/FIT-GAP-NUD.md` v1.0, `docs/inputs/RFP.md` |
| 상태 | Draft — §7 확인 필요 목록 해소 후 ~~v1.1 로~~ 확정(해소 시점의 다음 minor 버전) (ENHANCED 2026-10-28: v1.1 은 추적성 보정본이며 고객 확정본 아님). "잠정" 표기 AC 는 해당 CK 해소 시 ENHANCE |

### 0.1 변경 이력

| 버전 | 일자 | 작성자 | 유형 | 변경 내용 |
|---|---|---|---|---|
| v1.0 | 2026-10-28 | 최정혁 | 최초 작성 | REQ-001~REQ-014 대상 AC-001~AC-070 정의, 샘플 데이터 SD-01~SD-10, 추적성 매트릭스, 경계/예외·비기능 인수기준, 확인 필요 CK-01~CK-15 |
| v1.1 | 2026-10-28 | 최정혁 | ENHANCE / ADD | §3 추적성 매트릭스 WI 열을 PROJECT-PLAN v1.1 §7·WI 문서 FrontMatter ac-ids 기준으로 "(예정)" → "(확정 2026-10-28)", WI-1.005 전체 UI 회귀 이월 AC 명시 / §1.3 테스트 사용자 프로필 확인 필요 ENHANCE + §7 CK-16 ADD(Standard User 기본 CRUD 위험 → `Minimum Access - Salesforce` 권고). AC ID·Given/When/Then 변경 없음 |

> 갱신 규칙: 재작성 금지, DROP / ENHANCE / ADD 로만 반영. **`AC-nnn` ID 는 이후 변경·재번호·재사용 금지.**

---

## 1. 개요

### 1.1 목적
- 본 문서는 **테스트 시나리오의 단일 기준**이다. 각 `AC-nnn` 은 그대로 Apex 테스트 메서드, Playwright `test()` 블록, 또는 수동 QA 체크 항목 1개로 변환된다.
- Work Item 완료 판정(CLAUDE.md 진행 규칙 2)은 "대응 AC 의 테스트 통과"로 한다. AC 가 없는 기능은 완료로 인정하지 않는다.
- 고객은 Phase 0 에서 이 문서로 "무엇이 되면 인수하는가"를 합의하고, UAT 에서 같은 AC 로 승인한다.

### 1.2 작성 규칙
- **형식**: Given(전제) / When(행동) / Then(기대결과). Then 은 화면 텍스트·건수·속성값·예외 유형 등 **관측 가능한 값**으로 쓴다. "정상 동작", "올바르게 표시" 같은 표현은 쓰지 않는다.
- **연결**: 모든 AC 는 1개 이상의 `REQ-nnn`(비기능은 `NFR-nnn` 병기)에 연결한다.
- **데이터**: §1.4 샘플 데이터(SD-01~SD-10)를 기준으로 기대 건수·금액을 계산한다. 샘플 데이터가 바뀌면 기대값도 함께 ENHANCE 한다.
- **검증 방법**: `단위(Apex)` | `UI 자동화(Playwright)` | `수동 QA`. 화면이 있는 AC 는 Playwright 를 우선 지정한다.
- **우선순위**: 연결 REQ 의 MoSCoW 를 따르되(Must/Should/Could), 세부 품질 항목은 Should 로 낮출 수 있다(해당 AC 에 명시).
- **잠정 AC**: 기대결과가 고객 결정에 달린 경우 Then 에 `(잠정 — CK-nn)` 을 붙이고 §7 에 분리한다. 잠정 AC 는 CK 해소 전까지 Work Item 완료 조건에서 제외한다.
- **셀렉터**: Playwright 는 `data-testid`(§1.6)와 접근성 라벨(`getByRole`/`getByLabel`)만 사용한다. SLDS 내부 클래스·XPath 셀렉터 금지(배지 색상 클래스 검증은 예외).

### 1.3 공통 전제 (모든 AC 의 Given 에 포함)

| 항목 | 값 |
|---|---|
| 대상 오그 | 개발 검증 DH-DEV, 회귀 DH-SIT / DH-UAT |
| 조직 설정 | 기본 통화 **KRW**, 다중 통화 비활성, 로캘 **ko_KR**, 시간대 Asia/Seoul |
| 사용자(Playwright 인증 상태) | `agent` = 상담원(권한 세트 `DreamHouse_Agent`, 가칭) → `tests/e2e/.auth/agent.json` / `admin` = 관리자(권한 세트 `DreamHouse_Admin`, 가칭) → `tests/e2e/.auth/admin.json` / `noaccess` = 권한 세트 미할당 Standard User (`.auth/` 는 커밋 금지) (ENHANCED 2026-10-28: **확인 필요 — CK-16** · `Standard User` 프로필은 커스텀 오브젝트 기본 CRUD 를 가질 수 있어, `noaccess` 가 Property__c 를 조회(AC-055 실패)하거나 `agent` 가 프로필로 생성·편집 권한을 얻어 AC-004/006/053 이 실패할 수 있다. **권고: `agent`·`noaccess`(필요 시 `admin` 포함) 를 `Minimum Access - Salesforce` 프로필로 만들고 Property__c 권한은 권한 세트로만 부여**(WI-1.001 문서와 동일). 확정 전까지 배포 직후 두 사용자의 프로필 오브젝트 권한을 점검. AC ID·기대결과 변경 없음) |
| 데이터 | §1.4 SD-01~SD-10 **10건만** 존재(REQ-003 데이터 플랜으로 적재). E2E 가 만든 레코드는 이름 접두어 `[E2E]` 를 붙이고 같은 spec 의 `afterAll` 에서 삭제. 상태·가격을 바꾸는 테스트는 `afterEach` 에서 원래 값으로 복원 |
| Apex 테스트 데이터 | `@testSetup` 에서 SD-01~SD-10 과 같은 값을 테스트 데이터 팩토리(가칭 `PropertyTestDataFactory`)로 생성(오그 데이터 비의존) |
| 화면 진입 | 앱 런처 → DreamHouse Lite → "매물 탐색" 탭(Lightning App Page). 뷰포트 기본 1440×900 |
| 정렬 | 결과 정렬 기준은 미정(OQ-09) → **AC 는 결과 집합(건수·포함 매물)만 검증하고 순서는 검증하지 않는다** |

### 1.4 기준 샘플 데이터 (SD-01 ~ SD-10)

| SD | Name(매물명) | Address__c | City__c | Price__c | 표시 가격 | Bed | Bath | Status__c (라벨) | Picture_URL__c |
|---|---|---|---|---|---|---|---|---|---|
| SD-01 | 강남 래미안 아파트 | 서울특별시 강남구 테헤란로 101 | 서울 | 2500000000 | ₩2,500,000,000 | 4 | 2 | Available (판매중) | 유효 URL ¹ |
| SD-02 | 해운대 오션뷰 | 부산광역시 해운대구 해운대해변로 22 | 부산 | 850000000 | ₩850,000,000 | 3 | 2 | Available (판매중) | 유효 URL |
| SD-03 | 판교 테크노 빌라 | 경기도 성남시 분당구 판교역로 33 | 성남 | 1200000000 | ₩1,200,000,000 | 3 | 2 | Under Contract (계약중) | 유효 URL |
| SD-04 | 마포 한강 오피스텔 | 서울특별시 마포구 마포대로 44 | 서울 | 450000000 | ₩450,000,000 | 1 | 1 | Available (판매중) | 유효 URL |
| SD-05 | 광교 호수 타운하우스 | 경기도 수원시 영통구 광교호수로 55 | 수원 | 980000000 | ₩980,000,000 | 4 | 3 | Sold (판매완료) | 유효 URL |
| SD-06 | 둔산 센트럴 아파트 | 대전광역시 서구 둔산로 66 | 대전 | 520000000 | ₩520,000,000 | 3 | 1 | Available (판매중) | 유효 URL |
| SD-07 | 제주 애월 전원주택 | 제주특별자치도 제주시 애월읍 애월해안로 77 | 제주 | 1650000000 | ₩1,650,000,000 | 5 | 3 | Under Contract (계약중) | 유효 URL |
| SD-08 | 송파 잠실 아파트 | 서울특별시 송파구 올림픽로 88 | 서울 | 1980000000 | ₩1,980,000,000 | 3 | 2 | Sold (판매완료) | 유효 URL |
| SD-09 | 송도 센트럴 오피스텔 | 인천광역시 연수구 센트럴로 99 | 인천 | 350000000 | ₩350,000,000 | 1 | 1 | Available (판매중) | **빈 값** |
| SD-10 | 서면 스카이 빌라 | 부산광역시 부산진구 서면로 10 | 부산 | 720000000 | ₩720,000,000 | 2 | 1 | Available (판매중) | **깨진 URL** `https://invalid.example.invalid/none.jpg` |

¹ 유효 URL 도메인은 OQ-05 확정 후 지정(CSP Trusted Sites 등록 대상). 확정 전에는 정적 리소스 이미지 URL 사용 가능(CK-10).

**기대값 계산표(필터 AC 공통 근거)** — 키워드는 Name·City__c 부분 일치(Address__c 는 검색 대상 아님), 가격은 경계 포함(≥ / ≤), 침실은 "이상".

| 조건 | 결과 SD | 건수 |
|---|---|---|
| 조건 없음(초기) | SD-01~SD-10 | 10 |
| 상태 분포 | 판매중 01·02·04·06·09·10 / 계약중 03·07 / 판매완료 05·08 | 6 / 2 / 2 |
| 키워드 `서울` | 01, 04, 08 | 3 |
| 키워드 `부산` | 02, 10 | 2 |
| 키워드 `래미안` | 01 | 1 |
| 키워드 `센트럴` | 06, 09 | 2 |
| 키워드 `강릉` | — | 0 |
| 최대 가격 1,000,000,000 | 02, 04, 05, 06, 09, 10 | 6 |
| 최소 가격 1,000,000,000 | 01, 03, 07, 08 | 4 |
| 가격 500,000,000 ~ 1,000,000,000 | 02, 05, 06, 10 | 4 |
| 가격 850,000,000 ~ 850,000,000 | 02 | 1 |
| 최소 침실 3 | 01, 02, 03, 05, 06, 07, 08 | 7 |
| 최소 침실 4 | 01, 05, 07 | 3 |
| 최소 침실 6 | — | 0 |
| `서울` + 침실 3 | 01, 08 | 2 |
| `서울` + 침실 3 + 최대 2,000,000,000 | 08 | 1 |
| 500,000,000 ~ 1,000,000,000 + 침실 3 | 02, 05, 06 | 3 |

### 1.5 UI 문구·표시 규칙 (제안 — 목업 리뷰에서 확정, CK-09)

| 항목 | 값 |
|---|---|
| 가격 표시 | `₩` + 원 단위 전체 금액 + 천 단위 쉼표 (예: `₩850,000,000`). "억", "만원" 축약 문자 없음 (OQ-02 해결, 축약 미사용은 가정 — OQ-15/CK-02) |
| 상태 라벨 / 배지 색상 | Available = `판매중` / 초록 · Under Contract = `계약중` / 주황 · Sold = `판매완료` / 회색 (OQ-04 해결) |
| 배지 구현 매핑(제안) | 초록 `slds-theme_success`, 주황 `slds-theme_warning`, 회색 `slds-badge`(기본, 회색 배경). 배지 요소에 `data-status="Available|Under Contract|Sold"` 속성 부여 |
| 결과 건수 | `{n}건` (예: `10건`, `0건`) |
| 빈 결과 | `조건에 맞는 매물이 없습니다.` |
| 상세 미선택 | `매물을 선택하면 상세 정보가 표시됩니다.` |
| 조회 오류 토스트 | 제목 `매물 정보를 불러오지 못했습니다.`, variant `error` |
| 침실 수 선택지 | `전체`, `1개 이상`, `2개 이상`, `3개 이상`, `4개 이상`, `5개 이상` (값 0~5) |
| 카드 침실/욕실 요약 | `침실 {b} · 욕실 {t}` (예: `침실 3 · 욕실 2`) |

### 1.6 data-testid 규약 (개발 구현 대상)

| 컴포넌트(FIT-GAP §3.1) | data-testid | 비고 |
|---|---|---|
| propertyFilter | `filter-panel`, `filter-keyword`, `filter-min-price`, `filter-max-price`, `filter-min-bedrooms`, `filter-reset`, `filter-price-error` | `filter-price-error` 는 CK-03 확정 시에만 |
| propertyList | `property-list`, `result-count`, `empty-state`, `loading-spinner` | |
| propertyTile | `property-card`, `property-card-image`, `property-card-name`, `property-card-price`, `property-card-address`, `property-card-rooms`, `property-status-badge` | `property-card` 에 `data-id`(레코드 Id)·`data-name`(매물명) 속성. 배지에 `data-status` 속성. FIT-GAP §3.2 의 `property-tile` 표기는 본 문서의 `property-card` 로 통일 제안 |
| propertyDetail | `property-detail`, `detail-empty`, `detail-image`, `detail-name`, `detail-address`, `detail-city`, `detail-state`, `detail-price`, `detail-bedrooms`, `detail-bathrooms`, `detail-status-badge`, `detail-edit-button`, `detail-edit-form`, `detail-status-input`, `detail-save-button` | `detail-state` 는 OQ-01 결과에 따라. 편집을 표준 Edit 모달(NavigationMixin)로 구현하면 `detail-edit-form` 계열 대신 모달의 접근성 라벨 셀렉터 사용(test_engineer 협의) |
| (Could) 지도·유사 매물 | `detail-map`, `similar-list`, `similar-card`, `similar-empty` | REQ-013/014 착수 시 |

- 토스트는 표준 컴포넌트이므로 `getByRole('alert')`/토스트 텍스트로 검증한다.
- 대체 이미지 정적 리소스 이름(제안): `propertyPlaceholder` → `img src` 에 `propertyPlaceholder` 포함 여부로 검증.

---

## 2. 요구사항별 인수기준

### REQ-001 매물 데이터 모델

#### AC-001 — Property__c 필드 구성
- 연결 REQ: REQ-001 · 우선순위: Must · 검증 방법: 단위(Apex)
- Given: `Property__c` 메타데이터가 배포된 오그
- When: `Schema.SObjectType.Property__c.fields.getMap()` 로 필드를 조회한다
- Then: 다음 필드가 지정 타입으로 존재한다 — Name(STRING, 80), Address__c(STRING, 255), City__c(STRING, 100), Price__c(CURRENCY, 정밀도 12·소수 0), Bedrooms__c(DOUBLE, 2·0), Bathrooms__c(DOUBLE, 2·0), Picture_URL__c(URL), Status__c(PICKLIST). State__c 는 OQ-01 결과에 따라 존재 여부 판정(CK-11)
- 검증 데이터: 기대 타입 맵 `{Price__c: CURRENCY, Bedrooms__c: DOUBLE, Picture_URL__c: URL, Status__c: PICKLIST, ...}`

#### AC-002 — Status__c 선택목록 값과 기본값
- 연결 REQ: REQ-001 · 우선순위: Must · 검증 방법: 단위(Apex)
- Given: AC-001 과 같음
- When: `Property__c.Status__c.getDescribe().getPicklistValues()` 를 조회하고, Status 를 지정하지 않은 `new Property__c(Name='[E2E] 기본값 확인', Price__c=100000000)` 를 insert 한다
- Then: 활성 값이 정확히 3개 `Available`, `Under Contract`, `Sold` 이고, 기본값은 `Available`, insert 된 레코드의 Status__c = `Available`
- 검증 데이터: 기대 API 값 목록 `['Available','Under Contract','Sold']`, 라벨 `['판매중','계약중','판매완료']`(A-04)

#### AC-003 — 통화 KRW 단일 통화
- 연결 REQ: REQ-001 · 우선순위: Must · 검증 방법: 단위(Apex)
- Given: 대상 오그(공통 전제의 조직 설정)
- When: `UserInfo.getDefaultCurrency()` 와 `UserInfo.isMultiCurrencyOrganization()` 를 호출한다
- Then: 각각 `'KRW'`, `false`
- 검증 데이터: SD-01 Price__c = 2500000000 → 저장 후 조회값 2500000000(소수 없음)

### REQ-002 역할별 권한 모델

#### AC-004 — 상담원 = 조회 전용
- 연결 REQ: REQ-002 (NFR-004) · 우선순위: Must · 검증 방법: 단위(Apex)
- Given: 테스트에서 생성한 사용자에 `DreamHouse_Agent` 권한 세트 할당, SD-01~SD-10 존재
- When: `System.runAs(agent)` 에서 `Schema.sObjectType.Property__c` 의 isAccessible/isCreateable/isUpdateable/isDeletable 과 Status__c 필드의 isUpdateable 을 확인하고 `PropertyController.getProperties`(조건 없음)를 호출한다
- Then: isAccessible = true, isCreateable = false, isUpdateable = false, isDeletable = false, Status__c.isUpdateable = false, 조회 결과 10건
- 검증 데이터: SD-01~SD-10, 기대 권한 벡터 `R=true, C=false, U=false, D=false`

#### AC-005 — 관리자 = 생성·조회·수정·삭제·상태 변경
- 연결 REQ: REQ-002 (NFR-004) · 우선순위: Must · 검증 방법: 단위(Apex)
- Given: 사용자에 `DreamHouse_Admin` 권한 세트 할당
- When: `System.runAs(admin)` 에서 `Database.insert/update/delete(record, AccessLevel.USER_MODE)` 를 차례로 실행한다(Name `[E2E] 관리자 권한 확인`, Price 300000000 → Status `Sold` 로 update → delete)
- Then: 3개 DML 모두 성공(`isSuccess() = true`), 마지막 조회 `SELECT COUNT() FROM Property__c WHERE Name = '[E2E] 관리자 권한 확인'` = 0. 관리자가 타인 소유 레코드도 수정·삭제 가능해야 하는지(Modify All)는 FIT-GAP AD-03 에서 결정
- 검증 데이터: 위 레코드 1건

#### AC-006 — 상담원 UI 에서 등록·편집·삭제 진입점 미노출
- 연결 REQ: REQ-002, REQ-004 · 우선순위: Must · 검증 방법: UI 자동화(Playwright)
- Given: `agent` 인증 상태로 로그인
- When: (1) "매물"(Property__c) 오브젝트 탭 목록 화면, (2) SD-02 표준 레코드 페이지(`/lightning/r/Property__c/{SD-02 Id}/view`)에 접근한다
- Then: (1) `새로 만들기` 버튼 없음, (2) `편집`·`삭제` 버튼 없음, Status 필드 인라인 편집 아이콘(연필) 없음. 레코드 필드 값(매물명 `해운대 오션뷰`, 가격 `₩850,000,000`)은 표시됨
- 검증 데이터: SD-02

### REQ-003 시연용 샘플 데이터

#### AC-007 — 샘플 데이터 10건 적재와 분포
- 연결 REQ: REQ-003 · 우선순위: Must · 검증 방법: 수동 QA (CLI)
- Given: 빈 Scratch Org(DH-DEV)에 REQ-001 메타데이터 배포 완료
- When: 저장소의 데이터 플랜으로 `sf data import tree --plan <plan.json> -o DH-DEV` 실행 후 `sf data query -q "SELECT Status__c, COUNT(Id) FROM Property__c GROUP BY Status__c" -o DH-DEV` 실행
- Then: 총 10건, Available 6 / Under Contract 2 / Sold 2, City 고유값 7개(서울·부산·성남·수원·대전·제주·인천), 각 레코드 값이 §1.4 표와 일치
- 검증 데이터: §1.4 SD-01~SD-10

#### AC-008 — 오그 간 재현성
- 연결 REQ: REQ-003 · 우선순위: Must · 검증 방법: 수동 QA (CLI)
- Given: AC-007 을 통과한 동일 데이터 플랜 파일
- When: DH-SIT 와 DH-UAT 에 같은 명령으로 적재한다
- Then: 두 오그 모두 `SELECT Name, City__c, Price__c, Bedrooms__c, Bathrooms__c, Status__c FROM Property__c ORDER BY Name` 결과 10행이 DH-DEV 결과와 완전히 같음. 재실행 시 중복 적재되지 않거나(20건 아님) 중복 방지 절차가 문서화되어 있음
- 검증 데이터: §1.4

### REQ-004 매물 등록·수정·삭제

> AC-009 → AC-011 → AC-012 는 같은 테스트 레코드를 사용하므로 한 spec 안에서 직렬(`test.describe.serial`)로 실행한다.

#### AC-009 — 관리자 신규 매물 등록
- 연결 REQ: REQ-004 · 우선순위: Must · 검증 방법: UI 자동화(Playwright)
- Given: `admin` 로그인, "매물" 탭
- When: `새로 만들기` → 매물명 `[E2E] 성수 숲 아파트`, 주소 `서울특별시 성동구 왕십리로 1`, 도시 `서울`, 가격 `1100000000`, 침실 `2`, 욕실 `1`, 상태 미변경 → `저장`
- Then: 성공 토스트 표시, 레코드 상세의 상태 = `판매중`(기본값), 가격 = `₩1,100,000,000`. 이후 "매물 탐색" 탭에서 `filter-keyword` 에 `성수` 입력 시 `property-card` 1개, `property-card-price` = `₩1,100,000,000`
- 검증 데이터: 위 입력값

#### AC-010 — 필수값 누락 시 저장 차단
- 연결 REQ: REQ-004 · 우선순위: Must · 검증 방법: UI 자동화(Playwright)
- Given: `admin` 로그인, `새로 만들기` 폼
- When: (a) 매물명 빈 값 + 가격 `500000000`, (b) 매물명 `[E2E] 필수값 확인` + 가격 빈 값 으로 각각 `저장`
- Then: 각 경우 폼이 닫히지 않고 해당 필드에 필수 입력 오류 메시지 표시, `SELECT COUNT() FROM Property__c WHERE Name LIKE '[E2E] 필수값%'` = 0. 필수 필드는 Name·Price__c·Status__c(§9.1). 그 외 필드의 필수 여부는 CK-05
- 검증 데이터: (a), (b)

#### AC-011 — 관리자 매물 수정
- 연결 REQ: REQ-004 · 우선순위: Must · 검증 방법: UI 자동화(Playwright)
- Given: AC-009 에서 만든 `[E2E] 성수 숲 아파트`(₩1,100,000,000)
- When: 레코드 `편집` → 가격 `1050000000`, 침실 `3` → `저장` → "매물 탐색" 탭에서 `성수` 검색
- Then: 카드 `property-card-price` = `₩1,050,000,000`, `property-card-rooms` = `침실 3 · 욕실 1`
- 검증 데이터: 변경 전 1100000000/2 → 변경 후 1050000000/3

#### AC-012 — 관리자 물리 삭제
- 연결 REQ: REQ-004 · 우선순위: Must · 검증 방법: UI 자동화(Playwright)
- Given: AC-011 의 `[E2E] 성수 숲 아파트`
- When: 레코드 `삭제` → 확인 대화상자 `삭제`
- Then: 삭제 성공 토스트, `SELECT COUNT() FROM Property__c WHERE Name = '[E2E] 성수 숲 아파트'` = 0, "매물 탐색" 탭에서 `성수` 검색 시 `empty-state` 표시·`result-count` = `0건`, 조건 해제 시 `10건`. 휴지통 보관(15일)으로 충분한지는 CK-01
- 검증 데이터: 위 레코드

### REQ-005 매물 조회 Apex 서비스

> 대상: `PropertyController.getProperties(PropertyFilter filter)` (FIT-GAP §3.2). 테스트 클래스(예정) `PropertyControllerTest`, 실행 사용자 `System.runAs(agent)`.

#### AC-013 — 조건 없음 → 전체 10건(판매완료 포함)
- 연결 REQ: REQ-005 · 우선순위: Must · 검증 방법: 단위(Apex)
- Given: `@testSetup` SD-01~SD-10
- When: 모든 조건이 null 인 filter 로 호출
- Then: 10건 반환, Status__c 별 6/2/2, `Sold` 2건(SD-05, SD-08) 포함(OQ-04 해결: 판매완료 기본 노출)
- 검증 데이터: filter `{keyword:null, minPrice:null, maxPrice:null, minBedrooms:null}`

#### AC-014 — 키워드 부분 일치(매물명·도시)
- 연결 REQ: REQ-005 · 우선순위: Must · 검증 방법: 단위(Apex)
- Given: AC-013 과 같음
- When: keyword 를 `래미안`, `부산`, `센트럴`, `강남구` 로 각각 호출
- Then: `래미안` → 1건(SD-01, 매물명 일치), `부산` → 2건(SD-02, SD-10, 도시 일치), `센트럴` → 2건(SD-06, SD-09), `강남구` → 0건(주소는 검색 대상 아님)
- 검증 데이터: 위 4개 키워드

#### AC-015 — 가격 범위(경계 포함)
- 연결 REQ: REQ-005 · 우선순위: Must · 검증 방법: 단위(Apex)
- Given: AC-013 과 같음
- When: (a) min 500000000 / max 1000000000, (b) min 850000000 / max 850000000, (c) max 1000000000 만, (d) min 1000000000 만
- Then: (a) 4건 SD-02·05·06·10, (b) 1건 SD-02, (c) 6건, (d) 4건 SD-01·03·07·08
- 검증 데이터: 위 4개 조합

#### AC-016 — 최소 침실 수
- 연결 REQ: REQ-005 · 우선순위: Must · 검증 방법: 단위(Apex)
- Given: AC-013 과 같음
- When: minBedrooms 3, 4, 6 으로 각각 호출
- Then: 3 → 7건, 4 → 3건(SD-01·05·07), 6 → 0건
- 검증 데이터: 3 / 4 / 6

#### AC-017 — 복합 조건(AND)
- 연결 REQ: REQ-005 · 우선순위: Must · 검증 방법: 단위(Apex)
- Given: AC-013 과 같음
- When: (a) keyword `서울` + minBedrooms 3 + maxPrice 2000000000, (b) min 500000000 + max 1000000000 + minBedrooms 3
- Then: (a) 1건 SD-08(Status `Sold`), (b) 3건 SD-02·05·06
- 검증 데이터: 위 2개 조합

#### AC-018 — 결과 0건은 예외 없이 빈 목록
- 연결 REQ: REQ-005 · 우선순위: Must · 검증 방법: 단위(Apex)
- Given: AC-013 과 같음
- When: keyword `강릉` 으로 호출
- Then: 예외 없이 `size() = 0` 인 List 반환(null 아님)
- 검증 데이터: `강릉`

#### AC-019 — 반환 필드
- 연결 REQ: REQ-005, REQ-006 · 우선순위: Must · 검증 방법: 단위(Apex)
- Given: AC-013 과 같음
- When: keyword `래미안` 으로 호출
- Then: 반환 레코드 1건에서 Id, Name=`강남 래미안 아파트`, Address__c=`서울특별시 강남구 테헤란로 101`, City__c=`서울`, Price__c=2500000000, Bedrooms__c=4, Bathrooms__c=2, Picture_URL__c(값 존재), Status__c=`Available` 에 접근 시 `SObjectException` 이 발생하지 않음
- 검증 데이터: SD-01

### REQ-006 매물 카드(타일)

#### AC-020 — 카드 요약 정보 표시
- 연결 REQ: REQ-006 · 우선순위: Must · 검증 방법: UI 자동화(Playwright)
- Given: `agent` 로그인, "매물 탐색" 탭, 조건 없음
- When: `data-name="해운대 오션뷰"` 인 `property-card` 를 찾는다
- Then: `property-card-name` = `해운대 오션뷰`, `property-card-price` = `₩850,000,000`, `property-card-address` 에 `부산광역시 해운대구 해운대해변로 22` 와 `부산` 포함, `property-card-rooms` = `침실 3 · 욕실 2`, `property-status-badge` = `판매중`, `property-card-image` 의 `alt` = `해운대 오션뷰`
- 검증 데이터: SD-02

#### AC-021 — 상태 배지 색상 매핑
- 연결 REQ: REQ-006 · 우선순위: Must · 검증 방법: UI 자동화(Playwright)
- Given: AC-020 과 같음
- When: SD-01, SD-03, SD-05 카드의 `property-status-badge` 를 확인한다
- Then: SD-01 → 텍스트 `판매중`, `data-status="Available"`, 클래스 `slds-theme_success`(초록) / SD-03 → `계약중`, `Under Contract`, `slds-theme_warning`(주황) / SD-05 → `판매완료`, `Sold`, 초록·주황 클래스 없음(회색 기본 배지). 화면 전체 배지 개수: 판매중 6, 계약중 2, 판매완료 2
- 검증 데이터: SD-01, SD-03, SD-05 (색상 톤 최종 확인은 CK-14)

#### AC-022 — 사진 누락·오류 시 대체 이미지
- 연결 REQ: REQ-006 · 우선순위: Must · 검증 방법: UI 자동화(Playwright)
- Given: AC-020 과 같음
- When: SD-09(Picture_URL__c 빈 값), SD-10(깨진 URL) 카드의 `property-card-image` 를 확인한다
- Then: 두 카드 모두 `src` 에 `propertyPlaceholder` 포함, 이미지 `naturalWidth > 0`(깨진 이미지 아이콘 아님), `alt` = 각 매물명. SD-02 카드는 `propertyPlaceholder` 를 포함하지 않음
- 검증 데이터: SD-09, SD-10, 대조군 SD-02 (대체 이미지 정책은 CK-10)

#### AC-023 — KRW 전체 금액 포맷(축약 없음)
- 연결 REQ: REQ-006 · 우선순위: Must · 검증 방법: UI 자동화(Playwright)
- Given: AC-020 과 같음
- When: SD-01, SD-09 카드 가격과 그리드 전체 텍스트를 확인한다
- Then: SD-01 = `₩2,500,000,000`, SD-09 = `₩350,000,000`. `property-list` 텍스트에 `억`, `만원`, `$`, `KRW` 문자열이 없음
- 검증 데이터: SD-01, SD-09 (축약 미사용은 가정 — CK-02)

### REQ-007 매물 목록(카드 그리드)

#### AC-024 — 초기 진입 시 전체 목록과 건수
- 연결 REQ: REQ-007 · 우선순위: Must · 검증 방법: UI 자동화(Playwright)
- Given: `agent` 로그인
- When: "매물 탐색" 탭에 진입한다
- Then: `property-card` 10개, `result-count` = `10건`, `empty-state` 미표시, 판매완료 카드(SD-05, SD-08) 포함
- 검증 데이터: SD-01~SD-10

#### AC-025 — 결과 0건 안내
- 연결 REQ: REQ-007 · 우선순위: Must · 검증 방법: UI 자동화(Playwright)
- Given: AC-024 상태
- When: `filter-keyword` 에 `강릉` 입력
- Then: 1초 이내 `property-card` 0개, `result-count` = `0건`, `empty-state` 표시 및 텍스트 `조건에 맞는 매물이 없습니다.`
- 검증 데이터: `강릉`

#### AC-026 — 카드 선택 시 상세 표시 이벤트
- 연결 REQ: REQ-007, REQ-009 · 우선순위: Must · 검증 방법: UI 자동화(Playwright)
- Given: AC-024 상태, 현재 URL 기록
- When: SD-04 `property-card` 클릭
- Then: 같은 화면의 `property-detail` 에 `detail-name` = `마포 한강 오피스텔` 표시, 페이지 URL 변경 없음(OQ-10 해결)
- 검증 데이터: SD-04

### REQ-008 검색·필터 패널

#### AC-027 — 키워드 실시간 필터
- 연결 REQ: REQ-008 · 우선순위: Must · 검증 방법: UI 자동화(Playwright)
- Given: AC-024 상태
- When: `filter-keyword` 에 `서울` 입력(Enter·검색 버튼 누르지 않음)
- Then: 마지막 입력 후 1,300ms 이내(디바운스 300ms 포함) `property-card` 3개(SD-01·04·08), `result-count` = `3건`
- 검증 데이터: `서울`

#### AC-028 — 최대 가격 필터
- 연결 REQ: REQ-008 · 우선순위: Must · 검증 방법: UI 자동화(Playwright)
- Given: AC-024 상태
- When: `filter-max-price` 에 `1000000000` 입력
- Then: `property-card` 6개(SD-02·04·05·06·09·10), `result-count` = `6건`, SD-01(₩2,500,000,000) 카드 없음
- 검증 데이터: 1000000000 (입력 단위 = 원, OQ-02 해결)

#### AC-029 — 가격 범위 필터(경계 포함)
- 연결 REQ: REQ-008 · 우선순위: Must · 검증 방법: UI 자동화(Playwright)
- Given: AC-024 상태
- When: (a) `filter-min-price` `500000000` + `filter-max-price` `1000000000`, (b) 둘 다 `850000000`
- Then: (a) 4개(SD-02·05·06·10) `4건`, (b) 1개(SD-02) `1건`
- 검증 데이터: (a), (b)

#### AC-030 — 최소 침실 수 필터
- 연결 REQ: REQ-008 · 우선순위: Must · 검증 방법: UI 자동화(Playwright)
- Given: AC-024 상태
- When: `filter-min-bedrooms` 에서 `3개 이상` 선택, 이어서 `4개 이상` 선택
- Then: `3개 이상` → 7개 `7건`, `4개 이상` → 3개(SD-01·05·07) `3건`
- 검증 데이터: 3 / 4

#### AC-031 — 복합 필터 + 판매완료 결과
- 연결 REQ: REQ-008 · 우선순위: Must · 검증 방법: UI 자동화(Playwright)
- Given: AC-024 상태
- When: `filter-keyword` `서울` → `filter-min-bedrooms` `3개 이상` → `filter-max-price` `2000000000`
- Then: 각 단계 결과 3 → 2 → 1건. 최종 카드 1개 = `송파 잠실 아파트`, `₩1,980,000,000`, 배지 `판매완료`(회색, `data-status="Sold"`)
- 검증 데이터: SD-08

#### AC-032 — 판매완료 매물 기본 노출(상태로 제외하지 않음)
- 연결 REQ: REQ-008, REQ-007 · 우선순위: Must · 검증 방법: UI 자동화(Playwright)
- Given: AC-024 상태
- When: `filter-min-price` `900000000` 입력
- Then: 결과 5개(SD-01·03·05·07·08) `5건`. 이 중 `data-status="Sold"` 배지 2개(SD-05, SD-08), `Under Contract` 2개. 필터 패널에 "판매완료 제외" 류의 기본 체크 옵션 없음
- 검증 데이터: 900000000 (≥ 기준: 01=2.5B, 03=1.2B, 05=0.98B, 07=1.65B, 08=1.98B)

#### AC-033 — 필터 초기화
- 연결 REQ: REQ-008 · 우선순위: Must · 검증 방법: UI 자동화(Playwright)
- Given: AC-031 의 최종 상태(1건)
- When: `filter-reset` 클릭
- Then: `filter-keyword`·`filter-min-price`·`filter-max-price` 값 빈 문자열, `filter-min-bedrooms` = `전체`, `property-card` 10개 `10건`
- 검증 데이터: —

#### AC-034 — 입력 디바운스
- 연결 REQ: REQ-008 (NFR-002) · 우선순위: Should · 검증 방법: UI 자동화(Playwright)
- Given: AC-024 상태, `PropertyController.getProperties` 로 가는 Aura 요청(`/aura?...ApexAction.execute`) 카운터 0 으로 초기화
- When: `filter-keyword` 에 `송파 잠실` 을 글자 간격 50ms 로 순차 입력(`pressSequentially`) 후 1,000ms 대기
- Then: 입력 동안 발생한 조회 요청이 1회(최대 2회 허용), 최종 결과 1개(SD-08)
- 검증 데이터: `송파 잠실`, 간격 50ms, 디바운스 300ms

### REQ-009 매물 상세 화면

#### AC-035 — 탐색 화면 내 상세 패널(전체 속성)
- 연결 REQ: REQ-009 · 우선순위: Must · 검증 방법: UI 자동화(Playwright)
- Given: `agent` 로그인, "매물 탐색" 탭, 현재 URL 기록
- When: SD-07 `property-card` 클릭
- Then: URL 변경 없음, `property-detail` 표시 — `detail-image`(카드 이미지보다 큰 너비), `detail-name` = `제주 애월 전원주택`, `detail-address` = `제주특별자치도 제주시 애월읍 애월해안로 77`, `detail-city` = `제주`, `detail-price` = `₩1,650,000,000`, `detail-bedrooms` = `5`, `detail-bathrooms` = `3`, `detail-status-badge` = `계약중`(`slds-theme_warning`). `detail-state` 는 CK-11
- 검증 데이터: SD-07

#### AC-036 — 다른 카드 선택 시 패널 교체
- 연결 REQ: REQ-009 · 우선순위: Must · 검증 방법: UI 자동화(Playwright)
- Given: AC-035 상태(SD-07 표시 중)
- When: SD-02 카드 클릭
- Then: `property-detail` 1개만 존재, `detail-name` = `해운대 오션뷰`, `detail-price` = `₩850,000,000`, `detail-status-badge` = `판매중`. 필터·카드 목록(10건)은 유지
- 검증 데이터: SD-07 → SD-02

#### AC-037 — 미선택 초기 상태
- 연결 REQ: REQ-009 · 우선순위: Must · 검증 방법: UI 자동화(Playwright)
- Given: `agent` 로그인
- When: "매물 탐색" 탭에 진입한 직후(카드 클릭 전)
- Then: `detail-empty` 표시, 텍스트 `매물을 선택하면 상세 정보가 표시됩니다.`(CK-09), `detail-name` 없음
- 검증 데이터: —

#### AC-038 — 관리자에게만 편집 진입점
- 연결 REQ: REQ-009, REQ-004 · 우선순위: Must · 검증 방법: UI 자동화(Playwright)
- Given: `admin` 로그인, SD-02 상세 패널 표시
- When: `detail-edit-button` 클릭
- Then: 버튼이 보이고 활성 상태, 클릭 시 `detail-edit-form`(또는 표준 Edit 모달)이 열리며 매물명 입력값 `해운대 오션뷰`, URL 의 탐색 탭 경로 유지. 같은 화면을 `agent` 로 열면 `detail-edit-button` 개수 0(→ AC-054)
- 검증 데이터: SD-02

#### AC-039 — 상세 패널 대체 이미지
- 연결 REQ: REQ-009, REQ-006 · 우선순위: Must · 검증 방법: UI 자동화(Playwright)
- Given: `agent` 로그인
- When: SD-09 카드 클릭
- Then: `detail-image` 의 `src` 에 `propertyPlaceholder` 포함, `alt` = `송도 센트럴 오피스텔`, `detail-price` = `₩350,000,000`
- 검증 데이터: SD-09

### REQ-010 매물 탐색 앱/화면 구성

#### AC-040 — 앱·탭 내비게이션과 3영역 레이아웃
- 연결 REQ: REQ-010 · 우선순위: Must · 검증 방법: UI 자동화(Playwright)
- Given: `agent` 로그인, 뷰포트 1440×900
- When: 앱 런처에서 `DreamHouse Lite` 검색·선택 → 내비게이션의 `매물 탐색` 탭 클릭 → SD-01 카드 클릭
- Then: 앱 이름 `DreamHouse Lite` 표시, 내비게이션에 `매물 탐색`·`매물` 탭 존재. `filter-panel`, `property-list`, `property-detail` 모두 표시되고 bounding box x 좌표가 filter-panel < property-list < property-detail(좌측 필터 + 중앙 그리드 + 상세 패널, OQ-10 해결)
- 검증 데이터: SD-01

#### AC-041 — 관리자도 같은 화면 사용
- 연결 REQ: REQ-010, REQ-002 · 우선순위: Must · 검증 방법: UI 자동화(Playwright)
- Given: `admin` 로그인
- When: AC-040 과 같은 경로로 진입
- Then: `property-card` 10개 `10건`, 3영역 표시. `noaccess` 사용자의 앱 런처 검색 결과에는 `DreamHouse Lite` 없음(→ AC-055)
- 검증 데이터: SD-01~SD-10

### REQ-011 상태 관리 및 즉시 반영

> 즉시 반영 범위는 **같은 사용자 화면**으로 검증한다. 다른 사용자 화면 실시간 반영은 OQ-11 미해결(CK-08).

#### AC-042 — 상세 패널에서 상태 변경 → 카드·배지 즉시 반영
- 연결 REQ: REQ-011, REQ-009 · 우선순위: Must · 검증 방법: UI 자동화(Playwright)
- Given: `admin` 로그인, "매물 탐색" 탭, SD-02(판매중) 상세 패널 표시, `window.__noReload = true` 마커 설정
- When: `detail-edit-button` → `detail-status-input` 에서 `계약중` 선택 → `detail-save-button`
- Then: 2초 이내 성공 토스트, SD-02 카드 `property-status-badge` = `계약중`(`data-status="Under Contract"`, 주황), `detail-status-badge` = `계약중`, `result-count` = `10건` 유지, `window.__noReload === true`(브라우저 새로고침 없음). `afterEach` 에서 `Available` 로 복원
- 검증 데이터: SD-02 Available → Under Contract

#### AC-043 — 판매완료로 변경해도 목록에 남음
- 연결 REQ: REQ-011, REQ-008 · 우선순위: Must · 검증 방법: UI 자동화(Playwright)
- Given: `admin` 로그인, `filter-keyword` = `대전` 으로 1건(SD-06, 판매중) 표시, SD-06 상세 패널 표시
- When: 상태를 `판매완료` 로 변경·저장
- Then: 카드 1개 유지(`1건`), 배지 `판매완료`(회색, `data-status="Sold"`), 필터 입력값 `대전` 유지, 새로고침 없음. 복원: `Available`
- 검증 데이터: SD-06 Available → Sold

#### AC-044 — 표준 레코드 페이지에서 변경 후 탐색 화면 복귀 시 반영
- 연결 REQ: REQ-011, REQ-004 · 우선순위: Should · 검증 방법: UI 자동화(Playwright)
- Given: `admin` 로그인, "매물 탐색" 탭을 한 번 로드해 SD-03 배지 `계약중` 확인
- When: `매물` 탭 → SD-03 레코드 페이지에서 상태를 `판매중` 으로 편집·저장 → 내비게이션의 `매물 탐색` 탭 클릭(브라우저 새로고침 없음)
- Then: SD-03 카드 배지 = `판매중`(cacheable 캐시로 인한 이전 값 `계약중` 표시 없음). 복원: `Under Contract`
- 검증 데이터: SD-03 Under Contract → Available

### REQ-012 공통 UX

#### AC-045 — 반응형 레이아웃(데스크톱/모바일)
- 연결 REQ: REQ-012 (NFR-008) · 우선순위: Must · 검증 방법: UI 자동화(Playwright)
- Given: `agent` 로그인, 조건 없음
- When: 뷰포트 (a) 1440×900, (b) 375×812 로 "매물 탐색" 탭을 연다
- Then: (a) 첫 행 카드 3개 이상(같은 y 좌표 카드 ≥ 3), `filter-panel` 이 `property-list` 왼쪽 / (b) 행당 카드 1개(모든 카드 x 좌표 동일), `filter-panel` 이 `property-list` 위쪽, `document.documentElement.scrollWidth ≤ 375`(가로 스크롤 없음). 두 경우 모두 10건
- 검증 데이터: 뷰포트 2종 (모바일 앱 범위는 CK-13)

#### AC-046 — 로딩 스피너
- 연결 REQ: REQ-012, REQ-007 · 우선순위: Must · 검증 방법: UI 자동화(Playwright)
- Given: `agent` 로그인, `page.route` 로 `getProperties` Aura 요청 응답을 1,500ms 지연
- When: `filter-keyword` 에 `부산` 입력
- Then: 응답 대기 중 `loading-spinner` 표시(접근성 텍스트 `로딩 중` 등 대체 텍스트 존재), 응답 후 `loading-spinner` 사라지고 카드 2개
- 검증 데이터: `부산`, 지연 1,500ms

#### AC-047 — 조회 오류 토스트
- 연결 REQ: REQ-012, REQ-007 · 우선순위: Must · 검증 방법: UI 자동화(Playwright, 네트워크 모의) — 모의가 불안정하면 수동 QA 로 대체
- Given: `agent` 로그인, `getProperties` Aura 응답을 오류(state `ERROR`)로 모의
- When: `filter-keyword` 에 `서울` 입력
- Then: error variant 토스트 `매물 정보를 불러오지 못했습니다.`(CK-09) 표시, `loading-spinner` 미표시, 화면 깨짐(빈 흰 화면) 없음
- 검증 데이터: 모의 오류 응답

#### AC-048 — 접근성 라벨·키보드 조작
- 연결 REQ: REQ-012 (NFR-008) · 우선순위: Must · 검증 방법: UI 자동화(Playwright)
- Given: `agent` 로그인
- When: `getByLabel('키워드')`, `getByLabel('최소 가격')`, `getByLabel('최대 가격')`, `getByLabel('최소 침실 수')` 로 입력 요소를 찾고, Tab 키로 SD-01 카드에 포커스 후 Enter
- Then: 4개 라벨 모두 1개 요소로 해석, 각 `property-card` 에 `aria-label` 이 매물명과 가격을 포함(예: `강남 래미안 아파트, ₩2,500,000,000`), Enter 시 `detail-name` = `강남 래미안 아파트`
- 검증 데이터: SD-01

### REQ-013 상세 위치 지도 (Could)

#### AC-049 — 상세 패널 지도 표시
- 연결 REQ: REQ-013 · 우선순위: Could · 검증 방법: UI 자동화(Playwright)
- Given: `agent` 로그인, REQ-013 구현(WI-1.006)
- When: SD-01 카드 클릭
- Then: `property-detail` 안에 `detail-map` 1개, 마커 1개, 마커 제목 `강남 래미안 아파트` (잠정 — CK-11, OQ-01·OQ-13: 주소 체계와 스파이크 결과에 따라 입력 형식 변경)
- 검증 데이터: SD-01 주소 `서울특별시 강남구 테헤란로 101`

#### AC-050 — 주소 지오코딩 불가 시 처리
- 연결 REQ: REQ-013 · 우선순위: Could · 검증 방법: UI 자동화(Playwright)
- Given: 관리자가 만든 `[E2E] 주소 없음 매물`(Address__c 빈 값, City__c 빈 값, Price 100000000)
- When: 해당 카드 클릭
- Then: `detail-map` 미표시, 상세 패널 나머지 속성은 표시, 오류 토스트 없음 (잠정 — CK-11)
- 검증 데이터: 위 레코드

### REQ-014 유사 매물 추천 (Could)

> 판정 기준 미확정(OQ-13). 아래는 FIT-GAP §4.2 대안 (A) 를 **잠정 규칙**으로 적용: 동일 City__c + 가격 ±20% + 침실 ±1, 자기 자신·판매완료 제외 (CK-12).

#### AC-051 — 유사 매물 표시
- 연결 REQ: REQ-014 · 우선순위: Could · 검증 방법: UI 자동화(Playwright) + 단위(Apex)
- Given: `agent` 로그인, REQ-014 구현(WI-1.007)
- When: SD-02(부산, ₩850,000,000, 침실 3) 카드 클릭
- Then: `similar-list` 에 `similar-card` 1개 = `서면 스카이 빌라`(₩720,000,000: 680,000,000~1,020,000,000 범위, 침실 2) (잠정 — CK-12)
- 검증 데이터: SD-02 → SD-10

#### AC-052 — 유사 매물 없음 안내
- 연결 REQ: REQ-014 · 우선순위: Could · 검증 방법: UI 자동화(Playwright)
- Given: AC-051 과 같음
- When: SD-07(제주 유일) 카드 클릭
- Then: `similar-card` 0개, `similar-empty` 표시 (잠정 — CK-12; SD-01 도 서울 매물 중 SD-04 는 가격 범위 밖, SD-08 은 판매완료라 0건)
- 검증 데이터: SD-07

### REQ-015 ~ REQ-018 (Won't) — 인수기준 제외

| REQ | 제외 사유 |
|---|---|
| REQ-015 중개인별 담당 매물 | Phase 1 Won't(D-05, RFP F6 2차). 데이터 모델·담당자 정의(중개인 = 사용자 여부) 미정 |
| REQ-016 관심 매물 | Phase 1 Won't(D-06). 표준 즐겨찾기/팔로우 대체안 결정 전(D-14) |
| REQ-017 가격대 분포 차트 | Phase 1 Won't(D-07). 표준 리포트로 갈지 미정(D-14) |
| REQ-018 홈/대시보드 | Phase 1 Won't(D-08, RFP S4 선택) |

> Won't 항목에는 AC ID 를 미리 부여하지 않는다(쓰이지 않는 ID 를 만들지 않기 위함). 2차 Phase 에서 범위가 확정되면 다음 일련번호(AC-071~)로 ADD 한다.

---

## 3. 추적성 매트릭스

> ~~WI 는 REQUIREMENT §13.3 매핑 초안 기준 **(예정)**. 번호는 PROJECT-PLAN 에서 확정 후 ENHANCE 한다. 테스트 파일도 모두 **(예정)** 이며 STEP 10 에서 생성한다.~~
> (ENHANCED 2026-10-28: WI 열을 PROJECT-PLAN v1.1 §7 과 각 `docs/work-items/WI-1.00n-*.md` FrontMatter `ac-ids` 기준으로 **(확정 2026-10-28)**. 테스트 파일명은 WI 문서와 동일하며 파일 생성은 STEP 10. 변경된 셀은 구 값을 취소선으로 남김. 한 AC 가 여러 WI 에 걸치면 부분별 소유 WI 를 괄호로 표기)
> Apex 테스트 클래스: `PropertyModelTest`(스키마·권한, WI-1.001), `PropertyControllerTest`(조회 서비스, WI-1.003·1.004).

| REQ | AC | WI (확정 2026-10-28) | 테스트 파일 (확정 2026-10-28, 생성은 STEP 10) |
|---|---|---|---|
| REQ-001 | AC-001, AC-002, AC-003 | WI-1.001 | `force-app/main/default/classes/PropertyModelTest.cls` |
| REQ-002 | AC-004, AC-005 · AC-006 · (예외) AC-053, AC-054, AC-055 · (비기능) AC-067 | ~~WI-1.001 (Apex 클래스 권한은 WI-1.003, 앱 권한은 WI-1.005 에서 보강)~~ WI-1.001: AC-004(권한 벡터), 005, 006, 053, 067 / WI-1.003: AC-004(조회부), AC-055(Apex) / WI-1.005: AC-054, AC-055(UI) | `PropertyModelTest.cls`, `PropertyControllerTest.cls`, `tests/e2e/WI-1.001-property-crud.spec.ts`, `tests/e2e/WI-1.005-property-detail.spec.ts` |
| REQ-003 | AC-007, AC-008 | WI-1.002 (AC-008 SIT/UAT 는 Lab 12) | 수동 QA 체크리스트(`sf data` 명령) |
| REQ-004 | AC-009, AC-010, AC-011, AC-012 · AC-006, AC-038, AC-044 · (예외) AC-053, AC-054, AC-060, AC-061 | ~~WI-1.001~~ WI-1.001: AC-006, 009~012, 053, 060, 061(잠정) / WI-1.005: AC-038, 054 / WI-1.003: AC-044(Should) | `tests/e2e/WI-1.001-property-crud.spec.ts`, `tests/e2e/WI-1.005-property-detail.spec.ts`, `tests/e2e/WI-1.003-property-list.spec.ts` |
| REQ-005 | AC-013 ~ AC-019 · (예외) AC-055, AC-056, AC-057, AC-062 · (비기능) AC-065, AC-066, AC-070 | ~~WI-1.003 (조건 확장분 WI-1.004)~~ WI-1.003: AC-013, 018, 019, 055(Apex), 062(잠정), 065, 066, 070 / WI-1.004: AC-014~017, 056, 057(잠정), 065·066·070 재확인 | `force-app/main/default/classes/PropertyControllerTest.cls` |
| REQ-006 | AC-020, AC-021, AC-022, AC-023 | WI-1.002 | `tests/e2e/WI-1.002-property-tile.spec.ts` |
| REQ-007 | AC-024, AC-025 · AC-026 · AC-032, AC-046, AC-047 · (비기능) AC-063 | WI-1.003 (AC-026 은 상세 패널이 생기는 WI-1.005 에서 검증) — AC-032 는 WI-1.003(목록·건수 렌더링)·WI-1.004(가격 조건) 공동 매핑 | `tests/e2e/WI-1.003-property-list.spec.ts`, `tests/e2e/WI-1.004-search-filter.spec.ts`(AC-032), `tests/e2e/WI-1.005-property-detail.spec.ts` |
| REQ-008 | AC-027 ~ AC-034 · (예외) AC-057, AC-058, AC-059 · (비기능) AC-064 | WI-1.004 (AC-032 는 WI-1.003 과 공동) | `tests/e2e/WI-1.004-search-filter.spec.ts` |
| REQ-009 | AC-035 ~ AC-039 · AC-026 · (예외) AC-054 | WI-1.005 | `tests/e2e/WI-1.005-property-detail.spec.ts` |
| REQ-010 | AC-040, AC-041 · (예외) AC-055 | WI-1.005 (AC-055 UI 부분. Apex 부분은 WI-1.003) | `tests/e2e/WI-1.005-property-detail.spec.ts` |
| REQ-011 | AC-044 · AC-042, AC-043 | AC-044 → WI-1.003 (Should, E2E 는 WI-1.005 회귀) / AC-042·043 → WI-1.005 (상세 반영 검증) | `tests/e2e/WI-1.003-property-list.spec.ts`, `tests/e2e/WI-1.005-property-detail.spec.ts` |
| REQ-012 | AC-045 ~ AC-048 · (비기능) AC-068 | ~~모든 UI WI(1.002~1.005) 공통, 최종 검증 WI-1.005~~ WI-1.003: AC-046, 047 / WI-1.005: AC-045, 048, 068(Should) | `tests/e2e/WI-1.003-property-list.spec.ts`, `tests/e2e/WI-1.005-layout-a11y.spec.ts` |
| REQ-013 (Could) | AC-049, AC-050 | (Stretch) WI-1.006 | `tests/e2e/WI-1.006-property-map.spec.ts` |
| REQ-014 (Could) | AC-051, AC-052 | (Stretch) WI-1.007 | `tests/e2e/WI-1.007-similar-properties.spec.ts`, `PropertyControllerTest.cls` |
| REQ-015~018 (Won't) | — (제외, §2 끝) | — | — |
| NFR-001 | AC-063, AC-064 | WI-1.003(AC-063), WI-1.004(AC-064) — 측정은 DH-SIT, Lab 12 | `tests/e2e/WI-1.003-property-list.spec.ts`, `tests/e2e/WI-1.004-search-filter.spec.ts` (`@perf`) |
| NFR-002 | AC-034, AC-070 | WI-1.004(AC-034), WI-1.003·WI-1.004(AC-070) | `WI-1.004-search-filter.spec.ts`, 코드 리뷰 |
| NFR-003 | AC-056, AC-065 | ~~WI-1.003~~ WI-1.004(AC-056), WI-1.003·WI-1.004(AC-065) | `PropertyControllerTest.cls`, Code Analyzer |
| NFR-004 | AC-004, AC-005, AC-053, AC-054, AC-055 | ~~WI-1.001~~ WI-1.001(AC-004 권한 벡터, 005, 053) / WI-1.003(AC-004 조회부, AC-055 Apex) / WI-1.005(AC-054, AC-055 UI) | `PropertyModelTest.cls`, `PropertyControllerTest.cls`, `WI-1.001-property-crud.spec.ts`, `WI-1.005-property-detail.spec.ts` |
| NFR-005 | AC-067 | 전체 (WI-1.001~1.005 모두 ac-ids 포함) | 수동 QA |
| NFR-006 | AC-066 | WI-1.003 (WI-1.004 재확인) | `sf apex run test` 결과 |
| NFR-007 | AC-065 | 전체 (ac-ids 기준 WI-1.003·WI-1.004, 이후 WI 는 품질 게이트로 재확인) | `sf code-analyzer` 결과 |
| NFR-008 | AC-045, AC-048, AC-068 | WI-1.005 | `WI-1.005-layout-a11y.spec.ts` |
| NFR-010 | AC-069 | ~~전체~~ Phase 1 종료(Lab 13) — WI ac-ids 미포함 | 수동 QA |

**WI-1.005 전체 UI 회귀로 이월(deferred)되는 AC** (ADDED 2026-10-28: PROJECT-PLAN §7.2 · PHASE-PLAN-01 §3.4 · WI-1.005 문서 §6 과 동일) — `매물 탐색` 탭이 WI-1.005 에서 생성되므로 아래 AC 의 Playwright 는 원 WI spec 에 `@explore` 로 작성하고 WI-1.005 `npx playwright test` 에서 최종 판정한다.

| 원 WI | 이월 AC | spec |
|---|---|---|
| WI-1.001 | AC-009, 011, 012, 060 (탐색 탭 부분) | `tests/e2e/WI-1.001-property-crud.spec.ts` |
| WI-1.002 | AC-020, 021, 022, 023 | `tests/e2e/WI-1.002-property-tile.spec.ts` |
| WI-1.003 | AC-024, 025, 032, 044(Should), 046, 047 | `tests/e2e/WI-1.003-property-list.spec.ts` |
| WI-1.004 | AC-027 ~ 033, 034(Should), 059 | `tests/e2e/WI-1.004-search-filter.spec.ts` |
| 잠정 | AC-057(CK-04), 058(CK-03), 061(CK-05) — CK 해소 시에만 포함 | 각 원 WI spec (`test.fixme`) |

- 회귀 범위 외: AC-063·064(성능)·AC-008(SIT/UAT) → Lab 12, AC-069 → Lab 13, AC-004 조회 10건 → WI-1.003(Apex).

**AC 역방향 확인**: AC-001~AC-070 은 모두 위 표의 REQ 또는 NFR 행 중 하나 이상에 나타난다(고아 AC 없음). REQ-001~REQ-014 는 모두 1개 이상의 AC 를 가진다.

---

## 4. 경계 / 예외(negative) 인수기준

#### AC-053 — 상담원의 DML 은 거부된다
- 연결 REQ: REQ-002, REQ-004 (NFR-004) · 우선순위: Must · 검증 방법: 단위(Apex)
- Given: `DreamHouse_Agent` 사용자, SD-02 존재
- When: `System.runAs(agent)` 에서 (a) `Database.insert(new Property__c(Name='[E2E] 상담원 등록', Price__c=100000000), AccessLevel.USER_MODE)`, (b) SD-02 Status__c=`Sold` 로 `Database.update(.., AccessLevel.USER_MODE)`, (c) SD-02 `Database.delete(.., AccessLevel.USER_MODE)`
- Then: 세 경우 모두 예외(권한 부족) 발생, 이후 SD-02 의 Status__c = `Available` 이고 레코드 존재, `[E2E] 상담원 등록` 0건
- 검증 데이터: SD-02

#### AC-054 — 상담원 화면에 상태 변경·편집 UI 없음
- 연결 REQ: REQ-002, REQ-004, REQ-009, REQ-011 · 우선순위: Must · 검증 방법: UI 자동화(Playwright)
- Given: `agent` 로그인, "매물 탐색" 탭
- When: SD-02 카드 클릭 후 상세 패널과 카드 영역을 확인한다
- Then: `detail-edit-button`·`detail-edit-form`·`detail-status-input` 개수 0, 카드·배지 클릭 시 상태 변경 메뉴 없음(배지는 표시 전용). AC-006 과 함께 상담원 상태 변경 경로 0개(OQ-07 해결)
- 검증 데이터: SD-02

#### AC-055 — 권한 세트 미할당 사용자 차단
- 연결 REQ: REQ-002, REQ-005, REQ-010 · 우선순위: Must · 검증 방법: 단위(Apex) + UI 자동화(Playwright)
- Given: `noaccess` 사용자(Standard User, 권한 세트 없음)
- When: (Apex) `System.runAs(noaccess)` 에서 `getProperties`(조건 없음) 호출 / (UI) 앱 런처에서 `DreamHouse Lite` 검색
- Then: (Apex) 예외 발생(`AuraHandledException` 또는 `QueryException` — USER_MODE 로 오브젝트 접근 거부), 데이터 반환 없음 / (UI) 검색 결과 0건
- 검증 데이터: —

#### AC-056 — SOQL 인젝션 입력
- 연결 REQ: REQ-005 (NFR-003) · 우선순위: Must · 검증 방법: 단위(Apex)
- Given: SD-01~SD-10
- When: keyword 를 `' OR Name LIKE '%` 와 `서울' OR City__c != '` 로 각각 호출
- Then: 두 경우 모두 예외 없이 0건(문자열이 그대로 바인드되어 일치 매물 없음), 10건 반환되지 않음
- 검증 데이터: 위 2개 문자열

#### AC-057 — 빈 값·공백 키워드
- 연결 REQ: REQ-005, REQ-008 · 우선순위: Must · 검증 방법: 단위(Apex) + UI 자동화(Playwright)
- Given: SD-01~SD-10
- When: keyword `''`(빈 문자열), `'   '`(공백 3자) 로 호출 / UI 에서 `filter-keyword` 에 공백 3자 입력
- Then: 모두 키워드 조건 미적용으로 10건(`10건`) (공백 trim 은 잠정 — CK-04)
- 검증 데이터: `''`, `'   '`

#### AC-058 — 최소 가격 > 최대 가격
- 연결 REQ: REQ-008 · 우선순위: Must · 검증 방법: UI 자동화(Playwright)
- Given: AC-024 상태
- When: `filter-min-price` `1000000000`, `filter-max-price` `500000000` 입력
- Then: (잠정 — CK-03) `filter-price-error` 에 `최소 가격이 최대 가격보다 클 수 없습니다.` 표시, `property-card` 0개 `0건`, 오류 토스트 없음
- 검증 데이터: min 1000000000 / max 500000000

#### AC-059 — 음수·비숫자 가격 입력
- 연결 REQ: REQ-008 · 우선순위: Must · 검증 방법: UI 자동화(Playwright)
- Given: AC-024 상태
- When: `filter-max-price` 에 `-100` 입력, 이어서 `abc` 입력 시도
- Then: `-100` → 입력 요소 `aria-invalid="true"`(최소값 0 위반 메시지), 목록은 갱신되지 않고 10건 유지 / `abc` → 숫자 입력 요소에 값이 들어가지 않음(값 빈 문자열), 10건 유지
- 검증 데이터: `-100`, `abc`

#### AC-060 — 가격 자릿수 한도 초과 등록
- 연결 REQ: REQ-004 · 우선순위: Must · 검증 방법: UI 자동화(Playwright)
- Given: `admin` 로그인, `새로 만들기` 폼
- When: 매물명 `[E2E] 한도 초과`, 가격 `1000000000000`(13자리) 입력 후 `저장`
- Then: 가격 필드 오류 표시로 저장 실패, `[E2E] 한도 초과` 0건. 가격 `999999999999`(12자리 최대) 는 저장 성공 후 카드에 `₩999,999,999,999` 표시(테스트 후 삭제)
- 검증 데이터: 1000000000000 / 999999999999 (Currency(12,0))

#### AC-061 — 가격 0·음수 등록
- 연결 REQ: REQ-004 · 우선순위: Must · 검증 방법: UI 자동화(Playwright)
- Given: `admin` 로그인, `새로 만들기` 폼
- When: 매물명 `[E2E] 가격 검증`, 가격 `0` / `-1` 로 각각 `저장`
- Then: (잠정 — CK-05, OQ-03) 유효성 규칙 오류 `가격은 0보다 커야 합니다.` 표시, 레코드 미생성
- 검증 데이터: 0, -1

#### AC-062 — 조회 결과 건수 상한
- 연결 REQ: REQ-005 (NFR-002) · 우선순위: Must · 검증 방법: 단위(Apex)
- Given: `@testSetup` 에 Property__c 를 상한 N + 1 건 생성(N 은 OQ-09 확정값)
- When: 조건 없이 `getProperties` 호출
- Then: (잠정 — CK-06) 반환 건수 = N, 예외 없음
- 검증 데이터: N + 1 건

---

## 5. 비기능 인수기준

#### AC-063 — 초기 목록 응답 1초 이내
- 연결 REQ: REQ-007 (NFR-001) · 우선순위: Must · 검증 방법: UI 자동화(Playwright)
- Given: DH-SIT, `agent` 로그인, SD-01~SD-10, 캐시 미적용 상태로 5회 측정
- When: "매물 탐색" 탭 진입
- Then: `getProperties` 요청 시작 → `property-card` 10개 렌더 완료까지 중앙값 ≤ 1,000ms, 최대 ≤ 1,500ms (Lightning 페이지 자체 로드 시간은 제외 — 측정 정의 CK-07)
- 검증 데이터: 5회 측정값

#### AC-064 — 검색 응답 1초 이내
- 연결 REQ: REQ-008 (NFR-001) · 우선순위: Must · 검증 방법: UI 자동화(Playwright)
- Given: AC-063 과 같음
- When: `filter-keyword` 에 `서울`, `filter-min-bedrooms` `3개 이상`, `filter-max-price` `2000000000` 을 각각 입력(5회씩)
- Then: 각 요청의 서버 응답 시간 중앙값 ≤ 1,000ms, 마지막 입력 → 목록 갱신 완료 ≤ 1,300ms(디바운스 300ms 포함) (CK-07)
- 검증 데이터: 기대 건수 3 / 2 / 1

#### AC-065 — Apex 보안 규칙·정적 분석
- 연결 REQ: REQ-005 (NFR-003, NFR-007) · 우선순위: Must · 검증 방법: 수동 QA (코드 리뷰 + `sf code-analyzer`)
- Given: WI-1.003 / WI-1.004 의 Apex 소스
- When: code_reviewer 리뷰와 `sf code-analyzer run --workspace . --view table` 실행
- Then: 모든 Apex 클래스 선언에 `with sharing`, 모든 SOQL 에 `WITH USER_MODE`(또는 `AccessLevel.USER_MODE`), 사용자 입력 문자열 연결로 만든 SOQL 0건(바인드 변수만), 루프 내 SOQL/DML 0건, Code Analyzer Severity High 이상 0건
- 검증 데이터: 분석 결과 표

#### AC-066 — Apex 테스트 커버리지
- 연결 REQ: REQ-005 (NFR-006) · 우선순위: Must · 검증 방법: 단위(Apex)
- Given: `PropertyModelTest`, `PropertyControllerTest`
- When: `sf apex run test -l RunLocalTests -c -r human`
- Then: 실패 0건, 조직 전체 커버리지 ≥ 75%, `PropertyController` 커버리지 ≥ 85%(목표). 양성·음성(AC-018, AC-056)·권한(`System.runAs`, AC-004/053/055) 케이스 포함
- 검증 데이터: 테스트 결과 리포트

#### AC-067 — 비밀정보 미커밋
- 연결 REQ: REQ-002 (NFR-005) · 우선순위: Must · 검증 방법: 수동 QA
- Given: 각 WI 커밋 직전 저장소
- When: `git ls-files | grep -E "\.auth/|sfdx-url|accessToken"` 실행, `.gitignore` 확인
- Then: 검색 결과 0줄, `.gitignore` 에 `tests/e2e/.auth/` 포함
- 검증 데이터: —

#### AC-068 — 자동 접근성 검사
- 연결 REQ: REQ-012 (NFR-008) · 우선순위: Should · 검증 방법: UI 자동화(Playwright + `@axe-core/playwright`)
- Given: `agent` 로그인, SD-01 상세 패널이 열린 "매물 탐색" 탭
- When: axe 검사를 `filter-panel`, `property-list`, `property-detail` 영역으로 한정(include)해 실행
- Then: impact `serious`·`critical` 위반 0건, 이미지 `alt` 누락 0건, 상태 배지는 색상 외에 텍스트(`판매중` 등)로도 상태를 전달
- 검증 데이터: SD-01

#### AC-069 — 변경 추적성
- 연결 REQ: REQ-001~REQ-012 공통 (NFR-010) · 우선순위: Should · 검증 방법: 수동 QA
- Given: Phase 1 종료 시점(M6)
- When: DevOps Center Work Item 목록과 `git log --oneline` 을 대조
- Then: 배포된 모든 메타데이터 변경이 `WI-1.nnn-*` 이름의 커밋에 포함, 오그 직접 변경 후 retrieve 없이 남은 변경 0건, Property__c 에 고객 개인정보 필드 0개(OQ-08)
- 검증 데이터: WI 목록·커밋 목록

#### AC-070 — 조회 성능 설계 규칙
- 연결 REQ: REQ-005, REQ-008 (NFR-002) · 우선순위: Should · 검증 방법: 수동 QA (코드 리뷰)
- Given: `PropertyController`, `propertyFilter` 소스
- When: code_reviewer 리뷰
- Then: `getProperties` 에 `@AuraEnabled(cacheable=true)`, SOQL 에 상수 `LIMIT`(값 CK-06), 필터 입력 디바운스 300ms(±50ms) 구현, 조회 조건이 파라미터 객체(`PropertyFilter`)로 전달(NFR-009)
- 검증 데이터: —

---

## 6. AC 요약

| REQ | MoSCoW | AC (§2) | AC (§4 예외·§5 비기능 연결) | 합계 |
|---|---|---|---|---|
| REQ-001 | Must | AC-001~003 (3) | — | 3 |
| REQ-002 | Must | AC-004~006 (3) | AC-053, 054, 055, 067 | 7 |
| REQ-003 | Must | AC-007~008 (2) | — | 2 |
| REQ-004 | Must | AC-009~012 (4) | AC-006¹, 038¹, 044¹, 053, 054, 060, 061 | 8 (+3 공유) |
| REQ-005 | Must | AC-013~019 (7) | AC-055, 056, 057, 062, 065, 066, 070 | 14 |
| REQ-006 | Must | AC-020~023 (4) | AC-019¹, 039¹ | 4 (+2 공유) |
| REQ-007 | Must | AC-024~026 (3) | AC-032¹, 046¹, 047¹, 063 | 4 (+3 공유) |
| REQ-008 | Must | AC-027~034 (8) | AC-043¹, 057, 058, 059, 064, 070 | 13 (+1 공유) |
| REQ-009 | Must | AC-035~039 (5) | AC-026¹, 042¹, 054 | 6 (+2 공유) |
| REQ-010 | Must | AC-040~041 (2) | AC-055 | 3 |
| REQ-011 | Must | AC-042~044 (3) | AC-054 | 4 |
| REQ-012 | Must | AC-045~048 (4) | AC-068 | 5 |
| REQ-013 | Could | AC-049~050 (2) | — | 2 |
| REQ-014 | Could | AC-051~052 (2) | — | 2 |
| REQ-015~018 | Won't | 제외 | — | 0 |

¹ 다른 REQ 절에 정의되었으나 이 REQ 에도 연결된 AC. 총 AC 70개(AC-001~AC-070, 고유). 잠정 AC 8개: AC-049, 050, 051, 052, 057, 058, 061, 062 (CK 해소 전 WI 완료 조건에서 제외). AC-063/064 는 측정 정의(CK-07) 합의가 필요하나 기준값(1초)은 RFP 확정값이다.

---

## 7. 확인 필요 목록 (기대결과 미확정)

> 해소 시 해당 AC 를 ENHANCE 하고 "(잠정)" 표기를 제거한다. 고객 확인 항목은 REQUIREMENT §14 OQ 와 연결한다.

| CK-ID | 확인 내용 | 영향 AC | 연결 OQ | 확인 대상 / 시점 |
|---|---|---|---|---|
| CK-01 | "물리 삭제" 의 의미: Salesforce 표준 삭제는 휴지통에 15일 보관 후 영구 삭제된다. 휴지통 이동으로 충분한가, 즉시 영구 삭제(휴지통 비우기·Hard Delete)가 필요한가? | AC-012 | OQ-07 (후속) | 고객 / Phase 0 |
| CK-02 | 가격 표시 축약(만원/억) 미사용 가정, 필터 가격을 원 단위 전체 금액으로 입력하는 방식 수용 여부 | AC-020, 023, 028~032, 035 | OQ-15 | 고객 / 목업 리뷰 |
| CK-03 | 최소 가격 > 최대 가격 입력 시 동작(오류 문구 표시 + 0건 / 자동 교정 / 조건 무시) | AC-058 | — (신규) | 고객 / 목업 리뷰 |
| CK-04 | 공백만 입력한 키워드를 "조건 없음"으로 처리(trim)하는지 | AC-057 | — (신규) | 고객 / 목업 리뷰 |
| CK-05 | Name·Price·Status 외 필수 항목, 가격 > 0 유효성 규칙과 오류 문구, 침실/욕실 범위·소수점 욕실 허용 | AC-010, 061 | OQ-03 | 고객 / Phase 0 |
| CK-06 | 결과 정렬 기준·최대 건수(LIMIT N)·페이지네이션 여부 | AC-062, 070 (정렬은 전 AC 에서 미검증) | OQ-09 | 고객 / Phase 0 |
| CK-07 | 성능 "1초" 측정 정의: 서버 응답 기준인지 화면 반영 기준인지, 디바운스 포함 여부, 측정 오그(DH-SIT)·횟수(5회 중앙값) 합의 | AC-063, 064 | — (NFR-001 해석) | 고객 / Phase 0 |
| CK-08 | 즉시 반영 범위: 같은 사용자 화면이면 충분한지(현 AC 기준), 표준 레코드 페이지 경유 변경(AC-044) 반영 수준 수용 여부 | AC-042~044 | OQ-11 | 고객 / Phase 0 |
| CK-09 | UI 문구 확정: 빈 결과·상세 미선택·오류 토스트·건수 형식·침실 선택지(§1.5) | AC-025, 030, 037, 047 | — | 고객 / 목업 리뷰 |
| CK-10 | 사진 URL 도메인(CSP Trusted Sites)과 대체 이미지 디자인, 샘플 데이터 유효 사진 URL | AC-022, 039, §1.4 | OQ-05 | 고객 / Phase 0 |
| CK-11 | 시/도(State__c)·주소 체계 → 상세 패널 필드 목록과 지도 입력 형식 | AC-001, 035, 049, 050 | OQ-01 | 고객 / Phase 0 |
| CK-12 | 유사 매물 판정 기준(도시·가격 허용폭·침실 차·판매완료 제외·N건)과 Could 착수 여부 | AC-051, 052 | OQ-13 | 고객 / Phase 0 |
| CK-13 | Salesforce 모바일 앱 사용 여부(현재 브라우저 뷰포트 375px 만 검증) | AC-045 | OQ-12 | 고객 / Phase 0 |
| CK-14 | 배지 색상 톤 확인: 주황 = `slds-theme_warning`, 회색 = 기본 `slds-badge` 로 충분한지 | AC-021 | OQ-04 (후속) | 고객 / 목업 리뷰 |
| CK-15 | (기술) Scratch Org 기본 통화 KRW·로캘 ko_KR 설정 방법(scratch-def 설정 가능 여부)과 상태 필터(상태별 필터링) 미제공 가정 — 판매완료 기본 노출 결정 후 고객이 상태 필터를 요구하지 않는지 | AC-003, 032 | OQ-02/04 (후속) | backend_developer(기술) / 고객(상태 필터) |
| CK-16 | (기술, ADDED 2026-10-28) 테스트 사용자 `agent`·`noaccess` 의 프로필: `Standard User` 는 커스텀 오브젝트 기본 CRUD 를 가질 수 있어 권한 세트 기반 AC 가 무력화될 위험 → `Minimum Access - Salesforce` 프로필 + 권한 세트로만 권한 부여 권고(§1.3) | AC-004, 006, 053, 055 | — (신규) | backend_developer·test_engineer / WI-1.001 배포 직후 |
