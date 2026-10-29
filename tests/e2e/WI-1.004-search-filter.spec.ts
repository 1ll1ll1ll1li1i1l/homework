// WI-1.004 — 검색·필터 패널(propertyFilter) + 서버 조건(PropertyController.getProperties) E2E · REQ-008 (+REQ-005, REQ-007)
// AC-027 ~ AC-034, AC-059 (+ AC-032 는 WI-1.003 과 공동 매핑, 여기서는 가격 조건 관점) 을 test() 1:1 로 변환.
// 잠정 AC-057(CK-04)·AC-058(CK-03) 은 본문을 작성하되 CK 해소 전에는 test.fixme (E2E_CK04=1 / E2E_CK03=1 로 활성화).
// 성능 AC-064 는 `@perf` — SF_TARGET_ORG=DH-SIT(또는 E2E_PERF=1)에서만 실행(Lab 12, CK-07).
// 모두 "매물 탐색" 탭(App Page)이 필요하므로 `@explore` (PHASE-PLAN-01 §3.3 · §3.4).
// 기대값의 단일 근거 = AC 문서 §1.4 기대값 계산표. 정렬은 검증하지 않는다(OQ-09) → 건수 + 포함 매물 집합만 비교.
// 조회 전용 spec — 데이터·sf 명령 없음 → 복원/afterEach 불필요, org 가드(support/org.ts) 대상 아님.
//   (보조) 표시 test 는 같은 AC 의 경계/negative 케이스.
import { test, expect, type Locator, type Page, type Request } from '@playwright/test';
import { AURA_APEX_URL, isGetProperties } from './support/aura';
import { cardByName, EXPLORER_PATH, gotoExplorer, SAMPLE_COUNT, storageStateFor, usesRoleState } from './support/explorer';
import {
  BEDROOM_LABELS,
  bedroomsCombobox,
  filterPanel,
  keywordInput,
  maxPriceInput,
  minPriceInput,
  resetButton,
  selectBedrooms,
  setPrice,
} from './support/filter';
import { targetOrg } from './support/org';

// AC 문서 §1.4 (매물명)
const SD = {
  '01': '강남 래미안 아파트',
  '02': '해운대 오션뷰',
  '03': '판교 테크노 빌라',
  '04': '마포 한강 오피스텔',
  '05': '광교 호수 타운하우스',
  '06': '둔산 센트럴 아파트',
  '07': '제주 애월 전원주택',
  '08': '송파 잠실 아파트',
  '09': '송도 센트럴 오피스텔',
  '10': '서면 스카이 빌라',
} as const;
type SdNo = keyof typeof SD;
const names = (...nos: SdNo[]) => nos.map((n) => SD[n]).sort();

// AC 문서 §1.5
const EMPTY_TEXT = '조건에 맞는 매물이 없습니다.';
const ERROR_TOAST = '매물 정보를 불러오지 못했습니다.';
const PRICE_ERROR = '최소 가격이 최대 가격보다 클 수 없습니다.';
/** AC-027 등: 마지막 입력 후 1,300ms 이내(디바운스 300ms 포함) */
const REFRESH_BUDGET_MS = 1_300;

let list: Locator;

/** property-card 의 data-name 목록(순서 무시) */
async function cardNames(scope: Locator): Promise<string[]> {
  const all = await scope.getByTestId('property-card').evaluateAll((els) => els.map((e) => e.getAttribute('data-name') ?? ''));
  return all.sort();
}

/** 결과 = 정확히 expected 매물 집합 + `{n}건` */
async function expectResult(scope: Locator, expected: string[], timeout?: number) {
  await expect(scope.getByTestId('property-card')).toHaveCount(expected.length, timeout ? { timeout } : undefined);
  await expect(scope.getByTestId('result-count')).toHaveText(`${expected.length}건`);
  await expect(scope.getByTestId('loading-spinner')).toHaveCount(0);
  expect(await cardNames(scope)).toEqual(expected);
}

/** combobox 표시값 (lightning-combobox 는 버전에 따라 button 또는 readonly input) */
async function comboboxText(page: Page): Promise<string> {
  return bedroomsCombobox(page).evaluate((el) =>
    (el instanceof HTMLInputElement ? el.value : (el.textContent ?? '')).trim(),
  );
}

/** getProperties Aura 요청 카운터 (AC-034 / AC-059) */
function countGetProperties(page: Page): { count: number; requests: Request[] } {
  const counter = { count: 0, requests: [] as Request[] };
  page.on('request', (req) => {
    if (req.method() === 'POST' && AURA_APEX_URL.test(req.url()) && isGetProperties(req)) {
      counter.count += 1;
      counter.requests.push(req);
    }
  });
  return counter;
}

function annotateAuth() {
  if (!usesRoleState('agent')) {
    test.info().annotations.push({
      type: 'auth',
      description: 'tests/e2e/.auth/agent.json 없음 → 기본 세션(state.json)으로 실행. 역할 사용자 생성 후 재실행 필요',
    });
  }
}

// AC 문서 §1.3: Given `agent` 로그인
test.use({ storageState: storageStateFor('agent') });

test.describe('agent — 검색·필터', () => {
  test.beforeEach(async ({ page }) => {
    annotateAuth();
    // Given: AC-024 상태 (조건 없음 10건). 결정성 가드: 기준 데이터 10건만 존재(§1.3)
    list = await gotoExplorer(page);
    await expectResult(list, names('01', '02', '03', '04', '05', '06', '07', '08', '09', '10'));
    await expect(filterPanel(page)).toBeVisible();
  });

  // AC-027 / REQ-008 / WI-1.004
  test('AC-027 키워드 실시간 필터', { tag: '@explore' }, async ({ page }) => {
    // When: filter-keyword 에 '서울' 입력 (Enter·검색 버튼 없음)
    await keywordInput(page).fill('서울');
    // Then: 마지막 입력 후 1,300ms 이내 3개(SD-01·04·08), '3건'
    await expectResult(list, names('01', '04', '08'), REFRESH_BUDGET_MS);
  });

  // AC-027 / REQ-008 / WI-1.004 — (보조) 주소(Address__c)는 검색 대상 아님 → '강남구' 0건 + 빈 결과 안내 (AC-014 UI 대응)
  test('AC-027 (보조) 주소 키워드 강남구 → 0건 안내', { tag: '@explore' }, async ({ page }) => {
    await keywordInput(page).fill('강남구');
    await expect(list.getByTestId('property-card')).toHaveCount(0);
    await expect(list.getByTestId('result-count')).toHaveText('0건');
    await expect(list.getByTestId('empty-state')).toHaveText(EMPTY_TEXT);
    await expect(page.getByText(ERROR_TOAST)).toHaveCount(0); // 0건은 오류가 아님(AC-018)
    // 키워드를 지우면 조건 없음으로 복귀
    await keywordInput(page).fill('');
    await expectResult(list, names('01', '02', '03', '04', '05', '06', '07', '08', '09', '10'));
  });

  // AC-028 / REQ-008 / WI-1.004
  test('AC-028 최대 가격 필터', { tag: '@explore' }, async ({ page }) => {
    // When: filter-max-price 1000000000 (원 단위)
    await setPrice(maxPriceInput(page), '1000000000');
    // Then: 6개(SD-02·04·05·06·09·10) '6건', SD-01 카드 없음
    await expectResult(list, names('02', '04', '05', '06', '09', '10'));
    await expect(cardByName(list, SD['01'])).toHaveCount(0);
  });

  // AC-029 / REQ-008 / WI-1.004
  test('AC-029 가격 범위 필터(경계 포함)', { tag: '@explore' }, async ({ page }) => {
    // When (a): min 500000000 + max 1000000000
    await setPrice(minPriceInput(page), '500000000');
    await setPrice(maxPriceInput(page), '1000000000');
    // Then (a): 4개(SD-02·05·06·10) '4건'
    await expectResult(list, names('02', '05', '06', '10'));
    // When (b): 둘 다 850000000 (경계값 = SD-02 가격)
    await setPrice(minPriceInput(page), '850000000');
    await setPrice(maxPriceInput(page), '850000000');
    // Then (b): 1개(SD-02) '1건' — ≥ / ≤ 경계 포함
    await expectResult(list, names('02'));
  });

  // AC-030 / REQ-008 / WI-1.004
  test('AC-030 최소 침실 수 필터', { tag: '@explore' }, async ({ page }) => {
    // 선택지(§1.5): 전체, 1개 이상 ~ 5개 이상 — 초기값 '전체'
    expect(await comboboxText(page)).toBe('전체');
    const options = page.getByTestId('filter-min-bedrooms').getByRole('option');
    // (ENHANCED 2026-10-29) 회귀 중 첫 클릭이 무시되는 사례 → 열릴 때까지 재시도
    await expect(async () => {
      if (!(await options.first().isVisible())) await bedroomsCombobox(page).click({ timeout: 5_000 });
      await expect(options.first()).toBeVisible({ timeout: 3_000 });
    }).toPass({ timeout: 30_000 });
    await expect(options).toHaveText([...BEDROOM_LABELS]);
    await bedroomsCombobox(page).press('Escape');
    // When: '3개 이상' → Then: 7개 '7건'
    await selectBedrooms(page, '3개 이상');
    await expectResult(list, names('01', '02', '03', '05', '06', '07', '08'));
    // When: 이어서 '4개 이상' → Then: 3개(SD-01·05·07) '3건'
    await selectBedrooms(page, '4개 이상');
    await expectResult(list, names('01', '05', '07'));
  });

  // AC-031 / REQ-008 / WI-1.004
  test('AC-031 복합 필터 + 판매완료 결과', { tag: '@explore' }, async ({ page }) => {
    await applyAc031(page);
    // Then: 최종 카드 = 송파 잠실 아파트, ₩1,980,000,000, 배지 판매완료(회색, data-status=Sold)
    const card = cardByName(list, SD['08']);
    await expect(card.getByTestId('property-card-price')).toHaveText('₩1,980,000,000');
    const badge = card.getByTestId('property-status-badge');
    await expect(badge).toHaveText('판매완료');
    await expect(badge).toHaveAttribute('data-status', 'Sold');
    await expect(badge).not.toHaveClass(/slds-theme_(success|warning)/); // 회색(기본 slds-badge) — §1.2 배지 클래스 예외
  });

  // AC-032 / REQ-008, REQ-007 / WI-1.004 (가격 조건 — WI-1.003 과 공동 매핑)
  test('AC-032 판매완료 매물 기본 노출', { tag: '@explore' }, async ({ page }) => {
    // Then(전제): 필터 패널에 "판매완료 제외" 류 옵션 없음
    await expect(filterPanel(page).getByRole('checkbox')).toHaveCount(0);
    await expect(filterPanel(page).getByText(/판매\s*완료|Sold/)).toHaveCount(0);
    // When: filter-min-price 900000000
    await setPrice(minPriceInput(page), '900000000');
    // Then: 5개(SD-01·03·05·07·08) '5건', Sold 2(SD-05·08), Under Contract 2
    await expectResult(list, names('01', '03', '05', '07', '08'));
    await expect(list.locator('[data-testid="property-status-badge"][data-status="Sold"]')).toHaveCount(2);
    await expect(list.locator('[data-testid="property-status-badge"][data-status="Under Contract"]')).toHaveCount(2);
    for (const n of ['05', '08'] as const) {
      await expect(cardByName(list, SD[n]).getByTestId('property-status-badge')).toHaveAttribute('data-status', 'Sold');
    }
  });

  // AC-033 / REQ-008 / WI-1.004
  test('AC-033 필터 초기화', { tag: '@explore' }, async ({ page }) => {
    // Given: AC-031 최종 상태(1건)
    await applyAc031(page);
    // When: filter-reset 클릭
    await resetButton(page).click();
    // Then: 키워드·최소·최대 가격 빈 문자열, 침실 '전체', 10개 '10건'
    await expect(keywordInput(page)).toHaveValue('');
    await expect(minPriceInput(page)).toHaveValue('');
    await expect(maxPriceInput(page)).toHaveValue('');
    await expect.poll(() => comboboxText(page)).toBe('전체');
    await expectResult(list, names('01', '02', '03', '04', '05', '06', '07', '08', '09', '10'));
    await expect(list.getByTestId('empty-state')).toHaveCount(0);
  });

  // AC-033 / REQ-008 / WI-1.004 — (보조) 음수 오류 상태에서 초기화 → 오류 표시 해제, 10건
  test('AC-033 (보조) 오류 입력 후 초기화 시 aria-invalid 해제', { tag: '@explore' }, async ({ page }) => {
    await setPrice(maxPriceInput(page), '-100');
    await maxPriceInput(page).blur();
    await expect(maxPriceInput(page)).toHaveAttribute('aria-invalid', 'true');
    await resetButton(page).click();
    await expect(maxPriceInput(page)).toHaveValue('');
    await expect(maxPriceInput(page)).not.toHaveAttribute('aria-invalid', 'true');
    await expectResult(list, names('01', '02', '03', '04', '05', '06', '07', '08', '09', '10'));
  });

  // AC-034 / REQ-008 (NFR-002) / WI-1.004 (Should)
  test('AC-034 (Should) 입력 디바운스', { tag: '@explore' }, async ({ page }) => {
    // Given: getProperties Aura 요청 카운터 0 (초기 로딩 이후부터 계수)
    const counter = countGetProperties(page);
    // When: '송파 잠실' 을 50ms 간격 순차 입력 후 1,000ms 대기
    await keywordInput(page).pressSequentially('송파 잠실', { delay: 50 });
    await page.waitForTimeout(1_000); // AC 정의상 고정 대기(요청 수 관측 구간)
    // Then: 조회 요청 1회(최대 2회 허용), 최종 1개(SD-08)
    expect(counter.count, `getProperties 요청 수 = ${counter.count}`).toBeGreaterThanOrEqual(1);
    expect(counter.count).toBeLessThanOrEqual(2);
    await expectResult(list, names('08'));
  });

  // AC-059 / REQ-008 / WI-1.004
  test('AC-059 음수·비숫자 가격 입력', { tag: '@explore' }, async ({ page }) => {
    const counter = countGetProperties(page);
    // When: filter-max-price 에 -100
    await setPrice(maxPriceInput(page), '-100');
    await maxPriceInput(page).blur();
    // Then: aria-invalid="true"(최소값 0 위반 메시지), 목록 갱신 없음(요청 0) — 10건 유지
    await expect(maxPriceInput(page)).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByTestId('filter-max-price').getByText('0 이상의 금액을 입력하세요.')).toBeVisible();
    await page.waitForTimeout(1_000); // 디바운스(300ms) + 여유 동안 요청이 없어야 함
    expect(counter.count, '음수 입력으로 조회 요청 발생').toBe(0);
    await expectResult(list, names('01', '02', '03', '04', '05', '06', '07', '08', '09', '10'));

    // When: 이어서 abc 입력 시도 (값을 비운 뒤 키보드 입력)
    await setPrice(maxPriceInput(page), '');
    await maxPriceInput(page).pressSequentially('abc', { delay: 30 });
    // Then: 숫자 입력 요소에 값이 들어가지 않음(빈 문자열), 10건 유지, 오류 토스트 없음
    // soft: 값 검증이 실패해도 '10건 유지·토스트 없음' 까지 확인해 결함 범위를 리포트에 남긴다
    await expect.soft(maxPriceInput(page), 'abc 입력 후 값 = 빈 문자열').toHaveValue('');
    await page.waitForTimeout(500);
    await expectResult(list, names('01', '02', '03', '04', '05', '06', '07', '08', '09', '10'));
    await expect(page.getByText(ERROR_TOAST)).toHaveCount(0);
  });

  // AC-056 / REQ-005 (NFR-003) / WI-1.004 — (보조 UI) 인젝션 문자열 키워드 → 예외·오류 없이 0건 (본 AC 는 Apex 단위)
  test('AC-056 (보조) 인젝션 문자열 키워드 → 0건, 오류 없음', { tag: '@explore' }, async ({ page }) => {
    for (const injected of ["' OR Name LIKE '%", "서울' OR City__c != '"]) {
      await keywordInput(page).fill(injected);
      await expect(list.getByTestId('result-count')).toHaveText('0건');
      await expect(list.getByTestId('property-card')).toHaveCount(0);
      await expect(list.getByTestId('empty-state')).toHaveText(EMPTY_TEXT);
      await expect(page.getByText(ERROR_TOAST)).toHaveCount(0);
    }
  });
});

/** AC-031 When: 서울 → 3개 이상 → 최대 2000000000, 각 단계 3 → 2 → 1건 */
async function applyAc031(page: Page) {
  await keywordInput(page).fill('서울');
  await expectResult(list, names('01', '04', '08'));
  await selectBedrooms(page, '3개 이상');
  await expectResult(list, names('01', '08'));
  await setPrice(maxPriceInput(page), '2000000000');
  await expectResult(list, names('08'));
}

test.describe('agent — 잠정 AC (CK-04)', () => {
  // 잠정 AC 는 CK 해소 전 완료 조건 제외(§1.2) — E2E_CK04=1 로 활성화
  test.fixme(!process.env.E2E_CK04, 'AC-057 잠정 — CK-04(공백 키워드 trim) 미해소');
  test.beforeEach(annotateAuth);

  // AC-057 / REQ-005, REQ-008 / WI-1.004 (잠정 — CK-04)
  test('AC-057 (잠정) 공백 키워드 → 조건 미적용 10건', { tag: '@explore' }, async ({ page }) => {
    list = await gotoExplorer(page);
    await keywordInput(page).fill('서울');
    await expectResult(list, names('01', '04', '08'));
    // When: 공백 3자 → Then: 키워드 조건 미적용 10건
    await keywordInput(page).fill('   ');
    await expectResult(list, names('01', '02', '03', '04', '05', '06', '07', '08', '09', '10'));
    await expect(page.getByText(ERROR_TOAST)).toHaveCount(0);
  });
});

test.describe('agent — 잠정 AC (CK-03)', () => {
  test.fixme(!process.env.E2E_CK03, 'AC-058 잠정 — CK-03(최소 > 최대 동작) 미해소, filter-price-error 미구현');
  test.beforeEach(annotateAuth);

  // AC-058 / REQ-008 / WI-1.004 (잠정 — CK-03)
  test('AC-058 (잠정) 최소 가격 > 최대 가격', { tag: '@explore' }, async ({ page }) => {
    list = await gotoExplorer(page);
    await setPrice(minPriceInput(page), '1000000000');
    await setPrice(maxPriceInput(page), '500000000');
    await expect(page.getByTestId('filter-price-error')).toHaveText(PRICE_ERROR);
    await expect(list.getByTestId('property-card')).toHaveCount(0);
    await expect(list.getByTestId('result-count')).toHaveText('0건');
    await expect(page.getByText(ERROR_TOAST)).toHaveCount(0);
  });
});

test.describe('agent — 성능', () => {
  // AC-064 / REQ-008 (NFR-001) / WI-1.004 — DH-SIT 측정(Lab 12, CK-07)
  test('AC-064 검색 응답 1초 이내', { tag: ['@explore', '@perf'] }, async ({ browser }) => {
    test.skip(targetOrg() !== 'DH-SIT' && !process.env.E2E_PERF, 'AC-064 는 DH-SIT 측정(Lab 12) — SF_TARGET_ORG=DH-SIT 또는 E2E_PERF=1');
    test.setTimeout(5 * 120_000);
    annotateAuth();
    const server: number[] = []; // getProperties 요청 → 응답 (ms)
    const refresh: number[][] = [[], [], []]; // 단계별 마지막 입력 → 목록 갱신 (ms)
    const steps: { act: (p: Page) => Promise<void>; expected: number }[] = [
      { act: (p) => keywordInput(p).fill('서울'), expected: 3 },
      { act: (p) => selectBedrooms(p, '3개 이상'), expected: 2 },
      { act: (p) => setPrice(maxPriceInput(p), '2000000000'), expected: 1 },
    ];
    for (let i = 0; i < 5; i++) {
      const context = await browser.newContext({ storageState: storageStateFor('agent') }); // 캐시 미적용
      const page = await context.newPage();
      const started = new Map<Request, number>();
      let measuring = false; // 초기 로딩 요청은 제외(AC-063 소관), 필터 단계 요청만 측정
      page.on('request', (r) => {
        if (measuring && AURA_APEX_URL.test(r.url()) && isGetProperties(r)) started.set(r, Date.now());
      });
      page.on('requestfinished', (r) => {
        const s = started.get(r);
        if (s !== undefined) server.push(Date.now() - s);
      });
      await page.goto(EXPLORER_PATH);
      const l = page.getByTestId('property-list');
      await expect(l.getByTestId('property-card')).toHaveCount(SAMPLE_COUNT, { timeout: 60_000 });
      measuring = true;
      for (const [k, step] of steps.entries()) {
        const t0 = Date.now();
        await step.act(page);
        await expect(l.getByTestId('result-count')).toHaveText(`${step.expected}건`, { timeout: 10_000 });
        await expect(l.getByTestId('property-card')).toHaveCount(step.expected);
        refresh[k].push(Date.now() - t0);
      }
      await context.close();
    }
    const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
    test.info().annotations.push({
      type: 'perf',
      description: `server ms: ${server.join(', ')} | refresh ms 서울/3개이상/2e9: ${refresh.map((r) => r.join(',')).join(' / ')}`,
    });
    expect(server.length, 'getProperties 요청 미관측').toBeGreaterThan(0);
    expect(median(server), '서버 응답 중앙값 ≤ 1,000ms').toBeLessThanOrEqual(1_000);
    for (const r of refresh) expect(median(r), '마지막 입력 → 갱신 ≤ 1,300ms').toBeLessThanOrEqual(REFRESH_BUDGET_MS);
  });
});
