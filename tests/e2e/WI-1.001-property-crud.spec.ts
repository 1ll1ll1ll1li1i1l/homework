// WI-1.001 — 매물 데이터 모델 / 표준 화면 CRUD E2E · REQ-002, REQ-004
// AC-006(agent), AC-009 → 011 → 012(admin, 같은 레코드 — describe.serial), AC-010, AC-060 을 test() 1:1 로 변환.
// AC-061(잠정 — CK-05) 은 test.fixme. "매물 탐색" 탭 확인 단계(AC-009·011·012·060 의 카드 부분)는 `@explore`.
// 데이터: E2E 가 만든 레코드는 이름 접두어 `[E2E]` — beforeAll/afterAll 에서 sf CLI 로 삭제(support/org.ts 가드, DH-DEV/SIT/UAT 만).
//   기준 데이터 SD-01~SD-10 은 건드리지 않는다(분포 6/2/2 는 afterAll 에서 확인).
// 표준 화면은 사용자 언어 ko 기준(새로 만들기·편집·삭제·저장). 셀렉터는 getByRole/getByLabel 만.
import { test, expect, type Locator, type Page } from '@playwright/test';
import { cardByName, gotoExplorer, SAMPLE_COUNT, storageStateFor, usesRoleState } from './support/explorer';
import { keywordInput } from './support/filter';
import { assertSafeOrg, sfResult } from './support/org';

const OBJECT_HOME = '/lightning/o/Property__c/list?filterName=__Recent';
const SEONGSU = {
  name: '[E2E] 성수 숲 아파트',
  address: '서울특별시 성동구 왕십리로 1',
  city: '서울',
  price: '1100000000',
  priceLabel: '₩1,100,000,000',
  bedrooms: '2',
  bathrooms: '1',
};
const SD02 = { name: '해운대 오션뷰', price: '₩850,000,000' };

// ---------- sf CLI 헬퍼 (가드 경유) ----------
function e2eIds(like = '[E2E]%'): string[] {
  return sfResult(`sf data query -q "SELECT Id FROM Property__c WHERE Name LIKE '${like}'"`).records.map(
    (r: { Id: string }) => r.Id,
  );
}
function countByName(name: string): number {
  return sfResult(`sf data query -q "SELECT Id FROM Property__c WHERE Name = '${name}'"`).records.length;
}
function cleanupE2E(): void {
  for (const id of e2eIds()) sfResult(`sf data delete record -s Property__c -i ${id}`);
}
function sampleDistribution(): Record<string, number> {
  const rows = sfResult(
    `sf data query -q "SELECT Status__c s, COUNT(Id) c FROM Property__c WHERE (NOT Name LIKE '[E2E]%') GROUP BY Status__c"`,
  ).records as { s: string; c: number }[];
  return Object.fromEntries(rows.map((r) => [r.s, r.c]));
}

// ---------- 표준 화면 헬퍼 ----------
// 모달(새 매물 / 편집 / 삭제 확인). 오류 팝오버도 role=dialog 이므로 aria-modal 모달로 한정
const dialog = (page: Page): Locator => page.getByRole("dialog").and(page.locator("[aria-modal=true]"));
// 텍스트 필드 = textbox, 숫자·통화 필드(가격·침실·욕실) = spinbutton (2026-10-29 DH-DEV 관측)
const field = (scope: Locator, label: string): Locator =>
  scope.getByRole('textbox', { name: label, exact: true }).or(scope.getByRole('spinbutton', { name: label, exact: true }));
const saveButton = (scope: Locator): Locator => scope.getByRole('button', { name: '저장', exact: true });

async function openNewForm(page: Page): Promise<Locator> {
  await page.goto(OBJECT_HOME);
  await page.getByRole('button', { name: '새로 만들기', exact: true }).first().click();
  const d = dialog(page);
  await expect(field(d, '매물명')).toBeVisible({ timeout: 30_000 });
  return d;
}

async function fillIf(scope: Locator, label: string, value: string | undefined): Promise<void> {
  if (value === undefined) return;
  await setValue(field(scope, label), value);
}

/** 표준 폼 숫자·통화 필드는 포커스 시 표시값이 바뀌어 fill 이 이어 붙을 수 있음(support/filter.ts setPrice 와 같은 이유) → 지우고 입력 */
async function setValue(input: Locator, value: string): Promise<void> {
  await input.click();
  await input.press('ControlOrMeta+a');
  await input.press('Backspace');
  await input.fill(value);
}

async function annotate(role: 'agent' | 'admin') {
  if (!usesRoleState(role)) {
    test.info().annotations.push({ type: 'auth', description: `${role}.json 없음 → 기본 세션(state.json)으로 실행` });
  }
}

// =====================================================================================
test.describe('agent — 표준 화면 진입점 미노출', () => {
  test.use({ storageState: storageStateFor('agent') });

  // AC-006 / REQ-002, REQ-004 / WI-1.001
  test('AC-006 상담원에게 새로 만들기·편집·삭제 미노출', async ({ page }) => {
    test.fixme(!usesRoleState('agent'), 'agent.json 없음 — 시스템 관리자 세션으로는 검증 불가');
    test.setTimeout(120_000);
    // (1) 매물 오브젝트 탭 목록
    await page.goto(OBJECT_HOME);
    await expect(page.getByRole('heading', { name: /매물 최근 조회 항목/ })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('button', { name: '새로 만들기', exact: true })).toHaveCount(0);
    // (2) SD-02 표준 레코드 페이지
    const sd02 = sfResult(`sf data query -q "SELECT Id FROM Property__c WHERE Name = '${SD02.name}'"`).records[0].Id;
    await page.goto(`/lightning/r/Property__c/${sd02}/view`);
    await expect(page.getByText(SD02.price).first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(SD02.name).first()).toBeVisible();
    await expect(page.getByRole('button', { name: '편집', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: '삭제', exact: true })).toHaveCount(0);
    // 더 많은 작업 메뉴가 있으면 열어서 삭제·편집 항목 없음 확인
    const more = page.getByRole('button', { name: /작업 더 보기|더 많은 작업 표시|Show more actions/ });
    if (await more.count()) {
      await more.first().click();
      await expect(page.getByRole('menuitem', { name: /^(편집|삭제)$/ })).toHaveCount(0);
      await page.keyboard.press('Escape');
    }
    // Status 인라인 편집 아이콘(연필) 없음
    await expect(page.getByRole('button', { name: /상태 편집|Edit 상태/ })).toHaveCount(0);
  });
});

// =====================================================================================
test.describe.serial('admin — 표준 화면 CRUD (AC-009 → 011 → 012 같은 레코드)', () => {
  test.use({ storageState: storageStateFor('admin') });
  let recordId: string | undefined;

  test.beforeAll(() => {
    assertSafeOrg();
    cleanupE2E(); // 이전 실행 잔여 [E2E] 레코드 제거 → 결정성
  });
  test.afterAll(() => {
    cleanupE2E();
    // 기준 데이터 분포 유지 확인 (6/2/2)
    expect(sampleDistribution()).toEqual({ Available: 6, 'Under Contract': 2, Sold: 2 });
  });
  test.beforeEach(() => annotate('admin'));

  // AC-009 / REQ-004 / WI-1.001
  test('AC-009 등록 — 표준 화면', async ({ page }) => {
    test.setTimeout(120_000);
    const d = await openNewForm(page);
    await fillIf(d, '매물명', SEONGSU.name);
    await fillIf(d, '주소', SEONGSU.address);
    await fillIf(d, '도시', SEONGSU.city);
    await fillIf(d, '가격', SEONGSU.price);
    await fillIf(d, '침실', SEONGSU.bedrooms);
    await fillIf(d, '욕실', SEONGSU.bathrooms);
    await saveButton(d).click(); // 상태 미변경
    await expect(page.getByText(/만들었습니다|생성되었습니다|was created/).first()).toBeVisible({ timeout: 30_000 });
    await expect(d).toHaveCount(0);
    await expect(page).toHaveURL(/\/lightning\/r\/(Property__c\/)?[a-zA-Z0-9]{15,18}\/view/, { timeout: 30_000 });
    recordId = page.url().match(/\/r\/(?:Property__c\/)?([a-zA-Z0-9]{15,18})\//)?.[1];
    expect(recordId).toBeTruthy();
    // 레코드 상세: 상태 = 판매중(기본값), 가격 = ₩1,100,000,000
    await expect(page.getByText(SEONGSU.priceLabel).first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('판매중', { exact: true }).first()).toBeVisible();
    const rec = sfResult(`sf data query -q "SELECT Status__c, Price__c FROM Property__c WHERE Id = '${recordId}'"`).records[0];
    expect(rec.Status__c).toBe('Available');
    expect(rec.Price__c).toBe(1100000000);
  });

  // AC-009 / REQ-004 / WI-1.001 — 매물 탐색 검색
  test('AC-009 등록 — 매물 탐색 검색', { tag: '@explore' }, async ({ page }) => {
    test.skip(!recordId, 'AC-009 표준 화면 등록 실패');
    const list = await gotoExplorer(page);
    await keywordInput(page).fill('성수');
    await expect(list.getByTestId('property-card')).toHaveCount(1);
    await expect(cardByName(list, SEONGSU.name).getByTestId('property-card-price')).toHaveText(SEONGSU.priceLabel);
  });

  // AC-011 / REQ-004 / WI-1.001
  test('AC-011 수정 — 표준 화면 저장', async ({ page }) => {
    test.skip(!recordId, 'AC-009 표준 화면 등록 실패');
    test.setTimeout(120_000);
    await page.goto(`/lightning/r/Property__c/${recordId}/view`);
    await page.getByRole('button', { name: '편집', exact: true }).first().click();
    const d = dialog(page);
    await expect(field(d, '가격')).toBeVisible({ timeout: 30_000 });
    await setValue(field(d, '가격'), '1050000000');
    await setValue(field(d, '침실'), '3');
    await saveButton(d).click();
    // 저장 성공 = 모달 닫힘 + 서버 값 반영 (AC-011 Then 은 토스트를 요구하지 않음 — 토스트 문구는 버전별로 달라 판정에서 제외)
    await expect(d).toHaveCount(0, { timeout: 30_000 });
    const rec = sfResult(`sf data query -q "SELECT Price__c, Bedrooms__c FROM Property__c WHERE Id = '${recordId}'"`).records[0];
    expect(rec.Price__c).toBe(1050000000);
    expect(rec.Bedrooms__c).toBe(3);
  });

  // AC-011 / REQ-004 / WI-1.001 — 카드 반영
  test('AC-011 수정 — 카드 반영', { tag: '@explore' }, async ({ page }) => {
    test.skip(!recordId, 'AC-009 표준 화면 등록 실패');
    const list = await gotoExplorer(page);
    await keywordInput(page).fill('성수');
    const card = cardByName(list, SEONGSU.name);
    await expect(card).toHaveCount(1);
    await expect(card.getByTestId('property-card-price')).toHaveText('₩1,050,000,000');
    await expect(card.getByTestId('property-card-rooms')).toHaveText('침실 3 · 욕실 1');
  });

  // AC-012 / REQ-004 / WI-1.001
  test('AC-012 삭제 — 표준 화면', async ({ page }) => {
    test.skip(!recordId, 'AC-009 표준 화면 등록 실패');
    test.setTimeout(120_000);
    await page.goto(`/lightning/r/Property__c/${recordId}/view`);
    await expect(page.getByText(SEONGSU.name).first()).toBeVisible({ timeout: 30_000 });
    const del = page.getByRole('button', { name: '삭제', exact: true });
    if (!(await del.first().isVisible().catch(() => false))) {
      await page.getByRole('button', { name: /작업 더 보기|더 많은 작업 표시|Show more actions/ }).first().click();
      await page.getByRole('menuitem', { name: '삭제', exact: true }).click();
    } else {
      await del.first().click();
    }
    await dialog(page).getByRole('button', { name: '삭제', exact: true }).click();
    await expect(page.getByText(/삭제했습니다|삭제되었습니다|was deleted/).first()).toBeVisible({ timeout: 30_000 });
    expect(countByName(SEONGSU.name)).toBe(0);
  });

  // AC-012 / REQ-004 / WI-1.001 — 탐색 empty-state
  test('AC-012 삭제 — 탐색 empty-state', { tag: '@explore' }, async ({ page }) => {
    test.skip(!recordId, 'AC-009 표준 화면 등록 실패');
    const list = await gotoExplorer(page);
    await keywordInput(page).fill('성수');
    await expect(list.getByTestId('empty-state')).toBeVisible();
    await expect(list.getByTestId('result-count')).toHaveText('0건');
    await keywordInput(page).fill('');
    await expect(list.getByTestId('property-card')).toHaveCount(SAMPLE_COUNT);
    await expect(list.getByTestId('result-count')).toHaveText(`${SAMPLE_COUNT}건`);
  });
});

// =====================================================================================
test.describe.serial('admin — 입력 검증', () => {
  test.use({ storageState: storageStateFor('admin') });
  test.beforeAll(() => {
    assertSafeOrg();
    cleanupE2E();
  });
  test.afterEach(() => cleanupE2E()); // 저장 성공분(AC-060 12자리) 포함 정리
  test.afterAll(() => {
    expect(sampleDistribution()).toEqual({ Available: 6, 'Under Contract': 2, Sold: 2 });
  });
  test.beforeEach(() => annotate('admin'));

  // AC-010 / REQ-004 / WI-1.001
  test('AC-010 필수값 누락 시 저장 차단', async ({ page }) => {
    test.setTimeout(150_000);
    // (a) 매물명 빈 값 + 가격 500000000
    let d = await openNewForm(page);
    await field(d, '가격').fill('500000000');
    await saveButton(d).click();
    await expect(field(d, '매물명')).toHaveAttribute('aria-invalid', 'true', { timeout: 15_000 });
    await expect(d).toBeVisible();
    await d.getByRole('button', { name: '취소', exact: true }).click();
    // (b) 매물명 [E2E] 필수값 확인 + 가격 빈 값
    d = await openNewForm(page);
    await field(d, '매물명').fill('[E2E] 필수값 확인');
    await saveButton(d).click();
    await expect(field(d, '가격')).toHaveAttribute('aria-invalid', 'true', { timeout: 15_000 });
    await expect(d).toBeVisible();
    await d.getByRole('button', { name: '취소', exact: true }).click();
    expect(e2eIds('[E2E] 필수값%')).toHaveLength(0);
  });

  // AC-060 / REQ-004 / WI-1.001
  test('AC-060 가격 자릿수 한도 — 13자리 거부 / 12자리 저장', async ({ page }) => {
    test.setTimeout(150_000);
    const d = await openNewForm(page);
    await field(d, '매물명').fill('[E2E] 한도 초과');
    await field(d, '가격').fill('1000000000000'); // 13자리
    await saveButton(d).click();
    // 저장 실패: 가격 필드 아래 '... 너무 큽니다. 12자리 ...' + '다음 필드 검토: 가격' 팝오버(2026-10-29 관측)
    //   서버 오류에서는 표준 폼이 aria-invalid 를 false 로 둔다 → 오류 문구로 판정.
    //   오류 팝오버가 열리면 aria-modal 이 팝오버 쪽으로 옮겨가므로, 폼은 '새 매물' 이름의 dialog 로 다시 찾는다.
    await expect(page.getByText(/너무 큽니다|value outside|too large/).first(), '가격 필드 오류 표시').toBeVisible({ timeout: 15_000 });
    // 오류 팝오버가 열려 있는 동안 폼 모달은 접근성 트리에서 숨겨진다 → 제목 텍스트로 폼 유지 확인 후 팝오버 닫기
    await expect(page.getByText('새 매물', { exact: true }).first(), '폼 유지').toBeVisible();
    expect(countByName('[E2E] 한도 초과')).toBe(0);
    const popover = page.getByRole('dialog', { name: /예기치 않은 장애|unexpected/i });
    if (await popover.count()) await popover.getByRole('button').first().click();
    const form = page.getByRole('dialog', { name: '새 매물' });
    await expect(form).toBeVisible();
    // 12자리 최대값은 저장 성공 — 새 폼에서 입력
    await form.getByRole('button', { name: '취소', exact: true }).click();
    const d2 = await openNewForm(page);
    await setValue(field(d2, '매물명'), '[E2E] 한도 최대');
    await setValue(field(d2, '가격'), '999999999999');
    await saveButton(d2).click();
    await expect(page.getByText(/만들었습니다|생성되었습니다|was created/).first()).toBeVisible({ timeout: 30_000 });
    expect(countByName('[E2E] 한도 최대')).toBe(1);
    expect(countByName('[E2E] 한도 초과')).toBe(0);
  });

  // AC-060 / REQ-004 / WI-1.001 — 카드 표시
  test('AC-060 가격 자릿수 한도 — 카드 표시', { tag: '@explore' }, async ({ page }) => {
    // 독립 실행 가능하도록 12자리 레코드를 sf CLI 로 준비(afterEach 에서 삭제)
    sfResult(`sf data create record -s Property__c -v "Name='[E2E] 한도 최대' Price__c=999999999999"`);
    const list = await gotoExplorer(page);
    await keywordInput(page).fill('한도');
    const card = cardByName(list, '[E2E] 한도 최대');
    await expect(card).toHaveCount(1);
    await expect(card.getByTestId('property-card-price')).toHaveText('₩999,999,999,999');
  });

  // AC-061 / REQ-004 / WI-1.001 (잠정 — CK-05)
  test.fixme('AC-061 (잠정 — CK-05) 가격 0·음수 거부', async () => {
    // CK-05 해소 시: 가격 0 / -1 저장 → '가격은 0보다 커야 합니다.' 표시, 레코드 미생성
  });
});
