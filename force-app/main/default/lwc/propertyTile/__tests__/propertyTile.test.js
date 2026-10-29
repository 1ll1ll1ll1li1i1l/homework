/**
 * WI-1.002 propertyTile Jest (1차 검증) — AC-020~023 로직, AC-026·048 기반(발행·aria-label).
 * lightning-formatted-number 는 Jest 스텁이라 화면의 '₩' 텍스트는 WI-1.005 Playwright 가 최종 근거.
 */
import { createElement } from "lwc";
import PropertyTile from "c/propertyTile";
import { publish } from "lightning/messageService";
import PROPERTY_SELECTED from "@salesforce/messageChannel/PropertySelected__c";

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
const SD01 = {
  ...SD02,
  Id: "a00000000000001",
  Name: "강남 래미안 아파트",
  Price__c: 2500000000
};
const SD09 = {
  ...SD02,
  Id: "a00000000000009",
  Name: "송도 센트럴 오피스텔",
  Price__c: 350000000,
  Picture_URL__c: null
};
const SD10 = {
  ...SD02,
  Id: "a00000000000010",
  Name: "서면 스카이 빌라",
  Picture_URL__c: "https://invalid.example.invalid/none.jpg"
};

const FULLWIDTH_WON = "￦";

const mount = (property) => {
  const el = createElement("c-property-tile", { is: PropertyTile });
  el.property = property;
  document.body.appendChild(el);
  return el;
};
const q = (el, id) => el.shadowRoot.querySelector(`[data-testid="${id}"]`);
const flush = () => Promise.resolve();

afterEach(() => {
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
  jest.clearAllMocks();
});

describe("c-property-tile", () => {
  it("data-testid 규약(§1.6) 요소가 모두 존재한다", () => {
    const el = mount(SD02);
    [
      "property-card",
      "property-card-image",
      "property-card-name",
      "property-card-price",
      "property-card-address",
      "property-card-rooms",
      "property-status-badge"
    ].forEach((id) => expect(q(el, id)).not.toBeNull());
  });

  it("AC-020 카드 요약 정보 (SD-02)", () => {
    const el = mount(SD02);
    const card = q(el, "property-card");
    expect(card.dataset.id).toBe("a00000000000002");
    expect(card.dataset.name).toBe("해운대 오션뷰");
    expect(q(el, "property-card-name").textContent.trim()).toBe(
      "해운대 오션뷰"
    );
    const address = q(el, "property-card-address").textContent;
    expect(address).toContain("부산광역시 해운대구 해운대해변로 22");
    expect(address).toContain("부산");
    expect(q(el, "property-card-rooms").textContent).toBe("침실 3 · 욕실 2");
    expect(q(el, "property-status-badge").textContent.trim()).toBe("판매중");
    expect(q(el, "property-card-image").alt).toBe("해운대 오션뷰");
  });

  it.each([
    ["Available", "판매중", "slds-theme_success"],
    ["Under Contract", "계약중", "slds-theme_warning"]
  ])("AC-021 배지 %s → %s / %s", (status, label, cls) => {
    const badge = q(
      mount({ ...SD02, Status__c: status }),
      "property-status-badge"
    );
    expect(badge.textContent.trim()).toBe(label);
    expect(badge.dataset.status).toBe(status);
    expect(badge.classList).toContain("slds-badge");
    expect(badge.classList).toContain(cls);
  });

  it("AC-021 Sold → 판매완료, 회색 기본 배지(초록·주황 클래스 없음)", () => {
    const badge = q(
      mount({ ...SD02, Status__c: "Sold" }),
      "property-status-badge"
    );
    expect(badge.textContent.trim()).toBe("판매완료");
    expect(badge.dataset.status).toBe("Sold");
    expect(badge.classList).toContain("slds-badge");
    expect(badge.classList).not.toContain("slds-theme_success");
    expect(badge.classList).not.toContain("slds-theme_warning");
  });

  it("AC-022 대조군 SD-02 → 원본 사진, propertyPlaceholder 미포함", () => {
    const img = q(mount(SD02), "property-card-image");
    expect(img.getAttribute("src")).toBe("https://example.invalid/sd02.jpg");
    expect(img.getAttribute("src")).not.toContain("propertyPlaceholder");
  });

  it("AC-022 SD-09 사진 빈 값 → propertyPlaceholder, alt = 매물명", () => {
    const img = q(mount(SD09), "property-card-image");
    expect(img.getAttribute("src")).toContain("propertyPlaceholder");
    expect(img.alt).toBe("송도 센트럴 오피스텔");
  });

  it("AC-022 SD-10 이미지 로드 오류 → propertyPlaceholder", async () => {
    const el = mount(SD10);
    expect(q(el, "property-card-image").getAttribute("src")).toBe(
      "https://invalid.example.invalid/none.jpg"
    );
    q(el, "property-card-image").dispatchEvent(new CustomEvent("error"));
    await flush();
    expect(q(el, "property-card-image").getAttribute("src")).toContain(
      "propertyPlaceholder"
    );
    expect(q(el, "property-card-image").alt).toBe("서면 스카이 빌라");
  });

  it("AC-022 레코드가 바뀌면 대체 이미지 상태를 초기화한다", async () => {
    const el = mount(SD10);
    q(el, "property-card-image").dispatchEvent(new CustomEvent("error"));
    await flush();
    el.property = SD02;
    await flush();
    expect(q(el, "property-card-image").getAttribute("src")).toBe(
      "https://example.invalid/sd02.jpg"
    );
  });

  it.each([
    ["SD-01", SD01, 2500000000],
    ["SD-09", SD09, 350000000]
  ])(
    "AC-023 %s 가격 = lightning-formatted-number KRW 통화",
    (_sd, record, price) => {
      const num = q(mount(record), "property-card-price").querySelector(
        "lightning-formatted-number"
      );
      expect(num).not.toBeNull();
      expect(num.value).toBe(price);
      expect(num.formatStyle).toBe("currency");
      expect(num.currencyCode).toBe("KRW");
      expect(num.currencyDisplayAs).toBe("symbol");
    }
  );

  it("AC-023·I-06 aria-label 가격 = 반각 ₩ 원 단위 전체 금액, 억/만원/$/KRW 없음", () => {
    const label = q(mount(SD01), "property-card").getAttribute("aria-label");
    expect(label.startsWith("강남 래미안 아파트, ₩2,500,000,000")).toBe(true);
    ["억", "만원", "$", "KRW", FULLWIDTH_WON].forEach((s) =>
      expect(label).not.toContain(s)
    );
  });

  it("AC-048·AC-068 aria-label = 보이는 텍스트 전체(매물명, 가격, 주소 · 도시, 침실·욕실, 상태) — 같은 문자열 포함", () => {
    const el = mount(SD02);
    const card = q(el, "property-card");
    expect(card.getAttribute("role")).toBe("button");
    expect(card.getAttribute("tabindex")).toBe("0");
    expect(card.getAttribute("aria-pressed")).toBe("false");
    const label = card.getAttribute("aria-label");
    expect(label).toBe(
      "해운대 오션뷰, ₩850,000,000, 부산광역시 해운대구 해운대해변로 22 · 부산, 침실 3 · 욕실 2, 판매중"
    );
    // AC-068: 보이는 텍스트를 이어 붙여도 단어가 붙지 않도록 각 블록 끝에 공백 텍스트 노드
    expect(card.textContent.replace(/s+/g, " ")).toContain(
      "부산광역시 해운대구 해운대해변로 22 · 부산 침실 3 · 욕실 2 판매중"
    );
    // 화면의 텍스트 요소가 모두 라벨에 같은 문자열로 들어 있음
    [
      "property-card-name",
      "property-card-address",
      "property-card-rooms",
      "property-status-badge"
    ].forEach((id) => expect(label).toContain(q(el, id).textContent.trim()));
  });

  it("selected=true → 선택 테두리 클래스, aria-pressed=true", async () => {
    const el = mount(SD02);
    el.selected = true;
    await flush();
    const card = q(el, "property-card");
    expect(card.classList).toContain("property-card_selected");
    expect(card.getAttribute("aria-pressed")).toBe("true");
  });

  it("AC-026 기반 클릭·Enter → PropertySelected__c { recordId } 발행", () => {
    const card = q(mount(SD02), "property-card");
    card.click();
    card.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    expect(publish).toHaveBeenCalledTimes(2);
    expect(publish.mock.calls[0][1]).toBe(PROPERTY_SELECTED);
    expect(publish.mock.calls[0][2]).toEqual({ recordId: "a00000000000002" });
    expect(publish.mock.calls[1][2]).toEqual({ recordId: "a00000000000002" });
  });

  it("Space 키도 선택, 다른 키는 무시", () => {
    const card = q(mount(SD02), "property-card");
    card.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    card.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
    expect(publish).toHaveBeenCalledTimes(1);
  });

  it("WI-1.005 M-2: 선택은 LMS 만 — propertyselect CustomEvent 를 보내지 않는다", () => {
    const el = mount(SD02);
    const handler = jest.fn();
    el.addEventListener("propertyselect", handler);
    q(el, "property-card").click();
    expect(handler).not.toHaveBeenCalled();
    expect(publish).toHaveBeenCalledTimes(1);
  });

  it("Id 가 없으면 발행하지 않는다", () => {
    const card = q(mount({ ...SD02, Id: undefined }), "property-card");
    card.click();
    expect(publish).not.toHaveBeenCalled();
  });
});
