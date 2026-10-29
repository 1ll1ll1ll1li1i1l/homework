/**
 * WI-1.003 — PropertyController 단위 테스트.
 * AC-004(조회부), AC-013, AC-018, AC-019, AC-055(Apex), AC-062(잠정 — CK-06), AC-066
 * (ENHANCED 2026-10-29: WI-1.004) 조건 확장 — AC-014~017, 018(강릉), 031·032(서버 조건), 055(동적 조회), 056, 057·058(잠정), 059(서버 방어)
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
      Integer n = byStatus.containsKey(p.Status__c)
        ? byStatus.get(p.Status__c)
        : 0;
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
    Assert.areEqual(
      10,
      rows.size(),
      'agent 는 SD-01~SD-10 10건을 조회해야 한다'
    );
  }

  @IsTest
  static void ac004_adminQueryReturns10() {
    System.runAs(PropertyTestDataFactory.getUser('admin')) {
      Assert.areEqual(
        10,
        PropertyController.getProperties(new PropertyFilter()).size(),
        'admin 도 10건을 조회해야 한다'
      );
    }
  }

  @IsTest
  static void ac013_noFilterReturnsAllIncludingSold() {
    System.runAs(PropertyTestDataFactory.getUser('agent')) {
      List<Property__c> rows = PropertyController.getProperties(
        new PropertyFilter()
      );
      Assert.areEqual(10, rows.size(), '조건 없음 → 전체 10건');
      Map<String, Integer> byStatus = countByStatus(rows);
      Assert.areEqual(6, byStatus.get('Available'), 'Available 6건');
      Assert.areEqual(2, byStatus.get('Under Contract'), 'Under Contract 2건');
      Assert.areEqual(
        2,
        byStatus.get('Sold'),
        'Sold 2건(SD-05, SD-08) 포함 — 판매완료 제외 조건 없음'
      );
      Set<String> soldNames = new Set<String>();
      for (Property__c p : rows) {
        if (p.Status__c == 'Sold') {
          soldNames.add(p.Name);
        }
      }
      Assert.areEqual(
        new Set<String>{ '광교 호수 타운하우스', '송파 잠실 아파트' },
        soldNames,
        'Sold = SD-05, SD-08'
      );
    }
  }

  @IsTest
  static void ac013_nullFilterTreatedAsNoCondition() {
    System.runAs(PropertyTestDataFactory.getUser('agent')) {
      Assert.areEqual(
        10,
        PropertyController.getProperties(null).size(),
        'filter null 도 조건 없음으로 10건'
      );
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
      Assert.isNotNull(
        PropertyController.getProperties(f),
        '조건이 채워진 filter 도 예외 없이 List 반환'
      );
    }
  }

  @IsTest
  static void ac018_emptyListNotNull() {
    // WI-1.003 1차: 데이터 0건 상황. 키워드 '강릉' 재확인은 WI-1.004
    delete [SELECT Id FROM Property__c];
    System.runAs(PropertyTestDataFactory.getUser('agent')) {
      List<Property__c> rows = PropertyController.getProperties(
        new PropertyFilter()
      );
      Assert.isNotNull(rows, '0건이어도 null 이 아닌 List 를 반환해야 한다');
      Assert.areEqual(0, rows.size(), '0건');
    }
  }

  @IsTest
  static void ac019_fieldsAccessible() {
    System.runAs(PropertyTestDataFactory.getUser('agent')) {
      Property__c sd01;
      for (
        Property__c p : PropertyController.getProperties(new PropertyFilter())
      ) {
        if (p.Name == SD01_NAME) {
          sd01 = p;
        }
      }
      Assert.isNotNull(sd01, 'SD-01 이 결과에 포함되어야 한다');
      Assert.isNotNull(sd01.Id, 'Id');
      Assert.areEqual(
        '서울특별시 강남구 테헤란로 101',
        sd01.Address__c,
        'Address__c'
      );
      Assert.areEqual('서울', sd01.City__c, 'City__c');
      Assert.areEqual(2500000000L, sd01.Price__c, 'Price__c');
      Assert.areEqual(4, sd01.Bedrooms__c, 'Bedrooms__c');
      Assert.areEqual(2, sd01.Bathrooms__c, 'Bathrooms__c');
      Assert.isNotNull(sd01.Picture_URL__c, 'Picture_URL__c 값 존재');
      Assert.areEqual(
        'Available',
        sd01.Status__c,
        'Status__c (접근 시 SObjectException 없음)'
      );
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
    Assert.isNull(
      rows,
      '권한 세트 미할당 사용자에게 데이터가 반환되면 안 된다'
    );
    Assert.isNotNull(
      caught,
      '권한 세트 미할당 사용자는 AuraHandledException 이 발생해야 한다'
    );
    Assert.areEqual(
      PropertyController.LOAD_ERROR_MESSAGE,
      caught.getMessage(),
      '사용자 안내 문구'
    );
    Assert.areEqual(
      '매물 정보를 불러오지 못했습니다.',
      caught.getMessage(),
      'AC-047 문구와 동일'
    );
  }

  // ===================================================================================
  // (ADDED 2026-10-29: WI-1.004) 조건 확장 — 기대값 = ACCEPTANCE-CRITERIA §1.4 / WI-1.004 §5.1 계산표
  // 모든 호출은 agent(Minimum Access 프로필 + DreamHouse_Agent 권한 세트) 컨텍스트
  // ===================================================================================
  private static final String SD01 = '강남 래미안 아파트';
  private static final String SD02 = '해운대 오션뷰';
  private static final String SD03 = '판교 테크노 빌라';
  private static final String SD04 = '마포 한강 오피스텔';
  private static final String SD05 = '광교 호수 타운하우스';
  private static final String SD06 = '둔산 센트럴 아파트';
  private static final String SD07 = '제주 애월 전원주택';
  private static final String SD08 = '송파 잠실 아파트';
  private static final String SD09 = '송도 센트럴 오피스텔';
  private static final String SD10 = '서면 스카이 빌라';

  private static PropertyFilter filterOf(
    String keyword,
    Decimal minP,
    Decimal maxP,
    Integer minBed
  ) {
    PropertyFilter f = new PropertyFilter();
    f.keyword = keyword;
    f.minPrice = minP;
    f.maxPrice = maxP;
    f.minBedrooms = minBed;
    return f;
  }

  /** agent 로 조회 후 반환된 매물명 집합 */
  private static Set<String> namesFor(
    String keyword,
    Decimal minP,
    Decimal maxP,
    Integer minBed
  ) {
    Set<String> names = new Set<String>();
    System.runAs(PropertyTestDataFactory.getUser('agent')) {
      for (
        Property__c p : PropertyController.getProperties(
          filterOf(keyword, minP, maxP, minBed)
        )
      ) {
        names.add(p.Name);
      }
    }
    return names;
  }

  // ---- AC-014 / AC-027: 키워드 (Name 또는 City__c 부분 일치) ----
  @IsTest
  static void ac014_keywordSeoul_3() {
    Assert.areEqual(
      new Set<String>{ SD01, SD04, SD08 },
      namesFor('서울', null, null, null),
      '서울 → 3건(도시 일치)'
    );
  }

  @IsTest
  static void ac014_keywordBusan_2() {
    Assert.areEqual(
      new Set<String>{ SD02, SD10 },
      namesFor('부산', null, null, null),
      '부산 → 2건(도시 일치)'
    );
  }

  @IsTest
  static void ac014_keywordRaemian_1() {
    Assert.areEqual(
      new Set<String>{ SD01 },
      namesFor('래미안', null, null, null),
      '래미안 → 1건(매물명 일치)'
    );
  }

  @IsTest
  static void ac014_keywordCentral_2() {
    Assert.areEqual(
      new Set<String>{ SD06, SD09 },
      namesFor('센트럴', null, null, null),
      '센트럴 → 2건(매물명 부분 일치)'
    );
  }

  @IsTest
  static void ac014_keywordAddressNotSearched_0() {
    Assert.areEqual(
      0,
      namesFor('강남구', null, null, null).size(),
      '강남구 → 0건(Address__c 는 검색 대상 아님)'
    );
  }

  @IsTest
  static void ac014_keywordTrimmedBeforeMatch() {
    Assert.areEqual(
      new Set<String>{ SD02, SD10 },
      namesFor('  부산  ', null, null, null),
      '앞뒤 공백은 trim 후 부분 일치'
    );
  }

  // ---- AC-018: 키워드 결과 0건 → 예외 없이 빈 List ----
  @IsTest
  static void ac018_keywordNoMatchReturnsEmptyList() {
    System.runAs(PropertyTestDataFactory.getUser('agent')) {
      List<Property__c> rows = PropertyController.getProperties(
        filterOf('강릉', null, null, null)
      );
      Assert.isNotNull(rows, '0건이어도 null 이 아닌 List');
      Assert.areEqual(0, rows.size(), '강릉 → 0건');
    }
  }

  // ---- AC-057 (잠정 — CK-04): 빈 값·공백 키워드 → 조건 미적용 ----
  @IsTest
  static void ac057_blankKeywordMeansNoCondition() {
    Assert.areEqual(
      10,
      namesFor('', null, null, null).size(),
      '빈 문자열 → 10건'
    );
    Assert.areEqual(
      10,
      namesFor('   ', null, null, null).size(),
      '공백 3자 → 10건(trim, CK-04 잠정)'
    );
  }

  // ---- AC-015 / AC-028 / AC-029: 가격 (경계 포함) ----
  @IsTest
  static void ac015_maxPrice1B_6() {
    Set<String> names = namesFor(null, null, 1000000000L, null);
    Assert.areEqual(
      new Set<String>{ SD02, SD04, SD05, SD06, SD09, SD10 },
      names,
      '최대 10억 → 6건'
    );
    Assert.isFalse(names.contains(SD01), 'SD-01(25억) 제외');
  }

  @IsTest
  static void ac015_minPrice1B_4() {
    Assert.areEqual(
      new Set<String>{ SD01, SD03, SD07, SD08 },
      namesFor(null, 1000000000L, null, null),
      '최소 10억 → 4건'
    );
  }

  @IsTest
  static void ac015_range500Mto1B_4() {
    Assert.areEqual(
      new Set<String>{ SD02, SD05, SD06, SD10 },
      namesFor(null, 500000000L, 1000000000L, null),
      '5억~10억 → 4건'
    );
  }

  @IsTest
  static void ac015_minEqualsMax850M_boundaryInclusive_1() {
    Assert.areEqual(
      new Set<String>{ SD02 },
      namesFor(null, 850000000L, 850000000L, null),
      '8.5억~8.5억 → 1건(경계 포함)'
    );
  }

  // ---- AC-032: 판매완료 기본 노출 (가격 조건만, 상태로 제외하지 않음) ----
  @IsTest
  static void ac032_minPrice900M_includesSold_5() {
    System.runAs(PropertyTestDataFactory.getUser('agent')) {
      List<Property__c> rows = PropertyController.getProperties(
        filterOf(null, 900000000L, null, null)
      );
      Assert.areEqual(5, rows.size(), '최소 9억 → 5건(SD-01·03·05·07·08)');
      Map<String, Integer> byStatus = countByStatus(rows);
      Assert.areEqual(2, byStatus.get('Sold'), 'Sold 2건(SD-05, SD-08)');
      Assert.areEqual(2, byStatus.get('Under Contract'), 'Under Contract 2건');
    }
  }

  // ---- AC-016 / AC-030: 최소 침실 수 ("이상") ----
  @IsTest
  static void ac016_minBedrooms3_7() {
    Assert.areEqual(7, namesFor(null, null, null, 3).size(), '침실 ≥3 → 7건');
  }

  @IsTest
  static void ac016_minBedrooms4_3() {
    Assert.areEqual(
      new Set<String>{ SD01, SD05, SD07 },
      namesFor(null, null, null, 4),
      '침실 ≥4 → 3건'
    );
  }

  @IsTest
  static void ac016_minBedrooms6_0() {
    Assert.areEqual(0, namesFor(null, null, null, 6).size(), '침실 ≥6 → 0건');
  }

  @IsTest
  static void ac016_minBedroomsZeroMeansNoCondition() {
    Assert.areEqual(
      10,
      namesFor(null, null, null, 0).size(),
      '침실 0(전체) → 조건 미적용 10건'
    );
  }

  // ---- AC-017 / AC-031: 복합 조건 (AND) ----
  @IsTest
  static void ac031_seoulPlusBedrooms3_2() {
    Assert.areEqual(
      new Set<String>{ SD01, SD08 },
      namesFor('서울', null, null, 3),
      '서울 + 침실3 → 2건(AC-031 2단계)'
    );
  }

  @IsTest
  static void ac017a_seoulBed3Max2B_soldSd08_1() {
    System.runAs(PropertyTestDataFactory.getUser('agent')) {
      List<Property__c> rows = PropertyController.getProperties(
        filterOf('서울', null, 2000000000L, 3)
      );
      Assert.areEqual(1, rows.size(), '서울 + 침실3 + 최대 20억 → 1건');
      Assert.areEqual(SD08, rows[0].Name, 'SD-08');
      Assert.areEqual(1980000000L, rows[0].Price__c, '₩1,980,000,000');
      Assert.areEqual('Sold', rows[0].Status__c, '판매완료');
    }
  }

  @IsTest
  static void ac017b_range500Mto1BPlusBed3_3() {
    Assert.areEqual(
      new Set<String>{ SD02, SD05, SD06 },
      namesFor(null, 500000000L, 1000000000L, 3),
      '5억~10억 + 침실3 → 3건'
    );
  }

  // ---- AC-058 (잠정 — CK-03): min > max → 서버 조건 그대로 → 0건, 예외 없음 ----
  @IsTest
  static void ac058_minGreaterThanMaxReturnsEmpty() {
    System.runAs(PropertyTestDataFactory.getUser('agent')) {
      List<Property__c> rows = PropertyController.getProperties(
        filterOf(null, 1000000000L, 500000000L, null)
      );
      Assert.isNotNull(rows, 'null 아님');
      Assert.areEqual(0, rows.size(), 'min 10억 > max 5억 → 0건(CK-03 잠정)');
    }
  }

  // ---- AC-059 (서버 측 방어): 음수 값은 예외 없이 조건 그대로 적용 ----
  @IsTest
  static void ac059_negativeValuesDoNotThrow() {
    Assert.areEqual(
      10,
      namesFor(null, -100, null, null).size(),
      '최소 -100 → 전 매물 충족 10건'
    );
    Assert.areEqual(
      0,
      namesFor(null, null, -100, null).size(),
      '최대 -100 → 0건(예외 없음)'
    );
    Assert.areEqual(
      10,
      namesFor(null, null, null, -1).size(),
      '침실 -1 → 조건 미적용 10건'
    );
  }

  // ---- AC-056: SOQL 인젝션 — 입력은 바인드 값으로만 해석 ----
  @IsTest
  static void ac056_soqlInjectionIsBound() {
    Assert.areEqual(
      0,
      namesFor('\' OR Name LIKE \'%', null, null, null).size(),
      '인젝션 1 → 0건'
    );
    Assert.areEqual(
      0,
      namesFor('서울\' OR City__c != \'', null, null, null).size(),
      '인젝션 2 → 0건'
    );
    Assert.areEqual(
      0,
      namesFor('\' OR Name != \'', null, null, null).size(),
      '인젝션 3 → 0건'
    );
    Assert.areEqual(
      0,
      namesFor('%\') OR (Name != \'', null, null, null).size(),
      '괄호 탈출 시도 → 0건'
    );
  }

  // ---- (ADDED 2026-10-29: WI-1.005, 코드 리뷰 L-1) LIKE 와일드카드는 문자 그대로 일치 ----
  @IsTest
  static void l1_keywordPercentIsLiteral_0() {
    Assert.areEqual(
      0,
      namesFor('%', null, null, null).size(),
      '\'%\' → 0건(와일드카드 아님)'
    );
  }

  @IsTest
  static void l1_keywordUnderscoreIsLiteral_0() {
    Assert.areEqual(
      0,
      namesFor('_', null, null, null).size(),
      '\'_\' → 0건(와일드카드 아님)'
    );
    Assert.areEqual(
      0,
      namesFor('서_', null, null, null).size(),
      '\'서_\' → 0건(서울/서면 미일치)'
    );
  }

  @IsTest
  static void l1_keywordBackslashDoesNotThrow_0() {
    Assert.areEqual(
      0,
      namesFor('\\', null, null, null).size(),
      '\'\\\' → 예외 없이 0건'
    );
  }

  @IsTest
  static void l1_escapeLikeWildcards() {
    Assert.areEqual(
      'a\\%b\\_c\\\\d',
      PropertyController.escapeLikeWildcards('a%b_c\\d'),
      '\\ → \\\\, % → \\%, _ → \\_'
    );
    Assert.areEqual(
      '서울',
      PropertyController.escapeLikeWildcards('서울'),
      '일반 문자는 그대로'
    );
  }

  // ---- AC-055 (재확인): 조건이 있는 동적 조회도 권한 없는 사용자는 차단 ----
  @IsTest
  static void ac055_noAccessUserBlockedWithFilter() {
    List<Property__c> rows;
    AuraHandledException caught;
    System.runAs(PropertyTestDataFactory.getUser('noaccess')) {
      try {
        rows = PropertyController.getProperties(
          filterOf('서울', 100000000L, 3000000000L, 3)
        );
      } catch (AuraHandledException e) {
        caught = e;
      }
    }
    Assert.isNull(rows, '데이터 반환 없음');
    Assert.isNotNull(caught, 'AuraHandledException 발생');
    Assert.areEqual(
      PropertyController.LOAD_ERROR_MESSAGE,
      caught.getMessage(),
      '사용자 안내 문구'
    );
  }

  // ---- admin 도 동일 조건 결과 ----
  @IsTest
  static void ac017_adminSameResult() {
    System.runAs(PropertyTestDataFactory.getUser('admin')) {
      Assert.areEqual(
        3,
        PropertyController.getProperties(
            filterOf(null, 500000000L, 1000000000L, 3)
          )
          .size(),
        'admin 도 AC-017(b) 3건'
      );
    }
  }

  /** AC-062 (잠정 — CK-06): MAX_RESULTS + 1 건 → 반환 = MAX_RESULTS. CK-06 해소 전 완료 조건 제외 */
  @IsTest
  static void ac062_resultCappedAtMaxResults() {
    Integer extra = PropertyController.MAX_RESULTS + 1 - 10; // setup 10건 + extra = N + 1
    List<Property__c> more = new List<Property__c>();
    for (Integer i = 0; i < extra; i++) {
      more.add(
        new Property__c(
          Name = 'LIMIT-' + String.valueOf(i).leftPad(4, '0'),
          Price__c = 100000000L,
          Status__c = 'Available'
        )
      );
    }
    Database.insert(more, AccessLevel.SYSTEM_MODE); // 1회 DML
    Assert.areEqual(
      PropertyController.MAX_RESULTS + 1,
      [SELECT COUNT() FROM Property__c],
      'Given: N + 1 건'
    );
    System.runAs(PropertyTestDataFactory.getUser('agent')) {
      Assert.areEqual(
        PropertyController.MAX_RESULTS,
        PropertyController.getProperties(new PropertyFilter()).size(),
        '반환 건수 = N, 예외 없음'
      );
    }
  }
}
