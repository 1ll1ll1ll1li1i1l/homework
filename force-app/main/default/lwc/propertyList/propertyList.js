import { LightningElement, api } from 'lwc';
import { resultCountLabel, TEXT } from 'c/propertyUtils';

/**
 * MWI-1.003 매물 목록 (목업).
 * - 목업: 부모(propertyExplorer)가 필터링한 배열을 @api properties 로 받음
 * - 본 개발(WI-1.003): @wire(getProperties, { filter }) 로 교체, refresh()/토스트 추가
 */
export default class PropertyList extends LightningElement {
    @api properties = [];
    @api selectedId;
    @api isLoading = false;

    emptyText = TEXT.emptyResult;

    get items() {
        return (this.properties || []).map((property) => ({
            property,
            selected: property.Id === this.selectedId
        }));
    }

    get count() {
        return (this.properties || []).length;
    }

    get countLabel() {
        return resultCountLabel(this.count);
    }

    get isEmpty() {
        return !this.isLoading && this.count === 0;
    }

    handleSelect(event) {
        this.dispatchEvent(new CustomEvent('propertyselect', { detail: { ...event.detail } }));
    }
}
