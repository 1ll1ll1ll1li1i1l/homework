/**
 * WI-1.003 — 매물 조회 컨트롤러 (기본 조회). 조건 확장은 WI-1.004.
 * REQ-005, REQ-007, REQ-011, REQ-012 · AC-004(조회부), 013, 018, 019, 055, 062(잠정), 065, 066, 070
 * 보안(AC-065): with sharing + WITH USER_MODE(CRUD/FLS 강제), 바인드 변수만 사용, 루프 내 SOQL/DML 없음.
 */
public with sharing class PropertyController {
    @TestVisible
    private static final Integer MAX_RESULTS = 200; // CK-06/OQ-09 확정 전 임시값 (AC-062 잠정)

    @TestVisible
    private static final String LOAD_ERROR_MESSAGE = '매물 정보를 불러오지 못했습니다.';

    /**
     * 매물 목록 조회. 판매완료 포함 전 상태 반환(OQ-04, D-17). 0건이면 빈 List.
     * @param filter 조회 조건 (WI-1.003 에서는 미적용 — 시그니처 고정 목적, WI-1.004 에서 확장)
     * @return Property__c 목록 (최대 MAX_RESULTS 건, Name 오름차순)
     * @throws AuraHandledException USER_MODE 로 오브젝트/필드 접근이 거부된 경우 (AC-055)
     */
    @AuraEnabled(cacheable=true)
    public static List<Property__c> getProperties(PropertyFilter filter) {
        try {
            return [
                SELECT Id, Name, Address__c, City__c, State__c, Price__c,
                       Bedrooms__c, Bathrooms__c, Picture_URL__c, Status__c
                FROM Property__c
                WITH USER_MODE
                ORDER BY Name          // CK-06 확정 전 임시 정렬 (AC 는 순서 미검증)
                LIMIT :MAX_RESULTS
            ];
        } catch (QueryException e) {   // USER_MODE 접근 거부 (AC-055)
            AuraHandledException ex = new AuraHandledException(LOAD_ERROR_MESSAGE);
            ex.setMessage(LOAD_ERROR_MESSAGE);
            throw ex;
        }
    }
}