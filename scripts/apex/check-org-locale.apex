// WI-1.001 (D-16 / CK-15 / I-08) — 오그 통화·로캘 점검 (읽기 전용 — 오그를 변경하지 않음)
// 사용: sf apex run --file scripts/apex/check-org-locale.apex -o <alias>
System.debug('CURRENCY=' + UserInfo.getDefaultCurrency());
System.debug('MULTI=' + UserInfo.isMultiCurrencyOrganization());
System.debug('LOCALE=' + UserInfo.getLocale() + ' TZ=' + UserInfo.getTimeZone().getID());
