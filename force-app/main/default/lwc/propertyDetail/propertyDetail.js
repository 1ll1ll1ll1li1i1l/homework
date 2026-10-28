import { LightningElement, api } from 'lwc';
import PLACEHOLDER from '@salesforce/resourceUrl/propertyPlaceholder';
import { formatKrw, statusLabel, badgeClass, STATUS_OPTIONS, TEXT } from 'c/propertyUtils';

/**
 * MWI-1.005 상세 패널 (목업).
 * - 목업: 부모가 선택 매물을 @api property 로 전달, 관리자 여부는 @api canEdit (목업 역할 전환)
 *         저장 → CustomEvent 'propertysave' { Id, Name, Price__c, Status__c } → 부모가 메모리 배열 갱신
 * - 본 개발(WI-1.005): LMS PropertySelected__c 구독 + getRecord, getObjectInfo.updateable,
 *         lightning-record-edit-form + notifyRecordUpdateAvailable + PropertyUpdated__c 발행으로 교체
 */
export default class PropertyDetail extends LightningElement {
    @api canEdit = false;

    _property;
    imageFailed = false;
    isEditing = false;
    draft = {};
    statusOptions = STATUS_OPTIONS;
    emptyText = TEXT.detailEmpty;

    @api
    get property() {
        return this._property;
    }
    set property(value) {
        const changedRecord = value?.Id !== this._property?.Id;
        this._property = value;
        if (changedRecord) {
            this.imageFailed = false;
            this.isEditing = false; // 다른 카드 선택 시 편집 취소
        }
    }

    get hasSelection() {
        return !!this._property;
    }

    get imageUrl() {
        return !this.imageFailed && this._property?.Picture_URL__c ? this._property.Picture_URL__c : PLACEHOLDER;
    }

    get priceLabel() {
        return formatKrw(this._property?.Price__c);
    }

    get statusText() {
        return statusLabel(this._property?.Status__c);
    }

    get statusBadgeClass() {
        return badgeClass(this._property?.Status__c);
    }

    handleImageError() {
        this.imageFailed = true; // AC-039
    }

    handleEdit() {
        const { Name, Price__c, Status__c } = this._property;
        this.draft = { Name, Price__c, Status__c };
        this.isEditing = true;
    }

    handleCancel() {
        this.isEditing = false;
    }

    handleDraftChange(event) {
        const field = event.target.dataset.field;
        const value = event.detail?.value ?? event.target.value;
        this.draft = { ...this.draft, [field]: value };
    }

    handleSave() {
        const fields = [...this.template.querySelectorAll('.edit-field')];
        const allValid = fields.reduce((ok, input) => input.reportValidity() && ok, true);
        if (!allValid) {
            return;
        }
        this.dispatchEvent(
            new CustomEvent('propertysave', {
                detail: {
                    Id: this._property.Id,
                    Name: this.draft.Name,
                    Price__c: Number(this.draft.Price__c),
                    Status__c: this.draft.Status__c
                }
            })
        );
        this.isEditing = false;
    }
}
