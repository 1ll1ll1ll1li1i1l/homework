// WI-1.002 — 매물 카드(propertyTile) E2E · REQ-006 (REQ-003 샘플 데이터 SD-01~SD-10 기준)
// AC-020 ~ AC-023 을 test() 1:1 로 변환. 모두 "매물 탐색" 탭(App Page, WI-1.005)이 필요하므로 전부 `@explore`
// (PHASE-PLAN-01 §3.3 · §3.4 — 최종 검증은 WI-1.005 전체 UI 회귀 `npx playwright test`).
// 1차 실행(탭 생성 전): npx playwright test tests/e2e/WI-1.002 --grep-invert "@explore"  → 0건이 정상.
// 조회 전용 spec — 데이터를 변경하지 않으므로 afterEach 복원 없음. 정렬은 검증하지 않는다(OQ-09).
import { test, expect, type Locator } from '@playwright/test';
import { cardByName, gotoExplorer, SAMPLE_COUNT, storageStateFor, usesRoleState } from './support/explorer';

// AC 문서 §1.3: Given `agent` 로그인 → tests/e2e/.auth/agent.json (없으면 기본 세션으로 대체 + annotation)
test.use({ storageState: storageStateFor('agent') });

// AC 문서 §1.4 기준 샘플 데이터 (필요한 행만)
const SD01 = { name: '강남 래미안 아파트', price: '₩2,500,000,000', status: 'Available', label: '판매중' };
const SD02 = {
  name: '해운대 오션뷰',
  address: '부산광역시 해운대구 해운대해변로 22',
  city: '부산',
  price: '₩850,000,000',
  rooms: '침실 3 · 욕실 2',
  label: '판매중',
};
const SD03 = { name: '판교 테크노 빌라', status: 'Under Contract', label: '계약중' };
const SD05 = { name: '광교 호수 타운하우스', status: 'Sold', label: '판매완료' };
const SD09 = { name: '송도 센트럴 오피스텔', price: '₩350,000,000' }; // Picture_URL__c 빈 값
const SD10 = { name: '서면 스카이 빌라' }; // Picture_URL__c 깨진 URL https://invalid.example.invalid/none.jpg

let list: Locator;

test.beforeEach(async ({ page }, testInfo) => {
  if (!usesRoleState('agent')) {
    testInfo.annotations.push({
      type: 'auth',
      description: 'tests/e2e/.auth/agent.json 없음 → 기본 세션(state.json)으로 실행. 역할 사용자 생성 후 재실행 필요',
    });
  }
  // Given: "매물 탐색" 탭, 조건 없음
  list = await gotoExplorer(page);
  // 결정성 가드: 기준 데이터 10건만 존재(§1.3) — 중복 적재(20건) 등 데이터 오염 시 즉시 실패
  await expect(list.getByTestId('property-card')).toHaveCount(SAMPLE_COUNT);
});

// AC-020 / REQ-006 / WI-1.002
test('AC-020 카드 요약 정보 표시', { tag: '@explore' }, async () => {
  // When: data-name="해운대 오션뷰" 인 property-card 를 찾는다
  const card = cardByName(list, SD02.name);
  await expect(card).toHaveCount(1);

  // Then
  await expect(card.getByTestId('property-card-name')).toHaveText(SD02.name);
  await expect(card.getByTestId('property-card-price')).toHaveText(SD02.price);
  await expect(card.getByTestId('property-card-address')).toContainText(SD02.address);
  await expect(card.getByTestId('property-card-address')).toContainText(SD02.city);
  await expect(card.getByTestId('property-card-rooms')).toHaveText(SD02.rooms);
  await expect(card.getByTestId('property-status-badge')).toHaveText(SD02.label);
  await expect(card.getByTestId('property-card-image')).toHaveAttribute('alt', SD02.name);
});

// AC-021 / REQ-006 / WI-1.002
test('AC-021 상태 배지 색상 매핑', { tag: '@explore' }, async () => {
  // When: SD-01, SD-03, SD-05 카드의 property-status-badge 확인
  // (배지 색상 클래스 검증은 §1.2 셀렉터 규칙의 예외로 허용 — 선택자가 아닌 단언에만 사용)
  const b01 = cardByName(list, SD01.name).getByTestId('property-status-badge');
  await expect(b01).toHaveText(SD01.label);
  await expect(b01).toHaveAttribute('data-status', SD01.status);
  await expect(b01).toHaveClass(/(^|\s)slds-theme_success(\s|$)/);

  const b03 = cardByName(list, SD03.name).getByTestId('property-status-badge');
  await expect(b03).toHaveText(SD03.label);
  await expect(b03).toHaveAttribute('data-status', SD03.status);
  await expect(b03).toHaveClass(/(^|\s)slds-theme_warning(\s|$)/);

  // negative: 판매완료 = 회색 기본 배지 → 초록·주황 클래스 없음
  const b05 = cardByName(list, SD05.name).getByTestId('property-status-badge');
  await expect(b05).toHaveText(SD05.label);
  await expect(b05).toHaveAttribute('data-status', SD05.status);
  await expect(b05).toHaveClass(/(^|\s)slds-badge(\s|$)/);
  await expect(b05).not.toHaveClass(/slds-theme_success|slds-theme_warning/);

  // Then: 화면 전체 배지 개수 판매중 6 / 계약중 2 / 판매완료 2 (텍스트 기준 — 색상 외 텍스트 전달)
  const badges = list.getByTestId('property-status-badge');
  await expect(badges).toHaveCount(SAMPLE_COUNT);
  await expect(badges.filter({ hasText: /^\s*판매중\s*$/ })).toHaveCount(6);
  await expect(badges.filter({ hasText: /^\s*계약중\s*$/ })).toHaveCount(2);
  await expect(badges.filter({ hasText: /^\s*판매완료\s*$/ })).toHaveCount(2);
});

// AC-022 / REQ-006 / WI-1.002
test('AC-022 사진 누락·오류 시 대체 이미지', { tag: '@explore' }, async () => {
  // When: SD-09(빈 값), SD-10(깨진 URL → onerror) 카드의 property-card-image 확인
  for (const sd of [SD09, SD10]) {
    const img = cardByName(list, sd.name).getByTestId('property-card-image');
    // Then: src 에 propertyPlaceholder 포함 (SD-10 은 onerror 후 교체되므로 auto-wait 단언)
    await expect(img, `${sd.name} src`).toHaveAttribute('src', /propertyPlaceholder/);
    // Then: naturalWidth > 0 (깨진 이미지 아이콘 아님)
    await expect
      .poll(() => img.evaluate((el: HTMLImageElement) => (el.complete ? el.naturalWidth : 0)), {
        message: `${sd.name} naturalWidth > 0`,
        timeout: 15_000,
      })
      .toBeGreaterThan(0);
    // Then: alt = 매물명
    await expect(img).toHaveAttribute('alt', sd.name);
  }

  // negative(대조군): 유효 URL 인 SD-02 는 대체 이미지를 쓰지 않음
  const img02 = cardByName(list, SD02.name).getByTestId('property-card-image');
  await expect(img02).toHaveAttribute('src', /.+/);
  await expect(img02).not.toHaveAttribute('src', /propertyPlaceholder/);
});

// AC-023 / REQ-006 / WI-1.002
test('AC-023 KRW 전체 금액 포맷(축약 없음)', { tag: '@explore' }, async () => {
  // When: SD-01, SD-09 카드 가격 확인 (반각 ₩ U+20A9 — I-06)
  await expect(cardByName(list, SD01.name).getByTestId('property-card-price')).toHaveText(SD01.price);
  await expect(cardByName(list, SD09.name).getByTestId('property-card-price')).toHaveText(SD09.price);

  // Then(negative): property-list 전체 텍스트에 억 / 만원 / $ / KRW 없음, 전각 ￦ 없음
  const text = await list.innerText();
  for (const banned of ['억', '만원', '$', 'KRW', '￦']) {
    expect(text, `property-list 에 "${banned}" 포함`).not.toContain(banned);
  }
});
