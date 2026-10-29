import { LightningElement, api, wire } from "lwc";
import { refreshApex } from "@salesforce/apex";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import {
  subscribe,
  unsubscribe,
  MessageContext
} from "lightning/messageService";
import { getRecords } from "lightning/uiRecordApi";
import PROPERTY_FILTER from "@salesforce/messageChannel/PropertyFilter__c";
import PROPERTY_SELECTED from "@salesforce/messageChannel/PropertySelected__c";
import PROPERTY_UPDATED from "@salesforce/messageChannel/PropertyUpdated__c";
import NAME from "@salesforce/schema/Property__c.Name";
import ADDRESS from "@salesforce/schema/Property__c.Address__c";
import CITY from "@salesforce/schema/Property__c.City__c";
import PRICE from "@salesforce/schema/Property__c.Price__c";
import BEDROOMS from "@salesforce/schema/Property__c.Bedrooms__c";
import BATHROOMS from "@salesforce/schema/Property__c.Bathrooms__c";
import STATUS from "@salesforce/schema/Property__c.Status__c";
import PICTURE_URL from "@salesforce/schema/Property__c.Picture_URL__c";
import getProperties from "@salesforce/apex/PropertyController.getProperties";
import { resultCountLabel, TEXT } from "c/propertyUtils";

const LOAD_ERROR_MESSAGE = "매물 정보를 불러오지 못했습니다.";
const FILTER_FIELDS = ["keyword", "minPrice", "maxPrice", "minBedrooms"];
/** AC-044: 카드에 표시되는 필드 — LDS 레코드 캐시와 비교해 목록(Apex cacheable)이 낡았는지 판단 */
const CARD_FIELDS = [
  NAME,
  ADDRESS,
  CITY,
  PRICE,
  BEDROOMS,
  BATHROOMS,
  STATUS,
  PICTURE_URL
];

/** LMS 메시지 → Apex PropertyFilter 와 같은 모양의 새 객체 (알 수 없는 필드는 버림) */
const toFilter = (message = {}) =>
  FILTER_FIELDS.reduce((acc, field) => {
    const value = message?.[field];
    acc[field] = value === undefined || value === "" ? null : value;
    return acc;
  }, {});

const normalize = (value) => {
  return value === undefined || value === null || value === ""
    ? null
    : String(value);
};

/**
 * WI-1.003 매물 목록 (MWI-1.003 목업 승계 — ENHANCED) + WI-1.004 서버 측 필터 (ENHANCED) + WI-1.005 (ENHANCED).
 * - 데이터: @wire(PropertyController.getProperties, { filter }) (cacheable, USER_MODE — 서버 측 조건)
 * - WI-1.004: LMS PropertyFilter__c 구독 → this.filter = 새 객체 → @wire 재호출 (스피너 표시)
 * - 반응형 그리드: lightning-layout 모바일 1열 / 태블릿 2열 / 데스크톱 3열
 * - result-count `{n}건`, empty-state, loading-spinner(`로딩 중`), 오류 시 error 토스트 + error-state (AC-024/025/046/047)
 * - REQ-011: @api refresh() → refreshApex.
 *   (ENHANCED 2026-10-29 WI-1.005) LMS PropertyUpdated__c 구독 → refresh() (현재 filter 유지 — AC-042/043)
 * - (ENHANCED 2026-10-29 WI-1.005) 선택 하이라이트: LMS PropertySelected__c 구독 (목업 CustomEvent 경로 제거 — code-review M-2)
 * - AC-044 (I-10): ① 탭 재진입(재연결) 시 refresh + ② LDS getRecords(표시 중 레코드)로 레코드 캐시 변경 감지 →
 *   카드 값과 다르면 refresh. 표준 레코드 페이지 편집은 LDS 캐시를 갱신하므로, 탐색 페이지가 캐시돼
 *   connectedCallback 이 다시 불리지 않거나(컴포넌트 재사용) 새 인스턴스가 Apex 캐시 값을 받아도 새 값으로 갱신된다.
 */
export default class PropertyList extends LightningElement {
  /** 서버 조회 조건 (Apex PropertyFilter 와 같은 필드) — LMS PropertyFilter__c 수신 시 새 객체로 교체 */
  filter = {};

  /** 선택 카드 하이라이트 — LMS PropertySelected__c 수신 값 (WI-1.005) */
  selectedId;

  records = [];
  isLoading = true;
  hasError = false;
  wasDisconnected = false;
  wiredResult;
  subscription = null;
  selectedSubscription = null;
  updatedSubscription = null;
  /** AC-044: getRecords 설정 (표시 중 레코드 Id 가 바뀔 때만 교체 → 불필요한 재요청 방지) */
  ldsRecords;
  ldsKey = "";
  ldsData;
  lastStaleCheck = "";
  refreshPromise = null;
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
      this.trackLdsRecords(data);
      this.checkStale();
    } else if (error) {
      this.records = [];
      this.hasError = true;
      this.isLoading = false;
      this.showLoadError();
    }
  }

  /** AC-044: 표시 중 레코드의 LDS 레코드 캐시 — 표준 레코드 페이지·상세 패널 저장 시 다시 emit 된다 */
  @wire(getRecords, { records: "$ldsRecords" })
  wiredLdsRecords({ data }) {
    if (data) {
      this.ldsData = data;
      this.checkStale();
    }
  }

  trackLdsRecords(data) {
    const recordIds = data.map((p) => p.Id).filter(Boolean);
    const key = recordIds.join(",");
    if (key === this.ldsKey) {
      return;
    }
    this.ldsKey = key;
    this.ldsRecords = recordIds.length
      ? [{ recordIds, optionalFields: CARD_FIELDS }]
      : undefined;
  }

  /** LDS 값과 카드 값이 다르면(목록이 낡음) 한 번 refresh. 같은 LDS 스냅샷으로는 반복하지 않는다(루프 방지) */
  checkStale() {
    const results = this.ldsData?.results;
    if (!results || !this.records.length || this.isLoading) {
      return;
    }
    const byId = new Map(this.records.map((p) => [p.Id, p]));
    const signature = [];
    let stale = false;
    for (const item of results) {
      const lds = item?.result;
      const card = lds && byId.get(lds.id);
      if (!card) {
        continue;
      }
      for (const field of CARD_FIELDS) {
        const ldsField = lds.fields?.[field.fieldApiName];
        if (ldsField === undefined) {
          continue; // FLS 로 받지 못한 필드는 비교하지 않음
        }
        const value = normalize(ldsField.value);
        signature.push(`${lds.id}.${field.fieldApiName}=${value}`);
        if (value !== normalize(card[field.fieldApiName])) {
          stale = true;
        }
      }
    }
    const key = signature.join("|");
    if (!stale || key === this.lastStaleCheck) {
      return;
    }
    this.lastStaleCheck = key;
    this.refresh();
  }

  connectedCallback() {
    this.subscribeToFilter();
    this.subscribeToSelection();
    // AC-044: 탭 재진입(재연결) 시 cacheable 캐시의 이전 값 방지
    // 최초 연결 시에는 @wire 가 이미 조회하므로 재조회하지 않는다
    if (this.wasDisconnected && this.wiredResult) {
      this.refresh().catch(() => {});
    }
  }

  disconnectedCallback() {
    this.wasDisconnected = true;
    unsubscribe(this.subscription);
    this.subscription = null;
    unsubscribe(this.selectedSubscription);
    this.selectedSubscription = null;
    unsubscribe(this.updatedSubscription);
    this.updatedSubscription = null;
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

  /** WI-1.005: 카드 선택 하이라이트(PropertySelected__c) + 저장 후 목록 갱신(PropertyUpdated__c) */
  subscribeToSelection() {
    if (!this.selectedSubscription) {
      this.selectedSubscription = subscribe(
        this.messageContext,
        PROPERTY_SELECTED,
        (message) => {
          this.selectedId = message?.recordId;
        }
      );
    }
    if (!this.updatedSubscription) {
      this.updatedSubscription = subscribe(
        this.messageContext,
        PROPERTY_UPDATED,
        () => this.refresh() // AC-042/043: 현재 filter 유지, refreshApex 만
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

  /** REQ-011: PropertyUpdated__c 수신·탭 재진입·LDS 변경 감지 시 호출. 진행 중이면 같은 요청을 공유(중복 조회 방지) */
  @api
  refresh() {
    if (!this.wiredResult) {
      return Promise.resolve();
    }
    if (!this.refreshPromise) {
      this.refreshPromise = this.doRefresh().finally(() => {
        this.refreshPromise = null;
      });
    }
    return this.refreshPromise;
  }

  async doRefresh() {
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
}
