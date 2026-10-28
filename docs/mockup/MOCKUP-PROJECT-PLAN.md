# MOCKUP-PROJECT-PLAN — DreamHouse Lite UI 목업 계획

> Cheatsheet STEP 7 프롬프트 ① / Training Lab 7 (Step 7.1 ①② 문서, Step 7.4 ⑤ 구현) 산출물. 작성 에이전트: **frontend_developer**.
> 입력: `docs/work-items/WI-1.001~1.005`, `docs/PROJECT-PLAN.md`, `docs/phase-0/ACCEPTANCE-CRITERIA.md`(§1.4 SD-01~10, §1.5 문구, §1.6 data-testid).
> 목적: 본 개발(Phase 1) 착수 전에 **정적 샘플 데이터 LWC** 로 화면·레이아웃·흐름을 고객과 확인하고, 결정을 본 산출물(REQ/AC/WI)에 DROP/ENHANCE/ADD 로 반영한다(STEP 7 ③).

## 0. 문서 정보

| 항목 | 내용 |
|---|---|
| 문서명 | MOCKUP-PROJECT-PLAN — DreamHouse Lite |
| 버전 | v1.0 (1차 리뷰 전) |
| 작성일 | 2026-10-28 |
| 작성자 | 최정혁 (frontend_developer 에이전트 활용) |
| 목업 오그 | **DH-DEV** (Scratch Org 3개 한도 → 개발 오그 겸용, Lab 7.3) |
| 코드 위치 | 본 개발과 같은 `force-app/main/default` (코드 공유 원칙) · 문서만 `docs/mockup/` 로 분리 · 작업 브랜치 `mockup` |
| 리뷰 결과 | `docs/mockup/reviews/REVIEW-nn.md` (Lab 7.5) |

### 0.1 변경 이력

| 버전 | 일자 | 작성자 | 유형 | 변경 내용 |
|---|---|---|---|---|
| v1.0 | 2026-10-28 | 최정혁 | 최초 작성 | 화면 S1~S3 정의, MWI-1.002~1.005 4건, WI↔MWI 매핑, 고객 확인 포인트 CP-01~CP-14 |

> 갱신 규칙: 재작성 금지, DROP / ENHANCE / ADD 로만 반영. **MWI-p.nnn 코드네임은 변경·재번호·재사용 금지.**

---

## 1. 목업 범위 원칙

| 구분 | 목업에서 함 | 목업에서 안 함 (본 개발 WI 에서) |
|---|---|---|
| 데이터 | SD-01~SD-10 을 JS 배열 모듈(`c/propertyMockData`)로 정적 제공, 필드명은 `Property__c` API 이름 그대로 | `Property__c` 오브젝트·필드, 데이터 플랜 적재, Apex/SOQL |
| 동작 | 클라이언트 측 필터(키워드·최소/최대 가격·최소 침실·초기화, 300ms 디바운스), 카드 클릭 → 상세 패널, 관리자 편집 → 메모리 반영 | LMS 채널 3종, `@wire`/`refreshApex`, `lightning-record-edit-form`, LDS |
| 권한 | 화면 상단 **"역할 (목업 전용)"** 토글로 상담원/관리자 화면 차이만 시연 | 권한 세트 `DreamHouse_Agent`/`DreamHouse_Admin`, CRUD/FLS |
| 표시 규칙 | AC §1.5(KRW 전체 금액·상태 라벨/배지 색·건수·빈 결과·미선택 문구) + AC §1.6 data-testid 그대로 | Jest·Playwright 테스트(목업은 테스트 생략) |
| 배포 | **새 오그에 바로 배포 가능**(커스텀 오브젝트·Apex 의존 없음) | — |

- 컴포넌트 이름은 **본 개발 계획 이름과 동일**(`propertyTile`/`propertyList`/`propertyFilter`/`propertyDetail`)하게 만들어 본 WI 가 그대로 승계(ENHANCE)한다.
- 컴포넌트 간 연결: 목업은 컨테이너 `propertyExplorer` 의 **부모 상태 + CustomEvent**(= WI-1.005 §4.5 **안 B**). 본 개발 기본안은 **안 A(LMS + App Page 3열 배치)** → 이벤트 발행 지점(`handleSelect`/`publishNow`/`handleSave`)만 LMS 로 바꾸면 된다. 안 B 로 확정되면 컨테이너를 그대로 승계.

## 2. 검증할 화면 목록

| 화면 | 이름 | 구성 | 목업 대상 | 담당 MWI |
|---|---|---|---|---|
| **S1** | 매물 탐색 | 좌 필터 패널 + 중앙 카드 그리드(건수·빈 결과) + 우 상세 패널 — 1440px 3열 / 375px 세로 적층 | **O** | MWI-1.002(카드) · MWI-1.003(목록) · MWI-1.004(필터) · MWI-1.005(상세 + 앱 페이지) |
| **S2** | 상세 패널 | S1 우측 영역. 미선택 안내 → 선택 시 큰 사진 + 전체 속성 + 상태 배지, 관리자만 `편집`(상태 변경 → 카드·배지 즉시 반영) | **O** | MWI-1.005 |
| **S3** | 매물 등록·수정 | Salesforce **표준 레코드 페이지·페이지 레이아웃**(`매물` 오브젝트 탭, `새로 만들기`/`편집`, 필수값 Name·Price__c·Status__c — D-02) | **X — 목업 대상 아님** | (WI-1.001 표준 기능, 커스텀 UI 없음) |

> S3 는 커스텀 화면이 아니라 표준 폼이므로 목업을 만들지 않는다. 필수 항목·유효성(CK-05)은 Phase 0 문서 협의로 확인하고, WI-1.001 배포 후 실제 표준 화면으로 시연한다.

## 3. 본 WI ↔ 목업 MWI 1:1 매핑

| 본 WI | 본 WI 제목 | 목업 MWI | 목업 문서 | 목업 코드 (force-app/main/default) | 대응 AC (목업에서 확인 가능한 것) |
|---|---|---|---|---|---|
| WI-1.001 | 데이터 모델 + 권한 세트 + 표준 CRUD + KRW (FIT) | **N/A (MWI 없음)** | — | — | — (데이터 모델·권한·표준 폼은 화면 목업 대상 아님. **MWI-1.001 번호는 결번으로 예약**하여 WI 번호와 1:1 정렬 유지) |
| WI-1.002 | 샘플 데이터 + Property Tile/Card LWC | **MWI-1.002** | [MWI-1.002-property-tile.md](work-items/MWI-1.002-property-tile.md) | `lwc/propertyTile`, `lwc/propertyMockData`(SD-01~10), `lwc/propertyUtils`, `staticresources/propertyPlaceholder` | AC-020, 021, 022, 023 |
| WI-1.003 | Property List LWC + Apex 컨트롤러 | **MWI-1.003** | [MWI-1.003-property-list.md](work-items/MWI-1.003-property-list.md) | `lwc/propertyList` | AC-024, 025, 026 |
| WI-1.004 | 검색 필터 + Apex 조건 확장 | **MWI-1.004** | [MWI-1.004-search-filter.md](work-items/MWI-1.004-search-filter.md) | `lwc/propertyFilter`, `lwc/propertyUtils.filterProperties` | AC-027~033 (+ 058 CK-03, 057 CK-04 확인) |
| WI-1.005 | 상세 패널 + DreamHouse Lite 앱·Lightning App Page | **MWI-1.005** | [MWI-1.005-property-detail-app-page.md](work-items/MWI-1.005-property-detail-app-page.md) | `lwc/propertyDetail`, `lwc/propertyExplorer`, `flexipages/Property_Explorer`, `tabs/Property_Explorer`, `applications/DreamHouse_Lite`, `permissionsets/DreamHouse_Mockup` | AC-026, 035~040, 042(시연), 045, 054(시연) |

### 3.1 메타데이터 이름 — 본 개발 승계 계획

| 목업 메타데이터 | 이름 | 본 개발에서 |
|---|---|---|
| Lightning 앱 | `DreamHouse_Lite` (라벨 `DreamHouse Lite`) | WI-1.005 가 같은 이름으로 ENHANCE — 내비게이션에 `Property__c` 탭 추가 |
| App Page (FlexiPage) | `Property_Explorer` (라벨 `매물 탐색`, 1영역 템플릿 + `propertyExplorer`) | WI-1.005 가 같은 이름으로 ENHANCE — 안 A 면 3열 템플릿 + 3개 컴포넌트로 교체, 안 B 면 유지 |
| 탭 | `Property_Explorer` (라벨 `매물 탐색`) | WI-1.005 그대로 승계 |
| 정적 리소스 | `propertyPlaceholder` (SVG 400×300) | WI-1.002 그대로 승계 |
| 공용 모듈 | `propertyUtils` (상태 맵·KRW 포맷·문구) | WI-1.002/1.005 가 재사용(`c/propertyUtils` 분리안 — WI-1.002 §5.4). `filterProperties` 는 목업 전용 |
| 목업 전용 | `propertyMockData`, `propertyExplorer`(안 A 채택 시), `DreamHouse_Mockup` 권한 세트 | **삭제 대상** — WI-1.003(데이터 모듈) / WI-1.005(권한 세트·컨테이너) |

## 4. 고객 확인 포인트 (화면별)

| CP | 화면 | 확인 포인트 | 목업에서 보는 방법 | 연결 CK/OQ · AC | MWI |
|---|---|---|---|---|---|
| CP-01 | S1 | **3열 레이아웃**(좌 필터 · 중앙 그리드 · 우 상세)이 업무 흐름에 맞는가, 상세를 별도 페이지가 아닌 같은 화면 패널로 보는 방식 수용 | 1440px 화면에서 카드 클릭 → URL 변경 없이 우측 표시 | OQ-10 · AC-026, 040 | MWI-1.005 |
| CP-02 | S1 | **카드 표시 항목**(사진·매물명·가격·주소·도시·침실/욕실·상태 배지)과 순서가 충분한가, 빠진 항목(면적·층수 등)은 없는가 | 카드 10장 | REQ-006 · AC-020 | MWI-1.002 |
| CP-03 | S1/S2 | **가격 표시** `₩2,500,000,000`(원 단위 전체 금액, 억/만원 축약 없음)가 읽기 편한가 | 카드·상세 가격 | CK-02 · AC-023 | MWI-1.002 |
| CP-04 | S1/S2 | **상태 배지 색상 톤** 판매중 초록 / 계약중 주황 / 판매완료 회색 | SD-01·SD-03·SD-05 카드 | CK-14 · AC-021 | MWI-1.002 |
| CP-05 | S1/S2 | **대체 이미지** 디자인("이미지 없음") — 사진 없음(SD-09)·깨진 URL(SD-10) | SD-09, SD-10 카드·상세 | CK-10 · AC-022, 039 | MWI-1.002 |
| CP-06 | S1 | **판매완료 매물 기본 노출** + 상태 필터 없음 — 상태별 필터(예: "판매중만")를 요구하는가 | 초기 10건에 판매완료 2건 포함 | CK-15, D-17 · AC-024, 032 | MWI-1.003/1.004 |
| CP-07 | S1 | **정렬 순서·건수 상한·페이지네이션** — 목업은 SD 순서(정렬 미정) | 카드 순서 | CK-06/OQ-09 | MWI-1.003 |
| CP-08 | S1 | **필터 항목·입력 방식** — 키워드(매물명·도시, 주소 제외), 가격 원 단위 숫자 입력, 침실 `전체`~`5개 이상`, 입력 즉시 반영(300ms) | `서울` → 3건, 최대 `1000000000` → 6건, 침실 `4개 이상` → 3건 | CK-02 · AC-027~031 | MWI-1.004 |
| CP-09 | S1 | **최소 가격 > 최대 가격** 입력 시 동작 (현재 목업: 그대로 0건, 오류 문구 없음) — 오류 문구 / 자동 교정 / 조건 무시 중 선택 | 최소 `2000000000`, 최대 `1000000000` | CK-03 · AC-058 | MWI-1.004 |
| CP-10 | S1 | **공백 키워드** = 조건 없음(trim) 처리 수용 | 키워드에 공백만 입력 → 10건 | CK-04 · AC-057 | MWI-1.004 |
| CP-11 | S1/S2 | **UI 문구** — `10건`, `조건에 맞는 매물이 없습니다.`, `매물을 선택하면 상세 정보가 표시됩니다.` | 초기 상태, `강릉` 검색 | CK-09 · AC-025, 037 | MWI-1.003/1.005 |
| CP-12 | S2 | **상세 패널 항목** — 주소·도시·가격·침실·욕실·상태. 시/도(State__c) 필요 여부 | SD-07 선택 | CK-11/OQ-01 · AC-035 | MWI-1.005 |
| CP-13 | S2 | **관리자 편집 방식** — 패널 안 인라인 폼(매물명·가격·상태) vs 표준 Edit 모달, 저장 후 카드·배지·건수 즉시 반영 범위 | 역할 `관리자` → `편집` → 상태 `계약중` → `저장` | CK-08/OQ-11 · AC-038, 042, 054 | MWI-1.005 |
| CP-14 | S1 | **모바일(375px)** — 필터 → 목록(1열) → 상세 세로 적층으로 충분한가, Salesforce 모바일 앱 사용 여부 | 브라우저 폭 375px | CK-13/OQ-12 · AC-045 | MWI-1.005 |

## 5. 배포·확인 절차 (Lab 7.3~7.4)

```powershell
# 0) mockup 브랜치에서 진행 (Lab 7.2) — 브랜치/커밋은 메인 세션이 처리
sf config set target-org DH-DEV

# 1) 검증 → 배포
sf project deploy start --dry-run -o DH-DEV --source-dir force-app
sf project deploy start -o DH-DEV --source-dir force-app

# 2) 앱·탭 표시 권한 (목업 전용 권한 세트)
sf org assign permset -n DreamHouse_Mockup -o DH-DEV

# 3) 열기 — 앱 런처 → "DreamHouse Lite" → "매물 탐색" 탭
sf org open -o DH-DEV --path /lightning/n/Property_Explorer
```

시연 순서(권장, 약 10분): ① 초기 `10건`·상세 미선택 문구 → ② 카드(SD-07) 클릭 → 상세 → ③ `서울` → `3개 이상` → 최대 `2000000000` (3→2→1건, 판매완료 배지) → ④ `초기화` → ⑤ `강릉` 빈 결과 → ⑥ SD-09/SD-10 대체 이미지 → ⑦ 역할 `관리자` → SD-02 `편집` → 상태 `계약중` 저장 → 카드 배지 즉시 변경 → ⑧ 375px 폭 확인. 리뷰 결과는 `docs/mockup/reviews/REVIEW-01.md` 에 CP 번호별로 기록(Lab 7.5).

## 6. 다음 단계

1. Lab 7.5 리뷰 → `reviews/REVIEW-01.md`
2. Lab 7.6 Cheatsheet STEP 7 ② — 리뷰 결정을 **목업에만** DROP/ENHANCE/ADD (MWI 코드네임 유지) → 재배포
3. Lab 7.8 STEP 7 ③ — requirements_analyst 가 본 산출물(REQ/AC/WI)에 반영 → `mockup` → `main` 병합
