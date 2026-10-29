// WI-1.005 — 상세 패널(propertyDetail) + DreamHouse Lite 앱·"매물 탐색" App Page E2E · REQ-009, REQ-010, REQ-011, REQ-012
// AC-026, 035~043, 054, 055(UI) 를 test() 1:1 로 변환 (레이아웃·접근성 AC-045/048/068 은 WI-1.005-layout-a11y.spec.ts).
// 역할 세션(AC 문서 §1.3): tests/e2e/.auth/agent.json · admin.json · noaccess.json — `node tests/e2e/global-setup.mjs` 가 생성.
//   권한 AC(AC-038 agent 대조·AC-054·AC-055)는 역할 세션이 없으면 시스템 관리자 세션으로 대체하면 결과가 틀리므로 test.fixme.
// 데이터 변경(AC-042·043)은 afterEach 에서 sf CLI 로 Status__c 를 Available 로 복원 — support/org.ts 가드(DH-DEV/SIT/UAT 만).
import { test, expect, type Locator, type Page } from '@playwright/test';
import { cardByName, EXPLORER_PATH, gotoExplorer, SAMPLE_COUNT, storageStateFor, usesRoleState } from './support/explorer';
import { keywordInput } from './support/filter';
import { assertSafeOrg, sfResult } from './support/org';

const EMPTY_DETAIL = '매물을 선택하면 상세 정보가 표시됩니다.';
const SAVE_TOAST = '저장되었습니다.';
const SD01 = { name: '강남 래미안 아파트' };
const SD02 = { name: '해운대 오션뷰', price: '₩850,000,000', label: '판매중' };
const SD04 = { name: '마포 한강 오피스텔' };
const SD06 = { name: '둔산 센트럴 아파트' };
const SD07 = {
  name: '제주 애월 전원주택',
  address: '제주특별자치도 제주시 애월읍 애월해안로 77',
  city: '제주',
  price: '₩1,650,000,000',
  bedrooms: '5',
  bathrooms: '3',
  label: '계약중',
};
const SD09 = { name: '송도 센트럴 오피스텔', price: '₩350,000,000' };

const detail = (page: Page): Locator => page.getByTestId('property-detail');

/** 카드 클릭 → 상세 패널에 해당 매물명이 뜰 때까지 대기 */
async function selectCard(list: Locator, page: Page, name: string): Promise<void> {
  await cardByName(list, name).click();
  await expect(detail(page).getByTestId('detail-name')).toHaveText(name, { timeout: 15_000 });
}

/** 3영역 x 좌표: filter-panel < property-list < property-detail */
async function expectThreeColumns(page: Page): Promise<void> {
  const f = await page.getByTestId('filter-panel').boundingBox();
  const l = await page.getByTestId('property-list').boundingBox();
  const d = await detail(page).boundingBox();
  expect(f && l && d, '3영역 bounding box').toBeTruthy();
  expect(f!.x).toBeLessThan(l!.x);
  expect(l!.x).toBeLessThan(d!.x);
}

/** 앱 런처에서 앱 이름 검색 → 검색 결과 항목(Locator) */
async function searchAppLauncher(page: Page, appName: string): Promise<Locator> {
  await page.getByRole('button', { name: /앱 시작 관리자|App Launcher/ }).first().click();
  const search = page.getByRole('combobox', { name: /앱 및 항목 검색|Search apps and items/ });
  await expect(search).toBeVisible({ timeout: 30_000 });
  await search.fill(appName);
  return page.getByRole('option', { name: appName }).or(page.getByRole('link', { name: appName, exact: true }));
}

test.describe('agent — 상세 패널', () => {
  test.use({ storageState: storageStateFor('agent') });
  test.beforeEach(() => {
    if (!usesRoleState('agent')) {
      test.info().annotations.push({ type: 'auth', description: 'agent.json 없음 → 기본 세션(state.json)으로 실행' });
    }
  });

  // AC-037 / REQ-009 / WI-1.005
  test('AC-037 미선택 초기 상태', async ({ page }) => {
    await gotoExplorer(page);
    const d = detail(page);
    await expect(d.getByTestId('detail-empty')).toBeVisible();
    await expect(d.getByTestId('detail-empty')).toHaveText(EMPTY_DETAIL);
    await expect(d.getByTestId('detail-name')).toHaveCount(0);
  });

  // AC-026 / REQ-007, REQ-009 / WI-1.005
  test('AC-026 카드 선택 시 상세 표시, URL 불변', async ({ page }) => {
    const list = await gotoExplorer(page);
    await expect(list.getByTestId('property-card')).toHaveCount(SAMPLE_COUNT);
    const url = page.url();
    await selectCard(list, page, SD04.name);
    expect(page.url()).toBe(url);
  });

  // AC-035 / REQ-009 / WI-1.005
  test('AC-035 상세 패널 전체 속성', async ({ page }) => {
    const list = await gotoExplorer(page);
    const url = page.url();
    await selectCard(list, page, SD07.name);
    const d = detail(page);
    expect(page.url()).toBe(url);
    await expect(d.getByTestId('detail-address')).toHaveText(SD07.address);
    await expect(d.getByTestId('detail-city')).toHaveText(SD07.city);
    await expect(d.getByTestId('detail-price')).toHaveText(SD07.price);
    await expect(d.getByTestId('detail-bedrooms')).toHaveText(SD07.bedrooms);
    await expect(d.getByTestId('detail-bathrooms')).toHaveText(SD07.bathrooms);
    const badge = d.getByTestId('detail-status-badge');
    await expect(badge).toHaveText(SD07.label);
    await expect(badge).toHaveClass(/(^|\s)slds-theme_warning(\s|$)/);
    // 상세 이미지가 카드 이미지보다 넓다
    const img = d.getByTestId('detail-image');
    await expect(img).toBeVisible();
    const dw = (await img.boundingBox())!.width;
    const cw = (await cardByName(list, SD07.name).getByTestId('property-card-image').boundingBox())!.width;
    expect(dw, `detail-image ${dw}px > card image ${cw}px`).toBeGreaterThan(cw);
    await expect(img).toHaveAttribute('alt', SD07.name);
  });

  // AC-036 / REQ-009 / WI-1.005
  test('AC-036 다른 카드 선택 시 패널 교체', async ({ page }) => {
    const list = await gotoExplorer(page);
    await selectCard(list, page, SD07.name); // Given: AC-035 상태
    await selectCard(list, page, SD02.name); // When: SD-02 클릭
    await expect(page.getByTestId('property-detail')).toHaveCount(1);
    const d = detail(page);
    await expect(d.getByTestId('detail-price')).toHaveText(SD02.price);
    await expect(d.getByTestId('detail-status-badge')).toHaveText(SD02.label);
    await expect(list.getByTestId('property-card')).toHaveCount(SAMPLE_COUNT);
    await expect(list.getByTestId('result-count')).toHaveText(`${SAMPLE_COUNT}건`);
  });

  // AC-039 / REQ-009 / WI-1.005
  test('AC-039 상세 대체 이미지', async ({ page }) => {
    const list = await gotoExplorer(page);
    await selectCard(list, page, SD09.name);
    const d = detail(page);
    await expect(d.getByTestId('detail-image')).toHaveAttribute('src', /propertyPlaceholder/);
    await expect(d.getByTestId('detail-image')).toHaveAttribute('alt', SD09.name);
    await expect(d.getByTestId('detail-price')).toHaveText(SD09.price);
  });

  // AC-040 / REQ-010 / WI-1.005
  test('AC-040 앱·탭 내비게이션과 3영역 레이아웃', async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto('/lightning/page/home');
    const app = await searchAppLauncher(page, 'DreamHouse Lite');
    await app.first().click();
    // 앱 이름·탭
    await expect(page.getByRole('heading', { name: 'DreamHouse Lite', level: 1 })).toBeVisible({ timeout: 30_000 });
    const explorerTab = page.getByRole('link', { name: '매물 탐색', exact: true }).first();
    await expect(explorerTab).toBeVisible();
    await expect(page.getByRole('link', { name: '매물', exact: true }).first()).toBeVisible();
    await explorerTab.click();
    await expect(page).toHaveURL(new RegExp(EXPLORER_PATH));
    const list = page.getByTestId('property-list');
    await expect(list.getByTestId('property-card')).toHaveCount(SAMPLE_COUNT, { timeout: 45_000 });
    await selectCard(list, page, SD01.name);
    await expect(page.getByTestId('filter-panel')).toBeVisible();
    await expectThreeColumns(page);
  });

  // AC-054 / REQ-002, REQ-004, REQ-009, REQ-011 / WI-1.005
  test('AC-054 상담원 화면에 편집·상태 변경 UI 없음', async ({ page }) => {
    test.fixme(!usesRoleState('agent'), 'agent.json 없음 — 시스템 관리자 세션으로는 검증 불가');
    const list = await gotoExplorer(page);
    await selectCard(list, page, SD02.name);
    const d = detail(page);
    await expect(d.getByTestId('detail-status-badge')).toHaveText(SD02.label);
    await expect(page.getByTestId('detail-edit-button')).toHaveCount(0);
    await expect(page.getByTestId('detail-edit-form')).toHaveCount(0);
    await expect(page.getByTestId('detail-status-input')).toHaveCount(0);
    // 배지 클릭 시 상태 변경 메뉴 없음(표시 전용)
    await d.getByTestId('detail-status-badge').click();
    await cardByName(list, SD02.name).getByTestId('property-status-badge').click();
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(page.getByRole('option', { name: '계약중' })).toHaveCount(0);
    await expect(page.getByTestId('detail-status-input')).toHaveCount(0);
  });
});

test.describe('admin — 상세 패널 편집', () => {
  test.use({ storageState: storageStateFor('admin') });
  const restoreIds: string[] = [];

  test.beforeEach(() => {
    if (!usesRoleState('admin')) {
      test.info().annotations.push({ type: 'auth', description: 'admin.json 없음 → 기본 세션(state.json)으로 실행' });
    }
  });
  test.afterEach(() => {
    // 복원: 상태 변경 레코드 → Available (AC 문서 §1.3)
    while (restoreIds.length) {
      const id = restoreIds.pop()!;
      sfResult(`sf data update record -s Property__c -i ${id} -v "Status__c='Available'"`);
    }
  });

  /** 상세 편집 → 상태 선택 → 저장 → 성공 토스트(2초 이내) */
  async function changeStatus(page: Page, label: string): Promise<void> {
    const d = detail(page);
    await d.getByTestId('detail-edit-button').click();
    await expect(d.getByTestId('detail-edit-form')).toBeVisible({ timeout: 15_000 });
    const combo = d.getByTestId('detail-status-input').getByRole('combobox');
    await expect(combo).toBeVisible({ timeout: 15_000 });
    const option = page.getByRole('option', { name: label, exact: true });
    await expect(async () => {
      if (!(await option.isVisible())) await combo.click({ timeout: 5_000 });
      await expect(option).toBeVisible({ timeout: 3_000 });
    }).toPass({ timeout: 30_000 });
    await option.click();
    await d.getByTestId('detail-save-button').click();
    await expect(page.getByText(SAVE_TOAST).first()).toBeVisible({ timeout: 2_000 + 3_000 }); // AC: 2초(+네트워크 여유)
  }

  // AC-038 / REQ-009, REQ-004 / WI-1.005
  test('AC-038 관리자에게만 편집 진입점', async ({ page }) => {
    const list = await gotoExplorer(page);
    await selectCard(list, page, SD02.name);
    const url = page.url();
    const btn = detail(page).getByTestId('detail-edit-button');
    await expect(btn).toBeVisible();
    await expect(btn.getByRole('button')).toBeEnabled();
    await btn.click();
    const form = detail(page).getByTestId('detail-edit-form');
    await expect(form).toBeVisible({ timeout: 15_000 });
    await expect(form.getByRole('textbox', { name: /매물명/ })).toHaveValue(SD02.name, { timeout: 15_000 });
    expect(page.url()).toBe(url);
  });

  // AC-041 / REQ-010 / WI-1.005
  test('AC-041 관리자도 같은 화면 사용', async ({ page }) => {
    const list = await gotoExplorer(page);
    await expect(list.getByTestId('property-card')).toHaveCount(SAMPLE_COUNT);
    await expect(list.getByTestId('result-count')).toHaveText(`${SAMPLE_COUNT}건`);
    await expect(page.getByTestId('filter-panel')).toBeVisible();
    await expect(detail(page)).toBeVisible();
    await expectThreeColumns(page);
  });

  // AC-042 / REQ-011 / WI-1.005
  test('AC-042 상세에서 상태 변경 → 카드·배지 즉시 반영', async ({ page }) => {
    assertSafeOrg();
    const list = await gotoExplorer(page);
    const card = cardByName(list, SD02.name);
    restoreIds.push((await card.getAttribute('data-id'))!);
    await selectCard(list, page, SD02.name);
    await page.evaluate(() => ((window as unknown as { __noReload: boolean }).__noReload = true));
    await changeStatus(page, '계약중');
    const badge = card.getByTestId('property-status-badge');
    await expect(badge).toHaveText('계약중', { timeout: 10_000 });
    await expect(badge).toHaveAttribute('data-status', 'Under Contract');
    await expect(badge).toHaveClass(/slds-theme_warning/);
    await expect(detail(page).getByTestId('detail-status-badge')).toHaveText('계약중');
    await expect(list.getByTestId('result-count')).toHaveText(`${SAMPLE_COUNT}건`);
    expect(await page.evaluate(() => (window as unknown as { __noReload?: boolean }).__noReload)).toBe(true);
  });

  // AC-043 / REQ-011 / WI-1.005
  test('AC-043 판매완료로 변경해도 목록에 남음', async ({ page }) => {
    assertSafeOrg();
    const list = await gotoExplorer(page);
    await keywordInput(page).fill('대전');
    await expect(list.getByTestId('property-card')).toHaveCount(1);
    const card = cardByName(list, SD06.name);
    restoreIds.push((await card.getAttribute('data-id'))!);
    await selectCard(list, page, SD06.name);
    await page.evaluate(() => ((window as unknown as { __noReload: boolean }).__noReload = true));
    await changeStatus(page, '판매완료');
    const badge = card.getByTestId('property-status-badge');
    await expect(badge).toHaveText('판매완료', { timeout: 10_000 });
    await expect(badge).toHaveAttribute('data-status', 'Sold');
    await expect(badge).not.toHaveClass(/slds-theme_(success|warning)/);
    await expect(list.getByTestId('property-card')).toHaveCount(1);
    await expect(list.getByTestId('result-count')).toHaveText('1건');
    await expect(keywordInput(page)).toHaveValue('대전');
    expect(await page.evaluate(() => (window as unknown as { __noReload?: boolean }).__noReload)).toBe(true);
  });
});

test.describe('noaccess — 앱 미노출', () => {
  test.use({ storageState: storageStateFor('noaccess') });

  // AC-055 / REQ-002, REQ-005, REQ-010 / WI-1.005 (UI 부분 — Apex 부분은 WI-1.003 PropertyControllerTest)
  test('AC-055 (UI) 권한 세트 미할당 사용자 앱 런처 검색 0건', async ({ page }) => {
    test.fixme(!usesRoleState('noaccess'), 'noaccess.json 없음 — 시스템 관리자 세션으로는 검증 불가');
    test.setTimeout(120_000);
    await page.goto('/lightning/page/home');
    const results = await searchAppLauncher(page, 'DreamHouse Lite');
    await page.waitForTimeout(2_000); // 검색 결과 렌더 대기(없음을 확인해야 하므로 고정 대기)
    await expect(results).toHaveCount(0);
    // negative: 탭 URL 직접 접근 시에도 매물 카드가 보이지 않음
    await page.goto(EXPLORER_PATH);
    await page.waitForTimeout(5_000);
    await expect(page.getByTestId('property-card')).toHaveCount(0);
  });
});
