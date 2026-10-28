import { LightningElement, api } from 'lwc';
import PLACEHOLDER from '@salesforce/resourceUrl/propertyPlaceholder';
import { formatKrw, statusLabel, badgeClass, roomsLabel } from 'c/propertyUtils';

/**
 * MWI-1.002 매물 카드 (목업).
 * - 목업: 클릭/Enter → CustomEvent 'propertyselect' { recordId } (부모 상태 방식)
 * - 본 개발(WI-1.002): 같은 지점에서 LMS PropertySelected__c 발행으로 교체
 */
export default class PropertyTile extends LightningElement {
    @api property = {};
    @api selected = false;

    imageFailed = false;

    get imageUrl() {
        return !this.imageFailed && this.property?.Picture_URL__c ? this.property.Picture_URL__c : PLACEHOLDER;
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

    get ariaLabel() {
        return `${this.property?.Name}, ${this.priceLabel}`; // AC-048
    }

    get ariaPressed() {
        return this.selected ? 'true' : 'false';
    }

    get cardClass() {
        return `slds-card property-card${this.selected ? ' property-card_selected' : ''}`;
    }

    handleImageError() {
        this.imageFailed = true; // AC-022
    }

    handleKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.handleSelect();
        }
    }

    handleSelect() {
        this.dispatchEvent(new CustomEvent('propertyselect', { detail: { recordId: this.property.Id } }));
    }
}
