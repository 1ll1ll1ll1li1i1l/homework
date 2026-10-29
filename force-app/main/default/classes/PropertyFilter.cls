/**
 * WI-1.003 — 매물 조회 조건 파라미터 객체 (NFR-009).
 * WI-1.003 에서는 받기만 하고, 조건 적용은 WI-1.004 에서 확장한다.
 * (ENHANCED 2026-10-29: WI-1.004) PropertyController 가 4개 조건을 바인드 변수로 적용. 속성명 = LMS PropertyFilter__c 필드명.
 */
public with sharing class PropertyFilter {
    @AuraEnabled public String keyword { get; set; }
    @AuraEnabled public Decimal minPrice { get; set; }
    @AuraEnabled public Decimal maxPrice { get; set; }
    @AuraEnabled public Integer minBedrooms { get; set; }
}