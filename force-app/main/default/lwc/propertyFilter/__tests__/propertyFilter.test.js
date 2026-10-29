/**
 * WI-1.004 propertyFilter Jest (1차 검증) — AC-027·030·033·034·059 로직 (+ AC-070 디바운스 300ms).
 * lightning-input 은 Jest 스텁이라 브라우저의 실제 음수/비숫자 차단·aria-invalid 표시는 WI-1.005 Playwright 가 최종 근거.
 */
import { createElement } from "lwc";
import PropertyFilter from "c/propertyFilter";
import { publish } from "lightning/messageService";
import PROPERTY_FILTER from "@salesforce/messageChannel/PropertyFilter__c";

const EMPTY = {
  keyword: null,
  minPrice: null,
  maxPrice: null,
  minBedrooms: null
};

const mount = () => {
  const el = createElement("c-property-filter", { is: PropertyFilter });
  document.body.appendChild(el);
  return el;
};
const q = (el, id) => el.shadowRoot.querySelector(`[data-testid="${id}"]`);
const type = (node, value) => {
  node.value = value;
  node.dispatchEvent(new CustomEvent("change"));
};
const choose = (node, value) => {
  node.dispatchEvent(new CustomEvent("change", { detail: { value } }));
};
const lastPayload = () => publish.mock.calls[publish.mock.calls.length - 1][2];

describe("c-property-filter (WI-1.004)", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it("data-testid 규약 + 라벨 4종 + 숫자 입력 min=0 step=1", () => {
    const el = mount();
    [
      "filter-panel",
      "filter-keyword",
      "filter-min-price",
      "filter-max-price",
      "filter-min-bedrooms",
      "filter-reset"
    ].forEach((id) => expect(q(el, id)).not.toBeNull());
    expect(q(el, "filter-keyword").label).toBe("키워드");
    expect(q(el, "filter-keyword").type).toBe("search");
    expect(q(el, "filter-min-price").label).toBe("최소 가격");
    expect(q(el, "filter-max-price").label).toBe("최대 가격");
    expect(q(el, "filter-min-bedrooms").label).toBe("최소 침실 수");
    expect(q(el, "filter-reset").label).toBe("초기화");
    ["filter-min-price", "filter-max-price"].forEach((id) => {
      expect(q(el, id).type).toBe("number");
      expect(q(el, id).min).toBe("0");
      expect(q(el, id).step).toBe("1");
    });
    expect(q(el, "filter-panel").getAttribute("aria-label")).toBe(
      "매물 검색 필터"
    );
    // 상태 필터(판매완료 제외 등) 없음 — D-17
    expect(el.shadowRoot.textContent).not.toContain("판매완료");
  });

  it("AC-027/034 기반 300ms 안 연속 입력 → 발행 1회, 마지막 값 (PropertyFilter__c)", () => {
    const el = mount();
    ["송", "송파", "송파 잠", "송파 잠실"].forEach((v) => {
      type(q(el, "filter-keyword"), v);
      jest.advanceTimersByTime(50);
    });
    expect(publish).not.toHaveBeenCalled();
    jest.advanceTimersByTime(299 - 50);
    expect(publish).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(publish).toHaveBeenCalledTimes(1);
    expect(publish.mock.calls[0][1]).toBe(PROPERTY_FILTER);
    expect(publish.mock.calls[0][2]).toEqual({
      ...EMPTY,
      keyword: "송파 잠실"
    });
  });

  it("AC-028/029/031 기반 가격(원 단위 숫자)·침실 발행 페이로드", () => {
    const el = mount();
    type(q(el, "filter-keyword"), "서울");
    choose(q(el, "filter-min-bedrooms"), "3");
    type(q(el, "filter-min-price"), "500000000");
    type(q(el, "filter-max-price"), "2000000000");
    jest.advanceTimersByTime(300);
    expect(publish).toHaveBeenCalledTimes(1);
    expect(lastPayload()).toEqual({
      keyword: "서울",
      minPrice: 500000000,
      maxPrice: 2000000000,
      minBedrooms: 3
    });
  });

  it("AC-030 기반 침실 선택지 = 전체~5개 이상(0~5), 기본값 전체, 전체 → null", () => {
    const el = mount();
    const combo = q(el, "filter-min-bedrooms");
    expect(combo.options.map((o) => o.label)).toEqual([
      "전체",
      "1개 이상",
      "2개 이상",
      "3개 이상",
      "4개 이상",
      "5개 이상"
    ]);
    expect(combo.options.map((o) => o.value)).toEqual([
      "0",
      "1",
      "2",
      "3",
      "4",
      "5"
    ]);
    expect(combo.value).toBe("0");
    choose(combo, "4");
    jest.advanceTimersByTime(300);
    expect(lastPayload().minBedrooms).toBe(4);
    choose(combo, "0");
    jest.advanceTimersByTime(300);
    expect(lastPayload().minBedrooms).toBeNull();
  });

  it("AC-057 (잠정 CK-04) 기반 공백 키워드 → keyword null", () => {
    const el = mount();
    type(q(el, "filter-keyword"), "   ");
    jest.advanceTimersByTime(300);
    expect(lastPayload()).toEqual(EMPTY);
  });

  it("AC-033 기반 초기화 → 디바운스 없이 즉시 발행(모든 값 null), 입력값 비움, 대기 중 발행 취소", async () => {
    const el = mount();
    type(q(el, "filter-keyword"), "서울");
    type(q(el, "filter-max-price"), "2000000000");
    choose(q(el, "filter-min-bedrooms"), "3");
    jest.advanceTimersByTime(300);
    expect(publish).toHaveBeenCalledTimes(1);

    type(q(el, "filter-keyword"), "서울역"); // 대기 중 → 초기화가 취소해야 함
    q(el, "filter-reset").click();
    expect(publish).toHaveBeenCalledTimes(2);
    expect(lastPayload()).toEqual(EMPTY);
    jest.advanceTimersByTime(1000);
    expect(publish).toHaveBeenCalledTimes(2);

    await Promise.resolve();
    expect(q(el, "filter-keyword").value).toBe("");
    expect(q(el, "filter-min-price").value).toBe("");
    expect(q(el, "filter-max-price").value).toBe("");
    expect(q(el, "filter-min-bedrooms").value).toBe("0");
  });

  it("AC-059 기반 음수 → reportValidity false(aria-invalid) → 반영·발행 없음", () => {
    const el = mount();
    const max = q(el, "filter-max-price");
    max.reportValidity = jest.fn(() => false);
    type(max, "-100");
    jest.advanceTimersByTime(1000);
    expect(max.reportValidity).toHaveBeenCalled();
    expect(publish).not.toHaveBeenCalled();
  });

  it("AC-059 기반 reportValidity 가 통과해도 음수는 명시적으로 차단", () => {
    const el = mount();
    const min = q(el, "filter-min-price");
    min.reportValidity = jest.fn(() => true);
    type(min, "-1");
    jest.advanceTimersByTime(1000);
    expect(publish).not.toHaveBeenCalled();
    // 이후 유효값은 정상 발행
    type(min, "900000000");
    jest.advanceTimersByTime(300);
    expect(lastPayload()).toEqual({ ...EMPTY, minPrice: 900000000 });
  });

  it("AC-059 기반 비숫자(type=number 가 빈 문자열로 전달) → 가격 조건 없음", () => {
    const el = mount();
    const max = q(el, "filter-max-price");
    max.reportValidity = jest.fn(() => true);
    type(max, "1000000000");
    jest.advanceTimersByTime(300);
    expect(lastPayload().maxPrice).toBe(1000000000);
    type(max, "");
    jest.advanceTimersByTime(300);
    expect(lastPayload().maxPrice).toBeNull();
  });

  it.each(["abc", "b", "1b", "1k", "2m", "1e9", "-"])(
    'AC-059 기반 비숫자·축약 입력 "%s" → 필드 값 빈 문자열, 발행 없음',
    (raw) => {
      const el = mount();
      ["filter-min-price", "filter-max-price"].forEach((id) => {
        const input = q(el, id);
        type(input, raw);
        jest.advanceTimersByTime(0);
        expect(input.value).toBe("");
      });
      jest.advanceTimersByTime(1000);
      expect(publish).not.toHaveBeenCalled();
    }
  );

  it("AC-059 기반 적용 중이던 가격 뒤 비숫자 입력 → 필드 비움 + 조건 해제 발행", () => {
    const el = mount();
    const max = q(el, "filter-max-price");
    type(max, "1000000000");
    jest.advanceTimersByTime(300);
    expect(lastPayload().maxPrice).toBe(1000000000);
    type(max, "1b");
    jest.advanceTimersByTime(0);
    expect(max.value).toBe("");
    jest.advanceTimersByTime(300);
    expect(publish).toHaveBeenCalledTimes(2);
    expect(lastPayload().maxPrice).toBeNull();
  });

  it("AC-059 기반 음수 -100 은 값 유지 + reportValidity(aria-invalid), 지우지 않음", () => {
    const el = mount();
    const max = q(el, "filter-max-price");
    max.reportValidity = jest.fn(() => false);
    type(max, "-100");
    expect(max.value).toBe("-100");
    expect(max.reportValidity).toHaveBeenCalled();
    jest.advanceTimersByTime(1000);
    expect(publish).not.toHaveBeenCalled();
  });

  it('AC-059 기반 lightning-input 이 해석 불가 입력을 value "" + validity.valid=false 로 보고 → 필드 비움, 발행 없음', () => {
    const el = mount();
    const max = q(el, "filter-max-price");
    max.validity = { valid: false, badInput: false };
    max.setCustomValidity = jest.fn();
    max.reportValidity = jest.fn(() => false);
    type(max, "");
    jest.advanceTimersByTime(0);
    expect(max.value).toBe("");
    expect(max.setCustomValidity).toHaveBeenCalledWith("");
    jest.advanceTimersByTime(1000);
    expect(publish).not.toHaveBeenCalled();
  });

  it("code-review WI-1.004 L-3: 분리 시 clearInput 복원 타이머도 정리", () => {
    const el = mount();
    const max = q(el, "filter-max-price");
    type(max, "abc");
    expect(max.value).toBe("0"); // 임시 값 — 다음 틱 복원 예정
    document.body.removeChild(el);
    jest.advanceTimersByTime(1000);
    expect(max.value).toBe("0"); // 분리 후에는 타이머가 실행되지 않음
    expect(publish).not.toHaveBeenCalled();
  });

  it("분리 시 대기 중 발행 취소", () => {
    const el = mount();
    type(q(el, "filter-keyword"), "서울");
    document.body.removeChild(el);
    jest.advanceTimersByTime(1000);
    expect(publish).not.toHaveBeenCalled();
  });
});
