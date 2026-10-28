# 실습 교재 — Next Generation DevOps Center 핸즈온 (1인 실습)

> 원본: 실습 교재 Next Generation DevOps Center 핸즈온.docx (Markdown 변환본)

- **대상**: 혼자서 전 과정을 익히려는 PM/PL · 개발자 · QA (1인 개인 실습)
- **형태**: 1인 실습, 따라하기(Step-by-Step). 스크린샷 없이 글로 상세 설명. 한 사람이 PM · BA · Developer · QA · RM 역할을 순서대로 모두 수행합니다.
- **샘플 프로젝트**: trailheadapps/dreamhouse-lwc 와 유사한 "DreamHouse Lite" (부동산 매물 관리 LWC 앱)
- **도구**:
  - Next Generation DevOps Center (네이티브)
  - Claude (AI 코딩) — 모든 작업은 [Cheatsheet_for_ProjectManager.md](Cheatsheet_for_ProjectManager.md) / `.claude/agents/` 전문 에이전트로 진행 (프롬프트는 Cheatsheet_for_DX_Developer.md)
  - Salesforce CLI · VS Code · GitHub · Playwright (E2E 테스트)
- **파이프라인**: Developer Edition(Hub) + Dev Hub → Scratch Org 로 DEV / SIT / UAT 구성 → Hub(DE) = PROD (릴리스)
  (Developer Edition Dev Hub 는 활성 Scratch Org 최대 3개 → DEV·SIT·UAT 3개로 구성, PROD 는 Hub(DE) 조직)

---

## 0. 교육 개요

### 0.1 학습 목표

이 실습을 마치면 혼자서 다음 전 과정을 직접 수행할 수 있습니다.

1. Developer Edition 가입 → Dev Hub 활성화 → 프로젝트 저장소(GitHub) clone → Scratch Org 로 개발/테스트 환경 구성 (작업 전 항상 git pull 최신화)
2. Next Generation DevOps Center 활성화 · 권한 설정 · 소스 컨트롤 연결
3. 파이프라인 구성 (DEV → SIT → UAT → PROD) 및 프로젝트 생성
4. 산출물 작성 — REQUIREMENT → Phase 0 (FIT/GAP/NUD · Acceptance Criteria) → PROJECT-PLAN · PHASE-PLAN · WORKITEM (선후관계 포함)
5. 목업(프로토타입) UI 로 (가상) 고객 협의 → 결정사항을 문서에 반영 (본 · 목업 코드 공유)
6. Work Item 을 DevOps Center 에 등록 → 개발(Develop) → Commit (DX Inspector)
7. Playwright E2E 테스트 작성 · 실행 (테스터 수행) — 인수기준 AC-nnn → `*.spec.ts`
8. Code Review/승인 → Promote → Deploy to SIT → Release to PROD
9. 산출물 정리 · 패키징 (문서 · 코드 · 테스트 · 추적성 매트릭스)

> 💡 **1인 실습 안내**: 협업(코드 리뷰 · 승인)도 혼자 1인 2역으로 수행합니다. "고객", "리뷰어(RM)"는 본인이 역할을 바꿔 수행하거나 가상으로 진행합니다.

### 0.2 필수 규칙 — 전문 에이전트 사용

문서 · 개발 · 테스트의 모든 작업은 `.claude/agents/` 에 정의된 분야별 서브에이전트로 진행합니다 (직접 처리 금지).

본 실습은 **`.claude/agents/`** 폴더의 9개 Salesforce 전문 에이전트를 사용합니다. (이 폴더는 Lab 1.6 에서 `claude_salesforce.zip` 을 풀면 프로젝트 최상위에 함께 설치됩니다)

| 에이전트 | 역할 | 본 실습에서 담당하는 작업 (Lab) |
|---|---|---|
| requirements_analyst | 요구사항 분석 · User Story · Acceptance Criteria | REQUIREMENT, 인수기준(AC), 목업 결정의 본 산출물 반영 (Lab 5·7) |
| solution_architect | 시스템/컴포넌트 설계 · 데이터 모델 · 기술 결정 | FIT/GAP/NUD 분석 (Lab 5) |
| project_manager | 프로젝트 계획 · 스프린트 · 일정/리소스 | PROJECT-PLAN, PHASE-PLAN (Lab 6) |
| work_item_manager | User Story→Task 분해 · 티켓 · 백로그 | WORKITEM 문서 (Lab 6) |
| frontend_developer | LWC/Aura/UI · 클라이언트 로직 | 목업 UI, LWC 화면 개발 (Lab 7·9) |
| backend_developer | Apex · Trigger · Batch · SOQL · 서버 로직 | 오브젝트/Apex 개발 (Lab 9) |
| test_engineer | Apex/Jest 테스트 · 커버리지 · 시나리오 | AC→Playwright E2E spec, 단위 테스트 (Lab 10) |
| code_reviewer | 코드 품질 · 보안 · 성능 · 표준 리뷰 | Code Review (셀프) (Lab 11) |
| documentation_writer | API/설계/사용자 문서 · Release Notes | 산출물 정리 (DELIVERABLES) · 추적성 (Lab 13) |

> 💡 **사용법**: Claude Code 의 최근 버전에서는 지시하는 프롬프트에 적합한 에이전트를 Claude 가 선택하여 작업을 진행합니다. CLAUDE.md 에 작업별 에이전트를 미리 구성하여 진행하거나, 진행하는 작업에 명시적인 에이전트를 지정하려면 각 프롬프트 맨 앞에 `이 작업은 .claude/agents/ 의 <에이전트명> 에이전트로 진행해줘.` 를 붙입니다. 적합한 에이전트가 없으면 직접 처리하지 말고 에이전트를 추가합니다. (프롬프트 본문: [Cheatsheet_for_ProjectManager.md](Cheatsheet_for_ProjectManager.md))

### 0.3 준비물 / 선수 조건

- 이메일 1개 (Developer Edition 가입용), GitHub 계정 1개, Claude 계정 1개
- 개발 도구 설치 완료 → 환경 설정 문서 참고 ([Setup_Developer_Environment.md](Setup_Developer_Environment.md) 또는 install-Windows11.md)
  - JDK 21 · Node 22 · VS Code + Salesforce Extension Pack · Salesforce CLI (`sf`) · Git · Claude Code
- 인터넷 연결, 최신 브라우저

> 💡 **명령어 표기**: 본 교재의 CLI 명령은 Windows PowerShell (PowerShell 7 권장, 5.1 호환) 기준입니다. 터미널은 VS Code 통합 터미널(PowerShell) 또는 Windows Terminal 을 사용하세요. (macOS/Linux 는 셸 문법만 치환해 동일하게 사용)

### 0.4 예상 일정 (2일 과정 예시)

| 시간 | 내용 | Lab |
|---|---|---|
| Day 1 오전 | 환경/오그/Dev Hub, DevOps Center 설정, Scratch Org, 파이프라인 | Lab 1~4 |
| Day 1 오후 | 산출물 작성 (REQUIREMENT · Phase 0 · 계획), 목업 프로토타이핑 | Lab 5~7 |
| Day 2 오전 | Work Item 등록 · 개발 · Commit, Playwright E2E (테스터) | Lab 8~10 |
| Day 2 오후 | Review · Promote · SIT · PROD, 산출물 정리 | Lab 11~13 |

### 0.5 샘플 프로젝트 — "DreamHouse Lite"

- 참조 코드: https://github.com/trailheadapps/dreamhouse-lwc
- 부동산 중개사가 매물(Property)을 등록 · 검색 · 조회하는 간단한 Lightning Web Component 앱.
- 데이터: `Property__c` (매물) — 이름, 주소, 도시, 가격, 침실수, 욕실수, 사진 URL, 상태
- 기능 (Phase 1): 매물 목록 · 타일 카드, 가격/침실 필터 검색, 매물 상세, App Page 구성
- (Stretch, Phase 2 선택) 지도/차트 — 시간이 남으면

> ⚠ **학습용 환경 주의**: 본 실습은 Scratch Org (최대 30일 후 만료)를 사용합니다. 실제 프로젝트에서는 Sandbox 를 사용하세요. Scratch Org 는 학습 후 삭제합니다.

### 0.6 조직 운영 방식 (중요)

- 본인의 Developer Edition 조직 = **Hub (메인) 조직**. 여기에 Dev Hub + DevOps Center 를 활성화합니다.
- **PROD (릴리스) 환경 = 이 Hub(DE) 조직**으로 사용합니다.
- **DEV / SIT / UAT = Scratch Org** (Hub 에서 생성). Developer Edition Dev Hub 는 활성 Scratch Org 최대 3개라 DEV·SIT·UAT 3개로 정확히 구성됩니다 (PROD 는 Scratch 가 아닌 Hub 조직).
- SIT = 통합 테스트 (모듈 간 동작), UAT = 수용 테스트 (고객/사용자 관점 검증).

---

## Lab 1. 환경 & 오그 준비 (Dev Hub)

혼자 수행. 본인의 조직 1개를 Hub/메인으로 사용합니다.

### Step 1.1 — Developer Edition 가입

1. 브라우저에서 https://developer.salesforce.com/signup 접속
2. 양식 입력 — 이름 / 이메일 / 회사(임의) / Username (예: `me@dreamhouse.lab` 형식의 전역 유일 값)
3. 가입 확인 이메일에서 비밀번호 설정 → 로그인
4. 이 조직을 **"DreamHouse Hub"** 로 기억 (= 메인/PROD 역할)

> 💡 Username 은 이메일 형식이지만 실제 이메일과 달라도 됩니다 (전역 유일이기만 하면 됨).

### Step 1.2 — 도구 설치 확인 (터미널)

```powershell
sf --version        # @salesforce/cli/2.x
node --version      # v22.x
git --version
claude --version
code --version
```

하나라도 없으면 환경 설정 문서를 참고해서 설치.

### Step 1.3 — Dev Hub 활성화 (Hub 조직)

1. Hub 조직 로그인 → **Setup**
2. Quick Find 에 "Dev Hub" 입력 → **Dev Hub** 클릭
3. **Enable Dev Hub** 토글을 On
4. (있으면) **Enable Source Tracking in Developer and Developer Pro Sandboxes** 토글을 ON — Scratch Org 는 기본적으로 Source Tracking 이 켜져 있습니다.

### Step 1.4 — CLI 에서 Dev Hub 인증

작업용 상위 폴더(예: `~/projects`)에서 Hub 에 인증합니다. (프로젝트 폴더는 Step 1.6 에서 저장소를 clone 해 만듭니다)

```powershell
# 작업 상위 폴더 (예시)
cd ~/projects

sf org login web --set-default-dev-hub --alias DH-HUB
# 브라우저가 열리면 Hub 조직 관리자 계정으로 로그인 → Allow

# DH-HUB 가 (D) 로 표시되는지 확인
sf org list
```

### Step 1.5 — 프로젝트 저장소 (GitHub) 생성

> 💡 **★ 핵심 원칙 — "항상 저장소가 기준 (Source of Truth)"**: 차세대 DevOps Center 개발은 GitHub 저장소를 단일 기준으로 합니다. 문서(산출물) · 목업 · 본 개발이 모두 이 하나의 저장소에서 이뤄지고, DevOps Center (Lab 2)도 바로 이 저장소를 연결합니다. 작업을 시작할 때는 항상 먼저 최신화합니다 — 처음엔 Work Item 의 feature branch 를 `git clone`, 그 다음부터는 `git fetch` / **`git pull` (또는 checkout)** 한 뒤 개발/문서 작업을 진행하세요. (로컬에서 먼저 만들고 나중에 올리는 방식 ✗)

1. GitHub 에서 새 저장소 생성 — 예: `dreamhouse-lite` (Private 권장). 본 실습의 문서 · 목업 · 코드 공용 저장소입니다. "Add a README" 체크해 초기 커밋이 있는 상태로 만들면 바로 clone 가능.

### Step 1.6 — 저장소 Clone + DX 프로젝트 초기화 + 설정팩 적용 & 첫 푸시

저장소를 clone 한 뒤, 그 폴더 안에서 DX 프로젝트를 초기화하고, **별도 제공되는 `claude_salesforce.zip`** 을 풀어 설정을 얹은 다음 push 합니다. (이후 모든 Lab 은 이 폴더 안에서 진행)

**`claude_salesforce.zip` 내용물 (프로젝트 최상위에 위치):**

- `config/` — Scratch Org 정의 등 (생성된 기본 config 를 덮어씀)
- `.claude/` — 전문 에이전트 9종 (`.claude/agents/`) + 설정
- `CLAUDE.md` — AI 진행 규칙 (에이전트 사용 · 코드네임 · DROP/ENHANCE/ADD · 추적성 등)
- `.forceignore` — 배포 제외 규칙 (생성된 기본 파일을 덮어씀)

```powershell
git clone https://github.com/<owner>/dreamhouse-lite.git
cd dreamhouse-lite

# DX 스캐폴드 생성 (force-app/ sfdx-project.json config/)
sf project generate --name temp-dx

# 숨김파일(.forceignore) 포함 저장소 루트로 이동
Get-ChildItem temp-dx -Force | Move-Item -Destination .
Remove-Item temp-dx -Recurse -Force

# 별도 제공된 claude_salesforce.zip 을 프로젝트 최상위에 압축 해제
# (config/ .claude/ CLAUDE.md .forceignore)
Expand-Archive -Path <claude_salesforce.zip 경로> -DestinationPath . -Force

# force-app/ sfdx-project.json config/ .claude/ CLAUDE.md .forceignore README.md ...
Get-ChildItem -Force

git add .
git commit -m "chore: init Salesforce DX project + claude_salesforce 설정팩"
git branch -M main

# 저장소(main)에 프로젝트 베이스 반영
git push -u origin main
```

> 💡 `sf project generate` 는 하위 폴더를 만들기 때문에 clone 한 저장소 루트로 내용물을 옮긴 뒤, 그 위에 **`claude_salesforce.zip` 을 풀어** `config/` · `.forceignore` 를 제공 버전으로 덮어쓰고 `.claude/` (에이전트 9종) · `CLAUDE.md` (기본 진행 규칙)를 설치합니다. (설치된 기본 CLAUDE.md 는 Lab 5.1 에서 `/init` 으로 현재 프로젝트에 맞게 갱신합니다)

> ✅ **Lab 1 완료 기준**: Hub 가입 · Dev Hub On · CLI 인증 (DH-HUB) · 저장소 clone + DX 프로젝트 + claude_salesforce.zip 적용 → main 푸시 (이후 작업은 항상 git pull 후 진행).

---

## Lab 2. Next Generation DevOps Center 설정

본인이 Hub 관리자로서 활성화 · 권한 · 소스 컨트롤 연결을 수행합니다.

### Step 2.1 — DevOps Center 활성화 (Hub 조직)

1. Hub 조직 **Setup** → Quick Find "DevOps Center" (경로: Platform Tools → Development → DevOps Center)
2. **DevOps Center** 토글을 On (= 차세대/네이티브 활성화. 패키지 설치 없음)
3. **DX Tools 이용 약관**을 검토하고 **Accept**
   - 이 약관은 DevOps Center · DX Inspector · Agentforce Vibes IDE 등 DX 도구에 공통 적용.
4. App Launcher (⬢⬢⬢) → "DevOps Center" 검색 → 앱이 보이면 성공

> ⚠ DevOps Center 는 Production 또는 Developer Edition 조직에서만 활성화됩니다 (여기서는 Hub=DE). Scratch Org/Sandbox 에서는 활성화하지 않습니다.

> 💡 DevOps Center 앱 안에는 "Setup" 메뉴가 없습니다. 활성화는 Salesforce 표준 Setup 에서 합니다.

### Step 2.2 — 권한 세트 할당 (본인 계정)

Setup → **Permission Sets** 에서 본인 계정에 모두 부여 (1인이 전 역할 수행):

| 권한 세트 | 용도 |
|---|---|
| DevOps Center User | 기본 사용 (Work Item · 파이프라인 작업) |
| DevOps Center Admin | 프로젝트 · 환경 · 사용자 설정 |
| DevOps Center Deployment Manager | 프로모트 (배포) |
| DevOps Center Testing Manager | DevOps Testing (테스트 자산 · 품질 게이트) 관리 |

절차: 권한 세트 선택 → **Manage Assignments** → **Add Assignments** → 본인 체크 → **Assign** → **Done**

> ⚠ **Access DevOps Center Named Credentials 는 이 시점에 목록에 없습니다.** 이 권한 세트는 소스 컨트롤 (GitHub) 연결 후 자동 생성 · 표시되므로 Step 2.4 (연결 후)에서 할당합니다.

### Step 2.3 — 소스 컨트롤 (GitHub) 연결

Lab 1 에서 만든 **`dreamhouse-lite` 저장소** (프로젝트 베이스가 이미 push 됨)를 그대로 연결합니다. (새 저장소를 다시 만들지 않습니다)

1. DevOps Center 앱 Home → **"Connect to Version Control"** 클릭
2. **GitHub** 선택 → 브라우저에서 GitHub 로그인 → **Authorize Salesforce** → 조직 접근 승인
   - 이 인증은 조직당 1회면 됩니다.
3. (Lab 4 에서) 파이프라인 생성 시 이 저장소를 소스로 지정 → DevOps Center 가 main 등 브랜치를 인식.

### Step 2.4 — Access DevOps Center Named Credentials 권한 세트 할당 (소스 컨트롤 연결 후)

GitHub 연결 시 DevOps Center 가 환경/소스 인증용 Named Credentials 를 만들고, 그에 접근하는 **Access DevOps Center Named Credentials** 권한 세트가 그제서야 Permission Sets 목록에 나타납니다. (Step 2.2 에서는 보이지 않음)

1. Setup → Permission Sets → **Access DevOps Center Named Credentials** 선택
   - 목록에 없으면 Step 2.3 의 GitHub 연결이 완료됐는지 확인하고 새로고침.
2. **Manage Assignments** → **Add Assignments** → 사용자 체크 → **Assign** → **Done**

> ⚠ 이 권한 세트가 없으면 이후 환경 연결/프로모트 시 인증 (Named Credentials) 오류가 날 수 있으니 반드시 할당합니다.

> 💡 소스 컨트롤을 연결하는 사용자는 자동으로 이 권한 세트에 할당이 됩니다.

> ✅ **Lab 2 완료 기준**: DevOps Center Enabled · 권한 세트 (User/Admin/Deployment Manager/Testing Manager) 할당 · Lab 1 의 저장소 GitHub 연결 · Access DevOps Center Named Credentials 할당 (연결 후) 완료.

---

## Lab 3. Scratch Org 구성 (DEV / SIT / UAT)

Hub 에서 Scratch Org 를 생성하고 비밀번호를 만들어 환경 연결에 사용.

> 💡 Developer Edition Dev Hub 는 동시에 활성 Scratch Org 최대 3개 (일일 생성 6개)입니다. DEV·SIT·UAT 3개를 만듭니다 (PROD 는 Hub(DE) 조직).

### Step 3.1 — Scratch Org 정의 파일 확인/수정

`config/project-scratch-def.json` 을 아래처럼 둡니다.

```json
{
  "orgName": "DreamHouse Lite",
  "edition": "Developer",
  "language": "en_US",
  "features": [
    "EnableSetPasswordInApi"
  ],
  "settings": {
    "lightningExperienceSettings": {
      "enableS1DesktopEnabled": true
    },
    "mobileSettings": {
      "enableS1EncryptedStoragePref2": false
    }
  }
}
```

### Step 3.2 — Scratch Org 3개 생성

```powershell
# DEV (기본 조직으로 지정)
sf org create scratch -f config/project-scratch-def.json -a DH-DEV -y 30 --set-default

# SIT (통합 테스트)
sf org create scratch -f config/project-scratch-def.json -a DH-SIT -y 30

# UAT (수용 테스트)
sf org create scratch -f config/project-scratch-def.json -a DH-UAT -y 30

sf org list   # DH-DEV / DH-SIT / DH-UAT 확인 (활성 3개 → 한도 도달)
```

> ⚠ **플래그 주의**: `sf org create scratch` 에서 기간은 `--duration-days` (short `-y`)입니다. 따라서 **`--duration-days 30`** 또는 **`-y 30`** 으로 써야 합니다.

> 💡 **Dev Hub 지정**: Lab 1.4 에서 `--set-default-dev-hub` 로 기본 Dev Hub(DH-HUB)를 지정했으면 `--target-dev-hub` 생략 가능. 기본이 없으면 각 명령에 **`--target-dev-hub DH-HUB`** (또는 본인 Hub 별칭)를 추가하세요.

> ⚠ 활성 Scratch Org 3개로 한도에 도달합니다 (추가 생성 불가). 목업 (Lab 7)은 별도 오그 없이 DH-DEV 를 겸용합니다. 안 쓰는 오그는 `sf org delete scratch -o <별칭>` 으로 정리하세요.

### Step 3.3 — 각 Scratch Org 비밀번호 생성 (환경 연결용)

```powershell
sf org generate password -o DH-DEV
sf org generate password -o DH-SIT
sf org generate password -o DH-UAT
# 출력된 Username / Password / Instance URL 를 메모 (환경 연결 시 사용)

# (선택) 브라우저로 열어 확인
sf org open -o DH-DEV
```

> 💡 PROD 환경은 별도 생성하지 않고 Hub(DE) 조직을 사용합니다 (Lab 4 Production 단계).

> ✅ **Lab 3 완료 기준**: DH-DEV/SIT/UAT 3개 Scratch Org + 각 비밀번호 확보.

---

## Lab 4. 파이프라인 구성 & 프로젝트 생성

DevOps Center Admin 으로 수행. 차세대 순서: **파이프라인 먼저 → 프로젝트 연결**.

### Step 4.1 — 파이프라인 생성 + 기존 저장소 연결

> ⚠ 여기서 저장소를 새로 만들지 않습니다. Lab 1.6 에서 생성 · clone · push 해 둔 기존 `dreamhouse-lite` 저장소 (이미 force-app · docs · config 등이 들어있음)를 연결합니다.

DevOps Center 앱 → **DevOps Pipelines** 탭 → **New** → New Pipeline 모달이 열립니다. 모달 항목을 위에서부터 채웁니다.

1. **Pipeline Name** — `DreamHouse Pipeline` 입력.
   (안내문: "All DevOps Center pipelines must use the Salesforce DX project structure, and connect to a unique version control system repository." — DX 프로젝트 구조 + 저장소 1개당 파이프라인 1개)
2. **Source Control System** — 드롭다운에서 **GitHub** 선택.
3. **소스 컨트롤 인증 — Connect 버튼** (아직 GitHub 인가 전일 때만 표시)
   파란 안내 박스 ("To continue, connect and authorize your source control provider…")의 **Connect** 클릭 → GitHub 로그인/인가 (Authorize). Lab 2.3 에서 이미 인가했다면 이 박스가 보이지 않고 바로 아래 라디오/입력란이 나타납니다.
4. **저장소 지정 — 라디오에서 Connect to a repository 선택**
   ★ 라디오 2개 중 **Connect to a repository** 를 선택합니다. (새로 만드는 Create a repository ✗ 가 아님)
   선택하면 **Repository URL** 입력란 하나가 나타납니다 (Owner/Name 분리 입력 아님) → Lab 1 의 기존 저장소 URL 을 입력:
   - 예: `https://github.com/<owner>/dreamhouse-lite`
   - `<owner>` = 저장소 소유자 (GitHub 사용자명 또는 조직명). GitHub 주소창의 실제 URL 과 정확히 일치 (대소문자 포함, 끝에 `.git` 없이).
   - 조직(Org) 소유 저장소면 Connect 인가 시 해당 org 접근을 허용해야 URL 이 연결됩니다.
5. **Next** 클릭 → 연결할 Project 선택 모달 (멀티 선택/Multi-picklist)이 표시됩니다. 아직 프로젝트가 없으므로 아무것도 선택하지 말고 **Create Pipeline** 버튼을 클릭해 파이프라인을 생성합니다. (프로젝트는 Step 4.4 에서 별도로 만들어 이 파이프라인에 연결 → 그때 이 목록에서 선택 가능해집니다.)

> 💡 **Create a repository vs Connect to a repository:** Create a repository = DevOps Center 가 빈 저장소를 새로 생성 (프로젝트 베이스 없음). Connect to a repository = 이미 있는 저장소에 연결 → 본 실습은 Lab 1.6 의 프로젝트 베이스가 든 `dreamhouse-lite` 가 있으므로 이쪽을 선택해야 Work Item Feature Branch 생성 · 프로모트가 정상 동작합니다.

### Step 4.2 — 파이프라인 단계 (Stage) 구성: 환경 연결 + 브랜치

본 실습 최종 파이프라인은 **DEV → Integration(SIT) → UAT → Production** 4단계입니다. (DE Dev Hub 의 Scratch Org 3개로 DEV/SIT/UAT 운용, PROD=Hub)

#### Step 4.2.0 — 파이프라인 설정 화면으로 이동

1. 상단 **DevOps Pipelines 탭** 클릭 → 리스트 뷰에서 Step 4.1 에서 만든 **DreamHouse-Lite** 파이프라인을 클릭.
2. **Pipeline Stages** 탭의 **Configure Pipeline Stages** 화면이 열립니다. (우상단에 "Finish setting up your pipeline / Activate Pipeline" 표시, 상단 바에 연결된 Repository 확인)

#### Step 4.2.1 — Staging 단계 삭제 (DEV-SIT-UAT-Staging-PROD → DEV-SIT-UAT-PROD)

초기 생성된 파이프라인은 Development → Integration → UAT → Staging → Production 5단계입니다. 본 실습은 Staging 을 사용하지 않으므로 삭제합니다.

- **Staging** 단계 카드 상단의 휴지통 아이콘을 클릭 → 삭제 확인.
- 남은 단계가 **Development(DEV) → Integration(SIT) → UAT → Production** 인지 확인.
  (단계 이름은 그대로 두어도 됩니다. Integration=SIT, Production=PROD 로 사용)

#### Step 4.2.2 — 단계별 환경 (Environment) 연결

- **Development Environments (DEV)**: 카드의 **Add Development Environment** 클릭 → DH-DEV 연결.
- **Integration (SIT)**: **Connect Environment** → DH-SIT (통합 테스트)
- **UAT**: **Connect Environment** → DH-UAT (수용 테스트)
- **Production**: **Connect Environment** → Hub(DE) 조직 (관리자 계정)

각 연결은 해당 오그 로그인 (Step 3.3 자격증명) → **Allow/Confirm** 로 DevOps Center 접근을 승인합니다.

> 💡 **개발 환경은 여러 개 추가 가능 (복수 개발자)**: Development Environments 단계 (다른 단계와 달리 복수)는 **Add Development Environment** 로 여러 개발 환경을 추가할 수 있습니다. 실제 프로젝트에서는 개발자마다 자신의 DEV 환경 (개인 Scratch Org 또는 Developer Sandbox)을 가져가, Work Item 을 시작할 때 자기 환경을 선택해 병렬로 개발합니다. (본 1인 실습은 DH-DEV 하나만 사용)
> 예: DH-DEV-alpha, DH-DEV-beta … 를 각각 추가 → 개발자 알파/베타가 각자 환경에서 작업 → 같은 파이프라인 (SIT/UAT/PROD)으로 합류. SIT/UAT/Production 은 공용 (단일) 환경입니다 (개발자별로 나누지 않음).

#### Step 4.2.3 — 단계별 브랜치 (Branch) 지정

브랜치는 **Production 에 가까운 단계부터 (오른쪽 → 왼쪽)** 지정합니다. 각 카드의 Branch 영역에 "Set the branch in the next stage first" 가 보이면, 더 뒤(다음) 단계의 브랜치를 먼저 지정해야 활성화됩니다.

- **Production**: `main` (기준 브랜치)
- **UAT**: **Specify Branch** → `uat`
- **Integration (SIT)**: **Specify Branch** → `sit`
- (Development 단계는 Work Item 별 Feature Branch 를 사용하므로 별도 지정 없음)

> ⚠ Scratch Org 로그인 실패 시 `sf org open -o DH-XXX` 로 접근 확인, 비밀번호 재생성 (`sf org generate password`).

### Step 4.3 — 파이프라인 활성화 (Activate)

1. 모든 단계의 환경 연결과 브랜치 지정이 끝났는지 확인 (DEV·SIT·UAT·PROD, sit/uat/main).
2. 화면 우상단 **Activate Pipeline** 버튼 클릭 → 확인. (버튼이 비활성이면 환경/브랜치 미완 항목이 있는지 점검)

> ⚠ 활성화 후에는 파이프라인 구조 (단계 추가/삭제) 변경 불가 — 단계 구성을 신중히 확인 후 활성화.

### Step 4.4 — 프로젝트 생성 + 파이프라인 연결

1. **DevOps Projects** 탭 → **New**
2. Project Name: `DreamHouse Lite`, Description: `부동산 매물 관리 앱`
3. **Pipeline** 드롭다운에서 `DreamHouse Pipeline` 선택 (※ 저장소는 파이프라인에 연결됨)
4. **Save** → 프로젝트에 파이프라인 · 저장소가 표시되는지 확인

### Step 4.5 — (선택) Agentforce Vibes Org 설정

파이프라인 상세 화면 상단 바에 **Agentforce Vibes Org: Not Set (Set Up)** 항목이 있습니다. Agentforce Vibes IDE 를 열고 머지 충돌을 Agentforce 로 해결할 때 사용할 기본 환경 (default environment)을 지정하는 설정입니다.

> 💡 **본 실습에서는 선택(옵션)**: 본 교재는 AI 코딩을 Claude (`.claude/agents`)로 진행하므로 설정하지 않아도 모든 Lab 을 완료할 수 있습니다. Not Set 상태로 두어도 됩니다.

설정하려면: 상단 바 **Set Up** 클릭 → "Set up Agentforce Vibes Org" 모달에서:

- **Existing Environment (권장):** 이미 연결된 파이프라인 환경 목록 (DEV / SIT / UAT — Sandbox or Scratch Org)에서 하나 선택. 보통 DEV (DH-DEV)를 선택합니다.
- 또는 **New Environment:** 새 환경을 연결.
- **Set as Agentforce Vibes Org** 클릭.

> 💡 Hub(DE) 조직은 지정 대상이 아닙니다. 목록에 나오는 개발/테스트 환경 (DEV/SIT/UAT 스크래치 오그) 중 하나를 기본 환경으로 지정합니다.

지정 시 Lab 12 의 충돌 해결 "Resolve with Agentforce" / Agentforce Vibes IDE 실행에 이 환경이 사용됩니다. (미설정 시 충돌은 수동 병합으로 처리)

### Step 4.6 — 테스트 자동 실행 구성 (Tests 탭)

파이프라인을 Activate 한 뒤, 파이프라인 상세 화면의 **Tests 탭**에서 DevOps Center 내장 테스트 (Apex 단위 테스트 · Flow 테스트 · Code Analyzer)를 단계별로 자동 실행되도록 구성합니다. (이건 DevOps Center 네이티브 기능 — Lab 10 의 Playwright E2E (테스터 수동)와 별개이며 상호 보완)

#### Step 4.6.1 — Test Provider 구성 (Configure Test Provider)

> 💡 각 제공자를 직접 Configure 해야 합니다. 처음에는 모두 미구성 상태이며, 카드의 **Configured 배지**는 구성을 마친 뒤 표시됩니다. (제공자별로 하나씩 구성)

1. 파이프라인 상세 화면 → **Tests 탭** 클릭.
2. 우측 **Configure Test Provider** 클릭 → 모달에서 사용할 제공자 카드를 각각 눌러 구성 (필요한 설정 입력 → 저장). 본 실습은 아래 3종을 모두 구성합니다:
   - **Code Analyzer** — 코드 품질 · 보안 취약점 정적 분석
   - **Flow Tests** — Flow 동작 검증
   - **Apex Unit Tests** — Apex 클래스/트리거 단위 테스트
3. 구성한 제공자에 **Configured 배지**가 표시되는지 확인하고 닫기.

#### Step 4.6.2 — Test Provider 동기화 (Sync Test Providers)

> 💡 **★ Test Suite 는 어떻게 채워지나 (중요)**: Test Suite 는 직접 만드는 것이 아니라 Test Provider 가 "환경/소스에 실제로 존재하는 테스트"를 동기화(Sync)하면서 생성됩니다.
> - **Apex Unit Tests** → 환경에 Apex 테스트 클래스가 있어야 Suite 생성
> - **Flow Tests** → Flow 테스트가 있어야 생성
> - **Code Analyzer** → 소스 정적분석 기반 (테스트 클래스 불필요) — 그래서 동기화 직후 보통 0
>
> Test Suite 는 **환경별 (environment-specific)** 입니다 (각 Suite 에 environment · project · provider 속성). 따라서 테스트가 없는 빈 환경은 Sync 해도 0개가 정상이고, 배정 화면에 "No test suites available… Sync test providers" 가 표시됩니다. (제공자를 구성만 하고 Sync 안 한 경우에도 동일하게 표시)

1. 우측 **Sync Test Providers** 클릭 → 제공자 체크 (Code Analyzer / Flow Tests / Apex Unit Tests) → **Synchronize**.
2. 동기화 결과의 Test Suites 개수 (예: Apex Unit Tests 4, Flow Tests 4, Code Analyzer 0)와 시각을 확인.
3. 본 실습 순서상 **지금은 0개가 정상**입니다 — 아직 Apex/Flow 테스트가 없기 때문입니다. **Lab 9 에서 Apex/Flow 를 개발 · 배포한 뒤 이 화면에서 다시 Sync** 하면 Suite 가 채워지고, 그때 Step 4.6.3 으로 단계에 배정합니다.

#### Step 4.6.3 — 단계별 Test Suite 배정 (Add) — Event Type 주의

각 단계 컬럼 (Development / SIT / UAT / Production)의 **Add** → Add Test Suites 모달에서 **Event Type** 을 고르고 Suite 를 선택합니다.

| 단계 | Event Type | 의미 |
|---|---|---|
| Development (DEV) | **Review** | Work Item 에 Review 가 생성될 때 자동 실행 |
| SIT | **Pre Promotion** | 다음 단계로 Promote 되기 전 자동 실행 |
| UAT | **Pre Promotion** | 다음 단계로 Promote 되기 전 자동 실행 |
| (Production) | — | 일반적으로 배정 안 함 (릴리스 검증은 PROD 배포 시 Apex 테스트로) |

배정 절차: 단계의 **Add** → Event Type (위 표) 선택 → 표시된 Test Suite 체크 → **Add**.

> 💡 "No test suites available…" 가 보이면 아직 배정할 Suite 가 없는 것 — 비정상이 아닙니다. ① 테스트 (Apex/Flow)가 환경에 존재하는지 확인 → ② Step 4.6.2 Sync → ③ Suite 생성 후 배정. (본 실습은 Lab 9 개발 후 이 배정을 수행)

> 💡 Suite 가 Sync 되어 있으면 SIT·UAT 는 코드가 아직 없어도 미리 배정 가능합니다 (배정 = 파이프라인 설정, 실행은 도달/Promote 시). 자세히: Step 9.6.

> 💡 **정리**: DEV=Review (리뷰 시 검증), SIT·UAT=Pre-Promotion (승격 전 검증). 이렇게 두면 개발자가 리뷰를 올릴 때, 그리고 단계 승격 직전에 테스트가 자동 실행되어 품질 게이트 역할을 합니다.

> ✅ **Lab 4 완료 기준**: 파이프라인 Activate + 4개 환경 (DEV/SIT/UAT/PROD) 연결 · 브랜치 (sit/uat/main) + 프로젝트에 파이프라인 연결 + (선택) Tests 탭 Provider 구성 · 동기화 · 단계 배정 (DEV=Review / SIT·UAT=Pre Promotion). (Agentforce Vibes Org 는 선택)

### 전체 프로세스 한눈에

① 기획/설계 → ② 프로토타이핑 사이클 (고객 협의 · 반복) → ③ DevOps Center DEV·SIT·UAT·PROD. 프로토타이핑과 본 개발은 같은 force-app 코드를 공유하므로 목업 산출물이 그대로 본 개발로 이어집니다.

---

## Lab 5. 산출물 작성 ① — REQUIREMENT + Phase 0

PM/BA 관점. VS Code 에서 `dreamhouse-lite` 폴더를 Claude 로 엽니다. 이 Lab 의 문서 작성은 **requirements_analyst (REQUIREMENT · AC) · solution_architect (FIT/GAP/NUD)** 에이전트로 진행합니다.

### Step 5.1 — (최신화) 문서 폴더 · 에이전트 · CLAUDE.md 준비

> ⚠ **작업 시작 전 항상 최신화**: Lab 1 에서 clone 한 `dreamhouse-lite` 저장소 폴더에서, 먼저 `git pull` 로 최신 상태를 받은 뒤 진행합니다.

```powershell
# Lab 1 에서 clone 한 저장소 폴더
cd ~/projects/dreamhouse-lite

# ★ 항상 최신화 후 작업
git checkout main
git pull

New-Item -ItemType Directory -Force docs/inputs, docs/phase-0, docs/phases, docs/work-items | Out-Null

# 저장소 폴더에서 시작, 또는 VS Code 에서 Claude Extension 으로 시작
claude
```

`.claude/agents/` (9종)와 **기본 CLAUDE.md** 는 Lab 1.6 의 `claude_salesforce.zip` 으로 이미 설치되어 있습니다. claude 세션에서:

```text
/init
```

- ★ **`/init` 은 zip 으로 받은 기본 CLAUDE.md 를 현재 프로젝트 구조에 맞게 갱신 · 보완하기 위해 실행**합니다 (기본 진행 규칙은 유지, 프로젝트 맥락 반영). Lab 5 에서 1회 수행.
- 갱신 후 [Cheatsheet_for_ProjectManager.md](Cheatsheet_for_ProjectManager.md) 3장 진행 규칙 (에이전트 사용 · 코드네임 유지 · DROP/ENHANCE/ADD · 선후관계 · 추적성 · WI 이름 커밋)이 CLAUDE.md 에 남아 있는지 확인 (없으면 추가).
- `.claude/agents/` 9종 (requirements_analyst · solution_architect · project_manager · work_item_manager · frontend_developer · backend_developer · test_engineer · code_reviewer · documentation_writer)이 있는지 확인 (0.2 참조).

### Step 5.2 — 입력 자료 준비 (RFP)

`docs/inputs/RFP.md` 에 아래 내용을 저장합니다. (Claude 가 STEP 1 에서 취합)

```text
# RFP — DreamHouse Lite 부동산 매물 관리 시스템

## 1. 배경 및 목적
○○ 부동산 중개사무소는 현재 매물을 엑셀로 관리하여 검색·공유·최신화가 비효율적이다.
방문 고객에게 조건(가격대·방 수·지역)에 맞는 매물을 빠르게 보여주고, 사진과 핵심 정보를
한눈에 확인할 수 있는 Salesforce Lightning 앱을 구축한다.

## 2. 대상 사용자 / 권한
- 상담원(중개사): 매물 검색·필터·조회 (읽기 중심)
- 사무소 관리자: 매물 등록·수정·삭제·상태 변경 (관리 권한)

## 3. 필요 기능 (Functional Requirements)
- F1 매물 관리(CRUD): 매물명, 주소, 도시, 가격, 침실 수, 욕실 수, 대표 사진(URL), 상태(판매중/계약중/판매완료)
- F2 매물 목록(카드/타일): 사진·가격·주소·침실/욕실 수 요약, 상태 색상 배지
- F3 검색·필터: 키워드(매물명/도시) + 가격 범위 + 최소 침실 수로 실시간 필터링
- F4 매물 상세: 큰 사진과 전체 정보. (가능하면) 위치 지도, 유사 매물 추천
- F5 상태 관리: 상태 변경 시 목록·카드·배지에 즉시 반영
- F6 (2차/선택) 중개인별 담당 매물, 관심 매물, 가격대 분포 차트

## 4. 필요 화면 (Screens / UI)
- S1 매물 탐색 화면: 좌측 검색·필터 패널 + 우측 매물 카드 그리드, 결과 건수·빈 결과 안내
- S2 매물 상세 화면: 대표 사진 + 전체 속성, (선택) 지도/유사 매물
- S3 매물 등록·수정 폼 (관리자)
- S4 (선택) 홈/대시보드: 신규 매물, 상태별 건수 요약
- 공통: 데스크톱/모바일 반응형, 로딩 스피너·에러 토스트, SLDS

## 5. 데이터
- 매물(Property): 위 F1 항목. 시연용 샘플 약 10건.

## 6. 비기능 요구 (Non-functional)
- 플랫폼: Lightning Experience, LWC 기반
- 성능: 샘플 데이터 기준 목록·검색 응답 1초 이내
- 보안: 상담원=조회, 관리자=등록/수정. Apex with sharing, CRUD/FLS 준수
- 품질: Apex 단위 테스트 커버리지 75%↑, 정적분석 High 이상 0건, UI 기능은 Playwright E2E 로 검증

## 7. 제약 / 가정 / 일정
- 1차(MVP): 1 스프린트(2일) — F1~F5, S1~S3 (지도/차트/중개인은 2차 선택)
- 외부 부동산 API 연동은 범위 외 (사진은 URL 입력)
- AI 코딩(Claude)으로 프로토타입 먼저 → 고객 리뷰로 보완(반복)
```

### Step 5.3 — REQUIREMENT.md 생성 (Cheatsheet STEP 1)

[Cheatsheet_for_ProjectManager.md](Cheatsheet_for_ProjectManager.md) 의 STEP 1 프롬프트를 아래의 프롬프트 뒤에 붙여넣고 claude 에 복사하여 실행합니다.

```text
이 작업은 .claude/agents/ 의 requirements_analyst 에이전트로 진행해줘.

[입력 자료]
- RFP: docs/inputs/RFP.md (나머지는 비움)

[프로젝트 입력값]
- 팀 구성원: 1인 (PM·BA·Developer·QA·RM 겸임)
- 프로젝트 기간: 2일 (1 스프린트, Phase 1)
- 대상 조직/에디션: Developer Edition Hub + Scratch Org(DEV/SIT/UAT), 차세대 DevOps Center (PROD=Hub)
- AI 코딩 도입 방침: 적극 도입 (프로토타이핑 우선)
```

→ 산출물 `docs/REQUIREMENT.md` 검토: REQ-001~ 기능 요구사항 + 기능 선후관계 (Depends-on) 표 + 테스트 전략 개요 + Phase 0 후보가 잡혔는지 확인.

### Step 5.4 — Phase 0 ①: FIT/GAP/NUD 분석 (Cheatsheet STEP 2)

본 개발 전에 표준 기능 대비 적합성을 분석해 (가상) 고객과 합의하는 산출물. [Cheatsheet_for_ProjectManager.md](Cheatsheet_for_ProjectManager.md) STEP 2 프롬프트를 (solution_architect 에이전트로) 실행 → `docs/phase-0/FIT-GAP-NUD.md` 생성.

```text
이 작업은 .claude/agents/ 의 solution_architect 에이전트로 진행해줘.
(이어서 Cheatsheet STEP 2 프롬프트 본문 붙여넣기)
```

→ 각 REQ-nnn 이 FIT (표준 충족) / GAP (개발 필요) / NUD (신규 · 고유 · 고난도)로 분류되고, 고객 협의 Decision Log 가 있는지 확인. (예: 매물 CRUD=FIT, 실시간 필터 LWC=GAP, 지도/유사매물=NUD)

### Step 5.5 — Phase 0 ②: Acceptance Criteria 작성 (Cheatsheet STEP 3)

테스트 시나리오의 기준이 되는 상세 인수기준. 이후 Playwright E2E (Lab 10)가 여기서 파생됩니다. STEP 3 프롬프트를 (requirements_analyst 에이전트로) 실행 → `docs/phase-0/ACCEPTANCE-CRITERIA.md` 생성. (인수기준은 requirements_analyst 의 산출물)

```text
이 작업은 .claude/agents/ 의 requirements_analyst 에이전트로 진행해줘.
(이어서 Cheatsheet STEP 3 프롬프트 본문 붙여넣기)
```

→ 각 요구사항에 **AC-nnn** 부여, Given/When/Then + 검증 데이터 + 검증 방법 (단위/Playwright/수동) + 추적성 매트릭스가 있는지 확인.

> ✅ **Lab 5 완료 기준**: REQUIREMENT.md + phase-0/FIT-GAP-NUD.md + phase-0/ACCEPTANCE-CRITERIA.md (AC-nnn).

---

## Lab 6. 산출물 작성 ② — PROJECT-PLAN · PHASE-PLAN · WORKITEM

PM 관점. 선후관계 (Depends-on)와 인수기준 (AC) 연결을 유지하며 계획 산출물을 만듭니다.

### Step 6.1 — PROJECT-PLAN.md 생성 (Cheatsheet STEP 4)

REQUIREMENT + Phase 0 (FIT/GAP/NUD · AC)를 바탕으로 Phase · Work Item 목록 · 일정을 만드는 계획 산출물. (PM 의 핵심 산출물)

[Cheatsheet_for_ProjectManager.md](Cheatsheet_for_ProjectManager.md) STEP 4 프롬프트를 (project_manager 에이전트로) 실행 → `docs/PROJECT-PLAN.md` 생성.

```text
이 작업은 .claude/agents/ 의 project_manager 에이전트로 진행해줘.
(이어서 Cheatsheet STEP 4 프롬프트 본문 붙여넣기)
```

→ 산출물 `docs/PROJECT-PLAN.md` 검토: Phase 0 포함 + 리소스 · 일정 + 아래와 유사한 Work Item 표 (선행 · 분류 · Man-day 컬럼) + REQ/AC ↔ WI 매핑 · 위상정렬 실행순서가 잡혔는지 확인.

| Status | ID | Description | 선행 (Depends-on) | 분류 | M/D |
|---|---|---|---|---|---|
| [ ] | WI-1.001 | Property__c 오브젝트 · 필드 | - | FIT | 0.5 |
| [ ] | WI-1.002 | 샘플 데이터 + Property Tile LWC | WI-1.001 | GAP | 0.5 |
| [ ] | WI-1.003 | Property List LWC + Apex 컨트롤러 | WI-1.002 | GAP | 1 |
| [ ] | WI-1.004 | 가격/침실 검색 필터 + Apex | WI-1.003 | GAP | 1 |
| [ ] | WI-1.005 | 매물 상세 + Lightning App Page | WI-1.003 | GAP | 0.5 |

> 💡 실제 표는 Claude 가 REQUIREMENT/Phase 0 기준으로 생성합니다. 위는 기대 형태 예시이며, 다르면 PROJECT-PLAN 을 검토 · 조정하세요.

### Step 6.2 — PHASE-PLAN-01.md 생성 (Cheatsheet STEP 5)

PROJECT-PLAN 의 각 Work Item 을 개발 가능한 수준으로 상세화 (세부 작업 · 타입/API · 수락 기준 · 실행 순서). Phase 수만큼 PHASE-PLAN-01 … 0n 생성 (본 실습은 Phase 1 만 → `PHASE-PLAN-01.md`).

[Cheatsheet_for_ProjectManager.md](Cheatsheet_for_ProjectManager.md) STEP 5 프롬프트를 (project_manager 에이전트로) 실행 → `docs/phases/PHASE-PLAN-01.md` 생성.

```text
이 작업은 .claude/agents/ 의 project_manager 에이전트로 진행해줘.
(이어서 Cheatsheet STEP 5 프롬프트 본문 붙여넣기)
```

→ 각 Work Item 에 다음이 포함됐는지 확인:

- 세부 작업 (sub-tasks)
- 주요 타입/API + 코드 예시 (예: Apex `@AuraEnabled`, LWC `@wire`, SOQL)
- 수락 기준 — Phase 0 의 **AC-nnn 을 인용/연결** (검증 가능한 형태)
- 의존 관계 — 선행 WI 기준 실행 순서 (위상정렬), 병렬 가능 항목 표시
- 체크박스 (`[ ]`) 체크리스트

### Step 6.3 — Work Item 문서 생성 (Cheatsheet STEP 6)

개발자가 다른 문서 참조 없이 이 문서만 보고 개발할 수 있는 단독 워크아이템 문서. (Lab 9 개발의 직접 입력물)

[Cheatsheet_for_ProjectManager.md](Cheatsheet_for_ProjectManager.md) STEP 6 프롬프트를 (work_item_manager 에이전트로) 실행 → `docs/work-items/WI-1.001-*.md` 등 5개 생성.

```text
이 작업은 .claude/agents/ 의 work_item_manager 에이전트로 진행해줘.
(이어서 Cheatsheet STEP 6 프롬프트 본문 붙여넣기)
```

→ 각 워크아이템 문서에 다음이 있는지 확인:

- YAML FrontMatter: `wi-id` · `depends-on: [WI-…]` · `req-ids: [REQ-…]` · `ac-ids: [AC-…]` · `pipeline` · `status`
- 상세 개요 (2~3 단락) · (UI 면) Wireframe Mockup (ASCII)
- 선행 조건 (선행 WI 완료 포함, 체크박스)
- 번호 매긴 세부 작업 · 주요 타입/API 코드 예시
- 자세한 수락 기준 — 각 항목을 **AC-nnn 에 매핑** (체크박스)
- 테스트 요구 — 단위 테스트 (커버리지 목표) + Playwright spec 파일명 (`tests/e2e/WI-1.nnn-*.spec.ts`) 명시
- 통합 체크리스트 — 배포 (`deploy --dry-run` → `deploy`) · WI 이름으로 커밋 규칙
- 파일명 · wi-id · 설명이 PROJECT-PLAN/PHASE-PLAN 과 정확히 일치 (코드네임 유지)

### Step 6.4 — 산출물 커밋 & 푸시

저장소는 Lab 1 에서 이미 clone · 연결돼 있으므로 **`git init` / `remote add` 는 하지 않습니다.** main 에 그대로 커밋 · 푸시합니다.

```powershell
# 최신화
git checkout main
git pull

git add docs
git commit -m "docs: REQUIREMENT/Phase0/PROJECT-PLAN/PHASE-PLAN/WORKITEMS 초안"
git push origin main
```

> ✅ **Lab 6 완료 기준**: PROJECT-PLAN (선행 · 분류) · PHASE-PLAN-01 · WI 5종 + GitHub main 푸시.

---

## Lab 7. 목업 프로토타이핑 & (가상) 고객 협의 (Cheatsheet STEP 7)

DevOps Center 에 Work Item 을 등록하기 전, 워크아이템 문서로 UI 목업 (프로토타입)을 만들어 (가상) 고객 협의하고, 결정을 본 문서에 반영한 뒤 실제 개발에 들어갑니다.

> 💡 **코드 공유 원칙**: 목업과 본 프로젝트는 **같은 Git 저장소 · 같은 force-app** 사용 → 목업 컴포넌트가 그대로 본 개발의 출발점. 문서만 분리 (`docs/` 본 문서 / `docs/mockup/` 목업).

**흐름 (10단계)**

① 목업 프로젝트 문서 → ② 목업 워크아이템 문서 → ③ 목업 작업공간 (mockup 브랜치) → ④ 목업 오그 (DH-DEV 겸용) → ⑤ 목업 UI 구현 → ⑥ (가상) 고객 협의 → ⑦ 협의 → 목업 문서 반영 → ⑧ 목업 코드 반영 → ⑨ (⑥~⑧ 반복) → ⑩ 최종 결정 본 문서 반영 + 목업 코드 main 병합

### Step 7.1 — ①② 목업 문서 생성 (프롬프트)

claude (frontend_developer 에이전트) 세션에서:

```text
이 작업은 .claude/agents/ 의 frontend_developer 에이전트로 진행해줘.
docs/work-items/ 와 docs/PROJECT-PLAN.md 를 분석해서, UI/화면 검증용 목업 계획
docs/mockup/MOCKUP-PROJECT-PLAN.md 와 목업 워크아이템 docs/mockup/work-items/MWI-1.nnn-*.md 를 작성해줘.
- 본 WI(WI-1.nnn) ↔ 목업(MWI-1.nnn) 1:1 매핑 (코드네임 유지)
- 정적/샘플 데이터로 화면·레이아웃·흐름에 집중. 코드는 본 프로젝트와 동일한 force-app 사용.
```

### Step 7.2 — ③ 목업 작업공간 (같은 저장소의 mockup 브랜치)

> ⚠ **항상 최신 main 에서 분기**: 목업도 같은 `dreamhouse-lite` 저장소에서 진행합니다. 먼저 main 을 최신화한 뒤 mockup 브랜치를 만듭니다.

```powershell
# 최신화 후 분기
git checkout main
git pull

# 목업 작업 브랜치 (force-app 공유)
git checkout -b mockup
git add docs/mockup
git commit -m "docs(mockup): 목업 계획/워크아이템"
git push -u origin mockup
```

### Step 7.3 — ④ 목업용 오그 (DH-DEV 겸용)

> ⚠ **Scratch Org 한도 (3개)**: DEV·SIT·UAT 로 이미 3개를 사용 중이라 별도 목업 오그를 만들 수 없습니다. 목업은 본 개발 착수 전 단계이므로 **DH-DEV 를 목업 오그로 겸용**합니다 (코드도 어차피 공유).

```powershell
# 목업 배포 대상 = DH-DEV
sf config set target-org DH-DEV
sf org open -o DH-DEV
```

> 💡 DE 는 Scratch Org 를 3개까지 허용하므로, 별도 오그가 필요하면 잠시 DH-UAT 를 삭제 (`sf org delete scratch -o DH-UAT`)해 슬롯을 비우고 목업 종료 후 재생성하세요. 본 가이드는 DH-DEV 겸용을 권장합니다.

### Step 7.4 — ⑤ 목업 UI 구현 (목업 워크아이템 전체)

> ⚠ **MWI 하나만 만들고 끝내지 마세요.** 다음 단계 (7.5 고객 협의)를 하려면 검증 대상 화면 (S1 탐색 · S2 상세 · S3 등록/수정 등)에 해당하는 목업 워크아이템 (MWI)을 모두 구현해 한 화면 세트로 시연 가능해야 합니다.

1. **구현 대상 확인**: `docs/mockup/work-items/` 의 `MWI-1.nnn-*.md` 목록 전체를 봅니다 (예: 매물 카드/목록 · 검색 필터 · 상세 등 화면 단위). 본 WI (WI-1.nnn)와 1:1 매핑돼 있습니다.
2. **모든 MWI 를 구현** — 정적/샘플 데이터 (JS 배열)로 화면 · 레이아웃 · 흐름 · 클라이언트 동작에 집중 (실제 Apex/SOQL/DB 없음, SLDS).

   권장 (한 번에):

   ```text
   이 작업은 .claude/agents/ 의 frontend_developer 에이전트로 진행해줘.
   docs/mockup/work-items/ 의 모든 MWI 문서를 분석해서, 검증 대상 화면(매물 탐색/카드/필터/상세 등)을
   LWC 목업으로 전부 구현해줘.
   - 데이터는 컴포넌트 내 정적 샘플(JS 배열). 실제 Apex/SOQL/DB·권한·테스트는 생략.
   - SLDS 로 스타일링, 클라이언트 측 필터/네비게이션 동작까지.
   - 각 화면 컴포넌트를 만들고, 한 App Page(또는 탭)에 배치해 "한 화면에서 시연" 가능하게.
   - 완료 후 force-app 변경 요약과 DH-DEV 배포 명령을 알려줘.
   ```

   개별 (하나씩) 예시:

   ```text
   이 작업은 .claude/agents/ 의 frontend_developer 에이전트로 진행해줘.
   docs/mockup/work-items/MWI-1.003-property-list.md 를 구현해줘.
   - LWC 로 매물 카드 그리드 + 좌측 필터 패널 UI. 데이터는 컴포넌트 내 정적 샘플(JS 배열).
   - 실제 Apex/SOQL 없이 화면·레이아웃·필터(클라이언트 측)에 집중. SLDS 사용.
   ```

   → MWI-1.001 부터 목록의 끝까지 같은 방식으로 반복 (또는 위 "한 번에" 프롬프트 사용).
3. **배포 & 화면 확인**:

   ```powershell
   sf project deploy start -o DH-DEV

   # App Launcher → 목업 화면 진입 → 카드·필터·상세 흐름(정적 데이터) 동작 확인
   sf org open -o DH-DEV

   git add force-app docs/mockup
   git commit -m "mockup: UI prototypes (MWI 전체)"
   ```

4. **이 단계 완료 조건**: 검증할 화면이 DH-DEV 에서 실제로 보이고, 클릭 · 필터 등 흐름이 동작해야 합니다 (= 7.5 고객 협의의 대상). MWI 하나로는 부족 — 화면 세트가 갖춰질 때까지 2번을 반복하세요.

### Step 7.5 — ⑥ 목업 리뷰 (1차) → 리뷰 결과 파일 작성

1. DH-DEV (목업 겸용) 화면을 띄우고 **부록 D 기능/UI 체크리스트**로 한 항목씩 점검합니다 (리뷰어/고객 역할 = 본인).
2. 점검 결과 (리뷰 결정사항)를 리뷰 결과 파일로 저장합니다 → **`docs/mockup/reviews/REVIEW-01.md`** (라운드마다 `REVIEW-02.md`, `REVIEW-03.md` …). 이 파일이 Step 7.6 의 입력이자 협의 변경 이력이 됩니다.

   파일 형식 (예):

   ```text
   # 목업 리뷰 결과 — Round 1 (YYYY-MM-DD)
   대상: DH-DEV 목업 · 점검 기준: 부록 D 체크리스트

   ## 결정사항 (액션 → 대상 MWI)
   - 매물 카드에 상태 배지(Available/Sold) 추가      → ENHANCE MWI-1.002
   - 검색 결과 건수 표시 추가                        → ENHANCE MWI-1.003
   - 침실 수 필터는 사용 안 함 (가격 필터만)          → DROP(일부) MWI-1.004
   - 매물 위치 "지도 보기" 신규 요청                 → ADD MWI-1.006

   ## 반영 상태 (Step 7.6 에서 갱신)
   - [ ] 위 항목 목업 반영 완료
   ```

3. 저장 후 커밋:

   ```powershell
   git add docs/mockup/reviews
   git commit -m "mockup review: Round 1 결정사항 (REVIEW-01)"
   ```

### Step 7.6 — ⑦⑧ 리뷰 결과 파일을 목업에 반영 (프롬프트) → 재배포

Step 7.5 의 리뷰 결과 파일 (`docs/mockup/reviews/REVIEW-01.md`)을 입력으로, 목업 문서와 목업 코드에 함께 반영합니다. (목업 단계이므로 본 산출물이 아닌 `docs/mockup/*` 만 갱신)

```text
이 작업은 .claude/agents/ 의 frontend_developer 에이전트로 진행해줘.

[입력]
docs/mockup/reviews/REVIEW-01.md (이번 라운드 리뷰 결정사항 — 이 파일을 기준으로 반영)

[작업]
위 리뷰 결과 파일의 각 결정사항을 목업에 반영하라.
1) docs/mockup/MOCKUP-PROJECT-PLAN.md 와 docs/mockup/work-items/* 를 재작성하지 말고
   DROP(취소선+사유) / ENHANCE(ID 유지·이력 1줄) / ADD(다음 MWI 번호) 로 갱신. (MWI 코드네임 유지)
2) 변경된 MWI 에 맞춰 목업 LWC(force-app)를 수정 — 정적/샘플 데이터 유지, 화면·레이아웃·흐름 중심.
3) REVIEW-01.md 의 각 항목에 **반영 상태(반영/보류 + 사유)** 를 표시(체크)하고,
   변경 요약(추가/변경/취소 건수)과 DH-DEV 배포 명령을 알려줘.
```

반영 후 재배포하고 화면을 다시 띄웁니다.

```powershell
sf project deploy start -o DH-DEV
sf org open -o DH-DEV

git add force-app docs/mockup
git commit -m "mockup: REVIEW-01 반영 (DROP/ENHANCE/ADD)"
```

### Step 7.7 — ⑨ 다시 리뷰 (반복)

재배포된 화면을 부록 D 체크리스트로 다시 점검하고, 새 결정사항을 다음 라운드 리뷰 결과 파일 (`docs/mockup/reviews/REVIEW-02.md`, `03`…)로 저장합니다. 그 파일을 입력으로 Step 7.6 을 다시 실행 → 재배포 → 재점검.

> 💡 Step 7.5 → 7.6 → 7.7 을 반복합니다 (고객이 화면 · 흐름에 만족할 때까지). 더 이상 변경이 없으면 다음 단계로. (모든 `REVIEW-0n.md` 가 협의 이력으로 `docs/mockup/reviews/` 에 남습니다.)

### Step 7.8 — ⑩ 최종 결정사항을 "본 프로젝트 산출물"에 반영 (프롬프트) + 코드 병합

리뷰가 끝나면 목업에서 확정된 모든 결정을 본 프로젝트 산출물 (REQUIREMENT / Phase 0 / PROJECT-PLAN / PHASE-PLAN / WORKITEM)에 반영합니다. ([Cheatsheet_for_ProjectManager.md](Cheatsheet_for_ProjectManager.md) STEP 7 의 세 번째 프롬프트와 동일 원칙 — 재작성 ✗ · 코드네임 유지)

```text
이 작업은 .claude/agents/ 의 requirements_analyst 에이전트로 진행해줘.

[입력]
docs/mockup/* (리뷰로 확정된 최종본)
본 산출물 docs/REQUIREMENT.md, docs/phase-0/*, docs/PROJECT-PLAN.md, docs/phases/*, docs/work-items/*

[매핑]
목업 MWI-1.nnn ↔ 본 WI-1.nnn (1:1, MOCKUP-PROJECT-PLAN 의 대응표 참조)

[작업]
목업의 최종 결정(DROP/ENHANCE/ADD)을 본 산출물에 재작성 없이 점진 반영하라.
- DROP   : 본 항목을 ~~취소선~~ + (DROPPED YYYY-MM-DD: 사유)
- ENHANCE: ID(REQ/AC/WI) 유지한 채 보강 + 변경 이력 1줄 (ENHANCED YYYY-MM-DD: …)
- ADD    : 다음 일련번호로 신규 항목 추가 (ADDED) — REQUIREMENT 의 REQ·해당 Phase 의 WI 모두
- 화면/UI 변경은 해당 WORKITEM 의 Wireframe·수락 기준에 반영하고, 바뀐 인수기준은
  phase-0/ACCEPTANCE-CRITERIA.md 의 AC-nnn 도 함께 갱신
- 선후관계(Depends-on)·일정/범위 변동 시 PROJECT-PLAN 표·PHASE-PLAN 체크리스트도 갱신

[규칙]
코드네임(REQ/AC/WI) 절대 변경 금지. 매핑 불명확하면 추측 말고 "확인 필요 목록"으로 질문.

[출력]
변경된 본 산출물 파일 목록과 각 문서 변경 요약(추가/변경/취소 건수) 표.

[커밋]
`docs: reflect mockup decisions (DROP/ENHANCE/ADD)`
```

그리고 목업 코드를 본 개발 출발점으로 병합:

```powershell
# 최신화 후 병합
git checkout main
git pull

# 목업 프로토타입 코드를 main 에 반영 (충돌 시 Resolve with Agentforce)
git merge mockup
git push origin main
```

> ✅ **Lab 7 완료 기준**: 목업 생성 · 리뷰 · 반영 · 재리뷰 (반복) → 본 산출물 갱신 + 목업 코드 main 병합. (목업은 DH-DEV 겸용, 별도 오그 없음)

---

## Lab 8. Work Item 을 DevOps Center 에 등록

Lab 7 로 확정 · 갱신된 본 문서의 WI-1.nnn 과 DevOps Center Work Item 을 1:1 매핑. 두 가지 방법이 있습니다 — **A) 수동 (UI)** · **B) Claude 로 백로그 일괄 업로드**. 어느 쪽이든 문서 ↔ DevOps Center Work Item 1:1 매핑과 선행 (Depends-on) 순서는 동일하게 유지합니다.

### Step 8.1 — 방법 선택

| 방법 | 언제 | 특징 |
|---|---|---|
| A. 수동 (UI) | 항목이 적거나 (본 실습 5건) 처음 흐름을 익힐 때 | DevOps Center UI 에서 하나씩 New Work Item |
| B. Claude 일괄 | 백로그가 많을 때 (수십 건+) | `docs/work-items/` · PROJECT-PLAN 을 읽어 WI-1.nnn 레코드 일괄 생성 |

> 💡 DevOps Center 는 Hub(DE) 조직에 있으므로, 방법 B 의 데이터 작업 대상 org 는 **DH-HUB** 입니다.

### Step 8.2 — (방법 A) 수동 등록 (UI)

1. DevOps Center → **Work Items** 탭 → **New Work Item** → New Work Item 모달이 열립니다.
2. 모달 항목 입력 (★ = 필수):
   - **Project** ★ — `DreamHouse Lite` 선택
   - **Subject** ★ — `WI-1.001 Property__c 오브젝트 · 필드` (문서 제목과 일치, 코드네임 유지)
   - **Description** (선택) — 해당 WI 문서의 개요 · 수락 기준 요약
   - **Assignee** (선택) — 본인 (Workitem 담당 개발자)
   - **Development Environment** (선택) — DH-DEV 지정 가능. 비워둬도 됨 → 비우면 Lab 9 에서 작업 시작 시 지정합니다.
   - **Save** (또는 **Save & New** 로 연속 생성)
3. 모든 Workitem WI-p.nnn 에 대해서 생성. 선행 (Depends-on) 순서를 지켜 진행. 자동 부여 번호 (WI-xxxx) ↔ 문서 WI-1.nnn 매핑 표를 PROJECT-PLAN 비고에 기록.

> 💡 필수는 **Project · Subject** 뿐입니다. Development Environment 는 선택 — 지금 DH-DEV 로 지정하면 Lab 9 의 환경 선택을 건너뛸 수 있고, 비워두면 Lab 9.1 의 Connected Development Environment 에서 지정합니다.

### Step 8.3 — (방법 B) Claude 로 백로그 일괄 업로드 (Cheatsheet STEP 8)

`docs/work-items/` 의 워크아이템과 PROJECT-PLAN 을 읽어 DevOps Center Work Item 레코드를 한 번에 생성합니다. (항목이 많을 때 유용)

claude 세션에서 (**project-manager 에이전트**) 아래 프롬프트로 실행:

```text
이 작업은 .claude/agents/ 의 project-manager 에이전트로 진행해줘.

[목표]
docs/work-items/ 의 워크아이템과 docs/PROJECT-PLAN.md 를 읽어,
DevOps Center(Hub = DH-HUB)에 Work Item 레코드를 일괄 생성한다.

[절차]
1) 차세대 DevOps Center 의 Work Item 객체는 **`WorkItem`** 이다. 필드 구성을 먼저 describe 로 확인:
   sf sobject describe -o DH-HUB --sobject WorkItem
   → Subject·Project lookup·Assignee·Development Environment 등 필드/필수값 확인
2) 'DreamHouse Lite' 프로젝트 Id 조회
   - WorkItem describe 에서 확인한 **Project lookup 필드의 참조 객체**로 조회:
     (예) sf data query -o DH-HUB \
            -q "SELECT Id,Name FROM DevopsProject WHERE Name='DreamHouse Lite'"
3) 각 WI-1.nnn 문서 → `WorkItem` 레코드 필드 매핑 (정확한 API 명은 1)의 describe 결과 사용):
   - Subject     = 문서 제목 그대로 (예: "WI-1.001 Property__c 오브젝트·필드") ← 코드네임 유지
   - Description = ★ 해당 WI 문서(docs/work-items/WI-1.nnn-*.md)의 **markdown 전체 내용을 HTML 로 변환**한 값.
                   (요약 ✗ — 문서 전체를 담는다. WorkItem 의 Description 은 **리치텍스트(HTML)** 필드)
       · 변환 규칙: 제목 #→<h1>/<h2>…, 굵게/기울임 **→<strong>·<em>, 목록 →<ul>/<ol>+<li>,
         링크 →<a href>, 표 →<table>, 코드블록 →<pre><code>·인라인 →<code>, 문단 →<p>.
       · YAML FrontMatter 는 본문에서 제외(또는 표로 요약), 나머지 본문 섹션은 모두 포함.
       · <script> 등 위험 태그·미지원 태그는 넣지 말 것.
       · 리치텍스트(Rich Text) 길이 한도(필드 maxLength — describe 로 확인, 보통 최대 131,072자) 초과 시:
         핵심 섹션 우선 … 말미에 "원문: docs/work-items/WI-1.nnn-*.md" 경로를 남긴다.
   - Project(lookup) = 위 프로젝트 Id, Assignee = 본인 사용자
   - Development Environment = (선택) 비워둠 → Lab 9에서 작업 시작 시 지정
     (미리 지정하려면 DH-DEV 환경 레코드 Id)
4) 모든 Workitem을 **선행(Depends-on) 순서대로** `WorkItem` 에 생성:
   sf data create record -s WorkItem ...        (소량)
   또는 CSV 생성 후 sf data import bulk -s WorkItem ...   (대량)
5) 생성된 레코드 Id와 **문서 WI-1.nnn ↔ DevOps Center 번호 매핑 표**를 출력하고,
   그 표를 docs/PROJECT-PLAN.md 비고에 추가(커밋).

[주의]
- **Feature Branch 는 만들지 않는다**(여기선 레코드만 생성).
  Feature Branch 는 Lab 9에서 "개발 시작" 시 생성된다.
- 객체는 **`WorkItem`**. 필드 API명은 describe 결과를 그대로 사용(필수 필드 누락 금지).
- **Description 은 HTML 리치텍스트**다. HTML에는 따옴표·`<>`·줄바꿈이 많으므로
  `-v "Description=..."` 인라인은 깨지기 쉽다 → **CSV 파일 + `sf data import bulk`** 로 적재하고,
  CSV 값은 규칙대로 escape(따옴표 `""`, 셀 전체를 `"`로 감싸기)한다. 적재 후 한 건 열어 서식이 보이는지 확인.
- 코드네임(WI-1.nnn)은 Subject에 **그대로 유지**.
```

→ 검증: DevOps Center Work Items 탭에서 5건이 보이는지 + 프로젝트/담당자/Subject 가 맞는지 확인. (필드가 비거나 프로젝트 미연결이면 describe 로 확인한 API 명 · 필수값을 점검)

> ⚠ 일괄 생성한 Work Item 은 개발 환경이 "연결"되지 않습니다. 레코드만 만들어지므로 (환경 연결/인증은 별도), 각 WI 를 열어 **우측 상단 ▼ → Change Development Environment** 로 DH-DEV 를 지정 · 연결하거나, Step 9.1 에서 Change Development Environment 로 지정한 뒤 시작해야 합니다.

> ✅ **Lab 8 완료 기준**: (A 또는 B 로) Work Item 5건 등록 + 문서 WI-1.nnn ↔ DevOps Center 번호 매핑 표 기록. (방법 B 는 개발 환경 연결을 Step 9.1 에서 수행)

---

## Lab 9. 개발 & Commit (DX Inspector) — WI-1.001 예시

Developer 역할. 선행 WI 완료 후 다음 WI 로 진행 (위상정렬).

> ⚠ **개발 시작 전 항상 최신화**: DevOps Center 가 만든 Feature Branch 를 반드시 `git fetch` / `checkout` (또는 `pull`)로 받아 최신 상태에서 개발합니다. (로컬에 임의로 만들어 두지 않습니다)

### Step 9.1 — Work Item 시작 (Mark as In Progress) & Feature Branch

1. DevOps Center → **Work Items** 탭 → WI-1.001 의 ID/Subject 를 클릭해 엽니다.
   상단 바에 Project / Development Environment / Branch, 좌측에 Work Item Status (New → In Progress → In Review → Ready to Promote → Promoted → Closed), 우측에 탭 Details / Change List / Activity History 가 보입니다.
2. **담당자 · 개발 환경 지정 (★ 시작 전 필수)**:
   - **Assigned To (Assignee)**: 이 Work Item 의 담당 개발자를 지정합니다 — Details 탭의 Assigned To 에 본인 (또는 해당 개발자)을 선택. (Lab 8 에서 비워뒀거나 일괄 생성 (방법 B)했다면 여기서 반드시 지정)
   - **Development Environment**: 상단 바의 Development Environment 가 비었거나 바꿔야 하면 **우측 상단 ▼ 메뉴 → Change Development Environment** 로 DH-DEV (본인 개발 환경)를 지정 · 연결합니다 (처음 연결 시 해당 오그 로그인 · Allow). Lab 8 에서 이미 DEV 로 지정돼 있으면 생략 가능.
3. **Mark as In Progress** 버튼 클릭 → 상태가 In Progress 로 바뀌고, 이 Work Item 의 Feature Branch (예: `WI-1.001/...`)가 자동 생성됩니다.

> 💡 **워크아이템 화면 구성**: 탭은 Details / Change List / Activity History (별도 "Changes" 탭은 없음). **작업 시작 = Mark as In Progress**, **개발 환경 지정 = 상단 ▼ Change Development Environment**, **변경 커밋 = DX Inspector (Step 9.5)**.

### Step 9.2 — 로컬에서 Feature Branch 받기/최신화 (★ 항상 먼저)

#### (A) 이미 저장소를 clone 해 둔 경우 — 최신화만

```powershell
# 베이스 최신화
git checkout main
git pull

# 원격의 새 feature branch 가져오기
git fetch origin

# DevOps Center 가 만든 feature branch (정확한 이름은 DevOps Center 에서 확인)
git checkout WI-1.001

# 해당 브랜치도 최신화
git pull origin WI-1.001

# 본인 개발 환경 (개발자마다 다를 수 있음)
sf config set target-org DH-DEV
```

#### (B) 다른 개발자 / 새 PC 에서 처음 시작하는 경우 — clone 부터

실제 프로젝트는 개발자가 여럿이고 각자 자기 DEV 환경을 씁니다. 본인이 저장소를 아직 clone 하지 않았다면 **clone → feature branch checkout → 자기 오그 로그인 → 소스 배포** 순으로 시작합니다.

```powershell
# 최초 1회
git clone https://github.com/<owner>/dreamhouse-lite.git
cd dreamhouse-lite

# 내 Work Item feature branch
git fetch origin
git checkout WI-1.001

# 내 Scratch Org/Sandbox 로그인 (개인 환경)
sf org login web -a DH-DEV-<나>
sf config set target-org DH-DEV-<나>

# ★ feature branch 소스를 내 환경에 배포 (시드)
sf project deploy start
```

> ⚠ **`git pull` ≠ 환경 동기화 — deploy/retrieve 방향을 정확히 구분하세요.** Git 브랜치를 최신화해도 그 코드가 내 Scratch Org/Sandbox 에는 아직 없습니다. 방향이 반대인 두 명령을 혼동하면 안 됩니다:
> - **`sf project deploy start` — 로컬/Git → 오그 (배포):** 개발의 기본 방향. AI 코딩 결과나 git pull 로 받은 변경 등 로컬 소스를 내 개발 오그에 반영할 때. → **git pull 직후엔 보통 이걸 실행**합니다.
> - **`sf project retrieve start` — 오그 → 로컬 (회수):** 오그에서 직접 만든 변경을 로컬 소스로 가져올 때. 예) Setup 의 클릭/선언적 변경 (오브젝트 · 필드 · Flow 등)을 했을 때, 또는 하나의 개발 환경을 여러 명이 공유해 다른 사람이 오그를 바꿨을 때. 개발자마다 자기 환경을 쓰고 로컬(코드)에서만 작업한다면 retrieve 는 거의 필요 없습니다. (위 "직접 오그 변경/공유 환경" 경우에만)
>
> ⇒ 정리: 로컬 코드 최신화 → `deploy start` 로 내 오그에 반영이 기본. retrieve 는 "오그에서 직접 바꾼 것을 코드로 되가져올 때"만.

### Step 9.3 — Claude 로 개발 (AI 코딩) (Cheatsheet STEP 9)

작업 성격에 맞는 개발 에이전트 사용: **오브젝트/Apex = backend_developer**, **LWC/화면 = frontend_developer**. (아래는 WI-1.001 오브젝트 → backend_developer 예시)

```text
이 작업은 .claude/agents/ 의 backend_developer 에이전트로 진행해줘.
(해당 Workitem md 파일의 내용을 붙여넣음)
```

### Step 9.4 — Scratch Org (DEV)로 배포 & 확인

```powershell
# 로컬 메타데이터를 DH-DEV 로 배포
sf project deploy start

# Object Manager 에서 Property__c 확인
sf org open -o DH-DEV
```

(WI-1.003 부터) Apex 컨트롤러가 생기면 — 개발자 로컬 수동 점검 (커밋 전 사전 확인):

```powershell
sf apex run test --test-level RunLocalTests --code-coverage --result-format human
sf code-analyzer run --workspace . --view table
```

> 💡 위 `sf apex run test` 는 CLI 로 직접 돌리는 로컬/수동 점검입니다 (커밋 전 사전 확인용). DevOps Center 의 자동 테스트 (DevOps Testing)는 별개이며 커밋 이후 이벤트에 실행됩니다 — 아래 Step 9.6 비교 박스 참조.

### Step 9.5 — 변경 추적 & Commit (DX Inspector)

1. DH-DEV Scratch Org 화면에서 조직 이름 옆 **DX Inspector** 아이콘 → **Change Management** 탭
2. (최초 1회) **DevOps Center 로그인**: DX Inspector 를 처음 쓰면 **Sign in to DevOps Center** 클릭 → DevOps Center 가 있는 Hub(DE) 조직에 로그인 · 인가 (Authorize) 합니다. (조직당 1회, 이후 생략)
3. 변경된 메타데이터가 실시간 목록으로 표시 → 연결된 DevOps Center 에서 WI-1.001 선택
4. 항목 선택 → Commit Comment (예: `feat: WI-1.001 Property object & fields`) → **Commit**
   → DevOps Center 가 Feature Branch 에 커밋 · 푸시.

### Step 9.6 — Tests 탭 동기화 & 단계 배정 (테스트가 생긴 시점 · 최초 1회)

> 💡 ★ 여기가 Lab 4.6 에서 "0개라 비워뒀던" Test Suite 배정을 완료하는 시점입니다. Apex 단위 테스트 (와 Flow)가 개발 · 배포 · 커밋되어 이제 동기화하면 Test Suite 가 생성됩니다. (이 배정은 테스트가 처음 생겼을 때 1회 설정 → 이후 테스트가 추가될 때마다 재Sync)

**테스트가 "언제" 실행되나 — 9.4/9.5 와 비교 (DEV 는 Commit 후 실행):**

| 무엇 | 언제 | 비고 |
|---|---|---|
| 로컬 수동 테스트 (`sf apex run test`, Step 9.4) | Commit 전 | 개발자 자체 점검 (선택 · 권장). CLI 로 직접 실행 |
| DevOps Testing — DEV (Review 이벤트) | Commit 후 → Mark as In Review 시 자동 (Lab 11) | 리뷰로 전환 (In Review)될 때 실행. 즉 DEV 자동 테스트는 커밋 전이 아니라 커밋 후 (리뷰 전환 시점)입니다 |
| DevOps Testing — SIT/UAT (Pre-Promotion) | 다음 단계로 Promote 직전 자동 (Lab 12) | 검증 통과까지 Promote 차단 |

> 💡 **정리**: DEV 의 자동 테스트는 Commit 후 (리뷰 생성 시) 돌고, Commit 전에는 개발자가 `sf apex run test` 로 수동 점검합니다. (둘은 별개)

1. **다시 Sync** — 파이프라인 → **Tests 탭** → **Sync Test Providers** → Apex Unit Tests / Flow Tests 체크 → **Synchronize**.
   - 이제 Test Suites 개수가 채워지는지 확인 (예: Apex Unit Tests N, Flow Tests N). (자세히: Step 4.6.2)
   - Test Suite 는 환경별이므로, 테스트가 배포된 환경 (여기서는 DEV) 기준으로 동기화됩니다.
2. **단계별 Test Suite 배정** — 각 단계 컬럼의 **Add** → Event Type 선택 → Suite 체크 → **Add** (자세히: Step 4.6.3):

   | 단계 | Event Type |
   |---|---|
   | Development (DEV) | **Review** (Work Item Review 생성 시 실행) |
   | SIT | **Pre-Promotion** (다음 단계 Promote 전 실행) |
   | UAT | **Pre-Promotion** (다음 단계 Promote 전 실행) |

3. 배정 후에는 Lab 11 (Review 생성 시) · Lab 12 (Promote 직전)에 이 테스트가 자동 실행되어 품질 게이트로 동작합니다.

> 💡 **SIT·UAT 는 아직 코드가 없어도 지금 배정 가능**: 단계 배정은 "이 단계의 Review/Promote 이벤트 때 이 Suite 를 실행해라"라는 파이프라인 설정이라, SIT/UAT 가 빈 상태여도 미리 배정해 둘 수 있습니다. (전제는 Suite 가 Sync 되어 목록에 존재할 것 — 코드가 그 환경에 있어야 하는 게 아님.) 실제 실행은 work item 이 그 단계에 도달/Promote 될 때 일어납니다.

> 💡 Code Analyzer 는 소스 정적분석 기반이라 테스트 클래스가 없어도 동작합니다 (Suite 로 배정 가능). Apex/Flow Suite 는 테스트가 추가될 때마다 다시 Sync 하면 갱신됩니다.

### Step 9.7 — 완료 처리 (문서) — 테스트 통과 후 마지막에

> ⚠ **CLAUDE.md 진행 규칙**: 로컬 Apex 테스트 (Step 9.4)와 필요한 검증이 정상 통과한 뒤에만 Work Item 을 완료로 표시합니다. (실패가 있으면 해결 전 완료 금지)

- WI-1.001 문서의 통합 체크리스트와 PROJECT-PLAN/PHASE-PLAN 의 Status 를 `[X]` 로 갱신.
- 나머지 WI-1.002 ~ 1.005 도 선행 순서대로 Step 9.1~9.5 → 9.7 을 반복합니다. (Step 9.6 의 Test Suite 배정은 테스트가 처음 생겼을 때 1회, 이후 새 테스트가 추가되면 재Sync 만 수행)

> ✅ **Lab 9 완료 기준**: WI 개발 · DEV 배포 · 로컬 테스트 통과 · DX Inspector 커밋 + (테스트 생성 후) Tests 탭 Sync → 단계 배정 (DEV=Review / SIT·UAT=Pre-Promotion) → 마지막에 문서 Status 갱신.

---

## Lab 10. Playwright E2E 테스트 (테스터 수행) ★

QA/테스터 역할. Phase 0 인수기준 (AC-nnn)을 Playwright UI 기능 테스트로 구현하고 테스터가 직접 실행해 검증합니다.

**이 Lab 에서 하는 일 (큰 그림 먼저)**

- **E2E (End-to-End) 테스트** = 실제 브라우저로 사람처럼 화면을 클릭 · 입력해, 앱이 인수기준 (AC)대로 동작하는지 자동 검증하는 것.
- **Playwright** = Microsoft 의 브라우저 자동화 도구. 우리는 이걸로 Salesforce Lightning 화면 (LWC)을 띄워 테스트합니다.
- **흐름**: ① Playwright 설치 · 설정 → ② Salesforce 로그인 세션 저장 → ③ AC 를 테스트 코드 (`*.spec.ts`)로 변환 → ④ 테스터가 실행하고 리포트 확인.
- DevOps Center 내장 테스트 (Apex/Flow, Lab 9.6)와 별개의 UI 검증 계층입니다 (상호 보완).

> ⚠ **사전**: Lab 9 에서 화면 (LWC)이 DH-DEV 에 배포돼 있어야 테스트할 대상이 존재합니다.

### Step 10.1 — Playwright 설치 & 설정

**무엇**: 프로젝트에 Playwright 와 테스트용 브라우저를 설치하고, 공통 설정 파일을 만듭니다.

`dreamhouse-lite` 폴더 (프로젝트 루트)에서:

```powershell
npm init -y                       # package.json 없으면 생성 (있으면 건너뜀)
npm install -D @playwright/test   # Playwright 테스트 러너 설치 (개발 의존성)
npx playwright install chromium   # 테스트용 Chromium 브라우저 다운로드
```

> 💡 처음 한 번만 설치하면 됩니다. (Windows 는 `chromium` 만; Linux/CI 는 OS 라이브러리까지 받는 `--with-deps chromium`)

`playwright.config.ts` 파일을 프로젝트 루트에 만들고 아래처럼 둡니다 (각 줄 의미는 주석 참고):

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',                       // 테스트(spec) 파일 위치
  timeout: 60_000,                              // 테스트 1건 제한시간(ms) — Salesforce 는 느릴 수 있어 넉넉히
  use: {
    baseURL: process.env.SF_INSTANCE_URL,       // 테스트 대상 org 주소(환경변수로 주입 → DEV/SIT/UAT 전환)
    storageState: 'tests/e2e/.auth/state.json', // Step 10.2 에서 저장할 "로그인 상태"(매번 로그인 안 하려고)
    screenshot: 'only-on-failure',              // 실패 시 스크린샷 자동 저장
    trace: 'on-first-retry',                    // 실패 재시도 시 추적(trace) 기록 → 원인 분석용
  },
  reporter: [['html', { outputFolder: 'playwright-report' }]],   // 보기 좋은 HTML 리포트
});
```

### Step 10.2 — Salesforce 로그인 세션 저장 (storageState)

**왜 필요한가**: Salesforce 화면은 로그인해야 보입니다. 테스트마다 로그인하면 느리고 불안정하니, 한 번 로그인한 세션을 파일 (`state.json`)로 저장해 모든 테스트가 재사용합니다.

**방법**: sf CLI 로 받은 세션 토큰으로 frontdoor URL (즉시 로그인 링크)에 접속 → 그 로그인 상태를 저장합니다.

`tests/e2e/global-setup.mjs` 파일을 만듭니다:

```js
import { execSync } from 'node:child_process';
import { chromium } from '@playwright/test';

// 1) 대상 org(기본 DH-DEV)의 instanceUrl + accessToken 가져오기
const org = process.env.SF_TARGET_ORG ?? 'DH-DEV';
const info = JSON.parse(execSync(`sf org display -o ${org} --json`)).result;

// 2) frontdoor.jsp 로 즉시 로그인 → 로그인 상태를 state.json 으로 저장
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`${info.instanceUrl}/secur/frontdoor.jsp?sid=${info.accessToken}`);
await page.context().storageState({ path: 'tests/e2e/.auth/state.json' });
await browser.close();
console.log('로그인 세션 저장 완료:', info.instanceUrl);
```

실행:

```powershell
node tests/e2e/global-setup.mjs   # 실행하면 tests/e2e/.auth/state.json 이 생성됨
```

> ⚠ **주의**: accessToken 은 민감정보입니다. `state.json` 은 **커밋 금지** → `.gitignore` 에 `tests/e2e/.auth/` 를 추가하세요.

> 💡 세션 토큰은 org 마다 다르고 만료됩니다. 다른 환경 (SIT/UAT)으로 바꾸거나 한참 뒤 다시 테스트할 때는 `SF_TARGET_ORG` 를 바꿔 global-setup 을 다시 실행해 세션을 갱신합니다.

### Step 10.3 — AC → spec 변환 (Cheatsheet STEP 10 · test_engineer 에이전트)

**무엇**: Phase 0 의 인수기준 (AC-nnn, Given/When/Then)을 Playwright 테스트 코드로 1:1 옮깁니다. 직접 짜기보다 **test_engineer 에이전트**에게 맡깁니다.

[Cheatsheet_for_ProjectManager.md](Cheatsheet_for_ProjectManager.md) 의 STEP 10 프롬프트를 활용합니다. 단, 본 실습은 **[3] GitHub Actions (CI) 단계는 제외** — [1] Playwright 설치 · 설정 · [2] AC→spec 변환만 수행 (실행은 테스터 수동, Step 10.4).

```text
이 작업은 .claude/agents/ 의 test_engineer 에이전트로 진행해줘.
(이어서 Cheatsheet STEP 10 프롬프트 본문 붙여넣기 — 단 [3] GitHub Actions(CI) 단계는 제외)

[보완 지시]
- docs/phase-0/ACCEPTANCE-CRITERIA.md 의 AC-nnn(Given/When/Then) → tests/e2e/WI-1.nnn-<기능>.spec.ts 로
- 각 test 주석에 // AC-nnn / REQ-nnn / WI-1.nnn 추적 태그(나중에 어떤 AC를 검증하는지 추적)
- 선택자는 data-* 속성/접근성 역할(getByRole/getByLabel) 우선. 경계/예외(negative) 시나리오 포함.
- 대상 예: 매물 탐색 화면(S1) — 가격 필터 입력 시 카드 목록이 실시간 갱신되는지.
```

생성된 spec 예시 — `tests/e2e/WI-1.004-search-filter.spec.ts` (각 줄이 무슨 뜻인지 주석으로):

```ts
import { test, expect } from '@playwright/test';

// AC-012 / REQ-003 / WI-1.004 : 가격 범위 필터링  (← 어떤 인수기준을 검증하는지)
test('가격 상한 입력 시 해당 매물만 카드로 표시', async ({ page }) => {
  await page.goto('/lightning/n/Property_Explorer');     // (When) 매물 탐색 화면 열기
  await page.getByLabel('최대 가격').fill('500000');      // (When) 최대 가격에 500000 입력
  await expect(page.getByTestId('property-card'))        // (Then) 카드 개수가
    .toHaveCount(3);                                     //        기대값과 같은지 확인
});
```

> 💡 **선택자 (Selector) 팁 — 매우 중요**: 테스트가 화면 요소를 안정적으로 찾으려면 LWC 에 **`data-testid="property-card"`** 같은 고정 식별자가 있어야 합니다 (없으면 화면이 조금만 바뀌어도 테스트가 깨짐). 없으면 개발 (Lab 9) 시 추가하거나, `getByRole` / `getByLabel` (접근성 라벨) 같은 안정적 선택자를 사용하세요. 화면 URL (`/lightning/n/Property_Explorer`)의 `Property_Explorer` 는 실제 App/Tab API 이름으로 맞춰야 합니다 (App Launcher 에서 만든 탭 이름 확인).

### Step 10.4 — 테스터가 실행 & 결과 기록

테스터 (=본인)가 각 환경에서 Playwright 를 실행해 AC 충족 여부를 확인합니다. (CI 자동화 없음 — 수동 실행)

#### (1) DEV 에서 1차 실행

```powershell
# 대상 org
$env:SF_TARGET_ORG  = "DH-DEV"

# 로그인 세션 저장 (처음/만료 시)
node tests/e2e/global-setup.mjs

# baseURL 주입
$env:SF_INSTANCE_URL = (sf org display -o DH-DEV --json | ConvertFrom-Json).result.instanceUrl

# 전체 테스트 실행
npx playwright test

# 결과 리포트 (브라우저)로 열기
npx playwright show-report
```

처음 만들 때 유용한 모드 (친절):

```powershell
# 브라우저 창을 띄워 동작을 눈으로 보며 실행
npx playwright test --headed

# UI 모드 — 테스트를 골라 실행/디버그 (초보자 추천)
npx playwright test --ui

# 특정 파일만 실행
npx playwright test WI-1.004-search-filter.spec.ts
```

#### (2) 결과 읽기

show-report 화면에서 **초록=통과 / 빨강=실패**. 실패 항목을 클릭하면 스크린샷 · trace (단계별 재생)로 원인을 봅니다. 실패는 대응 AC-nnn 과 함께 개발자 (=본인)에게 피드백 → 코드 수정 → 재실행.

#### (3) 다른 환경에서 재실행

SIT/UAT 는 org 만 바꿔 똑같이 실행합니다 (세션도 그 org 로 다시 저장). — 실제로는 Lab 12 에서 SIT/UAT 배포 후 수행:

```powershell
$env:SF_TARGET_ORG = "DH-SIT"
node tests/e2e/global-setup.mjs
$env:SF_INSTANCE_URL = (sf org display -o DH-SIT --json | ConvertFrom-Json).result.instanceUrl
npx playwright test
```

#### (4) 산출물 커밋 (워크플로 파일 없음 — state.json 은 제외)

```powershell
git add tests playwright.config.ts package.json ; git commit -m "test: Playwright E2E specs (AC 기반, 테스터 실행)" ; git push
```

**테스트 결과 표 예시** (테스터가 기록 → 산출물 `docs/DELIVERABLES.md` 에 링크):

| AC-ID | 시나리오 | 환경 | 결과 | 비고 |
|---|---|---|---|---|
| AC-012 | 가격 상한 필터 | DEV | ✅ | |
| AC-012 | 가격 상한 필터 | SIT | ✅ | |
| AC-015 | 빈 결과 안내 | DEV | ❌ → ✅ | 메시지 누락 → 수정 후 통과 |

**E2E 자주 막히는 점 (Troubleshooting)**

| 증상 | 원인 · 조치 |
|---|---|
| 로그인 안 됨 / 빈 화면 · 로그인 페이지 | 세션 만료/다른 org → **global-setup 재실행** (`SF_TARGET_ORG` 확인). `sf org open -o DH-DEV` 로 접근되는지 먼저 확인 |
| baseURL 관련 오류 / 주소 이상 | `SF_INSTANCE_URL` 미설정 → `(sf org display … ).result.instanceUrl` 로 다시 주입 |
| 요소를 못 찾음 (timeout) | 선택자 불안정 → LWC 에 **`data-testid`** 추가 / `getByRole` · `getByLabel` 사용, 로딩 대기 (`await expect(...).toBeVisible()`) |
| 화면 URL 404 | `/lightning/n/` 의 Tab API 이름이 실제와 다름 → App Launcher 에서 확인 |
| 느려서 timeout | `playwright.config.ts` 의 timeout 상향, 네트워크/조직 응답 확인 |

> ✅ **Lab 10 완료 기준**: Playwright 설치 · 세션 저장 + AC→spec 변환 + 테스터가 DEV 에서 실행 · 통과 + 스펙 커밋 · 결과 표 기록.

---

## Lab 11. Code Review & Approval (셀프 PR)

1인 실습이므로 Developer 가 만든 변경을 본인이 리뷰어 (RM) 관점으로 검토합니다.

**이 Lab 에서 하는 일 (큰 그림 먼저)**

- 개발이 끝난 Work Item 을 **리뷰 → 머지 → 프로모트 준비** 상태로 끌어올립니다.
- DevOps Center 는 워크아이템 좌측 **Work Item Status 패널의 버튼**으로 단계를 전환합니다. In Review 로 바꾸면 GitHub 에 **PR (Pull Request)** 이 자동 생성됩니다.
- **상태 흐름**: In Progress → **Mark as In Review** (PR 생성 · DEV 테스트 자동 실행) → 셀프 리뷰 · 머지 → **Mark as Ready to Promote** → (Lab 12 에서 프로모트)
- 1인 실습이라 개발자=리뷰어를 본인이 겸합니다 ("셀프 PR"). 실제 팀에서는 다른 RM/리뷰어가 검토합니다.

> ⚠ **전제**: Step 9.5 에서 변경을 커밋해 두었어야 합니다 (커밋이 없으면 리뷰할 내용이 없음).

### Step 11.1 — 리뷰로 전환 (Mark as In Review)

1. DevOps Center → **Work Items** → WI-1.001 열기 → 좌측 **Work Item Status** 패널에서 현재 상태가 **In Progress** 인지 확인.
2. 같은 패널의 **Mark as In Review** 버튼 클릭. 이때 일어나는 일:
   - 상태가 **In Review** 로 전환됩니다.
   - GitHub 에 이 Work Item 의 **Pull Request (Change Request)** 가 자동 생성됩니다 (Feature Branch → 상위 단계 브랜치 대상).
   - DEV 단계에 배정한 **Review 이벤트 Test Suite (Step 9.6)** 가 자동 실행됩니다.
3. Details / Change List 에서 **View Change Request** (또는 PR 링크)를 눌러 GitHub PR 을 엽니다.

> 💡 별도 "Create Review" 버튼은 없습니다 — 상태 패널 버튼으로 전환하는 방식입니다.

### Step 11.2 — 셀프 리뷰 & 머지 (Cheatsheet STEP 11)

> 💡 **"셀프 PR"** — 1인 실습에선 만든 사람이 곧 리뷰어입니다. 그래도 실제 리뷰처럼 꼼꼼히 봅니다.

1. GitHub PR 의 **Files changed** 탭에서 변경된 메타데이터/코드를 확인합니다.
   **code_reviewer 에이전트**로 셀프 리뷰 (권장):

   ```text
   이 작업은 .claude/agents/ 의 code_reviewer 에이전트로 진행해줘.
   이 PR의 변경(force-app)을 품질·보안·Governor Limits 관점에서 리뷰하고 개선점을 알려줘.
   ```

2. **검증 결과 4가지를 함께 확인**:
   ① Lab 10 Playwright E2E 결과 (테스터 실행) · ② Apex 단위 테스트 (Step 9.4) · ③ Code Analyzer 정적분석 · ④ (배정 시) DEV Review 테스트 (Step 11.1 에서 자동 실행)
3. 문제 없으면 GitHub 에서 **Merge pull request** → **Confirm merge**.

> 💡 솔로 저장소는 본인 PR 을 "Approve"는 못 해도 머지는 가능합니다 (브랜치 보호 미설정 시). 리뷰 코멘트로 점검 기록을 남기세요.

> 💡 수정이 필요하면 코드를 고쳐 다시 커밋 (Step 9.5) → PR 이 자동 갱신 → 다시 검토.

### Step 11.3 — 프로모트 준비 (Ready to Promote)

1. 먼저 **Work Item Status** 패널에서 **Quality Gate Result** 가 **passed** 인지 확인합니다 (Step 11.1 의 DEV Review 테스트 결과).
   > ⚠ **failed** 이면 **Mark as Ready to Promote 가 차단**됩니다. 원인 수정 · 재커밋 (Step 9.5)하거나, 같은 패널의 **Run Tests** 로 테스트만 다시 돌려 통과시킨 뒤 진행하세요.
2. 리뷰 · 머지가 끝나고 게이트가 통과되면 좌측 Work Item Status 패널의 **Mark as Ready to Promote** 버튼을 클릭 → 상태가 **Ready to Promote** 로 전환됩니다.
   > 💡 GitHub 에서 PR 을 머지하면 상태가 자동으로 Ready to Promote 로 전환되기도 합니다 (머지하지 않았을 때만 수동으로 표시).
3. 이 상태가 되면 **Pipeline → Stages** 화면의 **Approved Work Items** 목록에 나타나, Lab 12 에서 프로모트할 수 있습니다.

나머지 Work Item (WI-1.002 ~ 1.005)도 각각 Lab 9 (개발 · 커밋) → Lab 11 (In Review → 머지 → Ready to Promote)을 거칩니다. (선행 순서 유지)

**자주 막히는 점 (Lab 11)**

| 증상 | 원인 · 조치 |
|---|---|
| Mark as In Review 눌러도 PR 이 안 생김 | 커밋 (Step 9.5)이 안 됐거나 변경이 없음 → DX Inspector 로 커밋 후 다시 전환 |
| Mark as In Review 버튼이 안 보임/비활성 | 상태가 In Progress 인지 · 커밋이 있는지 확인 |
| GitHub 에서 Merge 버튼 비활성 | 머지 충돌 또는 필수 체크 미통과 → 충돌 해결 (Lab 12 참고) 후 재시도 |
| Ready to Promote 후 Approved 목록에 없음 | 파이프라인 Active 여부 · 새로고침 확인 |

> ✅ **Lab 11 완료 기준**: Mark as In Review (PR 자동 생성) → 셀프 리뷰 · E2E/테스트 결과 확인 · 머지 → Ready to Promote (Approved Work Items 표시).

---

## Lab 12. Promote & Deploy (SIT → UAT → PROD)

RM (릴리스 매니저) 역할. 모든 WI 가 Ready to Promote (Lab 11) 된 뒤 진행. SIT=통합 테스트, UAT=수용 테스트, PROD=릴리스.

**이 Lab 에서 하는 일 (큰 그림 먼저)**

- **프로모트 (Promote)** = 승인된 (Ready to Promote) Work Item 을 파이프라인 단계를 따라 위로 이동시키는 것. DEV → SIT → UAT → PROD 순.
- 각 단계로 Promote 할 때, 그 단계에 배정한 **Pre-Promotion 테스트 (Step 9.6)** 가 자동 실행되어 통과해야 넘어갑니다 (품질 게이트). 실패하면 프로모션이 차단됩니다.
- **검증 2겹**: ① DevOps Testing (Apex/Flow/Code Analyzer) 자동 · 차단형 + ② Playwright E2E 테스터 수동 회귀.
- **PROD 는 파이프라인의 마지막 · 최고위험 단계**: Pre-Promotion 품질 게이트가 가장 엄격하게 적용됩니다. (※ validate-only/Quick Deploy 2단계는 관리형 패키지 전용으로 Next Gen 에는 없음 — 표준 Promote 로 릴리스)
- **작업 위치**: DevOps Center → DreamHouse Lite → **Pipeline → Stages** 화면.

### Step 12.1 — SIT 로 프로모트 (Integration · 통합 테스트)

1. **Pipeline → Stages** 화면에서 **Approved Work Items** (Ready to Promote 된 항목들)를 확인합니다.
2. SIT 로 올릴 Work Item 을 체크 → **Promote Selected** 클릭.
3. (최초 1회) **SIT 환경 로그인**: Integration (SIT) 환경 = DH-SIT 로그인 → **Allow**.
4. **Promotion Options** 확인 → **Promote**:
   - **Changes**: 보통 "Changes not in Integration's branch" (SIT 에 아직 없는 변경만)
   - **Apex Test**: Default
5. **Pre-Promotion 자동 테스트**: Promote 를 누르면 SIT 에 배정한 Test Suite (Step 9.6)가 자동 실행됩니다. 통과해야 프로모션 완료, 품질 게이트 실패 시 차단. 진행/결과는 **Tests 탭** 또는 **Activity History** 에서 확인.
   - 실패하면 원인 수정 → 재커밋 (Lab 9.5) → 다시 Promote. (테스트 미배정/Suite 0 이면 이 자동 검증 없이 진행 — Step 9.6)
6. **SIT 에서 통합 테스트**: `sf org open -o DH-SIT` 또는 **Open Environment** 로 SIT 를 열어 모듈 간 동작을 확인하고, Playwright 를 SIT 대상으로 재실행 (테스터 수동):

   ```powershell
   $env:SF_TARGET_ORG = "DH-SIT"

   # SIT 세션 저장 (처음/만료 시)
   node tests/e2e/global-setup.mjs

   $env:SF_INSTANCE_URL = (sf org display -o DH-SIT --json | ConvertFrom-Json).result.instanceUrl
   npx playwright test
   ```

> 💡 **머지 충돌이 나면**: Step 4.5 에서 Agentforce Vibes Org 를 설정했으면 **Resolve with Agentforce** 로 해결, 미설정이면 로컬에서 수동 병합 (git) 후 재프로모트합니다.

### Step 12.2 — UAT 로 프로모트 (수용 테스트)

1. SIT 검증이 끝난 Work Item 을 **UAT 단계로 Promote Selected**.
2. (최초 1회) UAT 환경 로그인 = DH-UAT → **Allow** → **Promote**.
3. **Pre-Promotion 자동 테스트**: UAT 에 배정한 Test Suite (Step 9.6)가 자동 실행되고, 통과해야 UAT 로 승격됩니다 (실패 시 차단). 결과는 **Tests 탭 / Activity History**.
4. **UAT 에서 수용 테스트 (고객 · 사용자 관점)**: `sf org open -o DH-UAT` 또는 **Open Environment** 로 UAT 를 열어 부록 D 기능/UI 체크리스트로 점검 + Playwright 를 UAT 대상으로 재실행:

   ```powershell
   $env:SF_TARGET_ORG = "DH-UAT"
   node tests/e2e/global-setup.mjs
   $env:SF_INSTANCE_URL = (sf org display -o DH-UAT --json | ConvertFrom-Json).result.instanceUrl
   npx playwright test
   ```

5. 미충족 · 개선 항목은 고객 피드백으로 정리 → Lab 13.4 / Cheatsheet STEP 7 의 세 번째 프롬프트로 문서 · 코드에 반영 (반복).

### Step 12.3 — PROD 릴리스 (Production 으로 Promote)

UAT 수용 검증이 끝난 Work Item 을 Production 단계로 Promote 해 릴리스합니다. **PROD = Hub(DE) 조직**. Production 은 파이프라인의 마지막 · 최고위험 단계이므로 Pre-Promotion 품질 게이트가 가장 엄격하게 적용됩니다.

> 💡 **참고**: validate-only (검증 전용) 배포 + Quick Deploy 2단계 방식은 DevOps Center **관리형 패키지 (Managed Package)** 에서만 제공됩니다 (공식 가이드 명시). Next Generation DevOps Center 에서는 지원되지 않으며, 아래 표준 Promote 절차로 릴리스합니다.

1. UAT 검증이 끝난 Work Item 을 선택 → **Promote Selected** → Production 단계로 Promote.
2. (최초 1회) **Production 환경 로그인** = Hub(DE) 조직 (관리자 계정) → **Allow**.
3. **Promotion Options** 확인 → **Promote**:
   - **Changes**: "Changes not in Production's branch" (권장)
   - **Apex Test**: **Run all tests** 권장 (Production 에서는 Default 도 모든 local 테스트를 실행 — 커버리지 75%↑ · 전체 통과 필요)
4. **Pre-Promotion 자동 테스트**: Production 에 배정한 Test Suite 가 자동 실행되고, 품질 게이트를 통과해야 배포가 완료됩니다 (실패 시 차단). 결과는 **Tests 탭 / Activity History**.
5. **Open Environment** (Hub/PROD)에서 매물 앱이 최종적으로 잘 뜨는지 **스모크 테스트** (핵심 흐름 빠른 점검).

**자주 막히는 점 (Lab 12)**

| 증상 | 원인 · 조치 |
|---|---|
| Promote 버튼 비활성/실패 | 파이프라인 Active · WI Ready to Promote 인지 · 메타데이터 충돌 확인 |
| Pre-Promotion 테스트 실패로 차단 | **Tests 탭 / Activity History** 에서 원인 확인 → 코드 수정 · 재커밋 (Lab 9.5) · 재프로모트 |
| 머지 충돌 | Resolve with Agentforce (4.5 설정 시) 또는 수동 병합 후 재프로모트 |
| validate-only / Quick Deploy 메뉴가 안 보임 | Next Gen 에는 없음 (관리형 패키지 전용) → 표준 Promote 절차로 진행 |
| 환경 로그인/연결 실패 | `sf org open -o DH-XXX` 로 접근 확인 · 비밀번호 재생성 (`sf org generate password`) |

> ✅ **Lab 12 완료 기준**: SIT 통합 + UAT 수용 · E2E 검증 (Pre-Promotion 자동 테스트 통과) + PROD Promote 릴리스 성공 + 스모크 테스트.

---

## Lab 13. 산출물 정리 & 마무리

프로젝트 산출물을 정리 · 패키징하고 추적성을 확인합니다.

### Step 13.1 — 산출물 인덱스 작성 (Cheatsheet STEP 12)

`docs/DELIVERABLES.md` 를 만들어 산출물 목록을 정리합니다 (documentation_writer 에이전트).

```text
이 작업은 .claude/agents/ 의 documentation_writer 에이전트로 진행해줘.
저장소의 산출물을 docs/DELIVERABLES.md 로 정리해줘 — 각 항목에 경로·설명·상태(완료/진행).
그리고 추적성 매트릭스(REQ-nnn → AC-nnn → WI-1.nnn → tests/e2e/*.spec.ts → 테스터 실행 결과)를 표로 생성해줘.
```

| 산출물 | 경로 |
|---|---|
| 요구사항 | `docs/REQUIREMENT.md` |
| Phase 0 — FIT/GAP/NUD | `docs/phase-0/FIT-GAP-NUD.md` |
| Phase 0 — 인수기준 (AC) | `docs/phase-0/ACCEPTANCE-CRITERIA.md` |
| 프로젝트 계획 | `docs/PROJECT-PLAN.md` |
| 단계 계획 | `docs/phases/PHASE-PLAN-01.md` |
| 워크아이템 | `docs/work-items/WI-1.*.md` |
| 목업 산출물 | `docs/mockup/*` |
| 소스 코드 | `force-app/**` |
| E2E 테스트 (스펙) | `tests/e2e/*.spec.ts`, `playwright.config.ts` |
| 테스트 결과 리포트 | `playwright-report/` (테스터 실행) + 결과 표 |
| 추적성 매트릭스 | `docs/DELIVERABLES.md` |
| 릴리스 | DevOps Center v1.0-sprint1 |

### Step 13.2 — 추적성 검증

- REQ → AC → WI → spec → 테스터 실행 결과 사슬이 끊김 없이 연결되는지 `docs/DELIVERABLES.md` 매트릭스로 확인.
- 부록 D 체크리스트로 기능/UI 를 최종 점검 (미충족은 STEP 7 의 세 번째 프롬프트로 ENHANCE/ADD).

### Step 13.3 — 릴리스 태그 & 회고 & 정리

```powershell
git tag v1.0-sprint1 ; git push origin v1.0-sprint1
```

회고 (잘된 점/막힌 점/개선) 정리.

Scratch Org 정리 (학습 종료 시):

```powershell
sf org delete scratch -o DH-DEV --no-prompt
sf org delete scratch -o DH-SIT --no-prompt
sf org delete scratch -o DH-UAT --no-prompt
```

### Step 13.4 — (선택) 피드백 반복 사이클

부록 D 점검 결과를 고객 피드백으로 간주해 [Cheatsheet_for_ProjectManager.md](Cheatsheet_for_ProjectManager.md) STEP 7 의 세 번째 프롬프트로 문서를 갱신 (코드네임 유지)하고, 갱신된 WI 를 Lab 8~12 로 재개발하면 한 사이클이 완성됩니다.

> ✅ **Lab 13 완료 기준**: DELIVERABLES.md (추적성 매트릭스) + 릴리스 태그 + 정리.

---

## 부록 A. 자주 막히는 지점 (Troubleshooting)

| 증상 | 조치 |
|---|---|
| DevOps Center 토글이 안 보임 | Hub (DE/Production) 인지 확인 (Scratch/Sandbox 불가) · SysAdmin/DevOps Center Admin 권한 |
| GitHub 저장소가 안 보임 | Connect to Version Control 재인증 · 조직 소유 repo 는 OAuth 승인 |
| 환경 연결 (로그인) 실패 | `sf org generate password` 재생성 · `sf org open` 접근 확인 · Instance URL 정확히 |
| Scratch Org 만료/한도 (3개) | 새로 생성 (`-d 30`) 후 환경 재연결 · 안 쓰는 오그 `sf org delete scratch` |
| 변경사항이 DX Inspector 에 안 보임 | 올바른 DEV 오그 · Source Tracking · 새로고침 · 올바른 Work Item 연결 |
| Playwright 로그인 실패/빈 화면 | global-setup 의 frontdoor sid 만료 → 재생성 · `SF_INSTANCE_URL` 정확히 · 헤드리스 타임아웃↑ |
| Playwright 가 카드/요소를 못 찾음 | 컴포넌트에 안정적 `data-testid` 부여 · 로딩 완료 대기 (`await expect(...).toBeVisible()`) · 선택자 점검 |
| Promote 실패 | 파이프라인 Active · WI Ready to Promote · 메타데이터 충돌 (Agentforce) |
| Pre-Promotion 테스트 실패로 Promote 차단 | **Tests 탭 / Activity History** 에서 원인 확인 → 수정 · 재커밋 (9.5) · 재프로모트 (validate-only/Quick Deploy 는 Next Gen 미지원) |

---

## 부록 B. CLI 빠른 참조

```powershell
git clone https://github.com/<owner>/dreamhouse-lite.git   # 최초 1회 (프로젝트 베이스)
git checkout main ; git pull                        # ★ 작업 시작 전 항상 최신화
sf org login web --set-default-dev-hub -a DH-HUB     # Dev Hub 인증
sf org create scratch -f config/project-scratch-def.json -a DH-DEV --duration-days 30 --set-default
sf org generate password -o DH-DEV                   # 환경 연결용 비번
sf org open -o DH-DEV
sf project deploy start                              # 로컬 → 오그 배포
sf apex run test -l RunLocalTests -c -r human        # Apex 테스트 + 커버리지
sf code-analyzer run --view table                    # 정적분석
npx playwright test                                  # E2E 테스트
git fetch origin ; git checkout WI-1.001             # Feature Branch
```

---

## 부록 C. 1인 진행 체크리스트

| 구분 | 체크 항목 |
|---|---|
| 환경 | ☐ DE 가입 · Dev Hub On · CLI 인증 ☐ 저장소 clone + DX 프로젝트 push(main) ☐ (작업 전 항상 git pull) |
| 설정 | ☐ DevOps Center Enabled ☐ 권한 세트 4종 ☐ GitHub 연결 |
| 오그 | ☐ DH-DEV/SIT/UAT 3개 생성 · 비번 (활성 3개 = 한도) |
| 파이프라인 | ☐ Pipeline 생성 · 환경 (DEV/SIT/UAT/PROD) · 브랜치 (sit/uat/main) · Activate ☐ Project 연결 ☐ (선택) Tests |
| 산출물 | ☐ REQUIREMENT ☐ Phase0 (FIT/GAP/NUD · AC) ☐ PROJECT-PLAN (선행 · 분류) ☐ PHASE-PLAN ☐ WI 5종 ☐ main 푸시 |
| 목업 | ☐ 목업 문서 · UI ☐ 협의 · 반복 ☐ 본 문서 반영 · 코드 병합 |
| 실행 | ☐ WI 등록 ☐ 개발 · DX Inspector 커밋 |
| 테스트 | ☐ Playwright spec (AC 기반) ☐ 테스터 E2E 실행 (DEV/SIT/UAT) · 결과 기록 |
| 배포 | ☐ PR 검토 · 머지 · Ready ☐ SIT (통합+E2E) ☐ UAT (수용+E2E) ☐ PROD (Promote 릴리스) |
| 산출물 정리 | ☐ DELIVERABLES.md · 추적성 ☐ 릴리스 태그 ☐ Scratch Org 삭제 |

---

## 부록 D. DreamHouse 기능 / UI 체크리스트 (피드백 · 수용 점검용)

**사용법**: 완성된 앱 (목업/SIT/PROD)을 이 체크리스트로 ☐/채점 → 미충족 항목을 "고객 피드백"으로 변환 → STEP 7 의 세 번째 프롬프트 (DROP/ENHANCE/ADD)로 문서 갱신 → 재개발.

**표기**: `[P1]` = Phase 1 기본 (실습 범위) · `[S]` = Stretch (피드백으로 추가 권장).

### D.1 데이터 모델 — Property__c (WI-1.001)

- [ ] [P1] Property__c 커스텀 오브젝트 생성
- [ ] [P1] Name (텍스트) / Address__c / City__c / State__c (텍스트)
- [ ] [P1] Price__c (통화)
- [ ] [P1] Bedrooms__c / Bathrooms__c (숫자)
- [ ] [P1] Picture_URL__c (URL)
- [ ] [P1] Status__c (선택목록: Available / Under Contract / Sold)
- [ ] [S] Description__c (롱텍스트) / Date_Listed__c (날짜)
- [ ] [S] Location (지오로케이션) — 지도용 위/경도

### D.2 매물 목록 / 타일 카드 (WI-1.002, WI-1.003)

- [ ] [P1] 매물이 카드 (타일) 형태로 목록 표시
- [ ] [P1] 카드에 사진 (Picture_URL) 표시
- [ ] [P1] 카드에 가격 (통화 형식) 표시
- [ ] [P1] 카드에 주소/도시 표시
- [ ] [P1] 카드에 침실/욕실 수 (아이콘) 표시
- [ ] [P1] 빈 목록일 때 안내 메시지
- [ ] [S] 카드에 상태 배지 (Available=초록 / Sold=회색 등)
- [ ] [S] 결과 건수 표시 / 페이지네이션
- [ ] [S] 카드 클릭 시 상세로 이동

### D.3 검색 / 필터 (WI-1.004)

- [ ] [P1] 키워드 (이름/도시) 검색
- [ ] [P1] 가격 범위 필터 (슬라이더 또는 min/max)
- [ ] [P1] 침실 수 (최소) 필터
- [ ] [P1] 필터 변경 시 목록 실시간 갱신 (`@wire` + debounce)
- [ ] [S] 욕실 수 필터 / 상태 필터
- [ ] [S] 필터 초기화 버튼

### D.4 매물 상세 (WI-1.005)

- [ ] [P1] 상세 화면에 전체 필드 표시
- [ ] [P1] 큰 사진 표시
- [ ] [S] 이미지 캐러셀 / 위치 지도 / 유사 매물

### D.5 앱 / 페이지 구성 & 네비게이션 (WI-1.005)

- [ ] [P1] Lightning App (또는 App Page)에 목록 · 검색 배치
- [ ] [P1] 앱 네비게이션에서 접근 가능
- [ ] [S] 매물 레코드 페이지 커스텀 컴포넌트 / 홈 위젯

### D.6 데이터 / 품질

- [ ] [P1] 샘플 매물 데이터 5~10건 적재
- [ ] [P1] Apex 컨트롤러 단위 테스트 (커버리지 75%↑)
- [ ] [P1] Code Analyzer High 이상 0건
- [ ] [P1] with sharing · CRUD/FLS 고려
- [ ] [P1] Playwright E2E (AC 기반) 통과
- [ ] [S] LWC Jest 테스트

### D.7 UI / UX

- [ ] [P1] SLDS 일관된 스타일 / 로딩 스피너 / 에러 토스트 / 모바일 반응형
- [ ] [S] 접근성 (라벨 · 대비) / 다국어

### D.8 Stretch — 피드백으로 추가 권장 (ADD)

- [ ] [S] 매물 지도 보기 (lightning-map) · 중개인 (Broker__c) · 가격대 차트 · 즐겨찾기

### D.9 체크리스트 → 피드백 변환 규칙

| 점검 결과 | 변환 액션 | 예시 |
|---|---|---|
| [P1] 인데 미구현/부실 | ENHANCE (기존 WI 보강) | 상태 배지 미표시 → ENHANCE WI-1.002 |
| 잘못됐거나 불필요 | DROP (취소선+사유, ID 유지) | 침실 필터 미사용 → DROP/ENHANCE WI-1.004 |
| [S] 신규 요청 | ADD (다음 번호 WI-1.006~) | 지도 보기 → ADD WI-1.006 |

→ 변환한 결정사항으로 STEP 7 의 세 번째 프롬프트를 실행하고, 갱신된 WI 를 Lab 8~12 로 재개발하면 한 사이클이 완성됩니다.

---

## 관련 자료

- **동영상 가이드**: Video_Script_Training_Lab.md — 본 교재 순서에 맞춘 촬영 스크립트
- **프롬프트**: [Cheatsheet_for_ProjectManager.md](Cheatsheet_for_ProjectManager.md) (STEP 1~13) · Cheatsheet_for_DX_Developer.md
- **절차 상세**: 02 Setup (02-Salesforce_AI_DevOps_Center_Setup.md) · 03 StepByStep (03-Salesforce_AI_DevOps_Center_StepByStep.md) · 04 DevOps Testing (04-Salesforce_AI_DevOps_Testing.md)
- **역할 가이드**: PM · RM · Developer · QA
- **도구 설치**: [Setup_Developer_Environment.md](Setup_Developer_Environment.md) · install-Windows11.md

> ⚠ 차세대 DevOps Center · DX Inspector · Agentforce · Code Analyzer v5 (Beta) 등은 릴리스마다 UI/절차가 바뀔 수 있습니다. Scratch Org 기반 파이프라인은 학습용이며, 실제 운영은 Sandbox 를 사용하세요.

문서 기준: 2026년 5월 · Next Generation DevOps Center · Dev Hub + Scratch Org · Claude (.claude/agents) AI 코딩 · Playwright E2E · 1인 핸즈온
