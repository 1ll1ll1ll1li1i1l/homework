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
import PROPERTY_UPDATED from "@salesforce/messageChannel/PropertyUpdated__c";
import PLACEHOLDER from "@salesforce/resourceUrl/propertyPlaceholder";
import PROPERTY_OBJECT from "@salesforce/schema/Property__c";
import NAME from "@salesforce/schema/Property__c.Name";
import ADDRESS from "@salesforce/schema/Property__c.Address__c";
import CITY from "@salesforce/schema/Property__c.City__c";
import STATE from "@salesforce/schema/Property__c.State__c";
import PRICE from "@salesforce/schema/Property__c.Price__c";
import BEDROOMS from "@salesforce/schema/Property__c.Bedrooms__c";
import BATHROOMS from "@salesforce/schema/Property__c.Bathrooms__c";
import STATUS from "@salesforce/schema/Property__c.Status__c";
import PICTURE_URL from "@salesforce/schema/Property__c.Picture_URL__c";
import { formatKrw, statusLabel, badgeClass, TEXT } from "c/propertyUtils";

/** OQ-01/CK-11: 시/도(State__c) 표시 확정 시 true → detail-state 렌더 */
const SHOW_STATE = false;
const SAVE_SUCCESS = "저장되었습니다.";
const SAVE_ERROR = "저장하지 못했습니다.";
const LOAD_ERROR = "매물 상세 정보를 불러오지 못했습니다.";

/** 상세 표시 필드 — optionalFields 로 요청해 FLS 미허용 필드가 있어도 레코드 조회는 실패하지 않게 한다 */
const FIELDS = [
  NAME,
  ADDRESS,
  CITY,
  PRICE,
  BEDROOMS,
  BATHROOMS,
  STATUS,
  PICTURE_URL
];
const OPTIONAL_FIELDS = SHOW_STATE ? [...FIELDS, STATE] : FIELDS;

/**
 * WI-1.005 상세 패널 (MWI-1.005 목업 승계 — ENHANCED, 안 A: LMS).
 * - LMS PropertySelected__c 구독 → recordId → LDS getRecord (URL 변경 없음 — AC-026/035/036)
 * - 미선택 시 detail-empty 문구 (AC-037), 사진 빈 값·오류 → propertyPlaceholder (AC-039)
 * - 편집: getObjectInfo.updateable === true(관리자)일 때만 detail-edit-button → lightning-record-edit-form
 *   (상담원은 버튼·폼·상태 입력 0개 — AC-054)
 * - 저장 성공: notifyRecordUpdateAvailable(상세) + LMS PropertyUpdated__c 발행(목록 refreshApex) + 성공 토스트
 *   (REQ-011, AC-042/043)
 */
export default class PropertyDetail extends LightningElement {
  recordId;
  isEditing = false;
  canEdit = false;
  imageFailed = false;
  isSaving = false;
  subscription = null;
  emptyText = TEXT.detailEmpty;
  loadErrorText = LOAD_ERROR;

  @wire(MessageContext)
  messageContext;

  @wire(getObjectInfo, { objectApiName: PROPERTY_OBJECT })
  wiredObjectInfo({ data }) {
    this.canEdit = data?.updateable === true; // 상담원(읽기 전용) false — AC-054
  }

  @wire(getRecord, { recordId: "$recordId", optionalFields: OPTIONAL_FIELDS })
  record;

  connectedCallback() {
    if (!this.subscription) {
      this.subscription = subscribe(
        this.messageContext,
        PROPERTY_SELECTED,
        (message) => this.handleSelected(message)
      );
    }
  }

  disconnectedCallback() {
    unsubscribe(this.subscription);
    this.subscription = null;
  }

  handleSelected(message) {
    const recordId = message?.recordId;
    if (!recordId) {
      return;
    }
    if (recordId !== this.recordId) {
      this.imageFailed = false;
      this.isEditing = false; // 다른 카드 선택 시 편집 취소
    }
    this.recordId = recordId;
  }

  get hasSelection() {
    return !!this.recordId;
  }

  get data() {
    return this.record?.data;
  }

  get isLoaded() {
    return !!this.data;
  }

  get isLoading() {
    return this.hasSelection && !this.data && !this.record?.error;
  }

  get hasLoadError() {
    return this.hasSelection && !this.data && !!this.record?.error;
  }

  field(ref) {
    return this.data ? getFieldValue(this.data, ref) : undefined;
  }

  get name() {
    return this.field(NAME) ?? "";
  }

  get address() {
    return this.field(ADDRESS);
  }

  get city() {
    return this.field(CITY);
  }

  get state() {
    return this.field(STATE);
  }

  get bedrooms() {
    return this.field(BEDROOMS);
  }

  get bathrooms() {
    return this.field(BATHROOMS);
  }

  get status() {
    return this.field(STATUS);
  }

  get showState() {
    return SHOW_STATE;
  }

  get priceLabel() {
    return formatKrw(this.field(PRICE));
  }

  get statusText() {
    return statusLabel(this.status);
  }

  get statusBadgeClass() {
    return badgeClass(this.status);
  }

  get imageUrl() {
    const url = this.field(PICTURE_URL);
    return !url || this.imageFailed ? PLACEHOLDER : url;
  }

  get showEditButton() {
    return this.canEdit && !this.isEditing;
  }

  get showEditForm() {
    return this.canEdit && this.isEditing;
  }

  handleImageError() {
    this.imageFailed = true; // AC-039
  }

  handleEdit() {
    this.isEditing = true;
  }

  handleCancel() {
    this.isEditing = false;
    this.isSaving = false;
  }

  handleSubmit() {
    this.isSaving = true;
  }

  /** lightning-record-edit-form onsuccess — 상세(LDS)·목록(LMS) 동시 갱신, 새로고침 없음 (AC-042) */
  async handleSuccess() {
    const recordId = this.recordId;
    this.isEditing = false;
    this.isSaving = false;
    try {
      await notifyRecordUpdateAvailable([{ recordId }]);
    } catch {
      // 상세는 record-edit-form 저장으로 LDS 캐시가 이미 갱신됨 — 목록 갱신·토스트는 계속 진행
    }
    publish(this.messageContext, PROPERTY_UPDATED, { recordId });
    this.dispatchEvent(
      new ShowToastEvent({ title: SAVE_SUCCESS, variant: "success" })
    );
  }

  handleError(event) {
    this.isSaving = false;
    this.dispatchEvent(
      new ShowToastEvent({
        title: SAVE_ERROR,
        message: event?.detail?.message ?? "",
        variant: "error"
      })
    );
  }
}