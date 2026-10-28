# FIT / GAP / NUD 분석 — DreamHouse Lite 부동산 매물 관리 시스템

> Phase 0(본 개발 전 고객 협의) 산출물. 기준 문서 `docs/REQUIREMENT.md` v1.0 의 모든 `REQ-nnn` 을 Salesforce 표준 기능과 비교해 분류한다.
> 이 분류 결과는 `docs/PROJECT-PLAN.md` 의 공수·우선순위 산정과 `docs/phase-0/ACCEPTANCE-CRITERIA.md`(AC-nnn) 작성의 근거가 된다.

---

## 0. 문서 정보

| 항목 | 내용 |
|---|---|
| 문서명 | FIT-GAP-NUD — DreamHouse Lite |
| 버전 | v1.1 (Draft — 1차 고객 협의 반영: OQ-02/04/07/10 해소) |
| 작성일 | 2026-10-28 |
| 작성자 | 최정혁 (Solution Architect 역할, solution_architect 에이전트 활용) |
| 기준 문서 | `docs/REQUIREMENT.md` v1.0 (REQ-001~REQ-018, NFR-001~NFR-010, OQ-01~OQ-14), `docs/inputs/RFP.md` |
| 상태 | **협의 필요** 항목이 남아 있음. §5 Decision Log 와 §5.2 Open Questions 가 모두 해소되면 확정본으로 전환 (ENHANCED 2026-10-28: OQ-02/04/07/10 해소 반영 → v1.1. 잔여 협의 필요: OQ-01, OQ-03, OQ-05, OQ-06, OQ-09, OQ-11~OQ-14) |

### 0.1 변경 이력

| 버전 | 일자 | 작성자 | 유형 | 변경 내용 |
|---|---|---|---|---|
| v1.0 | 2026-10-28 | 최정혁 | 최초 작성 | REQ-001~REQ-018 FIT/GAP/NUD 분류, Decision Log 초안(RFP 명시 항목만 합의 처리) |
| v1.1 | 2026-10-28 | 최정혁 | ENHANCE | 고객 결정(2026-10-28, 최정혁) 반영: OQ-02 통화=KRW 단일 통화, OQ-04 판매완료 기본 노출+상태 배지 색상, OQ-07 관리자만 삭제·상담원 조회 전용, OQ-10 상세=탐색 화면 내 패널. REQ-009 GAP 확정(M 1.5h), D-11 합의, D-16~D-18 추가, §2/§3/§5/§6 해당 항목 ENHANCE |

> 갱신 규칙: 재작성하지 않고 DROP / ENHANCE / ADD 로 반영한다. `REQ-nnn`, `OQ-nn`, `D-nn` ID 는 바꾸지 않는다.

---

## 1. 개요

### 1.1 Phase 0 의 목적
- **범위 합의**: 본 개발 착수 전에 각 요구사항을 "표준으로 되는 것 / 개발해야 하는 것 / 추가 검증이 필요한 것"으로 나눠 고객과 범위·우선순위를 합의한다.
- **과도한 커스텀 방지**: 표준 기능(선언형 Config)으로 충족되는 요구는 코드로 만들지 않도록 먼저 걸러낸다. 2일·1인 일정(C-01)에서는 FIT 를 최대화하는 것이 가장 큰 일정 리스크 완화책이다(R-01).
- **리스크 조기 식별**: NUD 항목은 PoC/스파이크 필요 여부와 대안을 미리 정해 본 개발 중 재작업을 줄인다(R-06).
- **Open Questions 연결**: 분류가 고객 답변에 따라 바뀌는 항목은 OQ 번호로 연결해 "협의 필요"로 둔다. 추측으로 확정하지 않는다.

### 1.2 분류 기준

| 분류 | 정의 | 구현 수단 | 판단 질문 |
|---|---|---|---|
| **FIT** | 표준 기능·설정(Config)으로 충족. 커스텀 코드 불필요 | 커스텀 오브젝트/필드, 권한 세트, 페이지 레이아웃, Lightning App Builder, 리스트 뷰, 리포트/대시보드, `sf data import` | "설정만으로 RFP 문구를 그대로 만족하는가?" |
| **GAP** | 표준으로 불충족 → 커스터마이징/개발 필요. 구현 방법은 알려져 있고 리스크가 관리 가능 | Apex, LWC, Flow, LMS, LDS | "표준으로는 부족하지만 만드는 방법이 정해져 있는가?" |
| **NUD** | New(플랫폼·팀에 신규) / Unique(고객 고유 업무 규칙) / Difficult(고난도·고위험) → 추가 분석·PoC·아키텍처 결정 필요 | 스파이크, PoC, 고객 규칙 정의 후 GAP 로 전환 | "기준이 정해지지 않았거나 동작을 검증해 보지 않으면 공수를 추정할 수 없는가?" |

- **조건부 분류**: OQ 답변에 따라 분류가 바뀌면 `GAP (→FIT 가능, OQ-nn)` 형식으로 표기한다.
- **예상 공수**: 1인 기준 순수 작업시간(설계·구현·단위 테스트 포함, Playwright E2E·Promotion 제외). 규모: S ≤ 1h, M 1~2h, L 2~4h, XL > 4h 또는 PoC 선행 필요.
- **리스크**: 상(일정·품질에 직접 영향) / 중(재작업 가능성) / 하(영향 미미).
- 교재 예시 분류를 기준선으로 따른다: 매물 CRUD = FIT, 실시간 필터 LWC = GAP, 지도/유사 매물 = NUD.

---

## 2. FIT / GAP / NUD 분석 표

| REQ-ID | 요구사항 | 분류 | 표준기능명 또는 개발사유 | 표준 대체안 | 예상 공수 | 리스크 |
|---|---|---|---|---|---|---|
| REQ-001 | 매물 데이터 모델 (`Property__c`) | **FIT** | 커스텀 오브젝트·커스텀 필드(Text/Currency/Number/URL/Picklist), 선택목록 기본값(Available), 번역 워크벤치 또는 라벨로 한글 표시(A-04) | — (그 자체가 표준) | S (1.0h) | 중 — 주소 체계(OQ-01)·통화(OQ-02)·필수값(OQ-03)이 정해지지 않으면 필드 정의 재작업 (ENHANCED 2026-10-28: OQ-02 해소 — KRW 단일 통화, `Price__c` 는 Currency 필드 유지, 다중 통화 미사용 → FIT 유지·범위 불변. 기술 과제(WI-1.001): 현재 `config/project-scratch-def.json` 은 `language: en_US` 만 지정되어 기본 통화가 USD 로 생성될 수 있음 → scratch def 의 `country`/locale 설정 또는 Company Information(통화 로케일) 확인·조정 필요. 잔여 리스크: OQ-01, OQ-03) |
| REQ-002 | 역할별 권한 모델 (상담원/관리자) | **FIT** | 권한 세트 2종(오브젝트 CRUD, FLS, Apex 클래스 접근, 탭/앱 가시성). 공유는 조직 기본값(OWD) | 프로필 직접 수정 대신 권한 세트 사용(권고) | S (0.5h) | 중 — 삭제 권한 범위·상담원 상태 변경 가능 여부(OQ-07) 미확정 (ENHANCED 2026-10-28: OQ-07 해소 — 권한 세트 2종 확정: 관리자 = `Property__c` CRUD(물리 삭제 포함), 상담원 = Read 전용(상태 변경 불가). FIT 유지, 리스크 하로 하향) |
| REQ-003 | 시연용 샘플 데이터 (약 10건) | **FIT** | `sf data import tree --plan` (JSON 데이터 플랜), 오그별 동일 재현 | Data Import Wizard(수동, 재현성 낮음 — 비권고) | S (0.5h) | 하 — 엑셀 이관이 필요하면 범위 확대(OQ-06) |
| REQ-004 | 매물 등록·수정·삭제 (S3) | **FIT** | 표준 New/Edit/Delete 동작, 페이지 레이아웃(필수 필드), Lightning Record Page, 유효성 규칙(Validation Rule) | — (교재 기준 "매물 CRUD = FIT") | S (0.5h) | 중 — 유효성 규칙 내용(OQ-03), 물리 삭제 허용 여부(OQ-07) 미확정 (ENHANCED 2026-10-28: OQ-07 해소 — 관리자만 표준 Delete(물리 삭제) 허용, 상담원은 New/Edit/Delete 미노출. FIT 유지. 잔여: OQ-03) |
| REQ-005 | 매물 조회 Apex 서비스 | **GAP** | 표준에는 다중 조건(키워드+가격 범위+최소 침실) 동적 조회를 LWC 에 제공하는 수단이 없음 → `@AuraEnabled(cacheable=true)` Apex 필요 | 리스트 뷰 필터(조건 고정·실시간 아님 — RFP F3 불충족), `lightning/uiListsApi`(필터 동적 변경 불가) | M (2.0h, 테스트 클래스 포함) | 중 — 정렬·건수 상한·페이지네이션 미정(OQ-09), 판매완료 기본 노출 여부(OQ-04) (ENHANCED 2026-10-28: OQ-04 해소 — 판매완료 포함 전체 상태 기본 조회, 상태 조건 파라미터 불필요. 잔여: OQ-09) |
| REQ-006 | 매물 카드(타일) | **GAP** | 사진·가격·요약·상태 색상 배지를 담은 카드형 표시는 표준 컴포넌트에 없음 → LWC 개발 | 리스트 뷰 Kanban(상태별 컬럼, 사진 불가) — RFP F2 불충족 | M (1.5h) | 중 — 배지 색상 매핑(OQ-04), 통화 표시 형식(OQ-02), 외부 사진 CSP(OQ-05) (ENHANCED 2026-10-28: OQ-04 해소 — 배지 판매중 초록 / 계약중 주황 / 판매완료 회색. OQ-02 해소 — `lightning-formatted-number format-style="currency" currency-code="KRW"` 로 원 단위 전체 금액·천 단위 구분 표시. 잔여: OQ-05) |
| REQ-007 | 매물 목록(카드 그리드) | **GAP** | 반응형 카드 그리드·결과 건수·빈 결과 안내는 LWC 개발 필요 | 표준 리스트 뷰/관련 목록(테이블형) — 카드형 요구 불충족 | M (1.5h) | 중 — 크리티컬 패스 핵심(Day 1 완료 필수), 정렬·페이지네이션(OQ-09) |
| REQ-008 | 검색·필터 패널 (실시간) | **GAP** | 입력 즉시(디바운스) 목록 갱신하는 필터 UI 는 표준에 없음 → LWC + LMS(또는 이벤트) | 리스트 뷰 필터/글로벌 검색(실시간 아님, 가격 범위 UI 없음) — 교재 기준 "실시간 필터 LWC = GAP" | M (2.0h) | 중 — 가격 입력 단위(만원/억, OQ-02), 판매완료 기본 제외(OQ-04) (ENHANCED 2026-10-28: OQ-02 해소 — 가격 최소/최대 입력은 원 단위(KRW). OQ-04 해소 — 판매완료 기본 노출, 상태 필터 추가 불필요 → 범위 불변) |
| REQ-009 | 매물 상세 화면 (S2) | **GAP** ~~(→FIT 가능, OQ-10)~~ 확정 | 탐색 화면 내 분할 패널로 큰 사진+전체 속성을 보여주려면 LWC(`lightning-record-view-form` 기반) 필요 | 표준 Lightning Record Page + 수식 필드 `IMAGE(Picture_URL__c, ...)` 로 대표 사진 표시 → FIT. 단, 탐색 화면을 벗어나 레코드 페이지로 이동 | M (1.5h) / FIT 선택 시 S (0.5h) | 중 — 표시 방식(OQ-10)에 따라 공수 3배 차이, 외부 사진 CSP(OQ-05) (ENHANCED 2026-10-28: OQ-10 해소 — 상세는 탐색 화면 내 패널 → **GAP 확정**, 표준 대체안(레코드 페이지) 미채택. LWC 상세 패널, 카드 선택은 LMS 또는 부모 컴포넌트 상태 공유로 전달. 공수 **M (1.5h) 확정**. 잔여: OQ-05) |
| REQ-010 | 매물 탐색 앱/화면 구성 | **FIT** | Lightning App(App Manager), Lightning App Page(App Builder, 2/3열 템플릿), 탭·내비게이션 — 모두 선언형. 배치되는 LWC 개발은 REQ-006~009 에서 산정 | — | S (0.5h) | 하 — 상세 패널 배치는 OQ-10 결과에 연동 (ENHANCED 2026-10-28: OQ-10 해소 — App Page 에 상세 패널(REQ-009 LWC) 영역 배치. FIT 유지) |
| REQ-011 | 상태 관리 및 즉시 반영 | **GAP** (→NUD 가능, OQ-11) | 상태 변경 자체는 표준 편집(FIT). 같은 화면의 목록·카드·배지 동기화는 `refreshApex`/LDS `notifyRecordUpdateAvailable` + LMS 갱신 로직 필요 | 표준 레코드 페이지 편집 후 수동 새로고침(F5 "즉시 반영" 불충족). 경로(Path) 컴포넌트로 상태 변경 UX 표준화 가능 | M (1.0h) | 중 / 다른 사용자 화면까지 실시간 반영 요구 시 **상** (CDC/Platform Event + `lightning/empApi` → NUD 전환) (ENHANCED 2026-10-28: OQ-07 해소 — 상태 변경 주체는 관리자로 한정, 상담원은 조회 전용. 분류는 OQ-11 에 계속 종속) |
| REQ-012 | 공통 UX (반응형·스피너·토스트·SLDS·접근성) | **GAP** | 커스텀 LWC 에 대한 횡단 요구. SLDS 기본 컴포넌트(`lightning-spinner`, `ShowToastEvent`, `lightning-layout`)를 사용하므로 난이도 낮음 | 표준 페이지·레이아웃 부분은 자동 충족(FIT) | M (1.0h, 각 UI WI 에 분산) | 하 — 모바일 앱 사용 범위(OQ-12)에 따라 모바일 검증 범위 확대 |
| REQ-013 | 상세 위치 지도 | **NUD** | 표준 `lightning-map` 은 있으나 (New) 한국 주소 문자열의 지오코딩 정확도 미검증, 주소 필드 구조(OQ-01)에 종속, CSP·모바일 표시 미검증 | 수식 필드로 외부 지도 URL 하이퍼링크 제공(`HYPERLINK`) — 코드 없음, 화면 내 지도는 아님 | L (1.5h + 스파이크 1.0h) | 중 — 지오코딩 실패 시 지도 미표시. RFP §7 기준 2차 |
| REQ-014 | 유사 매물 추천 | **NUD** | (Unique) "유사"의 판정 기준(도시 동일? 가격 ±몇 %? 침실 수?)이 고객 고유 규칙이며 미정(OQ-13). 기준 확정 전 공수 추정 불가 | 표준 리스트 뷰 "같은 도시 매물" 링크 / 리포트 필터 — 추천 정렬 없음 | L (2.0h, 기준 확정 후 재산정) | 중 — 기준 미확정 시 재작업. Einstein 추천 등은 과설계(비권고) |
| REQ-015 | 중개인별 담당 매물 | **FIT** (2차) | 표준 레코드 소유자(OwnerId) + 리스트 뷰("내 매물", 소유자별) + 레코드 소유권 이전. 중개인이 Salesforce 사용자가 아닐 경우에만 Lookup 필드 추가(여전히 선언형) | 별도 `Broker__c` 오브젝트(데이터 모델 확장) — 사용자 아닌 중개인 관리 시에만 | S (1.0h) | 하 — 중개인 = 사용자 여부는 2차 착수 시 확인 |
| REQ-016 | 관심 매물 | **GAP** (2차) | 사용자별 관심 저장·목록은 접합 오브젝트(Property__c ↔ User) + LWC 버튼/목록 필요 | Lightning **즐겨찾기(Favorites)** 또는 Chatter **팔로우** + "팔로우 중인 레코드" — 코드 없음. 2차 착수 시 표준 대체안 우선 검토 권고 | L (4.0h) / 표준 대체 시 S (0.5h) | 하 — Phase 1 범위 외 |
| REQ-017 | 가격대 분포 차트 | **FIT** (2차) | 표준 리포트 + **버킷 필드**(가격대 구간) + 리포트 차트, 대시보드 컴포넌트 | LWC + Chart.js(정적 리소스)는 과설계 — 탐색 화면 내 인터랙티브 차트가 필요할 때만 GAP 로 재분류 | M (1.5h) | 하 — Phase 1 범위 외 |
| REQ-018 | 홈/대시보드 (S4) | **FIT** (2차) | Lightning Home Page(App Builder) + 대시보드/리포트 차트 컴포넌트, "최근 생성 매물" 리스트 뷰 | — | M (1.5h) | 하 — Phase 1 범위 외 |

### 2.1 분류 요약

| 분류 | 건수 | REQ |
|---|---|---|
| FIT | 8 | REQ-001, REQ-002, REQ-003, REQ-004, REQ-010, REQ-015, REQ-017, REQ-018 |
| GAP | 8 | REQ-005, REQ-006, REQ-007, REQ-008, REQ-009, REQ-011, REQ-012, REQ-016 |
| NUD | 2 | REQ-013, REQ-014 |
| 조건부(OQ 에 따라 분류 변경) | ~~2~~ 1 | ~~REQ-009 (GAP→FIT, OQ-10)~~, REQ-011 (GAP→NUD, OQ-11) (ENHANCED 2026-10-28: OQ-10 해소로 REQ-009 GAP 확정, 조건부에서 제외) |

- **Phase 1 Must(REQ-001~012) 공수 합계**: FIT 3.0h + GAP 10.5h = **약 13.5h** (REQ-009 FIT 선택 시 약 12.5h). (ENHANCED 2026-10-28: OQ-10 해소로 REQ-009 = GAP M 1.5h 확정 → Must 합계 **약 13.5h 확정**. OQ-02/04/07 결정은 범위·공수 증가 없음) Playwright E2E·Promotion·리뷰 버퍼를 더하면 2일 일정에 맞는 수준이며, Could/Won't 를 섞을 여유는 거의 없다.
- REQUIREMENT §13.2 예비 판단과의 차이:
  - **REQ-010**: GAP → **FIT**. 앱·App Page 조립은 선언형이며, 개발 공수는 배치되는 LWC(REQ-006~009)에 이미 산정됨.
  - **REQ-013**: FIT(부분) → **NUD**. 표준 `lightning-map` 은 있지만 한국 주소 지오코딩을 검증해야 함(교재 기준 "지도 = NUD").
  - **REQ-014**: GAP/NUD → **NUD**. 판정 기준이 고객 고유 규칙이며 정해지지 않음.
  - **REQ-015, REQ-017, REQ-018**: GAP/NUD → **FIT**. 표준 소유자·리포트·대시보드로 충족 가능 → 2차에서도 커스텀 개발을 하지 말 것을 권고.
  - **REQ-016**: GAP 유지. 단, 표준 즐겨찾기/팔로우 대체안을 먼저 고객에게 제시.

### 2.2 NFR 관련 표준 적합성 (참고)

| NFR-ID | 분류 | 비고 |
|---|---|---|
| NFR-001, NFR-002 | GAP | REQ-005/008 구현에 포함(cacheable, 디바운스, LIMIT) |
| NFR-003, NFR-004 | FIT + GAP | 권한 세트·OWD 는 FIT, Apex `with sharing`·`WITH USER_MODE` 는 REQ-005 구현 규칙 |
| NFR-005, NFR-010 | FIT | `.gitignore`, DevOps Center Work Item·Git 이력(표준 기능) |
| NFR-006, NFR-007 | FIT | `sf apex run test`, `sf code-analyzer`, DevOps Center Tests 탭(표준) |
| NFR-008 | GAP | REQ-012 에 포함 |
| NFR-009 | GAP | LMS 채널·조회 조건 파라미터 객체 설계(REQ-005/008) |

---

## 3. GAP 항목 상세 (개략 설계)

> 원칙: 표준 Base Component·LDS 를 먼저 쓰고, Apex 는 LDS 로 할 수 없는 다중 조건 조회에만 쓴다. Phase 1 에는 Flow 가 필요한 요구가 없다(상태 변경 자동화 요구 없음).

### 3.1 구성 요소 개요

```
[DreamHouse Lite App] ─ Lightning App Page (App Builder, FIT: REQ-010)
 ├─ propertyFilter (LWC, REQ-008) ──publish──▶ LMS: PropertyFilter__c
 ├─ propertyList   (LWC, REQ-007) ◀─subscribe─┘   ── @wire ──▶ PropertyController.getProperties (Apex, REQ-005)
 │    └─ propertyTile (LWC, REQ-006) ──publish──▶ LMS: PropertySelected__c
 └─ propertyDetail (LWC, REQ-009) ◀─subscribe─┘   ── lightning-record-view-form / getRecord (LDS)
         └─ 편집 진입점 → 표준 Edit(NavigationMixin) / lightning-record-edit-form  (REQ-004 FIT 재사용)
상태 변경 후 → refreshApex + notifyRecordUpdateAvailable (REQ-011)
```

### 3.2 항목별 설계

| REQ-ID | 개발 대상 | 개략 설계 | 테스트 포인트 |
|---|---|---|---|
| REQ-005 | **Apex** `PropertyController` (`with sharing`) | `@AuraEnabled(cacheable=true) getProperties(PropertyFilter filter)` — 파라미터 객체(키워드, minPrice, maxPrice, minBedrooms)로 2차 조건 확장 대비(NFR-009). SOQL 은 `WITH USER_MODE`, 모든 조건 바인드 변수(`:keywordLike`), 정렬·`LIMIT` 은 상수(값은 OQ-09 확정 후). 동적 SOQL 이 필요하면 `Database.queryWithBinds` 사용 | `PropertyControllerTest`: 조건 조합별 양성, 0건, 권한 없는 사용자(`System.runAs`) 음성 / 커버리지 ≥ 85% 목표 |
| REQ-006 | **LWC** `propertyTile` | `@api property` 입력, `lightning-formatted-number`(currency) 로 가격, 상태→SLDS 배지 클래스 매핑(색상은 OQ-04 확정값), `onerror` 시 대체 이미지(정적 리소스), 클릭 시 LMS 로 `PropertySelected` 발행. ~~`data-testid="property-tile"`~~ `data-testid="property-card"` (ENHANCED 2026-10-28: ACCEPTANCE-CRITERIA testid 규약과 통일) (ENHANCED 2026-10-28: 가격 = `lightning-formatted-number format-style="currency" currency-code="KRW"`(원 단위 전체 금액·천 단위 구분, OQ-02). 배지 매핑 = Available(판매중) 초록 `slds-theme_success` / Under Contract(계약중) 주황 `slds-theme_warning` / Sold(판매완료) 회색 기본 배지(OQ-04) — Picklist API 값은 REQ-001 정의를 따름) | Jest(선택), Playwright: 카드 요소·배지 텍스트·대체 이미지 |
| REQ-007 | **LWC** `propertyList` | LMS 필터 구독 → `@wire(getProperties)` 결과를 `lightning-layout` 반응형 그리드로 렌더, 결과 건수, 0건 안내, 로딩 스피너, 에러 토스트 | Playwright: 건수 표시, 빈 결과 문구 |
| REQ-008 | **LWC** `propertyFilter` + **LMS 채널** `PropertyFilter__c` | `lightning-input`(키워드), 가격 최소/최대(`lightning-slider` 또는 숫자 입력 — 단위는 OQ-02), 최소 침실 수(`lightning-combobox`), 300ms 디바운스 후 LMS 발행, 초기화 버튼 (ENHANCED 2026-10-28: 가격 입력 단위 = 원(KRW, OQ-02). 상태 필터 없음 — 판매완료 포함 기본 노출(OQ-04)) | Playwright: 조건 입력 → 목록 갱신, 초기화 |
| REQ-009 | **LWC** `propertyDetail` (OQ-10 = 분할 패널 선택 시) | `PropertySelected` 구독 → `lightning-record-view-form`(FLS 자동 준수)로 전체 속성, 큰 사진. 관리자에게만 편집 버튼(권한 세트 기반 Custom Permission 또는 `getObjectInfo().updateable`) (ENHANCED 2026-10-28: OQ-10 해소 — 탐색 화면 내 상세 패널로 **확정**. 카드 선택 전달은 LMS `PropertySelected__c`(형제 배치, AD-01) 또는 부모 컴포넌트 상태 공유(단일 컨테이너 LWC 로 묶을 경우) 중 구현 시 선택. OQ-07 해소 — 상담원은 조회 전용이므로 편집·삭제 버튼 미노출) | Playwright: 선택→상세 표시, 상담원에게 편집 버튼 미노출 |
| REQ-011 | LWC 갱신 로직 (`propertyList`/`propertyDetail`) | 상세 패널에서 저장 성공 시 `notifyRecordUpdateAvailable` + `refreshApex(wiredResult)` 호출로 같은 사용자 화면 즉시 반영. 상태 변경 UX 는 표준 경로(Path) 또는 `lightning-record-edit-form` 재사용 | Playwright: 상태 변경 → 배지·목록 즉시 변경 |
| REQ-012 | 모든 커스텀 LWC 공통 규칙 | SLDS 기본 컴포넌트만 사용, `lightning-spinner`, `ShowToastEvent`, 반응형 `size`/`medium-device-size`, `aria-label`, `data-testid` | Playwright 뷰포트 2종(데스크톱/모바일) |
| REQ-016 (2차) | 접합 오브젝트 `Favorite_Property__c` + LWC 버튼/목록 | 2차 착수 시 표준 즐겨찾기/팔로우로 부족한 경우에만 개발 | 2차에서 정의 |

### 3.3 통합
- 외부 통합 없음(RFP §7, REQUIREMENT §5.2). 사진은 외부 URL 참조만 하며 CSP Trusted Sites 등록 여부는 OQ-05 로 확인.

---

## 4. NUD 항목 상세

### 4.1 REQ-013 상세 위치 지도 — New

| 항목 | 내용 |
|---|---|
| 왜 NUD 인가 | **New**: 표준 `lightning-map` 은 있으나 이 프로젝트에서 한국 주소 문자열(도로명/지번)의 지오코딩 결과를 검증한 적이 없다. 주소를 단일 텍스트로 둘지 복합 Address 필드로 둘지(OQ-01)에 따라 `mapMarkers` 입력 형식이 달라진다. Scratch Org·모바일에서의 표시도 미검증 |
| PoC/스파이크 | **필요 — 30~60분 스파이크**: DH-DEV 에서 샘플 주소 3~5건(서울/부산 등)으로 `lightning-map` 표시 성공률 확인 |
| 대안 | (A) `lightning-map` + Street/City 문자열 — 스파이크 성공 시 GAP 로 전환, 약 1.5h / (B) 위도·경도 Geolocation 필드 추가 + 샘플 데이터에 좌표 입력 — 지오코딩 의존 제거 / (C) 수식 필드 `HYPERLINK` 로 외부 지도 링크 — 코드 없음(FIT) |
| 결정 사항 | Phase 1 필수 범위에서 제외(RFP §7 "지도는 2차" — D-03 합의). Stretch 착수 여부·대안 선택은 **협의 필요 (OQ-01, OQ-13)** |

### 4.2 REQ-014 유사 매물 추천 — Unique

| 항목 | 내용 |
|---|---|
| 왜 NUD 인가 | **Unique**: "유사"의 정의가 고객 고유 업무 규칙이며 RFP·REQUIREMENT 어디에도 정해져 있지 않다(동일 도시 여부, 가격 허용 범위, 침실 수 차이, 판매완료 제외 여부, 추천 건수 N). 기준이 없으면 AC 를 쓸 수 없고 공수도 추정할 수 없다 |
| PoC/스파이크 | 기술 PoC 는 불필요(REQ-005 조회 서비스 확장으로 구현 가능). 대신 **업무 규칙 정의 워크숍(고객 협의)** 이 선행 조건 |
| 대안 | (A) 규칙 기반 SOQL(동일 City + 가격 ±N% + 침실 수 ±1, 자기 자신·판매완료 제외) — 기준 확정 후 GAP, 약 2.0h / (B) 표준 리스트 뷰 "같은 도시 매물" 링크 — FIT, 추천성 낮음 / (C) Einstein 추천·AI 기반 — 데이터 10건 규모에 과설계, **비권고** |
| 결정 사항 | Phase 1 필수 범위 외(RFP F4 "가능하면" — D-04 합의). 판정 기준·착수 우선순위는 **협의 필요 (OQ-13)** |

### 4.3 조건부 NUD — REQ-011 (다른 사용자 화면 실시간 반영 시)

| 항목 | 내용 |
|---|---|
| 조건 | OQ-11 에서 "다른 사용자 화면까지 실시간 반영"이 요구될 경우 |
| 왜 NUD 가 되는가 | **Difficult**: Change Data Capture 또는 Platform Event + `lightning/empApi` 구독, 이벤트 한도, Scratch Org 에서의 CDC 활성화·DevOps Center 배포 대상 메타데이터 추가 등 미검증 요소가 생긴다 |
| PoC/스파이크 | 해당 시 필요(1~2h). 2일 일정에서는 일정 리스크 **상** |
| 권고 | Phase 1 은 "같은 사용자 화면 내 즉시 반영"으로 한정하고(GAP), 사용자 간 실시간 반영은 2차로 분리할 것을 권고. **결정은 협의 필요 (OQ-11)** |

---

## 5. 고객 협의 결과 (Decision Log)

> 결정자: **최정혁(고객 역할 겸임)**. RFP 에 이미 명시된 결정만 "RFP 명시"를 근거로 합의 처리했다. 실제로 아직 협의하지 않은 항목은 상태를 "협의 필요"로 두고 결정일을 비워 둔다.
> 상태 값: 합의 / 보류 / 대체 / 철회 / 협의 필요

| D-ID | 대상 REQ | 결정 내용 | 상태 | 근거 | 결정일 | 결정자 |
|---|---|---|---|---|---|---|
| D-01 | REQ-001~REQ-012 | 1차(MVP) 범위 = RFP F1~F5, S1~S3 → REQ-001~REQ-012 를 Phase 1 In-Scope(Must)로 확정 | 합의 | RFP 명시 (§7 "1차(MVP): F1~F5, S1~S3") | 2026-10-28 | 최정혁(고객 역할 겸임) |
| D-02 | REQ-004 | 매물 등록·수정·삭제는 표준 레코드 페이지/페이지 레이아웃(FIT)으로 구현, 커스텀 폼 미개발 | 협의 필요 | 아키텍트 권고(과도한 커스텀 지양). RFP 는 S3 폼 필요만 명시, 구현 방식 미지정 | | 최정혁(고객 역할 겸임) |
| D-03 | REQ-013 | 위치 지도는 Phase 1 필수 범위에서 제외(2차/선택) | 합의 | RFP 명시 (§7 "지도/차트/중개인은 2차 선택") | 2026-10-28 | 최정혁(고객 역할 겸임) |
| D-04 | REQ-014 | 유사 매물 추천은 Phase 1 필수 범위에서 제외(Could, 여유 시) | 합의 | RFP 명시 (§3 F4 "(가능하면)", §4 S2 "(선택)", §7 MVP 정의) | 2026-10-28 | 최정혁(고객 역할 겸임) |
| D-05 | REQ-015 | 중개인별 담당 매물은 2차 | 합의 | RFP 명시 (§3 F6 "2차/선택", §7 "중개인은 2차") | 2026-10-28 | 최정혁(고객 역할 겸임) |
| D-06 | REQ-016 | 관심 매물은 2차 | 합의 | RFP 명시 (§3 F6 "2차/선택") | 2026-10-28 | 최정혁(고객 역할 겸임) |
| D-07 | REQ-017 | 가격대 분포 차트는 2차 | 합의 | RFP 명시 (§3 F6, §7 "차트는 2차") | 2026-10-28 | 최정혁(고객 역할 겸임) |
| D-08 | REQ-018 | 홈/대시보드(S4)는 Phase 1 제외 | 합의 | RFP 명시 (§4 S4 "(선택)", §7 MVP = S1~S3) | 2026-10-28 | 최정혁(고객 역할 겸임) |
| D-09 | 전체 | 외부 부동산 API 연동 없음, 사진은 URL 입력(파일 업로드 없음) | 합의 | RFP 명시 (§7) | 2026-10-28 | 최정혁(고객 역할 겸임) |
| D-10 | REQ-001, REQ-002 | 플랫폼 = Lightning Experience·LWC, 보안 = 상담원 조회 / 관리자 등록·수정, Apex with sharing·CRUD/FLS | 합의 | RFP 명시 (§2, §6) | 2026-10-28 | 최정혁(고객 역할 겸임) |
| D-11 | REQ-009, REQ-010 | 상세 화면 표시 방식: 탐색 화면 내 분할 패널(GAP) vs 표준 레코드 페이지 이동(FIT) (ENHANCED 2026-10-28: **탐색 화면 내 패널로 결정** → REQ-009 GAP 확정(LWC 상세 패널, 카드 선택은 LMS 또는 부모 컴포넌트 상태 공유, M 1.5h), REQ-010 FIT 유지) | 합의 | OQ-10 — 고객 결정(2026-10-28) | 2026-10-28 | 최정혁(고객 역할 겸임) |
| D-12 | REQ-011 | "즉시 반영" 범위를 같은 사용자 화면 내로 한정(GAP), 사용자 간 실시간 반영은 2차 | 협의 필요 | OQ-11 — 아키텍트 권고안, 미합의 | | 최정혁(고객 역할 겸임) |
| D-13 | REQ-013, REQ-014 | Could 항목의 Stretch 착수 여부·우선순위, 유사 매물 판정 기준 | 협의 필요 | OQ-13 | | 최정혁(고객 역할 겸임) |
| D-14 | REQ-015~REQ-018 | 2차 진행 시 표준 기능(소유자·리스트 뷰·리포트·대시보드·즐겨찾기) 우선 적용 | 협의 필요 | 아키텍트 권고(§2.1). 2차 착수 시 확정 | | 최정혁(고객 역할 겸임) |
| D-15 | REQ-003 | 기존 엑셀 데이터 이관은 범위 외(샘플 10건만) | 협의 필요 | OQ-06 — REQUIREMENT 에서 "범위 외로 분류"했으나 고객 확인 전 | | 최정혁(고객 역할 겸임) |
| D-16 (ADDED) | REQ-001, REQ-006, REQ-008 | 가격 통화 = KRW 단일 통화(원 단위 전체 금액, 천 단위 구분 표시). 다중 통화 미사용 → 범위 증가 없음. `Price__c` 는 Currency 필드 유지, LWC 는 `lightning-formatted-number currency-code="KRW"` 로 표시. 기술 과제(WI-1.001): Scratch Org 정의가 `en_US` 로 기본 통화 USD 가능성 → scratch def `country`/locale 또는 Company Information 의 통화 로케일 확인·조정 | 합의 | OQ-02 — 고객 결정 | 2026-10-28 | 최정혁(고객 역할 겸임) |
| D-17 (ADDED) | REQ-005, REQ-006, REQ-008, REQ-011 | 판매완료 매물도 기본 노출, 상태 배지 색상 = 판매중 초록 / 계약중 주황 / 판매완료 회색. 상태 필터 추가 없음 → 범위 증가 없음 | 합의 | OQ-04 — 고객 결정 | 2026-10-28 | 최정혁(고객 역할 겸임) |
| D-18 (ADDED) | REQ-002, REQ-004, REQ-011 | 물리 삭제는 관리자만 허용, 상담원은 조회 전용(등록·수정·상태 변경·삭제 불가). 권한 세트 2종(관리자 CRUD, 상담원 Read) → REQ-002/004 FIT 유지 | 합의 | OQ-07 — 고객 결정 | 2026-10-28 | 최정혁(고객 역할 겸임) |

### 5.1 아키텍처 결정 제안 (Solution Architect 권고 — 고객 승인 불요, 내부 기술 결정)

| AD-ID | 결정(제안) | 대상 REQ | 근거 | 상태 |
|---|---|---|---|---|
| AD-01 | LWC 간 통신은 Lightning Message Service(LMS) 사용 | REQ-007, REQ-008, REQ-009 | 컴포넌트가 App Page 에 형제로 배치되므로 부모-자식 이벤트로 연결 불가. 느슨한 결합(NFR-009) | 제안 |
| AD-02 | 조회는 `cacheable=true` Apex + 파라미터 객체, 상세·편집은 LDS(record forms) | REQ-005, REQ-009, REQ-011 | LDS 가 FLS·캐시·갱신을 자동 처리 → Apex 최소화 | 제안 |
| AD-03 | 공유 모델: `Property__c` OWD = 조직 전체 읽기 전용(Public Read Only), 편집은 권한 세트로 부여 | REQ-002 | 모든 상담원이 전체 매물 조회 필요, 소유자 기반 공유 불필요. 단, 관리자의 타인 소유 레코드 편집을 위해 관리자 권한 세트에 "모두 수정(Modify All)" 부여 필요 여부는 OQ-07 과 함께 확인 (ENHANCED 2026-10-28: OQ-07 해소 — 관리자만 물리 삭제·편집, 상담원 Read 전용 → 관리자 권한 세트에 CRUD + Modify All 부여(타인 소유 레코드 편집·삭제 보장), 상담원 권한 세트는 Read 만 부여 권고) | 제안 |
| AD-04 | Phase 1 에 Flow 미사용 | 전체 | 자동화 요구 없음. DevOps Center Flow Tests Provider 는 구성만(REQUIREMENT §12.1) | 제안 |

### 5.2 Open Questions / 협의 필요 (분류에 영향을 주는 항목)

| OQ-ID | 질문 요지 | 영향 REQ | 분류·공수 영향 | 상태 |
|---|---|---|---|---|
| OQ-01 | 주소 체계(시/도·우편번호, 단일 텍스트 vs Address 복합 필드) | REQ-001, REQ-013 | REQ-001 필드 정의, REQ-013 지오코딩 입력 형식(NUD 해소 경로 결정) | 협의 필요 |
| OQ-02 | 통화 단위·표시 형식(원/만원/억), 다중 통화 | REQ-001, REQ-006, REQ-008 | 다중 통화 필요 시 조직 설정 변경(되돌릴 수 없음) → 리스크 상. 단일 통화면 FIT 유지 | **해소** (ENHANCED 2026-10-28: KRW 단일 통화 → FIT 유지, 범위 불변. D-16) |
| OQ-03 | 필수 항목·유효성 규칙 | REQ-001, REQ-004 | 유효성 규칙(FIT) 내용 확정. 분류 불변, AC 확정에 필요 | 협의 필요 |
| OQ-04 | 상태 배지 색상, 판매완료 기본 노출 여부 | REQ-006, REQ-008, REQ-011 | 분류 불변(GAP), 조회 조건·UI 상세 확정 | **해소** (ENHANCED 2026-10-28: 판매완료 기본 노출 + 배지 초록/주황/회색, 상태 필터 불필요. D-17) |
| OQ-05 | 사진 URL 도메인(CSP), 대체 이미지 정책 | REQ-006, REQ-009 | CSP Trusted Sites 등록(FIT 설정) 필요 여부 | 협의 필요 |
| OQ-06 | 엑셀 데이터 이관 필요 여부 | REQ-003 | 필요 시 REQ-003 범위 확대(데이터 정제·매핑 → 공수 M~L) | 협의 필요 |
| OQ-07 | 삭제 권한 범위, 상담원 상태 변경 가능 여부 | REQ-002, REQ-004, REQ-011 | 권한 세트 구성(FIT) 확정, AD-03 Modify All 여부 | **해소** (ENHANCED 2026-10-28: 관리자만 물리 삭제, 상담원 조회 전용 → REQ-002/004 FIT 유지, AD-03 관리자 Modify All 권고. D-18) |
| OQ-09 | 정렬 기준·최대 건수·페이지네이션 | REQ-005, REQ-007 | 페이지네이션 필요 시 REQ-005/007 공수 +1h | 협의 필요 |
| OQ-10 | 상세 표시 방식(분할 패널 vs 레코드 페이지) | REQ-009, REQ-010 | **REQ-009 GAP ↔ FIT 전환** | **해소** (ENHANCED 2026-10-28: 탐색 화면 내 패널 → REQ-009 GAP 확정(M 1.5h), REQ-010 FIT 유지. D-11) |
| OQ-11 | 즉시 반영 범위(같은 사용자 vs 다른 사용자 실시간) | REQ-011 | **REQ-011 GAP ↔ NUD 전환** | 협의 필요 |
| OQ-12 | Salesforce 모바일 앱 사용 범위 | REQ-012 | 분류 불변, 모바일 검증 범위 확대 | 협의 필요 |
| OQ-13 | Could(REQ-013/014) 착수 우선순위, 유사 매물 판정 기준 | REQ-013, REQ-014 | **NUD 해소 조건** | 협의 필요 |
| OQ-14 | 추가 입력 문서 존재 여부 | 전체 | 추가 요구 발견 시 REQ ADD 및 재분류 | 협의 필요 |

> OQ-08(개인정보)은 NFR-010 관련으로 REQ 분류에는 영향이 없어 본 표에서 제외한다(REQUIREMENT §14 에서 관리).

---

## 6. 범위 영향

### 6.1 In-Scope / Out-of-Scope
- **In-Scope(Phase 1) 변화 없음**: REQ-001~REQ-012 는 RFP §7 MVP 정의대로 유지(D-01). 그중 4건(REQ-001/002/003/004)과 REQ-010 은 FIT → 코드 없이 설정으로 구현한다.
- **Out-of-Scope 확인**: REQ-013~REQ-018 은 RFP 명시로 Phase 1 필수 범위 외(D-03~D-08). REQ-013/014 는 Stretch(Could)로만 남기며, NUD 해소(OQ-01·OQ-13) 전에는 착수하지 않는다.
- **범위 확대 위험 요인**: OQ-06(엑셀 이관), OQ-11(사용자 간 실시간 반영), OQ-02(다중 통화)가 "예"로 답변되면 범위가 커진다 → Phase 1 에 넣지 말고 2차 또는 변경 요청으로 처리할 것을 권고. (ENHANCED 2026-10-28: OQ-02 는 KRW 단일 통화로 해소되어 위험 요인에서 제외. OQ-04(상태 필터 불필요)·OQ-07(권한 세트 2종)·OQ-10(상세 패널, 기존 GAP 산정 그대로) 결정도 범위 증가 없음. 잔여 확대 위험: OQ-06, OQ-11)

### 6.2 일정 영향
- Must 공수 약 13.5h(GAP 10.5h 가 대부분)로 2일 일정 내 수행 가능하나 여유가 작다. 크리티컬 패스 **REQ-001 → REQ-005/006 → REQ-007 → REQ-008/009 → REQ-010** 은 REQUIREMENT §7 과 동일.
- **일정 단축 레버**: OQ-10 을 "표준 레코드 페이지"로 결정하면 REQ-009 가 FIT 가 되어 약 1h 단축. REQ-004 를 표준 폼으로 유지(D-02)하면 커스텀 폼 공수(약 2h)가 생기지 않는다. (ENHANCED 2026-10-28: OQ-10 = 탐색 화면 내 패널로 결정(D-11) → REQ-009 공수 **M 1.5h 확정**, 1h 단축 레버는 소멸. Must 합계 약 13.5h 확정. 남은 단축 레버는 D-02)
- **일정 위험**: OQ-11 이 사용자 간 실시간 반영으로 결정되면 REQ-011 이 NUD 가 되어 스파이크 1~2h 와 리스크 상이 추가된다 → Phase 1 일정 초과 가능.
- M1(Phase 0 완료, 2026-10-29 오전) 전에 "협의 필요" 항목 중 OQ-01~OQ-05, OQ-07, OQ-10, OQ-11 을 해소해야 AC 확정과 M3 일정이 지켜진다. (ENHANCED 2026-10-28: OQ-02/04/07/10 해소. M1 전 잔여: OQ-01, OQ-03, OQ-05, OQ-11)
- (ADDED 2026-10-28) 기술 과제: KRW 표시를 위해 WI-1.001 에서 Scratch Org 기본 통화/로케일(scratch def `country`/locale 또는 Company Information) 확인을 선행 체크 항목으로 둔다. 미조치 시 USD 로 표시될 수 있음(D-16).

### 6.3 우선순위 영향 (PROJECT-PLAN 반영 권고)

| 우선순위 | 대상 | 근거 |
|---|---|---|
| 1 (Day 1 오전) | FIT: REQ-001, REQ-002, REQ-003, REQ-004 | 선행 루트·저위험·설정 위주 → 빨리 끝내고 GAP 에 시간 확보 |
| 2 (Day 1) | GAP 핵심: REQ-005, REQ-006, REQ-007 (+REQ-012 적용) | 크리티컬 패스, Day 1 종료까지 완료해야 함 |
| 3 (Day 2 오전) | GAP: REQ-008, REQ-009, REQ-011 → FIT: REQ-010 조립 | 목업 리뷰 후 보완 |
| 4 (Stretch) | NUD: REQ-013(스파이크 선행), REQ-014(기준 확정 선행) | Must 완료·품질 게이트 통과 후에만 |
| 2차 | REQ-015, REQ-017, REQ-018(FIT), REQ-016(GAP, 표준 대체안 우선) | RFP 명시 2차 |

- 권고: FIT 로 분류된 항목(특히 REQ-004, REQ-010, 2차의 REQ-015/017/018)은 LWC/Apex 로 다시 만들지 않는다. 커스텀 개발은 GAP 로 확정된 REQ-005~009, REQ-011, REQ-012 로 한정한다.
