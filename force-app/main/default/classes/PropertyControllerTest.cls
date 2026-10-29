/**
 * WI-1.003 — PropertyController 단위 테스트.
 * AC-004(조회부), AC-013, AC-018, AC-019, AC-055(Apex), AC-062(잠정 — CK-06), AC-066
 */
@IsTest
private class PropertyControllerTest {
    private static final String SD01_NAME = '강남 래미안 아파트';

    @TestSetup
    static void setup() {
        PropertyTestDataFactory.createSampleProperties(); // SD-01~SD-10
        PropertyTestDataFactory.createUserWithPermSet('agent', 'DreamHouse_Agent');
        PropertyTestDataFactory.createUserWithPermSet('admin', 'DreamHouse_Admin');
        PropertyTestDataFactory.createUserWithoutPermSet('noaccess');
    }

    private static Map<String, Integer> countByStatus(List<Property__c> rows) {
        Map<String, Integer> byStatus = new Map<String, Integer>();
        for (Property__c p : rows) {
            Integer n = byStatus.containsKey(p.Status__c) ? byStatus.get(p.Status__c) : 0;
            byStatus.put(p.Status__c, n + 1);
        }
        return byStatus;
    }

    @IsTest
    static void ac004_agentQueryReturns10() {
        List<Property__c> rows;
        System.runAs(PropertyTestDataFactory.getUser('agent')) {
            Test.startTest();
            rows = PropertyController.getProperties(new PropertyFilter());
            Test.stopTest();
        }
        Assert.areEqual(10, rows.size(), 'agent 는 SD-01~SD-10 10건을 조회해야 한다');
    }

    @IsTest
    static void ac004_adminQueryReturns10() {
        System.runAs(PropertyTestDataFactory.getUser('admin')) {
            Assert.areEqual(10, PropertyController.getProperties(new PropertyFilter()).size(),
                'admin 도 10건을 조회해야 한다');
        }
    }

    @IsTest
    static void ac013_noFilterReturnsAllIncludingSold() {
        System.runAs(PropertyTestDataFactory.getUser('agent')) {
            List<Property__c> rows = PropertyController.getProperties(new PropertyFilter());
            Assert.areEqual(10, rows.size(), '조건 없음 → 전체 10건');
            Map<String, Integer> byStatus = countByStatus(rows);
            Assert.areEqual(6, byStatus.get('Available'), 'Available 6건');
            Assert.areEqual(2, byStatus.get('Under Contract'), 'Under Contract 2건');
            Assert.areEqual(2, byStatus.get('Sold'), 'Sold 2건(SD-05, SD-08) 포함 — 판매완료 제외 조건 없음');
            Set<String> soldNames = new Set<String>();
            for (Property__c p : rows) {
                if (p.Status__c == 'Sold') {
                    soldNames.add(p.Name);
                }
            }
            Assert.areEqual(new Set<String>{ '광교 호수 타운하우스', '송파 잠실 아파트' }, soldNames, 'Sold = SD-05, SD-08');
        }
    }

    @IsTest
    static void ac013_nullFilterTreatedAsNoCondition() {
        System.runAs(PropertyTestDataFactory.getUser('agent')) {
            Assert.areEqual(10, PropertyController.getProperties(null).size(), 'filter null 도 조건 없음으로 10건');
        }
    }

    /** AC-070: 파라미터 객체 PropertyFilter (NFR-009) — 4개 조건 속성 왕복. 조건 적용 검증은 WI-1.004 */
    @IsTest
    static void ac070_filterParameterObject() {
        PropertyFilter f = new PropertyFilter();
        f.keyword = '래미안';
        f.minPrice = 900000000;
        f.maxPrice = 3000000000L;
        f.minBedrooms = 3;
        Assert.areEqual('래미안', f.keyword, 'keyword');
        Assert.areEqual(900000000, f.minPrice, 'minPrice');
        Assert.areEqual(3000000000L, f.maxPrice, 'maxPrice');
        Assert.areEqual(3, f.minBedrooms, 'minBedrooms');
        System.runAs(PropertyTestDataFactory.getUser('agent')) {
            Assert.isNotNull(PropertyController.getProperties(f), '조건이 채워진 filter 도 예외 없이 List 반환');
        }
    }

    @IsTest
    static void ac018_emptyListNotNull() {
        // WI-1.003 1차: 데이터 0건 상황. 키워드 '강릉' 재확인은 WI-1.004
        delete [SELECT Id FROM Property__c];
        System.runAs(PropertyTestDataFactory.getUser('agent')) {
            List<Property__c> rows = PropertyController.getProperties(new PropertyFilter());
            Assert.isNotNull(rows, '0건이어도 null 이 아닌 List 를 반환해야 한다');
            Assert.areEqual(0, rows.size(), '0건');
        }
    }

    @IsTest
    static void ac019_fieldsAccessible() {
        System.runAs(PropertyTestDataFactory.getUser('agent')) {
            Property__c sd01;
            for (Property__c p : PropertyController.getProperties(new PropertyFilter())) {
                if (p.Name == SD01_NAME) {
                    sd01 = p;
                }
            }
            Assert.isNotNull(sd01, 'SD-01 이 결과에 포함되어야 한다');
            Assert.isNotNull(sd01.Id, 'Id');
            Assert.areEqual('서울특별시 강남구 테헤란로 101', sd01.Address__c, 'Address__c');
            Assert.areEqual('서울', sd01.City__c, 'City__c');
            Assert.areEqual(2500000000L, sd01.Price__c, 'Price__c');
            Assert.areEqual(4, sd01.Bedrooms__c, 'Bedrooms__c');
            Assert.areEqual(2, sd01.Bathrooms__c, 'Bathrooms__c');
            Assert.isNotNull(sd01.Picture_URL__c, 'Picture_URL__c 값 존재');
            Assert.areEqual('Available', sd01.Status__c, 'Status__c (접근 시 SObjectException 없음)');
        }
    }

    @IsTest
    static void ac055_noAccessUserBlocked() {
        List<Property__c> rows;
        AuraHandledException caught;
        System.runAs(PropertyTestDataFactory.getUser('noaccess')) {
            try {
                rows = PropertyController.getProperties(new PropertyFilter());
            } catch (AuraHandledException e) {
                caught = e;
            }
        }
        Assert.isNull(rows, '권한 세트 미할당 사용자에게 데이터가 반환되면 안 된다');
        Assert.isNotNull(caught, '권한 세트 미할당 사용자는 AuraHandledException 이 발생해야 한다');
        Assert.areEqual(PropertyController.LOAD_ERROR_MESSAGE, caught.getMessage(), '사용자 안내 문구');
        Assert.areEqual('매물 정보를 불러오지 못했습니다.', caught.getMessage(), 'AC-047 문구와 동일');
    }

    /** AC-062 (잠정 — CK-06): MAX_RESULTS + 1 건 → 반환 = MAX_RESULTS. CK-06 해소 전 완료 조건 제외 */
    @IsTest
    static void ac062_resultCappedAtMaxResults() {
        Integer extra = PropertyController.MAX_RESULTS + 1 - 10; // setup 10건 + extra = N + 1
        List<Property__c> more = new List<Property__c>();
        for (Integer i = 0; i < extra; i++) {
            more.add(new Property__c(Name = 'LIMIT-' + String.valueOf(i).leftPad(4, '0'),
                Price__c = 100000000L, Status__c = 'Available'));
        }
        Database.insert(more, AccessLevel.SYSTEM_MODE); // 1회 DML
        Assert.areEqual(PropertyController.MAX_RESULTS + 1, [SELECT COUNT() FROM Property__c], 'Given: N + 1 건');
        System.runAs(PropertyTestDataFactory.getUser('agent')) {
            Assert.areEqual(PropertyController.MAX_RESULTS,
                PropertyController.getProperties(new PropertyFilter()).size(), '반환 건수 = N, 예외 없음');
        }
    }
}