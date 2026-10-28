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

    @IsTest
    static void ac053_agentDmlDenied() {
        Property__c sd02 = [SELECT Id FROM Property__c WHERE Name = '해운대 오션뷰' LIMIT 1];
        System.runAs(PropertyTestDataFactory.getUser('agent')) {
            Integer denied = 0;
            try {
                Database.insert(new Property__c(Name = '[E2E] 상담원 등록', Price__c = 100000000), AccessLevel.USER_MODE);
            } catch (Exception e) {
                denied++;
            }
            try {
                Database.update(new Property__c(Id = sd02.Id, Status__c = 'Sold'), AccessLevel.USER_MODE);
            } catch (Exception e) {
                denied++;
            }
            try {
                Database.delete(new Property__c(Id = sd02.Id), AccessLevel.USER_MODE);
            } catch (Exception e) {
                denied++;
            }
            Assert.areEqual(3, denied, '상담원 insert/update/delete 는 모두 거부되어야 한다');
        }
        Assert.areEqual('Available', [SELECT Status__c FROM Property__c WHERE Id = :sd02.Id].Status__c);
        Assert.areEqual(0, [SELECT COUNT() FROM Property__c WHERE Name = '[E2E] 상담원 등록']);
    }
}