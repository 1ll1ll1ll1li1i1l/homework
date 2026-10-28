---
subject: 'WI-1.001 데이터 모델 + 권한 세트 + 표준 CRUD + KRW'   # Workitem의 Subject 필드와 Sync
assignee: 'junghyuck.choi.85647fe082a1@agentforce.com'          # User Id로 변환하여 Sync에 사용
# 추적성 (PROJECT-PLAN v1.1 기준 — 코드네임 변경 금지)
wi-id: 'WI-1.001'
depends-on: []                                                   # PROJECT-PLAN §5 선행 = "-"
req-ids: [REQ-001, REQ-002, REQ-004]
ac-ids: [AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-009, AC-010, AC-011, AC-012, AC-053, AC-060, AC-061, AC-067]
pipeline: 'DreamHouse Pipeline'
# ⬇ 도구가 자동 stamp (절대 손으로 편집 금지)
project_id: null                     # Project의 record id
workitem_no: null                    # Workitem의 Name 필드값
salesforce_id: null                  # Workitem의 record id
status: null                         # Workitem의 Status 필드값
synced_at: null                      # Sync 타임스탬프
---

# WI-1.001 — 데이터 모델 + 권한 세트 + 표준 CRUD + KRW (FIT)

> Cheatsheet STEP 6 산출물 (Lab 6.3, work_item_manager). 기준: `docs/PROJECT-PLAN.md` v1.1 §5 · `docs/phases/PHASE-PLAN-01.md` v1.1 §4.
> 이 문서만 보고 개발할 수 있도록 필요한 값·코드·AC 를 모두 옮겨 적었다. 원본과 다르면 원본을 기준으로 하고 이 문서를 ENHANCE 한다.

## 0. 헤더

| 항목 | 내용 |
|---|---|
| Work Item | **WI-1.001** |
| Description (PROJECT-PLAN 원문) | `Property__c` 오브젝트·필드(Status 기본값 Available, Price KRW Currency(12,0)) + 권한 세트 2종(상담원 Read 전용 / 관리자 CRUD+Modify All) + 표준 레코드 페이지·페이지 레이아웃(등록·수정·삭제, 필수값) + `매물` 오브젝트 탭(`Property__c`) + **KRW 통화/로케일 확인·조정**(DEV/SIT/UAT/HUB) — REQ-001, REQ-002, REQ-004 (ENHANCED 2026-10-28: I-03 — `Property__c` 오브젝트 탭을 WI-1.005 에서 WI-1.001 로 이동, 공수 변경 없음) |
| Phase | Phase 1 — MVP (2026-10-29 ~ 2026-10-30, 1 스프린트) |
| 모듈 | 데이터 모델(`Property__c`) · 보안(권한 세트·OWD) · 표준 UI(레이아웃·리스트 뷰·오브젝트 탭) · 오그 설정(KRW/로캘) |
| 우선순위 | **Must** (분류 FIT) |
| 상태 | [ ] 1차 완료(Playwright 대기) — 메타데이터·Apex DH-DEV 배포 완료, AC-003 은 DH-DEV Company Information KRW 수동 조정 대기 (ENHANCED 2026-10-28: backend_developer 1차 구현) |
| 선행 (Depends-on) | 없음 (`-`) — 루트 WI |
| 후행 | WI-1.002 |
| 예상 소요 | **0.3 M/D (2.5h)** = REQ-001 1.0h + REQ-002 0.5h + REQ-004 0.5h + KRW/로케일 0.5h |
| 일정 | 2026-10-29(목) 11:00–13:30 (Lab 9) |
| 담당 에이전트 | backend_developer(메타데이터·Apex 테스트) · test_engineer(Playwright) · code_reviewer |
| 대상 오그 | 개발·배포 DH-DEV / 점검 DH-DEV·DH-SIT·DH-UAT·DH-HUB(PROD) |
| 커밋명 | `WI-1.001-property-data-model` |

## 1. 상세 개요

DreamHouse Lite 의 모든 기능이 올라설 **데이터 기반**을 만든다. 커스텀 오브젝트 `Property__c`(라벨 `매물`)와 필드 9개(Name, Address__c, City__c, State__c, Price__c, Bedrooms__c, Bathrooms__c, Picture_URL__c, Status__c)를 메타데이터로 정의한다. 가격은 **KRW 단일 통화** Currency(12,0)이고, 상태는 `Available`(판매중) / `Under Contract`(계약중) / `Sold`(판매완료) 3값 선택목록이며 기본값은 `Available` 이다(고객 결정 OQ-02/OQ-04, D-16/D-17). OWD 는 **Public Read Only**(AD-03)로 두고, 편집 권한은 권한 세트로만 부여한다.

권한은 2종 권한 세트로 나눈다. `DreamHouse_Agent`(상담원)는 **조회 전용**, `DreamHouse_Admin`(관리자)는 **CRUD + View All + Modify All**(타인 소유 레코드 수정·삭제, 물리 삭제·상태 변경은 관리자만 — OQ-07/D-18)이다. 등록·수정·삭제는 커스텀 UI 를 만들지 않고 **표준 레코드 페이지 + 페이지 레이아웃**(필수값 Name·Price__c·Status__c)으로 처리한다(D-02). 표준 목록·레코드 화면 진입점으로 `매물` 오브젝트 탭(`Property__c`)을 이 WI 에서 만들고 두 권한 세트에 `tabSettings` Visible 을 준다(I-03). Apex 클래스 권한은 WI-1.003, 앱·`매물 탐색` 탭 권한은 WI-1.005 에서 ENHANCE 한다.

**첫 작업은 오그 통화·로캘 점검**이다. `config/project-scratch-def.json` 에는 `"language": "en_US"` 만 있어 DH-DEV/SIT/UAT 의 기본 통화가 USD 일 가능성이 높다. AC-003(`getDefaultCurrency()='KRW'`)과 모든 KRW 표시 AC 가 여기에 달려 있다. 4개 오그(DH-DEV/SIT/UAT/HUB)를 **읽기 전용으로 점검**하고, DH-DEV/SIT/UAT 는 Company Information 에서 KRW·ko_KR 로 조정한다. **DH-HUB(PROD)는 점검만 하며, 통화·로캘 변경은 사용자 명시 승인 전에는 실행하지 않는다**(I-08, 자동 변경 계획 없음). 진행 방식은 "AI 로 먼저 프로토타입(backend_developer 가 메타데이터·테스트 초안) → 사람이 AC 로 검증"이다.

> UI 와이어프레임: 이 WI 는 커스텀 UI 가 없고 **표준 목록·레코드 페이지**만 사용하므로 와이어프레임 대상이 아니다. 아래는 페이지 레이아웃 필드 배치 참고용이다.

```
┌─ 매물 > 강남 래미안 아파트 ───────────────────── [편집] [삭제] (관리자만) ┐
│ 정보                                                                      │
│  매물명*  강남 래미안 아파트          상태*   판매중                        │
│  가격*    ₩2,500,000,000              침실    4                            │
│  주소     서울특별시 강남구 테헤란로 101  욕실    2                         │
│  도시     서울                        사진 URL https://…/sd01.jpg          │
│  시/도    (OQ-01 결과에 따라 배치)                                          │
└──────────────────────────────────────────────────────────────────────────┘
  * = 필수 (Name·Price__c·Status__c)   상담원: [새로 만들기]/[편집]/[삭제]/연필 아이콘 미노출
```

## 2. 선행 조건

- [X] 선행 WI 없음 확인 (루트) — CLAUDE.md 진행 규칙 1
- [ ] 이 작업에 `.claude/agents/` 전문 에이전트(backend_developer / test_engineer / code_reviewer) 사용 — 진행 규칙 0 (2026-10-28: backend_developer 완료, test_engineer·code_reviewer 대기)
- [X] `git checkout main ; git pull` 후 DevOps Center 가 만든 WI-1.001 Feature Branch fetch/checkout (Lab 8 등록 이후) — 브랜치 `WI-000003`
- [X] DH-DEV/DH-SIT/DH-UAT/DH-HUB 인증 확인: `sf org list` (별칭 4개 Connected) — DH-HUB 는 `core` 와 같은 사용자 별칭, 4개 오그 모두 Apex 실행 성공
- [ ] Playwright 실행 환경: `@playwright/test` 설치·`playwright.config.ts` 존재 확인 (현재 `package.json` devDependencies 에 없음 → test_engineer 가 추가)
- [X] `.gitignore` 에 `tests/e2e/.auth/` 포함 확인 (현재 포함됨, AC-067) — `.gitignore` 46행
- [X] 미결 고객 결정 확인: OQ-01(State__c, CK-11) · OQ-03(필수값·가격 > 0, CK-05) — 미확정이면 아래 기본값으로 진행 (2026-10-28: 미확정 → State__c 생성·레이아웃 배치, 유효성 규칙 미생성)

## 3. 세부 작업 (Numbered sub-tasks)

1. **(첫 작업) 오그 기본 통화 KRW·로캘 점검/조정** (D-16, CK-15, R-08) — §4.1
   1. `scripts/apex/check-org-locale.apex`(읽기 전용) 작성 → 4개 오그 점검 → §4.1 점검표 기입
   2. DH-DEV/SIT/UAT: Company Information → Currency Locale `Korean (South Korea) - KRW`, Default Locale `ko_KR`, Time Zone `Asia/Seoul` 조정 → 재점검 `CURRENCY=KRW`, `MULTI=false`
   3. **DH-HUB(PROD): 점검만(읽기 전용).** 변경이 필요하면 결과표를 첨부해 사용자(PM/RM)에게 **명시 승인 요청** — 승인 전 실행 금지(I-08). 승인 시 Lab 12 PROD Promotion 전에 수행
   4. 다중 통화(Multi-Currency)는 **절대 켜지 않는다**(되돌릴 수 없음, AC-003 실패)
   5. (확인 필요) scratch def `"country": "KR"` 효과를 임시 오그(`DH-TMP`, 1일)로 확인 → 반영 여부 결정, 결과 기록(I-07)
2. `Property__c` 오브젝트 — 라벨 `매물`, Name = Text `매물명`, `sharingModel` = `Read`(Public Read Only, AD-03)
3. 필드 8개 + Name: Address__c Text(255), City__c Text(100), State__c Text(100)(OQ-01 — 미확정이면 생성하고 레이아웃 배치는 선택), Price__c Currency(12,0) 필수, Bedrooms__c Number(2,0), Bathrooms__c Number(2,0), Picture_URL__c URL, Status__c Picklist 필수·restricted·기본값 Available (라벨 한글 판매중/계약중/판매완료)
4. 페이지 레이아웃 `Property__c-Property Layout` — 필수 Name·Price__c·Status__c, 표준 New/Edit/Delete 버튼
5. 유효성 규칙 `Price_Must_Be_Positive`(가격 > 0, 문구 `가격은 0보다 커야 합니다.`) — **CK-05 확정 시에만** 생성. 미확정이면 만들지 않음(AC-061 잠정)
6. 리스트 뷰 `All`(전체 매물) — 표준 목록 화면용 (AC-006/009 진입)
7. `Property__c` 오브젝트 탭(라벨 `매물`, `tabs/Property__c.tab-meta.xml`) + 두 권한 세트 `tabSettings` `Property__c` = Visible (I-03). 앱 내비게이션 추가는 WI-1.005
8. 권한 세트 `DreamHouse_Agent`(Read 전용) / `DreamHouse_Admin`(CRUD + View All + Modify All) — 필수 필드(Price__c·Status__c)는 `fieldPermissions` 에 넣지 않음(배포 오류)
9. Playwright 사용자 3명(agent/admin/noaccess) 정의 — 로캘 ko_KR, 언어 ko, 시간대 Asia/Seoul (`config/users/*-user-def.json`), 생성·권한 세트 할당. 라이선스 수 확인(I-04)
10. `PropertyTestDataFactory`(SD-01~SD-10 생성, 권한 세트 사용자 생성 헬퍼) + `PropertyModelTest`(AC-001~005 권한 벡터, AC-053)
11. Playwright `tests/e2e/WI-1.001-property-crud.spec.ts` — 탭 비의존(표준 화면) 부분 1차 실행, `매물 탐색` 탭 의존 단계는 `@explore`
12. `sf project deploy start --dry-run` → `sf project deploy start -o DH-DEV`, 권한 세트 할당, 관리자/상담원 수동 확인, 이월 AC 를 PHASE-PLAN-01 §3.4 에 기록, 커밋

## 4. 주요 타입 / API · 코드 예시

### 4.1 작업 1 — KRW 통화·로캘 점검/조정 (D-16 / CK-15 / I-08)

**전제 사실**
- DH-DEV/SIT/UAT 는 `language: en_US` 만 지정한 scratch def 로 만든 오그 → 기본 통화 USD·로캘 en_US 가능성 높음.
- DH-HUB 는 Developer Edition 이며 Dev Hub·DevOps Center·**PROD** 겸용 → 설정 변경은 운영 변경, 사람 승인 필수.
- AC-003 Apex 테스트는 실행 오그 설정에 의존 → **DH-HUB 가 KRW 가 아니면 Lab 12 PROD Promotion(Run all tests)에서 `PropertyModelTest.ac003` 실패**.

```apex
// scripts/apex/check-org-locale.apex (커밋 가능, 읽기 전용 — 오그를 변경하지 않음)
System.debug('CURRENCY=' + UserInfo.getDefaultCurrency());
System.debug('MULTI=' + UserInfo.isMultiCurrencyOrganization());
System.debug('LOCALE=' + UserInfo.getLocale() + ' TZ=' + UserInfo.getTimeZone().getID());
```

```powershell
# 4개 오그 점검 (읽기 전용). DH-HUB 도 점검만 — 변경 명령 없음
foreach ($o in 'DH-DEV','DH-SIT','DH-UAT','DH-HUB') {
  Write-Host "=== $o ==="
  sf apex run --file scripts/apex/check-org-locale.apex -o $o | Select-String 'CURRENCY=|MULTI=|LOCALE='
  sf data query -q "SELECT DefaultLocaleSidKey, LanguageLocaleKey, TimeZoneSidKey FROM Organization" -o $o
}
```

점검표 (실행 후 기입, 커밋 메시지 본문에도 요약):

| 오그 | 통화 | 다중 통화 | 조직 로캘 | 시간대 | 조치 | 조치 후 재점검 |
|---|---|---|---|---|---|---|
| DH-DEV | USD | false | en_US (언어 en_US) | America/Los_Angeles | **조정 필요** — Company Information UI 수동(A-1). Organization 은 API 수정 불가, 통화 기본값을 바꾸는 메타데이터 설정 없음 | (수동 조정 후 재점검) |
| DH-SIT | USD | false | en_US (언어 en_US) | America/Los_Angeles | 조정 필요 — A-1 수동 (Lab 12 전) | |
| DH-UAT | USD | false | en_US (언어 en_US) | America/Los_Angeles | 조정 필요 — A-1 수동 (Lab 12 전) | |
| DH-HUB (PROD) | USD | false | en_US (언어 en_US), 실행 사용자 로캘 ko_KR·TZ Asia/Seoul | America/Los_Angeles | **점검만 — 변경은 사용자 명시 승인 후(I-08)**. 미조정 시 Lab 12 `PropertyModelTest.ac003_currencyIsKrwSingle` 실패 | |

> (ENHANCED 2026-10-28: 점검 실행 결과 기입 — `scripts/apex/check-org-locale.apex` + Organization 조회. 4개 오그 모두 USD·단일 통화. 다중 통화는 어디에서도 켜지 않음. 오그 설정 변경은 실행하지 않음.)

조정 절차 (권장안 A — 이미 만든 오그):

| 순서 | 방법 | 대상 | 비고 |
|---|---|---|---|
| A-1 | Setup → Company Information → Edit → `Currency Locale` = `Korean (South Korea) - KRW`, `Default Locale` = `Korean (South Korea)`, `Default Time Zone` = `(GMT+09:00) Korean Standard Time (Asia/Seoul)` → Save | DH-DEV, DH-SIT, DH-UAT | 실제 항목명은 오그 UI 에서 확인 필요 |
| A-2 | DH-HUB 동일 방법 — DevOps Center 화면의 날짜·숫자 형식도 ko_KR 로 바뀜 | DH-HUB (PROD) | **사용자 명시 승인 전 실행 금지.** WI-1.001 범위는 점검만 |
| A-3 | 다중 통화 활성화 금지 | 전체 | 고정 규칙 |
| A-4 | 조정 후 점검 스크립트 재실행 → `CURRENCY=KRW`, `MULTI=false` | 조정한 오그 | |

- 오그 설정은 메타데이터 배포 대상이 아니다 → NFR-010(오그 직접 변경 금지) 예외로 기록하고, 점검·조정 결과를 이 문서 §4.1 표와 커밋 메시지 본문에 남긴다.
- 대안 B(확인 필요): scratch def 에 `"country": "KR"` 추가가 통화·로캘까지 바꾸는지 미검증 → `sf org create scratch -f config/project-scratch-def.json -a DH-TMP -d 1` 로 확인 후 삭제. 효과 없으면 "Scratch Org 생성 직후 A-1 수동 수행" 절차를 남긴다. 기존 DH-DEV/SIT/UAT 재생성(대안 C)은 파이프라인 재연결 비용 때문에 권고하지 않는다.

```json
// config/project-scratch-def.json — 제안 (효과 확인 후 반영 여부 결정)
{
  "orgName": "DreamHouse Lite",
  "edition": "Developer",
  "country": "KR",
  "language": "en_US",
  "features": ["EnableSetPasswordInApi"],
  "settings": {
    "lightningExperienceSettings": { "enableS1DesktopEnabled": true },
    "mobileSettings": { "enableS1EncryptedStoragePref2": false }
  }
}
```

### 4.2 오브젝트·필드 메타데이터

```xml
<!-- force-app/main/default/objects/Property__c/Property__c.object-meta.xml (발췌) -->
<?xml version="1.0" encoding="UTF-8"?>
<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
    <label>매물</label>
    <pluralLabel>매물</pluralLabel>
    <nameField><label>매물명</label><type>Text</type></nameField>
    <sharingModel>Read</sharingModel>                 <!-- Public Read Only (AD-03) -->
    <externalSharingModel>Read</externalSharingModel>
    <deploymentStatus>Deployed</deploymentStatus>
    <enableSearch>true</enableSearch>
</CustomObject>
```

```xml
<!-- objects/Property__c/fields/Price__c.field-meta.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Price__c</fullName>
    <label>가격</label>
    <type>Currency</type>
    <precision>12</precision>
    <scale>0</scale>
    <required>true</required>
    <trackTrending>false</trackTrending>
</CustomField>
```

```xml
<!-- objects/Property__c/fields/Status__c.field-meta.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Status__c</fullName>
    <label>상태</label>
    <type>Picklist</type>
    <required>true</required>
    <valueSet>
        <restricted>true</restricted>
        <valueSetDefinition>
            <sorted>false</sorted>
            <value><fullName>Available</fullName><default>true</default><label>판매중</label></value>
            <value><fullName>Under Contract</fullName><default>false</default><label>계약중</label></value>
            <value><fullName>Sold</fullName><default>false</default><label>판매완료</label></value>
        </valueSetDefinition>
    </valueSet>
</CustomField>
```

```xml
<!-- objects/Property__c/fields/Bedrooms__c.field-meta.xml (Bathrooms__c 동일, 라벨 '욕실') -->
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Bedrooms__c</fullName>
    <label>침실</label>
    <type>Number</type>
    <precision>2</precision>
    <scale>0</scale>
    <required>false</required>
</CustomField>
```

| 필드 | 타입 | 길이/정밀도 | 라벨 | 필수 | AC-001 기대 describe |
|---|---|---|---|---|---|
| Name | Text (표준) | 80 | 매물명 | Y | STRING, 80 |
| Address__c | Text | 255 | 주소 | N | STRING, 255 |
| City__c | Text | 100 | 도시 | N | STRING, 100 |
| State__c | Text | 100 | 시/도 | N | OQ-01/CK-11 |
| Price__c | Currency | 12, 0 | 가격 | Y | CURRENCY, 12·0 |
| Bedrooms__c | Number | 2, 0 | 침실 | N | DOUBLE, 2·0 |
| Bathrooms__c | Number | 2, 0 | 욕실 | N | DOUBLE, 2·0 |
| Picture_URL__c | URL | — | 사진 URL | N | URL |
| Status__c | Picklist (restricted) | — | 상태 | Y, 기본 Available | PICKLIST |

```xml
<!-- objects/Property__c/listViews/All.listView-meta.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<ListView xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>All</fullName>
    <columns>NAME</columns>
    <columns>City__c</columns>
    <columns>Price__c</columns>
    <columns>Status__c</columns>
    <filterScope>Everything</filterScope>
    <label>전체 매물</label>
</ListView>
```

```xml
<!-- validationRules/Price_Must_Be_Positive.validationRule-meta.xml — CK-05 확정 시에만 생성 (AC-061 잠정) -->
<ValidationRule xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Price_Must_Be_Positive</fullName>
    <active>true</active>
    <errorConditionFormula>Price__c &lt;= 0</errorConditionFormula>
    <errorDisplayField>Price__c</errorDisplayField>
    <errorMessage>가격은 0보다 커야 합니다.</errorMessage>
</ValidationRule>
```

### 4.3 오브젝트 탭 (I-03)

```xml
<!-- force-app/main/default/tabs/Property__c.tab-meta.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<CustomTab xmlns="http://soap.sforce.com/2006/04/metadata">
    <customObject>true</customObject>
    <motif>Custom24: Building</motif>
</CustomTab>
```

- 탭 라벨은 오브젝트 라벨 `매물` 을 따른다. 표준 목록은 `매물` 탭으로 진입한다(URL 직접 입력 방식은 쓰지 않음 — I-03 결정).

### 4.4 권한 세트 (tabSettings 포함)

```xml
<!-- permissionsets/DreamHouse_Agent.permissionset-meta.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<PermissionSet xmlns="http://soap.sforce.com/2006/04/metadata">
    <label>DreamHouse Agent</label>
    <description>상담원 — Property__c 조회 전용 (OQ-07, D-18)</description>
    <hasActivationRequired>false</hasActivationRequired>
    <objectPermissions>
        <object>Property__c</object>
        <allowRead>true</allowRead>
        <allowCreate>false</allowCreate>
        <allowEdit>false</allowEdit>
        <allowDelete>false</allowDelete>
        <viewAllRecords>false</viewAllRecords>
        <modifyAllRecords>false</modifyAllRecords>
    </objectPermissions>
    <fieldPermissions><field>Property__c.Address__c</field><readable>true</readable><editable>false</editable></fieldPermissions>
    <fieldPermissions><field>Property__c.City__c</field><readable>true</readable><editable>false</editable></fieldPermissions>
    <fieldPermissions><field>Property__c.State__c</field><readable>true</readable><editable>false</editable></fieldPermissions>
    <fieldPermissions><field>Property__c.Bedrooms__c</field><readable>true</readable><editable>false</editable></fieldPermissions>
    <fieldPermissions><field>Property__c.Bathrooms__c</field><readable>true</readable><editable>false</editable></fieldPermissions>
    <fieldPermissions><field>Property__c.Picture_URL__c</field><readable>true</readable><editable>false</editable></fieldPermissions>
    <!-- Price__c·Status__c 는 필수 필드 → fieldPermissions 에 넣으면 배포 오류. 오브젝트 권한으로 제어 -->
    <!-- (WI-1.003 ENHANCE) classAccesses PropertyController -->
    <!-- (WI-1.005 ENHANCE) applicationVisibilities DreamHouse_Lite, tabSettings Property_Explorer -->
    <tabSettings><tab>Property__c</tab><visibility>Visible</visibility></tabSettings>
</PermissionSet>
```

```xml
<!-- permissionsets/DreamHouse_Admin.permissionset-meta.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<PermissionSet xmlns="http://soap.sforce.com/2006/04/metadata">
    <label>DreamHouse Admin</label>
    <description>관리자 — Property__c CRUD + Modify All, 물리 삭제·상태 변경 (OQ-07, D-18, AD-03)</description>
    <hasActivationRequired>false</hasActivationRequired>
    <objectPermissions>
        <object>Property__c</object>
        <allowRead>true</allowRead>
        <allowCreate>true</allowCreate>
        <allowEdit>true</allowEdit>
        <allowDelete>true</allowDelete>
        <viewAllRecords>true</viewAllRecords>       <!-- Modify All 의 전제 -->
        <modifyAllRecords>true</modifyAllRecords>   <!-- 타인 소유 레코드 수정·삭제 -->
    </objectPermissions>
    <fieldPermissions><field>Property__c.Address__c</field><readable>true</readable><editable>true</editable></fieldPermissions>
    <fieldPermissions><field>Property__c.City__c</field><readable>true</readable><editable>true</editable></fieldPermissions>
    <fieldPermissions><field>Property__c.State__c</field><readable>true</readable><editable>true</editable></fieldPermissions>
    <fieldPermissions><field>Property__c.Bedrooms__c</field><readable>true</readable><editable>true</editable></fieldPermissions>
    <fieldPermissions><field>Property__c.Bathrooms__c</field><readable>true</readable><editable>true</editable></fieldPermissions>
    <fieldPermissions><field>Property__c.Picture_URL__c</field><readable>true</readable><editable>true</editable></fieldPermissions>
    <tabSettings><tab>Property__c</tab><visibility>Visible</visibility></tabSettings>
</PermissionSet>
```

- **(확인 필요, I-05)** 필수 필드 FLS 는 항상 읽기·편집 가능으로 취급된다. 상담원의 `Status__c.isUpdateable()` 이 AC-004 기대값 `false` 를 돌려주는지 확인한다. `true` 이면 requirements_analyst 와 AC-004 해석을 협의하고, 상담원 상태 변경 불가는 AC-053(USER_MODE DML 거부)으로 보장한다.

### 4.5 페이지 레이아웃 (발췌)

```xml
<!-- layouts/Property__c-Property Layout.layout-meta.xml (발췌) -->
<Layout xmlns="http://soap.sforce.com/2006/04/metadata">
    <layoutSections>
        <label>정보</label>
        <style>TwoColumnsLeftToRight</style>
        <layoutColumns>
            <layoutItems><behavior>Required</behavior><field>Name</field></layoutItems>
            <layoutItems><behavior>Required</behavior><field>Price__c</field></layoutItems>
            <layoutItems><behavior>Edit</behavior><field>Address__c</field></layoutItems>
            <layoutItems><behavior>Edit</behavior><field>City__c</field></layoutItems>
            <layoutItems><behavior>Edit</behavior><field>State__c</field></layoutItems>  <!-- OQ-01 결과에 따라 배치 -->
        </layoutColumns>
        <layoutColumns>
            <layoutItems><behavior>Required</behavior><field>Status__c</field></layoutItems>
            <layoutItems><behavior>Edit</behavior><field>Bedrooms__c</field></layoutItems>
            <layoutItems><behavior>Edit</behavior><field>Bathrooms__c</field></layoutItems>
            <layoutItems><behavior>Edit</behavior><field>Picture_URL__c</field></layoutItems>
        </layoutColumns>
    </layoutSections>
    <!-- 표준 New/Edit/Delete 버튼 유지 (상담원은 오브젝트 권한이 없어 자동 미노출) -->
</Layout>
```

### 4.6 Playwright 사용자 정의

```json
// config/users/agent-user-def.json (admin/noaccess 도 같은 형식 — 비밀번호·토큰 미포함)
{
  "Username": "agent.dreamhouse.dev@example.invalid",
  "LastName": "Agent",
  "Email": "junghyuck.choi@dkbmc.com",
  "profileName": "Standard User",
  "permsets": ["DreamHouse_Agent"],
  "LocaleSidKey": "ko_KR",
  "LanguageLocaleKey": "ko",
  "TimeZoneSidKey": "Asia/Seoul"
}
```

```powershell
sf org create user --definition-file config/users/agent-user-def.json -o DH-DEV
sf org create user --definition-file config/users/admin-user-def.json -o DH-DEV     # permsets: DreamHouse_Admin
sf org create user --definition-file config/users/noaccess-user-def.json -o DH-DEV  # permsets 없음
```

- Username 은 전역 고유 → 오그별 접미사(`.dev`, `.sit`, `.uat`). 인증 상태 `tests/e2e/.auth/*.json` 은 **커밋 금지**(AC-067).
- 사용자 언어 `ko` → 표준 버튼 `새로 만들기`·`편집`·`삭제`·`저장` 을 한글로 찾는다(AC-006/009~012).
- (확인 필요, I-04) DE Scratch Org 의 Salesforce 라이선스로 3명 생성 가능한지. 부족하면 `Standard Platform User` 프로필.
- **(확인 필요 — 위험)** 표준 프로필(`Standard User` 등)은 커스텀 오브젝트에 기본 CRUD 를 가질 수 있다. 그러면 ① `noaccess` 가 Property__c 를 조회할 수 있어 AC-055 가 실패하고 ② `agent` 가 프로필로 생성·편집 권한을 얻어 AC-004/006/053 이 실패한다. 배포 직후 `agent`·`noaccess` 프로필의 Property__c 오브젝트 권한을 확인하고, 권한이 있으면 사용자 프로필을 `Minimum Access - Salesforce` 로 바꾸는 방안을 requirements_analyst 와 협의한다(AC 문서 §1.3 은 noaccess = Standard User 로 정의).
- (ENHANCED 2026-10-28: 배포 후 확인) DH-DEV 에서 `Property__c` ObjectPermissions 는 System Administrator 프로필·DreamHouse_Admin·DreamHouse_Agent 에만 있고 `Standard User`·`Standard Platform User` 프로필에는 없음 → 위 위험은 DH-DEV 에서 발생하지 않음. I-04: DH-DEV UserLicense `Salesforce` 총 2·사용 1(1명만 추가 가능), `Salesforce Platform` 총 3·사용 0 → Playwright 사용자 3명 중 2명은 `Standard Platform User` 프로필 필요. Playwright 사용자는 아직 만들지 않음(test_engineer, Lab 10).

### 4.7 Apex — `PropertyTestDataFactory` · `PropertyModelTest`

```apex
// classes/PropertyTestDataFactory.cls (@IsTest — SD-01~SD-10 은 AC 문서 §1.4 값 그대로)
@IsTest
public with sharing class PropertyTestDataFactory {
    public static List<Property__c> createSampleProperties() {
        List<Property__c> rows = new List<Property__c>{
            p('강남 래미안 아파트',   '서울특별시 강남구 테헤란로 101',            '서울', 2500000000L, 4, 2, 'Available',      'https://example.invalid/sd01.jpg'),
            p('해운대 오션뷰',        '부산광역시 해운대구 해운대해변로 22',        '부산',  850000000L, 3, 2, 'Available',      'https://example.invalid/sd02.jpg'),
            p('판교 테크노 빌라',     '경기도 성남시 분당구 판교역로 33',          '성남', 1200000000L, 3, 2, 'Under Contract', 'https://example.invalid/sd03.jpg'),
            p('마포 한강 오피스텔',   '서울특별시 마포구 마포대로 44',             '서울',  450000000L, 1, 1, 'Available',      'https://example.invalid/sd04.jpg'),
            p('광교 호수 타운하우스', '경기도 수원시 영통구 광교호수로 55',        '수원',  980000000L, 4, 3, 'Sold',           'https://example.invalid/sd05.jpg'),
            p('둔산 센트럴 아파트',   '대전광역시 서구 둔산로 66',                 '대전',  520000000L, 3, 1, 'Available',      'https://example.invalid/sd06.jpg'),
            p('제주 애월 전원주택',   '제주특별자치도 제주시 애월읍 애월해안로 77', '제주', 1650000000L, 5, 3, 'Under Contract', 'https://example.invalid/sd07.jpg'),
            p('송파 잠실 아파트',     '서울특별시 송파구 올림픽로 88',             '서울', 1980000000L, 3, 2, 'Sold',           'https://example.invalid/sd08.jpg'),
            p('송도 센트럴 오피스텔', '인천광역시 연수구 센트럴로 99',             '인천',  350000000L, 1, 1, 'Available',      null),
            p('서면 스카이 빌라',     '부산광역시 부산진구 서면로 10',             '부산',  720000000L, 2, 1, 'Available',      'https://invalid.example.invalid/none.jpg')
        };
        insert rows;   // 1회 DML (루프 내 DML 금지)
        return rows;
    }

    private static Property__c p(String n, String a, String c, Long price, Integer b, Integer t, String s, String pic) {
        return new Property__c(Name = n, Address__c = a, City__c = c, Price__c = price,
                               Bedrooms__c = b, Bathrooms__c = t, Status__c = s, Picture_URL__c = pic);
    }

    /** alias 로 사용자 생성 + 권한 세트 할당. Setup 객체 DML 은 runAs 로 분리 (MIXED_DML 방지) */
    public static User createUserWithPermSet(String alias, String permSetName) {
        User u = newUser(alias);
        System.runAs(new User(Id = UserInfo.getUserId())) {
            insert u;
            PermissionSet ps = [SELECT Id FROM PermissionSet WHERE Name = :permSetName LIMIT 1];
            insert new PermissionSetAssignment(AssigneeId = u.Id, PermissionSetId = ps.Id);
        }
        return u;
    }

    public static User getUser(String alias) {
        return [SELECT Id FROM User WHERE Alias = :alias AND Username LIKE '%@dreamhouse.test' LIMIT 1];
    }

    private static User newUser(String alias) {
        // (확인 필요) 표준 프로필 이름은 로캘에 따라 번역될 수 있음 → 두 이름 모두 허용. 프로필 선택은 §4.6 위험 항목 참고
        Profile prof = [SELECT Id FROM Profile WHERE Name IN ('Standard User', '표준 사용자') LIMIT 1];
        String uname = alias + '.' + System.currentTimeMillis() + '@dreamhouse.test';
        return new User(Alias = alias, Username = uname, LastName = alias, Email = alias + '@example.invalid',
                        ProfileId = prof.Id, EmailEncodingKey = 'UTF-8', LanguageLocaleKey = 'ko',
                        LocaleSidKey = 'ko_KR', TimeZoneSidKey = 'Asia/Seoul');
    }
}
```

- `createUserWithoutPermSet('noaccess')` 는 WI-1.003(`PropertyControllerTest`, AC-055)에서 추가한다(ENHANCE).

```apex
// classes/PropertyModelTest.cls
@IsTest
private class PropertyModelTest {
    @TestSetup
    static void setup() {
        PropertyTestDataFactory.createSampleProperties();                       // SD-01~SD-10
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
        Assert.areEqual(80, f.get('Name').getDescribe().getLength());
        Assert.areEqual(255, f.get('Address__c').getDescribe().getLength());
        Assert.areEqual(100, f.get('City__c').getDescribe().getLength());
        Assert.areEqual(Schema.DisplayType.DOUBLE, f.get('Bedrooms__c').getDescribe().getType());
        Assert.areEqual(Schema.DisplayType.DOUBLE, f.get('Bathrooms__c').getDescribe().getType());
        Assert.areEqual(Schema.DisplayType.URL, f.get('Picture_URL__c').getDescribe().getType());
        Assert.areEqual(Schema.DisplayType.PICKLIST, f.get('Status__c').getDescribe().getType());
    }

    @IsTest
    static void ac002_statusValuesAndDefault() {
        List<String> active = new List<String>();
        String defaultValue;
        for (Schema.PicklistEntry e : Property__c.Status__c.getDescribe().getPicklistValues()) {
            if (e.isActive()) active.add(e.getValue());
            if (e.isDefaultValue()) defaultValue = e.getValue();
        }
        Assert.areEqual(new List<String>{ 'Available', 'Under Contract', 'Sold' }, active);
        Assert.areEqual('Available', defaultValue);
        Property__c r = new Property__c(Name = '[E2E] 기본값 확인', Price__c = 100000000);
        insert r;
        Assert.areEqual('Available', [SELECT Status__c FROM Property__c WHERE Id = :r.Id].Status__c);
    }

    @IsTest
    static void ac003_currencyIsKrwSingle() {
        Assert.areEqual('KRW', UserInfo.getDefaultCurrency(), 'D-16: 오그 기본 통화 KRW');
        Assert.isFalse(UserInfo.isMultiCurrencyOrganization());
        Assert.areEqual(2500000000L, [SELECT Price__c FROM Property__c WHERE Name = '강남 래미안 아파트'].Price__c);
    }

    @IsTest
    static void ac004_agentPermissionVector() {
        System.runAs(PropertyTestDataFactory.getUser('agent')) {
            Schema.DescribeSObjectResult d = Schema.SObjectType.Property__c;
            Assert.isTrue(d.isAccessible());
            Assert.isFalse(d.isCreateable());
            Assert.isFalse(d.isUpdateable());
            Assert.isFalse(d.isDeletable());
            Assert.isFalse(Schema.SObjectType.Property__c.fields.Status__c.isUpdateable()); // I-05 확인 필요
            // "조회 결과 10건" 부분은 WI-1.003 PropertyControllerTest 에서 검증 (이월)
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
            try { Database.insert(new Property__c(Name = '[E2E] 상담원 등록', Price__c = 100000000), AccessLevel.USER_MODE); }
            catch (Exception e) { denied++; }
            try { Database.update(new Property__c(Id = sd02.Id, Status__c = 'Sold'), AccessLevel.USER_MODE); }
            catch (Exception e) { denied++; }
            try { Database.delete(new Property__c(Id = sd02.Id), AccessLevel.USER_MODE); }
            catch (Exception e) { denied++; }
            Assert.areEqual(3, denied, '상담원 insert/update/delete 는 모두 거부되어야 한다');
        }
        Assert.areEqual('Available', [SELECT Status__c FROM Property__c WHERE Id = :sd02.Id].Status__c);
        Assert.areEqual(0, [SELECT COUNT() FROM Property__c WHERE Name = '[E2E] 상담원 등록']);
    }
}
```

### 4.8 Playwright spec 골격

```ts
// tests/e2e/WI-1.001-property-crud.spec.ts
import { test, expect } from '@playwright/test';

test.describe('WI-1.001 상담원 표준 화면', () => {
  test.use({ storageState: 'tests/e2e/.auth/agent.json' });
  test('AC-006 상담원에게 새로 만들기·편집·삭제 미노출', async ({ page }) => {
    // 매물 탭 목록 → '새로 만들기' 0개 / SD-02 레코드 → '편집'·'삭제'·연필 아이콘 0개, 값 '해운대 오션뷰'·'₩850,000,000' 표시
  });
});

test.describe.serial('WI-1.001 관리자 CRUD (AC-009 → 011 → 012 같은 레코드)', () => {
  test.use({ storageState: 'tests/e2e/.auth/admin.json' });
  test('AC-009 등록 — 표준 화면', async ({ page }) => { /* 성공 토스트, 상태 '판매중', 가격 '₩1,100,000,000' */ });
  test('AC-009 등록 — 매물 탐색 검색', { tag: '@explore' }, async ({ page }) => { /* filter-keyword '성수' → property-card 1 */ });
  test('AC-010 필수값 누락 차단', async ({ page }) => { /* (a)(b) 폼 유지 + 필수 오류, SOQL COUNT 0 */ });
  test('AC-011 수정 — 표준 화면 저장', async ({ page }) => { /* 1050000000 / 침실 3 저장 성공 */ });
  test('AC-011 수정 — 카드 반영', { tag: '@explore' }, async ({ page }) => { /* '₩1,050,000,000', '침실 3 · 욕실 1' */ });
  test('AC-012 삭제 — 표준 화면', async ({ page }) => { /* 삭제 토스트, SOQL COUNT 0 */ });
  test('AC-012 삭제 — 탐색 empty-state', { tag: '@explore' }, async ({ page }) => { /* empty-state, '0건' → 조건 해제 '10건' */ });
  test('AC-060 가격 자릿수 한도 — 저장', async ({ page }) => { /* 13자리 실패, 12자리 성공(afterAll 삭제) */ });
  test('AC-060 가격 자릿수 한도 — 카드 표시', { tag: '@explore' }, async ({ page }) => { /* '₩999,999,999,999' */ });
  test.fixme('AC-061 (잠정 — CK-05) 가격 0/-1 거부', async () => {});
});
```

## 5. 수락 기준 (AC 매핑)

> 잠정 AC 는 CK 해소 전까지 완료 조건에서 제외. **[이월→WI-1.005]** = 이 WI 에서는 1차 검증(표준 화면 부분)만 하고, `매물 탐색` 탭 의존 단계의 E2E 는 **WI-1.005 전체 UI 회귀**에서 최종 검증(PHASE-PLAN-01 §3.4). 이 WI 완료 판정 근거는 1차 검증이다.

> (ENHANCED 2026-10-28: 1차 판정 — Apex `RunLocalTests` 실행 707gw000002GI7E, DH-DEV) AC-001·002·004(권한 벡터)·005·053 = 통과 / AC-003 = 실패(DH-DEV 통화 USD, KRW 수동 조정 대기) / AC-006·009·010·011·012·060 = Playwright 대기(Lab 10 미구성) / AC-061 = 잠정(CK-05) / AC-067 = `.gitignore` 확인만, `git ls-files` 검사는 커밋 직전 수행

- [X] **AC-001** 필드 구성 — Given: "`Property__c` 메타데이터가 배포된 오그" / When: "`Schema.SObjectType.Property__c.fields.getMap()` 로 필드를 조회한다" / Then: "Name(STRING, 80), Address__c(STRING, 255), City__c(STRING, 100), Price__c(CURRENCY, 정밀도 12·소수 0), Bedrooms__c(DOUBLE, 2·0), Bathrooms__c(DOUBLE, 2·0), Picture_URL__c(URL), Status__c(PICKLIST). State__c 는 OQ-01 결과에 따라 존재 여부 판정(CK-11)" → Apex `ac001_fieldTypes`
- [X] **AC-002** Status 값·기본값 — Given: "AC-001 과 같음" / When: "`getPicklistValues()` 를 조회하고, Status 를 지정하지 않은 `new Property__c(Name='[E2E] 기본값 확인', Price__c=100000000)` 를 insert" / Then: "활성 값이 정확히 3개 `Available`, `Under Contract`, `Sold` 이고, 기본값은 `Available`, insert 된 레코드의 Status__c = `Available`" → Apex
- [ ] **AC-003** KRW 단일 통화 — Given: "대상 오그(공통 전제의 조직 설정)" / When: "`UserInfo.getDefaultCurrency()` 와 `UserInfo.isMultiCurrencyOrganization()` 를 호출" / Then: "각각 `'KRW'`, `false`" (SD-01 2500000000 저장·조회 일치) → Apex(DH-DEV) + §4.1 점검표. SIT/UAT/HUB 테스트 실행은 Lab 12
- [X] **AC-004** 상담원 조회 전용 (권한 벡터) — Given: "`DreamHouse_Agent` 권한 세트 할당, SD-01~SD-10 존재" / When: "`System.runAs(agent)` 에서 isAccessible/isCreateable/isUpdateable/isDeletable 과 Status__c 의 isUpdateable 확인" / Then: "isAccessible = true, isCreateable = false, isUpdateable = false, isDeletable = false, Status__c.isUpdateable = false" → Apex. **"조회 결과 10건" 은 WI-1.003 으로 이월**(PropertyController 필요). I-05 확인 필요 (ENHANCED 2026-10-28: I-05 확인 — 상담원 `Status__c.isUpdateable()` = false 로 테스트 통과)
- [X] **AC-005** 관리자 CRUD — Given: "`DreamHouse_Admin` 권한 세트 할당" / When: "`Database.insert/update/delete(record, AccessLevel.USER_MODE)` 차례로 실행(Name `[E2E] 관리자 권한 확인`, Price 300000000 → Status `Sold` → delete)" / Then: "3개 DML 모두 성공, 마지막 COUNT = 0" → Apex
- [ ] **AC-006** 상담원 UI 진입점 미노출 — Given: "`agent` 인증 상태로 로그인" / When: "(1) "매물" 오브젝트 탭 목록 화면, (2) SD-02 표준 레코드 페이지에 접근" / Then: "(1) `새로 만들기` 버튼 없음, (2) `편집`·`삭제` 버튼 없음, Status 인라인 편집 아이콘 없음. 매물명 `해운대 오션뷰`, 가격 `₩850,000,000` 표시" → Playwright(agent), 이 WI 에서 전체 실행
- [ ] **AC-009** 관리자 신규 등록 — Given: "`admin` 로그인, "매물" 탭" / When: "`새로 만들기` → 매물명 `[E2E] 성수 숲 아파트`, 주소 `서울특별시 성동구 왕십리로 1`, 도시 `서울`, 가격 `1100000000`, 침실 `2`, 욕실 `1`, 상태 미변경 → `저장`" / Then: "성공 토스트, 상태 = `판매중`, 가격 = `₩1,100,000,000`. 이후 "매물 탐색" 탭에서 `성수` 입력 시 `property-card` 1개, `₩1,100,000,000`" → Playwright. 표준 화면 부분 이 WI / **탐색 탭 부분 [이월→WI-1.005]**
- [ ] **AC-010** 필수값 누락 차단 — Given: "`admin` 로그인, `새로 만들기` 폼" / When: "(a) 매물명 빈 값 + 가격 `500000000`, (b) 매물명 `[E2E] 필수값 확인` + 가격 빈 값 으로 각각 `저장`" / Then: "폼이 닫히지 않고 필수 입력 오류 표시, `[E2E] 필수값%` COUNT = 0" → Playwright, 전체
- [ ] **AC-011** 관리자 수정 — Given: "AC-009 에서 만든 `[E2E] 성수 숲 아파트`(₩1,100,000,000)" / When: "`편집` → 가격 `1050000000`, 침실 `3` → `저장` → "매물 탐색" 탭에서 `성수` 검색" / Then: "`property-card-price` = `₩1,050,000,000`, `property-card-rooms` = `침실 3 · 욕실 1`" → Playwright. 표준 화면 저장 성공까지 이 WI / **카드 확인 [이월→WI-1.005]**
- [ ] **AC-012** 관리자 물리 삭제 — Given: "AC-011 의 `[E2E] 성수 숲 아파트`" / When: "레코드 `삭제` → 확인 대화상자 `삭제`" / Then: "삭제 성공 토스트, COUNT = 0, "매물 탐색" 탭에서 `성수` 검색 시 `empty-state`·`0건`, 조건 해제 시 `10건`" → Playwright + SOQL. 표준 화면 부분 이 WI / **탐색 탭 부분 [이월→WI-1.005]** (CK-01 휴지통 보관 여부)
- [X] **AC-053** 상담원 DML 거부 — Given: "`DreamHouse_Agent` 사용자, SD-02 존재" / When: "(a) insert `[E2E] 상담원 등록`, (b) SD-02 Status `Sold` update, (c) SD-02 delete — 모두 `AccessLevel.USER_MODE`" / Then: "세 경우 모두 예외, SD-02 Status = `Available`·존재, `[E2E] 상담원 등록` 0건" → Apex
- [ ] **AC-060** 가격 자릿수 한도 — Given: "`admin` 로그인, `새로 만들기` 폼" / When: "매물명 `[E2E] 한도 초과`, 가격 `1000000000000`(13자리) → `저장`" / Then: "가격 필드 오류로 저장 실패, 0건. `999999999999` 는 저장 성공 후 카드에 `₩999,999,999,999`" → Playwright. 저장 부분 이 WI / **카드 표시 [이월→WI-1.005]**
- [ ] **AC-061 (잠정 — CK-05)** 가격 0·음수 — Given: "`admin`, `새로 만들기` 폼" / When: "가격 `0` / `-1` 로 `저장`" / Then: "`가격은 0보다 커야 합니다.` 표시, 레코드 미생성" → `test.fixme`. CK-05 해소 전 완료 조건 제외
- [ ] **AC-067** 비밀정보 미커밋 — Given: "커밋 직전 저장소" / When: "`git ls-files | grep -E "\.auth/|sfdx-url|accessToken"`, `.gitignore` 확인" / Then: "결과 0줄, `.gitignore` 에 `tests/e2e/.auth/`" → 수동 QA

## 6. 테스트 요구

| 종류 | 대상 | AC | 목표 / 명령 |
|---|---|---|---|
| Apex 단위 | `PropertyModelTest` (+ `PropertyTestDataFactory`) | AC-001, 002, 003, 004(권한 벡터), 005, 053 | 실패 0, 조직 커버리지 ≥ 75% — `sf apex run test -n PropertyModelTest -o DH-DEV -c -r human` |
| Playwright | `tests/e2e/WI-1.001-property-crud.spec.ts` (`test.describe.serial`) | AC-006, 009, 010, 011, 012, 060 (AC-061 `test.fixme`) | 1차: `npx playwright test tests/e2e/WI-1.001-property-crud.spec.ts --grep-invert @explore` 통과 / 최종: WI-1.005 `npx playwright test` |
| CLI 수동 | 오그 점검표 | AC-003(오그별) | §4.1 표 기입 |
| 수동 QA | 비밀정보 | AC-067 | 0줄 |
| Jest | — | — | 이 WI 는 LWC 없음 |

- Playwright 시나리오 = 각 AC 의 Given/When/Then. 셀렉터는 접근성 라벨(`getByRole`/`getByLabel`)만, XPath·SLDS 내부 클래스 금지. `[E2E]` 접두어 레코드는 `afterAll` 에서 삭제.

## 7. 통합 체크리스트

- [ ] 전문 에이전트 사용 확인 (backend_developer / test_engineer / code_reviewer)
- [X] 선행 없음 확인, Feature Branch checkout (`WI-000003`)
- [X] **(첫 작업)** 4개 오그 통화·로캘·시간대 점검표 작성 (D-16, CK-15) — §4.1 표 (전 오그 USD·단일 통화)
- [ ] DH-DEV/SIT/UAT Company Information 조정 → 재점검 `KRW` / `false` (2026-10-28: UI 전용 → 사용자 수동 조정 대기)
- [X] DH-HUB(PROD) — 점검만. 변경은 **사용자 명시 승인 후에만**(I-08), 미승인 시 "확인 필요" 상태로 남김 (2026-10-28: 점검 완료 USD — 변경 미실행, 확인 필요 유지)
- [ ] scratch def `country: "KR"` 효과 확인(임시 오그) → 반영 여부 기록 (I-07)
- [X] `Property__c` + 필드 9개, Status 기본값 Available·라벨 판매중/계약중/판매완료, Price Currency(12,0)
- [X] OWD Public Read Only (AD-03) — EntityDefinition Internal/External = Read 확인
- [X] 페이지 레이아웃 필수값(Name·Price__c·Status__c), 리스트 뷰 All
- [X] `매물` 오브젝트 탭 + 두 권한 세트 `tabSettings` Visible (I-03)
- [ ] 유효성 규칙(가격 > 0) — CK-05 확정 시에만 (2026-10-28: CK-05 미확정 → 의도적으로 미생성)
- [X] 권한 세트 `DreamHouse_Agent` / `DreamHouse_Admin` (Modify All) — DH-DEV 관리자에 DreamHouse_Admin 할당
- [ ] Playwright 사용자 3명(ko / ko_KR / Asia/Seoul), 프로필 권한 위험 확인(§4.6), `.auth/` 미커밋
- [X] `sf project deploy start --dry-run -o DH-DEV` 성공 → `sf project deploy start -o DH-DEV` (dry-run 0Afgw000000b8ufCAA / deploy 0Afgw000000b6x1CAA, 28/28)
- [ ] Apex: `sf apex run test -n PropertyModelTest -o DH-DEV -c -r human` 통과 (커버리지 ≥ 75%) (2026-10-28: 6건 중 5 통과, ac003 은 DH-DEV USD 로 실패 — KRW 조정 후 재실행)
- [X] 정적 분석: `sf code-analyzer run --workspace . --view table` — High 이상 0건 (신규 코드 Moderate/Low 만, flow 엔진 Python 미설치 경고 제외)
- [ ] Playwright `WI-1.001-property-crud.spec.ts --grep-invert @explore` 통과 (실패 시 완료 불가) (Lab 10 미구성 — 대기)
- [ ] 이월 AC(AC-004 조회 10건 → WI-1.003 / AC-009·011·012·060 탐색 부분 → WI-1.005 / AC-003 SIT·UAT·HUB → Lab 12) PHASE-PLAN-01 §3.4 기록, spec 에 `@explore`
- [ ] AC-067 비밀정보 0줄 확인
- [ ] CI(선택·미도입) — GitHub Actions 미구성, 해당 없음
- [ ] PROJECT-PLAN §5 / PHASE-PLAN-01 §1.2·§4.7 / 이 문서의 체크리스트·Status `[X]`
- [ ] 커밋 `WI-1.001-property-data-model` (본문에 오그 점검·조정 결과 요약)

## 8. 참고 자료

- `docs/PROJECT-PLAN.md` v1.1 — §1.1 환경, §5 WI 목록·§5.2 체크리스트, §7 추적성, §8 R-08/R-09
- `docs/phases/PHASE-PLAN-01.md` v1.1 — §3 공통 규칙(§3.3 탭 의존 원칙, §3.4 이월 표), §4 WI-1.001, §12 I-03/I-04/I-05/I-07/I-08
- `docs/phase-0/ACCEPTANCE-CRITERIA.md` — §1.3 공통 전제, §1.4 SD 표, AC-001~012, 053, 060, 061, 067
- `docs/REQUIREMENT.md` v1.1 — REQ-001, REQ-002, REQ-004
- `docs/phase-0/FIT-GAP-NUD.md` v1.1 — D-02, D-16, D-18, AD-03
- `CLAUDE.md` — 진행 규칙·코드 규칙
- Salesforce: Metadata API `CustomObject`/`CustomField`/`PermissionSet`/`CustomTab`, `sf org create user`, `Database` DML `AccessLevel.USER_MODE`
