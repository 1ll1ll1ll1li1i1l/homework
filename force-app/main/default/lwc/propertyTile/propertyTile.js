import { LightningElement, api, wire } from "lwc";
import { publish, MessageContext } from "lightning/messageService";
import PROPERTY_SELECTED from "@salesforce/messageChannel/PropertySelected__c";
import PLACEHOLDER from "@salesforce/resourceUrl/propertyPlaceholder";
import {
  formatKrw,
  statusLabel,
  badgeClass,
  roomsLabel
} from "c/propertyUtils";

/**
 * WI-1.002 매물 카드 (MWI-1.002 목업 승계 — ENHANCED).
 * - @api property: Property__c 레코드 모양 { Id, Name, Address__c, City__c, Price__c, Bedrooms__c, Bathrooms__c, Status__c, Picture_URL__c }
 * - 가격: lightning-formatted-number (KRW 원 단위 전체 금액, 축약 없음 — AC-023)
 * - 배지: 상태 → SLDS 배지 클래스 + data-status (AC-021, CK-14), 라벨 텍스트로 색상 외 전달
 * - 사진 빈 값 / 로드 오류 → 정적 리소스 propertyPlaceholder (AC-022)
 * - 클릭·Enter(·Space) → LMS PropertySelected__c { recordId } 발행 (AD-01, 구독은 WI-1.005 propertyDetail)
 * - (ENHANCED 2026-10-29 WI-1.005, code-review M-2) 안 A(LMS) 확정 — 목업 호환 CustomEvent 'propertyselect' 제거, LMS 만 사용
 */
export default class PropertyTile extends LightningElement {
  _property = {};

  @api
  get property() {
    return this._property;
  }
  set property(value) {
    this._property = value || {};
    this.imageFailed = false; // 다른 레코드로 바뀌면 대체 이미지 상태 초기화
  }

  /** 목업/목록 하이라이트용 (선택 카드 테두리, aria-pressed) */
  @api selected = false;

  imageFailed = false;

  /**
   * AC-068: 텍스트 블록 끝의 공백 텍스트 노드. LWC 는 요소 사이 공백을 지우므로, axe(label-content-name-mismatch)가
   * 보이는 텍스트를 이어 붙일 때 "서울침실" 처럼 단어가 붙지 않게 한다. 화면 표시에는 영향 없음
   */
  space = " ";

  @wire(MessageContext)
  messageContext;

  get imageUrl() {
    return !this.imageFailed && this.property?.Picture_URL__c
      ? this.property.Picture_URL__c
      : PLACEHOLDER;
  }

  get priceLabel() {
    return formatKrw(this.property?.Price__c);
  }

  get rooms() {
    return roomsLabel(this.property);
  }

  get statusText() {
    return statusLabel(this.property?.Status__c);
  }

  get statusBadgeClass() {
    return badgeClass(this.property?.Status__c);
  }

  /** 주소 줄 — 화면 표시와 aria-label 이 같은 문자열을 쓰도록 공용 */
  get addressLine() {
    return `${this.property?.Address__c ?? ""} · ${this.property?.City__c ?? ""}`;
  }

  /**
   * AC-048: "매물명, ₩가격" 으로 시작.
   * (ENHANCED 2026-10-29 WI-1.005, AC-068 axe label-content-name-mismatch) 보이는 텍스트 전체(매물명·가격·주소·침실/욕실·상태)를
   * 같은 순서·같은 문자열로 포함 — 접근 가능한 이름이 보이는 라벨을 포함해야 한다(WCAG 2.5.3).
   */
  get ariaLabel() {
    const name = this.property?.Name ?? "";
    return [
      name,
      this.priceLabel,
      this.addressLine,
      this.rooms,
      this.statusText
    ]
      .filter((part) => part && part.trim())
      .join(", ");
  }

  get ariaPressed() {
    return this.selected ? "true" : "false";
  }

  get cardClass() {
    return `slds-card property-card${this.selected ? " property-card_selected" : ""}`;
  }

  handleImageError() {
    this.imageFailed = true; // AC-022
  }

  handleKeydown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.handleSelect();
    }
  }

  handleSelect() {
    const recordId = this.property?.Id;
    if (!recordId) {
      return;
    }
    publish(this.messageContext, PROPERTY_SELECTED, { recordId });
  }
}
