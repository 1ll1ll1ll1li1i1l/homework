// WI-1.002 (AC-008) — 샘플 데이터 SD-01~SD-10 초기화. Scratch Org(DH-DEV/DH-SIT/DH-UAT) 전용.
// PROD(DH-HUB) 실행 금지 — 아래 가드가 Scratch/Sandbox 가 아니면 예외로 중단한다.
// 사용: sf apex run --file scripts/apex/reset-sample-data.apex -o DH-SIT
//       → 이후 pwsh -File scripts/load-sample-data.ps1 -TargetOrg DH-SIT
Organization org = [SELECT IsSandbox, TrialExpirationDate FROM Organization LIMIT 1];
if (!org.IsSandbox && org.TrialExpirationDate == null) {
    throw new IllegalArgumentException('reset-sample-data: Scratch/Sandbox 오그에서만 실행할 수 있습니다 (PROD 금지).');
}
List<String> sdNames = new List<String>{
    '강남 래미안 아파트', '해운대 오션뷰', '판교 테크노 빌라', '마포 한강 오피스텔', '광교 호수 타운하우스',
    '둔산 센트럴 아파트', '제주 애월 전원주택', '송파 잠실 아파트', '송도 센트럴 오피스텔', '서면 스카이 빌라'
};
List<Property__c> rows = [SELECT Id FROM Property__c WHERE Name IN :sdNames WITH USER_MODE];
Database.delete(rows, AccessLevel.USER_MODE);
System.debug('reset-sample-data: deleted ' + rows.size());
