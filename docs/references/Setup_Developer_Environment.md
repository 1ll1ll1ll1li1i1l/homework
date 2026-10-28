# Salesforce 개발 환경 구성 가이드 (Windows 11)

> 원본: Salesforce 개발 환경 구성 가이드2.docx (Markdown 변환본)

본 문서는 Windows 11 + PowerShell 7 환경에서 Salesforce 개발에 필요한 모든 도구를 완전 초보자도 순서대로 따라 할 수 있도록 설명합니다. Salesforce 공식 문서를 기준으로 최신 버전(2026)에 맞춰 작성되었습니다.

**설치 도구**: PowerShell 7 · Git · JDK 21 LTS · Node.js 22 LTS · VS Code + Salesforce Extension Pack (Expanded) · Apex PMD · Salesforce CLI(npm) + Code Analyzer · Claude Code(CLI + VS Code 확장)

**이 문서의 표기 규칙**

- 명령어 회색 박스 = PowerShell 터미널에 입력하는 명령입니다.
- 이미지(`![...](...)`)는 캡처가 필요한 화면의 자리(파일명)입니다. 바로 아래 설명에 위치와 담을 내용을 적었습니다.
- ⚠ = 반드시 지켜야 하는 주의사항, 💡 = 도움말.

---

## 0. 시작하기 전에 (기초 + PowerShell 7)

### 0.1 PowerShell 여는 법

1. 작업 표시줄의 시작(⊞) 버튼을 마우스 오른쪽 클릭
2. 터미널(관리자) 클릭 — 환경 변수·전역 설치 시 권한 문제가 줄어듭니다.

> ⚠ 명령 프롬프트(CMD)가 아니라 PowerShell인지 확인하세요. 프롬프트가 `PS C:\Users\...>` 처럼 PS로 시작하면 PowerShell입니다.

### 0.2 PowerShell 7 설치

Windows 11에는 기본 Windows PowerShell 5.1이 있지만, 최신 기능·성능을 위해 PowerShell 7을 설치합니다.

- 설치 파일: https://github.com/PowerShell/PowerShell/releases/latest 에서 `PowerShell-7.x.x-win-x64.msi` 를 내려받아 설치합니다.
- 설치 후 터미널을 닫았다가 다시 열고, 새 탭 드롭다운(⌄)에서 PowerShell(7)을 선택하거나, 시작 메뉴에서 PowerShell 7을 실행합니다.

확인:

```powershell
pwsh --version
```

PowerShell 7.x.x 가 표시되면 성공입니다. (이후 모든 명령은 PowerShell 7에서 실행하세요.)

> 💡 (선택) Windows Terminal 기본 프로파일을 PowerShell 7로: 터미널 상단 드롭다운(⌄) → 설정 → 시작 → 기본 프로필을 PowerShell(7)로 변경.

### 0.3 꼭 기억할 규칙

> ⚠ 설치 경로에 공백/한글이 없도록 하세요. 특히 JDK는 경로에 공백이 있으면 VS Code의 Apex 기능이 오작동할 수 있습니다. 이 문서는 도구 일부를 `C:\Utils\` 아래에 설치합니다. (예: `C:\Utils\Zulu21`)

> ⚠ 각 도구 설치 후에는 터미널(또는 PC)을 다시 시작해야 PATH(환경 변수)가 반영됩니다.

### 0.4 전체 설치 순서

① PowerShell 7 → ② Git → ③ JDK 21 → ④ Node.js 22 → ⑤ VS Code → ⑥ VS Code 확장(Extension Pack + Apex PMD) → ⑦ Salesforce CLI(npm) + Code Analyzer → ⑧ Claude Code(CLI + 확장) → ⑨ VS Code 설정 → ⑩ 검증

---

## 1. Git 설치

Git은 소스 코드 버전 관리 도구이며, Salesforce CLI·DevOps Center·Claude Code 모두에서 사용됩니다.

1. **다운로드**: https://git-scm.com/download/win → 64-bit Git for Windows Setup 클릭
2. **설치 마법사 진행** — 대부분 기본값(Next)으로 두면 됩니다.
   - 설치 위치는 가급적 아래 그림처럼 `C:\Utils\Git` 을 지정하는게 좋습니다.
   - "Adjusting your PATH environment" 화면에서는 기본값(Git from the command line and also from 3rd-party software) 유지
   - 기본 에디터는 Visual Studio Code를 선택해도 됩니다.
3. **설치 확인** — PowerShell을 새로 열고:

   ```powershell
   git --version
   ```

   git version 2.x.x 가 표시되면 성공입니다.

> 💡 Git for Windows를 설치하면 Claude Code가 더 나은 Bash 호환 환경(Git Bash)을 사용할 수 있습니다.

---

## 2. JDK 21 LTS 설치 (Azul Zulu)

JDK는 VS Code의 Apex 언어 지원, Apex PMD, Salesforce Code Analyzer(PMD/Graph 엔진)에서 사용됩니다. 본 가이드는 Azul Zulu OpenJDK 21 LTS를 사용합니다.

1. **다운로드**: https://www.azul.com/downloads/?version=java-21-lts&os=windows&architecture=x86-64-bit&package=jdk#zulu
   - Java 21 (LTS), Windows, x86 64-bit, 패키지 JDK, 형식 .zip (또는 .msi) 선택
2. **설치 (권장: zip 압축 해제 방식)**
   - 다운로드한 zip을 풀어 `C:\Utils\Zulu21` 폴더에 둡니다.
   - 최종적으로 `C:\Utils\Zulu21\bin\java.exe` 가 존재해야 합니다.

   > ⚠ `C:\Program Files\...`(공백 포함)에는 두지 마세요.

3. **환경 변수 등록 (JAVA_HOME + PATH)**
   - 시작 → 설정 → 시스템 클릭 → 정보 → 고급 시스탬 설정 클릭
   - 시스템 변수에서 새로 만들기: 이름 `JAVA_HOME`, 값 `C:\Utils\Zulu21`
   - 사용자 변수의 Path → 편집 → 새로 만들기 → `C:\Utils\Zulu21\bin` 추가
4. **확인** — PowerShell을 새로 열고:

   ```powershell
   java -version
   echo $env:JAVA_HOME
   ```

   `openjdk version "21..."` 와 `C:\Utils\Zulu21` 가 출력되면 성공입니다.

---

## 3. Node.js 22 LTS 설치

Node.js는 Salesforce CLI(npm 설치)와 LWC 개발에 필요합니다. 22 LTS를 사용합니다.

1. **다운로드**: https://nodejs.org/en/download → LTS / Windows Installer (.msi) / x64 (버전이 v22.x.x (LTS)인지 확인)
2. **설치** — 대부분 기본값(Next)으로 진행
   - 설치 위치는 `C:\Utils\NodeJS` 를 지정을 합니다.
   - "Add to PATH" 옵션은 기본 체크 유지
3. **PowerShell에서 npm 실행 권한을 부여해야합니다.** PowerShell을 열고

   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

4. **확인** — PowerShell을 새로 열고:

   ```powershell
   node --version
   npm --version
   ```

   v22.x.x / 10.x.x 가 표시되면 성공입니다.

> 💡 Salesforce CLI를 npm으로 설치하려면 Node.js 20 이상이 필요합니다. 22 LTS면 충분합니다.

---

## 4. Visual Studio Code 설치

1. **다운로드**: https://code.visualstudio.com/Download → Windows (User Installer 64-bit)
2. **설치** — 마법사에서 아래 옵션을 체크하면 편합니다.
   - 설치 위치는 `C:\Utils\Code` 를 지정을 합니다.
   - "Add 'Open with Code' action to ... context menu" (탐색기 우클릭으로 폴더 열기)
   - "Add to PATH" (기본 체크)
3. **확인** — PowerShell에서:

   ```powershell
   code --version
   ```

---

## 5. VS Code 확장(Extension) 설치

VS Code를 실행하고 왼쪽 확장(Extensions) 아이콘(Ctrl+Shift+X)을 클릭합니다.

### 5.1 Salesforce Extension Pack (Expanded) 설치

검색창에 **Salesforce Extension Pack (Expanded)** 를 입력하고 Install을 클릭합니다. 이 확장 팩은 기본 Salesforce Extension Pack + 커뮤니티 확장을 한 번에 설치합니다(여러 개라 시간이 조금 걸립니다).

#### ① 기본 Salesforce Extension Pack에 포함된 확장 (Publisher: Salesforce)

| 확장 | 설명 |
|---|---|
| Salesforce CLI Integration | VS Code가 Salesforce CLI와 연동되어 핵심 기능을 제공 |
| Agentforce DX | Agentforce 에이전트 개발 도구 (구문 강조 등) |
| Apex | Apex Language Server 기반 구문 강조·자동 완성 |
| Apex Testing(Apex Interactive) | Apex 테스트 실행·관리 |
| Apex OpenAPI Specification | Apex용 OpenAPI 스펙 지원 |
| Salesforce Apex Log | Apex 디버그 로그 보기·분석 |
| Apex Replay Debugger | 디버그 로그를 재생하며 디버깅 |
| Lightning Web Components | LWC 번들 개발 지원 |
| Aura Components | Aura 컴포넌트 번들 지원 |
| Salesforce Org Management | 조직 연결·전환 관리 |
| Visualforce | Visualforce 페이지·컴포넌트 지원 |
| Salesforce Metadata | 메타데이터 작업 지원 |
| Salesforce Services | 다른 Salesforce 확장이 쓰는 공통 서비스 |
| SOQL | 폼 기반 비주얼 에디터로 SOQL 쿼리 작성 |
| Salesforce Org Browser | 조직의 메타데이터 조회·내려받기 |
| SLDS Validator | Salesforce Lightning Design System 토큰/유틸 클래스 검증 |
| Agentforce Vibes | 생성형 AI 기반 코드 생성·자동 완성·테스트 생성 |

#### ② Expanded가 추가로 설치하는 커뮤니티 확장

| 확장 | Publisher | 설명 |
|---|---|---|
| Apex Log Analyzer | FinancialForce(Certinia) | Salesforce 디버그 로그 성능 분석을 쉽고 빠르게 |
| Prettier - Code formatter | Prettier | 코드 자동 포맷터 (일관된 스타일 유지) |
| XML | Red Hat | XML 문서 작성·편집 지원 (메타데이터 XML 편집에 유용) |
| GraphQL: Syntax Highlighting | GraphQL Foundation | GraphQL 파일 구문 강조 |
| Salesforce Code Analyzer | Salesforce | 에디터 내에서 Code Analyzer로 코드 분석 (아래 6장 CLI와 연동) |

> 💡 확장 팩 구성은 버전에 따라 바뀔 수 있습니다. 최신 목록은 마켓플레이스 페이지에서 확인하세요. (Salesforce Extension Pack · Expanded)

> ⚠ 설치 후 "Salesforce Extension Pack을 설치하라"는 Recommended 알림이 계속 뜰 수 있습니다. 무시하면 반복되므로 함께 설치하세요.

### 5.2 Apex PMD 확장 설치

정적 분석(코드 품질 검사)을 저장 시 자동으로 수행하는 확장입니다.

1. Extensions 검색창에 **Apex PMD** 입력 → Charlie Jonas가 만든 Apex PMD 설치
2. **특징**
   - PMD가 확장에 내장되어 있어 별도로 PMD를 내려받지 않아도 됩니다. 단, JRE(=JDK)가 필요합니다 → 2장에서 설치한 JDK 21이 이 요건을 충족합니다.
   - 주요 설정: `apexPMD.rulesets`(사용자 룰셋), `apexPMD.runOnFileSave`(저장 시 분석), `apexPMD.pmdBinPath`(PMD 위치 직접 지정, 보통 불필요)
   - 실행: Ctrl+Shift+P → "Apex PMD" 명령으로 파일/워크스페이스 분석

> ⚠ Apex PMD 최신 버전은 PMD 7 기준입니다. 예전 PMD 6.x 룰셋(XML)은 호환되지 않을 수 있으니, 사용자 룰셋 없이 기본 룰셋으로 시작하길 권장합니다.

> 💡 **Apex PMD vs Code Analyzer**: Apex PMD는 에디터에서 빠른 PMD 검사에 좋고, Salesforce Code Analyzer(6장)는 CLI/CI에서 Apex·LWC·Flow 등 통합 분석에 사용합니다. 둘은 상호 보완적입니다.

> 💡 **Note**: Apex PMD의 검사 리포트를 작성하는 절차가 필요하다면 https://pmd.github.io 사이트에서 7.x (Latest) 버전을 다운로드하여 `C:\Utils\PMD` 폴더에 압축을 풀고 위의 Zulu21 JDK 환경 변수 설정 방법을 참고하여, `C:\Utils\PMD\bin` 을 PATH 환경 변수에 추가하도록 합니다. PowerShell 터미널에서 `pmd.bat --version` 으로 확인하시면 됩니다.

---

## 6. Salesforce CLI 설치 (npm) + Code Analyzer

### 6.1 Salesforce CLI 설치 (npm 방식)

공식 사이트에서 배포하는 도구의 경우, update가 정상적으로 동작하지않는 경험으로인하여, 여기서는 Salesforce Cli 공식 배포사이트에서 제공하는 도구가 아닌 npm으로 설치하는 도구를 사용합니다.

PowerShell에서 아래를 실행합니다(3장의 Node.js가 설치되어 있어야 합니다).

```powershell
npm install --global @salesforce/cli
```

설치 확인:

```powershell
sf --version
```

`@salesforce/cli/2.x.x ...` 형식이 표시되면 성공입니다.

> 💡 **업데이트**: Salesforce CLI는 자주 갱신됩니다. 정기적으로 `npm update --global @salesforce/cli` 로 업데이트하세요.

### 6.2 Code Analyzer 플러그인 설치

Salesforce Code Analyzer(PMD/ESLint/Flow 등 통합 분석)를 CLI 플러그인으로 설치합니다.

```powershell
sf plugins install code-analyzer
```

확인:

```powershell
sf plugins
sf code-analyzer rules --help
```

기본 사용 예:

```powershell
# 현재 프로젝트(force-app)를 분석해 표로 출력
sf code-analyzer run --workspace . --view table

# 결과를 파일로 저장
sf code-analyzer run --workspace . --output-file results.html
```

> 💡 Code Analyzer의 PMD·Graph 엔진은 JDK 11+가 필요합니다 → 2장의 JDK 21로 충족됩니다.

> ⚠ Salesforce Code Analyzer v5는 Beta 단계로 명령·옵션이 바뀔 수 있습니다. 최신 사용법은 공식 문서를 확인하세요.

---

## 7. Claude Code 설치 (CLI + VS Code 확장)

Claude Code는 터미널·VS Code에서 동작하는 AI 코딩 도구입니다. npm이 아니라 공식 설치 스크립트(최신 버전)로 설치합니다.

### 7.1 Claude Code CLI 설치

#### 방법 A — Windows 네이티브 (PowerShell, 권장)

```powershell
irm https://claude.ai/install.ps1 | iex
```

관리자 권한 없이 실행 가능합니다.

> ⚠ `install.sh` 는 Bash 전용(Git Bash·WSL·macOS·Linux)입니다. Windows PowerShell에서는 위의 `install.ps1` 을 사용하세요.

**PATH에 claude 폴더 등록**

- 시작 → 설정 → 시스템 클릭 → 정보 → 고급 시스탬 설정 클릭
- 사용자 변수의 Path → 편집 → 새로 만들기 → `%USERPROFILE%\.local\bin` 추가

#### 방법 B — Git Bash / WSL 사용 시 (install.sh)

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

1장에서 Git for Windows를 설치했다면 Git Bash를 열어 위 명령을 실행할 수 있습니다. WSL(Ubuntu 등)을 쓰면 WSL 터미널에서 실행합니다.

설치 확인(터미널을 새로 연 뒤):

```powershell
claude --version
claude doctor
```

> 💡 **업데이트**: 네이티브 설치는 자동 업데이트됩니다. 필요 시 `claude update` 로 수동 업데이트할 수 있습니다.

### 7.2 첫 실행 & 로그인

```powershell
claude
```

- 기본 브라우저가 열리며 Anthropic 로그인 페이지가 나타납니다. (브라우저가 안 열리면 안내된 URL을 복사)
- Claude Pro/Max 구독 계정으로 로그인하면 API 키 없이 사용할 수 있습니다. (또는 Console API 키 사용)

> 💡 계정을 바꾸려면 세션에서 `/login` 을 입력합니다.

### 7.3 Claude Code VS Code 확장

- **확장 이름**: Claude Code (Publisher: Anthropic, `anthropic.claude-code`)
- **설치**: Extensions(Ctrl+Shift+X)에서 "Claude Code" 검색 → Install
- 또는 VS Code 통합 터미널(Ctrl+`)에서 `claude` 를 실행하면 확장이 설치된 경우 자동 연결됩니다.

설치 후 편집기 우측 상단의 아이콘(또는 하단 상태바의 ✱ Claude Code)을 클릭해 시작합니다.

---

## 8. VS Code 설정 (settings.json)

설치한 도구들이 VS Code에서 잘 동작하도록 설정합니다.

1. Ctrl+Shift+P → "Preferences: Open User Settings (JSON)" 입력 → 엔터
2. 열린 settings.json에 아래 내용을 참고해 추가/수정합니다.

```json
{
  // ── Apex(언어 서버) JDK 경로 — 2장에서 설치한 JDK 21 ──
  "salesforcedx-vscode-apex.java.home": "C:\\Utils\\Zulu21",

  // ── Git 실행 파일 경로 (기본 설치 시) ──
  "git.path": "C:\\Utils\\Git\\cmd\\git.exe",

  // ── Apex PMD ──
  "apexPMD.runOnFileSave": true,
  // (선택) 사용자 룰셋을 쓸 때만 — PMD 7 형식이어야 함
  // "apexPMD.rulesets": ["C:\\Utils\\pmd-ruleset.xml"],

  // ── Salesforce Core ──
  "salesforcedx-vscode-core.detectConflictsAtSync": true,
  "salesforcedx-vscode-core.retrieve-test-code-coverage": true,

  // ── Prettier(기본 포맷터로 지정, 저장 시 포맷) ──
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,

  // ── 검색에서 제외 ──
  "search.exclude": {
    "**/node_modules": true,
    "**/.sfdx": true,
    "**/.sf": true
  }
}
```

> ⚠ JSON에서 Windows 경로는 역슬래시를 두 번(`\\`) 써야 합니다. Git을 다른 경로에 설치했다면 `git.path` 를 실제 경로로 바꾸세요. (PowerShell에서 `Get-Command git | Select-Object Source` 로 확인)

### (선택) Apex 테스트 커버리지 보기

1. 테스트 클래스 상단의 **Run All Tests** 클릭
2. 실행 후 대상 클래스를 열고 화면 하단의 ☰(커버리지) 아이콘 클릭
3. 초록색 = 테스트가 지나간 코드, 빨간색 = 테스트가 닿지 않은 코드

---

## 9. 설치 검증 체크리스트

PowerShell을 새로 열고 아래를 모두 실행해 버전이 나오는지 확인하세요.

```powershell
pwsh --version        # PowerShell 7.x.x
git --version         # git version 2.x.x
java -version         # openjdk version "21..."
node --version        # v22.x.x
npm --version         # 10.x.x
code --version        # 1.9x.x
sf --version          # @salesforce/cli/2.x.x
sf plugins            # 목록에 code-analyzer 포함
claude --version      # x.x.x (Claude Code)
```

- [ ] PowerShell 7 설치 (기본 프로필 지정)
- [ ] Git 설치·PATH 확인
- [ ] JDK 21 + JAVA_HOME/PATH 설정
- [ ] Node.js 22 LTS
- [ ] VS Code 설치
- [ ] Salesforce Extension Pack (Expanded) — Apex/LWC/SOQL/Agentforce Vibes 등 설치
- [ ] Apex PMD 확장 설치 (저장 시 분석)
- [ ] Salesforce CLI(npm) + code-analyzer 플러그인
- [ ] Claude Code CLI(install.ps1) + 로그인 + VS Code 확장
- [ ] settings.json — apex java.home / git.path / Prettier / PMD 설정

### 9.1 도구 업데이트

위에서 설치된 도구들은 수시로 업데이트가 됩니다. 항상 최신 버전을 유지하기 위해서는 매일 PC를 부팅한 후에 아래의 명령을 실행하여 도구를 최신 상태로 유지하시기 바랍니다.

PowerShell 창을 열고,

```powershell
npm update -g
claude update
```

만약 Salesforce Cli를 공식 사이트에서 다운로드하여 설치하였다면,

```powershell
sf update
```

> ⚠ Java JDK와 Node JS는 자동으로 업데이트되지 않습니다. 공식 홈페이지에서 다운로드하여 설치프로그램을 실행하면 업데이트 할 수 있습니다.

---

## 10. 참고 자료 (공식 문서)

- **PowerShell 7**: 설치 가이드 · GitHub Releases
- **VS Code 확장**: Salesforce Extensions for VS Code · 추천 확장
- **Salesforce CLI**: 설치 가이드 · npm 플러그인
- **Code Analyzer**: CLI로 코드 분석
- **Apex PMD 확장**: Marketplace
- **JDK**: Azul Zulu 21 LTS
- **Node.js**: 22 LTS 다운로드
- **Claude Code**: 설치 문서 · VS Code 확장

> 💡 Salesforce Extension 팩 구성·Code Analyzer v5(Beta)·Claude Code 등은 버전에 따라 빠르게 바뀝니다. 실제 설치 시 위 공식 페이지에서 최신 절차를 확인하세요.
