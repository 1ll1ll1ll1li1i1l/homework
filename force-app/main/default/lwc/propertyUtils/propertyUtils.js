/**
 * 공용 표시 규칙 (ACCEPTANCE-CRITERIA §1.5) — 목업에서 먼저 만들고 본 개발(WI-1.002/1.005)이 그대로 재사용 가능.
 * - 상태 라벨·배지 클래스 매핑 (OQ-04 / CK-14)
 * - KRW 원 단위 전체 금액 포맷 (OQ-02 / CK-02, 축약 없음)
 * - 침실/욕실 요약, 결과 건수 문구
 * - (DROPPED 2026-10-29: WI-1.005 — 목업 전용 filterProperties 제거, 서버 조건 PropertyController/PropertyFilter 로 대체)
 */

export const STATUS = {
  Available: { label: "판매중", badgeClass: "slds-badge slds-theme_success" },
  "Under Contract": {
    label: "계약중",
    badgeClass: "slds-badge slds-theme_warning"
  },
  Sold: { label: "판매완료", badgeClass: "slds-badge" } // 회색 기본 배지 (CK-14)
};

export const STATUS_OPTIONS = Object.keys(STATUS).map((value) => ({
  label: STATUS[value].label,
  value
}));

export const BEDROOM_OPTIONS = [
  { label: "전체", value: "0" },
  { label: "1개 이상", value: "1" },
  { label: "2개 이상", value: "2" },
  { label: "3개 이상", value: "3" },
  { label: "4개 이상", value: "4" },
  { label: "5개 이상", value: "5" }
];

export const TEXT = {
  emptyResult: "조건에 맞는 매물이 없습니다.",
  detailEmpty: "매물을 선택하면 상세 정보가 표시됩니다."
};

const KRW = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0
});

/** 2500000000 → '₩2,500,000,000' (억/만원 축약 없음) */
export function formatKrw(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  return KRW.format(Number(value));
}

export function statusLabel(status) {
  return STATUS[status]?.label ?? "";
}

export function badgeClass(status) {
  return STATUS[status]?.badgeClass ?? "slds-badge";
}

/** '침실 3 · 욕실 2' */
export function roomsLabel(property) {
  return `침실 ${property?.Bedrooms__c ?? "-"} · 욕실 ${property?.Bathrooms__c ?? "-"}`;
}

/** '10건' */
export function resultCountLabel(count) {
  return `${count}건`;
}
