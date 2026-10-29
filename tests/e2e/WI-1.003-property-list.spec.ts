// WI-1.003 — 매물 목록(propertyList) + PropertyController.getProperties E2E · REQ-007, REQ-011, REQ-012 (NFR-001)
// AC-024, 025, 032(목록·건수 부분), 044(Should), 046, 047, 063(@perf) 을 test() 1:1 로 변환.
// 모두 "매물 탐색" 탭(App Page)이 필요하므로 `@explore` (PHASE-PLAN-01 §3.3 · §3.4).
// 필터 입력이 목록 조회 조건으로 연결되는 것은 WI-1.004 소유 → 필터를 쓰는 AC(025·032·046·047 본문)는 `@filter` 를 추가로 단다.
//   WI-1.004 이전 실행: npx playwright test tests/e2e/WI-1.003 --grep-invert "@filter|@perf"
//   (보조) 표시가 붙은 test 는 같은 AC 의 Then 을 필터 없이(초기 로딩 응답 모의) 검증하는 경계/negative 케이스.
// 데이터: 실제 Property__c SD-01~SD-10(10건). 정렬은 검증하지 않는다(OQ-09).
// AC-044 만 데이터를 바꾸며 afterEach 에서 sf CLI 로 SD-03 Status__c 를 원래 값(Under Contract)으로 복원한다.
// 대상 org 가드(코드 리뷰 L-4): AC-044 describe 의 beforeAll 에서 assertSafeOrg() — DH-DEV/SIT/UAT 외(DH-HUB/core 등)는 throw.
import { test, expect, type Locator, type Page } from '@playwright/test';
import {
  cardByName,
  EXPLORER_PATH,
  gotoExplorer,
  SAMPLE_COUNT,
  storageStateFor,
  usesRoleState,
} from './support/explorer';
import { delayGetProperties, emptyGetProperties, failGetProperties, isGetProperties, AURA_APEX_URL } from './support/aura';
import { assertSafeOrg, sfResult, targetOrg } from './support/org';

const ORG = targetOrg(); // 조건 판단용(@perf). sf 명령·데이터 변경은 support/org.ts 가드(DH-DEV/SIT/UAT 만) 경유

// AC 문서 §1.4 / §1.5
const SOLD = ['광교 호수 타운하우스', '송파 잠실 아파트']; // SD-05, SD-08
const SD03 = { name: '판교 테크노 빌라', status: 'Under Contract', label: '계약중' };
const MIN_PRICE_900M = ['강남 래미안 아파트', '판교 테크노 빌라', '광교 호수 타운하우스', '제주 애월 전원주택', '송파 잠실 아파트'];
const BUSAN = ['해운대 오션뷰', '서면 스카이 빌라']; // SD-02, SD-10
const EMPTY_TEXT = '조건에 맞는 매물이 없습니다.';
const ERROR_TOAST = '매물 정보를 불러오지 못했습니다.';

function annotateAuth(role: 'agent' | 'admin') {
  if (!usesRoleState(role)) {
    test.info().annotations.push({
      type: 'auth',
      description: `tests/e2e/.auth/${role}.json 없음 → 기본 세션(state.json)으로 실행. 역할 사용자 생성 후 재실행 필요`,
    });
  }
}

/** property-card 집합의 data-name 목록(순서 무시) */
async function cardNames(list: Locator): Promise<string[]> {
  const names = await list.getByTestId('property-card').evaluateAll((els) => els.map((e) => e.getAttribute('data-name') ?? ''));
  return names.sort();
}

/** "판매완료 제외" 류 옵션 없음 (AC-032 negative) */
async function expectNoExcludeSoldOption(page: Page) {
  const panel = page.getByTestId('filter-panel');
  await expect(panel).toBeVisible();
  await expect(panel.getByRole('checkbox')).toHaveCount(0);
  await expect(panel.getByText(/판매\s*완료|Sold/)).toHaveCount(0);
}

test.describe('agent — 매물 목록', () => {
  // AC 문서 §1.3: Given `agent` 로그인
  test.use({ storageState: storageStateFor('agent') });
  test.beforeEach(() => annotateAuth('agent'));

  // AC-024 / REQ-007 / WI-1.003
  test('AC-024 초기 진입 시 전체 목록과 건수', { tag: '@explore' }, async ({ page }) => {
    // When: "매물 탐색" 탭 진입
    const list = await gotoExplorer(page);

    // Then: property-card 10개, result-count = 10건, empty-state 미표시
    await expect(list.getByTestId('property-card')).toHaveCount(SAMPLE_COUNT);
    await expect(list.getByTestId('result-count')).toHaveText(`${SAMPLE_COUNT}건`);
    await expect(list.getByTestId('empty-state')).toHaveCount(0);
    await expect(list.getByTestId('loading-spinner')).toHaveCount(0);
    // Then: 판매완료 카드(SD-05, SD-08) 포함 — 상태로 제외하지 않음
    for (const name of SOLD) {
      await expect(cardByName(list, name).getByTestId('property-status-badge')).toHaveAttribute('data-status', 'Sold');
    }
    await expect(list.locator('[data-testid="property-status-badge"][data-status="Sold"]')).toHaveCount(2);
    // 결정성: 중복 없는 10개 고유 매물
    expect(new Set(await cardNames(list)).size).toBe(SAMPLE_COUNT);
  });

  // AC-025 / REQ-007 / WI-1.003
  test('AC-025 결과 0건 안내', { tag: ['@explore', '@filter'] }, async ({ page }) => {
    const list = await gotoExplorer(page); // Given: AC-024 상태
    // When: filter-keyword 에 '강릉' 입력
    await page.getByTestId('filter-keyword').getByRole('searchbox').fill('강릉');
    // Then: 1초 이내(디바운스 300ms 포함 여유 → 1,300ms) 카드 0개, 0건, 빈 결과 문구
    await expect(list.getByTestId('property-card')).toHaveCount(0, { timeout: 1_300 });
    await expect(list.getByTestId('result-count')).toHaveText('0건');
    await expect(list.getByTestId('empty-state')).toBeVisible();
    await expect(list.getByTestId('empty-state')).toHaveText(EMPTY_TEXT);
  });

  // AC-025 / REQ-007 / WI-1.003 — (보조) 서버가 0건을 돌려줄 때 빈 결과 안내 (필터 없이 응답 모의)
  test('AC-025 (보조) 조회 결과 0건 응답 시 빈 결과 안내', { tag: '@explore' }, async ({ page }) => {
    const mocked = await emptyGetProperties(page);
    await page.goto(EXPLORER_PATH);
    const list = page.getByTestId('property-list');
    await expect(list).toBeVisible({ timeout: 45_000 });
    await expect(list.getByTestId('empty-state')).toBeVisible({ timeout: 30_000 });
    expect(mocked.count, 'getProperties 요청이 모의되지 않음').toBeGreaterThan(0);
    // Then: 카드 0, 0건, 문구. negative: 스피너 없음, 오류 토스트 없음(0건은 오류가 아님 — AC-018)
    await expect(list.getByTestId('empty-state')).toHaveText(EMPTY_TEXT);
    await expect(list.getByTestId('property-card')).toHaveCount(0);
    await expect(list.getByTestId('result-count')).toHaveText('0건');
    await expect(list.getByTestId('loading-spinner')).toHaveCount(0);
    await expect(page.getByText(ERROR_TOAST)).toHaveCount(0);
  });

  // AC-032 / REQ-008, REQ-007 / WI-1.003 (목록·건수 렌더링 부분 — 가격 조건 Apex 는 WI-1.004)
  test('AC-032 판매완료 매물 기본 노출', { tag: ['@explore', '@filter'] }, async ({ page }) => {
    const list = await gotoExplorer(page); // Given: AC-024 상태
    await expectNoExcludeSoldOption(page); // Then: "판매완료 제외" 류 기본 옵션 없음
    // When: filter-min-price 900000000
    await page.getByTestId('filter-min-price').getByRole('spinbutton').fill('900000000');
    // Then: 5개(SD-01·03·05·07·08) 5건
    await expect(list.getByTestId('property-card')).toHaveCount(5);
    await expect(list.getByTestId('result-count')).toHaveText('5건');
    expect(await cardNames(list)).toEqual([...MIN_PRICE_900M].sort());
    // Then: Sold 2(SD-05, SD-08), Under Contract 2
    await expect(list.locator('[data-testid="property-status-badge"][data-status="Sold"]')).toHaveCount(2);
    await expect(list.locator('[data-testid="property-status-badge"][data-status="Under Contract"]')).toHaveCount(2);
    for (const name of SOLD) await expect(cardByName(list, name)).toHaveCount(1);
  });

  // AC-046 / REQ-012, REQ-007 / WI-1.003
  test('AC-046 로딩 스피너', { tag: ['@explore', '@filter'] }, async ({ page }) => {
    const list = await gotoExplorer(page);
    // Given: getProperties 응답 1,500ms 지연 (초기 로딩 이후부터 적용)
    const delayed = await delayGetProperties(page, 1_500);
    // When: filter-keyword '부산'
    await page.getByTestId('filter-keyword').getByRole('searchbox').fill('부산');
    // Then: 대기 중 loading-spinner(대체 텍스트 '로딩 중')
    const spinner = list.getByTestId('loading-spinner');
    await expect(spinner).toBeVisible({ timeout: 1_500 });
    await expect(spinner.getByText('로딩 중')).toHaveCount(1);
    // Then: 응답 후 스피너 사라지고 카드 2개(SD-02, SD-10)
    await expect(spinner).toHaveCount(0, { timeout: 15_000 });
    await expect(list.getByTestId('property-card')).toHaveCount(2);
    expect(await cardNames(list)).toEqual([...BUSAN].sort());
    expect(delayed.count, 'getProperties 요청이 지연되지 않음').toBeGreaterThan(0);
  });

  // AC-046 / REQ-012, REQ-007 / WI-1.003 — (보조) 초기 진입 응답 지연 시 스피너 → 10건
  test('AC-046 (보조) 초기 로딩 중 스피너 표시 후 사라짐', { tag: '@explore' }, async ({ page }) => {
    const delayed = await delayGetProperties(page, 1_500);
    await page.goto(EXPLORER_PATH);
    const list = page.getByTestId('property-list');
    await expect(list).toBeVisible({ timeout: 45_000 });
    const spinner = list.getByTestId('loading-spinner');
    // Then: 응답 대기 중 스피너 + 대체 텍스트, 카드 없음(빈 결과 문구도 없음 — 로딩 중 0건 오표시 방지)
    await expect(spinner).toBeVisible();
    await expect(spinner.getByText('로딩 중')).toHaveCount(1);
    await expect(list.getByTestId('empty-state')).toHaveCount(0);
    // Then: 응답 후 스피너 사라지고 10건
    await expect(list.getByTestId('property-card')).toHaveCount(SAMPLE_COUNT, { timeout: 30_000 });
    await expect(spinner).toHaveCount(0);
    await expect(list.getByTestId('result-count')).toHaveText(`${SAMPLE_COUNT}건`);
    expect(delayed.count).toBeGreaterThan(0);
  });

  // AC-047 / REQ-012, REQ-007 / WI-1.003
  test('AC-047 조회 오류 토스트', { tag: ['@explore', '@filter'] }, async ({ page }) => {
    const list = await gotoExplorer(page);
    // Given: getProperties 응답 state ERROR 모의
    const failed = await failGetProperties(page);
    // When: filter-keyword '서울'
    await page.getByTestId('filter-keyword').getByRole('searchbox').fill('서울');
    // Then: error 토스트, 스피너 미표시, 빈 흰 화면 없음
    await expect(page.getByText(ERROR_TOAST).first()).toBeVisible({ timeout: 10_000 });
    expect(failed.count).toBeGreaterThan(0);
    await expect(list.getByTestId('loading-spinner')).toHaveCount(0);
    await expect(list).toBeVisible();
    await expect(page.getByTestId('filter-panel')).toBeVisible();
    // 빈 흰 화면 없음: 목록 영역에 인라인 오류(alert) 또는 건수가 보인다 (ENHANCED 2026-10-29: 오류 상태에서 result-count 는
    // 숨김 처리될 수 있음 — AC-047 Then 은 건수 표시를 요구하지 않으므로 인라인 오류 표시도 허용)
    await expect(list.getByRole('alert').or(list.getByTestId('result-count')).first()).toBeVisible();
  });

  // AC-047 / REQ-012, REQ-007 / WI-1.003 — (보조) 초기 진입 조회 오류
  test('AC-047 (보조) 초기 진입 조회 오류 시 토스트·스피너 없음·화면 유지', { tag: '@explore' }, async ({ page }) => {
    const failed = await failGetProperties(page);
    await page.goto(EXPLORER_PATH);
    const list = page.getByTestId('property-list');
    await expect(list).toBeVisible({ timeout: 45_000 });
    // Then: error 토스트(제목 §1.5)
    await expect(page.getByText(ERROR_TOAST).first()).toBeVisible({ timeout: 30_000 });
    expect(failed.count).toBeGreaterThan(0);
    // Then(negative): 스피너가 남아 있지 않음, 카드 없음, 화면(목록 컨테이너·필터 패널) 유지
    await expect(list.getByTestId('loading-spinner')).toHaveCount(0);
    await expect(list.getByTestId('property-card')).toHaveCount(0);
    await expect(page.getByTestId('filter-panel')).toBeVisible();
    // 모의 오류 원문(서버 메시지)이 그대로 노출되지 않음
    await expect(page.getByText('E2E 모의 오류')).toHaveCount(0);
  });

  // AC-063 / REQ-007 (NFR-001) / WI-1.003 — DH-SIT 측정(Lab 12, CK-07)
  test('AC-063 초기 목록 응답 1초 이내', { tag: ['@explore', '@perf'] }, async ({ browser }) => {
    test.skip(ORG !== 'DH-SIT' && !process.env.E2E_PERF, 'AC-063 은 DH-SIT 측정(Lab 12) — SF_TARGET_ORG=DH-SIT 또는 E2E_PERF=1');
    test.setTimeout(5 * 90_000);
    const samples: number[] = [];
    for (let i = 0; i < 5; i++) {
      // 캐시 미적용: 매 회 새 컨텍스트
      const context = await browser.newContext({ storageState: storageStateFor('agent') });
      const page = await context.newPage();
      let start = 0;
      page.on('request', (req) => {
        if (!start && AURA_APEX_URL.test(req.url()) && isGetProperties(req)) start = Date.now();
      });
      await page.goto(EXPLORER_PATH);
      await expect(page.getByTestId('property-card')).toHaveCount(SAMPLE_COUNT, { timeout: 60_000 });
      const end = Date.now();
      expect(start, 'getProperties 요청 미관측').toBeGreaterThan(0);
      samples.push(end - start);
      await context.close();
    }
    const sorted = [...samples].sort((a, b) => a - b);
    test.info().annotations.push({ type: 'perf', description: `getProperties→10카드 ms: ${samples.join(', ')}` });
    expect(sorted[2], '중앙값 ≤ 1,000ms').toBeLessThanOrEqual(1_000);
    expect(sorted[4], '최대 ≤ 1,500ms').toBeLessThanOrEqual(1_500);
  });
});

test.describe('admin — 표준 페이지 변경 후 복귀 반영', () => {
  test.use({ storageState: storageStateFor('admin') });
  let sd03Id: string | undefined;

  test.afterEach(() => {
    // 복원: SD-03 Status__c = Under Contract (AC 문서 §1.3 — 상태 변경 테스트는 afterEach 복원)
    if (!sd03Id) return;
    sfResult(`sf data update record -s Property__c -i ${sd03Id} -v "Status__c='${SD03.status}'"`);
  });

  // AC-044 / REQ-011, REQ-004 / WI-1.003 (Should — 실패 시 I-10 으로 이월)
  test('AC-044 (Should) 표준 레코드 페이지 변경 후 탐색 화면 복귀 시 반영', { tag: '@explore' }, async ({ page }) => {
    test.setTimeout(180_000); // sf CLI 조회·복원 + 레코드 편집 포함
    annotateAuth('admin');
    // Given: "매물 탐색" 탭을 한 번 로드해 SD-03 배지 '계약중' 확인
    let list = await gotoExplorer(page);
    const card = cardByName(list, SD03.name);
    await expect(card.getByTestId('property-status-badge')).toHaveText(SD03.label);
    sd03Id = (await card.getAttribute('data-id')) ?? undefined;
    expect(sd03Id, 'property-card data-id').toMatch(/^[a-zA-Z0-9]{15,18}$/);

    // When: SD-03 표준 레코드 페이지로 SPA 이동(새로고침 없음) → 편집 → 상태 '판매중' → 저장
    await page.evaluate((recordId) => {
      // Lightning 표준 내비게이션 이벤트 — page.goto 를 쓰면 전체 새로고침이 되어 캐시 검증이 무의미해진다
      const w = window as unknown as { $A: { get(n: string): { setParams(p: object): { fire(): void } } } };
      w.$A.get('e.force:navigateToSObject').setParams({ recordId }).fire();
    }, sd03Id);
    await expect(page).toHaveURL(new RegExp(`/lightning/r/(Property__c/)?${sd03Id}`), { timeout: 30_000 });
    await page.getByRole('button', { name: /^(편집|Edit)$/ }).first().click(); // 사용자 UI 언어(ko/en) 무관
    const dialog = page.getByRole('dialog');
    // 모달 로딩 직후 클릭이 무시되는 경우가 있어(2026-10-29 실행 관측: 드롭다운 미표시로 테스트 타임아웃) 열릴 때까지 재시도
    const statusBox = dialog.getByRole('combobox', { name: '상태' });
    await expect(statusBox).toContainText(SD03.label, { timeout: 30_000 });
    const available = page.getByRole('option', { name: '판매중' });
    await expect(async () => {
      // (ENHANCED 2026-10-29) click 에 timeout 지정 — actionTimeout 기본값(무제한) 때문에 클릭이 걸리면 toPass 가 재시도하지 못하고 테스트 타임아웃(전체 회귀 2회 관측)
      if (!(await available.isVisible())) await statusBox.click({ timeout: 5_000 });
      await expect(available).toBeVisible({ timeout: 3_000 });
    }).toPass({ timeout: 30_000 });
    await available.click();
    await expect(statusBox).toContainText('판매중');
    await dialog.getByRole('button', { name: /^(저장|Save)$/ }).click();
    await expect(dialog).toHaveCount(0, { timeout: 30_000 });
    // 전제 확인: 저장이 실제 반영됨(실패 원인을 '저장 실패'와 '목록 캐시'로 구분)
    const saved = sfResult(`sf data query -q "SELECT Status__c FROM Property__c WHERE Id = '${sd03Id}'"`).records[0].Status__c;
    expect(saved, 'SD-03 저장 결과(서버)').toBe('Available');

    // When: 내비게이션의 '매물 탐색' 탭 클릭 (브라우저 새로고침 없음)
    await page.getByRole('link', { name: '매물 탐색', exact: true }).first().click();
    await expect(page).toHaveURL(new RegExp(`${EXPLORER_PATH}`));
    list = page.getByTestId('property-list');
    await expect(list).toBeVisible({ timeout: 30_000 });

    // Then: SD-03 배지 = '판매중', 이전 값 '계약중' 없음 (cacheable 캐시 미사용)
    const badge = cardByName(list, SD03.name).getByTestId('property-status-badge');
    await expect(badge).toHaveText('판매중', { timeout: 15_000 });
    await expect(badge).toHaveAttribute('data-status', 'Available');
    await expect(list.getByTestId('property-card')).toHaveCount(SAMPLE_COUNT);
  });
});
