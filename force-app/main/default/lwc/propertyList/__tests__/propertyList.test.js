import { createElement } from "lwc";
import PropertyList from "c/propertyList";
import getProperties from "@salesforce/apex/PropertyController.getProperties";
import { refreshApex } from "@salesforce/apex";
import { subscribe, unsubscribe } from "lightning/messageService";
import { getRecords } from "lightning/uiRecordApi";
import PROPERTY_FILTER from "@salesforce/messageChannel/PropertyFilter__c";
import PROPERTY_SELECTED from "@salesforce/messageChannel/PropertySelected__c";
import PROPERTY_UPDATED from "@salesforce/messageChannel/PropertyUpdated__c";
// sfdx-lwc-jest 스텁은 ShowToastEventName 을 export 하지 않음 → 이벤트명 직접 사용
const ShowToastEventName = "lightning__showtoast";

jest.mock(
  "@salesforce/apex/PropertyController.getProperties",
  () => {
    const { createApexTestWireAdapter } = require("@salesforce/sfdx-lwc-jest");
    return { default: createApexTestWireAdapter(jest.fn()) };
  },
  { virtual: true }
);
jest.mock(
  "@salesforce/apex",
  () => ({ refreshApex: jest.fn(() => Promise.resolve()) }),
  { virtual: true }
);

// SD-01~SD-10 (ACCEPTANCE-CRITERIA §1.4) 축약: 판매완료 SD-05, SD-08
const STATUSES = [
  "Available",
  "Available",
  "Under Contract",
  "Available",
  "Sold",
  "Available",
  "Under Contract",
  "Sold",
  "Available",
  "Available"
];
const CITIES = [
  "서울",
  "서울",
  "서울",
  "부산",
  "부산",
  "인천",
  "대구",
  "제주",
  "대전",
  "광주"
];
const TEN = STATUSES.map((Status__c, i) => ({
  Id: `a0000000000000${i}`,
  Name: `매물${i + 1}`,
  City__c: CITIES[i],
  Price__c: (i + 1) * 100000000,
  Bedrooms__c: (i % 4) + 1,
  Bathrooms__c: 1,
  Status__c
}));

// eslint-disable-next-line @lwc/lwc/no-async-operation
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
const mount = (props = {}) => {
  const el = createElement("c-property-list", { is: PropertyList });
  Object.assign(el, props);
  document.body.appendChild(el);
  return el;
};
const q = (el, id) => el.shadowRoot.querySelector(`[data-testid="${id}"]`);
const tiles = (el) => el.shadowRoot.querySelectorAll("c-property-tile");
/** subscribe 호출 중 해당 채널의 콜백 */
const handlerFor = (channel) =>
  subscribe.mock.calls.find((call) => call[1] === channel)[2];
/** LDS getRecords 응답 모양 { results: [{ statusCode, result: { id, fields } }] } */
const ldsOf = (records) => ({
  results: records.map((r) => ({
    statusCode: 200,
    result: {
      id: r.Id,
      fields: Object.fromEntries(
        Object.entries(r)
          .filter(([k]) => k !== "Id")
          .map(([k, value]) => [k, { value }])
      )
    }
  }))
});

describe("c-property-list (WI-1.003 + WI-1.004)", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("@wire 는 filter 파라미터 객체로 getProperties 를 호출한다 (NFR-009)", async () => {
    mount();
    await flush();
    expect(getProperties.getLastConfig()).toEqual({ filter: {} });
  });

  it('AC-024 기반 10건 → "10건", 카드 10개(판매완료 포함), empty-state 없음', async () => {
    const el = mount();
    getProperties.emit(TEN);
    await flush();
    expect(q(el, "property-list")).not.toBeNull();
    expect(q(el, "result-count").textContent).toBe("10건");
    expect(tiles(el).length).toBe(10);
    const sold = [...tiles(el)].filter((t) => t.property.Status__c === "Sold");
    expect(sold.length).toBe(2);
    expect(q(el, "empty-state")).toBeNull();
  });

  it("반응형 그리드: 모바일 12 / 태블릿 6 / 데스크톱 4", async () => {
    const el = mount();
    getProperties.emit(TEN);
    await flush();
    const item = el.shadowRoot.querySelector("lightning-layout-item");
    expect(item.size).toBe("12");
    expect(item.mediumDeviceSize).toBe("6");
    expect(item.largeDeviceSize).toBe("4");
  });

  it('AC-025 기반 0건 → "0건" + 빈 결과 문구', async () => {
    const el = mount();
    getProperties.emit([]);
    await flush();
    expect(q(el, "result-count").textContent).toBe("0건");
    expect(q(el, "empty-state").textContent.trim()).toBe(
      "조건에 맞는 매물이 없습니다."
    );
    expect(tiles(el).length).toBe(0);
  });

  it("AC-046 기반 응답 전 스피너(로딩 중) → 응답 후 사라짐", async () => {
    const el = mount();
    await flush();
    expect(q(el, "loading-spinner").alternativeText).toBe("로딩 중");
    expect(q(el, "empty-state")).toBeNull();
    getProperties.emit(TEN);
    await flush();
    expect(q(el, "loading-spinner")).toBeNull();
    expect(tiles(el).length).toBe(10);
  });

  it("AC-047 기반 오류 → error 토스트, 스피너 없음, 빈 화면 대신 안내", async () => {
    const el = mount();
    const handler = jest.fn();
    el.addEventListener(ShowToastEventName, handler);
    getProperties.error();
    await flush();
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail).toMatchObject({
      title: "매물 정보를 불러오지 못했습니다.",
      variant: "error"
    });
    expect(q(el, "loading-spinner")).toBeNull();
    expect(q(el, "empty-state")).toBeNull();
    expect(q(el, "error-state").getAttribute("role")).toBe("alert");
    expect(q(el, "error-state").textContent).toContain(
      "매물 정보를 불러오지 못했습니다."
    );
    // code-review L-1: 오류 시 "0건" 대신 오류 안내만
    expect(q(el, "result-count")).toBeNull();
  });

  it("AC-044 기반 refresh() → refreshApex(wire 결과) 호출 후 스피너 해제", async () => {
    const el = mount();
    getProperties.emit(TEN);
    await flush();
    await el.refresh();
    expect(refreshApex).toHaveBeenCalledTimes(1);
    await flush();
    expect(q(el, "loading-spinner")).toBeNull();
  });

  it("AC-044 기반 탭 재진입(재연결) 시 refreshApex 호출", async () => {
    const el = mount();
    getProperties.emit(TEN);
    await flush();
    document.body.removeChild(el);
    document.body.appendChild(el);
    await flush();
    expect(refreshApex).toHaveBeenCalled();
  });

  it("WI-1.004/1.005 PropertyFilter__c·PropertySelected__c·PropertyUpdated__c 를 구독하고 분리 시 모두 해제한다", async () => {
    const el = mount();
    await flush();
    expect(subscribe).toHaveBeenCalledTimes(3);
    expect(subscribe.mock.calls.map((c) => c[1])).toEqual([
      PROPERTY_FILTER,
      PROPERTY_SELECTED,
      PROPERTY_UPDATED
    ]);
    document.body.removeChild(el);
    expect(unsubscribe).toHaveBeenCalledTimes(3);
  });

  it("WI-1.004 필터 수신 → filter 갱신 → getProperties 재호출 인자(서버 측 필터) + 스피너", async () => {
    const el = mount();
    getProperties.emit(TEN);
    await flush();
    const onMessage = handlerFor(PROPERTY_FILTER);
    onMessage({
      keyword: "서울",
      minPrice: null,
      maxPrice: 2000000000,
      minBedrooms: 3
    });
    await flush();
    expect(getProperties.getLastConfig()).toEqual({
      filter: {
        keyword: "서울",
        minPrice: null,
        maxPrice: 2000000000,
        minBedrooms: 3
      }
    });
    expect(q(el, "loading-spinner")).not.toBeNull();
    // 서버가 거른 결과만 그대로 표시 (클라이언트 측 필터 없음)
    getProperties.emit([TEN[0]]);
    await flush();
    expect(q(el, "loading-spinner")).toBeNull();
    expect(tiles(el).length).toBe(1);
    expect(q(el, "result-count").textContent).toBe("1건");
  });

  it("WI-1.004 같은 조건 재수신 시 재조회·스피너 없음(스피너 고착 방지), 알 수 없는 필드는 버림", async () => {
    const el = mount();
    getProperties.emit(TEN);
    await flush();
    const onMessage = handlerFor(PROPERTY_FILTER);
    onMessage({ keyword: "부산", extra: "x" });
    await flush();
    const config = getProperties.getLastConfig();
    expect(config.filter).toEqual({
      keyword: "부산",
      minPrice: null,
      maxPrice: null,
      minBedrooms: null
    });
    getProperties.emit([TEN[3], TEN[4]]);
    await flush();
    onMessage({ keyword: "부산" });
    await flush();
    expect(getProperties.getLastConfig()).toBe(config);
    expect(q(el, "loading-spinner")).toBeNull();
    expect(q(el, "result-count").textContent).toBe("2건");
  });

  it("WI-1.004 초기화(모든 값 null) 수신 → 조건 없음 조회, 0건이면 empty-state", async () => {
    const el = mount();
    getProperties.emit(TEN);
    await flush();
    const onMessage = handlerFor(PROPERTY_FILTER);
    onMessage({ keyword: "강릉" });
    await flush();
    getProperties.emit([]);
    await flush();
    expect(q(el, "result-count").textContent).toBe("0건");
    expect(q(el, "empty-state")).not.toBeNull();
    onMessage({
      keyword: null,
      minPrice: null,
      maxPrice: null,
      minBedrooms: null
    });
    await flush();
    expect(getProperties.getLastConfig().filter.keyword).toBeNull();
    getProperties.emit(TEN);
    await flush();
    expect(q(el, "result-count").textContent).toBe("10건");
  });

  it("code-review M-1: refresh() 실패 → error 토스트 + error-state, 예외 전파 없음", async () => {
    const el = mount();
    getProperties.emit(TEN);
    await flush();
    const handler = jest.fn();
    el.addEventListener(ShowToastEventName, handler);
    refreshApex.mockImplementationOnce(() => Promise.reject(new Error("x")));
    await el.refresh();
    await flush();
    expect(handler).toHaveBeenCalledTimes(1);
    expect(q(el, "error-state")).not.toBeNull();
    expect(q(el, "loading-spinner")).toBeNull();
    expect(tiles(el).length).toBe(0);
  });

  it("WI-1.005 PropertySelected__c 수신 → 선택 카드 하이라이트", async () => {
    const el = mount();
    getProperties.emit(TEN);
    await flush();
    expect([...tiles(el)].filter((t) => t.selected).length).toBe(0);
    handlerFor(PROPERTY_SELECTED)({ recordId: TEN[2].Id });
    await flush();
    const selected = [...tiles(el)].filter((t) => t.selected);
    expect(selected.length).toBe(1);
    expect(selected[0].property.Id).toBe(TEN[2].Id);
  });

  it("AC-042 기반 PropertyUpdated__c 수신 → refreshApex(wire 결과) 호출, 건수 유지", async () => {
    const el = mount();
    getProperties.emit(TEN);
    await flush();
    const config = getProperties.getLastConfig();
    handlerFor(PROPERTY_UPDATED)({ recordId: TEN[1].Id });
    await flush();
    expect(refreshApex).toHaveBeenCalledTimes(1);
    expect(getProperties.getLastConfig()).toBe(config); // 조건 변경 없음
    expect(q(el, "result-count").textContent).toBe("10건");
  });

  it("AC-043 기반 필터(대전) 적용 중 PropertyUpdated__c 수신 → filter 유지한 채 refreshApex 만", async () => {
    const el = mount();
    getProperties.emit(TEN);
    await flush();
    handlerFor(PROPERTY_FILTER)({ keyword: "대전" });
    await flush();
    getProperties.emit([TEN[8]]);
    await flush();
    const config = getProperties.getLastConfig();
    handlerFor(PROPERTY_UPDATED)({ recordId: TEN[8].Id });
    await flush();
    expect(refreshApex).toHaveBeenCalledTimes(1);
    expect(getProperties.getLastConfig()).toBe(config);
    expect(getProperties.getLastConfig().filter.keyword).toBe("대전");
    getProperties.emit([{ ...TEN[8], Status__c: "Sold" }]);
    await flush();
    expect(q(el, "result-count").textContent).toBe("1건");
    expect(tiles(el)[0].property.Status__c).toBe("Sold");
  });

  it("refresh() 진행 중 재호출은 같은 요청을 공유한다 (중복 조회 방지)", async () => {
    const el = mount();
    getProperties.emit(TEN);
    await flush();
    let resolve;
    refreshApex.mockImplementationOnce(() => new Promise((r) => (resolve = r)));
    const first = el.refresh();
    const second = el.refresh();
    expect(refreshApex).toHaveBeenCalledTimes(1);
    resolve();
    await Promise.all([first, second]);
    await flush();
    expect(q(el, "loading-spinner")).toBeNull();
  });

  it("AC-044 (I-10) 표시 중 레코드를 LDS getRecords 로 추적한다 (optionalFields — FLS 안전)", async () => {
    mount();
    getProperties.emit(TEN);
    await flush();
    const config = getRecords.getLastConfig();
    expect(config.records).toHaveLength(1);
    expect(config.records[0].recordIds).toEqual(TEN.map((p) => p.Id));
    expect(config.records[0].optionalFields.map((f) => f.fieldApiName)).toEqual(
      expect.arrayContaining(["Status__c", "Price__c", "Name"])
    );
    expect(config.records[0].fields).toBeUndefined();
  });

  it("AC-044 (I-10) LDS 값이 카드와 같으면 재조회하지 않는다", async () => {
    mount();
    getProperties.emit(TEN);
    await flush();
    getRecords.emit(ldsOf(TEN));
    await flush();
    expect(refreshApex).not.toHaveBeenCalled();
  });

  it("AC-044 (I-10) 표준 레코드 페이지 저장으로 LDS 값이 바뀌면(탭 재연결 없이) refreshApex — 같은 스냅샷 반복 시 1회만", async () => {
    const el = mount();
    getProperties.emit(TEN);
    await flush();
    const changed = TEN.map((p, i) => {
      return i === 2 ? { ...p, Status__c: "Available" } : p;
    });
    getRecords.emit(ldsOf(changed));
    await flush();
    expect(refreshApex).toHaveBeenCalledTimes(1);
    getProperties.emit(changed);
    await flush();
    expect(tiles(el)[2].property.Status__c).toBe("Available");
    // 루프 방지: Apex 가 아직 낡은 값을 줘도 같은 LDS 스냅샷으로는 다시 조회하지 않음
    getProperties.emit(TEN);
    await flush();
    getRecords.emit(ldsOf(changed));
    await flush();
    expect(refreshApex).toHaveBeenCalledTimes(1);
  });

  it("AC-044 (I-10) LDS 가 받지 못한 필드(FLS)는 비교하지 않는다", async () => {
    mount();
    getProperties.emit(TEN);
    await flush();
    getRecords.emit({
      results: TEN.map((p) => ({
        statusCode: 200,
        result: { id: p.Id, fields: { Status__c: { value: p.Status__c } } }
      }))
    });
    await flush();
    expect(refreshApex).not.toHaveBeenCalled();
  });

  it("WI-1.005 M-2: 목업 propertyselect CustomEvent 경로 없음", async () => {
    const el = mount();
    getProperties.emit(TEN);
    await flush();
    const handler = jest.fn();
    el.addEventListener("propertyselect", handler);
    tiles(el)[4].dispatchEvent(
      new CustomEvent("propertyselect", { detail: { recordId: TEN[4].Id } })
    );
    expect(handler).not.toHaveBeenCalled();
  });
});
