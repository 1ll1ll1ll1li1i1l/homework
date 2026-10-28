/**
 * [MOCKUP ONLY] 정적 샘플 데이터 — ACCEPTANCE-CRITERIA §1.4 SD-01 ~ SD-10 과 값 동일.
 * - Apex/SOQL/DB 없이 화면·레이아웃·흐름 검증용 (Cheatsheet STEP 7 / Lab 7, MOCKUP-PROJECT-PLAN).
 * - 필드명은 본 개발 Property__c API 이름을 그대로 사용 → 본 WI 에서 데이터 소스만 Apex(@wire)로 교체.
 * - Id 는 레코드 Id 대신 SD 코드를 사용 (목업 전용).
 * - 사진: "유효 URL" 은 CSP 영향이 없는 data:image/svg+xml 일러스트로 대체 (CK-10 확정 전 임시).
 *   SD-09 = 빈 값, SD-10 = 깨진 URL → 대체 이미지(propertyPlaceholder) 동작 확인용.
 * 본 개발(WI-1.003) 착수 시 이 모듈은 삭제 대상.
 */

const svgUri = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

/** 단독/저층 주택 일러스트 */
const house = (sky, wall, roof) =>
    svgUri(
        `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">` +
            `<rect width="640" height="400" fill="${sky}"/>` +
            `<rect y="310" width="640" height="90" fill="#8fbf7a"/>` +
            `<polygon points="160,200 320,90 480,200" fill="${roof}"/>` +
            `<rect x="195" y="200" width="250" height="130" fill="${wall}"/>` +
            `<rect x="296" y="250" width="48" height="80" fill="#6b4f3a"/>` +
            `<rect x="222" y="225" width="52" height="42" fill="#dbeafe"/>` +
            `<rect x="366" y="225" width="52" height="42" fill="#dbeafe"/>` +
            `</svg>`
    );

/** 아파트/오피스텔 일러스트 */
const tower = (sky, wall) => {
    let windows = '';
    for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 4; col++) {
            windows += `<rect x="${248 + col * 38}" y="${92 + row * 30}" width="22" height="16" fill="#dbeafe"/>`;
        }
    }
    return svgUri(
        `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">` +
            `<rect width="640" height="400" fill="${sky}"/>` +
            `<rect y="320" width="640" height="80" fill="#9aa5b1"/>` +
            `<rect x="230" y="70" width="180" height="250" fill="${wall}"/>` +
            `<rect x="120" y="170" width="90" height="150" fill="#cbd5e1"/>` +
            `<rect x="430" y="140" width="100" height="180" fill="#cbd5e1"/>` +
            windows +
            `</svg>`
    );
};

export const PROPERTIES = [
    {
        Id: 'SD-01',
        Name: '강남 래미안 아파트',
        Address__c: '서울특별시 강남구 테헤란로 101',
        City__c: '서울',
        Price__c: 2500000000,
        Bedrooms__c: 4,
        Bathrooms__c: 2,
        Status__c: 'Available',
        Picture_URL__c: tower('#bfdbfe', '#64748b')
    },
    {
        Id: 'SD-02',
        Name: '해운대 오션뷰',
        Address__c: '부산광역시 해운대구 해운대해변로 22',
        City__c: '부산',
        Price__c: 850000000,
        Bedrooms__c: 3,
        Bathrooms__c: 2,
        Status__c: 'Available',
        Picture_URL__c: tower('#7dd3fc', '#0e7490')
    },
    {
        Id: 'SD-03',
        Name: '판교 테크노 빌라',
        Address__c: '경기도 성남시 분당구 판교역로 33',
        City__c: '성남',
        Price__c: 1200000000,
        Bedrooms__c: 3,
        Bathrooms__c: 2,
        Status__c: 'Under Contract',
        Picture_URL__c: house('#e0f2fe', '#f5f5f4', '#475569')
    },
    {
        Id: 'SD-04',
        Name: '마포 한강 오피스텔',
        Address__c: '서울특별시 마포구 마포대로 44',
        City__c: '서울',
        Price__c: 450000000,
        Bedrooms__c: 1,
        Bathrooms__c: 1,
        Status__c: 'Available',
        Picture_URL__c: tower('#c7d2fe', '#4338ca')
    },
    {
        Id: 'SD-05',
        Name: '광교 호수 타운하우스',
        Address__c: '경기도 수원시 영통구 광교호수로 55',
        City__c: '수원',
        Price__c: 980000000,
        Bedrooms__c: 4,
        Bathrooms__c: 3,
        Status__c: 'Sold',
        Picture_URL__c: house('#bae6fd', '#fde68a', '#b45309')
    },
    {
        Id: 'SD-06',
        Name: '둔산 센트럴 아파트',
        Address__c: '대전광역시 서구 둔산로 66',
        City__c: '대전',
        Price__c: 520000000,
        Bedrooms__c: 3,
        Bathrooms__c: 1,
        Status__c: 'Available',
        Picture_URL__c: tower('#fde2e4', '#9f1239')
    },
    {
        Id: 'SD-07',
        Name: '제주 애월 전원주택',
        Address__c: '제주특별자치도 제주시 애월읍 애월해안로 77',
        City__c: '제주',
        Price__c: 1650000000,
        Bedrooms__c: 5,
        Bathrooms__c: 3,
        Status__c: 'Under Contract',
        Picture_URL__c: house('#a5f3fc', '#fafaf9', '#c2410c')
    },
    {
        Id: 'SD-08',
        Name: '송파 잠실 아파트',
        Address__c: '서울특별시 송파구 올림픽로 88',
        City__c: '서울',
        Price__c: 1980000000,
        Bedrooms__c: 3,
        Bathrooms__c: 2,
        Status__c: 'Sold',
        Picture_URL__c: tower('#e9d5ff', '#6d28d9')
    },
    {
        Id: 'SD-09',
        Name: '송도 센트럴 오피스텔',
        Address__c: '인천광역시 연수구 센트럴로 99',
        City__c: '인천',
        Price__c: 350000000,
        Bedrooms__c: 1,
        Bathrooms__c: 1,
        Status__c: 'Available',
        Picture_URL__c: '' // 빈 값 → 대체 이미지 (AC-022, AC-039)
    },
    {
        Id: 'SD-10',
        Name: '서면 스카이 빌라',
        Address__c: '부산광역시 부산진구 서면로 10',
        City__c: '부산',
        Price__c: 720000000,
        Bedrooms__c: 2,
        Bathrooms__c: 1,
        Status__c: 'Available',
        Picture_URL__c: 'https://invalid.example.invalid/none.jpg' // 깨진 URL → onerror → 대체 이미지 (AC-022)
    }
];

/** 화면 상태(수정 시연)에서 원본을 건드리지 않도록 복사본 반환 */
export function getMockProperties() {
    return PROPERTIES.map((p) => ({ ...p }));
}
