// WI-1.005 — "매물 탐색" 반응형·접근성 E2E · REQ-012 (NFR-008)
// AC-045, AC-048, AC-068(Should, @axe-core/playwright) 을 test() 1:1 로 변환. Given = `agent` 세션.
// AC-045(b) 가로 스크롤: 헤더의 DevOps Center 작업 항목 바(관리자 세션에만 표시)가 document.scrollWidth 를 키우므로
//   agent 세션으로 실행하고, 판정은 우리 컴포넌트(filter-panel/property-list/property-detail) bounding box 가 375px 안에 있는지로 한다.
import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Page } from '@playwright/test';
import { cardByName, gotoExplorer, SAMPLE_COUNT, storageStateFor, usesRoleState } from './support/explorer';

test.use({ storageState: storageStateFor('agent') });
test.beforeEach(() => {
  if (!usesRoleState('agent')) {
    test.info().annotations.push({ type: 'auth', description: 'agent.json 없음 → 기본 세션(state.json)으로 실행' });
  }
});

async function cardBoxes(page: Page) {
  const boxes = [];
  for (const c of await page.getByTestId('property-card').all()) boxes.push((await c.boundingBox())!);
  return boxes;
}

// AC-045 / REQ-012 / WI-1.005
test('AC-045 반응형 (a) 1440×900', async ({ page }) => {
  const list = await gotoExplorer(page);
  await expect(list.getByTestId('property-card')).toHaveCount(SAMPLE_COUNT);
  await expect(list.getByTestId('result-count')).toHaveText(`${SAMPLE_COUNT}건`);
  const boxes = await cardBoxes(page);
  const firstY = Math.min(...boxes.map((b) => Math.round(b.y)));
  const firstRow = boxes.filter((b) => Math.abs(Math.round(b.y) - firstY) <= 2);
  expect(firstRow.length, '첫 행 카드 수').toBeGreaterThanOrEqual(3);
  const f = (await page.getByTestId('filter-panel').boundingBox())!;
  const l = (await list.boundingBox())!;
  expect(f.x + f.width, 'filter-panel 이 property-list 왼쪽').toBeLessThanOrEqual(l.x + 1);
});

// AC-045 / REQ-012 / WI-1.005
test('AC-045 반응형 (b) 375×812', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const list = await gotoExplorer(page);
  await expect(list.getByTestId('property-card')).toHaveCount(SAMPLE_COUNT);
  await expect(list.getByTestId('result-count')).toHaveText(`${SAMPLE_COUNT}건`);
  const boxes = await cardBoxes(page);
  const xs = new Set(boxes.map((b) => Math.round(b.x)));
  expect([...xs], '행당 카드 1개(모든 카드 x 동일)').toHaveLength(1);
  const f = (await page.getByTestId('filter-panel').boundingBox())!;
  const l = (await list.boundingBox())!;
  expect(f.y + f.height, 'filter-panel 이 property-list 위쪽').toBeLessThanOrEqual(l.y + 1);
  // 가로 스크롤 없음 — 우리 컴포넌트 기준(헤더 DevOps Center 바 제외, 파일 머리말 참고)
  for (const id of ['filter-panel', 'property-list', 'property-detail']) {
    const b = (await page.getByTestId(id).boundingBox())!;
    expect(b.x, `${id} left`).toBeGreaterThanOrEqual(0);
    expect(b.x + b.width, `${id} right ≤ 375`).toBeLessThanOrEqual(375);
  }
  for (const b of boxes) expect(b.x + b.width, 'card right ≤ 375').toBeLessThanOrEqual(375);
  // 참고값: document scrollWidth (헤더 포함) — annotation 으로만 기록
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  test.info().annotations.push({ type: 'scrollWidth', description: String(sw) });
});

// AC-048 / REQ-012 / WI-1.005
test('AC-048 접근성 라벨·키보드 조작', async ({ page }) => {
  const list = await gotoExplorer(page);
  for (const label of ['키워드', '최소 가격', '최대 가격', '최소 침실 수']) {
    // lightning-combobox 는 닫힌 상태의 listbox 도 같은 라벨(aria-labelledby)을 가져 DOM 상 2개 → 보이는(조작 가능한) 요소 기준 1개
    await expect(page.getByLabel(label, { exact: true }).filter({ visible: true }), `getByLabel('${label}')`).toHaveCount(1);
  }
  const sd01 = cardByName(list, '강남 래미안 아파트');
  await expect(sd01).toHaveAttribute('aria-label', /강남 래미안 아파트.*₩2,500,000,000/);
  for (const c of await list.getByTestId('property-card').all()) {
    await expect(c).toHaveAttribute('aria-label', /₩[\d,]+/);
  }
  // Tab 으로 SD-01 카드 포커스: 필터 패널의 마지막 요소(초기화)에서 시작해 Tab 을 눌러 SD-01 에 도달
  await page.getByTestId('filter-reset').getByRole('button').focus();
  let focused = false;
  for (let i = 0; i < 40 && !focused; i++) {
    await page.keyboard.press('Tab');
    // LWC shadow DOM: document.activeElement 는 최상위 호스트 → shadowRoot.activeElement 를 따라 내려가 실제 포커스 요소를 찾는다
    focused = await sd01.evaluate((el) => {
      let a: Element | null = document.activeElement;
      while (a) {
        if (a === el || el.contains(a)) return true;
        a = a.shadowRoot?.activeElement ?? null;
      }
      return false;
    });
  }
  expect(focused, 'Tab 으로 SD-01 카드 포커스').toBe(true);
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('detail-name')).toHaveText('강남 래미안 아파트');
});

// AC-068 / REQ-012 (NFR-008) / WI-1.005 (Should)
test('AC-068 (Should) axe 자동 접근성 검사', async ({ page }) => {
  const list = await gotoExplorer(page);
  await cardByName(list, '강남 래미안 아파트').click();
  await expect(page.getByTestId('detail-name')).toHaveText('강남 래미안 아파트');
  // data-testid 요소는 LWC shadow DOM 안이라 axe include 셀렉터로 찾지 못함(No elements found for include) →
  // 페이지 전체를 검사한 뒤, 위반 노드의 대상 경로(shadow 포함)가 우리 컴포넌트(c-property-* 또는 3개 영역 testid)인 것만 집계
  const r = await new AxeBuilder({ page }).analyze();
  const ours = (t: unknown) =>
    /c-property-|filter-panel|property-list|property-detail|property-card|detail-|filter-/.test(JSON.stringify(t));
  const scoped = r.violations
    .map((v) => ({ ...v, nodes: v.nodes.filter((n) => ours(n.target) || ours(n.html)) }))
    .filter((v) => v.nodes.length > 0);
  test.info().annotations.push({ type: 'axe', description: `전체 위반 ${r.violations.length}종, 우리 영역 ${scoped.length}종` });
  const serious = scoped.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''));
  expect(
    serious.map((v) => `${v.id}(${v.impact}) x${v.nodes.length}: ${v.nodes[0]?.target.join(' ')}`),
    'serious/critical 위반',
  ).toEqual([]);
  expect(scoped.filter((v) => v.id === 'image-alt').map((v) => v.nodes.length), 'alt 누락').toEqual([]);
  // 영역 내 이미지 alt 직접 확인
  for (const img of await page.getByTestId('property-card-image').all()) await expect(img).toHaveAttribute('alt', /.+/);
  await expect(page.getByTestId('detail-image')).toHaveAttribute('alt', '강남 래미안 아파트');
  // 배지는 텍스트로도 상태 전달
  for (const b of await page.getByTestId('property-status-badge').all()) {
    await expect(b).toHaveText(/판매중|계약중|판매완료/);
  }
  await expect(page.getByTestId('detail-status-badge')).toHaveText(/판매중|계약중|판매완료/);
});
