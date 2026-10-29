/**
 * WI-1.005 propertyDetail Jest (1차 검증) — AC-035·037·039·054 로직, AC-038/042 기반(편집 분기·저장 후 발행).
 * lightning-record-edit-form 은 Jest 스텁이라 실제 저장·콤보박스 동작은 WI-1.005 Playwright 가 최종 근거.
 */
import { createElement } from "lwc";
import PropertyDetail from "c/propertyDetail";
import { subscribe, unsubscribe, publish } from "lightning/messageService";
import { getRecord, notifyRecordUpdateAvailable } from "lightning/uiRecordApi";
import { getObjectInfo } from "lightning/uiObjectInfoApi";
import PROPERTY_SELECTED from "@salesforce/messageChannel/PropertySelected__c";
import PROPERTY_UPDATED from "@salesforce/messageChannel/PropertyUpdated__c";
const ShowToastEventName = "lightning__showtoast";

const record = (id, values) => ({
  id,
  apiName: "Property__c",
  fields: Object.fromEntries(
    Object.entries(values).map(([k, value]) => [k, { value }])
  )
});
const SD07 = record("a00000000000007", {
  Name: "제주 애월 전원주택",
  Address__c: "제주특별자치도 제주시 애월읍 애월해안로 77",
  City__c: "제주",
  Price__c: 1650000000,
  Bedrooms__c: 5,
  Bathrooms__c: 3,
  Status__c: "Under Contract",
  Picture_URL__c: "https://example.invalid/sd07.jpg"
});
const SD02 = record("a00000000000002", {
  Name: "해운대 오션뷰",
  Address__c: "부산광역시 해운대구 해운대해변로 22",
  City__c: "부산",
  Price__c: 850000000,
  Bedrooms__c: 3,
  Bathrooms__c: 2,
  Status__c: "Available",
  Picture_URL__c: "https://example.invalid/sd02.jpg"
});
const SD09 = record("a00000000000009", {
  Name: "송도 센트럴 오피스텔",
  Price__c: 350000000,
  Status__c: "Available",
  Picture_URL__c: null
});

// eslint-disable-next-line @lwc/lwc/no-async-operation
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
const mount = () => {
  const el = createElement("c-property-detail", { is: PropertyDetail });
  document.body.appendChild(el);
  return el;
};
const q = (el, id) => el.shadowRoot.querySelector(`[data-testid="${id}"]`);
const text = (el, id) => q(el, id).textContent.trim();
const selectHandler = () =>
  subscribe.mock.calls.find((c) => c[1] === PROPERTY_SELECTED)[2];
/** 카드 선택(LMS) → getRecord 응답 */
const select = async (rec) => {
  selectHandler()({ recordId: rec.id });
  await flush();
  getRecord.emit(rec);
  await flush();
};

describe("c-property-detail (WI-1.005)", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("AC-037 미선택 초기 상태 — detail-empty 문구, detail-name 없음", () => {
    const el = mount();
    expect(q(el, "property-detail")).not.toBeNull();
    expect(text(el, "detail-empty")).toBe(
      "매물을 선택하면 상세 정보가 표시됩니다."
    );
    expect(q(el, "detail-name")).toBeNull();
  });

  it("PropertySelected__c 를 구독하고 분리 시 해제한다", () => {
    const el = mount();
    expect(subscribe).toHaveBeenCalledTimes(1);
    expect(subscribe.mock.calls[0][1]).toBe(PROPERTY_SELECTED);
    document.body.removeChild(el);
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("AC-026/035 선택 수신 → getRecord(recordId, optionalFields) → 전체 속성·배지 (State 는 OQ-01 미확정이라 미표시)", async () => {
    const el = mount();
    await select(SD07);
    const config = getRecord.getLastConfig();
    expect(config.recordId).toBe(SD07.id);
    expect(config.optionalFields.map((f) => f.fieldApiName)).toEqual(
      expect.arrayContaining([
        "Name",
        "Address__c",
        "City__c",
        "Price__c",
        "Bedrooms__c",
        "Bathrooms__c",
        "Status__c",
        "Picture_URL__c"
      ])
    );
    expect(q(el, "detail-empty")).toBeNull();
    expect(text(el, "detail-name")).toBe("제주 애월 전원주택");
    expect(text(el, "detail-address")).toBe(
      "제주특별자치도 제주시 애월읍 애월해안로 77"
    );
    expect(text(el, "detail-city")).toBe("제주");
    expect(text(el, "detail-price")).toBe("₩1,650,000,000");
    expect(text(el, "detail-bedrooms")).toBe("5");
    expect(text(el, "detail-bathrooms")).toBe("3");
    const badge = q(el, "detail-status-badge");
    expect(badge.textContent.trim()).toBe("계약중");
    expect(badge.classList).toContain("slds-theme_warning");
    expect(badge.dataset.status).toBe("Under Contract");
    expect(q(el, "detail-image").getAttribute("src")).toBe(
      "https://example.invalid/sd07.jpg"
    );
    expect(q(el, "detail-image").getAttribute("alt")).toBe(
      "제주 애월 전원주택"
    );
    expect(q(el, "detail-state")).toBeNull();
  });

  it("AC-036 다른 카드 선택 → 패널 1개 내용 교체", async () => {
    const el = mount();
    await select(SD07);
    await select(SD02);
    expect(
      el.shadowRoot.querySelectorAll('[data-testid="property-detail"]').length
    ).toBe(1);
    expect(text(el, "detail-name")).toBe("해운대 오션뷰");
    expect(text(el, "detail-price")).toBe("₩850,000,000");
    expect(text(el, "detail-status-badge")).toBe("판매중");
    expect(q(el, "detail-status-badge").classList).toContain(
      "slds-theme_success"
    );
  });

  it("AC-039 사진 빈 값 → propertyPlaceholder, alt = 매물명", async () => {
    const el = mount();
    await select(SD09);
    const img = q(el, "detail-image");
    expect(img.getAttribute("src")).toContain("propertyPlaceholder");
    expect(img.getAttribute("alt")).toBe("송도 센트럴 오피스텔");
    expect(text(el, "detail-price")).toBe("₩350,000,000");
  });

  it("AC-039 이미지 로드 오류 → propertyPlaceholder, 다른 카드 선택 시 초기화", async () => {
    const el = mount();
    await select(SD07);
    q(el, "detail-image").dispatchEvent(new CustomEvent("error"));
    await flush();
    expect(q(el, "detail-image").getAttribute("src")).toContain(
      "propertyPlaceholder"
    );
    await select(SD02);
    expect(q(el, "detail-image").getAttribute("src")).toBe(
      "https://example.invalid/sd02.jpg"
    );
  });

  it("조회 오류 → 안내 문구(role=alert), detail-name 없음", async () => {
    const el = mount();
    selectHandler()({ recordId: SD02.id });
    await flush();
    getRecord.error();
    await flush();
    expect(q(el, "detail-name")).toBeNull();
    const alert = el.shadowRoot.querySelector('[role="alert"]');
    expect(alert.textContent).toContain("불러오지 못했습니다");
  });

  it("AC-054 상담원(updateable=false) → 편집 버튼·폼·상태 입력 0개", async () => {
    const el = mount();
    getObjectInfo.emit({ apiName: "Property__c", updateable: false });
    await select(SD02);
    expect(q(el, "detail-edit-button")).toBeNull();
    expect(q(el, "detail-edit-form")).toBeNull();
    expect(q(el, "detail-status-input")).toBeNull();
  });

  it("AC-054 objectInfo 응답 전에도 편집 UI 없음 (기본 false)", async () => {
    const el = mount();
    await select(SD02);
    expect(q(el, "detail-edit-button")).toBeNull();
  });

  it("AC-038 관리자(updateable=true) → 편집 버튼 → record-edit-form(recordId, Status 입력·저장 버튼)", async () => {
    const el = mount();
    getObjectInfo.emit({ apiName: "Property__c", updateable: true });
    await select(SD02);
    const button = q(el, "detail-edit-button");
    expect(button.label).toBe("편집");
    button.click();
    await flush();
    const form = q(el, "detail-edit-form");
    expect(form.recordId).toBe(SD02.id);
    expect(form.objectApiName).toBe("Property__c");
    expect(q(el, "detail-status-input").fieldName).toBe("Status__c");
    const fieldNames = [...form.querySelectorAll("lightning-input-field")].map(
      (f) => f.fieldName
    );
    expect(fieldNames).toEqual(["Name", "Price__c", "Status__c"]);
    const save = q(el, "detail-save-button");
    expect(save.type).toBe("submit");
    expect(save.label).toBe("저장");
    expect(q(el, "detail-edit-button")).toBeNull();
  });

  it("편집 중 다른 카드 선택 → 편집 취소", async () => {
    const el = mount();
    getObjectInfo.emit({ apiName: "Property__c", updateable: true });
    await select(SD02);
    q(el, "detail-edit-button").click();
    await flush();
    await select(SD07);
    expect(q(el, "detail-edit-form")).toBeNull();
    expect(q(el, "detail-edit-button")).not.toBeNull();
  });

  it("취소 → 폼 닫힘", async () => {
    const el = mount();
    getObjectInfo.emit({ apiName: "Property__c", updateable: true });
    await select(SD02);
    q(el, "detail-edit-button").click();
    await flush();
    const cancel = [
      ...q(el, "detail-edit-form").querySelectorAll("lightning-button")
    ].find((b) => b.label === "취소");
    cancel.click();
    await flush();
    expect(q(el, "detail-edit-form")).toBeNull();
  });

  it("AC-042 저장 성공 → notifyRecordUpdateAvailable + PropertyUpdated__c { recordId } 발행 + 성공 토스트, 폼 닫힘", async () => {
    const el = mount();
    const toast = jest.fn();
    el.addEventListener(ShowToastEventName, toast);
    getObjectInfo.emit({ apiName: "Property__c", updateable: true });
    await select(SD02);
    q(el, "detail-edit-button").click();
    await flush();
    const form = q(el, "detail-edit-form");
    form.dispatchEvent(new CustomEvent("submit"));
    await flush();
    expect(q(el, "detail-save-button").disabled).toBe(true);
    form.dispatchEvent(new CustomEvent("success", { detail: { id: SD02.id } }));
    await flush();
    expect(notifyRecordUpdateAvailable).toHaveBeenCalledWith([
      { recordId: SD02.id }
    ]);
    expect(publish).toHaveBeenCalledTimes(1);
    expect(publish.mock.calls[0][1]).toBe(PROPERTY_UPDATED);
    expect(publish.mock.calls[0][2]).toEqual({ recordId: SD02.id });
    expect(toast).toHaveBeenCalledTimes(1);
    expect(toast.mock.calls[0][0].detail).toMatchObject({
      title: "저장되었습니다.",
      variant: "success"
    });
    expect(q(el, "detail-edit-form")).toBeNull();
  });

  it("notifyRecordUpdateAvailable 실패해도 목록 갱신 발행은 계속", async () => {
    notifyRecordUpdateAvailable.mockRejectedValueOnce(new Error("x"));
    const el = mount();
    getObjectInfo.emit({ apiName: "Property__c", updateable: true });
    await select(SD02);
    q(el, "detail-edit-button").click();
    await flush();
    q(el, "detail-edit-form").dispatchEvent(new CustomEvent("success"));
    await flush();
    expect(publish).toHaveBeenCalledTimes(1);
  });

  it("저장 오류 → error 토스트, 발행 없음, 폼 유지", async () => {
    const el = mount();
    const toast = jest.fn();
    el.addEventListener(ShowToastEventName, toast);
    getObjectInfo.emit({ apiName: "Property__c", updateable: true });
    await select(SD02);
    q(el, "detail-edit-button").click();
    await flush();
    q(el, "detail-edit-form").dispatchEvent(
      new CustomEvent("error", { detail: { message: "필수 항목" } })
    );
    await flush();
    expect(publish).not.toHaveBeenCalled();
    expect(toast.mock.calls[0][0].detail).toMatchObject({
      title: "저장하지 못했습니다.",
      message: "필수 항목",
      variant: "error"
    });
    expect(q(el, "detail-edit-form")).not.toBeNull();
    expect(q(el, "detail-save-button").disabled).toBe(false);
  });
});
