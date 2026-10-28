/**
 * WI-1.001 — Property__c 테스트 데이터 팩토리.
 * SD-01~SD-10 (ACCEPTANCE-CRITERIA §1.4) 생성 + 권한 세트 사용자 생성 헬퍼.
 * (WI-1.003 ENHANCE) createUserWithoutPermSet('noaccess')
 */
@IsTest
public with sharing class PropertyTestDataFactory {
    private static final String TEST_USER_DOMAIN = '@dreamhouse.test';

    /** SD-01~SD-10 을 1회 DML 로 생성 (루프 내 DML 없음) */
    public static List<Property__c> createSampleProperties() {
        List<Property__c> rows = new List<Property__c>{
            p('강남 래미안 아파트', '서울특별시 강남구 테헤란로 101', '서울', 2500000000L, 4, 2, 'Available', 'https://example.invalid/sd01.jpg'),
            p('해운대 오션뷰', '부산광역시 해운대구 해운대해변로 22', '부산', 850000000L, 3, 2, 'Available', 'https://example.invalid/sd02.jpg'),
            p('판교 테크노 빌라', '경기도 성남시 분당구 판교역로 33', '성남', 1200000000L, 3, 2, 'Under Contract', 'https://example.invalid/sd03.jpg'),
            p('마포 한강 오피스텔', '서울특별시 마포구 마포대로 44', '서울', 450000000L, 1, 1, 'Available', 'https://example.invalid/sd04.jpg'),
            p('광교 호수 타운하우스', '경기도 수원시 영통구 광교호수로 55', '수원', 980000000L, 4, 3, 'Sold', 'https://example.invalid/sd05.jpg'),
            p('둔산 센트럴 아파트', '대전광역시 서구 둔산로 66', '대전', 520000000L, 3, 1, 'Available', 'https://example.invalid/sd06.jpg'),
            p('제주 애월 전원주택', '제주특별자치도 제주시 애월읍 애월해안로 77', '제주', 1650000000L, 5, 3, 'Under Contract', 'https://example.invalid/sd07.jpg'),
            p('송파 잠실 아파트', '서울특별시 송파구 올림픽로 88', '서울', 1980000000L, 3, 2, 'Sold', 'https://example.invalid/sd08.jpg'),
            p('송도 센트럴 오피스텔', '인천광역시 연수구 센트럴로 99', '인천', 350000000L, 1, 1, 'Available', null),
            p('서면 스카이 빌라', '부산광역시 부산진구 서면로 10', '부산', 720000000L, 2, 1, 'Available', 'https://invalid.example.invalid/none.jpg')
        };
        Database.insert(rows, AccessLevel.SYSTEM_MODE); // 테스트 데이터 준비는 시스템 모드 (1회 DML)
        return rows;
    }

    private static Property__c p(String n, String a, String c, Long price, Integer b, Integer t, String s, String pic) {
        return new Property__c(
            Name = n,
            Address__c = a,
            City__c = c,
            Price__c = price,
            Bedrooms__c = b,
            Bathrooms__c = t,
            Status__c = s,
            Picture_URL__c = pic
        );
    }

    /** alias 로 사용자 생성 + 권한 세트 할당. Setup 객체 DML 은 runAs 로 분리 (MIXED_DML 방지) */
    public static User createUserWithPermSet(String alias, String permSetName) {
        User u = newUser(alias);
        System.runAs(new User(Id = UserInfo.getUserId())) {
            Database.insert(u, AccessLevel.SYSTEM_MODE);
            PermissionSet ps = [SELECT Id FROM PermissionSet WHERE Name = :permSetName LIMIT 1];
            Database.insert(new PermissionSetAssignment(AssigneeId = u.Id, PermissionSetId = ps.Id), AccessLevel.SYSTEM_MODE);
        }
        return u;
    }

    public static User getUser(String alias) {
        String domainPattern = '%' + TEST_USER_DOMAIN;
        return [SELECT Id FROM User WHERE Alias = :alias AND Username LIKE :domainPattern LIMIT 1];
    }

    private static User newUser(String alias) {
        // 표준 프로필 이름은 로캘에 따라 번역될 수 있음 → 두 이름 모두 허용 (WI-1.001 §4.6)
        Profile prof = [SELECT Id FROM Profile WHERE Name IN ('Standard User', '표준 사용자') LIMIT 1];
        String uname = alias + '.' + System.currentTimeMillis() + TEST_USER_DOMAIN;
        return new User(
            Alias = alias,
            Username = uname,
            LastName = alias,
            Email = alias + '@example.invalid',
            ProfileId = prof.Id,
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'ko',
            LocaleSidKey = 'ko_KR',
            TimeZoneSidKey = 'Asia/Seoul'
        );
    }
}
