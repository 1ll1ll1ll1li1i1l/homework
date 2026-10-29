import { LightningElement, api, wire } from "lwc";
import { refreshApex } from "@salesforce/apex";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import {
  subscribe,
  unsubscribe,
  MessageContext
} from "lightning/messageService";
import PROPERTY_FILTER from "@salesforce/messageChannel/PropertyFilter__c";
import getProperties from "@salesforce/apex/PropertyController.getProperties";
import { resultCountLabel, TEXT } from "c/propertyUtils";

const LOAD_ERROR_MESSAGE = "매물 정보를 불러오지 못했습니다.";
const FILTER_FIELDS = ["keyword", "minPrice", "maxPrice", "minBedrooms"];

/** LMS 메시지 → Apex PropertyFilter 와 같은 모양의 새 객체 (알 수 없는 필드는 버림) */
const toFilter = (message = {}) =>
  FILTER_FIELDS.reduce((acc, field) => {
    const value = message?.[field];
    acc[field] = value === undefined || value === "" ? null : value;
    return acc;
  }, {});

/**
 * WI-1.003 매물 목록 (MWI-1.003 목업 승계 — ENHANCED) + WI-1.004 서버 측 필터 (ENHANCED).
 * - 데이터: @wire(PropertyController.getProperties, { filter }) (cacheable, USER_MODE — 서버 측 조건)
 * - WI-1.004: LMS PropertyFilter__c 구독 → this.filter = 새 객체 → @wire 재호출 (스피너 표시)
 * - 반응형 그리드: lightning-layout 모바일 1열 / 태블릿 2열 / 데스크톱 3열
 * - result-count `{n}건`, empty-state, loading-spinner(`로딩 중`), 오류 시 error 토스트 + error-state (AC-024/025/046/047)
 * - REQ-011: @api refresh() → refreshApex. PropertyUpdated__c 채널·구독은 WI-1.005 소유(I-02) — 여기서 만들지 않음
 * - AC-044: 탭 재진입(재연결) 시 refresh (I-10)
 */
export default class PropertyList extends LightningElement {
  /** 서버 조회 조건 (Apex PropertyFilter 와 같은 필드) — LMS PropertyFilter__c 수신 시 새 객체로 교체 */
  filter = {};

  /** 선택 카드 하이라이트 (목업 컨테이너 propertyExplorer — WI-1.005 에서 LMS 로 대체 검토) */
  @api selectedId;

  records = [];
  isLoading = true;
  hasError = false;
  wasDisconnected = false;
  wiredResult;
  subscription = null;
  emptyText = TEXT.emptyResult;

  @wire(MessageContext)
  messageContext;

  @wire(getProperties, { filter: "$filter" })
  wiredProperties(result) {
    this.wiredResult = result;
    const { data, error } = result;
    if (data) {
      this.records = data;
      this.hasError = false;
      this.isLoading = false;
    } else if (error) {
      this.records = [];
      this.hasError = true;
      this.isLoading = false;
      this.showLoadError();
    }
  }

  connectedCallback() {
    this.subscribeToFilter();
    // AC-044: 탭 재진입(재연결) 시 cacheable 캐시의 이전 값 방지 (컴포넌트 재사용 시 동작은 I-10 확인 필요)
    // 최초 연결 시에는 @wire 가 이미 조회하므로 재조회하지 않는다
    if (this.wasDisconnected && this.wiredResult) {
      this.refresh().catch(() => {});
    }
  }

  disconnectedCallback() {
    this.wasDisconnected = true;
    unsubscribe(this.subscription);
    this.subscription = null;
  }

  subscribeToFilter() {
    if (!this.subscription) {
      this.subscription = subscribe(
        this.messageContext,
        PROPERTY_FILTER,
        (message) => this.handleFilterMessage(message)
      );
    }
  }

  /** WI-1.004: 필터 수신 → 새 객체로 교체해 @wire 재호출. 같은 조건이면 재조회·스피너 없음(스피너 고착 방지) */
  handleFilterMessage(message) {
    const next = toFilter(message);
    if (JSON.stringify(next) === JSON.stringify(toFilter(this.filter))) {
      return;
    }
    this.isLoading = true;
    this.filter = next;
  }

  /** REQ-011: WI-1.005 의 PropertyUpdated__c 구독 핸들러(또는 컨테이너)가 호출 */
  @api
  async refresh() {
    if (!this.wiredResult) {
      return;
    }
    this.isLoading = true;
    try {
      await refreshApex(this.wiredResult);
    } catch {
      // code-review WI-1.003 M-1: 재조회 실패도 오류 상태 + error 토스트
      this.records = [];
      this.hasError = true;
      this.showLoadError();
    } finally {
      this.isLoading = false;
    }
  }

  showLoadError() {
    this.dispatchEvent(
      new ShowToastEvent({ title: LOAD_ERROR_MESSAGE, variant: "error" })
    );
  }

  get properties() {
    return this.records || [];
  }

  get items() {
    return this.properties.map((property) => ({
      property,
      selected: property.Id === this.selectedId
    }));
  }

  get count() {
    return this.properties.length;
  }

  get countLabel() {
    return resultCountLabel(this.count);
  }

  /** code-review WI-1.003 L-1: 오류 시 result-count(`0건`) 대신 오류 안내만 표시 */
  get showCount() {
    return !this.hasError;
  }

  get isEmpty() {
    return !this.isLoading && !this.hasError && this.count === 0;
  }

  get ariaBusy() {
    return this.isLoading ? "true" : "false";
  }

  /** AC-047: 오류 시 빈 흰 화면 대신 안내 문구 (토스트와 함께) */
  get showError() {
    return !this.isLoading && this.hasError;
  }

  get errorText() {
    return LOAD_ERROR_MESSAGE;
  }

  /**
   * 타일의 propertyselect 를 컨테이너로 전달 (선택 레코드 포함 — 상세 패널 표시용).
   * TODO(WI-1.005): 안 A(LMS PropertySelected__c) 확정 시 이 핸들러와 타일의 CustomEvent 를 제거 (code-review M-2).
   */
  handleSelect(event) {
    const recordId = event.detail?.recordId;
    const property = this.records.find((p) => p.Id === recordId) ?? null;
    this.dispatchEvent(
      new CustomEvent("propertyselect", { detail: { recordId, property } })
    );
  }
}