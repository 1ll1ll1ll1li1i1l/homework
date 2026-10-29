import { LightningElement, api, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getProperties from '@salesforce/apex/PropertyController.getProperties';
import { resultCountLabel, filterProperties, TEXT } from 'c/propertyUtils';

const LOAD_ERROR_MESSAGE = '매물 정보를 불러오지 못했습니다.';

/**
 * WI-1.003 매물 목록 (MWI-1.003 목업 승계 — ENHANCED).
 * - 데이터: @wire(PropertyController.getProperties, { filter }) (cacheable, WITH USER_MODE — 서버 측)
 * - 반응형 그리드: lightning-layout 모바일 1열 / 태블릿 2열 / 데스크톱 3열
 * - result-count `{n}건`, empty-state, loading-spinner(`로딩 중`), 오류 시 error 토스트 (AC-024/025/046/047)
 * - REQ-011: @api refresh() → refreshApex. PropertyUpdated__c 채널·구독은 WI-1.005 소유(I-02) — 여기서 만들지 않음
 * - AC-044: 탭 재진입(재연결) 시 refresh (I-10)
 */
export default class PropertyList extends LightningElement {
    /** 서버 조회 조건 — WI-1.004 에서 LMS PropertyFilter__c 구독으로 갱신 */
    filter = {};

    /** 선택 카드 하이라이트 (목업 컨테이너 propertyExplorer — WI-1.005 에서 LMS 로 대체 검토) */
    @api selectedId;

    /**
     * TODO(WI-1.004): 임시 클라이언트 측 필터. 목업 컨테이너(propertyExplorer) 가 filterchange 결과를 넘긴다.
     * WI-1.004 에서 서버 조건(PropertyController) + LMS PropertyFilter__c 로 교체하고 이 속성은 제거한다.
     */
    @api
    get clientFilter() {
        return this._clientFilter;
    }
    set clientFilter(value) {
        this._clientFilter = value ? { ...value } : {};
    }
    _clientFilter = {};

    records = [];
    isLoading = true;
    hasError = false;
    wasDisconnected = false;
    wiredResult;
    emptyText = TEXT.emptyResult;

    @wire(getProperties, { filter: '$filter' })
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
            this.dispatchEvent(new ShowToastEvent({ title: LOAD_ERROR_MESSAGE, variant: 'error' }));
        }
    }

    connectedCallback() {
        // AC-044: 탭 재진입(재연결) 시 cacheable 캐시의 이전 값 방지 (컴포넌트 재사용 시 동작은 I-10 확인 필요)
        // 최초 연결 시에는 @wire 가 이미 조회하므로 재조회하지 않는다
        if (this.wasDisconnected && this.wiredResult) {
            this.refresh();
        }
    }

    disconnectedCallback() {
        this.wasDisconnected = true;
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
        } finally {
            this.isLoading = false;
        }
    }

    get properties() {
        return filterProperties(this.records || [], this._clientFilter);
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

    get isEmpty() {
        return !this.isLoading && !this.hasError && this.count === 0;
    }

    get ariaBusy() {
        return this.isLoading ? 'true' : 'false';
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
        this.dispatchEvent(new CustomEvent('propertyselect', { detail: { recordId, property } }));
    }
}