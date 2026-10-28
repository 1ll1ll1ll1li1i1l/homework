import { LightningElement } from 'lwc';
import { BEDROOM_OPTIONS } from 'c/propertyUtils';

const DEBOUNCE_MS = 300; // NFR-002, AC-027/034

/**
 * MWI-1.004 검색·필터 패널 (목업).
 * - 목업: 300ms 디바운스 후 CustomEvent 'filterchange' { keyword, minPrice, maxPrice, minBedrooms }
 * - 본 개발(WI-1.004): 같은 지점(publishNow)에서 LMS PropertyFilter__c 발행으로 교체
 */
export default class PropertyFilter extends LightningElement {
    keyword = '';
    minPrice = '';
    maxPrice = '';
    minBedrooms = '0';
    bedroomOptions = BEDROOM_OPTIONS;
    timer;

    handleKeyword(event) {
        this.keyword = event.target.value ?? '';
        this.schedule();
    }

    handleMinPrice(event) {
        if (this.isValid(event.target)) {
            this.minPrice = event.target.value ?? '';
            this.schedule();
        }
    }

    handleMaxPrice(event) {
        if (this.isValid(event.target)) {
            this.maxPrice = event.target.value ?? '';
            this.schedule();
        }
    }

    handleBedrooms(event) {
        this.minBedrooms = event.detail.value;
        this.schedule();
    }

    handleReset() {
        clearTimeout(this.timer);
        this.keyword = '';
        this.minPrice = '';
        this.maxPrice = '';
        this.minBedrooms = '0';
        // 입력 컴포넌트의 오류 표시도 함께 해제
        this.template.querySelectorAll('lightning-input').forEach((input) => {
            input.value = '';
            input.setCustomValidity('');
            input.reportValidity();
        });
        this.publishNow(); // AC-033 즉시 반영
    }

    isValid(input) {
        return input.reportValidity(); // 음수 → aria-invalid, 반영 안 함 (AC-059)
    }

    schedule() {
        clearTimeout(this.timer);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.timer = setTimeout(() => this.publishNow(), DEBOUNCE_MS);
    }

    publishNow() {
        this.dispatchEvent(
            new CustomEvent('filterchange', {
                detail: {
                    keyword: this.keyword ? this.keyword : null,
                    minPrice: this.minPrice === '' || this.minPrice === null ? null : Number(this.minPrice),
                    maxPrice: this.maxPrice === '' || this.maxPrice === null ? null : Number(this.maxPrice),
                    minBedrooms: Number(this.minBedrooms) || null
                }
            })
        );
    }

    disconnectedCallback() {
        clearTimeout(this.timer);
    }
}
