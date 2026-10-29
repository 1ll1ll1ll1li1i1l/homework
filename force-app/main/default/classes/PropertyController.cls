/**
 * WI-1.003 — 매물 조회 컨트롤러 (기본 조회).
 * (ENHANCED 2026-10-29: WI-1.004) 조건 확장 — 키워드 Name/City__c 부분 일치, 가격 경계 포함, 침실 이상.
 * REQ-005, REQ-007, REQ-008, REQ-011, REQ-012 · AC-004(조회부), 013~019, 055, 056, 057(잠정), 062(잠정), 065, 066, 070
 * 보안(AC-065): with sharing + AccessLevel.USER_MODE(CRUD/FLS 강제). WHERE 절은 상수 조각만 조합하고
 * 사용자 입력 값은 모두 바인드 변수(Database.queryWithBinds)로만 전달 — 문자열 연결 SOQL 없음. 루프 내 SOQL/DML 없음.
 */
public with sharing class PropertyController {
    @TestVisible
    private static final Integer MAX_RESULTS = 200; // CK-06/OQ-09 확정 전 임시값 (AC-062 잠정)

    @TestVisible
    private static final String LOAD_ERROR_MESSAGE = '매물 정보를 불러오지 못했습니다.';

    private static final String BASE_QUERY =
        'SELECT Id, Name, Address__c, City__c, State__c, Price__c, '
        + 'Bedrooms__c, Bathrooms__c, Picture_URL__c, Status__c FROM Property__c';
    private static final String ORDER_AND_LIMIT = ' ORDER BY Name LIMIT :maxResults'; // CK-06 확정 전 임시 정렬

    // WHERE 조각 — 상수만 사용 (값은 바인드)
    private static final String COND_KEYWORD = '(Name LIKE :keywordLike OR City__c LIKE :keywordLike)';
    private static final String COND_MIN_PRICE = 'Price__c >= :minPrice';
    private static final String COND_MAX_PRICE = 'Price__c <= :maxPrice';
    private static final String COND_MIN_BEDROOMS = 'Bedrooms__c >= :minBedrooms';

    /**
     * 매물 목록 조회. 판매완료 포함 전 상태 반환(OQ-04, D-17) — 상태 조건 없음. 0건이면 빈 List.
     * - keyword: trim 후 공백이면 조건 미적용(CK-04 잠정), Name 또는 City__c 부분 일치(Address__c 제외)
     * - minPrice / maxPrice: 경계 포함(>= / <=). min > max 이면 그대로 적용되어 0건(CK-03 잠정)
     * - minBedrooms: null 또는 0 이하면 미적용, 그 외 "이상"
     * @param filter 조회 조건 (null 이면 조건 없음)
     * @return Property__c 목록 (최대 MAX_RESULTS 건, Name 오름차순)
     * @throws AuraHandledException USER_MODE 로 오브젝트/필드 접근이 거부된 경우 (AC-055)
     */
    @AuraEnabled(cacheable=true)
    public static List<Property__c> getProperties(PropertyFilter filter) {
        Map<String, Object> binds = new Map<String, Object>{ 'maxResults' => MAX_RESULTS };
        String soql = BASE_QUERY + buildWhereClause(filter, binds) + ORDER_AND_LIMIT;
        try {
            return Database.queryWithBinds(soql, binds, AccessLevel.USER_MODE);
        } catch (QueryException e) {   // USER_MODE 접근 거부 (AC-055)
            AuraHandledException ex = new AuraHandledException(LOAD_ERROR_MESSAGE);
            ex.setMessage(LOAD_ERROR_MESSAGE);
            throw ex;
        }
    }

    /**
     * filter 값에 따라 상수 WHERE 조각만 조합하고 값은 binds 에 담는다 (사용자 입력 문자열 연결 없음).
     * @param filter 조회 조건 (null 이면 조건 없음)
     * @param binds 바인드 변수 맵 (이 메서드가 조건 값을 추가)
     * @return ' WHERE ...' 또는 빈 문자열
     */
    private static String buildWhereClause(PropertyFilter filter, Map<String, Object> binds) {
        PropertyFilter f = (filter == null) ? new PropertyFilter() : filter;
        List<String> conditions = new List<String>();

        String keyword = String.isBlank(f.keyword) ? null : f.keyword.trim(); // CK-04 (잠정)
        if (keyword != null) {
            conditions.add(COND_KEYWORD);
            binds.put('keywordLike', '%' + keyword + '%'); // 값은 바인드로만 전달 (AC-056)
        }
        if (f.minPrice != null) {
            conditions.add(COND_MIN_PRICE);
            binds.put('minPrice', f.minPrice);
        }
        if (f.maxPrice != null) {
            conditions.add(COND_MAX_PRICE);
            binds.put('maxPrice', f.maxPrice);
        }
        if (f.minBedrooms != null && f.minBedrooms > 0) {
            conditions.add(COND_MIN_BEDROOMS);
            binds.put('minBedrooms', f.minBedrooms);
        }

        return conditions.isEmpty() ? '' : ' WHERE ' + String.join(conditions, ' AND ');
    }
}