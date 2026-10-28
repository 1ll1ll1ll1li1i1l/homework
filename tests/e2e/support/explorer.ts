// 공용 E2E 헬퍼 — "매물 탐색" 탭(App Page `Property_Explorer`) 진입·카드 선택자
// 규칙: data-testid(ACCEPTANCE-CRITERIA §1.6) / getByRole / getByLabel 만 사용 (§1.2)
import { existsSync } from 'node:fs';
import { expect, type Locator, type Page } from '@playwright/test';

/** "매물 탐색" Lightning App Page 탭 URL (tabs/Property_Explorer.tab-meta.xml) */
export const EXPLORER_PATH = '/lightning/n/Property_Explorer';

/** 기준 샘플 데이터 건수 (AC 문서 §1.4 SD-01~SD-10) */
export const SAMPLE_COUNT = 10;

/**
 * 역할별 storageState 경로 (AC 문서 §1.3).
 * - `tests/e2e/.auth/<role>.json` 이 있으면 그 파일을 사용한다.
 * - 아직 역할 사용자(agent/admin)가 없으면 기본 세션(`E2E_STORAGE_STATE` 또는 state.json, 시스템 관리자)으로 대체한다.
 *   조회 전용 AC(카드 표시 등)는 결과가 같지만, 권한 AC 는 반드시 역할 세션으로 실행해야 한다.
 *   역할 사용자 생성(프로필 `Minimum Access - Salesforce` + 권한 세트)은 별도 작업으로 이월 — README 참고.
 */
export function storageStateFor(role: 'agent' | 'admin'): string {
  const rolePath = `tests/e2e/.auth/${role}.json`;
  if (existsSync(rolePath)) return rolePath;
  return process.env.E2E_STORAGE_STATE ?? 'tests/e2e/.auth/state.json';
}

/** 역할 세션 파일이 실제로 쓰였는지 (리포트 annotation 용) */
export function usesRoleState(role: 'agent' | 'admin'): boolean {
  return existsSync(`tests/e2e/.auth/${role}.json`);
}

/** "매물 탐색" 탭에 진입하고 목록(property-list)·카드가 렌더링될 때까지 기다린다. 조건 없음 상태. */
export async function gotoExplorer(page: Page): Promise<Locator> {
  await page.goto(EXPLORER_PATH);
  const list = page.getByTestId('property-list');
  await expect(list).toBeVisible({ timeout: 45_000 });
  await expect(list.getByTestId('property-card').first()).toBeVisible({ timeout: 30_000 });
  return list;
}

/** `data-name` 으로 매물 카드 1장 찾기 (§1.6: property-card 에 data-id·data-name) */
export function cardByName(scope: Page | Locator, name: string): Locator {
  return scope.locator(`[data-testid="property-card"][data-name="${name}"]`);
}
