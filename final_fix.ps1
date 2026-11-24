$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " PPV2 - Trend Configuration Final Fix" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$trendComponent = "components\trend.tsx"
$trendLibrary   = "lib\trends.ts"

# ============================================================
# VALIDATE PROJECT FILES
# ============================================================

if (-not (Test-Path $trendComponent)) {
    Write-Host "ERROR: $trendComponent not found." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $trendLibrary)) {
    Write-Host "ERROR: $trendLibrary not found." -ForegroundColor Red
    exit 1
}


# ============================================================
# BACKUP
# ============================================================

$backupDir = ".ppv2-backup"

if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

Copy-Item $trendComponent "$backupDir\trend.tsx" -Force
Copy-Item $trendLibrary "$backupDir\trends.ts" -Force

Write-Host "Backup created in $backupDir" -ForegroundColor DarkGray


# ============================================================
# TREND COMPONENT
# ============================================================

Write-Host ""
Write-Host "Updating trend component..." -ForegroundColor Yellow

$trend = Get-Content $trendComponent -Raw -Encoding UTF8


# ------------------------------------------------------------
# 1. DEFAULT RANGE = DAILY
# ------------------------------------------------------------

$oldDefault = 'const[range,setRange]=useState<TrendRange>("live");'
$newDefault = 'const[range,setRange]=useState<TrendRange>("daily");'

if ($trend.Contains($oldDefault)) {

    $trend = $trend.Replace(
        $oldDefault,
        $newDefault
    )

    Write-Host "  [OK] Default chart changed: Live -> Daily" -ForegroundColor Green
}
elseif ($trend.Contains($newDefault)) {

    Write-Host "  [SKIP] Daily is already the default." -ForegroundColor DarkGray
}
else {

    Write-Host "  [WARN] Could not locate range state declaration." -ForegroundColor Yellow
}


# ------------------------------------------------------------
# 2. RENAME LIVE (40s) -> LIVE
# ------------------------------------------------------------

if ($trend.Contains(">Live (40s)</button>")) {

    $trend = $trend.Replace(
        ">Live (40s)</button>",
        ">Live</button>"
    )

    Write-Host "  [OK] Live (40s) renamed to Live" -ForegroundColor Green
}
elseif ($trend.Contains(">Live</button>")) {

    Write-Host "  [SKIP] Live button already renamed." -ForegroundColor DarkGray
}
else {

    Write-Host "  [WARN] Could not locate Live button label." -ForegroundColor Yellow
}


# Save component

Set-Content `
    -Path $trendComponent `
    -Value $trend `
    -Encoding UTF8 `
    -NoNewline


# ============================================================
# TREND BACKEND
# ============================================================

Write-Host ""
Write-Host "Updating historian trend window..." -ForegroundColor Yellow

$library = Get-Content $trendLibrary -Raw -Encoding UTF8


# ------------------------------------------------------------
# 3. LIVE WINDOW 40 SEC -> 120 SEC
# ------------------------------------------------------------

$patterns40 = @(
    "40_000",
    "40000"
)

$changedWindow = $false

foreach ($pattern in $patterns40) {

    if ($library.Contains($pattern)) {

        if ($pattern -eq "40_000") {

            $library = $library.Replace(
                "40_000",
                "120_000"
            )
        }
        else {

            $library = $library.Replace(
                "40000",
                "120000"
            )
        }

        $changedWindow = $true
    }
}

if ($changedWindow) {

    Write-Host "  [OK] Live historian window changed to 120 seconds" -ForegroundColor Green
}
elseif (
    $library.Contains("120_000") -or
    $library.Contains("120000")
) {

    Write-Host "  [SKIP] Live window already uses 120 seconds." -ForegroundColor DarkGray
}
else {

    Write-Host "  [WARN] Could not identify the existing Live time window." -ForegroundColor Yellow
}


# ------------------------------------------------------------
# 4. LIVE GAP THRESHOLD
#
# Existing:
# range==="live" ? 6000 : 120000
#
# New:
# range==="live" ? 15000 : 120000
# ------------------------------------------------------------

$oldGap1 = 'range==="live" ? 6000 : 120000'
$newGap1 = 'range==="live" ? 15000 : 120000'

$oldGap2 = 'range === "live" ? 6000 : 120000'
$newGap2 = 'range === "live" ? 15000 : 120000'

if ($library.Contains($oldGap1)) {

    $library = $library.Replace(
        $oldGap1,
        $newGap1
    )

    Write-Host "  [OK] Live gap threshold changed to 15 seconds" -ForegroundColor Green
}
elseif ($library.Contains($oldGap2)) {

    $library = $library.Replace(
        $oldGap2,
        $newGap2
    )

    Write-Host "  [OK] Live gap threshold changed to 15 seconds" -ForegroundColor Green
}
elseif (
    $library.Contains($newGap1) -or
    $library.Contains($newGap2)
) {

    Write-Host "  [SKIP] Live gap threshold already configured." -ForegroundColor DarkGray
}
else {

    Write-Host "  [WARN] Gap threshold expression not found." -ForegroundColor Yellow
}


# Save trend backend

Set-Content `
    -Path $trendLibrary `
    -Value $library `
    -Encoding UTF8 `
    -NoNewline


# ============================================================
# VERIFY
# ============================================================

Write-Host ""
Write-Host "Verifying modifications..." -ForegroundColor Cyan

$trendCheck = Get-Content $trendComponent -Raw -Encoding UTF8
$libCheck   = Get-Content $trendLibrary -Raw -Encoding UTF8

$failed = $false


# Daily default

if ($trendCheck.Contains('useState<TrendRange>("daily")')) {

    Write-Host "  [PASS] Daily default" -ForegroundColor Green
}
else {

    Write-Host "  [FAIL] Daily default" -ForegroundColor Red
    $failed = $true
}


# Live label

if (
    $trendCheck.Contains(">Live</button>") -and
    -not $trendCheck.Contains("Live (40s)")
) {

    Write-Host "  [PASS] Live label" -ForegroundColor Green
}
else {

    Write-Host "  [FAIL] Live label" -ForegroundColor Red
    $failed = $true
}


# Live range

if (
    $libCheck.Contains("120_000") -or
    $libCheck.Contains("120000")
) {

    Write-Host "  [PASS] 120 second Live range" -ForegroundColor Green
}
else {

    Write-Host "  [WARN] Could not verify 120 second range" -ForegroundColor Yellow
}


# ============================================================
# CLEAR NEXT CACHE
# ============================================================

Write-Host ""
Write-Host "Clearing Next.js cache..." -ForegroundColor Yellow

if (Test-Path ".next") {

    Remove-Item `
        ".next" `
        -Recurse `
        -Force

    Write-Host "  [OK] .next removed" -ForegroundColor Green
}
else {

    Write-Host "  [SKIP] .next does not exist" -ForegroundColor DarkGray
}


# ============================================================
# RESULT
# ============================================================

Write-Host ""

if ($failed) {

    Write-Host "==========================================" -ForegroundColor Red
    Write-Host " Some required changes could not be verified" -ForegroundColor Red
    Write-Host "==========================================" -ForegroundColor Red

    Write-Host ""
    Write-Host "Backups are available in:" -ForegroundColor Yellow
    Write-Host $backupDir

    exit 1
}

Write-Host "==========================================" -ForegroundColor Green
Write-Host " PPV2 trend configuration updated" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

Write-Host ""
Write-Host "Default chart : Daily"
Write-Host "Live label    : Live"
Write-Host "Live window   : 120 seconds"
Write-Host "Gap threshold : 15 seconds"
Write-Host ""
Write-Host "Start the dashboard with:" -ForegroundColor Cyan
Write-Host ""
Write-Host "npm.cmd run dev" -ForegroundColor White
Write-Host ""