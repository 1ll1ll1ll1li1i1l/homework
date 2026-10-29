import { LightningElement } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

/**
 * [MOCKUP] 매물 탐색 컨테이너 — MWI-1.005 (App Page "매물 탐색" = Property_Explorer).
 * (ENHANCED 2026-10-28 WI-1.003) 정적 샘플(propertyMockData) 제거 — 목록 데이터는 propertyList 가
 * PropertyController.getProperties(@wire) 로 직접 조회한다. 컨테이너는 부모 상태(WI-1.005 §4.5 안 B)로만 연결:
 *   (ENHANCED 2026-10-29 WI-1.004) 필터는 컨테이너를 거치지 않음 — propertyFilter 가 LMS PropertyFilter__c 를 발행하고
 *   propertyList 가 구독해 서버 조건(@wire getProperties)으로 조회
 *   propertyselect { recordId, property } → selectedProperty → propertyDetail (URL 변경 없음)
 *   propertysave (관리자, 목업) → 상세 패널 화면에만 반영 (TODO WI-1.005: 실제 저장 + PropertyUpdated__c → propertyList.refresh())
 * 본 개발(WI-1.005)은 안 A(LMS, App Page 3열 배치)가 기본안 — 안 B 로 확정 시 이 컨테이너를 승계, 안 A 면 삭제.
 */
export default class PropertyExplorer extends LightningElement {
  selectedProperty = null;
  role = "agent";

  get selectedId() {
    return this.selectedProperty?.Id;
  }

  get agentVariant() {
    return this.role === "agent" ? "brand" : "neutral";
  }

  get adminVariant() {
    return this.role === "admin" ? "brand" : "neutral";
  }

  get isAdmin() {
    return this.role === "admin";
  }

  handleRoleChange(event) {
    this.role = event.currentTarget.dataset.value;
  }

  handleSelect(event) {
    this.selectedProperty = event.detail?.property ?? null;
  }

  handleSave(event) {
    const changes = event.detail;
    if (this.selectedProperty?.Id === changes.Id) {
      this.selectedProperty = { ...this.selectedProperty, ...changes };
    }
    this.dispatchEvent(
      new ShowToastEvent({
        title: "저장되지 않았습니다 (목업).",
        message:
          "실제 저장은 WI-1.005 에서 구현됩니다. 상세 패널에만 임시 반영되었습니다.",
        variant: "warning"
      })
    );
  }
}