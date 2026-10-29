---
subject: "WI-1.005 상세 패널 + DreamHouse Lite 앱·Lightning App Page" # Workitem의 Subject 필드와 Sync
assignee: "junghyuck.choi.85647fe082a1@agentforce.com" # User Id로 변환하여 Sync에 사용
# 추적성 (PROJECT-PLAN v1.1 기준 — 코드네임 변경 금지)
wi-id: "WI-1.005"
depends-on: [WI-1.003, WI-1.004] # PROJECT-PLAN §5 선행 = "WI-1.003, WI-1.004"
req-ids: [REQ-009, REQ-010, REQ-011, REQ-012]
ac-ids:
  [
    AC-026,
    AC-035,
    AC-036,
    AC-037,
    AC-038,
    AC-039,
    AC-040,
    AC-041,
    AC-042,
    AC-043,
    AC-045,
    AC-048,
    AC-054,
    AC-055,
    AC-067,
    AC-068
  ]
pipeline: "DreamHouse Pipeline"
# ⬇ 도구가 자동 stamp (절대 손으로 편집 금지)
project_id: null # Project의 record id
workitem_no: null # Workitem의 Name 필드값
salesforce_id: null # Workitem의 record id
status: null # Workitem의 Status 필드값
synced_at: null # Sync 타임스탬프
---

# WI-1.005 — 상세 패널 + Lightning App Page (GAP)

> Cheatsheet STEP 6 산출물 (Lab 6.3, work_item_manager). 기준: `docs/PROJECT-PLAN.md` v1.1 §5 · `docs/phases/PHASE-PLAN-01.md` v1.1 §8 · §3.3/§3.4.
> 이 문서만 보고 개발할 수 있도록 필요한 값·코드·AC 를 모두 옮겨 적었다. 원본과 다르면 원본을 기준으로 하고 이 문서를 ENHANCE 한다.
> **Phase 1 최종 UI 검증 지점** — 자기 AC + WI-1.001~1.004 의 이월 AC(§6) 를 전부 통과해야 `[X]`.

## 0. 헤더

| 항목                            | 내용                                                                                                                                                                                                                                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Work Item                       | **WI-1.005**                                                                                                                                                                                                                                                                                      |
| Description (PROJECT-PLAN 원문) | **상세 패널** `propertyDetail`(LMS `PropertySelected__c` 구독, 큰 사진 + 전체 속성, 관리자 전용 편집·상태 변경, 저장 후 카드·배지·상세 즉시 반영) + **DreamHouse Lite 앱·Lightning App Page** "매물 탐색"(좌 필터 + 중앙 그리드 + 우 상세) + 앱/탭 권한 보강 — REQ-009, REQ-010, REQ-011, REQ-012 |
| Phase                           | Phase 1 — MVP (2026-10-29 ~ 2026-10-30, 1 스프린트)                                                                                                                                                                                                                                               |
| 모듈                            | LWC(`propertyDetail`, `propertyList` ENHANCE) · LMS(`PropertyUpdated__c`) · 앱/App Page/탭 · 보안(권한 세트 ENHANCE)                                                                                                                                                                              |
| 우선순위                        | **Must** (분류 GAP, REQ-010 은 FIT) — AC-068 만 Should                                                                                                                                                                                                                                            |
| 상태                            | [ ] 미착수 (Not Started)                                                                                                                                                                                                                                                                          |
| 선행 (Depends-on)               | **WI-1.003, WI-1.004**                                                                                                                                                                                                                                                                            |
| 후행                            | WI-1.006, WI-1.007 (Could · 선택)                                                                                                                                                                                                                                                                 |
| 예상 소요                       | **0.35 M/D (2.75h)** = REQ-009 1.5h + REQ-010 0.5h + REQ-011 0.5h + REQ-012 0.25h                                                                                                                                                                                                                 |
| 일정                            | 2026-10-30(금) 11:45–14:30 (Lab 9) — **M4** MVP 완성(DEV). 전체 회귀는 Lab 10(14:30–15:30)과 이어서 실행                                                                                                                                                                                          |
| 담당 에이전트                   | frontend_developer(LWC·App Page) · backend_developer(앱·탭·권한 세트) · test_engineer(전체 UI 회귀) · code_reviewer                                                                                                                                                                               |
| 대상 오그                       | DH-DEV                                                                                                                                                                                                                                                                                            |
| 커밋명                          | `WI-1.005-property-detail-app-page` (PROJECT-PLAN §5.2·PHASE-PLAN-01 §8 과 동일)                                                                                                                                                                                                                  |

## 1. 상세 개요

"매물 탐색" 화면을 완성하는 마지막 Must WI 다. 상담원이 카드를 클릭하면 **같은 화면 오른쪽의 상세 패널**(`propertyDetail`)에 큰 사진과 전체 속성(매물명·주소·도시·가격·침실·욕실·상태 배지)이 표시된다. 선택 전달은 WI-1.002 가 발행하는 LMS `PropertySelected__c` 를 구독해 처리하며(AD-01), 페이지 URL 은 바뀌지 않는다(OQ-10). 상세는 LDS `getRecord` 로 읽고, 사진이 없거나 깨지면 정적 리소스 `propertyPlaceholder` 로 대체한다. 상태 배지 매핑(판매중=`slds-theme_success`, 계약중=`slds-theme_warning`, 판매완료=회색)은 타일과 같다.

편집은 **관리자 전용**이다. `getObjectInfo` 의 `updateable` 이 true 일 때만 `detail-edit-button` 을 렌더하고, 클릭 시 `lightning-record-edit-form` 으로 상태 등 값을 수정한다(상담원은 버튼·폼·상태 입력 0개, AC-054). 저장 성공 시 ① `notifyRecordUpdateAvailable` 로 상세를, ② 새 LMS 채널 **`PropertyUpdated__c`** 발행 → `propertyList` 가 구독해 `refresh()`(=`refreshApex`) 를 호출해 카드·배지·건수를 **새로고침 없이** 갱신한다(REQ-011, 같은 사용자 화면 — D-12/OQ-11, I-02 PM 확정: 채널·구독 모두 WI-1.005 소유). 필터 상태는 유지된다(AC-043).

마지막으로 Lightning 앱 **`DreamHouse Lite`**(내비게이션 `매물 탐색`·`매물`)와 App Page **`Property_Explorer`**(라벨 `매물 탐색`, 좌 `propertyFilter` / 중앙 `propertyList` / 우 `propertyDetail`)와 App Page 탭을 만들고, 두 권한 세트에 `applicationVisibilities`·`tabSettings(Property_Explorer)` 를 ENHANCE 한다(`Property__c` 탭은 WI-1.001 에서 생성·Visible 완료 — I-03). 탭이 생기므로 WI-1.001~1.004 에서 `@explore` 로 미뤄 둔 화면 AC 를 **`npx playwright test` 전체 회귀**로 최종 검증한다. 진행 방식은 "AI 로 먼저 프로토타입 → 사람이 AC 로 검증"이다.

### 1.1 UI 와이어프레임 — "매물 탐색" (1440×900, 3열)

```
┌─ DreamHouse Lite ▾ │ [매물 탐색] [매물] ───────────────────────────────────────────────────────────────┐
│┌ filter-panel ─────┐┌ property-list ──────────────────────────────── 10건 ┐┌ property-detail ─────────┐│
││ 키워드            ││ ┌property-card──┐ ┌property-card──┐ ┌property-card──┐ ││ ┌──────────────────────┐ ││
││ [filter-keyword ] ││ │ [  image   ] │ │ [  image   ] │ │ [  image   ] │ ││ │                      │ ││
││ 최소 가격         ││ │ 강남 래미안… │ │ 해운대 오션뷰 │ │ 판교 테크노…  │ ││ │    detail-image      │ ││
││ [filter-min-price]││ │₩2,500,000,000│ │ ₩850,000,000 │ │₩1,200,000,000│ ││ │   (카드보다 큰 너비)   │ ││
││ 최대 가격         ││ │침실 4 · 욕실 2│ │침실 3 · 욕실 2│ │침실 3 · 욕실 2│ ││ └──────────────────────┘ ││
││ [filter-max-price]││ │ (판매중)     │ │ (판매중)     │ │ (계약중)     │ ││ 제주 애월 전원주택        ││
││ 최소 침실 수      ││ └──────────────┘ └──────────────┘ └──────────────┘ ││ 주소 … 애월해안로 77      ││
││ [전체         ▾]  ││ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ││ 도시 제주                 ││
││                   ││ │     …        │ │     …        │ │     …        │ ││ 가격 ₩1,650,000,000       ││
││ [filter-reset]    ││ └──────────────┘ └──────────────┘ └──────────────┘ ││ 침실 5   욕실 3           ││
│└───────────────────┘└─────────────────────────────────────────────────────┘│ (계약중)  [편집]*관리자만 ││
│  region1 (좌)          region2 (중앙)                                        └──────────────────────────┘│
│                                                                                region3 (우)              │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
 375×812: filter-panel → property-list(행당 카드 1개) → property-detail 세로 적층, 가로 스크롤 없음 (AC-045)
```

### 1.2 상세 패널 확대 (상태별)

```
 ① 미선택 (AC-037)            ② 선택 — 상담원 (AC-035/054)     ③ 관리자 편집 (AC-038/042)
┌ property-detail ────────┐  ┌ property-detail ────────────┐  ┌ property-detail ─────────────┐
│                         │  │ [detail-image]  alt=매물명    │  │ … (②와 동일 표시)              │
│ detail-empty:           │  │ detail-name                  │  │ ┌ detail-edit-form ─────────┐ │
│ 매물을 선택하면 상세     │  │ 주소  detail-address         │  │ │ 매물명 [해운대 오션뷰   ]  │ │
│ 정보가 표시됩니다.       │  │ 도시  detail-city            │  │ │ 가격   [850000000      ]  │ │
│                         │  │ 가격  detail-price ₩…        │  │ │ 상태   [계약중       ▾]   │ │
│ (detail-name 없음)       │  │ 침실  detail-bedrooms        │  │ │   └ detail-status-input   │ │
│                         │  │ 욕실  detail-bathrooms       │  │ │        [저장] detail-save-│ │
│                         │  │ (detail-status-badge)        │  │ │                  button   │ │
│                         │  │ 편집 버튼 없음                │  │ └───────────────────────────┘ │
└─────────────────────────┘  └──────────────────────────────┘  └──────────────────────────────┘
   detail-state 는 OQ-01/CK-11 결과에 따라 배치            저장 → 토스트 + 카드·배지·상세 즉시 반영
```

## 2. 선행 조건

- [ ] **선행 WI-1.003, WI-1.004 `[X]` 확인** (PROJECT-PLAN §5 / PHASE-PLAN-01 §1.2) — CLAUDE.md 진행 규칙 1. 간접 선행 WI-1.001·1.002 도 `[X]`
- [ ] 이 작업에 `.claude/agents/` 전문 에이전트(frontend_developer / backend_developer / test_engineer / code_reviewer) 사용 — 진행 규칙 0
- [ ] `git checkout main ; git pull` 후 DevOps Center 가 만든 WI-1.005 Feature Branch fetch/checkout
- [ ] DH-DEV 에 선행 산출물 배포 확인: `propertyTile`(WI-1.002, `PropertySelected__c` 발행), `propertyList`(WI-1.003, `@api refresh()`), `propertyFilter`(WI-1.004, `PropertyFilter__c`), `PropertyController`, `Property__c` 탭·권한 세트(WI-1.001), 샘플 SD-01~SD-10
- [x] Playwright 사용자 3명(agent/admin/noaccess) 인증 상태 `tests/e2e/.auth/*.json` 준비(커밋 금지) (ENHANCED 2026-10-29: `node tests/e2e/global-setup.mjs` → `setup-users.mjs`(config/users/*.json) 생성·세션 저장. Minimum Access 프로필+권한 세트에 LightningExperienceUser 가 없어 3명 모두 `Standard Platform User`)
- [ ] 이전 WI spec 4개(`WI-1.001-property-crud`, `WI-1.002-property-tile`, `WI-1.003-property-list`, `WI-1.004-search-filter`)의 `@explore` 테스트 존재 확인
- [ ] AC-068 용 `@axe-core/playwright` devDependency 확인(없으면 test_engineer 가 추가)
- [ ] 미결 고객 결정 확인: CK-09(문구) · CK-11(State__c / `detail-state`) · CK-03/04/05(잠정 AC-058/057/061) — 미확정이면 잠정 AC 는 완료 조건 제외

## 3. 세부 작업 (Numbered sub-tasks)

1. **`propertyDetail` LWC** — `PropertySelected__c` 구독, `detail-empty` 초기 문구, `getRecord`(LDS) 로 전체 속성·큰 사진·대체 이미지(`propertyPlaceholder`), testid 규약(§4.6), 상태 배지(타일과 같은 매핑) — REQ-009 (§4.1)
2. **관리자 전용 편집** — `getObjectInfo.updateable === true` 일 때만 `detail-edit-button` → `lightning-record-edit-form`(`detail-edit-form`, Status=`detail-status-input`, `detail-save-button`). 상담원 0개(AC-054)
3. **LMS 채널 `PropertyUpdated__c`**(필드 `recordId`) 생성 — `messageChannels/PropertyUpdated.messageChannel-meta.xml` (I-02 확정, §4.2)
4. **저장 성공 처리** — `notifyRecordUpdateAvailable([{recordId}])` + `PropertyUpdated__c` 발행 + 성공 토스트 (REQ-011)
5. **`propertyList` ENHANCE** — `PropertyUpdated__c` 구독 → `this.refresh()`(현재 `filter` 유지, `refreshApex`) — WI-1.004 의 `PropertyFilter__c` 구독은 유지 (§4.3)
6. **Lightning 앱 `DreamHouse_Lite`**(라벨 `DreamHouse Lite`, 내비게이션 `Property_Explorer`·`Property__c`) — REQ-010 (§4.4)
7. **App Page `Property_Explorer`**(라벨 `매물 탐색`) — region1 `propertyFilter` / region2 `propertyList` / region3 `propertyDetail`. 각 LWC `js-meta.xml` 에 `isExposed=true` + `lightning__AppPage`
8. **탭 `Property_Explorer`**(App Page 탭, 라벨 `매물 탐색`)만 생성. `Property__c` 탭은 WI-1.001 생성분을 앱 내비게이션에만 추가 (I-03)
9. **권한 세트 ENHANCE** — `DreamHouse_Agent`·`DreamHouse_Admin` 에 `applicationVisibilities`(DreamHouse_Lite visible) + `tabSettings`(`Property_Explorer` Visible). `noaccess` 는 권한 세트 없음 → 앱 미노출(AC-055 UI)
10. **375px 반응형 확인** → 안 A(3열 템플릿) 유지 / 안 B(`propertyExplorer` 컨테이너 + `lightning-layout`) 전환 결정 (§4.5)
11. **Jest** — `propertyDetail.test.js`(미선택·선택·관리자/상담원 분기·저장 후 발행), `propertyList.test.js` 에 `PropertyUpdated__c` 수신 → `refreshApex` 호출·`filter` 유지 케이스 추가
12. **Playwright** — `tests/e2e/WI-1.005-property-detail.spec.ts`(AC-026, 035~043, 054, 055 UI), `tests/e2e/WI-1.005-layout-a11y.spec.ts`(AC-045, 048, 068)
13. **전체 UI 회귀** — `npx playwright test`(태그 제외 없음): WI-1.005 spec + §6 이월 AC 전부. 실패 시 원인 WI 의 Feature Branch 에 `WI-1.00n-*` 이름으로 수정 커밋(PHASE-PLAN-01 §3.3-3) → 재실행
14. code_reviewer 리뷰, `sf project deploy start --dry-run` → `sf project deploy start -o DH-DEV`, 3개 사용자 수동 스모크, PHASE-PLAN-01 §3.4 이월 완료 칸 `[X]`, 커밋

## 4. 주요 타입 / API · 코드 예시

### 4.1 `propertyDetail`

```js
// force-app/main/default/lwc/propertyDetail/propertyDetail.js (발췌)
import { LightningElement, wire } from "lwc";
import {
  subscribe,
  unsubscribe,
  publish,
  MessageContext
} from "lightning/messageService";
import {
  getRecord,
  getFieldValue,
  notifyRecordUpdateAvailable
} from "lightning/uiRecordApi";
import { getObjectInfo } from "lightning/uiObjectInfoApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import PROPERTY_SELECTED from "@salesforce/messageChannel/PropertySelected__c";
import PROPERTY_UPDATED from "@salesforce/messageChannel/PropertyUpdated__c"; // WI-1.005 생성 (I-02)
import PLACEHOLDER from "@salesforce/resourceUrl/propertyPlaceholder";
import PROPERTY_OBJECT from "@salesforce/schema/Property__c";
import NAME from "@salesforce/schema/Property__c.Name";
import PRICE from "@salesforce/schema/Property__c.Price__c";
import STATUS from "@salesforce/schema/Property__c.Status__c";
import PICTURE_URL from "@salesforce/schema/Property__c.Picture_URL__c";
// Address__c, City__c, State__c(OQ-01 — 확정 시에만 FIELDS 에 포함), Bedrooms__c, Bathrooms__c 동일

const SHOW_STATE = false; // OQ-01/CK-11 확정 시 true + STATE 필드 추가 → detail-state 렌더
const FIELDS = [NAME, PRICE, STATUS, PICTURE_URL /* ... */];

export default class PropertyDetail extends LightningElement {
  recordId;
  isEditing = false;
  canEdit = false;
  imageFailed = false;
  @wire(MessageContext) messageContext;

  @wire(getObjectInfo, { objectApiName: PROPERTY_OBJECT })
  objectInfo({ data }) {
    this.canEdit = data?.updateable === true;
  } // 상담원 false (AC-054)

  @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
  record;

  connectedCallback() {
    this.subscription = subscribe(
      this.messageContext,
      PROPERTY_SELECTED,
      (m) => {
        this.recordId = m.recordId; // URL 변경 없음 (AC-026, 035)
        this.isEditing = false;
        this.imageFailed = false;
      }
    );
  }
  disconnectedCallback() {
    unsubscribe(this.subscription);
    this.subscription = null;
  }

  get hasSelection() {
    return !!this.recordId;
  }
  get showState() {
    return SHOW_STATE;
  }
  get name() {
    return getFieldValue(this.record.data, NAME);
  }
  get imageUrl() {
    // 빈 값·오류 → 대체 이미지 (AC-039)
    const url = getFieldValue(this.record.data, PICTURE_URL);
    return !url || this.imageFailed ? PLACEHOLDER : url;
  }
  handleImageError() {
    this.imageFailed = true;
  }

  handleEdit() {
    this.isEditing = true;
  }
  async handleSuccess() {
    // lightning-record-edit-form onsuccess
    this.isEditing = false;
    await notifyRecordUpdateAvailable([{ recordId: this.recordId }]); // 상세 갱신
    publish(this.messageContext, PROPERTY_UPDATED, { recordId: this.recordId }); // 목록 refreshApex
    this.dispatchEvent(
      new ShowToastEvent({ title: "저장되었습니다.", variant: "success" })
    );
  }
}
```

```html
<!-- lwc/propertyDetail/propertyDetail.html (발췌) -->
<template>
  <section data-testid="property-detail" class="slds-card slds-p-around_medium">
    <template lwc:if="{hasSelection}">
      <img
        data-testid="detail-image"
        src="{imageUrl}"
        alt="{name}"
        onerror="{handleImageError}"
        class="detail-image"
      />
      <h2 data-testid="detail-name" class="slds-text-heading_medium">{name}</h2>
      <dl class="slds-dl_horizontal">
        <dt>주소</dt>
        <dd data-testid="detail-address">{address}</dd>
        <dt>도시</dt>
        <dd data-testid="detail-city">{city}</dd>
        <template lwc:if="{showState}">
          <!-- OQ-01/CK-11: State__c 확정 시에만 렌더 -->
          <dt>시/도</dt>
          <dd data-testid="detail-state">{state}</dd>
        </template>
        <dt>가격</dt>
        <dd data-testid="detail-price">
          <lightning-formatted-number
            value="{price}"
            format-style="currency"
            currency-code="KRW"
            maximum-fraction-digits="0"
          ></lightning-formatted-number>
        </dd>
        <dt>침실</dt>
        <dd data-testid="detail-bedrooms">{bedrooms}</dd>
        <dt>욕실</dt>
        <dd data-testid="detail-bathrooms">{bathrooms}</dd>
      </dl>
      <span
        data-testid="detail-status-badge"
        class="{badgeClass}"
        data-status="{status}"
        >{statusLabel}</span
      >
      <template lwc:if="{canEdit}">
        <lightning-button
          data-testid="detail-edit-button"
          label="편집"
          onclick="{handleEdit}"
        ></lightning-button>
      </template>
      <template lwc:if="{isEditing}">
        <lightning-record-edit-form
          data-testid="detail-edit-form"
          object-api-name="Property__c"
          record-id="{recordId}"
          onsuccess="{handleSuccess}"
        >
          <lightning-input-field field-name="Name"></lightning-input-field>
          <lightning-input-field field-name="Price__c"></lightning-input-field>
          <lightning-input-field
            data-testid="detail-status-input"
            field-name="Status__c"
          ></lightning-input-field>
          <lightning-button
            data-testid="detail-save-button"
            type="submit"
            label="저장"
            variant="brand"
          ></lightning-button>
        </lightning-record-edit-form>
      </template>
    </template>
    <template lwc:else>
      <p data-testid="detail-empty">매물을 선택하면 상세 정보가 표시됩니다.</p>
    </template>
  </section>
</template>
```

- 라벨과 값 요소를 분리해 `detail-price` = `₩1,650,000,000` 처럼 텍스트가 **정확히** 일치하게 한다(`lightning-output-field` 는 라벨이 같이 렌더링되므로 기본안에서 제외).
- 배지 매핑·대체 이미지 로직은 타일과 같다. 중복 제거가 필요하면 공용 모듈 `c/propertyUtils`(STATUS 맵·KRW 포맷)로 분리(code_reviewer 판단).
- Status 콤보박스 셀렉터는 test_engineer 와 협의: `getByTestId('detail-status-input').getByRole('combobox')` 등.

### 4.2 LMS 채널 `PropertyUpdated__c` (I-02)

```xml
<!-- force-app/main/default/messageChannels/PropertyUpdated.messageChannel-meta.xml -->
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

발행: §4.1 `handleSuccess()` 의 `publish(this.messageContext, PROPERTY_UPDATED, { recordId })`.

### 4.3 `propertyList` 구독 → `refresh()` (WI-1.005 ENHANCE)

```js
// lwc/propertyList/propertyList.js — PropertyUpdated__c 구독 추가 (WI-1.004 의 PropertyFilter__c 구독은 유지)
import PROPERTY_UPDATED from '@salesforce/messageChannel/PropertyUpdated__c';
// ...
updatedSubscription;
connectedCallback() {
    // (WI-1.004) this.subscription = subscribe(this.messageContext, PROPERTY_FILTER, ...) 유지
    this.updatedSubscription = subscribe(this.messageContext, PROPERTY_UPDATED, () => this.refresh()); // AC-042, 043
}
disconnectedCallback() {
    unsubscribe(this.subscription);        this.subscription = null;
    unsubscribe(this.updatedSubscription); this.updatedSubscription = null;
}
// (WI-1.003) @api refresh() { return refreshApex(this.wiredResult); }  — filter 를 바꾸지 않음
```

- `refresh()` 는 현재 `filter` 를 유지한 채 `refreshApex(this.wiredResult)` 만 다시 호출 → AC-043(필터 `대전` 1건 유지)과 AC-042(`10건` 유지·`window.__noReload`)를 함께 만족.
- 상세 = `notifyRecordUpdateAvailable`, 카드·배지·건수 = `PropertyUpdated__c` → `refreshApex` (두 경로 모두 새로고침 없음).

### 4.4 Lightning 앱 · App Page · 탭

```xml
<!-- applications/DreamHouse_Lite.app-meta.xml (발췌) -->
<CustomApplication xmlns="http://soap.sforce.com/2006/04/metadata">
    <label>DreamHouse Lite</label>
    <navType>Standard</navType>
    <uiType>Lightning</uiType>
    <formFactors>Large</formFactors>
    <formFactors>Small</formFactors>
    <tabs>Property_Explorer</tabs>
    <tabs
  >Property__c</tabs>          <!-- WI-1.001 생성 탭을 내비게이션에 추가만 (I-03) -->
</CustomApplication>
```

```xml
<!-- flexipages/Property_Explorer.flexipage-meta.xml (발췌) -->
<FlexiPage xmlns="http://soap.sforce.com/2006/04/metadata">
    <masterLabel>매물 탐색</masterLabel>
    <type>AppPage</type>
    <template><name
    >flexipage:appHomeTemplateThreeColumns</name></template>   <!-- 템플릿명 확인 필요 -->
    <flexiPageRegions>
        <name>region1</name><type>Region</type>
        <itemInstances><componentInstance><componentName
        >propertyFilter</componentName></componentInstance></itemInstances>
    </flexiPageRegions>
    <flexiPageRegions>
        <name>region2</name><type>Region</type>
        <itemInstances><componentInstance><componentName
        >propertyList</componentName></componentInstance></itemInstances>
    </flexiPageRegions>
    <flexiPageRegions>
        <name>region3</name><type>Region</type>
        <itemInstances><componentInstance><componentName
        >propertyDetail</componentName></componentInstance></itemInstances>
    </flexiPageRegions>
</FlexiPage>
```

```xml
<!-- tabs/Property_Explorer.tab-meta.xml -->
<CustomTab xmlns="http://soap.sforce.com/2006/04/metadata">
    <label>매물 탐색</label>
    <flexiPage>Property_Explorer</flexiPage>
    <motif>Custom24: Building</motif>
</CustomTab>
```

```xml
<!-- lwc/propertyDetail/propertyDetail.js-meta.xml (propertyFilter·propertyList 도 같은 target) -->
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion
  >62.0</apiVersion>   <!-- sfdx-project.json sourceApiVersion 과 맞춤 -->
    <isExposed>true</isExposed>
    <targets><target>lightning__AppPage</target></targets>
</LightningComponentBundle>
```

```xml
<!-- permissionsets/DreamHouse_Agent.permissionset-meta.xml · DreamHouse_Admin 동일 — WI-1.005 ENHANCE 부분 -->
<applicationVisibilities>
    <application>DreamHouse_Lite</application>
    <visible>true</visible>
</applicationVisibilities>
<tabSettings><tab>Property_Explorer</tab><visibility>Visible</visibility></tabSettings>
<!-- Property__c tabSettings 는 WI-1.001 에서 이미 Visible — 중복 추가 금지 -->
```

### 4.5 선택 전달 방식 · 반응형 결정

| 안             | 구조                                                                                                                         | 채택                                                           |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| A. LMS (AD-01) | App Page 형제 배치, `PropertySelected__c` / `PropertyFilter__c` / `PropertyUpdated__c`                                       | **기본안** (App Builder 배치 자유, 느슨한 결합 NFR-009)        |
| B. 부모 상태   | 컨테이너 LWC `propertyExplorer`(1영역 템플릿) + `lightning-layout` `size="12" large-device-size="3/6/3"`, `@api`/CustomEvent | 3열 템플릿이 375px 에서 세로 적층되지 않으면 전환 (AC-045 (b)) |

- **확인 필요**: 3열 App Page 템플릿 이름, 375px 에서 필터가 목록 위로 쌓이고 가로 스크롤이 없는지.

### 4.6 data-testid (AC 문서 §1.6 — 이름 변경 금지)

| 컴포넌트                        | data-testid                                                                                                                                                                                                                                                                                   |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| propertyDetail (이 WI)          | `property-detail`, `detail-empty`, `detail-image`, `detail-name`, `detail-address`, `detail-city`, `detail-state`(OQ-01), `detail-price`, `detail-bedrooms`, `detail-bathrooms`, `detail-status-badge`, `detail-edit-button`, `detail-edit-form`, `detail-status-input`, `detail-save-button` |
| propertyFilter (WI-1.004, 회귀) | `filter-panel`, `filter-keyword`, `filter-min-price`, `filter-max-price`, `filter-min-bedrooms`, `filter-reset`, `filter-price-error`(CK-03 시)                                                                                                                                               |
| propertyList (WI-1.003, 회귀)   | `property-list`, `result-count`, `empty-state`, `loading-spinner`                                                                                                                                                                                                                             |
| propertyTile (WI-1.002, 회귀)   | `property-card`(+`data-id`,`data-name`), `property-card-image`, `property-card-name`, `property-card-price`, `property-card-address`, `property-card-rooms`, `property-status-badge`(+`data-status`)                                                                                          |

- 대체 이미지 정적 리소스 `propertyPlaceholder`(`src` 포함 여부로 검증). 토스트는 `getByRole('alert')`/텍스트.

### 4.7 Playwright spec 골격

```ts
// tests/e2e/WI-1.005-property-detail.spec.ts
import { test, expect } from "@playwright/test";

test.describe("WI-1.005 상세 패널 — 상담원", () => {
  test.use({ storageState: "tests/e2e/.auth/agent.json" });
  test("AC-037 미선택 초기 상태", async ({ page }) => {
    /* detail-empty 문구, detail-name 0 */
  });
  test("AC-026 카드 선택 → 상세, URL 불변", async ({ page }) => {
    /* SD-04 → '마포 한강 오피스텔' */
  });
  test("AC-035 전체 속성", async ({ page }) => {
    /* SD-07 전체 값, 이미지 너비 > 카드, 계약중 warning */
  });
  test("AC-036 패널 교체", async ({ page }) => {
    /* SD-07 → SD-02, property-detail 1개, 10건 */
  });
  test("AC-039 대체 이미지", async ({ page }) => {
    /* SD-09 propertyPlaceholder, alt, ₩350,000,000 */
  });
  test("AC-040 앱·탭·3영역", async ({ page }) => {
    /* 1440×900, x: filter < list < detail */
  });
  test("AC-054 편집 UI 없음", async ({ page }) => {
    /* edit-button/form/status-input 0 */
  });
});

test.describe("WI-1.005 상세 패널 — 관리자", () => {
  test.use({ storageState: "tests/e2e/.auth/admin.json" });
  test("AC-038 편집 진입점", async ({ page }) => {
    /* SD-02 → 편집 폼 '해운대 오션뷰' */
  });
  test("AC-041 관리자 같은 화면", async ({ page }) => {
    /* 10건, 3영역 */
  });
  test("AC-042 상태 변경 즉시 반영", async ({ page }) => {
    /* __noReload, 계약중, 10건, afterEach 복원 */
  });
  test("AC-043 판매완료 후 목록 유지", async ({ page }) => {
    /* 대전 1건 유지, Sold, 복원 */
  });
});

test.describe("WI-1.005 noaccess", () => {
  test.use({ storageState: "tests/e2e/.auth/noaccess.json" });
  test("AC-055 (UI) 앱 런처 검색 0건", async ({ page }) => {
    /* 'DreamHouse Lite' 결과 없음 */
  });
});
```

```ts
// tests/e2e/WI-1.005-layout-a11y.spec.ts
import AxeBuilder from "@axe-core/playwright";
test("AC-045 반응형 (1440 / 375)", async ({ page }) => {
  /* ... */
});
test("AC-048 라벨·키보드", async ({ page }) => {
  /* ... */
});
test("AC-068 axe (Should)", async ({ page }) => {
  const r = await new AxeBuilder({ page })
    .include('[data-testid="filter-panel"]')
    .include('[data-testid="property-list"]')
    .include('[data-testid="property-detail"]')
    .analyze();
  expect(
    r.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""))
  ).toEqual([]);
});
```

## 5. 수락 기준 (AC 매핑) — WI-1.005 자체

- [x] **AC-026** 카드 선택 시 상세 표시 — Given: "AC-024 상태(`agent`, 매물 탐색 탭, 10건), 현재 URL 기록" / When: "SD-04 `property-card` 클릭" / Then: "같은 화면의 `property-detail` 에 `detail-name` = `마포 한강 오피스텔`, 페이지 URL 변경 없음" → Playwright (ENHANCED 2026-10-29: Playwright 전체 회귀 통과 — DH-DEV, 역할 세션 agent/admin/noaccess)
- [x] **AC-035** 상세 패널 전체 속성 — Given: "`agent`, 매물 탐색 탭, URL 기록" / When: "SD-07 카드 클릭" / Then: "URL 불변, `detail-image`(카드 이미지보다 큰 너비), `detail-name` = `제주 애월 전원주택`, `detail-address` = `제주특별자치도 제주시 애월읍 애월해안로 77`, `detail-city` = `제주`, `detail-price` = `₩1,650,000,000`, `detail-bedrooms` = `5`, `detail-bathrooms` = `3`, `detail-status-badge` = `계약중`(`slds-theme_warning`). `detail-state` 는 CK-11" → Playwright (ENHANCED 2026-10-29: Playwright 전체 회귀 통과 — DH-DEV, 역할 세션 agent/admin/noaccess)
- [x] **AC-036** 패널 교체 — Given: "AC-035 상태(SD-07 표시 중)" / When: "SD-02 카드 클릭" / Then: "`property-detail` 1개, `detail-name` = `해운대 오션뷰`, `detail-price` = `₩850,000,000`, 배지 `판매중`. 필터·목록 10건 유지" → Playwright (ENHANCED 2026-10-29: Playwright 전체 회귀 통과 — DH-DEV, 역할 세션 agent/admin/noaccess)
- [x] **AC-037** 미선택 초기 상태 — Given: "`agent` 로그인" / When: "매물 탐색 탭 진입 직후(클릭 전)" / Then: "`detail-empty` = `매물을 선택하면 상세 정보가 표시됩니다.`(CK-09), `detail-name` 없음" → Playwright + Jest (ENHANCED 2026-10-29: Playwright 전체 회귀 통과 — DH-DEV, 역할 세션 agent/admin/noaccess)
- [x] **AC-038** 관리자에게만 편집 진입점 — Given: "`admin`, SD-02 상세 표시" / When: "`detail-edit-button` 클릭" / Then: "버튼 표시·활성, `detail-edit-form` 열림·매물명 입력값 `해운대 오션뷰`, 탐색 탭 URL 유지. `agent` 는 버튼 0개(→AC-054)" → Playwright(admin) (ENHANCED 2026-10-29: Playwright 전체 회귀 통과 — DH-DEV, 역할 세션 agent/admin/noaccess)
- [x] **AC-039** 상세 대체 이미지 — Given: "`agent` 로그인" / When: "SD-09 카드 클릭" / Then: "`detail-image` `src` 에 `propertyPlaceholder`, `alt` = `송도 센트럴 오피스텔`, `detail-price` = `₩350,000,000`" → Playwright (ENHANCED 2026-10-29: Playwright 전체 회귀 통과 — DH-DEV, 역할 세션 agent/admin/noaccess)
- [x] **AC-040** 앱·탭·3영역 — Given: "`agent`, 뷰포트 1440×900" / When: "앱 런처 `DreamHouse Lite` → `매물 탐색` 탭 → SD-01 클릭" / Then: "앱 이름 `DreamHouse Lite`, 탭 `매물 탐색`·`매물` 존재, `filter-panel`·`property-list`·`property-detail` 표시, x 좌표 filter-panel < property-list < property-detail" → Playwright (ENHANCED 2026-10-29: Playwright 전체 회귀 통과 — DH-DEV, 역할 세션 agent/admin/noaccess)
- [x] **AC-041** 관리자도 같은 화면 — Given: "`admin` 로그인" / When: "AC-040 과 같은 경로" / Then: "`property-card` 10개 `10건`, 3영역 표시" → Playwright(admin) (ENHANCED 2026-10-29: Playwright 전체 회귀 통과 — DH-DEV, 역할 세션 agent/admin/noaccess)
- [x] **AC-042** 상세에서 상태 변경 → 즉시 반영 — Given: "`admin`, 매물 탐색, SD-02(판매중) 상세, `window.__noReload = true`" / When: "`detail-edit-button` → `detail-status-input` `계약중` → `detail-save-button`" / Then: "2초 이내 성공 토스트, SD-02 카드 배지 `계약중`(`data-status="Under Contract"`), `detail-status-badge` = `계약중`, `result-count` = `10건`, `window.__noReload === true`. `afterEach` 복원 `Available`" → Playwright(admin) + Jest(발행/구독 → `refreshApex`) (ENHANCED 2026-10-29: Playwright 전체 회귀 통과 — DH-DEV, 역할 세션 agent/admin/noaccess)
- [x] **AC-043** 판매완료로 변경해도 목록 유지 — Given: "`admin`, `filter-keyword` = `대전` 1건(SD-06), SD-06 상세" / When: "상태 `판매완료` 저장" / Then: "카드 1개 `1건`, 배지 `판매완료`(`data-status="Sold"`), 필터값 `대전` 유지, 새로고침 없음. 복원 `Available`" → Playwright(admin) + Jest(구독 시 `filter` 유지) (ENHANCED 2026-10-29: Playwright 전체 회귀 통과 — DH-DEV, 역할 세션 agent/admin/noaccess)
- [x] **AC-045** 반응형 — Given: "`agent`, 조건 없음" / When: "(a) 1440×900, (b) 375×812 로 매물 탐색 탭" / Then: "(a) 첫 행 카드 ≥ 3, `filter-panel` 이 `property-list` 왼쪽 / (b) 행당 카드 1개, `filter-panel` 이 위쪽, `scrollWidth ≤ 375`. 둘 다 10건" → Playwright (ENHANCED 2026-10-29: Playwright 전체 회귀 통과 — DH-DEV, 역할 세션 agent/admin/noaccess)
- [x] **AC-048** 접근성 라벨·키보드 — Given: "`agent`" / When: "`getByLabel('키워드'|'최소 가격'|'최대 가격'|'최소 침실 수')`, Tab 으로 SD-01 카드 포커스 후 Enter" / Then: "4개 라벨 각 1개 요소, 카드 `aria-label` 에 매물명+가격(`강남 래미안 아파트, ₩2,500,000,000`), Enter 시 `detail-name` = `강남 래미안 아파트`" → Playwright (ENHANCED 2026-10-29: Playwright 전체 회귀 통과 — DH-DEV, 역할 세션 agent/admin/noaccess)
- [x] **AC-054** 상담원 편집 UI 없음 — Given: "`agent`, 매물 탐색 탭" / When: "SD-02 클릭 후 상세·카드 확인" / Then: "`detail-edit-button`·`detail-edit-form`·`detail-status-input` 0개, 배지는 표시 전용(상태 변경 메뉴 없음)" → Playwright(agent) + Jest (ENHANCED 2026-10-29: Playwright 전체 회귀 통과 — DH-DEV, 역할 세션 agent/admin/noaccess)
- [x] **AC-055 (UI)** 권한 세트 미할당 사용자 차단 — Given: "`noaccess`(Standard User, 권한 세트 없음)" / When: "앱 런처에서 `DreamHouse Lite` 검색" / Then: "검색 결과 0건" → Playwright(noaccess). Apex 부분은 WI-1.003 완료분 (ENHANCED 2026-10-29: Playwright 전체 회귀 통과 — DH-DEV, 역할 세션 agent/admin/noaccess)
- [ ] **AC-067** 비밀정보 미커밋 — Given: "커밋 직전 저장소" / When: "`git ls-files | grep -E "\.auth/|sfdx-url|accessToken"`, `.gitignore` 확인" / Then: "0줄, `.gitignore` 에 `tests/e2e/.auth/`" → 수동 QA
- [x] **AC-068 (Should)** 자동 접근성 검사 — Given: "`agent`, SD-01 상세가 열린 매물 탐색 탭" / When: "axe 를 `filter-panel`·`property-list`·`property-detail` 로 한정 실행" / Then: "`serious`·`critical` 0건, `alt` 누락 0건, 배지는 텍스트로도 상태 전달" → Playwright + `@axe-core/playwright`. 일정 지연 시 이 AC 만 이월 가능(PROJECT-PLAN §3.4 ⑤) (ENHANCED 2026-10-29: Playwright 실패 — axe serious `label-content-name-mismatch` x10: property-card 의 aria-label 이 화면 표시 텍스트를 포함하지 않음(AC-048 aria-label 규정과 충돌 가능). frontend/requirements 판단 대기) (ENHANCED 2026-10-29: frontend propertyTile 수정 배포 후 재실행 통과 — serious/critical 0건)

## 6. 전체 UI 회귀 — 이월 AC (PHASE-PLAN-01 §3.4)

> `npx playwright test`(태그 제외 없음)로 각 WI spec 의 `@explore` 테스트를 실행한다. 실패 시 원인 WI Feature Branch 에서 수정 → 재실행. 통과하면 PHASE-PLAN-01 §3.4 "이월 완료" 칸을 `[X]`.

| 원 WI    | AC                                                   | 회귀에서 확인할 Then (요약)                                                                               | spec                             |
| -------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------- |
| WI-1.001 | [X] AC-009                                           | 등록한 `[E2E] 성수 숲 아파트` → 매물 탐색 `성수` 검색 시 `property-card` 1개, `₩1,100,000,000`            | `WI-1.001-property-crud.spec.ts` |
| WI-1.001 | [X] AC-011                                           | 수정 후 `성수` 검색 → `property-card-price` = `₩1,050,000,000`, `property-card-rooms` = `침실 3 · 욕실 1` | 〃                               |
| WI-1.001 | [X] AC-012                                           | 삭제 후 `성수` 검색 → `empty-state`·`0건`, 조건 해제 `10건`                                               | 〃                               |
| WI-1.001 | [X] AC-060                                           | 12자리 저장 레코드 카드 `₩999,999,999,999`                                                                | 〃                               |
| WI-1.002 | [X] AC-020                                           | SD-02 카드 이름·`₩850,000,000`·주소·`침실 3 · 욕실 2`·`판매중`·alt                                        | `WI-1.002-property-tile.spec.ts` |
| WI-1.002 | [X] AC-021                                           | 배지 매핑 success/warning/회색, 판매중 6·계약중 2·판매완료 2                                              | 〃                               |
| WI-1.002 | [X] AC-022                                           | SD-09·SD-10 `propertyPlaceholder`, `naturalWidth > 0`, SD-02 대조                                         | 〃                               |
| WI-1.002 | [X] AC-023                                           | `₩2,500,000,000`·`₩350,000,000`, `억`/`만원`/`$`/`KRW` 없음                                               | 〃                               |
| WI-1.003 | [X] AC-024                                           | 진입 시 카드 10개 `10건`, `empty-state` 미표시, SD-05·08 포함                                             | `WI-1.003-property-list.spec.ts` |
| WI-1.003 | [X] AC-025                                           | `강릉` → 0개 `0건`, `조건에 맞는 매물이 없습니다.`                                                        | 〃                               |
| WI-1.003 | [X] AC-032                                           | 최소 `900000000` → 5건, Sold 배지 2·Under Contract 2, "판매완료 제외" 옵션 없음                           | 〃                               |
| WI-1.003 | [X] AC-044 (Should)                                  | `매물` 탭에서 SD-03 `판매중` 저장 → 매물 탐색 복귀 시 배지 `판매중`, 복원                                 | 〃                               |
| WI-1.003 | [X] AC-046                                           | 응답 1,500ms 지연 중 `loading-spinner`(대체 텍스트), 이후 `부산` 2개                                      | 〃                               |
| WI-1.003 | [X] AC-047                                           | 오류 모의 → 토스트 `매물 정보를 불러오지 못했습니다.`, 스피너 없음                                        | 〃                               |
| WI-1.004 | [X] AC-027                                           | `서울` → 1,300ms 내 3개 `3건`                                                                             | `WI-1.004-search-filter.spec.ts` |
| WI-1.004 | [X] AC-028                                           | 최대 `1000000000` → 6개 `6건`, SD-01 없음                                                                 | 〃                               |
| WI-1.004 | [X] AC-029                                           | (a) 5억~10억 4건 (b) 둘 다 850000000 → 1건                                                                | 〃                               |
| WI-1.004 | [X] AC-030                                           | `3개 이상` 7건, `4개 이상` 3건                                                                            | 〃                               |
| WI-1.004 | [X] AC-031                                           | `서울`→3개 이상→최대 20억: 3→2→1건, `송파 잠실 아파트` 판매완료                                           | 〃                               |
| WI-1.004 | [X] AC-033                                           | `filter-reset` → 입력 초기화, `전체`, 10건                                                                | 〃                               |
| WI-1.004 | [X] AC-034 (Should)                                  | `송파 잠실` 50ms 간격 입력 → 조회 요청 1회(최대 2회), 결과 SD-08                                          | 〃                               |
| WI-1.004 | [X] AC-059                                           | `-100` → `aria-invalid="true"`·10건 유지 / `abc` → 값 빈 문자열·10건                                      | 〃                               |
| 잠정     | [ ] AC-057 (CK-04) · AC-058 (CK-03) · AC-061 (CK-05) | CK 해소 시에만 포함 — 미해소면 `test.fixme` 유지, 완료 조건 제외                                          | 각 spec                          |

> (ENHANCED 2026-10-29: test_engineer 전체 UI 회귀 `npx playwright test` DH-DEV — 40 passed / 1 failed(AC-068 Should) / 4 skipped(@perf 2·잠정 fixme 2). WI-1.002·1.003·1.004 이월 AC 전부 통과(AC-030 combobox 재시도 보강, AC-044 통과). **WI-1.001 이월 AC-009·011·012·060 은 `tests/e2e/WI-1.001-property-crud.spec.ts` 가 저장소에 없어 미실행 — 누락 spec 작성 필요**)

> (ENHANCED 2026-10-29: test_engineer 2차 전체 회귀 — D-1(LEX 권한) 배포 후 agent 를 `Minimum Access - Salesforce` 로 복귀, `WI-1.001-property-crud.spec.ts` 신규 포함. **49 passed / 2 failed / 5 skipped** — 실패 2건은 단독 재실행 통과하는 flaky: AC-044(표준 Edit 모달 드롭다운 미열림 타임아웃), AC-034(50ms 입력 중 공백 유실 → 0건). WI-1.001 이월 AC-009·011·012·060 통과)

- 회귀 범위 외(이 WI 에서 하지 않음): AC-063/064(성능)·AC-008(SIT/UAT) → Lab 12, AC-069 → Lab 13, AC-004 조회 10건 → WI-1.003(Apex).

## 7. 테스트 요구

| 종류            | 대상                                                            | AC                                                          | 목표 / 명령                                                                      |
| --------------- | --------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Jest            | `lwc/propertyDetail/__tests__/propertyDetail.test.js`           | AC-037·054 로직, 저장 후 `PropertyUpdated__c` 발행          | `npm run test:unit` 실패 0                                                       |
| Jest            | `lwc/propertyList/__tests__/propertyList.test.js` (추가 케이스) | AC-042·043 로직 — 수신 시 `refreshApex` 호출, `filter` 유지 | 〃                                                                               |
| Playwright      | `tests/e2e/WI-1.005-property-detail.spec.ts`                    | AC-026, 035~043, 054, 055(UI)                               | 통과                                                                             |
| Playwright      | `tests/e2e/WI-1.005-layout-a11y.spec.ts`                        | AC-045, 048, 068                                            | 통과 (AC-068 Should)                                                             |
| Playwright 회귀 | WI-1.001~1.004 spec 의 `@explore`                               | §6 전체                                                     | **`npx playwright test`** (태그 제외 없음) 전체 통과 — 실패 시 완료 불가         |
| Apex            | `RunLocalTests` 재실행                                          | AC-066 (기존 테스트 무결)                                   | `sf apex run test -l RunLocalTests -o DH-DEV -c -r human` 실패 0, 커버리지 ≥ 75% |
| 수동            | 3개 사용자 스모크 / 비밀정보                                    | 앱 진입·카드 클릭·관리자 편집 / AC-067                      | 결과 기록                                                                        |

- 시나리오 = 각 AC 의 Given/When/Then. 셀렉터는 `getByTestId`(규약 이름)·`getByRole`/`getByLabel` 만, XPath·SLDS 내부 클래스 금지(배지 클래스 단언만 예외). 상태 변경 테스트는 `afterEach` 에서 원래 값 복원.

## 8. 통합 체크리스트

- [ ] 전문 에이전트 사용 확인 (frontend_developer / backend_developer / test_engineer / code_reviewer)
- [ ] 선행 WI-1.003, WI-1.004 `[X]` 확인, Feature Branch checkout
- [x] `propertyDetail`: `PropertySelected__c` 구독, `detail-empty`, 전체 속성·큰 사진·대체 이미지, testid 규약 (ENHANCED 2026-10-29: frontend_developer — `getRecord`(optionalFields) + 로딩/조회 오류 표시, `detail-state` 는 `SHOW_STATE=false`(OQ-01) 뒤에만. DH-DEV 1440px 실측: SD-07 전체 값 일치, 상세 이미지 427px > 카드 117px)
- [x] 관리자 전용 `detail-edit-button`(상담원 미노출), 편집 폼·상태 입력·저장 (ENHANCED 2026-10-29: frontend_developer — `lightning-record-edit-form`(Name·Price__c·Status__c, 취소 버튼, 저장 중 비활성, 오류 토스트). DH-DEV 스모크(시스템 관리자): SD-02 → 계약중 저장, 토스트 0.9s, 카드 `data-status=Under Contract`, `10건`, `__noReload` 유지, URL 불변 — 데이터 복원 완료)
- [x] LMS 채널 `PropertyUpdated__c` 생성, `propertyDetail` 발행(+`notifyRecordUpdateAvailable`) / `propertyList` 구독 → `refresh()` (ENHANCED 2026-10-29: frontend_developer — `propertyList` 는 `PropertySelected__c` 도 구독해 선택 하이라이트(목업 CustomEvent `propertyselect` 경로·[목업 호환] Jest 제거 — code-review M-2). AC-044(I-10): LDS `getRecords`(표시 중 레코드, optionalFields)로 레코드 캐시 변경 감지 → 카드 값과 다르면 `refresh()`(같은 스냅샷 1회, 진행 중 refresh 공유). WI-1.003 AC-044 Playwright 통과)
- [x] 앱 `DreamHouse Lite` + App Page `매물 탐색`(3영역) + `Property_Explorer` 탭, `매물` 탭은 내비게이션에 추가만 (ENHANCED 2026-10-29: frontend_developer — 템플릿 `flexipage:appHomeTemplateThreeColumns` region1/2/3. 목업 컨테이너 `propertyExplorer`(역할 토글 포함) 삭제 — post-destructive, 목업 전용 `propertyUtils.filterProperties` 제거)
- [x] 375px 반응형 확인 → 안 A 유지 / 안 B 전환 결정 기록 (ENHANCED 2026-10-29: frontend_developer — **안 A 유지**. DH-DEV 실측 375×812: filter(y260) → list(y660, 행당 카드 1) → detail(y3993) 세로 적층, 우리 컴포넌트의 가로 넘침 0. 단 `scrollWidth` 442~646 은 관리자 세션 상단의 DevOps Center 작업 항목 칩(`devops_center-create-review`) 때문 — test_engineer 확인 필요(agent 세션은 미표시 예상). 1440: x 16 < 489 < 963, 첫 행 카드 3. 균등 3열이라 카드 가격 글꼴 0.875rem + 줄바꿈 허용(잘림 방지))
- [x] 권한 세트 `applicationVisibilities` + `tabSettings(Property_Explorer)` ENHANCE, `noaccess` 앱 미노출 (ENHANCED 2026-10-29: backend_developer — Agent/Admin 배포 0Afgw000000cBgnCAE, 목업 권한 세트 `DreamHouse_Mockup` 삭제 0Afgw000000cBnFCAU. `noaccess` UI 확인은 AC-055 Playwright) (ENHANCED 2026-10-29: 회귀 D-1 — 두 권한 세트에 userPermissions `LightningExperienceUser` 추가(Minimum Access 사용자 Classic 진입 방지), 배포 0Afgw000000c5rWCAQ)
- [ ] `sf project deploy start --dry-run -o DH-DEV` 성공 → `sf project deploy start -o DH-DEV`
- [x] Jest `npm run test:unit` 통과 (ENHANCED 2026-10-29: frontend_developer — 4 suites / 76 tests 통과, ESLint 0)
- [x] Apex `RunLocalTests` 실패 0, 커버리지 ≥ 75% (ENHANCED 2026-10-29: 47/47 Pass, Org Wide 100% — WI-1.004 리뷰 L-1 LIKE 와일드카드 이스케이프 포함)
- [ ] 정적 분석: `sf code-analyzer run --workspace . --view table` — High 이상 0건
- [ ] Playwright `WI-1.005-property-detail.spec.ts`, `WI-1.005-layout-a11y.spec.ts` 통과
- [ ] **전체 UI 회귀 `npx playwright test` 전체 통과** (§6), PHASE-PLAN-01 §3.4 이월 완료 칸 `[X]` (실패 시 완료 불가)
- [ ] AC-067 비밀정보 0줄 확인
- [ ] CI(선택·미도입) — GitHub Actions 미구성, 해당 없음
- [ ] PROJECT-PLAN §5 / PHASE-PLAN-01 §1.2·§8.7 / 이 문서의 체크리스트·Status `[X]`
- [ ] 커밋 `WI-1.005-property-detail-app-page` (본문에 회귀 결과·반응형 결정 요약)

## 9. 이슈 / 확인 필요

| #   | 내용                                                                                                                                                                                                                                          | 처리                                                                                                                                           |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| W-1 | LMS 채널 소유 — `PropertySelected__c` = WI-1.002, `PropertyFilter__c` = WI-1.004(필드 `keyword`/`minPrice`/`maxPrice`/`minBedrooms` = `PropertyFilter` Apex 속성명), `PropertyUpdated__c` = WI-1.005. 이 WI 는 앞의 두 채널을 수정하지 않는다 | 확정                                                                                                                                           |
| W-2 | 상세 조회 방식 — PROJECT-PLAN §5.2 체크리스트는 `lightning-record-view-form`, PHASE-PLAN-01 §8.2/§8.3.1 은 `getRecord`(LDS). testid 정확 일치 때문에 이 문서는 `getRecord` 채택                                                               | PROJECT-PLAN 문구 ENHANCE 검토                                                                                                                 |
| W-3 | 3열 App Page 템플릿 이름·375px 적층 여부                                                                                                                                                                                                      | §4.5 — 배포 후 확인, 안 B 전환 시 기록 (ENHANCED 2026-10-29: 해소 — `flexipage:appHomeTemplateThreeColumns`, 375px 세로 적층 확인 → 안 A 유지) |

## 10. 참고 자료

- `docs/PROJECT-PLAN.md` v1.1 — §3.3 일정, §3.4 용량 대응 ⑤, §5 WI 목록·§5.2 체크리스트, §7 추적성(§7.2 회귀 목록), §8 R-09
- `docs/phases/PHASE-PLAN-01.md` v1.1 — §3.3 탭 의존 원칙, §3.4 이월 표, §3.6 testid 규약, §3.7 소스 배치, §8 WI-1.005, §12 I-01/I-02/I-03/I-11
- `docs/phase-0/ACCEPTANCE-CRITERIA.md` — §1.3 공통 전제, §1.4 SD 표, §1.6 testid, AC-020~048, 054, 055, 057~061, 067, 068
- `docs/REQUIREMENT.md` v1.1 — REQ-009, REQ-010, REQ-011, REQ-012
- `docs/phase-0/FIT-GAP-NUD.md` v1.1 — AD-01(LMS), D-12, OQ-10/OQ-11
- `docs/work-items/WI-1.001-property-data-model.md` ~ `WI-1.004` — 선행 산출물·이월 AC spec
- `CLAUDE.md` — 진행 규칙·코드 규칙
- Salesforce: LWC `lightning/messageService`, `lightning/uiRecordApi`(`getRecord`, `notifyRecordUpdateAvailable`), `lightning-record-edit-form`, Metadata API `LightningMessageChannel`/`CustomApplication`/`FlexiPage`/`CustomTab`/`PermissionSet`, `@axe-core/playwright`
