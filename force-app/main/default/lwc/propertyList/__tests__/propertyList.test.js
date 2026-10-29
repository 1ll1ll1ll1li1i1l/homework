import { createElement } from "lwc";
import PropertyList from "c/propertyList";
import getProperties from "@salesforce/apex/PropertyController.getProperties";
import { refreshApex } from "@salesforce/apex";
import { subscribe, unsubscribe } from "lightning/messageService";
import PROPERTY_FILTER from "@salesforce/messageChannel/PropertyFilter__c";
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

  it("WI-1.004 PropertyFilter__c 를 구독하고 분리 시 해제한다", async () => {
    const el = mount();
    await flush();
    expect(subscribe).toHaveBeenCalledTimes(1);
    expect(subscribe.mock.calls[0][1]).toBe(PROPERTY_FILTER);
    document.body.removeChild(el);
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("WI-1.004 필터 수신 → filter 갱신 → getProperties 재호출 인자(서버 측 필터) + 스피너", async () => {
    const el = mount();
    getProperties.emit(TEN);
    await flush();
    const onMessage = subscribe.mock.calls[0][2];
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
    const onMessage = subscribe.mock.calls[0][2];
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
    const onMessage = subscribe.mock.calls[0][2];
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

  it("selectedId 카드 하이라이트", async () => {
    const el = mount({ selectedId: TEN[2].Id });
    getProperties.emit(TEN);
    await flush();
    const selected = [...tiles(el)].filter((t) => t.selected);
    expect(selected.length).toBe(1);
    expect(selected[0].property.Id).toBe(TEN[2].Id);
  });

  it("[목업 호환 — WI-1.005 제거 예정] 타일 propertyselect → 선택 레코드 포함 재발행", async () => {
    const el = mount();
    getProperties.emit(TEN);
    await flush();
    const handler = jest.fn();
    el.addEventListener("propertyselect", handler);
    tiles(el)[4].dispatchEvent(
      new CustomEvent("propertyselect", { detail: { recordId: TEN[4].Id } })
    );
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail).toEqual({
      recordId: TEN[4].Id,
      property: TEN[4]
    });
  });
});
