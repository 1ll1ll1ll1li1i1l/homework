// 공용 E2E 헬퍼 — Aura(ApexAction) 네트워크 모의 (AC-046 지연 · AC-047 오류 · 빈 결과 모의)
// Lightning 은 여러 action 을 POST /aura?...ApexAction.execute 한 요청으로 묶어(boxcar) 보낸다.
// 요청 본문(message=JSON)에서 PropertyController.getProperties action id 를 찾아 그 action 응답만 바꾼다.
import type { Page, Request, Route } from '@playwright/test';

/** Aura Apex 요청 URL 패턴 */
export const AURA_APEX_URL = /\/aura\?.*ApexAction\.execute/;

type AuraAction = { id: string; params?: { classname?: string; method?: string } };

/** 요청 본문에서 `classname.method` Apex action 의 id 목록 */
export function apexActionIds(request: Request, classname: string, method: string): string[] {
  const body = request.postData();
  if (!body) return [];
  const message = new URLSearchParams(body).get('message');
  if (!message) return [];
  try {
    const actions = (JSON.parse(message).actions ?? []) as AuraAction[];
    return actions.filter((a) => a.params?.classname === classname && a.params?.method === method).map((a) => a.id);
  } catch {
    return [];
  }
}

/** getProperties action 이 들어 있는 요청인지 */
export function isGetProperties(request: Request): boolean {
  return apexActionIds(request, 'PropertyController', 'getProperties').length > 0;
}

type ActionPatch = (action: Record<string, unknown>) => void;

/** 실제 서버 응답을 받아 getProperties action 만 patch 해서 돌려준다 (그 외 action 은 그대로) */
async function fulfillPatched(route: Route, patch: ActionPatch): Promise<void> {
  const ids = new Set(apexActionIds(route.request(), 'PropertyController', 'getProperties'));
  const response = await route.fetch();
  const text = await response.text();
  let json: { actions?: Record<string, unknown>[] };
  try {
    json = JSON.parse(text);
  } catch {
    await route.fulfill({ response, body: text }); // JSON 이 아니면 손대지 않음
    return;
  }
  for (const action of json.actions ?? []) {
    if (ids.has(String(action.id))) patch(action);
  }
  await route.fulfill({ response, body: JSON.stringify(json) });
}

/** getProperties 응답을 delayMs 만큼 늦춘다 (AC-046). 반환값: 지연시킨 요청 수 카운터 */
export async function delayGetProperties(page: Page, delayMs: number): Promise<{ count: number }> {
  const counter = { count: 0 };
  await page.route(AURA_APEX_URL, async (route) => {
    if (!isGetProperties(route.request())) return route.fallback();
    counter.count += 1;
    const response = await route.fetch();
    await new Promise((r) => setTimeout(r, delayMs));
    await route.fulfill({ response });
  });
  return counter;
}

/** getProperties 응답을 state ERROR 로 바꾼다 (AC-047) */
export async function failGetProperties(page: Page, message = 'E2E 모의 오류'): Promise<{ count: number }> {
  const counter = { count: 0 };
  await page.route(AURA_APEX_URL, async (route) => {
    if (!isGetProperties(route.request())) return route.fallback();
    counter.count += 1;
    await fulfillPatched(route, (action) => {
      action.state = 'ERROR';
      action.returnValue = null;
      action.error = [{ message, exceptionType: 'System.AuraHandledException', isUserDefinedException: true }];
    });
  });
  return counter;
}

/** getProperties 응답을 빈 배열(0건)로 바꾼다 (AC-025 보조 negative) */
export async function emptyGetProperties(page: Page): Promise<{ count: number }> {
  const counter = { count: 0 };
  await page.route(AURA_APEX_URL, async (route) => {
    if (!isGetProperties(route.request())) return route.fallback();
    counter.count += 1;
    await fulfillPatched(route, (action) => {
      action.state = 'SUCCESS';
      // returnValue 는 Apex 반환값(List) 또는 { returnValue: List } 래퍼 형태 — 두 경우 모두 대응
      const rv = action.returnValue as unknown;
      if (rv && typeof rv === 'object' && !Array.isArray(rv) && 'returnValue' in (rv as object)) {
        (rv as { returnValue: unknown }).returnValue = [];
      } else {
        action.returnValue = [];
      }
    });
  });
  return counter;
}
