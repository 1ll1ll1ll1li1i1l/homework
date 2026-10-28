import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getMockProperties } from 'c/propertyMockData';
import { filterProperties } from 'c/propertyUtils';

/**
 * [MOCKUP] 매물 탐색 컨테이너 — MWI-1.005 (App Page "매물 탐색" = Property_Explorer).
 * 목업은 LMS/Apex 대신 부모 상태(WI-1.005 §4.5 안 B)로 3개 컴포넌트를 연결한다.
 *   filterchange → filteredProperties 재계산 → propertyList
 *   propertyselect → selectedId → propertyDetail (URL 변경 없음)
 *   propertysave (관리자) → 메모리 배열 갱신 → 카드·배지·건수·상세 즉시 반영 (REQ-011 시연)
 * 본 개발(WI-1.005)은 안 A(LMS, App Page 3열 배치)가 기본안 — 안 B 로 확정 시 이 컨테이너를 그대로 승계.
 */
export default class PropertyExplorer extends LightningElement {
    properties = getMockProperties();
    filter = {};
    selectedId;
    role = 'agent';

    get agentVariant() {
        return this.role === 'agent' ? 'brand' : 'neutral';
    }

    get adminVariant() {
        return this.role === 'admin' ? 'brand' : 'neutral';
    }

    get filteredProperties() {
        return filterProperties(this.properties, this.filter);
    }

    get selectedProperty() {
        return this.properties.find((p) => p.Id === this.selectedId) ?? null;
    }

    get isAdmin() {
        return this.role === 'admin';
    }

    handleRoleChange(event) {
        this.role = event.currentTarget.dataset.value;
    }

    handleFilterChange(event) {
        this.filter = { ...event.detail };
    }

    handleSelect(event) {
        this.selectedId = event.detail.recordId;
    }

    handleSave(event) {
        const changes = event.detail;
        this.properties = this.properties.map((p) => (p.Id === changes.Id ? { ...p, ...changes } : p));
        this.dispatchEvent(
            new ShowToastEvent({
                title: '저장되었습니다.',
                message: '목업: 화면 메모리에만 반영되며 새로고침 시 초기화됩니다.',
                variant: 'success'
            })
        );
    }
}
