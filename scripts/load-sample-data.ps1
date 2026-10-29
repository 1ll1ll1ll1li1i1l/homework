#Requires -Version 7
<#
.SYNOPSIS
  WI-1.002 (AC-007 / AC-008) — 샘플 매물 SD-01~SD-10 적재 (중복 방지) + 분포 확인.

.DESCRIPTION
  0) (M-1) Organization.IsSandbox / TrialExpirationDate 로 Scratch·Sandbox 여부를 확인, 아니면(PROD) 중단. 별칭 차단은 보조.
  1) 적재 전 SD-01~SD-10 매물명(Name)으로 기존 레코드 수를 확인한다.
     - 0건  → data/sample/property-plan.json 으로 적재
     - 10건 → 이미 적재됨, 적재를 건너뛴다(재실행해도 20건이 되지 않음)
     - 그 외 → 부분 적재 상태. 중단한다. scripts/apex/reset-sample-data.apex (SIT/UAT/DEV 전용) 실행 후 재시도
  2) SD-01~SD-10 이름 한정(L-7)으로 상태별 건수(6/2/2)·도시 고유값(7)·전체 건수(10)를 확인하고, 기대값과 다르면 exit 1.

.EXAMPLE
  pwsh -File scripts/load-sample-data.ps1 -TargetOrg DH-DEV
  pwsh -File scripts/load-sample-data.ps1 -TargetOrg DH-SIT      # Lab 12
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$TargetOrg,
    [switch]$VerifyOnly
)
$ErrorActionPreference = 'Stop'
# sf CLI 출력(한글 매물명·도시) 을 UTF-8 로 주고받기 (Windows 기본 코드페이지 949 대응)
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$root = Split-Path -Parent $PSScriptRoot
$plan = Join-Path $root 'data/sample/property-plan.json'

# (보조 가드) 별칭 차단 — 1차 가드는 아래 Organization 조회 (ENHANCED 2026-10-28: 코드 리뷰 M-1)
if ($TargetOrg -in @('DH-HUB', 'core')) {
    throw "DH-HUB(PROD) 적재는 이 스크립트 범위가 아닙니다 (I-08: 사용자 명시 승인 필요)."
}

$sdNames = @(
    '강남 래미안 아파트', '해운대 오션뷰', '판교 테크노 빌라', '마포 한강 오피스텔', '광교 호수 타운하우스',
    '둔산 센트럴 아파트', '제주 애월 전원주택', '송파 잠실 아파트', '송도 센트럴 오피스텔', '서면 스카이 빌라'
)
$nameList = ($sdNames | ForEach-Object { "'$_'" }) -join ','

function Invoke-Soql([string]$q) {
    $raw = sf data query -q $q -o $TargetOrg --json | Out-String
    $res = $raw | ConvertFrom-Json
    if ($res.status -ne 0) { throw "SOQL 실패: $q`n$raw" }
    return $res.result
}

# (1차 가드, M-1) 별칭과 무관하게 실제 오그 유형으로 PROD 차단 — reset-sample-data.apex 와 동일 규칙:
# Sandbox 가 아니고 TrialExpirationDate 도 없으면(= Scratch/Trial 아님) PROD 로 간주하고 중단
$org = (Invoke-Soql "SELECT IsSandbox, TrialExpirationDate FROM Organization LIMIT 1").records[0]
if ((-not $org.IsSandbox) -and [string]::IsNullOrEmpty([string]$org.TrialExpirationDate)) {
    throw "[$TargetOrg] Scratch/Sandbox 오그가 아닙니다 (IsSandbox=false, TrialExpirationDate 없음) — PROD 적재 금지 (I-08)."
}

$existing = (Invoke-Soql "SELECT COUNT() FROM Property__c WHERE Name IN ($nameList)").totalSize
Write-Host "[$TargetOrg] 기존 SD 레코드: $existing 건"

if (-not $VerifyOnly) {
    if ($existing -eq 0) {
        Write-Host "[$TargetOrg] 적재: sf data import tree --plan $plan"
        sf data import tree --plan $plan -o $TargetOrg
        if ($LASTEXITCODE -ne 0) { throw "sf data import tree 실패 (exit $LASTEXITCODE)" }
    } elseif ($existing -eq $sdNames.Count) {
        Write-Host "[$TargetOrg] SD-01~SD-10 이미 적재됨 → 적재 건너뜀 (중복 방지, AC-008)"
    } else {
        throw "[$TargetOrg] 부분 적재 상태($existing 건). scripts/apex/reset-sample-data.apex 실행 후 재시도하세요."
    }
}

# --- 분포 확인 (AC-007) ---
# (ENHANCED 2026-10-28: 코드 리뷰 L-7) SD-01~SD-10 이름으로 한정 — 테스트/수동 생성 레코드가 있어도 분포 판정이 흔들리지 않음
$sdFilter = "WHERE Name IN ($nameList)"
$total = (Invoke-Soql "SELECT COUNT() FROM Property__c $sdFilter").totalSize
$byStatus = @{}
foreach ($r in (Invoke-Soql "SELECT Status__c s, COUNT(Id) c FROM Property__c $sdFilter GROUP BY Status__c").records) { $byStatus[$r.s] = [int]$r.c }
$byCity = @{}
foreach ($r in (Invoke-Soql "SELECT City__c ci, COUNT(Id) c FROM Property__c $sdFilter GROUP BY City__c").records) { $byCity[$r.ci] = [int]$r.c }

Write-Host "[$TargetOrg] 전체: $total 건"
Write-Host "[$TargetOrg] 상태별: " (($byStatus.GetEnumerator() | Sort-Object Name | ForEach-Object { "$($_.Name)=$($_.Value)" }) -join ', ')
Write-Host "[$TargetOrg] 도시별: " (($byCity.GetEnumerator() | Sort-Object Name | ForEach-Object { "$($_.Name)=$($_.Value)" }) -join ', ')

$expectedCities = @('서울', '부산', '성남', '수원', '대전', '제주', '인천')
$ok = ($total -eq 10) -and ($byStatus['Available'] -eq 6) -and ($byStatus['Under Contract'] -eq 2) -and ($byStatus['Sold'] -eq 2) `
    -and ($byCity.Count -eq 7) -and (@($expectedCities | Where-Object { -not $byCity.ContainsKey($_) }).Count -eq 0)
if (-not $ok) {
    Write-Error "[$TargetOrg] AC-007 분포 불일치 (기대: 10건, Available 6 / Under Contract 2 / Sold 2, 도시 7개)"
    exit 1
}
Write-Host "[$TargetOrg] AC-007 분포 확인 OK (10건, 6/2/2, 도시 7개)"
