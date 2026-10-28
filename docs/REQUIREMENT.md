# REQUIREMENT — DreamHouse Lite 부동산 매물 관리 시스템

> 단일 기준 문서(Single Source of Truth). 이후 `docs/phase-0/FIT-GAP-NUD.md`, `docs/phase-0/ACCEPTANCE-CRITERIA.md`, `docs/PROJECT-PLAN.md`, `docs/phases/PHASE-PLAN-01.md`, `docs/work-items/WI-1.nnn-*.md` 는 모두 본 문서의 `REQ-nnn` 을 기준으로 도출·추적한다.

---

## 1. 문서 정보

| 항목 | 내용 |
|---|---|
| 문서명 | REQUIREMENT — DreamHouse Lite |
| 버전 | v1.0 |
| 작성일 | 2026-10-28 |
| 작성자 | 최정혁 (BA, requirements_analyst 에이전트 활용) |
| 상태 | Draft — Phase 0 고객 협의 후 v1.1 로 확정 예정 |
| 입력 자료 | RFP(`docs/inputs/RFP.md`) · Proposal(없음) · Feature Request(없음) · Customer Requirement(없음) |

### 1.1 변경 이력

| 버전 | 일자 | 작성자 | 유형 | 변경 내용 |
|---|---|---|---|---|
| v1.0 | 2026-10-28 | 최정혁 | 최초 작성 | RFP 기반 REQ-001~REQ-018, NFR-001~NFR-010 정의 |

### 1.2 문서 갱신 원칙

- **ID/코드네임 불변**: `REQ-nnn`, `NFR-nnn`, `AC-nnn`, `WI-p.nnn`, `MWI-p.nnn` 은 한 번 부여되면 **절대 변경·재번호하지 않는다.** 삭제된 번호도 재사용하지 않는다.
- 갱신은 재작성이 아니라 **DROP / ENHANCE / ADD** 방식으로만 한다.
  - **DROP**: `~~REQ-nnn 항목~~ (DROPPED YYYY-MM-DD: 사유)` — 행을 지우지 않고 취소선 + 사유
  - **ENHANCE**: ID 유지, 내용 수정 후 `(ENHANCED YYYY-MM-DD: 변경 요지)` 이력 1줄 추가
  - **ADD**: 다음 일련번호 부여 + `(ADDED YYYY-MM-DD)` 표기
- 모든 변경은 1.1 변경 이력 표에 1행 추가하고, 연결된 AC/WI/테스트(spec) 문서를 함께 갱신한다(추적성 유지).

---

## 2. 프로젝트 개요·배경·목적

### 2.1 배경 (RFP §1)
○○ 부동산 중개사무소는 매물을 엑셀로 관리하고 있어 **검색·공유·최신화가 비효율적**이다. 방문 고객에게 조건(가격대·방 수·지역)에 맞는 매물을 빠르게 보여주기 어렵고, 사진과 핵심 정보를 한눈에 보여줄 수단이 없다.

### 2.2 목적
- 매물 정보를 Salesforce 커스텀 오브젝트로 일원화하여 단일 데이터 원천 확보
- 상담원이 조건 기반으로 **실시간 검색·필터**하여 카드형 목록과 상세 화면으로 매물을 즉시 제시
- 관리자가 매물을 등록·수정·삭제·상태 변경하면 화면에 즉시 반영
- 차세대 DevOps Center 파이프라인(DEV → SIT → UAT → PROD)과 AI 코딩(Claude)을 활용한 **프로토타입 우선·반복형** 개발 프로세스 실습

### 2.3 솔루션 개요
- 앱명: **DreamHouse Lite** (Lightning Experience, LWC 기반)
- 구성: `Property__c` 커스텀 오브젝트 + Apex 조회 컨트롤러 + LWC(타일·목록·필터·상세) + Lightning App Page + 권한 세트
- 1차(MVP, Phase 1): RFP F1~F5, S1~S3 / 2차(선택): 지도, 유사 매물, 중개인, 관심 매물, 차트, 대시보드(S4)

---

## 3. 이해관계자 & 팀 구성

### 3.1 이해관계자

| 구분 | 이해관계자 | 관심사 / 역할 |
|---|---|---|
| 고객(Sponsor) | ○○ 부동산 중개사무소 (대표/관리자) | 요구사항 확정, Phase 0 인수기준 합의, UAT 승인 |
| 최종 사용자 | 상담원(중개사) | 매물 검색·필터·조회 (읽기 중심) |
| 최종 사용자 | 사무소 관리자 | 매물 등록·수정·삭제·상태 변경 |
| 수행팀 | 최정혁 (1인) | 분석·설계·개발·테스트·릴리스 전 과정 |

### 3.2 팀 구성 (1인 겸임)

| 역할 | 이름 | 주요 책임 | 스킬 | 가용성 |
|---|---|---|---|---|
| PM | 최정혁 | 일정·범위·리스크, PROJECT-PLAN/PHASE-PLAN, 고객 커뮤니케이션 | 프로젝트 관리, DevOps Center | 2일 × 100% (겸임 배분) |
| PL / RM | 최정혁 | 브랜치·Work Item·Promotion, 릴리스 관리 | Git/GitHub, DevOps Center, sf CLI | 상동 |
| BA | 최정혁 | REQUIREMENT, AC, FIT/GAP/NUD | 요구사항 분석, Salesforce 표준 기능 | 상동 |
| Senior Developer | 최정혁 (+ AI 코딩: Claude) | Apex·데이터 모델·아키텍처, 코드 리뷰 | Apex, SOQL, 보안(CRUD/FLS) | 상동 |
| Junior Developer | (해당 없음 — AI 코딩 에이전트로 대체) | LWC 프로토타이핑 초안 | LWC, SLDS | AI 에이전트 상시 |
| QA | 최정혁 (+ test_engineer 에이전트) | Apex 단위 테스트, Playwright E2E, 품질 게이트 | Apex Test, Playwright, Code Analyzer | 상동 |

> 1인 겸임으로 **역할 간 상호 검토(4-eyes)가 불가**하므로, `code_reviewer` 에이전트 리뷰 + 자동화 품질 게이트로 보완한다(§10 리스크 R-02).

---

## 4. 프로젝트 기간 & 주요 마일스톤

- 기간: **2026-10-29(목) ~ 2026-10-30(금), 2일 / 1 스프린트 (Phase 1)**
- 사전 준비(환경 구성)는 2026-10-28 이전 완료 가정 (DH-HUB, DH-DEV/SIT/UAT, DevOps Center 프로젝트·파이프라인)

| ID | 마일스톤 | 목표 일시 | 산출물 / 완료 기준 |
|---|---|---|---|
| M0 | 요구사항 기준선 | 2026-10-28 | 본 문서 v1.0 |
| M1 | Phase 0 완료 (고객 협의) | 2026-10-29 오전 | FIT-GAP-NUD.md, ACCEPTANCE-CRITERIA.md (AC-nnn), 고객 합의 |
| M2 | 계획 확정 | 2026-10-29 오전 | PROJECT-PLAN.md, PHASE-PLAN-01.md, WI-1.nnn 문서 + DevOps Center Work Item 등록 |
| M3 | 데이터 모델·핵심 목록 구현 | 2026-10-29 종료 | REQ-001~REQ-007 DEV 반영, Apex 테스트 통과 |
| M4 | MVP 기능 완성 (DEV) | 2026-10-30 오전 | REQ-008~REQ-012 DEV 반영, 목업/고객 리뷰 반영 |
| M5 | SIT → UAT Promotion | 2026-10-30 오후 | Pre-Promotion 테스트 통과, Playwright E2E 통과 |
| M6 | PROD(Hub) 릴리스 | 2026-10-30 종료 | PROD Promotion, Release Notes |

---

## 5. 범위 정의

### 5.1 In-Scope (Phase 1 MVP)
- `Property__c` 데이터 모델 및 시연용 샘플 데이터(약 10건)
- 권한 모델: 상담원(조회) / 관리자(등록·수정·삭제·상태 변경)
- 매물 등록·수정·삭제 폼 (S3) — 표준 레코드 페이지 활용 우선
- 매물 탐색 화면 (S1): 검색·필터 패널 + 카드 그리드 + 결과 건수/빈 결과 안내
- 매물 카드(F2) 및 상태 색상 배지
- 매물 상세 화면 (S2): 대표 사진 + 전체 속성
- 상태 변경의 즉시 반영 (F5)
- 공통 UX: 반응형, 로딩 스피너, 에러 토스트, SLDS
- Apex 단위 테스트, Playwright E2E, DevOps Center 파이프라인 Promotion

### 5.2 Out-of-Scope
- 외부 부동산 API 연동, 사진 파일 업로드(사진은 URL 입력) — RFP §7
- 2차/선택 기능 (Phase 1 에서는 Could/Won't): 위치 지도, 유사 매물 추천, 중개인별 담당 매물, 관심 매물, 가격대 분포 차트, 홈/대시보드(S4)
- 기존 엑셀 데이터 마이그레이션 (확인 필요 — OQ-06)
- 다국어, Experience Cloud(외부 고객 포털), 모바일 앱 전용 기능(Salesforce 모바일 앱 반응형 표시는 In-Scope)
- CI(GitHub Actions) 필수 도입 — 선택·안정화 후

---

## 6. 기능 요구사항

> MoSCoW: **Must**(Phase 1 필수) / **Should**(가능하면 Phase 1) / **Could**(여유 시, Stretch) / **Won't**(Phase 1 제외, 2차 후보)
> 출처 컬럼은 RFP 항목 코드(F/S)를 표기한다.

| REQ-ID | 제목 | 상세 설명 | 출처 | MoSCoW |
|---|---|---|---|---|
| REQ-001 | 매물 데이터 모델 | `Property__c` 커스텀 오브젝트 생성. 필드: Name(매물명), Address__c(주소), City__c(도시), State__c(시/도, OQ-01), Price__c(통화), Bedrooms__c(숫자), Bathrooms__c(숫자), Picture_URL__c(URL), Status__c(선택목록: Available=판매중 / Under Contract=계약중 / Sold=판매완료) | F1, §5 | Must |
| REQ-002 | 역할별 권한 모델 | 권한 세트 2종: 상담원 = `Property__c` 읽기 + 필드 읽기, 관리자 = 생성/읽기/수정/삭제 + 모든 필드 편집. Apex 클래스·LWC 탭/앱 접근 권한 포함 | §2, §6 보안 | Must |
| REQ-003 | 시연용 샘플 데이터 | 다양한 도시·가격대·침실 수·상태를 포함하는 매물 약 10건을 재현 가능한 방식(데이터 플랜/스크립트)으로 각 오그에 적재 | §5 | Must |
| REQ-004 | 매물 등록·수정·삭제 | 관리자가 매물을 등록·수정·삭제할 수 있는 폼(S3). 필수값 검증(매물명·가격·상태 등, OQ-03). 표준 레코드 페이지/페이지 레이아웃 활용 우선(FIT 후보) | F1, S3 | Must |
| REQ-005 | 매물 조회 Apex 서비스 | LWC 가 호출하는 `@AuraEnabled(cacheable=true)` 조회 메서드. 키워드(매물명/도시)·최소/최대 가격·최소 침실 수 조건 지원, `with sharing` + `WITH USER_MODE`, 바인드 변수로 SOQL 인젝션 방지, 결과 정렬·건수 제한 | F2, F3, §6 | Must |
| REQ-006 | 매물 카드(타일) | 카드에 대표 사진·가격(통화 포맷)·주소/도시·침실/욕실 수 요약, 상태 색상 배지 표시. 사진 URL 누락/오류 시 대체 이미지 | F2 | Must |
| REQ-007 | 매물 목록(카드 그리드) | 조회 결과를 반응형 카드 그리드로 표시. 결과 건수 표시, 결과 0건 시 빈 결과 안내 문구. 카드 선택 시 상세 이동/표시 이벤트 발생 | F2, S1 | Must |
| REQ-008 | 검색·필터 패널 | 좌측 패널: 키워드(매물명/도시), 가격 범위(최소~최대), 최소 침실 수. 입력 시 실시간(디바운스) 필터링하여 목록 갱신. 필터 초기화 | F3, S1 | Must |
| REQ-009 | 매물 상세 화면 | 큰 대표 사진 + 전체 속성(F1 전 항목) 표시. 목록에서 선택한 매물 기준. 관리자에게는 편집 진입점 제공 | F4, S2 | Must |
| REQ-010 | 매물 탐색 앱/화면 구성 | Lightning 앱(DreamHouse Lite) + Lightning App Page 에 좌측 필터 + 우측 그리드(+ 상세) 레이아웃 배치, 탭/내비게이션 구성 | S1, S2 | Must |
| REQ-011 | 상태 관리 및 즉시 반영 | 관리자가 상태(Available/Under Contract/Sold)를 변경하면 목록·카드·배지·상세에 새로고침 없이(또는 최소 조작으로) 즉시 반영(LDS/refreshApex 등) | F5 | Must |
| REQ-012 | 공통 UX | 데스크톱/모바일 반응형, 데이터 로딩 스피너, 오류 시 에러 토스트, SLDS 준수, 접근성 라벨 및 Playwright 용 `data-testid` | S 공통 | Must |
| REQ-013 | 상세 위치 지도 | 상세 화면에 주소 기반 지도(`lightning-map`) 표시 | F4 (가능하면), S2 선택 | Could |
| REQ-014 | 유사 매물 추천 | 상세 화면에 동일 도시·유사 가격대/침실 수 매물 N건 추천 | F4 (가능하면), S2 선택 | Could |
| REQ-015 | 중개인별 담당 매물 | 매물에 담당 중개인 지정 및 중개인별 매물 조회 | F6 (2차) | Won't |
| REQ-016 | 관심 매물 | 사용자가 매물을 관심 매물로 저장·조회 | F6 (2차) | Won't |
| REQ-017 | 가격대 분포 차트 | 가격대별 매물 분포 차트 | F6 (2차) | Won't |
| REQ-018 | 홈/대시보드 | 신규 매물, 상태별 건수 요약 홈 화면(S4) | S4 (선택) | Won't |

> Won't 는 "Phase 1 에서는 하지 않음"을 의미하며, 2차 Phase 후보로 유지한다. Could 는 MVP(Must) 완료·품질 게이트 통과 후 여유 시간에만 착수한다.

---

## 7. 기능 선후관계(종속관계)

| REQ-ID | 설명 | 선행(Depends-on) | 비고 |
|---|---|---|---|
| REQ-001 | 매물 데이터 모델 | — | 루트. 모든 기능의 기반 |
| REQ-002 | 역할별 권한 모델 | REQ-001 | 오브젝트/필드가 있어야 권한 부여 가능 (Apex/앱 권한은 해당 REQ 완료 시 ENHANCE) |
| REQ-003 | 시연용 샘플 데이터 | REQ-001 | 필드 정의 확정 후 데이터 작성 |
| REQ-004 | 매물 등록·수정·삭제 | REQ-001, REQ-002 | 관리자 권한 필요 |
| REQ-005 | 매물 조회 Apex 서비스 | REQ-001 | 테스트 데이터는 테스트 클래스 내 생성(REQ-003 비의존) |
| REQ-006 | 매물 카드(타일) | REQ-001 | 표시용 데이터는 REQ-003 이 있으면 목업 확인 용이(소프트 의존) |
| REQ-007 | 매물 목록(카드 그리드) | REQ-005, REQ-006 | 조회 서비스 + 카드 컴포넌트 결합 |
| REQ-008 | 검색·필터 패널 | REQ-007 | 필터 조건 → 목록 갱신 (서버 조건은 REQ-005 에 포함) |
| REQ-009 | 매물 상세 화면 | REQ-007 | 목록에서 선택 이벤트 수신 |
| REQ-010 | 매물 탐색 앱/화면 구성 | REQ-008, REQ-009 | 구성 요소 조립 단계 |
| REQ-011 | 상태 관리 및 즉시 반영 | REQ-004, REQ-007 | 상태 변경(편집) + 목록 갱신 메커니즘 필요. 상세 반영은 REQ-009 완료 후 검증 |
| REQ-012 | 공통 UX | REQ-006 | 횡단 관심사. 첫 UI 컴포넌트부터 적용, 이후 UI REQ 마다 준수 확인 |
| REQ-013 | 상세 위치 지도 | REQ-009 | Could |
| REQ-014 | 유사 매물 추천 | REQ-005, REQ-009 | Could |
| REQ-015 | 중개인별 담당 매물 | REQ-001, REQ-002 | Won't — 데이터 모델 확장(관계 필드) 필요 |
| REQ-016 | 관심 매물 | REQ-001, REQ-009 | Won't — 별도 오브젝트 필요 |
| REQ-017 | 가격대 분포 차트 | REQ-003, REQ-005 | Won't |
| REQ-018 | 홈/대시보드 | REQ-001, REQ-003 | Won't |

### 7.1 순환 종속 검증 및 실행 순서

- 모든 의존 간선이 **번호가 작은 REQ → 큰 REQ** 방향(선행 ID < 후행 ID)으로만 존재함을 확인 → 방향성 비순환 그래프(DAG), **순환 종속 없음**.
- 위상정렬 기반 실행 계층(같은 계층 내 병렬 가능):

| 계층 | REQ | 근거 |
|---|---|---|
| L0 | REQ-001 | 선행 없음 |
| L1 | REQ-002, REQ-003, REQ-005, REQ-006 | REQ-001 만 의존 |
| L2 | REQ-004, REQ-007, REQ-012 | L0~L1 의존 |
| L3 | REQ-008, REQ-009, REQ-011 | REQ-007 (및 REQ-004) 의존 |
| L4 | REQ-010 | REQ-008, REQ-009 조립 |
| Stretch | REQ-013, REQ-014 (Could) → REQ-015~018 (Won't) | MVP(L0~L4) 완료 후 |

- 크리티컬 패스: **REQ-001 → REQ-005/REQ-006 → REQ-007 → REQ-008/REQ-009 → REQ-010** (Day 1 에 REQ-007 까지 완료해야 Day 2 Promotion 일정 확보).

---

## 8. 비기능 요구사항

| NFR-ID | 분류 | 요구사항 | 검증 방법 |
|---|---|---|---|
| NFR-001 | 성능 | 샘플 데이터(약 10건) 기준 목록·검색 응답 **1초 이내** | Playwright 응답 대기 시간 측정, 수동 확인 |
| NFR-002 | 성능 | 검색 입력 디바운스(약 300ms), `cacheable=true` 조회, 결과 건수 상한(LIMIT) 적용 | 코드 리뷰 |
| NFR-003 | 보안 | Apex `with sharing`, SOQL `WITH USER_MODE`(CRUD/FLS), 바인드 변수 사용(인젝션 방지) | 코드 리뷰, Code Analyzer |
| NFR-004 | 보안 | 상담원 = 조회만, 관리자 = 등록·수정·삭제. 권한 세트로 최소 권한 부여 | 권한 세트별 사용자 Playwright/수동 테스트 |
| NFR-005 | 보안 | 비밀정보(accessToken, sfdx-url, `tests/e2e/.auth/`) 커밋 금지 | `.gitignore`, 리뷰 |
| NFR-006 | 품질 | Apex 단위 테스트 커버리지 **75% 이상**(목표 85%) | `sf apex run test -l RunLocalTests -c -r human` |
| NFR-007 | 품질 | 정적 분석 **High 이상 0건** | `sf code-analyzer run --workspace . --view table` |
| NFR-008 | 사용성 | 데스크톱/모바일 반응형, SLDS, 접근성 라벨 | Playwright(뷰포트 2종), 수동 확인 |
| NFR-009 | 확장성·유지보수성 | 조회 조건을 파라미터 객체로 확장 가능하게 설계(2차 기능 REQ-013~018 수용), LWC 는 컴포넌트 단위 분리(타일/목록/필터/상세), Lightning Message Service 등 느슨한 결합 | 아키텍처 리뷰 |
| NFR-010 | 규정/컴플라이언스·운영 | 개인정보 미보관(매물 정보만 저장, 고객 개인정보 비대상 — OQ-08), 모든 변경은 DevOps Center Work Item·Git 이력으로 추적, 오그 직접 변경 금지(필요 시 retrieve 후 커밋) | DevOps Center 이력 |

---

## 9. 데이터 모델 개요 & 외부 통합 개요

### 9.1 주요 객체 — `Property__c` (Phase 1)

| 필드 | API 명 | 타입 | 필수 | 비고 |
|---|---|---|---|---|
| 매물명 | Name | Text(80) | Y | 표준 Name 필드 |
| 주소 | Address__c | Text(255) | (OQ-03) | |
| 도시 | City__c | Text(100) | (OQ-03) | 키워드 검색 대상 |
| 시/도 | State__c | Text(100) | N | RFP 미명시, 교재 기대값 — OQ-01 |
| 가격 | Price__c | Currency(12,0) | Y | 통화 단위 OQ-02 |
| 침실 수 | Bedrooms__c | Number(2,0) | (OQ-03) | 최소 침실 수 필터 |
| 욕실 수 | Bathrooms__c | Number(2,0) | (OQ-03) | |
| 대표 사진 | Picture_URL__c | URL | N | 외부 URL, 업로드 없음 |
| 상태 | Status__c | Picklist | Y | Available(기본값) / Under Contract / Sold |

### 9.2 관계
- Phase 1: `Property__c` 단독 오브젝트(관계 없음), OwnerId 표준 소유자.
- 2차 후보(참고, 확정 아님): REQ-015 중개인(Broker__c 또는 User Lookup) ↔ Property__c (Lookup), REQ-016 관심 매물(Property__c ↔ User 접합 오브젝트).

### 9.3 컴포넌트/통합 개요
- 내부 통합: LWC ↔ Apex(`@AuraEnabled`) ↔ SOQL, LWC 간 통신(LMS 또는 이벤트), LDS(`lightning-record-form` 등)
- 외부 통합(API): **Phase 1 범위 외** (외부 부동산 API 연동 없음). 사진은 외부 URL 참조만 함(CSP Trusted Sites 설정 필요 여부 — OQ-05). 지도(REQ-013)는 표준 `lightning-map` 사용 시 별도 API 키 불요.

---

## 10. 가정·제약·리스크

### 10.1 가정 (Assumptions)
- A-01 DH-HUB(Dev Hub·DevOps Center·PROD), DH-DEV/SIT/UAT Scratch Org 및 DevOps Center 파이프라인은 착수 전 준비 완료되어 있다.
- A-02 Lightning Experience 사용, 사용자 라이선스는 Developer Edition 범위 내 시연용 사용자로 충분하다.
- A-03 고객(○○ 부동산) 의견은 Phase 0 협의 및 목업 리뷰 1회로 확정 가능하다(실습에서는 1인이 고객 역할 대행).
- A-04 Status 선택목록의 API 값은 영문(Available/Under Contract/Sold), 화면 라벨은 한글 매핑(판매중/계약중/판매완료) 가능.
- A-05 AI 코딩(Claude)으로 초안 생성 후 사람이 리뷰·보강하는 사이클을 WI 당 1~2회 수행한다.

### 10.2 제약 (Constraints)
- C-01 기간 2일(1 스프린트), 인력 1인 겸임.
- C-02 Scratch Org 유효기간·일일 생성 한도(Developer Edition Dev Hub 제한).
- C-03 외부 API 연동·파일 업로드 불가(범위 외).
- C-04 Apex 커버리지 75%↑, Code Analyzer High 0건 미충족 시 Promotion 불가.
- C-05 DevOps Center 를 통한 Promotion 경로(DEV → SIT → UAT → PROD) 준수, 오그 직접 수정 지양.

### 10.3 리스크 (초기 식별)

| ID | 리스크 | 영향 | 가능성 | 대응 |
|---|---|---|---|---|
| R-01 | 2일 일정 내 Must 12건 + 파이프라인 Promotion 완료 지연 | 높음 | 중 | 크리티컬 패스 우선, FIT 항목(REQ-004/011) 표준 기능 활용, Could/Won't 엄격 차단 |
| R-02 | 1인 겸임으로 리뷰 부재 → 품질/보안 결함 | 중 | 중 | code_reviewer 에이전트 + Code Analyzer + 테스트 게이트 |
| R-03 | AI 생성 코드의 보안 규칙 누락(USER_MODE, with sharing) 또는 과설계 | 중 | 중 | CLAUDE.md 코드 규칙 명시, 리뷰 체크리스트, 정적 분석 |
| R-04 | DevOps Center/Scratch Org 환경 이슈(인증 만료, 동기화 충돌) | 높음 | 중 | 사전 점검, 환경 재생성 스크립트, 오그 직접 변경 금지 |
| R-05 | Playwright 인증/셀렉터 불안정(Lightning Shadow DOM)으로 E2E 실패 | 중 | 중 | `data-testid`, 저장된 인증 상태, 재시도 정책 |
| R-06 | 요구사항 모호(통화·필수값·배지 색상 등)로 재작업 | 중 | 중 | Phase 0 에서 Open Questions 해소 후 AC 확정 |
| R-07 | 외부 사진 URL 표시 차단(CSP) | 낮음 | 중 | CSP Trusted Sites 또는 대체 이미지 처리 |

---

## 11. AI 코딩 적용 전략

### 11.1 원칙
- **프로토타입 우선 → 리뷰 → 보강 반복**: 각 WI 는 (1) AI 초안 생성 → (2) DH-DEV 배포·목업 확인 → (3) 사람 리뷰/고객 리뷰 → (4) AI 보강 순으로 진행.
- 모든 작업은 `.claude/agents/` 전문 에이전트로 위임(CLAUDE.md 최우선 규칙).
- 산출 문서 갱신은 DROP/ENHANCE/ADD 로 점진 반영.

### 11.2 적용 영역

| 영역 | AI 적용 수준 | 담당 에이전트 | 사람 검증 포인트 |
|---|---|---|---|
| 요구사항·AC·계획 문서 | 적극(초안 전량 AI) | requirements_analyst, solution_architect, project_manager, work_item_manager | REQ/AC 누락·모호성, 선후관계 일관성 |
| 데이터 모델 메타데이터(오브젝트·필드·권한 세트) | 적극 | backend_developer | 필드 타입/필수값, 권한 최소화 |
| Apex 컨트롤러 + 테스트 클래스 | 적극 | backend_developer, test_engineer | with sharing·USER_MODE·바인드 변수, 커버리지 |
| LWC(타일·목록·필터·상세) 및 목업 | 적극(프로토타이핑 핵심) | frontend_developer | SLDS·반응형·접근성·`data-testid`, 고객 리뷰 |
| 샘플 데이터 | 적극 | backend_developer | 다양성(필터 검증 가능한 분포) |
| Playwright E2E (AC → spec) | 적극 | test_engineer | AC 1:1 대응, 불안정 테스트 제거 |
| 코드 리뷰 | 보조 | code_reviewer | 최종 판단은 사람 |
| Promotion·릴리스 승인 | **사람 전담** | — | DevOps Center 에서 수동 승인 |

### 11.3 사람이 검증할 품질 기준 (Definition of Done 연계)
- Apex 커버리지 ≥ 75%(목표 85%), 양성·음성·권한(System.runAs) 케이스 포함
- `sf code-analyzer` High 이상 0건
- 대응 AC-nnn 의 Playwright E2E 통과
- `sf project deploy start --dry-run` 성공 후 배포
- code_reviewer 리뷰 지적사항(High) 해소
- 선행 WI 완료 확인, 문서 체크리스트 `[X]` 갱신, `WI-p.nnn-description` 이름으로 커밋

---

## 12. 테스트 전략 개요

> 상세 인수기준은 Phase 0 `docs/phase-0/ACCEPTANCE-CRITERIA.md`(AC-nnn), 품질 게이트 상세는 Cheatsheet STEP 10 에서 확정한다. 본 절은 방향성만 정의한다.

| 레벨 | 도구 | 대상 | 기준 |
|---|---|---|---|
| 단위 테스트 (서버) | Apex Test (`@isTest`) | REQ-005 조회 서비스(조건 조합·빈 결과·권한) | 커버리지 ≥ 75%, `RunLocalTests` 통과 |
| 단위 테스트 (클라이언트, 선택) | Jest (`sfdx-lwc-jest`) | LWC 로직(필터 이벤트, 포맷) | 선택 — 시간 여유 시 |
| 정적 분석 | Salesforce Code Analyzer | Apex·LWC 전체 | High 이상 0건 |
| UI 기능 자동화 (E2E) | Playwright | REQ-006~REQ-012 UI 동작, 권한별 시나리오(REQ-002/004) | AC-nnn 1:1 spec(`tests/e2e/WI-1.nnn-*.spec.ts`) 통과 |
| 수용 테스트 | 수동 + Playwright | UAT 오그에서 고객 시나리오 | 고객(역할 대행) 승인 |
| CI | GitHub Actions(`ci.yml`) | 위 자동화 묶음 | **선택 — 파이프라인 안정화 후 도입** |

### 12.1 DevOps Center Tests 탭
- Test Provider: **Apex Unit Tests / Flow Tests / Code Analyzer** 3종 구성.
- Suite 배정: **DH-DEV = Review 단계**(Work Item 리뷰 시 실행), **DH-SIT · DH-UAT = Pre-Promotion 단계**(Promotion 전 실행, 실패 시 Promotion 차단).
- Flow Tests 는 Phase 1 에 Flow 가 없으면 N/A 로 두되 Provider 는 구성해 둔다(2차 대비).

### 12.2 품질 게이트 방향성
- Gate 1 (WI 완료): 단위 테스트 + Code Analyzer + 대응 Playwright spec 통과
- Gate 2 (SIT Promotion): Pre-Promotion 테스트(Apex/Code Analyzer) 통과 + SIT Playwright 회귀
- Gate 3 (UAT → PROD): UAT 승인 + 전체 E2E 통과 + Release Notes

---

## 13. Phase 후보 & 상위 Work Item 후보(개략)

> PROJECT-PLAN 도출용 힌트이며 확정이 아니다. WI 번호·구성은 project_manager 가 PROJECT-PLAN 에서 확정하고, 확정 후에는 변경하지 않는다.

### 13.1 Phase 후보

| Phase | 명칭 | 기간(안) | 범위 |
|---|---|---|---|
| ⓪ Phase 0 | 본 개발 전 고객 협의 | 2026-10-29 오전 | **FIT/GAP/NUD 분석**(solution_architect → `docs/phase-0/FIT-GAP-NUD.md`) + **상세 인수기준 AC-nnn 작성**(requirements_analyst → `docs/phase-0/ACCEPTANCE-CRITERIA.md`) + Open Questions 해소 + 목업 리뷰 방식 합의 |
| Phase 1 | MVP | 2026-10-29 ~ 10-30 | REQ-001~REQ-012 (Must), 여유 시 REQ-013/014 (Could) |
| Phase 2 (후보) | 확장 | 미정 | REQ-015~REQ-018 (Won't → 재평가), REQ-013/014 미착수분 |

### 13.2 FIT/GAP/NUD 예비 판단 (Phase 0 에서 확정)

| REQ | 예비 분류 | 근거 |
|---|---|---|
| REQ-001, REQ-002 | FIT | 커스텀 오브젝트·권한 세트(선언형) |
| REQ-004 | FIT | 표준 레코드 페이지/페이지 레이아웃/표준 New·Edit·Delete |
| REQ-011 | FIT(부분) + GAP | 상태 변경은 표준 편집, 목록 즉시 반영은 LWC 갱신 로직 필요 |
| REQ-003 | FIT | sf data import(tree/plan) |
| REQ-005~REQ-010, REQ-012 | GAP | 커스텀 LWC·Apex 개발 |
| REQ-013 | FIT(부분) | 표준 `lightning-map` |
| REQ-014~REQ-018 | GAP/NUD | 2차 — NUD(불필요) 여부 고객 확인 |

### 13.3 상위 Work Item 후보 (REQ → WI 매핑 초안)

| WI 후보 | 제목(안) | 매핑 REQ | 선행 WI | 예비 분류 |
|---|---|---|---|---|
| WI-1.001 | Property__c 오브젝트·필드 + 권한 세트 + 표준 레코드 페이지(등록·수정·삭제) | REQ-001, REQ-002, REQ-004 | — | FIT |
| WI-1.002 | 샘플 데이터 + Property Tile LWC (상태 배지, 공통 UX 기반) | REQ-003, REQ-006, REQ-012 | WI-1.001 | GAP |
| WI-1.003 | Property List LWC + Apex 조회 컨트롤러(+테스트), 상태 변경 즉시 반영 | REQ-005, REQ-007, REQ-011, REQ-012 | WI-1.002 | GAP |
| WI-1.004 | 가격/침실/키워드 검색 필터 패널 + Apex 조건 확장 | REQ-008, REQ-012 | WI-1.003 | GAP |
| WI-1.005 | 매물 상세 + DreamHouse Lite 앱·Lightning App Page 조립 | REQ-009, REQ-010, REQ-011(상세 반영 검증), REQ-012 | WI-1.003, WI-1.004 | GAP |
| (Stretch) WI-1.006 | 상세 위치 지도 | REQ-013 | WI-1.005 | FIT(부분) |
| (Stretch) WI-1.007 | 유사 매물 추천 | REQ-014 | WI-1.005 | GAP |

- WI 선행관계는 §7 REQ 선후관계를 위배하지 않는다(WI-1.001 → 1.002 → 1.003 → 1.004 → 1.005, DAG).
- REQ-012(공통 UX)는 횡단 요구사항으로 모든 UI WI 의 완료 기준에 포함한다.
- REQ-015~REQ-018 은 Phase 1 WI 를 생성하지 않는다.

---

## 14. Open Questions (확인 필요)

| OQ-ID | 질문 | 관련 REQ | 확인 대상 / 시점 |
|---|---|---|---|
| OQ-01 | 주소 체계: RFP 는 주소·도시만 명시. 시/도(State__c), 우편번호 필드가 필요한가? 주소를 단일 텍스트로 둘지, Address 복합 필드로 할지? | REQ-001, REQ-013 | 고객 / Phase 0 |
| OQ-02 | 가격 통화 단위(KRW/USD)와 표시 형식(원, 만원, 억 단위 표기)은? 다중 통화 필요 여부? | REQ-001, REQ-006, REQ-008 | 고객 / Phase 0 |
| OQ-03 | 필수 입력 항목과 유효성 규칙(가격 > 0, 침실/욕실 수 범위, 소수점 욕실 허용 여부)은? | REQ-001, REQ-004 | 고객 / Phase 0 |
| OQ-04 | 상태 배지 색상 매핑(예: 판매중=녹색, 계약중=주황, 판매완료=회색) 및 판매완료 매물을 검색 결과에 기본 노출할지? | REQ-006, REQ-008, REQ-011 | 고객 / Phase 0 |
| OQ-05 | 대표 사진 URL 의 출처 도메인(CSP Trusted Sites 등록 필요 여부), 사진 누락 시 대체 이미지 정책은? | REQ-006, REQ-009 | 고객 / Phase 0 |
| OQ-06 | 기존 엑셀 매물 데이터의 이관이 필요한가? (현재는 샘플 10건만 가정, 범위 외로 분류) | REQ-003 | 고객 / Phase 0 |
| OQ-07 | 관리자의 "삭제" 권한 범위 — 물리 삭제 허용인지, 상태 변경(판매완료)으로 대체하는지? 상담원이 상태 변경 가능한가? | REQ-002, REQ-004, REQ-011 | 고객 / Phase 0 |
| OQ-08 | 매물 외 고객 개인정보(문의자 등) 저장 계획이 있는가? (현재 비대상 가정 — 컴플라이언스 요건 영향) | NFR-010 | 고객 / Phase 0 |
| OQ-09 | 검색 정렬 기준(가격순/최신순 등)과 결과 최대 건수, 페이지네이션 필요 여부는? | REQ-005, REQ-007 | 고객 / Phase 0 |
| OQ-10 | 상세 화면 표시 방식: 탐색 화면 내 패널(분할 화면)인지, 표준 레코드 페이지로 이동인지? | REQ-009, REQ-010 | 고객 / 목업 리뷰 |
| OQ-11 | "즉시 반영"의 기대 수준: 같은 사용자 화면 내 반영이면 충분한지, 다른 사용자 화면까지 실시간(Platform Event/CDC) 반영이 필요한지? | REQ-011 | 고객 / Phase 0 |
| OQ-12 | 모바일 사용 범위: Salesforce 모바일 앱에서도 사용하는가, 데스크톱 브라우저 반응형만으로 충분한가? | REQ-012, NFR-008 | 고객 / Phase 0 |
| OQ-13 | Could 항목(REQ-013 지도, REQ-014 유사 매물)의 Phase 1 착수 우선순위 및 유사 매물 판정 기준은? | REQ-013, REQ-014 | 고객 / Phase 0 |
| OQ-14 | Proposal·Feature Request·Customer Requirement 문서가 추가로 존재하는가? (현재 RFP 만으로 작성) | 전체 | 고객 / 즉시 |
