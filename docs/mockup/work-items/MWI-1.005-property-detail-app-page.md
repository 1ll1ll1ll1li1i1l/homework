# MWI-1.005 — 상세 패널 + "매물 탐색" 앱 페이지 목업

| 항목 | 내용 |
|---|---|
| 목업 WI | **MWI-1.005** |
| 대응 본 WI | **WI-1.005** 상세 패널 + DreamHouse Lite 앱·Lightning App Page |
| 대응 REQ / AC | REQ-009, REQ-010, REQ-011(시연), REQ-012 · AC-026, AC-035, AC-036, AC-037, AC-038, AC-039, AC-040, AC-042(시연), AC-045, AC-054(시연) |
| 화면 | S1 매물 탐색(전체 배치) + S2 상세 패널 |
| 상태 | [X] 목업 구현 완료 (2026-10-28, DH-DEV dry-run 성공) · [ ] 1차 리뷰 |
| 작성 | 2026-10-28 · frontend_developer |

## 1. 화면 목적

① 카드를 선택하면 **같은 화면 오른쪽**에 큰 사진과 전체 속성을 보여 주고(URL 불변), ② 관리자만 상태 등을 편집해 카드·배지·건수가 **새로고침 없이** 바뀌는 흐름을 시연하며, ③ DreamHouse Lite 앱 → "매물 탐색" 탭 진입과 3열/모바일 적층 레이아웃을 확인한다.

## 2. Wireframe

```
┌─ DreamHouse Lite │ [매물 탐색] ─────────────────────────────────────────────────────────────────┐
│ ┌ 매물 탐색 ─ 목업 — 정적 샘플 데이터 …            역할 (목업 전용) [상담원|관리자] ┐            │
│ └──────────────────────────────────────────────────────────────────────────────────┘            │
│┌ filter-panel ─┐┌ property-list ──────────────────── 10건 ┐┌ property-detail ────────────┐      │
││ 키워드        ││ ┌card┐ ┌card┐ ┌card┐                     ││ [ detail-image (220px) ]    │      │
││ 최소/최대 가격 ││ ┌card┐ ┌card┐ ┌card┐                     ││ 제주 애월 전원주택   (계약중)│      │
││ 최소 침실 수   ││ ┌card┐ ┌card┐ ┌card┐                     ││ 주소 … 애월해안로 77        │      │
││ [초기화]      ││ ┌card┐                                   ││ 도시 제주                   │      │
│└───────────────┘└─────────────────────────────────────────┘│ 가격 ₩1,650,000,000         │      │
│  size 12 / large 3        size 12 / large 6                 │ 침실 5   욕실 3             │      │
│                                                             │ [편집]  ← 관리자만          │      │
│                                                             └─────────────────────────────┘      │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
 375px: filter-panel → property-list(1열) → property-detail 세로 적층 (lightning-layout size=12)

 상세 패널 상태
 ① 미선택(detail-empty)           ② 선택-상담원                ③ 관리자 편집(detail-edit-form)
 "매물을 선택하면 상세 정보가      전체 속성 + 배지             매물명 [        ] (필수)
  표시됩니다."                    편집 버튼 없음               가격   [        ] (필수, ≥0)
                                                               상태   [계약중 ▾] ← detail-status-input
                                                               [취소] [저장] ← detail-save-button
                                                               저장 → 토스트 "저장되었습니다." + 카드·배지·건수 즉시 반영
```

## 3. 구현 범위 (정적 데이터)

| 항목 | 목업 구현 | 본 개발(WI-1.005)에서 교체 |
|---|---|---|
| 상세 컴포넌트 | `lwc/propertyDetail` — `@api property`(선택 매물), `@api canEdit`, testid AC §1.6 그대로(`detail-state` 는 CK-11 확정 시) | LMS `PropertySelected__c` 구독 + `getRecord` |
| 대체 이미지 | 빈 값·오류 → `propertyPlaceholder` | 동일 |
| 편집 | 관리자 역할일 때만 `detail-edit-button` → 인라인 폼(매물명·가격·상태, 필수 검증) → `propertysave` → 부모 메모리 배열 갱신 + 성공 토스트 | `getObjectInfo.updateable` + `lightning-record-edit-form` + `notifyRecordUpdateAvailable` + LMS `PropertyUpdated__c` |
| 역할 | 상단 **"역할 (목업 전용)"** 토글(`data-testid="mockup-role-toggle"`, 기본 상담원) | 권한 세트(DreamHouse_Agent/Admin) — 토글 삭제 |
| 컨테이너 | `lwc/propertyExplorer` — 필터/목록/상세를 부모 상태로 연결(안 B), `lightning-layout` 3/6/3 | 안 A(App Page 3열 + LMS) 기본, 375px 미충족 시 안 B 승계 |
| App Page | `flexipages/Property_Explorer` (라벨 `매물 탐색`, `flexipage:defaultAppHomeTemplate` 1영역 `main` + `propertyExplorer`) | 같은 이름 ENHANCE |
| 탭 | `tabs/Property_Explorer` (라벨 `매물 탐색`, `Custom24: Building`) | 승계 |
| 앱 | `applications/DreamHouse_Lite` (라벨 `DreamHouse Lite`, 탭 `Property_Explorer` 만) | `Property__c` 탭 추가 ENHANCE |
| 권한 | `permissionsets/DreamHouse_Mockup` (앱 visible + 탭 Visible, 오브젝트 권한 없음) | DreamHouse_Agent/Admin 에 이관 후 **삭제** |

## 4. 확인 포인트

- CP-01 3열 레이아웃·같은 화면 상세 패널 (OQ-10)
- CP-12 상세 항목, 시/도 필요 여부 (CK-11)
- CP-13 관리자 편집: 패널 인라인 폼 vs 표준 Edit 모달, 편집 가능 필드 범위(상태만? 매물명·가격 포함?), 즉시 반영 범위 (CK-08)
- CP-14 375px 세로 적층, 모바일 앱 사용 여부 (CK-13)
- CP-11 미선택 문구 (CK-09)
- 상세 패널에 추가할 정보(지도 WI-1.006 / 유사 매물 WI-1.007 — Could) 착수 여부

## 5. 대응 WI / AC

| AC | 목업에서 확인 |
|---|---|
| AC-037 | 진입 직후 `detail-empty` 문구, `detail-name` 없음 |
| AC-026 / 035 | SD-07 클릭 → URL 불변, 전체 값, 배지 `계약중`(`slds-theme_warning`), 이미지 너비 > 카드 |
| AC-036 | SD-07 → SD-02, `property-detail` 1개, 목록 10건 유지 |
| AC-039 | SD-09 → `propertyPlaceholder`, alt, `₩350,000,000` |
| AC-040 | 앱 `DreamHouse Lite` → `매물 탐색`, x 좌표 filter < list < detail (목업 앱에는 `매물` 탭 없음 — WI-1.005) |
| AC-038 / 054 (시연) | 역할 `관리자` 에서만 `detail-edit-button` / `상담원` 은 0개 |
| AC-042 (시연) | 관리자 SD-02 상태 `계약중` 저장 → 카드 배지 즉시 변경, 10건 유지, 새로고침 없음 |
| AC-045 | 375px 세로 적층, 가로 스크롤 없음 |

## 6. 진입 방법

```powershell
sf project deploy start -o DH-DEV --source-dir force-app
sf org assign permset -n DreamHouse_Mockup -o DH-DEV
sf org open -o DH-DEV --path /lightning/n/Property_Explorer   # 또는 앱 런처 → DreamHouse Lite → 매물 탐색
```
