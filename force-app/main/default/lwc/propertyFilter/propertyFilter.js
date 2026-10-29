import { LightningElement, wire } from "lwc";
import { publish, MessageContext } from "lightning/messageService";
import PROPERTY_FILTER from "@salesforce/messageChannel/PropertyFilter__c";
import { BEDROOM_OPTIONS } from "c/propertyUtils";

const DEBOUNCE_MS = 300; // NFR-002, AC-027/034/070
/** 숫자 형태만 (부호·소수 허용 → 음수/비정수는 reportValidity 로 aria-invalid). 문자·축약(k/m/b)·지수(e) 불허 */
const NUMERIC_PATTERN = /^-?\d+(\.\d+)?$/;

function toNumberOrNull(value) {
  return value === "" || value === null || value === undefined
    ? null
    : Number(value);
}

/**
 * WI-1.004 검색·필터 패널 (MWI-1.004 목업 승계 — ENHANCED).
 * - 입력 → 300ms 디바운스 → LMS PropertyFilter__c { keyword, minPrice, maxPrice, minBedrooms } 발행
 * - 초기화(filter-reset) 는 디바운스 없이 즉시 발행 (AC-033)
 * - 음수·비정수 가격은 reportValidity 실패(aria-invalid) → 값 반영·발행 안 함 (AC-059)
 * - min > max 처리(filter-price-error)는 CK-03 확정 시에만 구현 (현재: 서버 조건 그대로 → 0건)
 * - 상태 필터(판매완료 제외 등) 없음 (D-17)
 */
export default class PropertyFilter extends LightningElement {
  keyword = "";
  minPrice = "";
  maxPrice = "";
  minBedrooms = "0";
  bedroomOptions = BEDROOM_OPTIONS;
  timer;
  /** code-review WI-1.004 L-3: clearInput 의 다음 틱 복원 타이머 — 분리 시 정리 */
  clearTimers = new Set();

  @wire(MessageContext)
  messageContext;

  handleKeyword(event) {
    this.keyword = event.target.value ?? "";
    this.schedule();
  }

  handleMinPrice(event) {
    this.handlePrice(event.target, "minPrice");
  }

  handleMaxPrice(event) {
    this.handlePrice(event.target, "maxPrice");
  }

  /**
   * 가격 입력 공통 처리 (AC-059).
   * - 빈 값 → 조건 해제
   * - 숫자 형태(음수·소수 포함) → reportValidity: 음수/비정수는 aria-invalid + 메시지, 반영·발행 안 함
   * - 비숫자(abc, lightning-input type=number 가 허용하는 k/m/b 축약 1k·1b 등) → 입력값을 빈 문자열로 지우고
   *   발행 안 함 (이전에 적용된 값이 있었다면 해제 반영)
   */
  handlePrice(input, field) {
    const raw = String(input.value ?? "").trim();
    // lightning-input 은 해석 불가 입력("b" 등)을 value "" + validity.valid=false 로 보고하고 화면에는 남겨 둔다
    const unparsable = raw === "" && input.validity?.valid === false;
    if (unparsable || (raw !== "" && !NUMERIC_PATTERN.test(raw))) {
      this.clearInput(input);
      if (this[field] !== "") {
        this[field] = "";
        this.schedule();
      }
      return;
    }
    if (this.isValid(input)) {
      this[field] = raw;
      this.schedule();
    }
  }

  /**
   * 입력 요소를 빈 문자열로 비운다. lightning-input 은 이미 value "" 로 보고 중일 때 같은 값 대입을
   * 무시하므로(화면에는 "b" 등이 남음) 임시 값으로 바꾼 뒤 다음 틱에 "" 로 되돌려 화면을 동기화한다.
   */
  clearInput(input) {
    input.value = "0";
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    const id = setTimeout(() => {
      this.clearTimers.delete(id);
      input.value = "";
      input.setCustomValidity("");
      input.reportValidity();
    }, 0);
    this.clearTimers.add(id);
  }

  handleBedrooms(event) {
    this.minBedrooms = event.detail.value;
    this.schedule();
  }

  handleReset() {
    clearTimeout(this.timer);
    this.keyword = "";
    this.minPrice = "";
    this.maxPrice = "";
    this.minBedrooms = "0";
    // 입력 컴포넌트의 값·오류 표시도 함께 해제 (음수 입력 후 초기화 시 aria-invalid 해제)
    this.template.querySelectorAll("lightning-input").forEach((input) => {
      input.value = "";
      input.setCustomValidity("");
      input.reportValidity();
    });
    this.publishNow(); // AC-033 즉시 반영
  }

  /** 음수 → reportValidity false(aria-invalid) → 반영·발행 안 함 (AC-059). 음수는 명시적으로도 차단 */
  isValid(input) {
    const valid = input.reportValidity();
    const value = toNumberOrNull(input.value);
    const negative = value !== null && (Number.isNaN(value) || value < 0);
    return valid !== false && !negative;
  }

  schedule() {
    clearTimeout(this.timer);
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    this.timer = setTimeout(() => this.publishNow(), DEBOUNCE_MS);
  }

  /** 메시지 필드명 = Apex PropertyFilter @AuraEnabled 속성명 → propertyList 가 그대로 @wire filter 로 사용 */
  publishNow() {
    const keyword = (this.keyword ?? "").trim(); // 공백만 → 조건 없음 (CK-04 잠정, 서버도 trim)
    publish(this.messageContext, PROPERTY_FILTER, {
      keyword: keyword || null,
      minPrice: toNumberOrNull(this.minPrice),
      maxPrice: toNumberOrNull(this.maxPrice),
      minBedrooms: Number(this.minBedrooms) || null
    });
  }

  disconnectedCallback() {
    clearTimeout(this.timer);
    this.clearTimers.forEach((id) => clearTimeout(id));
    this.clearTimers.clear();
  }
}