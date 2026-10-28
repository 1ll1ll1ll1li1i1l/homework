/**
 * WI-1.001 — Property__c 테스트 데이터 팩토리.
 * SD-01~SD-10 (ACCEPTANCE-CRITERIA §1.4) 생성 + 권한 세트 사용자 생성 헬퍼.
 * (WI-1.003 ENHANCE) createUserWithoutPermSet('noaccess')
 */
@IsTest
public with sharing class PropertyTestDataFactory {
    private static final String TEST_USER_DOMAIN = '@dreamhouse.test';
    // (ENHANCED 2026-10-28: 코드 리뷰 H-2) 'Minimum Access - Salesforce' 우선 — 프로필 기본 CRUD 의존을 없애고
    // Property__c 권한은 권한 세트로만 부여. DE/Scratch 의 Salesforce 라이선스(약 2석) 부족 시
    // LICENSE_LIMIT_EXCEEDED → 'Standard Platform User'(Salesforce Platform 라이선스)로 대체.
    private static final String PRIMARY_PROFILE = 'Minimum Access - Salesforce';
    private static final String FALLBACK_PROFILE = 'Standard Platform User';
    private static Map<String, Id> profileIdsByName; // L-1: 프로필 2종을 1회 SOQL 로 조회 후 캐시

    public class TestDataException extends Exception {}

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
            // L-2: 권한 세트가 없으면 QueryException 대신 원인이 드러나는 메시지로 실패
            List<PermissionSet> ps = [SELECT Id FROM PermissionSet WHERE Name = :permSetName LIMIT 1];
            if (ps.isEmpty()) {
                throw new TestDataException('권한 세트 미배포: ' + permSetName + ' — force-app/main/default/permissionsets 를 먼저 배포하세요.');
            }
            insertWithLicenseFallback(u);
            Database.insert(new PermissionSetAssignment(AssigneeId = u.Id, PermissionSetId = ps[0].Id), AccessLevel.SYSTEM_MODE);
        }
        return u;
    }

    /** PRIMARY_PROFILE 로 insert, Salesforce 라이선스 부족이면 FALLBACK_PROFILE 로 재시도 */
    private static void insertWithLicenseFallback(User u) {
        u.ProfileId = profileId(PRIMARY_PROFILE);
        Database.SaveResult sr = Database.insert(u, false, AccessLevel.SYSTEM_MODE);
        if (sr.isSuccess()) {
            return;
        }
        if (sr.getErrors()[0].getStatusCode() != StatusCode.LICENSE_LIMIT_EXCEEDED) {
            throw new TestDataException('테스트 사용자 생성 실패: ' + sr.getErrors()[0].getMessage());
        }
        u.Id = null;
        u.ProfileId = profileId(FALLBACK_PROFILE);
        Database.insert(u, AccessLevel.SYSTEM_MODE);
    }

    private static Id profileId(String name) {
        if (profileIdsByName == null) {
            profileIdsByName = new Map<String, Id>();
            for (Profile pr : [SELECT Id, Name FROM Profile WHERE Name IN (:PRIMARY_PROFILE, :FALLBACK_PROFILE)]) {
                profileIdsByName.put(pr.Name, pr.Id);
            }
        }
        if (!profileIdsByName.containsKey(name)) {
            throw new TestDataException('프로필 없음: ' + name + ' — 오그에 표준 프로필이 있는지 확인하세요.');
        }
        return profileIdsByName.get(name);
    }

    public static User getUser(String alias) {
        String domainPattern = '%' + TEST_USER_DOMAIN;
        return [SELECT Id FROM User WHERE Alias = :alias AND Username LIKE :domainPattern LIMIT 1];
    }

    private static User newUser(String alias) {
        // ProfileId 는 insertWithLicenseFallback 에서 지정 (H-2)
        String uname = alias + '.' + System.currentTimeMillis() + TEST_USER_DOMAIN;
        return new User(
            Alias = alias,
            Username = uname,
            LastName = alias,
            Email = alias + '@example.invalid',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'ko',
            LocaleSidKey = 'ko_KR',
            TimeZoneSidKey = 'Asia/Seoul'
        );
    }
}