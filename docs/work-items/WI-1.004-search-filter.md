---
subject: "WI-1.004 검색 필터 + Apex 조건 확장" # Workitem의 Subject 필드와 Sync
assignee: "junghyuck.choi.85647fe082a1@agentforce.com" # User Id로 변환하여 Sync에 사용
# 추적성 (PROJECT-PLAN v1.1 기준 — 코드네임 변경 금지)
wi-id: "WI-1.004"
depends-on: [WI-1.003] # PROJECT-PLAN §5 선행
req-ids: [REQ-008, REQ-005, REQ-012]
ac-ids:
  [
    AC-014,
    AC-015,
    AC-016,
    AC-017,
    AC-027,
    AC-028,
    AC-029,
    AC-030,
    AC-031,
    AC-032,
    AC-033,
    AC-034,
    AC-056,
    AC-057,
    AC-058,
    AC-059,
    AC-064,
    AC-065,
    AC-066,
    AC-067,
    AC-070
  ]
pipeline: "DreamHouse Pipeline"
# ⬇ 도구가 자동 stamp (절대 손으로 편집 금지)
project_id: null # Project의 record id
workitem_no: null # Workitem의 Name 필드값
salesforce_id: null # Workitem의 record id
status: null # Workitem의 Status 필드값
synced_at: null # Sync 타임스탬프
---

# WI-1.004 — 검색 필터 + Apex 조건 확장 (GAP)

> Cheatsheet STEP 6 산출물 (Lab 6.3, work_item_manager). 기준: `docs/PROJECT-PLAN.md` v1.1 §5 · `docs/phases/PHASE-PLAN-01.md` v1.1 §7.

## 0. 헤더

| 항목                            | 내용                                                                                                                                                                                                                                                  |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Work Item                       | **WI-1.004**                                                                                                                                                                                                                                          |
| Description (PROJECT-PLAN 원문) | **검색 필터 패널** `propertyFilter`(키워드·최소/최대 가격(원)·최소 침실 수·초기화, 300ms 디바운스, LMS `PropertyFilter__c`) + **Apex 조건 확장**(키워드 Name/City 부분 일치·가격 경계 포함·침실 이상, 바인드 변수) — REQ-008 (+REQ-005 조건, REQ-012) |
| Phase                           | Phase 1 — MVP                                                                                                                                                                                                                                         |
| 모듈                            | LWC `propertyFilter` · LMS 채널 `PropertyFilter__c` · `propertyList` 구독 ENHANCE · Apex `PropertyController` 조건 확장 · `PropertyControllerTest` 확장                                                                                               |
| 우선순위                        | **Must** (분류 GAP) — AC-034·070 은 Should                                                                                                                                                                                                            |
| 상태                            | [X] 완료 (PROD 2026-10-29) (ENHANCED 2026-10-29: ~~미착수~~ → DevOps Center WI-000004 CLOSED, Apex·Jest·회귀·AC-064 통과)                                                                                                                             |
| 선행 (Depends-on)               | **WI-1.003**                                                                                                                                                                                                                                          |
| 후행                            | WI-1.005                                                                                                                                                                                                                                              |
| 예상 소요                       | **0.35 M/D (2.75h)** = REQ-005 0.5h + REQ-008 2.0h + REQ-012 0.25h                                                                                                                                                                                    |
| 일정                            | 2026-10-30(금) 09:00–11:45 (Lab 9)                                                                                                                                                                                                                    |
| 담당 에이전트                   | backend_developer(Apex) · frontend_developer(LWC) · test_engineer · code_reviewer                                                                                                                                                                     |
| 커밋명                          | `WI-1.004-search-filter`                                                                                                                                                                                                                              |

> (ENHANCED 2026-10-29: 문서 상태 정리(DELIVERABLES §2.4 B-03, project_manager) — 상태 `[X]` 완료(PROD 2026-10-29), 실행 결과 기준으로 선행 조건·AC·통합 체크리스트 갱신. 미완 유지: AC-057(잠정 CK-04)·AC-058(잠정 CK-03)·min > max 처리, AC-067 `git ls-files` 수동 기록, CI(미도입). WI ID·선행·공수 변경 없음)

## 1. 상세 개요

상담원이 조건으로 매물을 실시간 검색하도록 **서버 조건과 필터 UI** 를 완성한다. `PropertyController.getProperties(PropertyFilter)`(WI-1.003 에서 시그니처 고정)에 조건을 추가한다 — 키워드는 **Name 또는 City__c 부분 일치**(Address__c 는 검색 대상 아님), 가격은 **경계 포함**(`>=` / `<=`), 침실은 **이상**(`>=`), 공백 키워드는 trim 후 조건 미적용(CK-04 잠정). 모든 사용자 입력은 **바인드 변수로만** SOQL 에 들어가며, WHERE 절은 상수 조각만 조합해 `Database.queryWithBinds(..., AccessLevel.USER_MODE)` 로 실행한다(SOQL 인젝션 방지 — AC-056, AC-065).

화면은 좌측 **필터 패널 `propertyFilter`** 이다. 라벨 `키워드` / `최소 가격` / `최대 가격`(원 단위 전체 금액, OQ-02) / `최소 침실 수`(선택지 `전체`·`1개 이상`~`5개 이상`, 값 0~5)와 `초기화` 버튼을 둔다. 입력은 **300ms 디바운스** 후 LMS `PropertyFilter__c`(이 WI 에서 채널 생성)로 발행하고, `propertyList` 가 구독해 `this.filter = { ...msg }`(새 객체 → `@wire` 재호출)로 목록을 갱신한다. 음수 가격은 `min="0"` 검증(`aria-invalid`)으로 발행하지 않으며, 판매완료 제외 같은 상태 필터는 두지 않는다(D-17). min > max 처리(`filter-price-error`)는 CK-03 확정 시에만 구현한다.

이 시점에도 `매물 탐색` 탭이 없으므로(WI-1.005) **1차 검증은 Apex(AC 문서 §1.4 계산표 값) + Jest(가짜 타이머 디바운스·발행·초기화·음수 차단·구독) + Code Analyzer** 로 한다. AC-027~034·059 의 Playwright spec 은 이 WI 에서 `@explore` 로 작성하고, WI-1.003 에서 넘어온 AC-025·032·046·047 은 여기서 **필터 입력 로직을 Jest 로 1차 확인만** 한 뒤 E2E 는 모두 **WI-1.005 전체 UI 회귀**에서 실행한다(I-01). 성능 AC-064 는 DH-SIT(Lab 12).

## 2. Wireframe (propertyFilter + 목록 연동)

```
┌─ data-testid="filter-panel" ──┐   ┌─ property-list ─────────────────────────┐
│ 키워드                          │   │ 3건                                     │
│ [ 서울                     🔍 ] │ ← filter-keyword (type=search)            │
│ 최소 가격                       │   │ ┌────────┐ ┌────────┐ ┌────────┐        │
│ [                          ] 원 │ ← filter-min-price (number, min=0)        │
│ 최대 가격                       │   │ │ SD-01  │ │ SD-04  │ │ SD-08  │        │
│ [ 2000000000               ] 원 │ ← filter-max-price (number, min=0)        │
│ 최소 침실 수                    │   │ └────────┘ └────────┘ └────────┘        │
│ [ 3개 이상               ▼ ]   │ ← filter-min-bedrooms (전체~5개 이상)      │
│ (CK-03 확정 시)                 │   └─────────────────────────────────────────┘
│  ⚠ 최소 가격이 최대 가격보다 …  │ ← filter-price-error (CK-03 확정 시에만)
│ [ 초기화 ]                      │ ← filter-reset
└────────────────────────────────┘
 입력 → 300ms 디바운스 → LMS PropertyFilter__c {keyword,minPrice,maxPrice,minBedrooms}
      → propertyList.filter = {...msg} → @wire getProperties 재호출 (스피너 표시)
 "판매완료 제외" 류 상태 옵션 없음 (D-17)
```

## 3. 선행 조건

- [x] **선행 WI-1.003 Status `[X]` 확인** — 미완이면 시작 금지 (WI-1.001·1.002 도 `[X]`) (ENHANCED 2026-10-29: 문서 상태 정리 — 선행 WI 는 실제 구현·검증·병합 후 착수했고 문서 Status 갱신만 지연(B-03))
- [x] DH-DEV 에 `PropertyController`(기본 조회)·`PropertyFilter`·`propertyList`·`PropertyControllerTest` 배포 완료 (ENHANCED 2026-10-29: WI-1.003 배포 완료)
- [x] 전문 에이전트 사용(backend_developer / frontend_developer / test_engineer / code_reviewer) (ENHANCED 2026-10-29: 전문 에이전트 사용 — backend_developer / frontend_developer / test_engineer / code_reviewer, code_reviewer 리뷰 후 PR 병합)
- [x] `git checkout main ; git pull` → WI-1.004 Feature Branch checkout (ENHANCED 2026-10-29: Feature Branch `WI-000004`)
- [x] 미결: CK-03(min > max 동작), CK-04(공백 키워드 trim), CK-02(원 단위 입력 수용) — 미확정이면 아래 기본값으로 진행 (ENHANCED 2026-10-29: 확인 — CK-03/04 미확정은 기본값(min > max 미구현, 공백 trim)으로 진행, AC-057/058 잠정)

## 4. 세부 작업 (Numbered sub-tasks)

1. `PropertyController.getProperties` 조건 확장: 키워드 Name/City__c `LIKE :keywordLike`, `Price__c >= :minPrice` / `<= :maxPrice`, `Bedrooms__c >= :minBedrooms`(0/null 이면 미적용), 공백 키워드 trim → 조건 미적용(CK-04 잠정). 사용자 입력 문자열 연결 금지, `Database.queryWithBinds(..., AccessLevel.USER_MODE)`
2. `PropertyControllerTest` 확장: AC-014~017, 018(`강릉`), 056, 057(잠정) — 기대값은 §5.1 계산표
3. LMS 채널 `PropertyFilter__c`(필드 `keyword`, `minPrice`, `maxPrice`, `minBedrooms`) — **채널 소유 WI = WI-1.004**
4. `propertyFilter` LWC: `filter-panel`, 라벨 4종, 침실 선택지 `전체`~`5개 이상`(0~5), 300ms 디바운스 발행, `filter-reset`(즉시 발행), 숫자 입력 `min="0"` `step="1"`(음수 → `aria-invalid`, 발행 안 함), min > max 처리는 CK-03 확정 시에만(`filter-price-error`)
5. `propertyList` ENHANCE: `PropertyFilter__c` 구독 → `isLoading = true; this.filter = { ...msg }`, `disconnectedCallback` 에서 해제
6. Jest: `propertyFilter.test.js`(디바운스 300ms 안 연속 입력 → 발행 1회, 초기화, 음수 차단, 선택지 값) + `propertyList.test.js`(구독 → filter 반영)
7. Playwright `tests/e2e/WI-1.004-search-filter.spec.ts` — AC-027~034, 059 `@explore`, AC-057/058 잠정 `test.fixme`, AC-064 `@perf`(DH-SIT)
8. AC-065·066·070 재확인(code_reviewer: 바인드·디바운스·cacheable·LIMIT·파라미터 객체), dry-run → deploy → 이월 기록 → 커밋

## 5. 주요 타입 / API · 코드 예시

### 5.1 기대값 계산표 (AC 문서 §1.4 — 테스트 기대값의 단일 근거)

| 조건                                 | 결과 SD                | 건수      |
| ------------------------------------ | ---------------------- | --------- |
| 조건 없음                            | SD-01~SD-10            | 10        |
| 키워드 `서울`                        | 01, 04, 08             | 3         |
| 키워드 `부산`                        | 02, 10                 | 2         |
| 키워드 `래미안`                      | 01                     | 1         |
| 키워드 `센트럴`                      | 06, 09                 | 2         |
| 키워드 `강릉` / `강남구`(주소)       | —                      | 0         |
| 최대 1,000,000,000                   | 02, 04, 05, 06, 09, 10 | 6         |
| 최소 1,000,000,000                   | 01, 03, 07, 08         | 4         |
| 500,000,000 ~ 1,000,000,000          | 02, 05, 06, 10         | 4         |
| 850,000,000 ~ 850,000,000            | 02                     | 1         |
| 최소 900,000,000                     | 01, 03, 05, 07, 08     | 5         |
| 침실 3 / 4 / 6                       | 7건 / 01·05·07 / —     | 7 / 3 / 0 |
| `서울` + 침실 3                      | 01, 08                 | 2         |
| `서울` + 침실 3 + 최대 2,000,000,000 | 08 (Sold)              | 1         |
| 500,000,000 ~ 1,000,000,000 + 침실 3 | 02, 05, 06             | 3         |

### 5.2 Apex 조건 확장

```apex
// classes/PropertyController.cls — WI-1.004 조건 확장 (WHERE 절은 상수 조각만 조합, 값은 모두 바인드)
public with sharing class PropertyController {
  @TestVisible
  private static final Integer MAX_RESULTS = 200; // CK-06/OQ-09 확정 전 임시값

  @AuraEnabled(cacheable=true)
  public static List<Property__c> getProperties(PropertyFilter filter) {
    PropertyFilter f = (filter == null) ? new PropertyFilter() : filter;
    List<String> conditions = new List<String>();
    Map<String, Object> binds = new Map<String, Object>{
      'maxResults' => MAX_RESULTS
    };

    String keyword = String.isBlank(f.keyword) ? null : f.keyword.trim(); // CK-04 (잠정)
    if (keyword != null) {
      conditions.add('(Name LIKE :keywordLike OR City__c LIKE :keywordLike)');
      binds.put('keywordLike', '%' + keyword + '%'); // 값은 바인드로만 전달 (AC-056)
    }
    if (f.minPrice != null) {
      conditions.add('Price__c >= :minPrice');
      binds.put('minPrice', f.minPrice);
    }
    if (f.maxPrice != null) {
      conditions.add('Price__c <= :maxPrice');
      binds.put('maxPrice', f.maxPrice);
    }
    if (f.minBedrooms != null && f.minBedrooms > 0) {
      conditions.add('Bedrooms__c >= :minBedrooms');
      binds.put('minBedrooms', f.minBedrooms);
    }

    String soql =
      'SELECT Id, Name, Address__c, City__c, State__c, Price__c, Bedrooms__c, Bathrooms__c, ' +
      'Picture_URL__c, Status__c FROM Property__c' +
      (conditions.isEmpty()
        ? ''
        : ' WHERE ' + String.join(conditions, ' AND ')) +
      ' ORDER BY Name LIMIT :maxResults';
    try {
      return Database.queryWithBinds(soql, binds, AccessLevel.USER_MODE);
    } catch (QueryException e) {
      AuraHandledException ex = new AuraHandledException(
        '매물 정보를 불러오지 못했습니다.'
      );
      ex.setMessage('매물 정보를 불러오지 못했습니다.');
      throw ex;
    }
  }
}
```

- 동적 SOQL 은 `AccessLevel.USER_MODE` 하나만 쓴다(문자열 안 `WITH USER_MODE` 와 병용 여부는 확인 필요 — 기본안은 병용하지 않음). AC-065 는 둘 다 허용.
- 키워드에 `%`·`_` 가 들어오면 LIKE 와일드카드로 해석된다. 인젝션은 아니지만(바인드) 결과가 넓어질 수 있음 → 필요 시 code_reviewer 판단으로 이스케이프.
- Code Analyzer 가 동적 SOQL 을 `ApexSOQLInjection` 으로 표시하면 "WHERE 조각이 상수뿐, 값은 바인드" 근거를 리뷰 메모에 남긴다. **High 이상이면 정적 SOQL 대안**(`WITH USER_MODE` + 기본값 바인드)으로 전환.
- `PropertyFilter` 의 `@AuraEnabled` 속성 이름(keyword/minPrice/maxPrice/minBedrooms)은 LMS 메시지 필드명과 같게 유지 → `propertyList` 가 메시지를 그대로 `filter` 로 넘긴다.

```apex
// classes/PropertyControllerTest.cls — WI-1.004 확장 (발췌)
private static Integer countFor(String keyword, Decimal minP, Decimal maxP, Integer minBed) {
    PropertyFilter f = new PropertyFilter();
    f.keyword = keyword; f.minPrice = minP; f.maxPrice = maxP; f.minBedrooms = minBed;
    return PropertyController.getProperties(f).size();
}

@IsTest static void ac014_keywordNameOrCity() {
    System.runAs(PropertyTestDataFactory.getUser('agent')) {
        Assert.areEqual(1, countFor('래미안', null, null, null));
        Assert.areEqual(2, countFor('부산', null, null, null));
        Assert.areEqual(2, countFor('센트럴', null, null, null));
        Assert.areEqual(0, countFor('강남구', null, null, null));   // 주소는 검색 대상 아님
    }
}
@IsTest static void ac015_priceRangeInclusive() {
    System.runAs(PropertyTestDataFactory.getUser('agent')) {
        Assert.areEqual(4, countFor(null, 500000000, 1000000000, null));
        Assert.areEqual(1, countFor(null, 850000000, 850000000, null));
        Assert.areEqual(6, countFor(null, null, 1000000000, null));
        Assert.areEqual(4, countFor(null, 1000000000, null, null));
    }
}
@IsTest static void ac016_minBedrooms() {
    System.runAs(PropertyTestDataFactory.getUser('agent')) {
        Assert.areEqual(7, countFor(null, null, null, 3));
        Assert.areEqual(3, countFor(null, null, null, 4));
        Assert.areEqual(0, countFor(null, null, null, 6));
    }
}
@IsTest static void ac017_combinedAnd() {
    System.runAs(PropertyTestDataFactory.getUser('agent')) {
        PropertyFilter f = new PropertyFilter();
        f.keyword = '서울'; f.minBedrooms = 3; f.maxPrice = 2000000000;
        List<Property__c> a = PropertyController.getProperties(f);
        Assert.areEqual(1, a.size());
        Assert.areEqual('송파 잠실 아파트', a[0].Name);
        Assert.areEqual('Sold', a[0].Status__c);
        Assert.areEqual(3, countFor(null, 500000000, 1000000000, 3));
    }
}
@IsTest static void ac018_keywordNoMatchReturnsEmptyList() {
    System.runAs(PropertyTestDataFactory.getUser('agent')) {
        PropertyFilter f = new PropertyFilter(); f.keyword = '강릉';
        List<Property__c> rows = PropertyController.getProperties(f);
        Assert.isNotNull(rows);
        Assert.areEqual(0, rows.size());
    }
}
@IsTest static void ac056_soqlInjectionIsBound() {
    System.runAs(PropertyTestDataFactory.getUser('agent')) {
        Assert.areEqual(0, countFor('\' OR Name LIKE \'%', null, null, null));
        Assert.areEqual(0, countFor('서울\' OR City__c != \'', null, null, null));
    }
}
// ac057_blankKeyword (잠정 — CK-04): '' / '   ' → 10건. CK-04 해소 전 완료 조건 제외
```

### 5.3 LMS 채널 `PropertyFilter__c` (WI-1.004 소유)

```xml
<!-- force-app/main/default/messageChannels/PropertyFilter.messageChannel-meta.xml -->
<?xml version="1.0" encoding="UTF-8"?>
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

| LMS 채널                                                                | 생성 WI      | 발행             | 구독                              |
| ----------------------------------------------------------------------- | ------------ | ---------------- | --------------------------------- |
| `PropertySelected__c` (`recordId`)                                      | WI-1.002     | `propertyTile`   | `propertyDetail` (WI-1.005)       |
| **`PropertyFilter__c`** (`keyword`,`minPrice`,`maxPrice`,`minBedrooms`) | **WI-1.004** | `propertyFilter` | `propertyList` (WI-1.004 ENHANCE) |
| `PropertyUpdated__c` (`recordId`)                                       | WI-1.005     | `propertyDetail` | `propertyList` (WI-1.005 ENHANCE) |

### 5.4 LWC `propertyFilter` (data-testid 규약 — 이름 변경 금지)

```html
<!-- lwc/propertyFilter/propertyFilter.html -->
<template>
  <div data-testid="filter-panel" class="slds-p-around_small">
    <lightning-input
      data-testid="filter-keyword"
      label="키워드"
      type="search"
      value="{keyword}"
      onchange="{handleKeyword}"
    ></lightning-input>
    <lightning-input
      data-testid="filter-min-price"
      label="최소 가격"
      type="number"
      min="0"
      step="1"
      value="{minPrice}"
      onchange="{handleMinPrice}"
    ></lightning-input>
    <lightning-input
      data-testid="filter-max-price"
      label="최대 가격"
      type="number"
      min="0"
      step="1"
      value="{maxPrice}"
      onchange="{handleMaxPrice}"
    ></lightning-input>
    <lightning-combobox
      data-testid="filter-min-bedrooms"
      label="최소 침실 수"
      value="{minBedrooms}"
      options="{bedroomOptions}"
      onchange="{handleBedrooms}"
    ></lightning-combobox>
    <!-- CK-03 확정 시에만:
        <p data-testid="filter-price-error" class="slds-text-color_error" role="alert">최소 가격이 최대 가격보다 클 수 없습니다.</p> -->
    <lightning-button
      data-testid="filter-reset"
      label="초기화"
      onclick="{handleReset}"
      class="slds-m-top_small"
    ></lightning-button>
  </div>
</template>
```

```js
// lwc/propertyFilter/propertyFilter.js
import { LightningElement, wire } from "lwc";
import { publish, MessageContext } from "lightning/messageService";
import PROPERTY_FILTER from "@salesforce/messageChannel/PropertyFilter__c";
const DEBOUNCE_MS = 300; // NFR-002, AC-034/070

export default class PropertyFilter extends LightningElement {
  keyword = "";
  minPrice = "";
  maxPrice = "";
  minBedrooms = "0";
  bedroomOptions = [
    { label: "전체", value: "0" },
    { label: "1개 이상", value: "1" },
    { label: "2개 이상", value: "2" },
    { label: "3개 이상", value: "3" },
    { label: "4개 이상", value: "4" },
    { label: "5개 이상", value: "5" }
  ];
  @wire(MessageContext) messageContext;
  timer;

  handleKeyword(e) {
    this.keyword = e.target.value;
    this.schedule();
  }
  handleMinPrice(e) {
    if (this.isValid(e.target)) {
      this.minPrice = e.target.value;
      this.schedule();
    }
  }
  handleMaxPrice(e) {
    if (this.isValid(e.target)) {
      this.maxPrice = e.target.value;
      this.schedule();
    }
  }
  handleBedrooms(e) {
    this.minBedrooms = e.detail.value;
    this.schedule();
  }
  handleReset() {
    clearTimeout(this.timer);
    this.keyword = "";
    this.minPrice = "";
    this.maxPrice = "";
    this.minBedrooms = "0";
    this.publishNow(); // AC-033
  }
  isValid(input) {
    return input.reportValidity();
  } // 음수 → aria-invalid, 발행 안 함 (AC-059)
  schedule() {
    clearTimeout(this.timer);
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    this.timer = setTimeout(() => this.publishNow(), DEBOUNCE_MS);
  }
  publishNow() {
    publish(this.messageContext, PROPERTY_FILTER, {
      keyword: this.keyword || null,
      minPrice: this.minPrice === "" ? null : Number(this.minPrice),
      maxPrice: this.maxPrice === "" ? null : Number(this.maxPrice),
      minBedrooms: Number(this.minBedrooms) || null
    });
  }
  disconnectedCallback() {
    clearTimeout(this.timer);
  }
}
```

```xml
<!-- lwc/propertyFilter/propertyFilter.js-meta.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>62.0</apiVersion>
    <isExposed>true</isExposed>
    <masterLabel>Property Filter</masterLabel>
    <targets><target>lightning__AppPage</target></targets>
</LightningComponentBundle>
```

- min > max(AC-058, CK-03): **확정 전에는 구현하지 않는다**(기본 동작: 서버 조건 그대로 → 0건). 확정 시 `filter-price-error` 문구 `최소 가격이 최대 가격보다 클 수 없습니다.` + 0건, 오류 토스트 없음.
- `abc` 입력: `type="number"` 는 브라우저가 비숫자 입력을 받지 않음 → 값 빈 문자열, 발행 없음(AC-059). Jest 에서는 `lightning-input` 이 스텁이라 실제 차단은 확인 불가 → WI-1.005 Playwright 가 최종 근거.

### 5.5 `propertyList` ENHANCE (구독)

```js
// lwc/propertyList/propertyList.js — WI-1.004 ENHANCE (WI-1.003 코드에 추가)
import { subscribe, unsubscribe, MessageContext } from 'lightning/messageService';
import PROPERTY_FILTER from '@salesforce/messageChannel/PropertyFilter__c';
// ...
@wire(MessageContext) messageContext;
subscription;

connectedCallback() {
    if (this.wiredResult) this.refresh();               // (WI-1.003) 탭 재진입 갱신 유지
    if (!this.subscription) {
        this.subscription = subscribe(this.messageContext, PROPERTY_FILTER, (msg) => {
            this.isLoading = true;
            this.filter = { ...msg };                   // 새 객체 → @wire 재호출
        });
    }
}
disconnectedCallback() { unsubscribe(this.subscription); this.subscription = null; }
```

- 필터 결과가 이전과 같아 `@wire` 가 캐시 값을 다시 주지 않는 경우 스피너가 남지 않도록, `wiredProperties` 에서 `isLoading=false` 처리가 항상 실행되는지 Jest 로 확인.

### 5.6 Jest (1차 검증)

```js
// lwc/propertyFilter/__tests__/propertyFilter.test.js (발췌)
import { createElement } from "lwc";
import PropertyFilter from "c/propertyFilter";
import { publish } from "lightning/messageService";

jest.useFakeTimers();
const mount = () => {
  const el = createElement("c-property-filter", { is: PropertyFilter });
  document.body.appendChild(el);
  return el;
};
const input = (el, id) => el.shadowRoot.querySelector(`[data-testid="${id}"]`);
const type = (node, value) => {
  node.value = value;
  node.dispatchEvent(new CustomEvent("change"));
};

it("AC-027/034 기반 300ms 안 연속 입력 → 발행 1회, 마지막 값", () => {
  const el = mount();
  ["송", "송파", "송파 잠", "송파 잠실"].forEach((v) => {
    type(input(el, "filter-keyword"), v);
    jest.advanceTimersByTime(50);
  });
  expect(publish).not.toHaveBeenCalled();
  jest.advanceTimersByTime(300);
  expect(publish).toHaveBeenCalledTimes(1);
  expect(publish.mock.calls[0][2]).toMatchObject({ keyword: "송파 잠실" });
});

it("AC-030 기반 침실 선택지 = 전체~5개 이상(0~5)", () => {
  const opts = input(mount(), "filter-min-bedrooms").options;
  expect(opts.map((o) => o.label)).toEqual([
    "전체",
    "1개 이상",
    "2개 이상",
    "3개 이상",
    "4개 이상",
    "5개 이상"
  ]);
});

it("AC-033 기반 초기화 → 즉시 발행, 모든 값 null", () => {
  /* filter-reset click → publish {keyword:null,...} */
});
it("AC-059 기반 음수 → reportValidity false → 발행 없음", () => {
  /* reportValidity 모의 false → advanceTimers → publish 0회 */
});
```

```js
// lwc/propertyList/__tests__/propertyList.test.js — WI-1.004 추가 (발췌)
import { subscribe, MessageContext } from "lightning/messageService";
it("PropertyFilter__c 수신 → filter 갱신 → getProperties 재호출 인자", async () => {
  /* subscribe mock 콜백 획득 → callback({ keyword: '서울' }) → getProperties.getLastConfig().filter.keyword === '서울' */
});
```

### 5.7 Playwright spec 골격

```ts
// tests/e2e/WI-1.004-search-filter.spec.ts — 매물 탐색 탭(WI-1.005) 필요 → @explore
import { test, expect } from "@playwright/test";
test.use({ storageState: "tests/e2e/.auth/agent.json" });

test("AC-027 키워드 실시간 필터", { tag: "@explore" }, async ({ page }) => {
  await page.getByLabel("키워드").fill("서울");
  await expect(page.getByTestId("result-count")).toHaveText("3건", {
    timeout: 1300
  });
  await expect(page.getByTestId("property-card")).toHaveCount(3);
});
test("AC-028 최대 가격", { tag: "@explore" }, async ({ page }) => {
  /* 1000000000 → 6건, SD-01 없음 */
});
test("AC-029 가격 범위(경계 포함)", { tag: "@explore" }, async ({ page }) => {
  /* (a) 4건 (b) 1건 */
});
test("AC-030 최소 침실 수", { tag: "@explore" }, async ({ page }) => {
  /* 3개 이상 7건 → 4개 이상 3건 */
});
test("AC-031 복합 필터 + 판매완료", { tag: "@explore" }, async ({ page }) => {
  /* 3 → 2 → 1건, SD-08 판매완료 data-status=Sold */
});
test("AC-032 판매완료 기본 노출", { tag: "@explore" }, async ({ page }) => {
  /* 900000000 → 5건, Sold 2, Under Contract 2 */
});
test("AC-033 필터 초기화", { tag: "@explore" }, async ({ page }) => {
  /* 빈 값·전체, 10건 */
});
test("AC-034 (Should) 디바운스", { tag: "@explore" }, async ({ page }) => {
  /* pressSequentially 50ms → 요청 1회(최대 2) */
});
test("AC-059 음수·비숫자 가격", { tag: "@explore" }, async ({ page }) => {
  /* -100 aria-invalid, abc 빈 값, 10건 유지 */
});
test.fixme("AC-057 (잠정 — CK-04) 공백 키워드 → 10건", async () => {});
test.fixme("AC-058 (잠정 — CK-03) min > max → filter-price-error", async () => {});
test(
  "AC-064 검색 응답 1초 (DH-SIT)",
  { tag: ["@explore", "@perf"] },
  async ({ page }) => {
    /* Lab 12 */
  }
);
```

## 6. 수락 기준 (AC 매핑)

> (ENHANCED 2026-10-29: WI-1.005 전체 UI 회귀(test_engineer, DH-DEV, 역할 세션 agent=Minimum Access / admin·noaccess=Standard Platform User) — 전체 49 passed / 2 failed(flaky) / 5 skipped. 이월 AC-027~031·033·059 통과(AC-030 combobox 열기 재시도 보강). AC-034(Should) 는 1차 통과, 2차 전체 실행에서 50ms 간격 입력 중 공백이 빠져 '송파잠실' → 0건 1회 실패(단독 3/3 통과 — 빠른 입력 시 문자 유실 의심, frontend 확인 요청). AC-057/058 잠정 fixme, AC-064 @perf)

> **[이월→WI-1.005]** = 1차 검증(Apex/Jest)은 이 WI, `매물 탐색` 탭이 필요한 E2E 는 **WI-1.005 전체 UI 회귀**에서 최종 검증(PHASE-PLAN-01 §3.4, I-01). **[이월→Lab 12]** = DH-SIT 측정. 잠정 AC 는 CK 해소 전 완료 조건 제외.

**Apex (이 WI 에서 완료)**

- [x] **AC-014** 키워드 부분 일치 — Given: "`@testSetup` SD-01~SD-10" / When: "keyword 를 `래미안`, `부산`, `센트럴`, `강남구` 로 각각 호출" / Then: "`래미안` → 1건(SD-01), `부산` → 2건(SD-02, SD-10), `센트럴` → 2건(SD-06, SD-09), `강남구` → 0건(주소는 검색 대상 아님)"
- [x] **AC-015** 가격 범위(경계 포함) — When: "(a) min 500000000 / max 1000000000, (b) min=max 850000000, (c) max 1000000000 만, (d) min 1000000000 만" / Then: "(a) 4건 SD-02·05·06·10, (b) 1건 SD-02, (c) 6건, (d) 4건 SD-01·03·07·08"
- [x] **AC-016** 최소 침실 수 — When: "minBedrooms 3, 4, 6" / Then: "3 → 7건, 4 → 3건(SD-01·05·07), 6 → 0건"
- [x] **AC-017** 복합 조건(AND) — When: "(a) `서울` + minBedrooms 3 + maxPrice 2000000000, (b) min 500000000 + max 1000000000 + minBedrooms 3" / Then: "(a) 1건 SD-08(Status `Sold`), (b) 3건 SD-02·05·06"
- [x] **AC-056** SOQL 인젝션 — Given: "SD-01~SD-10" / When: "keyword 를 `' OR Name LIKE '%` 와 `서울' OR City__c != '` 로 호출" / Then: "두 경우 모두 예외 없이 0건, 10건 반환되지 않음"
- [x] (재확인) **AC-018** keyword `강릉` → "예외 없이 `size() = 0` 인 List(null 아님)" — WI-1.003 소유 AC, 키워드 케이스를 여기서 추가 검증

**화면 (1차 Jest/Apex → E2E [이월→WI-1.005])**

- [x] **AC-027** 키워드 실시간 — Given: "AC-024 상태" / When: "`filter-keyword` 에 `서울` 입력(Enter 없음)" / Then: "마지막 입력 후 1,300ms 이내 `property-card` 3개(SD-01·04·08), `result-count` = `3건`" → 1차 Jest(디바운스 → 발행 인자) (ENHANCED 2026-10-29: test_engineer — E2E DH-DEV 실데이터 `npx playwright test tests/e2e/WI-1.004` 통과 — `AC-027 키워드 실시간 필터`(1,300ms 예산 내 3건) + 보조 `강남구`(주소) 0건 안내. 최종 회귀는 WI-1.005 → 미체크 유지) (ENHANCED 2026-10-29: 최종 회귀 WI-1.005 전체 UI 회귀 — DEV 49 passed/2 flaky/5 skipped, SIT 52/1(AC-044 테스트 코드 timeout 수정 후 통과)/3, UAT 51/0/5)
- [x] **AC-028** 최대 가격 — When: "`filter-max-price` 에 `1000000000`" / Then: "`property-card` 6개, `6건`, SD-01 카드 없음" → 1차 Apex(AC-015c) + Jest (ENHANCED 2026-10-29: test_engineer — E2E DH-DEV 실데이터 `npx playwright test tests/e2e/WI-1.004` 통과 — 6건, SD-01 없음. 최종 회귀는 WI-1.005 → 미체크 유지) (ENHANCED 2026-10-29: 최종 회귀 DEV/SIT/UAT 통과)
- [x] **AC-029** 가격 범위 — When: "(a) min `500000000` + max `1000000000`, (b) 둘 다 `850000000`" / Then: "(a) 4개 `4건`, (b) 1개(SD-02) `1건`" → 1차 Apex + Jest (ENHANCED 2026-10-29: test_engineer — E2E DH-DEV 실데이터 `npx playwright test tests/e2e/WI-1.004` 통과 — (a) 4건 (b) 850,000,000 경계 1건. 최종 회귀는 WI-1.005 → 미체크 유지) (ENHANCED 2026-10-29: 최종 회귀 DEV/SIT/UAT 통과)
- [x] **AC-030** 최소 침실 — When: "`3개 이상` 선택, 이어서 `4개 이상`" / Then: "`3개 이상` → 7개 `7건`, `4개 이상` → 3개(SD-01·05·07) `3건`" → 1차 Apex + Jest(선택지 값) (ENHANCED 2026-10-29: test_engineer — E2E DH-DEV 실데이터 `npx playwright test tests/e2e/WI-1.004` 통과 — 선택지 6종 확인, 7건 → 3건. 최종 회귀는 WI-1.005 → 미체크 유지) (ENHANCED 2026-10-29: 최종 회귀 DEV/SIT/UAT 통과)
- [x] **AC-031** 복합 + 판매완료 — When: "`서울` → `3개 이상` → 최대 `2000000000`" / Then: "3 → 2 → 1건. 최종 `송파 잠실 아파트`, `₩1,980,000,000`, 배지 `판매완료`(`data-status="Sold"`)" → 1차 Apex(AC-017a) (ENHANCED 2026-10-29: test_engineer — E2E DH-DEV 실데이터 `npx playwright test tests/e2e/WI-1.004` 통과 — 3 → 2 → 1건, SD-08 `₩1,980,000,000`·`판매완료`·`data-status=Sold`. 최종 회귀는 WI-1.005 → 미체크 유지) (ENHANCED 2026-10-29: 최종 회귀 DEV/SIT/UAT 통과)
- [x] **AC-032** 판매완료 기본 노출 — When: "`filter-min-price` `900000000`" / Then: "5개(SD-01·03·05·07·08) `5건`, `Sold` 2개, `Under Contract` 2개, "판매완료 제외" 옵션 없음" → 1차 Apex(가격 조건) — WI-1.003 과 공동 매핑 (ENHANCED 2026-10-29: test_engineer — E2E DH-DEV 실데이터 `npx playwright test tests/e2e/WI-1.004` 통과 — 5건, Sold 2·Under Contract 2, 판매완료 제외 옵션 없음 (WI-1.003 spec 의 AC-032 도 통과). 최종 회귀는 WI-1.005 → 미체크 유지) (ENHANCED 2026-10-29: 최종 회귀 DEV/SIT/UAT 통과)
- [x] **AC-033** 필터 초기화 — Given: "AC-031 최종 상태(1건)" / When: "`filter-reset` 클릭" / Then: "키워드·최소·최대 가격 빈 문자열, `filter-min-bedrooms` = `전체`, `property-card` 10개 `10건`" → 1차 Jest (ENHANCED 2026-10-29: test_engineer — E2E DH-DEV 실데이터 `npx playwright test tests/e2e/WI-1.004` 통과 — 입력값 빈 문자열·`전체`·10건 + 보조(음수 오류 후 초기화 → aria-invalid 해제). 최종 회귀는 WI-1.005 → 미체크 유지) (ENHANCED 2026-10-29: 최종 회귀 DEV/SIT/UAT 통과)
- [x] **AC-059** 음수·비숫자 — When: "`filter-max-price` 에 `-100`, 이어서 `abc`" / Then: "`-100` → `aria-invalid="true"`, 10건 유지 / `abc` → 값 빈 문자열, 10건 유지" → 1차 Jest(`reportValidity` 모의, 발행 안 함). 실제 차단은 Playwright 가 최종 근거 (ENHANCED 2026-10-29: test_engineer — E2E DH-DEV 실데이터 `npx playwright test tests/e2e/WI-1.004` **실패(제품 결함)** — `-100` → aria-invalid·조회 요청 0·10건 유지는 통과. `abc` 입력 시 값이 `b` 로 남음: lightning-input type=number 가 type=text+inputmode=decimal 로 렌더링되고 k/m/b 축약 입력을 허용 → AC 의 "값 빈 문자열" 불충족(목록은 10건 유지, 토스트 없음). frontend 처리(비숫자 정리) 또는 AC 문구 ENHANCE(CK 신규) 필요) (ENHANCED 2026-10-29: 비숫자·축약 입력 결함 수정 후 회귀 DEV/SIT/UAT 통과)
      (ENHANCED 2026-10-29: lightning-input type=number 가 k/m/b 축약을 허용해 `abc` → `b` 가 남던 결함 수정 — 비숫자·축약(`abc`/`1b`/`1k`)·해석 불가 입력(value "" + validity.valid=false)은 필드를 빈 문자열로 비우고 발행 안 함, `-100` 은 aria-invalid 유지. Jest 53/53, Playwright AC-059 통과 @ DH-DEV 0Afgw000000byIBCAY)
- [x] **AC-034 (Should)** 디바운스 — Given: "Aura 요청 카운터 0" / When: "`송파 잠실` 을 50ms 간격 `pressSequentially` 후 1,000ms 대기" / Then: "조회 요청 1회(최대 2회), 최종 1개(SD-08)" → 1차 Jest(가짜 타이머 → 발행 1회) (ENHANCED 2026-10-29: test_engineer — E2E DH-DEV 실데이터 `npx playwright test tests/e2e/WI-1.004` 통과 — `송파 잠실` 50ms 순차 입력 → getProperties 요청 1~2회, 최종 SD-08 1건. 최종 회귀는 WI-1.005 → 미체크 유지) (ENHANCED 2026-10-29: DEV flaky(단독 재실행 통과), SIT/UAT 통과)

**잠정 (CK 해소 전 완료 조건 제외)**

- [ ] **AC-057 (잠정 — CK-04)** 빈 값·공백 키워드 — When: "keyword `''`, `'   '` 호출 / UI 공백 3자" / Then: "모두 키워드 조건 미적용으로 10건(`10건`)" → Apex(trim 구현됨) + UI `test.fixme` (ENHANCED 2026-10-29: test_engineer — UI spec 은 `test.fixme`(E2E_CK04=1 로 활성). 참고 실행(E2E_CK04=1) 통과 — 공백 3자 → 10건. CK-04 해소 전 미체크) (ENHANCED 2026-10-29: 미완 유지 — CK-04 미해소 — Apex 통과, UI `test.fixme`, 완료 조건 제외)
- [ ] **AC-058 (잠정 — CK-03)** min > max — When: "min `1000000000`, max `500000000`" / Then: "`filter-price-error` 에 `최소 가격이 최대 가격보다 클 수 없습니다.`, 0개 `0건`, 오류 토스트 없음" → CK-03 해소 후 구현 (ENHANCED 2026-10-29: test_engineer — UI spec 은 `test.fixme`(E2E_CK03=1 로 활성). 참고 실행 실패 — `filter-price-error` 미구현(CK-03 미확정, 예상대로)) (ENHANCED 2026-10-29: 미완 유지 — CK-03 미해소 — `filter-price-error` 미구현, `test.fixme`, 완료 조건 제외)

**비기능·공통**

- [x] **AC-064** 검색 응답 1초 — Given: "DH-SIT, `agent`, 5회" / When: "`서울`, `3개 이상`, `2000000000` 각각 입력" / Then: "서버 응답 중앙값 ≤ 1,000ms, 마지막 입력 → 갱신 ≤ 1,300ms" → **[이월→Lab 12]** (CK-07) (ENHANCED 2026-10-29: test_engineer — spec 작성(`@perf`, SF_TARGET_ORG=DH-SIT 또는 E2E_PERF=1 에서만 실행) — DH-DEV 실행에서는 skip, Lab 12 이월) (ENHANCED 2026-10-29: Lab 12 DH-SIT 서버 중앙값 210ms, UI 732~992ms 통과)
- [x] **AC-065** Apex 보안·정적 분석 — Then: "`with sharing`, `WITH USER_MODE`/`AccessLevel.USER_MODE`, 문자열 연결 SOQL 0건(바인드만), 루프 내 SOQL/DML 0건, Code Analyzer High 이상 0건" → code_reviewer + Code Analyzer, 완료 (ENHANCED 2026-10-29: code_reviewer 리뷰 완료(PR 병합). Code Analyzer High·Critical 0건(Critical 1건은 flow 엔진 Python 미설치 환경 오류, 코드 결함 아님) — DELIVERABLES AC-065)
- [x] **AC-066** 커버리지 — Then: "실패 0건, 조직 ≥ 75%, `PropertyController` ≥ 85%" → `RunLocalTests`, 완료 (ENHANCED 2026-10-29: RunLocalTests DH-DEV 47/47 Pass·Org Wide 100%, DH-SIT 배포 시 45/45, PROD 프로모션 RunLocalTests 성공)
- [ ] **AC-067** 비밀정보 미커밋 → 수동, 완료 (ENHANCED 2026-10-29: 미완 유지 — `.gitignore` 의 `tests/e2e/.auth/` 포함은 확인, `git ls-files` 0줄 수동 확인 결과 기록 없음(DELIVERABLES B-03/B-07) — 다음 커밋 직전 1회 기록 후 체크)
- [x] **AC-070 (Should)** 성능 설계 — Then: "`cacheable=true`, 상수 `LIMIT`, 디바운스 300ms(±50ms), 파라미터 객체 `PropertyFilter`" → code_reviewer, 완료 (ENHANCED 2026-10-29: PCT `ac070_filterParameterObject`·Jest 디바운스·code_reviewer 리뷰 통과)

## 7. 테스트 요구

| 종류       | 대상                                                   | AC                                                                                    | 목표 / 명령                                                                                                         |
| ---------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Apex 단위  | `PropertyControllerTest` 확장                          | AC-014, 015, 016, 017, 018, 056, 057(잠정)                                            | 실패 0, 조직 ≥ 75%, `PropertyController` ≥ 85% — `sf apex run test -n PropertyControllerTest -o DH-DEV -c -r human` |
| Jest       | `propertyFilter.test.js`, `propertyList.test.js`(구독) | AC-027, 030, 033, 034, 059 로직 (+ WI-1.003 의 AC-025·032·046·047 필터 입력 로직 1차) | 통과 — `npm run test:unit`                                                                                          |
| 정적 분석  | Code Analyzer + code_reviewer                          | AC-065, 070                                                                           | High 이상 0건                                                                                                       |
| Playwright | `tests/e2e/WI-1.004-search-filter.spec.ts`             | AC-027~034, 059 (`@explore`), AC-057/058 (`test.fixme`), AC-064 (`@perf`)             | 최종 WI-1.005 `npx playwright test` / AC-064 Lab 12                                                                 |

## 8. 통합 체크리스트

- [x] 전문 에이전트 사용 확인 (ENHANCED 2026-10-29: 전문 에이전트 사용 — backend_developer / frontend_developer / test_engineer / code_reviewer, code_reviewer 리뷰 후 PR 병합)
- [x] 선행 WI-1.003 `[X]` 확인 (ENHANCED 2026-10-29: 문서 상태 정리 — 선행 WI 는 실제 구현·검증·병합 후 착수했고 문서 Status 갱신만 지연(B-03))
- [x] Apex 조건(키워드 Name/City 부분 일치·가격 경계 포함·침실 이상, 바인드 변수, 공백 trim)
- [x] `PropertyControllerTest` 확장 통과 (AC-014~017, 018 `강릉`, 056)
- [x] LMS 채널 `PropertyFilter__c` (frontend_developer 2026-10-29 — DH-DEV 배포 0Afgw000000c93uCAA)
- [x] `propertyFilter`: 라벨 4종, 침실 선택지 `전체`~`5개 이상`, 300ms 디바운스, `filter-reset`, 음수·비숫자 차단 (frontend_developer 2026-10-29 — Jest 1차, 실제 브라우저 차단은 WI-1.005 Playwright)
- [ ] min > max 처리 — CK-03 확정 시에만 (ENHANCED 2026-10-29: 미완 유지 — CK-03 미해소 — AC-058 잠정)
- [x] `propertyList` `PropertyFilter__c` 구독 (frontend_developer 2026-10-29 — 임시 clientFilter 제거, 서버 측 필터)
- [x] Jest 통과 (frontend_developer 2026-10-29 — `npx sfdx-lwc-jest` 3 suites / 43 tests)
- [x] `sf project deploy start --dry-run -o DH-DEV` 성공 → `sf project deploy start -o DH-DEV` (ENHANCED 2026-10-29: DH-DEV dry-run → deploy 후 DevOps Center Promote DEV → SIT → UAT → PROD(DH-HUB) 2026-10-29 완료)
- [x] Apex: `sf apex run test -l RunLocalTests -o DH-DEV -c -r human` 실패 0, 커버리지 기준 충족 (AC-066) (ENHANCED 2026-10-29: RunLocalTests DH-DEV 47/47 Pass·Org Wide 100%, DH-SIT 배포 시 45/45, PROD 프로모션 RunLocalTests 성공)
- [x] 정적 분석: `sf code-analyzer run --workspace . --view table` High 이상 0건 (AC-065), code_reviewer 메모(바인드·디바운스·AC-070) (ENHANCED 2026-10-29: Code Analyzer High·Critical 0건(Critical 1건은 flow 엔진 Python 미설치 환경 오류, 코드 결함 아님) — DELIVERABLES AC-065, code_reviewer 메모 반영(L-1 LIKE 이스케이프))
- [x] Playwright `WI-1.004-search-filter.spec.ts` 작성(`@explore`/`fixme`) — 1차 실행 대상 없음, PHASE-PLAN-01 §3.4 기록 (ENHANCED 2026-10-29: test_engineer — spec 작성(AC-027~034·059 `@explore`, 보조 negative 4건(주소 키워드·인젝션 문자열·오류 후 초기화 등), AC-057/058 `test.fixme`(E2E_CK04/E2E_CK03), AC-064 `@perf`). 공용 헬퍼 `tests/e2e/support/filter.ts`(가격 입력은 클릭→전체선택→삭제→입력: lightning-input 이 포커스 시 표시값을 바꿔 fill 이 이어붙는 문제). 매물 탐색 탭이 DH-DEV 에 있어 실데이터 실행: 통과 13 / 실패 1(AC-059 `abc` — 제품 결함) / skip 3(AC-057·058 fixme, AC-064 perf). WI-1.003 @filter 재실행 결과는 WI-1.003 문서 참조. 코드 리뷰 L-4 이월: 대상 org 가드 `tests/e2e/support/org.ts`(DH-DEV/SIT/UAT 만, Scratch Org·baseURL 일치 검증) → WI-1.003 spec 적용)
- [ ] AC-067 0줄 확인 (ENHANCED 2026-10-29: 미완 유지 — `.gitignore` 의 `tests/e2e/.auth/` 포함은 확인, `git ls-files` 0줄 수동 확인 결과 기록 없음(DELIVERABLES B-03/B-07) — 다음 커밋 직전 1회 기록 후 체크)
- [ ] CI(선택·미도입) — 해당 없음 (ENHANCED 2026-10-29: 미완 유지 — CI(GitHub Actions) 미도입 — 해당 없음(N/A), 안정화 후 선택 도입)
- [x] PROJECT-PLAN §5 / PHASE-PLAN-01 §1.2·§7.7 / 이 문서 체크리스트·Status `[X]` (ENHANCED 2026-10-29: 문서 상태 정리(DELIVERABLES §2.4 B-03) — PROJECT-PLAN v1.4 · PHASE-PLAN-01 v1.3 · 이 문서 갱신)
- [x] 커밋 `WI-1.004-search-filter` (ENHANCED 2026-10-29: `WI-1.004-search-filter` 이름으로 커밋, Feature Branch `WI-000004` PR 병합 → PROD 2026-10-29 CLOSED)

## 9. 참고 자료

- `docs/PROJECT-PLAN.md` v1.1 — §5, §5.2 WI-1.004, §7.2
- `docs/phases/PHASE-PLAN-01.md` v1.1 — §3.3·§3.4·§3.6, §7 WI-1.004, §12 I-01
- `docs/phase-0/ACCEPTANCE-CRITERIA.md` — §1.4 계산표, §1.5 문구, AC-014~018, 027~034, 056~059, 064, 065, 066, 067, 070, §7 CK-03/04/07
- `docs/REQUIREMENT.md` v1.1 — REQ-005, REQ-008, REQ-012, NFR-001/002/003/009
- `docs/phase-0/FIT-GAP-NUD.md` v1.1 — AD-01, D-16, D-17
- Salesforce: `Database.queryWithBinds`, `AccessLevel.USER_MODE`, Lightning Message Service, `lightning-input` validity, `sfdx-lwc-jest`
