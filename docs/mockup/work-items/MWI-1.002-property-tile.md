# MWI-1.002 — 매물 카드 (Property Tile) 목업

| 항목 | 내용 |
|---|---|
| 목업 WI | **MWI-1.002** |
| 대응 본 WI | **WI-1.002** 샘플 데이터 + Property Tile/Card LWC |
| 대응 REQ / AC | REQ-003, REQ-006 · AC-020, AC-021, AC-022, AC-023 |
| 화면 | S1 매물 탐색 — 중앙 그리드의 단위 카드 |
| 상태 | [X] 목업 구현 완료 (2026-10-28, DH-DEV dry-run 성공) · [ ] 1차 리뷰 |
| 작성 | 2026-10-28 · frontend_developer |

## 1. 화면 목적

목록의 단위 요소인 매물 카드에서 상담원이 **한눈에 비교할 핵심 정보**(사진·매물명·가격·주소/도시·침실/욕실·판매 상태)를 확인한다. 고객과 카드 구성·가격 표기·배지 색상·대체 이미지를 합의하는 것이 목적이다.

## 2. Wireframe

```
┌───────────────────────────────┐  ← data-testid="property-card"
│ ┌───────────────────────────┐ │     data-id="SD-02" data-name="해운대 오션뷰"
│ │       [ 대표 사진 ]        │ │     tabindex=0 role=button aria-pressed
│ │  (빈 값·오류 → 이미지 없음) │ │     aria-label="해운대 오션뷰, ₩850,000,000"
│ └───────────────────────────┘ │  ← property-card-image (alt=매물명)
│ 해운대 오션뷰                   │  ← property-card-name
│ ₩850,000,000                  │  ← property-card-price
│ 부산광역시 해운대구 해운대해변로 22 · 부산 │ ← property-card-address
│ 침실 3 · 욕실 2                │  ← property-card-rooms
│ [판매중]                       │  ← property-status-badge data-status="Available"
└───────────────────────────────┘
  선택된 카드 = 파란 테두리. 클릭 / Enter / Space → 'propertyselect' { recordId }
```

## 3. 구현 범위 (정적 데이터)

| 항목 | 목업 구현 | 본 개발(WI-1.002)에서 교체 |
|---|---|---|
| 데이터 | `c/propertyMockData` — SD-01~SD-10 JS 배열(필드명 = `Property__c` API 이름, Id = `SD-01`…). 유효 사진 = data URI SVG 일러스트, SD-09 빈 값, SD-10 깨진 URL | 데이터 플랜 `data/sample/*.json` 적재, 실제 Picture URL(CK-10) |
| 컴포넌트 | `lwc/propertyTile` — `@api property`, `@api selected` | 동일 이름 승계 |
| 가격 | `c/propertyUtils.formatKrw` — `Intl.NumberFormat('ko-KR', KRW)` → `₩850,000,000` | 동일(또는 `lightning-formatted-number`, I-06) |
| 배지 | `propertyUtils.STATUS` — Available `slds-badge slds-theme_success` 판매중 / Under Contract `slds-theme_warning` 계약중 / Sold 기본 `slds-badge` 판매완료, `data-status` | 동일 |
| 대체 이미지 | 정적 리소스 `propertyPlaceholder`(SVG 400×300, "이미지 없음"), `onerror` 시 교체 | 동일 리소스 승계 |
| 선택 전달 | CustomEvent `propertyselect` (부모 상태) | LMS `PropertySelected__c` 발행 |
| 테스트 | 생략 | Jest + Playwright(AC-020~023) |

## 4. 확인 포인트

- CP-02 카드 항목·순서 충분한가 (면적·층수 등 추가 요구?)
- CP-03 `₩` + 원 단위 전체 금액 표기 수용 (CK-02)
- CP-04 배지 색상 톤 (CK-14) — 주황(`slds-theme_warning`)·회색 기본 배지
- CP-05 대체 이미지 디자인 (CK-10) — SD-09, SD-10 카드
- 카드 크기(사진 높이 150px)·데스크톱 3열/태블릿 2열/모바일 1열 밀도

## 5. 대응 WI / AC

| AC | 목업에서 확인 | 비고 |
|---|---|---|
| AC-020 | SD-02 카드 값·testid | 목업은 `data-id` 가 `SD-02`(레코드 Id 아님) |
| AC-021 | SD-01/03/05 배지 텍스트·`data-status`·클래스, 분포 6/2/2 | |
| AC-022 | SD-09/SD-10 → `propertyPlaceholder` | |
| AC-023 | `₩2,500,000,000`, `₩350,000,000`, 억/만원/$/KRW 없음 | |
