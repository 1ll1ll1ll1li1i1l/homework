/**
 * WI-1.001 — Property__c 데이터 모델·권한 검증.
 * AC-001, AC-002, AC-003, AC-004(권한 벡터), AC-005, AC-053
 */
@IsTest
private class PropertyModelTest {
    @TestSetup
    static void setup() {
        PropertyTestDataFactory.createSampleProperties(); // SD-01~SD-10
        PropertyTestDataFactory.createUserWithPermSet('agent', 'DreamHouse_Agent');
        PropertyTestDataFactory.createUserWithPermSet('admin', 'DreamHouse_Admin');
    }

    @IsTest
    static void ac001_fieldTypes() {
        Map<String, Schema.SObjectField> f = Schema.SObjectType.Property__c.fields.getMap();
        Schema.DescribeFieldResult price = f.get('Price__c').getDescribe();
        Assert.areEqual(Schema.DisplayType.CURRENCY, price.getType());
        Assert.areEqual(12, price.getPrecision());
        Assert.areEqual(0, price.getScale());
        Assert.areEqual(Schema.DisplayType.STRING, f.get('Name').getDescribe().getType());
        Assert.areEqual(80, f.get('Name').getDescribe().getLength());
        Assert.areEqual(255, f.get('Address__c').getDescribe().getLength());
        Assert.areEqual(100, f.get('City__c').getDescribe().getLength());
        Assert.areEqual(Schema.DisplayType.DOUBLE, f.get('Bedrooms__c').getDescribe().getType());
        Assert.areEqual(2, f.get('Bedrooms__c').getDescribe().getPrecision());
        Assert.areEqual(Schema.DisplayType.DOUBLE, f.get('Bathrooms__c').getDescribe().getType());
        Assert.areEqual(2, f.get('Bathrooms__c').getDescribe().getPrecision());
        Assert.areEqual(Schema.DisplayType.URL, f.get('Picture_URL__c').getDescribe().getType());
        Assert.areEqual(Schema.DisplayType.PICKLIST, f.get('Status__c').getDescribe().getType());
        // (ENHANCED 2026-10-28: 코드 리뷰 L-3) 필수·restricted 검증
        Assert.isFalse(price.isNillable(), 'Price__c 는 필수(required=true)여야 한다');
        Assert.isFalse(f.get('Status__c').getDescribe().isNillable(), 'Status__c 는 필수(required=true)여야 한다');
        Assert.isTrue(f.get('Status__c').getDescribe().isRestrictedPicklist(), 'Status__c 는 restricted picklist 여야 한다');
        // State__c: OQ-01/CK-11 미확정 — 생성됨(Text 100)
        Assert.areEqual(100, f.get('State__c').getDescribe().getLength());
    }

    @IsTest
    static void ac002_statusValuesAndDefault() {
        List<String> active = new List<String>();
        String defaultValue;
        for (Schema.PicklistEntry e : Property__c.Status__c.getDescribe().getPicklistValues()) {
            if (e.isActive()) {
                active.add(e.getValue());
            }
            if (e.isDefaultValue()) {
                defaultValue = e.getValue();
            }
        }
        Assert.areEqual(new List<String>{ 'Available', 'Under Contract', 'Sold' }, active);
        Assert.areEqual('Available', defaultValue);

        Property__c r = new Property__c(Name = '[E2E] 기본값 확인', Price__c = 100000000);
        Database.insert(r, AccessLevel.SYSTEM_MODE);
        Assert.areEqual('Available', [SELECT Status__c FROM Property__c WHERE Id = :r.Id].Status__c);
    }

    @IsTest
    static void ac003_currencyIsKrwSingle() {
        Assert.areEqual('KRW', UserInfo.getDefaultCurrency(), 'D-16: 오그 기본 통화 KRW');
        Assert.isFalse(UserInfo.isMultiCurrencyOrganization(), 'D-16: 다중 통화 비활성');
        Property__c sd01 = [SELECT Price__c FROM Property__c WHERE Name = '강남 래미안 아파트' LIMIT 1];
        Assert.areEqual(2500000000L, sd01.Price__c.longValue());
    }

    @IsTest
    static void ac004_agentPermissionVector() {
        System.runAs(PropertyTestDataFactory.getUser('agent')) {
            Schema.DescribeSObjectResult d = Schema.SObjectType.Property__c;
            Assert.isTrue(d.isAccessible(), 'agent: Read');
            Assert.isFalse(d.isCreateable(), 'agent: no Create');
            Assert.isFalse(d.isUpdateable(), 'agent: no Edit');
            Assert.isFalse(d.isDeletable(), 'agent: no Delete');
            Assert.isFalse(Schema.SObjectType.Property__c.fields.Status__c.isUpdateable(), 'agent: Status__c not updateable (I-05)');
            // "조회 결과 10건" 은 WI-1.003 PropertyControllerTest 에서 검증 (이월)
        }
    }

    @IsTest
    static void ac005_adminCrudUserMode() {
        System.runAs(PropertyTestDataFactory.getUser('admin')) {
            Property__c r = new Property__c(Name = '[E2E] 관리자 권한 확인', Price__c = 300000000);
            Assert.isTrue(Database.insert(r, AccessLevel.USER_MODE).isSuccess());
            r.Status__c = 'Sold';
            Assert.isTrue(Database.update(r, AccessLevel.USER_MODE).isSuccess());
            Assert.isTrue(Database.delete(r, AccessLevel.USER_MODE).isSuccess());
        }
        Assert.areEqual(0, [SELECT COUNT() FROM Property__c WHERE Name = '[E2E] 관리자 권한 확인']);
    }

    /** (ENHANCED 2026-10-28: 코드 리뷰 M-2) Modify All — 타인 소유 레코드 수정·삭제 (D-18) */
    @IsTest
    static void ac005_adminModifyAllOthersRecord() {
        User admin = PropertyTestDataFactory.getUser('admin');
        Property__c sd03 = [SELECT Id, OwnerId FROM Property__c WHERE Name = '판교 테크노 빌라' LIMIT 1];
        Assert.areNotEqual(admin.Id, sd03.OwnerId, '전제: SD-03 은 관리자가 아닌 사용자 소유');
        System.runAs(admin) {
            Assert.isTrue(Database.update(new Property__c(Id = sd03.Id, Status__c = 'Sold'), AccessLevel.USER_MODE).isSuccess(), '관리자: 타인 소유 레코드 상태 변경 성공');
            Assert.areEqual('Sold', [SELECT Status__c FROM Property__c WHERE Id = :sd03.Id WITH USER_MODE].Status__c, '관리자: 변경된 상태 조회');
            Assert.isTrue(Database.delete(new Property__c(Id = sd03.Id), AccessLevel.USER_MODE).isSuccess(), '관리자: 타인 소유 레코드 삭제 성공');
        }
        Assert.areEqual(0, [SELECT COUNT() FROM Property__c WHERE Id = :sd03.Id], 'SD-03 삭제됨');
    }

    /**
     * (ENHANCED 2026-10-28: 코드 리뷰 M-1) insert/update/delete 를 각각 검증.
     * DH-DEV 실측: USER_MODE DML 에 오브젝트 CRUD 가 없으면
     * System.TypeException 'DML operation <INSERT|UPDATE|DELETE> not allowed on Property__c' 발생.
     * 다른 예외(검증 규칙·필수값 등)는 catch 하지 않아 테스트 실패로 드러난다.
     */
    @IsTest
    static void ac053_agentDmlDenied() {
        Property__c sd02 = [SELECT Id FROM Property__c WHERE Name = '해운대 오션뷰' LIMIT 1];
        System.runAs(PropertyTestDataFactory.getUser('agent')) {
            try {
                Database.insert(new Property__c(Name = '[E2E] 상담원 등록', Price__c = 100000000), AccessLevel.USER_MODE);
                Assert.fail('상담원 insert 는 거부되어야 한다');
            } catch (TypeException e) {
                assertCrudDenied(e, 'INSERT');
            }
            try {
                Database.update(new Property__c(Id = sd02.Id, Status__c = 'Sold'), AccessLevel.USER_MODE);
                Assert.fail('상담원 update 는 거부되어야 한다');
            } catch (TypeException e) {
                assertCrudDenied(e, 'UPDATE');
            }
            try {
                Database.delete(new Property__c(Id = sd02.Id), AccessLevel.USER_MODE);
                Assert.fail('상담원 delete 는 거부되어야 한다');
            } catch (TypeException e) {
                assertCrudDenied(e, 'DELETE');
            }
        }
        Assert.areEqual('Available', [SELECT Status__c FROM Property__c WHERE Id = :sd02.Id].Status__c, 'SD-02 상태 미변경');
        Assert.areEqual(0, [SELECT COUNT() FROM Property__c WHERE Name = '[E2E] 상담원 등록'], '상담원 등록 레코드 0건');
    }

    private static void assertCrudDenied(Exception e, String operation) {
        Assert.areEqual('DML operation ' + operation + ' not allowed on Property__c', e.getMessage(),
            operation + ' 거부 사유는 오브젝트 CRUD 권한 부족이어야 한다');
    }
}