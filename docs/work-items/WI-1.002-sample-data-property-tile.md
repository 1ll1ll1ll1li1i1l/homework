---
subject: "WI-1.002 샘플 데이터 + Property Tile/Card LWC" # Workitem의 Subject 필드와 Sync
assignee: "junghyuck.choi.85647fe082a1@agentforce.com" # User Id로 변환하여 Sync에 사용
# 추적성 (PROJECT-PLAN v1.1 기준 — 코드네임 변경 금지)
wi-id: "WI-1.002"
depends-on: [WI-1.001] # PROJECT-PLAN §5 선행
req-ids: [REQ-003, REQ-006, REQ-012]
ac-ids: [AC-007, AC-008, AC-020, AC-021, AC-022, AC-023, AC-067]
pipeline: "DreamHouse Pipeline"
# ⬇ 도구가 자동 stamp (절대 손으로 편집 금지)
project_id: null # Project의 record id
workitem_no: null # Workitem의 Name 필드값
salesforce_id: null # Workitem의 record id
status: null # Workitem의 Status 필드값
synced_at: null # Sync 타임스탬프
---

# WI-1.002 — 샘플 데이터 + Property Tile/Card LWC (GAP)

> Cheatsheet STEP 6 산출물 (Lab 6.3, work_item_manager). 기준: `docs/PROJECT-PLAN.md` v1.1 §5 · `docs/phases/PHASE-PLAN-01.md` v1.1 §5.

## 0. 헤더

| 항목                            | 내용                                                                                                                                                                                                                                   |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Work Item                       | **WI-1.002**                                                                                                                                                                                                                           |
| Description (PROJECT-PLAN 원문) | 샘플 데이터 플랜(SD-01~SD-10, `sf data import tree --plan`) + **Property Tile/Card LWC** `propertyTile`(사진·대체 이미지, KRW 가격, 주소/도시, 침실·욕실, 상태 색상 배지, 선택 이벤트 발행) + 공통 UX 기반 — REQ-003, REQ-006, REQ-012 |
| Phase                           | Phase 1 — MVP                                                                                                                                                                                                                          |
| 모듈                            | 샘플 데이터(데이터 플랜) · LWC `propertyTile` · 정적 리소스 `propertyPlaceholder` · LMS 채널 `PropertySelected__c`                                                                                                                     |
| 우선순위                        | **Must** (분류 GAP, REQ-003 은 FIT)                                                                                                                                                                                                    |
| 상태                            | [ ] 미착수 (Not Started)                                                                                                                                                                                                               |
| 선행 (Depends-on)               | **WI-1.001**                                                                                                                                                                                                                           |
| 후행                            | WI-1.003                                                                                                                                                                                                                               |
| 예상 소요                       | **0.3 M/D (2.25h)** = REQ-003 0.5h + REQ-006 1.5h + REQ-012 0.25h                                                                                                                                                                      |
| 일정                            | 2026-10-29(목) 13:30–15:45 (Lab 9)                                                                                                                                                                                                     |
| 담당 에이전트                   | frontend_developer(LWC) · backend_developer(데이터 플랜) · test_engineer · code_reviewer                                                                                                                                               |
| 커밋명                          | `WI-1.002-sample-data-property-tile`                                                                                                                                                                                                   |

## 1. 상세 개요

시연·테스트의 기준이 되는 **샘플 매물 10건(SD-01~SD-10)**을 저장소의 데이터 플랜(`sf data import tree --plan`)으로 만들어 어느 오그에나 같은 값으로 적재할 수 있게 한다. 분포는 판매중 6 / 계약중 2 / 판매완료 2, 도시 7개(서울·부산·성남·수원·대전·제주·인천)이며, SD-09 는 사진 URL 빈 값, SD-10 은 깨진 URL 로 대체 이미지 동작을 검증한다. 재실행 시 중복 적재(20건)를 막는 절차도 함께 만든다(SIT/UAT 적재는 Lab 12).

UI 로는 목록 그리드의 단위 요소인 **매물 카드 LWC `propertyTile`** 을 만든다. 카드는 사진(누락·오류 시 정적 리소스 `propertyPlaceholder`), KRW 원 단위 전체 금액(`₩850,000,000`, 억/만원 축약 없음), 주소·도시, `침실 n · 욕실 n`, 상태 색상 배지(판매중 초록 `slds-theme_success` / 계약중 주황 `slds-theme_warning` / 판매완료 회색 기본 `slds-badge`, `data-status` 속성)를 표시한다. 카드를 클릭하거나 Enter 를 누르면 **LMS `PropertySelected__c`**(이 WI 에서 채널 생성·발행)로 `{ recordId }` 를 발행하고, WI-1.005 의 `propertyDetail` 이 구독한다.

공통 UX 기반(REQ-012)으로 SLDS 클래스만 사용하고, 카드에 `tabindex="0"`·`role="button"`·`aria-label`(매물명 + 가격)을 주며 상태는 색상뿐 아니라 텍스트로도 전달한다. 이 시점에는 카드를 놓을 `매물 탐색` 탭이 없으므로(WI-1.005 에서 생성) **1차 검증은 CLI(데이터 분포) + Jest**로 하고, AC-020~023 Playwright spec 은 이 WI 에서 **전부 `@explore`** 로 작성해 WI-1.005 전체 UI 회귀에서 실행한다(임시 하네스 미사용 — I-11).

## 2. Wireframe (propertyTile)

```
┌───────────────────────────────┐  ← data-testid="property-card"
│ ┌───────────────────────────┐ │     data-id={Id} data-name="해운대 오션뷰"
│ │                           │ │     tabindex=0 role=button
│ │       [ 대표 사진 ]        │ │     aria-label="해운대 오션뷰, ₩850,000,000"
│ │  (누락·오류 → placeholder) │ │  ← property-card-image (alt=매물명)
│ └───────────────────────────┘ │
│ 해운대 오션뷰                   │  ← property-card-name
│ ₩850,000,000                  │  ← property-card-price (텍스트 정확 일치)
│ 부산광역시 해운대구 해운대해변로 22 · 부산 │ ← property-card-address
│ 침실 3 · 욕실 2                │  ← property-card-rooms
│ [판매중]                       │  ← property-status-badge (data-status="Available",
└───────────────────────────────┘     초록 slds-theme_success / 주황 warning / 회색 기본)
   클릭 또는 Enter → LMS PropertySelected__c { recordId }
```

## 3. 선행 조건

- [ ] **선행 WI-1.001 Status `[X]` 확인** — 미완이면 시작 금지 (CLAUDE.md 진행 규칙 1)
- [ ] `Property__c`·필드·권한 세트가 DH-DEV 에 배포되어 있음, DH-DEV 기본 통화 KRW (WI-1.001 점검표)
- [ ] 전문 에이전트 사용(frontend_developer / backend_developer / test_engineer / code_reviewer)
- [ ] `git checkout main ; git pull` → WI-1.002 Feature Branch checkout
- [ ] (권장) Lab 7 목업 리뷰 결정 `docs/mockup/reviews/REVIEW-01.md` 확인 — 결정이 AC 와 다르면 AC 를 먼저 ENHANCE
- [ ] 미결: CK-10/OQ-05(유효 사진 URL 도메인·CSP), CK-14(배지 색상 톤), I-06(`₩` 문자 형태)

## 4. 세부 작업 (Numbered sub-tasks)

1. 데이터 플랜 `data/sample/property-plan.json` + `data/sample/Property__c.json` — SD-01~SD-10 (§4.1 표 값 그대로, SD-09 사진 빈 값, SD-10 깨진 URL)
2. DH-DEV 적재 전 `COUNT() = 0` 확인 → 적재 → 분포 확인(10건, 6/2/2, City 7개) 결과를 이 문서 §6 에 붙여 넣기 (AC-007)
3. 재실행 중복 방지 절차: 적재 전 COUNT 확인 → 0 이 아니면 중단 또는 초기화 스크립트 `scripts/apex/reset-sample-data.apex`(SIT/UAT 전용) 실행 → 절차를 이 문서·README 에 기록 (AC-008, SIT/UAT 실행은 Lab 12)
4. 정적 리소스 `propertyPlaceholder` (SVG, `width`/`height` 지정 → `naturalWidth > 0`) (AC-022)
5. `messageChannels/` 폴더 생성 + LMS 채널 `PropertySelected__c`(필드 `recordId`) (AD-01) — **채널 소유 WI = WI-1.002**(발행), 구독은 WI-1.005
6. `propertyTile` LWC: `@api property`, data-testid 규약, KRW 포맷, 배지 매핑 + `data-status`, 이미지 `onerror` → 대체 이미지, `aria-label`, 클릭·Enter 시 `PropertySelected__c` 발행
7. 공통 UX 기반: SLDS 클래스만, 키보드 포커스(`tabindex="0"`, `role="button"`), 상태 라벨 텍스트로 색상 외 전달 (AC-048·068 기반)
8. `₩` 문자 형태 확인: `lightning-formatted-number`·`Intl` 출력이 반각 `₩`(U+20A9)인지 DH-DEV·Jest 에서 확인 (I-06)
9. Jest `lwc/propertyTile/__tests__/propertyTile.test.js` (1차 검증)
10. Playwright `tests/e2e/WI-1.002-property-tile.spec.ts` (AC-020~023, **전부 `@explore`**)
11. code_reviewer(SLDS·접근성) → dry-run → deploy → 이월 AC 기록 → 커밋

## 5. 주요 타입 / API · 코드 예시

### 5.1 샘플 데이터 (AC 문서 §1.4)

| SD    | Name                 | Address__c                                 | City__c | Price__c   | Bed | Bath | Status__c      | Picture_URL__c                             |
| ----- | -------------------- | ------------------------------------------ | ------- | ---------- | --- | ---- | -------------- | ------------------------------------------ |
| SD-01 | 강남 래미안 아파트   | 서울특별시 강남구 테헤란로 101             | 서울    | 2500000000 | 4   | 2    | Available      | 유효 URL                                   |
| SD-02 | 해운대 오션뷰        | 부산광역시 해운대구 해운대해변로 22        | 부산    | 850000000  | 3   | 2    | Available      | 유효 URL                                   |
| SD-03 | 판교 테크노 빌라     | 경기도 성남시 분당구 판교역로 33           | 성남    | 1200000000 | 3   | 2    | Under Contract | 유효 URL                                   |
| SD-04 | 마포 한강 오피스텔   | 서울특별시 마포구 마포대로 44              | 서울    | 450000000  | 1   | 1    | Available      | 유효 URL                                   |
| SD-05 | 광교 호수 타운하우스 | 경기도 수원시 영통구 광교호수로 55         | 수원    | 980000000  | 4   | 3    | Sold           | 유효 URL                                   |
| SD-06 | 둔산 센트럴 아파트   | 대전광역시 서구 둔산로 66                  | 대전    | 520000000  | 3   | 1    | Available      | 유효 URL                                   |
| SD-07 | 제주 애월 전원주택   | 제주특별자치도 제주시 애월읍 애월해안로 77 | 제주    | 1650000000 | 5   | 3    | Under Contract | 유효 URL                                   |
| SD-08 | 송파 잠실 아파트     | 서울특별시 송파구 올림픽로 88              | 서울    | 1980000000 | 3   | 2    | Sold           | 유효 URL                                   |
| SD-09 | 송도 센트럴 오피스텔 | 인천광역시 연수구 센트럴로 99              | 인천    | 350000000  | 1   | 1    | Available      | **빈 값**                                  |
| SD-10 | 서면 스카이 빌라     | 부산광역시 부산진구 서면로 10              | 부산    | 720000000  | 2   | 1    | Available      | `https://invalid.example.invalid/none.jpg` |

- 유효 사진 URL 도메인은 OQ-05/CK-10 확정 후 지정(CSP Trusted Sites 등록 대상). 확정 전에는 정적 리소스 이미지 URL 사용 가능.

```json
// data/sample/property-plan.json
[
  {
    "sobject": "Property__c",
    "saveRefs": false,
    "resolveRefs": false,
    "files": ["Property__c.json"]
  }
]
```

```json
// data/sample/Property__c.json (발췌 — 10건 모두 위 표 값으로 작성)
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
      "attributes": { "type": "Property__c", "referenceId": "SD09" },
      "Name": "송도 센트럴 오피스텔",
      "Address__c": "인천광역시 연수구 센트럴로 99",
      "City__c": "인천",
      "Price__c": 350000000,
      "Bedrooms__c": 1,
      "Bathrooms__c": 1,
      "Status__c": "Available"
    },
    {
      "attributes": { "type": "Property__c", "referenceId": "SD10" },
      "Name": "서면 스카이 빌라",
      "Address__c": "부산광역시 부산진구 서면로 10",
      "City__c": "부산",
      "Price__c": 720000000,
      "Bedrooms__c": 2,
      "Bathrooms__c": 1,
      "Status__c": "Available",
      "Picture_URL__c": "https://invalid.example.invalid/none.jpg"
    }
  ]
}
```

```powershell
# 적재 절차 (중복 방지 포함) — DH-DEV. SIT/UAT 는 Lab 12 에서 -o 만 바꿔 동일 수행
sf data query -q "SELECT COUNT() FROM Property__c" -o DH-DEV          # 0 이어야 적재. 0 아니면 중단
sf data import tree --plan data/sample/property-plan.json -o DH-DEV
sf data query -q "SELECT Status__c, COUNT(Id) FROM Property__c GROUP BY Status__c" -o DH-DEV
sf data query -q "SELECT COUNT_DISTINCT(City__c) FROM Property__c" -o DH-DEV   # 7
sf data query -q "SELECT Name, City__c, Price__c, Bedrooms__c, Bathrooms__c, Status__c FROM Property__c ORDER BY Name" -o DH-DEV
```

```apex
// scripts/apex/reset-sample-data.apex — SIT/UAT 전용 초기화 (PROD/DH-HUB 실행 금지)
// 사용: sf apex run --file scripts/apex/reset-sample-data.apex -o DH-SIT
delete [SELECT Id FROM Property__c WHERE Name IN (
  '강남 래미안 아파트','해운대 오션뷰','판교 테크노 빌라','마포 한강 오피스텔','광교 호수 타운하우스',
  '둔산 센트럴 아파트','제주 애월 전원주택','송파 잠실 아파트','송도 센트럴 오피스텔','서면 스카이 빌라')];
```

### 5.2 LMS 채널 `PropertySelected__c` (WI-1.002 소유)

```xml
<!-- force-app/main/default/messageChannels/PropertySelected.messageChannel-meta.xml -->
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

| LMS 채널              | 필드                                             | 생성 WI      | 발행                      | 구독                        |
| --------------------- | ------------------------------------------------ | ------------ | ------------------------- | --------------------------- |
| `PropertySelected__c` | `recordId`                                       | **WI-1.002** | `propertyTile` (WI-1.002) | `propertyDetail` (WI-1.005) |
| `PropertyFilter__c`   | `keyword`, `minPrice`, `maxPrice`, `minBedrooms` | WI-1.004     | `propertyFilter`          | `propertyList`              |
| `PropertyUpdated__c`  | `recordId`                                       | WI-1.005     | `propertyDetail`          | `propertyList`              |

### 5.3 정적 리소스 `propertyPlaceholder`

```xml
<!-- staticresources/propertyPlaceholder.resource-meta.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<StaticResource xmlns="http://soap.sforce.com/2006/04/metadata">
    <cacheControl>Public</cacheControl>
    <contentType>image/svg+xml</contentType>
    <description>매물 사진 누락·오류 시 대체 이미지 (AC-022, AC-039)</description>
</StaticResource>
```

```xml
<!-- staticresources/propertyPlaceholder.svg — width/height 지정 필수 (naturalWidth > 0) -->
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="400"
  height="300"
  viewBox="0 0 400 300"
>
  <rect width="400" height="300" fill="#e5e5e5" />
  <text
    x="200"
    y="160"
    font-size="24"
    text-anchor="middle"
    fill="#706e6b"
  >이미지 없음</text>
</svg>
```

### 5.4 `propertyTile` (data-testid 규약 — 이름 변경 금지)

```html
<!-- lwc/propertyTile/propertyTile.html -->
<template>
  <article
    class="slds-card property-card"
    data-testid="property-card"
    data-id="{property.Id}"
    data-name="{property.Name}"
    tabindex="0"
    role="button"
    aria-label="{ariaLabel}"
    onclick="{handleSelect}"
    onkeydown="{handleKeydown}"
  >
    <img
      data-testid="property-card-image"
      src="{imageUrl}"
      alt="{property.Name}"
      onerror="{handleImageError}"
      class="property-card__image"
    />
    <div class="slds-p-around_small">
      <h3
        data-testid="property-card-name"
        class="slds-text-heading_small slds-truncate"
      >
        {property.Name}
      </h3>
      <p data-testid="property-card-price">
        <lightning-formatted-number
          value="{property.Price__c}"
          format-style="currency"
          currency-code="KRW"
          currency-display-as="symbol"
          maximum-fraction-digits="0"
        >
        </lightning-formatted-number>
      </p>
      <p data-testid="property-card-address">
        {property.Address__c} · {property.City__c}
      </p>
      <p data-testid="property-card-rooms">{roomsLabel}</p>
      <span
        data-testid="property-status-badge"
        class="{badgeClass}"
        data-status="{property.Status__c}"
        >{statusLabel}</span
      >
    </div>
  </article>
</template>
```

```js
// lwc/propertyTile/propertyTile.js
import { LightningElement, api, wire } from "lwc";
import { publish, MessageContext } from "lightning/messageService";
import PROPERTY_SELECTED from "@salesforce/messageChannel/PropertySelected__c";
import PLACEHOLDER from "@salesforce/resourceUrl/propertyPlaceholder";

const STATUS = {
  Available: { label: "판매중", cls: "slds-badge slds-theme_success" },
  "Under Contract": { label: "계약중", cls: "slds-badge slds-theme_warning" },
  Sold: { label: "판매완료", cls: "slds-badge" } // 회색 기본 배지 (CK-14)
};
const KRW = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0
});

export default class PropertyTile extends LightningElement {
  @api property;
  imageFailed = false;
  @wire(MessageContext) messageContext;

  get imageUrl() {
    return !this.imageFailed && this.property?.Picture_URL__c
      ? this.property.Picture_URL__c
      : PLACEHOLDER;
  }
  get statusLabel() {
    return STATUS[this.property?.Status__c]?.label ?? "";
  }
  get badgeClass() {
    return STATUS[this.property?.Status__c]?.cls ?? "slds-badge";
  }
  get roomsLabel() {
    return `침실 ${this.property?.Bedrooms__c ?? "-"} · 욕실 ${this.property?.Bathrooms__c ?? "-"}`;
  }
  get ariaLabel() {
    return `${this.property?.Name}, ${KRW.format(this.property?.Price__c ?? 0)}`;
  } // AC-048

  handleImageError() {
    this.imageFailed = true;
  } // AC-022
  handleKeydown(e) {
    if (e.key === "Enter") this.handleSelect();
  }
  handleSelect() {
    publish(this.messageContext, PROPERTY_SELECTED, {
      recordId: this.property.Id
    });
  }
}
```

```xml
<!-- lwc/propertyTile/propertyTile.js-meta.xml — 단독 배치 안 함(목록의 자식) -->
<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>62.0</apiVersion>
    <isExposed>false</isExposed>
</LightningComponentBundle>
```

- 상태 라벨은 LWC 상수로 관리(배지 클래스와 같은 곳). 선택목록 라벨이 바뀌면 함께 ENHANCE. WI-1.005 에서 상세 패널과 공유하려면 `c/propertyUtils` 로 분리 가능(code_reviewer 판단).
- **(확인 필요, I-06)** `Intl` `ko-KR` KRW 결과·`lightning-formatted-number` 출력이 AC 의 반각 `₩850,000,000` 과 같은 문자인지(전각 `￦` 가능성). 다르면 AC 기대값 또는 구현을 ENHANCE.
- 대안(선택): 타일은 `select` CustomEvent 만 보내고 `propertyList` 가 LMS 로 발행. PROJECT-PLAN 체크리스트가 "타일이 발행" 이므로 기본안 유지.
- `apiVersion` 은 `sfdx-project.json` 의 `sourceApiVersion` 과 맞춘다.

### 5.5 Jest (1차 검증)

```js
// lwc/propertyTile/__tests__/propertyTile.test.js
import { createElement } from "lwc";
import PropertyTile from "c/propertyTile";
import { publish } from "lightning/messageService";

const SD02 = {
  Id: "a00000000000002",
  Name: "해운대 오션뷰",
  Address__c: "부산광역시 해운대구 해운대해변로 22",
  City__c: "부산",
  Price__c: 850000000,
  Bedrooms__c: 3,
  Bathrooms__c: 2,
  Status__c: "Available",
  Picture_URL__c: "https://example.invalid/sd02.jpg"
};
const mount = (property) => {
  const el = createElement("c-property-tile", { is: PropertyTile });
  el.property = property;
  document.body.appendChild(el);
  return el;
};
const q = (el, id) => el.shadowRoot.querySelector(`[data-testid="${id}"]`);

afterEach(() => {
  while (document.body.firstChild)
    document.body.removeChild(document.body.firstChild);
  jest.clearAllMocks();
});

it("AC-020 요약 정보", () => {
  const el = mount(SD02);
  expect(q(el, "property-card-name").textContent).toBe("해운대 오션뷰");
  expect(q(el, "property-card-address").textContent).toContain(
    "부산광역시 해운대구 해운대해변로 22"
  );
  expect(q(el, "property-card-rooms").textContent).toBe("침실 3 · 욕실 2");
  expect(q(el, "property-card-image").alt).toBe("해운대 오션뷰");
});

it.each([
  ["Available", "판매중", "slds-theme_success"],
  ["Under Contract", "계약중", "slds-theme_warning"]
])("AC-021 배지 %s", (status, label, cls) => {
  const b = q(mount({ ...SD02, Status__c: status }), "property-status-badge");
  expect(b.textContent).toBe(label);
  expect(b.dataset.status).toBe(status);
  expect(b.classList).toContain(cls);
});

it("AC-021 Sold = 회색 기본 배지", () => {
  const b = q(mount({ ...SD02, Status__c: "Sold" }), "property-status-badge");
  expect(b.textContent).toBe("판매완료");
  expect(b.classList).not.toContain("slds-theme_success");
  expect(b.classList).not.toContain("slds-theme_warning");
});

it("AC-022 사진 빈 값 → propertyPlaceholder", () => {
  expect(
    q(mount({ ...SD02, Picture_URL__c: null }), "property-card-image").src
  ).toContain("propertyPlaceholder");
});

it("AC-022 이미지 오류 → propertyPlaceholder", async () => {
  const el = mount({
    ...SD02,
    Picture_URL__c: "https://invalid.example.invalid/none.jpg"
  });
  q(el, "property-card-image").dispatchEvent(new CustomEvent("error"));
  await Promise.resolve();
  expect(q(el, "property-card-image").src).toContain("propertyPlaceholder");
});

it("AC-048 기반 aria-label = 매물명 + 가격", () => {
  expect(q(mount(SD02), "property-card").getAttribute("aria-label")).toContain(
    "해운대 오션뷰"
  );
});

it("AC-026 기반 클릭·Enter → PropertySelected 발행", () => {
  const card = q(mount(SD02), "property-card");
  card.click();
  card.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
  expect(publish).toHaveBeenCalledTimes(2);
  expect(publish.mock.calls[0][2]).toEqual({ recordId: "a00000000000002" });
});
```

- `lightning-formatted-number` 는 Jest 에서 스텁이라 `₩` 텍스트는 Jest 로 확인할 수 없다 → AC-020/023 의 가격 텍스트는 WI-1.005 Playwright 가 최종 근거.

### 5.6 Playwright spec 골격 (전부 `@explore`)

```ts
// tests/e2e/WI-1.002-property-tile.spec.ts — 매물 탐색 탭(WI-1.005) 필요 → 전부 @explore
import { test, expect } from "@playwright/test";
test.use({ storageState: "tests/e2e/.auth/agent.json" });
const card = (page, name) =>
  page.locator(`[data-testid="property-card"][data-name="${name}"]`);

test("AC-020 카드 요약 정보", { tag: "@explore" }, async ({ page }) => {
  const c = card(page, "해운대 오션뷰");
  await expect(c.getByTestId("property-card-price")).toHaveText("₩850,000,000");
  await expect(c.getByTestId("property-card-rooms")).toHaveText(
    "침실 3 · 욕실 2"
  );
  await expect(c.getByTestId("property-status-badge")).toHaveText("판매중");
});
test("AC-021 상태 배지 색상 매핑", { tag: "@explore" }, async ({ page }) => {
  /* SD-01/03/05 클래스·data-status, 6/2/2 */
});
test("AC-022 대체 이미지", { tag: "@explore" }, async ({ page }) => {
  /* SD-09/10 src·naturalWidth>0, SD-02 미포함 */
});
test("AC-023 KRW 전체 금액", { tag: "@explore" }, async ({ page }) => {
  /* '₩2,500,000,000', '₩350,000,000', 억/만원/$/KRW 없음 */
});
```

## 6. 수락 기준 (AC 매핑)

> **[이월→WI-1.005]** = 1차 검증(Jest/CLI)은 이 WI, E2E 최종 검증은 WI-1.005 전체 UI 회귀(PHASE-PLAN-01 §3.4). **[이월→Lab 12]** = SIT/UAT 오그 실행.

- [x] **AC-007** 샘플 10건 적재·분포 — Given: "빈 Scratch Org(DH-DEV)에 REQ-001 메타데이터 배포 완료" / When: "`sf data import tree --plan <plan.json> -o DH-DEV` 실행 후 `SELECT Status__c, COUNT(Id) FROM Property__c GROUP BY Status__c`" / Then: "총 10건, Available 6 / Under Contract 2 / Sold 2, City 고유값 7개(서울·부산·성남·수원·대전·제주·인천), 각 레코드 값이 §1.4 표와 일치" → CLI, **이 WI 에서 완료**
  - 결과 붙여 넣기: `(실행 후 기입)` (ENHANCED 2026-10-28: backend_developer DH-DEV 적재 결과 — `pwsh -File scripts/load-sample-data.ps1 -TargetOrg DH-DEV`: 적재 전 SD 0건 → `sf data import tree` 10건(SD01~SD10) 생성 / 전체 10건, Available=6, Under Contract=2, Sold=2 / `COUNT_DISTINCT(City__c)`=7 (서울 3, 부산 2, 성남·수원·대전·제주·인천 각 1) / `scripts/soql/sample-data-check.soql`(ORDER BY Name) 10행 값이 §1.4 표와 일치(SD-09 Picture null, SD-10 `https://invalid.example.invalid/none.jpg`))
- [ ] **AC-008** 오그 간 재현성 (ENHANCED 2026-10-28: 이 WI 범위 완료 — DH-DEV 재실행 시 SD 10건 감지 → 적재 건너뜀, 10건 유지(20건 아님). 절차: `scripts/load-sample-data.ps1`(매물명 기준 COUNT 0 → 적재 / 10 → 건너뜀 / 그 외 → 중단) + `scripts/apex/reset-sample-data.apex`(Scratch/Sandbox 가드, DH-DEV 에서 Savepoint 롤백으로 10건 삭제 동작 확인). SIT·UAT 적재·`ORDER BY Name` 비교는 Lab 12 이월로 체크 보류) — Given: "AC-007 을 통과한 동일 데이터 플랜 파일" / When: "DH-SIT 와 DH-UAT 에 같은 명령으로 적재" / Then: "두 오그 모두 `ORDER BY Name` 결과 10행이 DH-DEV 와 완전히 같음. 재실행 시 중복 적재되지 않거나(20건 아님) 중복 방지 절차가 문서화" → 이 WI: 절차 문서 + DH-DEV 재실행 시 COUNT 확인 / **SIT·UAT 적재 [이월→Lab 12]**
- [ ] **AC-020** 카드 요약 정보 — Given: "`agent` 로그인, "매물 탐색" 탭, 조건 없음" / When: "`data-name="해운대 오션뷰"` 인 `property-card` 를 찾는다" / Then: "`property-card-name` = `해운대 오션뷰`, `property-card-price` = `₩850,000,000`, `property-card-address` 에 `부산광역시 해운대구 해운대해변로 22` 와 `부산` 포함, `property-card-rooms` = `침실 3 · 욕실 2`, `property-status-badge` = `판매중`, `property-card-image` 의 `alt` = `해운대 오션뷰`" → 1차 Jest / **E2E [이월→WI-1.005]** (ENHANCED 2026-10-28: 1차 Jest `propertyTile.test.js` 통과 — 체크는 E2E(WI-1.005) 통과 후)
- [ ] **AC-021** 배지 색상 매핑 — Given: "AC-020 과 같음" / When: "SD-01, SD-03, SD-05 카드의 `property-status-badge` 확인" / Then: "SD-01 → `판매중`, `data-status="Available"`, `slds-theme_success` / SD-03 → `계약중`, `Under Contract`, `slds-theme_warning` / SD-05 → `판매완료`, `Sold`, 초록·주황 클래스 없음. 전체 배지 판매중 6, 계약중 2, 판매완료 2" → 1차 Jest / **E2E [이월→WI-1.005]** (CK-14) (ENHANCED 2026-10-28: 1차 Jest `propertyTile.test.js` 통과 — 체크는 E2E(WI-1.005) 통과 후)
- [ ] **AC-022** 대체 이미지 — Given: "AC-020 과 같음" / When: "SD-09(빈 값), SD-10(깨진 URL) 카드의 `property-card-image` 확인" / Then: "두 카드 모두 `src` 에 `propertyPlaceholder` 포함, `naturalWidth > 0`, `alt` = 각 매물명. SD-02 카드는 `propertyPlaceholder` 미포함" → 1차 Jest(분기) / **`naturalWidth` 포함 E2E [이월→WI-1.005]** (CK-10) (ENHANCED 2026-10-28: 1차 Jest `propertyTile.test.js` 통과 — 체크는 E2E(WI-1.005) 통과 후)
- [ ] **AC-023** KRW 전체 금액 — Given: "AC-020 과 같음" / When: "SD-01, SD-09 카드 가격과 그리드 전체 텍스트 확인" / Then: "SD-01 = `₩2,500,000,000`, SD-09 = `₩350,000,000`. `property-list` 텍스트에 `억`, `만원`, `$`, `KRW` 없음" → 1차 Jest(가능 범위) / **E2E [이월→WI-1.005]** (CK-02, I-06) (ENHANCED 2026-10-28: 1차 Jest `propertyTile.test.js` 통과 — 체크는 E2E(WI-1.005) 통과 후)
- [ ] **AC-067** 비밀정보 미커밋 — Given: "커밋 직전 저장소" / When: "`git ls-files | grep -E "\.auth/|sfdx-url|accessToken"`" / Then: "0줄, `.gitignore` 에 `tests/e2e/.auth/`" → 수동 QA

## 7. 테스트 요구

| 종류       | 대상                                       | AC                                                | 목표 / 명령                                                                         |
| ---------- | ------------------------------------------ | ------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Jest       | `propertyTile.test.js`                     | AC-020~023 로직, AC-026·048 기반(발행·aria-label) | 통과 — `npm run test:unit -- propertyTile`                                          |
| CLI 수동   | 데이터 플랜 적재·분포·재실행               | AC-007, 008                                       | §6 결과 기입                                                                        |
| Playwright | `tests/e2e/WI-1.002-property-tile.spec.ts` | AC-020, 021, 022, 023                             | 전부 `@explore` — 최종 WI-1.005 `npx playwright test`                               |
| Apex       | —                                          | —                                                 | 이 WI 는 Apex 추가 없음. 기존 `RunLocalTests` 회귀 실패 0, 조직 커버리지 ≥ 75% 유지 |

## 8. 통합 체크리스트

- [ ] 전문 에이전트 사용 확인
- [ ] 선행 WI-1.001 `[X]` 확인
- [x] 데이터 플랜 SD-01~SD-10 커밋, DH-DEV 적재 → 10건·6/2/2·도시 7개 (AC-007) (ENHANCED 2026-10-28: `data/sample/property-plan.json` + `Property__c.json` 작성·DH-DEV 적재 완료(커밋은 WI 커밋 시). plan 의 `saveRefs`/`resolveRefs` 는 현 sf CLI 가 무시·경고하므로 제거. SD-01~08 유효 사진 URL 은 CK-10/OQ-05 확정 전 임시로 정적 리소스 `/resource/propertySamplePhotos/sdNN.svg`(신규, 같은 오그 경로라 CSP 불필요, `propertyPlaceholder` 문자열 미포함 → AC-022 대조군 SD-02 충족), DH-DEV 배포 0Afgw000000bCjlCAE)
- [x] 재실행 중복 방지 절차·초기화 스크립트 (AC-008) (ENHANCED 2026-10-28: `scripts/load-sample-data.ps1`(PS7, DH-HUB/core 차단, 적재 후 분포 자동 검증 exit 1) · `scripts/apex/reset-sample-data.apex` · `scripts/soql/sample-data-check.soql`. README 기록은 documentation_writer 에 위임 필요)
- [x] 정적 리소스 `propertyPlaceholder` (ENHANCED 2026-10-28: MWI-1.002 목업 SVG 400×300 그대로 승계, DH-DEV 배포 0Afgw000000b1WcCAI)
- [x] LMS 채널 `PropertySelected__c` (ENHANCED 2026-10-28: `messageChannels/PropertySelected.messageChannel-meta.xml`(필드 `recordId`, isExposed) DH-DEV 배포 0Afgw000000bCjlCAE)
- [x] `propertyTile`: testid 규약, KRW 포맷, 배지 매핑 + `data-status`, `aria-label`, 키보드 Enter, 발행 (ENHANCED 2026-10-28: 목업 승계 — `lightning-formatted-number` KRW, `c/propertyUtils` 매핑 재사용, 사진 빈 값·onerror → `propertyPlaceholder`(레코드 교체 시 초기화), 클릭·Enter·Space → LMS `PropertySelected__c { recordId }` 발행 + 목업 호환 `propertyselect` CustomEvent 병행(WI-1.003/1.005 에서 제거 검토). DH-DEV 배포 0Afgw000000b1WcCAI)
- [ ] `₩` 문자 형태 확인 (I-06) 결과 기록 (ENHANCED 2026-10-28: Jest(Node Intl ko-KR) aria-label = 반각 U+20A9 확인, 전각 U+FFE6 아님. DH-DEV `lightning-formatted-number` 화면 출력 확인은 WI-1.005 Playwright 로 이월)
- [x] Jest 통과 (ENHANCED 2026-10-28: `npx sfdx-lwc-jest -- propertyTile` 18/18 통과)
- [x] `WI-1.002-property-tile.spec.ts` 작성(`@explore`) — 1차 실행 대상 없음(`--grep-invert @explore` 시 0건 정상), PHASE-PLAN-01 §3.4 기록 (ENHANCED 2026-10-28: test_engineer — AC-020~023 test() 4건 전부 `@explore`, 공용 헬퍼 `tests/e2e/support/explorer.ts`. `--grep-invert "@explore"` 는 0건이라 "No tests found" 로 종료코드 1 → 1차 실행 시 `--pass-with-no-tests` 추가. 참고 실행(DH-DEV, 목업 `매물 탐색` 탭·목업 데이터 소스, 기본 세션 state.json — agent.json 미생성): 4/4 통과. 실데이터·agent 세션 최종 검증은 WI-1.005 회귀)
- [ ] code_reviewer 리뷰(SLDS·접근성)
- [ ] `sf project deploy start --dry-run -o DH-DEV` 성공 → `sf project deploy start -o DH-DEV`
- [ ] Apex: `sf apex run test -l RunLocalTests -o DH-DEV -c -r human` 실패 0
- [ ] 정적 분석: `sf code-analyzer run --workspace . --view table` — High 이상 0건
- [ ] AC-067 0줄 확인
- [ ] CI(선택·미도입) — 해당 없음
- [ ] PROJECT-PLAN §5 / PHASE-PLAN-01 §1.2·§5.7 / 이 문서 체크리스트·Status `[X]`
- [ ] 커밋 `WI-1.002-sample-data-property-tile`

## 9. 참고 자료

- `docs/PROJECT-PLAN.md` v1.1 — §5, §5.2 WI-1.002, §7
- `docs/phases/PHASE-PLAN-01.md` v1.1 — §3.3·§3.4·§3.6, §5 WI-1.002, §12 I-06/I-11
- `docs/phase-0/ACCEPTANCE-CRITERIA.md` — §1.4 SD 표, §1.5 문구, §1.6 testid, AC-007/008/020~023/067
- `docs/REQUIREMENT.md` v1.1 — REQ-003, REQ-006, REQ-012
- `docs/phase-0/FIT-GAP-NUD.md` v1.1 — AD-01(LMS), D-16/D-17
- Salesforce: `sf data import tree`, Lightning Message Service, `lightning-formatted-number`, SLDS Badge, `sfdx-lwc-jest`
