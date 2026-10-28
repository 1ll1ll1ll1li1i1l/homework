---
subject: 'WI-1.003 Property List LWC + Apex 컨트롤러'             # Workitem의 Subject 필드와 Sync
assignee: 'junghyuck.choi.85647fe082a1@agentforce.com'          # User Id로 변환하여 Sync에 사용
# 추적성 (PROJECT-PLAN v1.1 기준 — 코드네임 변경 금지)
wi-id: 'WI-1.003'
depends-on: [WI-1.002]                                           # PROJECT-PLAN §5 선행
req-ids: [REQ-005, REQ-007, REQ-011, REQ-012]
ac-ids: [AC-004, AC-013, AC-018, AC-019, AC-024, AC-025, AC-032, AC-044, AC-046, AC-047, AC-055, AC-062, AC-063, AC-065, AC-066, AC-067, AC-070]
pipeline: 'DreamHouse Pipeline'
# ⬇ 도구가 자동 stamp (절대 손으로 편집 금지)
project_id: null                     # Project의 record id
workitem_no: null                    # Workitem의 Name 필드값
salesforce_id: null                  # Workitem의 record id
status: null                         # Workitem의 Status 필드값
synced_at: null                      # Sync 타임스탬프
---

# WI-1.003 — Property List LWC + Apex 컨트롤러 (GAP)

> Cheatsheet STEP 6 산출물 (Lab 6.3, work_item_manager). 기준: `docs/PROJECT-PLAN.md` v1.1 §5 · `docs/phases/PHASE-PLAN-01.md` v1.1 §6.

## 0. 헤더

| 항목 | 내용 |
|---|---|
| Work Item | **WI-1.003** |
| Description (PROJECT-PLAN 원문) | **Property List LWC** `propertyList`(반응형 그리드·건수·빈 결과·스피너·에러 토스트) + **Apex 컨트롤러** `PropertyController.getProperties(PropertyFilter)` 기본 조회(`with sharing`·`WITH USER_MODE`·`cacheable`·LIMIT) + `PropertyControllerTest` + 목록 즉시 갱신(`refreshApex`) — REQ-005, REQ-007, REQ-011, REQ-012 |
| Phase | Phase 1 — MVP |
| 모듈 | Apex `PropertyFilter`·`PropertyController`·`PropertyControllerTest` · LWC `propertyList` · 권한 세트 Apex 클래스 접근 ENHANCE |
| 우선순위 | **Must** (분류 GAP, REQ-011 은 OQ-11 에 따라 NUD 가능) |
| 상태 | [ ] 미착수 (Not Started) |
| 선행 (Depends-on) | **WI-1.002** |
| 후행 | WI-1.004, WI-1.005 |
| 예상 소요 | **0.5 M/D (3.75h)** = REQ-005 1.5h + REQ-007 1.5h + REQ-011 0.5h + REQ-012 0.25h |
| 일정 | 2026-10-29(목) 15:45–19:30 (Lab 9) — 마일스톤 **M3** |
| 담당 에이전트 | backend_developer(Apex) · frontend_developer(LWC) · test_engineer · code_reviewer |
| 커밋명 | `WI-1.003-property-list-apex` |

## 1. 상세 개요

매물 조회의 **서버 계층**을 만든다. `PropertyFilter` 파라미터 객체(keyword, minPrice, maxPrice, minBedrooms — NFR-009)를 받는 `PropertyController.getProperties(PropertyFilter)` 를 `@AuraEnabled(cacheable=true)` 로 공개하고, 클래스는 `with sharing`, SOQL 은 `WITH USER_MODE`(CRUD/FLS 강제), 상수 정렬·LIMIT 을 쓴다. 이 WI 는 **조건 없는 기본 조회**까지만 구현한다 — 판매완료 포함 전체 상태를 반환하고(OQ-04/D-17), 0건이면 빈 List, 접근 거부 시 `AuraHandledException('매물 정보를 불러오지 못했습니다.')`. 메서드 시그니처를 미리 고정해 두어 WI-1.004 가 LWC 를 다시 만들지 않고 조건만 확장한다. 정렬·건수 상한은 CK-06/OQ-09 미확정이라 임시값 `ORDER BY Name`, `LIMIT 200` 을 명시한다.

**화면 계층**으로 `propertyList` LWC 를 만든다. `@wire(getProperties, { filter: '$filter' })` 로 데이터를 받아 `propertyTile`(WI-1.002)을 반응형 그리드(`lightning-layout`, 모바일 1열 / 태블릿 2열 / 데스크톱 3열)로 배치하고, `result-count`(`{n}건`), `empty-state`(`조건에 맞는 매물이 없습니다.`), `loading-spinner`(대체 텍스트 `로딩 중`), 오류 시 error 토스트를 표시한다. 즉시 반영(REQ-011)을 위해 `@api refresh()`(→ `refreshApex`)를 만든다. **`PropertyUpdated__c` LMS 채널 생성과 구독 연결은 WI-1.005 소유**(I-02)이므로 이 WI 에서는 채널을 만들지 않고 `refresh()` 메서드까지만 둔다. 필터 구독(`PropertyFilter__c`)은 WI-1.004 에서 추가한다.

권한 세트 2종에 `PropertyController` Apex 클래스 접근을 ENHANCE 한다. 검증은 Apex 테스트(`PropertyControllerTest`, 커버리지 ≥ 85% 목표) + Jest + Code Analyzer + code_reviewer 보안 리뷰로 1차 판정하고, `매물 탐색` 탭이 필요한 화면 AC(AC-024·025·032·044·046·047)는 spec 을 이 WI 에서 `@explore` 로 작성해 **WI-1.005 전체 UI 회귀**에서 실행한다. 성능 AC-063 은 DH-SIT 측정(Lab 12)이다.

## 2. Wireframe (propertyList)

```
┌─ data-testid="property-list" ────────────────────────────────────────────┐
│ 10건                                   ← result-count ("{n}건")           │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   데스크톱 ≥1024px: 3열  │
│ │ property-card│ │ property-card│ │ property-card│   태블릿: 2열            │
│ │  (WI-1.002)  │ │              │ │              │   모바일 375px: 1열       │
│ └──────────────┘ └──────────────┘ └──────────────┘                        │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                        │
│ │      …       │ │      …       │ │      …       │                        │
│ └──────────────┘ └──────────────┘ └──────────────┘                        │
└──────────────────────────────────────────────────────────────────────────┘
 로딩 중:  (◌ lightning-spinner alt="로딩 중")      ← loading-spinner
 0건:      0건 / "조건에 맞는 매물이 없습니다."     ← empty-state
 오류:     [토스트 error] 매물 정보를 불러오지 못했습니다.  (스피너 없음, 빈 화면 아님)
```

## 3. 선행 조건

- [ ] **선행 WI-1.002 Status `[X]` 확인** — 미완이면 시작 금지 (WI-1.001 도 `[X]`)
- [ ] DH-DEV 에 `Property__c`·권한 세트·`propertyTile`·`PropertySelected__c`·샘플 10건 배포/적재 완료
- [ ] `PropertyTestDataFactory`(WI-1.001) 존재 — 이 WI 에서 `createUserWithoutPermSet` ENHANCE
- [ ] 전문 에이전트 사용(backend_developer / frontend_developer / test_engineer / code_reviewer)
- [ ] `git checkout main ; git pull` → WI-1.003 Feature Branch checkout
- [ ] 미결: CK-06/OQ-09(정렬·LIMIT), I-10(탭 재진입 시 cacheable 캐시), I-04/§보안(noaccess 사용자 프로필 권한)

## 4. 세부 작업 (Numbered sub-tasks)

1. `classes/PropertyFilter.cls` — `@AuraEnabled` keyword/minPrice/maxPrice/minBedrooms (NFR-009)
2. `classes/PropertyController.cls` — `with sharing`, `@AuraEnabled(cacheable=true) getProperties(PropertyFilter)`, 조건 없는 기본 조회, `WITH USER_MODE`, 상수 `ORDER BY Name`·`LIMIT 200`(CK-06 임시값 — 주석 명시), 0건 시 빈 List, 접근 거부 → `AuraHandledException`
3. 권한 세트 2종(`DreamHouse_Agent`, `DreamHouse_Admin`)에 `classAccesses` `PropertyController` ENHANCE (REQ-002)
4. `PropertyTestDataFactory.createUserWithoutPermSet(alias)` 추가(ENHANCE)
5. `classes/PropertyControllerTest.cls` — `@testSetup` + 팩토리 + `System.runAs`: AC-004(조회부), 013, 018, 019, 055(Apex), 062(잠정)
6. `lwc/propertyList`: `property-list` 그리드(`lightning-layout multiple-rows`, `size=12 medium-device-size=6 large-device-size=4`), `result-count`, `empty-state`, `loading-spinner`, 오류 토스트
7. `refreshApex` 갱신 경로: `@api refresh()` + 탭 재진입 시 갱신(`connectedCallback`). **`PropertyUpdated__c` 채널·구독은 만들지 않는다**(WI-1.005)
8. Jest `lwc/propertyList/__tests__/propertyList.test.js` (`@wire` 모의: 10건 / 0건 / 오류 / refresh)
9. Playwright `tests/e2e/WI-1.003-property-list.spec.ts` — AC-024, 025, 032, 044, 046, 047 `@explore`, AC-063 은 DH-SIT 프로젝트로 분리
10. Code Analyzer High 0건 + code_reviewer 보안 리뷰 + 커버리지 확인 → dry-run → deploy → 이월 기록 → 커밋

## 5. 주요 타입 / API · 코드 예시

### 5.1 Apex

```apex
// classes/PropertyFilter.cls — 조회 조건 파라미터 객체 (NFR-009)
public with sharing class PropertyFilter {
    @AuraEnabled public String keyword { get; set; }
    @AuraEnabled public Decimal minPrice { get; set; }
    @AuraEnabled public Decimal maxPrice { get; set; }
    @AuraEnabled public Integer minBedrooms { get; set; }
}
```

```apex
// classes/PropertyController.cls — WI-1.003 기본 조회 (조건 확장은 WI-1.004)
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

- 판매완료 포함 전 상태 조회(OQ-04, D-17) — 상태 조건 없음. `filter` 는 받기만 하고 조건은 WI-1.004 에서 확장.
- 보안 규칙(AC-065): `with sharing`, `WITH USER_MODE`, 사용자 입력 문자열 연결 SOQL 0건, 루프 내 SOQL/DML 0건.
- (확인 필요) `noaccess` 사용자의 예외가 `QueryException` 인지 다른 유형인지 → 테스트는 "예외 발생 + 반환 없음" 으로 검증(AC-055 는 두 유형 모두 허용). 다른 유형이면 catch 범위를 넓힌다.

```xml
<!-- permissionsets/DreamHouse_Agent.permissionset-meta.xml · DreamHouse_Admin — WI-1.003 ENHANCE (추가분) -->
<classAccesses>
    <apexClass>PropertyController</apexClass>
    <enabled>true</enabled>
</classAccesses>
```

```apex
// classes/PropertyTestDataFactory.cls — WI-1.003 ENHANCE (추가 메서드)
public static User createUserWithoutPermSet(String alias) {
    User u = newUser(alias);
    System.runAs(new User(Id = UserInfo.getUserId())) { insert u; }
    return u;
}
```

```apex
// classes/PropertyControllerTest.cls
@IsTest
private class PropertyControllerTest {
    @TestSetup static void setup() {
        PropertyTestDataFactory.createSampleProperties();
        PropertyTestDataFactory.createUserWithPermSet('agent', 'DreamHouse_Agent');
        PropertyTestDataFactory.createUserWithoutPermSet('noaccess');
    }

    @IsTest static void ac004_agentQueryReturns10() {
        System.runAs(PropertyTestDataFactory.getUser('agent')) {
            Assert.areEqual(10, PropertyController.getProperties(new PropertyFilter()).size());
        }
    }

    @IsTest static void ac013_noFilterReturnsAllIncludingSold() {
        System.runAs(PropertyTestDataFactory.getUser('agent')) {
            List<Property__c> rows = PropertyController.getProperties(new PropertyFilter());
            Assert.areEqual(10, rows.size());
            Map<String, Integer> byStatus = new Map<String, Integer>();
            for (Property__c p : rows) {
                byStatus.put(p.Status__c, (byStatus.containsKey(p.Status__c) ? byStatus.get(p.Status__c) : 0) + 1);
            }
            Assert.areEqual(6, byStatus.get('Available'));
            Assert.areEqual(2, byStatus.get('Under Contract'));
            Assert.areEqual(2, byStatus.get('Sold'));
        }
    }

    @IsTest static void ac018_emptyListNotNull() {
        delete [SELECT Id FROM Property__c];        // WI-1.003 1차: 데이터 0건 상황. 키워드 '강릉' 은 WI-1.004
        System.runAs(PropertyTestDataFactory.getUser('agent')) {
            List<Property__c> rows = PropertyController.getProperties(new PropertyFilter());
            Assert.isNotNull(rows);
            Assert.areEqual(0, rows.size());
        }
    }

    @IsTest static void ac019_fieldsAccessible() {
        System.runAs(PropertyTestDataFactory.getUser('agent')) {
            Property__c sd01;
            for (Property__c p : PropertyController.getProperties(new PropertyFilter())) {
                if (p.Name == '강남 래미안 아파트') sd01 = p;
            }
            Assert.areEqual('서울특별시 강남구 테헤란로 101', sd01.Address__c);
            Assert.areEqual('서울', sd01.City__c);
            Assert.areEqual(2500000000L, sd01.Price__c);
            Assert.areEqual(4, sd01.Bedrooms__c);
            Assert.areEqual(2, sd01.Bathrooms__c);
            Assert.isNotNull(sd01.Picture_URL__c);
            Assert.areEqual('Available', sd01.Status__c);   // 접근 시 SObjectException 없음
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

    // ac062_limit (잠정 — CK-06): MAX_RESULTS + 1 건 생성 후 반환 = MAX_RESULTS. CK-06 해소 전 완료 조건 제외
}
```

- **(확인 필요 — 위험)** `noaccess` 를 `Standard User` 프로필로 만들면 프로필이 커스텀 오브젝트 Read 를 줄 수 있어 AC-055 가 실패할 수 있다. 실패 시 테스트 사용자 프로필을 `Minimum Access - Salesforce` 로 바꾸는 방안을 requirements_analyst·test_engineer 와 협의(WI-1.001 §4.6 참고).

### 5.2 LWC `propertyList` (data-testid 규약 — 이름 변경 금지)

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
        // AC-044: 탭 재진입 시 cacheable 캐시의 이전 값 방지 — 컴포넌트 재사용 시 동작은 확인 필요(I-10)
        if (this.wiredResult) this.refresh();
    }

    @api
    async refresh() {           // REQ-011: WI-1.005 의 PropertyUpdated__c 구독 핸들러가 호출 (I-02)
        this.isLoading = true;
        try { await refreshApex(this.wiredResult); } finally { this.isLoading = false; }
    }

    get resultCountLabel() { return `${this.properties.length}건`; }
    get isEmpty() { return !this.isLoading && this.properties.length === 0; }
}
```

```xml
<!-- lwc/propertyList/propertyList.js-meta.xml — App Page 배치(WI-1.005) 대비 -->
<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>62.0</apiVersion>
    <isExposed>true</isExposed>
    <masterLabel>Property List</masterLabel>
    <targets><target>lightning__AppPage</target></targets>
</LightningComponentBundle>
```

### 5.3 Jest (1차 검증)

```js
// lwc/propertyList/__tests__/propertyList.test.js
import { createElement } from 'lwc';
import PropertyList from 'c/propertyList';
import getProperties from '@salesforce/apex/PropertyController.getProperties';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEventName } from 'lightning/platformShowToastEvent';

jest.mock('@salesforce/apex/PropertyController.getProperties',
    () => { const { createApexTestWireAdapter } = require('@salesforce/sfdx-lwc-jest'); return { default: createApexTestWireAdapter(jest.fn()) }; },
    { virtual: true });
jest.mock('@salesforce/apex', () => ({ refreshApex: jest.fn(() => Promise.resolve()) }), { virtual: true });

const TEN = Array.from({ length: 10 }, (_, i) => ({ Id: `a0${i}`, Name: `매물${i}`, Price__c: 1, Status__c: 'Available' }));
const mount = () => { const el = createElement('c-property-list', { is: PropertyList }); document.body.appendChild(el); return el; };
const q = (el, id) => el.shadowRoot.querySelector(`[data-testid="${id}"]`);

it('AC-024 기반 10건 → "10건", 카드 10개, empty-state 없음', async () => {
    const el = mount();
    getProperties.emit(TEN);
    await Promise.resolve();
    expect(q(el, 'result-count').textContent).toBe('10건');
    expect(el.shadowRoot.querySelectorAll('c-property-tile').length).toBe(10);
    expect(q(el, 'empty-state')).toBeNull();
});

it('AC-025 기반 0건 → "0건" + 빈 결과 문구', async () => {
    const el = mount();
    getProperties.emit([]);
    await Promise.resolve();
    expect(q(el, 'result-count').textContent).toBe('0건');
    expect(q(el, 'empty-state').textContent).toBe('조건에 맞는 매물이 없습니다.');
});

it('AC-046 기반 응답 전 스피너(로딩 중) → 응답 후 사라짐', async () => {
    const el = mount();
    expect(q(el, 'loading-spinner').alternativeText).toBe('로딩 중');
    getProperties.emit(TEN);
    await Promise.resolve();
    expect(q(el, 'loading-spinner')).toBeNull();
});

it('AC-047 기반 오류 → error 토스트, 스피너 없음', async () => {
    const el = mount();
    const handler = jest.fn();
    el.addEventListener(ShowToastEventName, handler);
    getProperties.error();
    await Promise.resolve();
    expect(handler.mock.calls[0][0].detail).toMatchObject({ title: '매물 정보를 불러오지 못했습니다.', variant: 'error' });
    expect(q(el, 'loading-spinner')).toBeNull();
});

it('AC-044 기반 refresh() → refreshApex 호출', async () => {
    const el = mount();
    getProperties.emit(TEN);
    await el.refresh();
    expect(refreshApex).toHaveBeenCalled();
});
```

- sfdx-lwc-jest 버전에 따라 Apex wire 모의 방법(`createApexTestWireAdapter`)이 다를 수 있다 → test_engineer 가 설치 버전(`^7.0.2`)에 맞춰 조정.

### 5.4 Playwright spec 골격

```ts
// tests/e2e/WI-1.003-property-list.spec.ts — 매물 탐색 탭(WI-1.005)·필터(WI-1.004) 필요 → @explore
import { test, expect } from '@playwright/test';
test.use({ storageState: 'tests/e2e/.auth/agent.json' });

test('AC-024 초기 진입 시 전체 목록과 건수', { tag: '@explore' }, async ({ page }) => {
  await expect(page.getByTestId('property-card')).toHaveCount(10);
  await expect(page.getByTestId('result-count')).toHaveText('10건');
  await expect(page.getByTestId('empty-state')).toHaveCount(0);
});
test('AC-025 결과 0건 안내', { tag: '@explore' }, async ({ page }) => { /* filter-keyword '강릉' → 1초 내 0개, '0건', 문구 */ });
test('AC-032 판매완료 기본 노출', { tag: '@explore' }, async ({ page }) => { /* filter-min-price 900000000 → 5건, Sold 2, Under Contract 2 */ });
test('AC-044 (Should) 표준 페이지 변경 후 복귀 반영', { tag: '@explore' }, async ({ page }) => { /* admin, SD-03 판매중 → 복원 */ });
test('AC-046 로딩 스피너', { tag: '@explore' }, async ({ page }) => { /* page.route 1,500ms 지연, '부산' → 스피너 후 2개 */ });
test('AC-047 조회 오류 토스트', { tag: '@explore' }, async ({ page }) => { /* Aura 응답 ERROR 모의, '서울' → error 토스트 */ });
test('AC-063 초기 목록 응답 1초 이내 (DH-SIT)', { tag: ['@explore', '@perf'] }, async ({ page }) => { /* Lab 12, 5회 중앙값 ≤1,000ms */ });
```

## 6. 수락 기준 (AC 매핑)

> **[이월→WI-1.005]** = 1차 검증(Apex/Jest)은 이 WI, `매물 탐색` 탭이 필요한 E2E 는 **WI-1.005 전체 UI 회귀**에서 최종 검증(PHASE-PLAN-01 §3.4, I-01). 필터 입력 로직의 Jest 1차 확인은 WI-1.004. **[이월→Lab 12]** = DH-SIT 측정. 잠정 AC 는 CK 해소 전 완료 조건 제외.

- [ ] **AC-004 (조회부)** — Given: "`DreamHouse_Agent` 권한 세트 할당, SD-01~SD-10 존재" / When: "`System.runAs(agent)` 에서 `PropertyController.getProperties`(조건 없음) 호출" / Then: "조회 결과 10건" → Apex `ac004_agentQueryReturns10` (WI-1.001 권한 벡터에서 이월된 부분), **이 WI 에서 완료**
- [ ] **AC-013** 조건 없음 → 전체 10건 — Given: "`@testSetup` SD-01~SD-10" / When: "모든 조건이 null 인 filter 로 호출" / Then: "10건 반환, Status__c 별 6/2/2, `Sold` 2건(SD-05, SD-08) 포함" → Apex, 완료
- [ ] **AC-018** 0건은 빈 목록 — Given: "AC-013 과 같음" / When: "keyword `강릉` 으로 호출" / Then: "예외 없이 `size() = 0` 인 List 반환(null 아님)" → 이 WI: 데이터 0건 상황으로 1차 Apex / 키워드 `강릉` 재확인은 WI-1.004
- [ ] **AC-019** 반환 필드 — Given: "AC-013 과 같음" / When: "keyword `래미안` 으로 호출" / Then: "Id, Name=`강남 래미안 아파트`, Address__c, City__c=`서울`, Price__c=2500000000, Bedrooms__c=4, Bathrooms__c=2, Picture_URL__c(값 존재), Status__c=`Available` 접근 시 `SObjectException` 없음" → Apex(키워드 대신 Name 으로 찾음), 완료
- [ ] **AC-055 (Apex)** 권한 세트 미할당 차단 — Given: "`noaccess` 사용자(Standard User, 권한 세트 없음)" / When: "`System.runAs(noaccess)` 에서 `getProperties`(조건 없음) 호출" / Then: "예외 발생(`AuraHandledException` 또는 `QueryException`), 데이터 반환 없음" → Apex, 완료 (UI 부분은 WI-1.005)
- [ ] **AC-062 (잠정 — CK-06)** 건수 상한 — Given: "Property__c 를 상한 N + 1 건 생성" / When: "조건 없이 호출" / Then: "반환 건수 = N, 예외 없음" → Apex, CK-06 해소 후
- [ ] **AC-024** 초기 목록과 건수 — Given: "`agent` 로그인" / When: ""매물 탐색" 탭에 진입" / Then: "`property-card` 10개, `result-count` = `10건`, `empty-state` 미표시, 판매완료 카드(SD-05, SD-08) 포함" → 1차 Jest / **E2E [이월→WI-1.005]**
- [ ] **AC-025** 결과 0건 안내 — Given: "AC-024 상태" / When: "`filter-keyword` 에 `강릉` 입력" / Then: "1초 이내 `property-card` 0개, `result-count` = `0건`, `empty-state` 텍스트 `조건에 맞는 매물이 없습니다.`" → 1차 Jest(0건 분기) / **E2E [이월→WI-1.005]**
- [ ] **AC-032** 판매완료 기본 노출 — Given: "AC-024 상태" / When: "`filter-min-price` `900000000` 입력" / Then: "결과 5개(SD-01·03·05·07·08) `5건`. `data-status="Sold"` 2개, `Under Contract` 2개. "판매완료 제외" 류 옵션 없음" → 1차: 이 WI 는 상태 조건이 없음을 Apex(AC-013)로 확인, 가격 조건 Apex 는 WI-1.004 / **E2E [이월→WI-1.005]**
- [ ] **AC-046** 로딩 스피너 — Given: "`agent` 로그인, `getProperties` 응답 1,500ms 지연" / When: "`filter-keyword` 에 `부산` 입력" / Then: "대기 중 `loading-spinner` 표시(대체 텍스트 `로딩 중`), 응답 후 사라지고 카드 2개" → 1차 Jest / **E2E [이월→WI-1.005]**
- [ ] **AC-047** 조회 오류 토스트 — Given: "`agent` 로그인, `getProperties` 응답을 오류로 모의" / When: "`filter-keyword` 에 `서울` 입력" / Then: "error 토스트 `매물 정보를 불러오지 못했습니다.`, `loading-spinner` 미표시, 빈 흰 화면 없음" → 1차 Jest / **E2E [이월→WI-1.005]**
- [ ] **AC-063** 초기 목록 1초 — Given: "DH-SIT, `agent`, SD-01~SD-10, 캐시 미적용 5회" / When: ""매물 탐색" 탭 진입" / Then: "요청 시작 → 카드 10개 렌더까지 중앙값 ≤ 1,000ms, 최대 ≤ 1,500ms" → **[이월→Lab 12]** (CK-07)
- [ ] **AC-065** Apex 보안·정적 분석 — Given: "WI-1.003 / WI-1.004 의 Apex 소스" / When: "code_reviewer 리뷰와 `sf code-analyzer run --workspace . --view table`" / Then: "모든 클래스 `with sharing`, 모든 SOQL `WITH USER_MODE`(또는 `AccessLevel.USER_MODE`), 사용자 입력 문자열 연결 SOQL 0건, 루프 내 SOQL/DML 0건, High 이상 0건" → 완료 (WI-1.004 재확인)
- [ ] **AC-066** 커버리지 — Given: "`PropertyModelTest`, `PropertyControllerTest`" / When: "`sf apex run test -l RunLocalTests -c -r human`" / Then: "실패 0건, 조직 ≥ 75%, `PropertyController` ≥ 85%(목표). 양성·음성·권한 케이스 포함" → 완료
- [ ] **AC-067** 비밀정보 미커밋 — Then: "`git ls-files | grep -E "\.auth/|sfdx-url|accessToken"` 0줄, `.gitignore` 에 `tests/e2e/.auth/`" → 수동
- [ ] **AC-044 (Should)** 표준 페이지 변경 후 복귀 반영 — Given: "`admin`, "매물 탐색" 탭 로드해 SD-03 배지 `계약중` 확인" / When: "`매물` 탭 → SD-03 레코드에서 상태 `판매중` 저장 → `매물 탐색` 탭 클릭(새로고침 없음)" / Then: "SD-03 배지 = `판매중`(캐시로 인한 `계약중` 없음). 복원 `Under Contract`" → 1차 Jest(`refresh` → `refreshApex`) / **E2E [이월→WI-1.005]** (I-10, 실패 시 Should 이월)
- [ ] **AC-070 (Should)** 조회 성능 설계 — Given: "`PropertyController`, `propertyFilter` 소스" / When: "code_reviewer 리뷰" / Then: "`@AuraEnabled(cacheable=true)`, 상수 `LIMIT`, 디바운스 300ms(±50ms), 파라미터 객체 `PropertyFilter`" → 이 WI: cacheable·LIMIT·파라미터 객체 / 디바운스는 WI-1.004 재확인

## 7. 테스트 요구

| 종류 | 대상 | AC | 목표 / 명령 |
|---|---|---|---|
| Apex 단위 | `PropertyControllerTest` (+ `PropertyModelTest` 회귀) | AC-004(조회부), 013, 018, 019, 055, 062(잠정) | 실패 0, 조직 ≥ 75%, `PropertyController` ≥ 85% — `sf apex run test -n PropertyControllerTest,PropertyModelTest -o DH-DEV -c -r human` |
| Jest | `propertyList.test.js` | AC-024/025/044/046/047 로직 | 통과 — `npm run test:unit -- propertyList` |
| 정적 분석 | Code Analyzer + code_reviewer | AC-065, 070 | High 이상 0건 |
| Playwright | `tests/e2e/WI-1.003-property-list.spec.ts` | AC-024, 025, 032, 044, 046, 047 (`@explore`), AC-063 (`@perf`, DH-SIT) | 최종 WI-1.005 `npx playwright test` / AC-063 Lab 12 |

## 8. 통합 체크리스트

- [ ] 전문 에이전트 사용 확인
- [ ] 선행 WI-1.002 `[X]` 확인
- [ ] `PropertyFilter` 파라미터 객체
- [ ] `PropertyController`(`with sharing`, cacheable, `WITH USER_MODE`, 임시 정렬·LIMIT 주석, 빈 List, 접근 거부 처리)
- [ ] 권한 세트 2종에 `PropertyController` 클래스 접근 ENHANCE
- [ ] `PropertyTestDataFactory.createUserWithoutPermSet` ENHANCE
- [ ] `propertyList`: 반응형 그리드, `result-count`, `empty-state`, `loading-spinner`, 오류 토스트, `@api refresh()` (PropertyUpdated__c 미생성 확인)
- [ ] Jest 통과
- [ ] `sf project deploy start --dry-run -o DH-DEV` 성공 → `sf project deploy start -o DH-DEV`
- [ ] Apex: `sf apex run test -l RunLocalTests -o DH-DEV -c -r human` 실패 0, 조직 ≥ 75%, PropertyController ≥ 85% (AC-066)
- [ ] 정적 분석: `sf code-analyzer run --workspace . --view table` High 이상 0건 (AC-065), code_reviewer 보안 리뷰 메모
- [ ] Playwright `WI-1.003-property-list.spec.ts` 작성(`@explore`) — 1차 실행 대상 없음, PHASE-PLAN-01 §3.4 기록
- [ ] AC-067 0줄 확인
- [ ] CI(선택·미도입) — 해당 없음
- [ ] PROJECT-PLAN §5 / PHASE-PLAN-01 §1.2·§6.7 / 이 문서 체크리스트·Status `[X]`
- [ ] 커밋 `WI-1.003-property-list-apex`

## 9. 참고 자료

- `docs/PROJECT-PLAN.md` v1.1 — §5, §5.2 WI-1.003, §7.2, R-09/R-11
- `docs/phases/PHASE-PLAN-01.md` v1.1 — §3.3·§3.4·§3.6, §6 WI-1.003, §12 I-01/I-02/I-10
- `docs/phase-0/ACCEPTANCE-CRITERIA.md` — §1.4 계산표, §1.5 문구, AC-004/013/018/019/024/025/032/044/046/047/055/062/063/065/066/067/070
- `docs/REQUIREMENT.md` v1.1 — REQ-005, REQ-007, REQ-011, REQ-012, NFR-002/003/006/009
- `docs/phase-0/FIT-GAP-NUD.md` v1.1 — AD-01, AD-02, D-12, D-17
- Salesforce: `WITH USER_MODE`, `@AuraEnabled(cacheable=true)`, `refreshApex`, `lightning-layout`, `ShowToastEvent`, `sfdx-lwc-jest`
