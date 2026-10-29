// 공용 E2E 헬퍼 — 검색·필터 패널(propertyFilter) 입력 (AC 문서 §1.6 testid + 접근성 역할만 사용, §1.2)
import type { Locator, Page } from '@playwright/test';

export const filterPanel = (page: Page): Locator => page.getByTestId('filter-panel');
/** lightning-input type=search → role searchbox (라벨 `키워드`) */
export const keywordInput = (page: Page): Locator => page.getByTestId('filter-keyword').getByRole('searchbox');
/** lightning-input type=number → role spinbutton (라벨 `최소 가격`) */
export const minPriceInput = (page: Page): Locator => page.getByTestId('filter-min-price').getByRole('spinbutton');
/** lightning-input type=number → role spinbutton (라벨 `최대 가격`) */
export const maxPriceInput = (page: Page): Locator => page.getByTestId('filter-max-price').getByRole('spinbutton');
/** lightning-combobox 트리거 → role combobox (라벨 `최소 침실 수`) */
export const bedroomsCombobox = (page: Page): Locator => page.getByTestId('filter-min-bedrooms').getByRole('combobox');
export const resetButton = (page: Page): Locator => page.getByTestId('filter-reset').getByRole('button', { name: '초기화' });

/** 침실 선택지(§1.5): 전체 / 1개 이상 ~ 5개 이상 */
export const BEDROOM_LABELS = ['전체', '1개 이상', '2개 이상', '3개 이상', '4개 이상', '5개 이상'] as const;

/** `filter-min-bedrooms` 에서 선택지 라벨로 선택 */
export async function selectBedrooms(page: Page, label: (typeof BEDROOM_LABELS)[number]): Promise<void> {
  await bedroomsCombobox(page).click();
  await page.getByTestId('filter-min-bedrooms').getByRole('option', { name: label, exact: true }).click();
}

/**
 * 가격(lightning-input type=number) 값 설정. 기존 값을 지우고 입력한다.
 * lightning-input 은 포커스 시 표시값(`500,000,000`)을 원값으로 바꾸면서 Playwright fill 의 전체 선택이 풀려
 * 기존 값 뒤에 이어 붙는 문제가 있어(2026-10-29 실행 관측), 사용자처럼 클릭 → 전체 선택 → 삭제 → 입력한다.
 * value 가 '' 이면 지우기만 한다.
 */
export async function setPrice(input: Locator, value: string): Promise<void> {
  await input.click();
  await input.press('ControlOrMeta+a');
  await input.press('Backspace');
  if (value) await input.fill(value);
}
