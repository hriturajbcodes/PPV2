$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " PPV2 - Light Mode Alarm Drawer Fix" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$cssFile = "app\globals.css"

if (-not (Test-Path $cssFile)) {
    Write-Host "ERROR: $cssFile not found." -ForegroundColor Red
    exit 1
}

# Backup
$backupDir = ".ppv2-backup-alarm-theme"

if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

Copy-Item $cssFile "$backupDir\globals.css" -Force

Write-Host "[OK] Backup created." -ForegroundColor Green

$current = Get-Content $cssFile -Raw -Encoding UTF8

# Prevent duplicate installation
if ($current.Contains("PPV2 LIGHT ALARM DRAWER")) {
    Write-Host "[SKIP] Light alarm drawer styles already exist." -ForegroundColor Yellow
}
else {

$styles = @'

/* ==========================================================
   PPV2 LIGHT ALARM DRAWER
   ========================================================== */

html[data-theme="light"] .alarm-backdrop {
  background: rgba(28, 40, 50, 0.24) !important;
  backdrop-filter: blur(3px);
}

html[data-theme="light"] .alarm-drawer {
  background: #f7f9fb !important;
  border-left: 1px solid #d8e0e6 !important;
  box-shadow: -18px 0 48px rgba(25, 45, 65, 0.14) !important;
  color: #17212a !important;
}


/* Header */

html[data-theme="light"] .alarm-drawer > header {
  background: #ffffff !important;
  border-bottom: 1px solid #dce4ea !important;
}

html[data-theme="light"] .alarm-drawer > header small {
  color: #65829d !important;
}

html[data-theme="light"] .alarm-drawer > header h2 {
  color: #17212a !important;
}

html[data-theme="light"] .alarm-drawer > header button {
  background: transparent !important;
  color: #617c95 !important;
}

html[data-theme="light"] .alarm-drawer > header button:hover {
  background: #eef3f6 !important;
  color: #17212a !important;
}


/* Alarm summary */

html[data-theme="light"] .alarm-actions {
  background: #ffffff !important;
  border-bottom: 1px solid #dce4ea !important;
  color: #607c97 !important;
}

html[data-theme="light"] .alarm-actions button {
  background: #ffffff !important;
  border: 1px solid #ccd7df !important;
  color: #263746 !important;
}

html[data-theme="light"] .alarm-actions button:hover {
  background: #eef4f7 !important;
  border-color: #9eb1c0 !important;
  color: #17212a !important;
}


/* Alarm list */

html[data-theme="light"] .alarm-list {
  background: #f7f9fb !important;
}


/* Alarm card */

html[data-theme="light"] .alarm-row {
  background: #ffffff !important;
  border-color: #dce3e8 !important;

  box-shadow:
    0 1px 2px
    rgba(25, 45, 65, 0.035) !important;
}


/* Warning */

html[data-theme="light"] .alarm-row.warning {
  border-left-color: #e3a01a !important;
}

html[data-theme="light"] .alarm-row.warning > svg {
  color: #d9910b !important;
}


/* Critical */

html[data-theme="light"] .alarm-row.critical {
  border-left-color: #df4149 !important;
}

html[data-theme="light"] .alarm-row.critical > svg {
  color: #df4149 !important;
}


/* Text */

html[data-theme="light"] .alarm-row b {
  color: #1b2731 !important;
}

html[data-theme="light"] .alarm-row p {
  color: #607c96 !important;
}

html[data-theme="light"] .alarm-row small {
  color: #718ba3 !important;
}


/* ACK button */

html[data-theme="light"] .alarm-row > button {
  background: #ffffff !important;
  border: 1px solid #d1dbe3 !important;
  color: #526d85 !important;
}

html[data-theme="light"] .alarm-row > button:hover {
  background: #eef4f7 !important;
  border-color: #a9bac7 !important;
  color: #17212a !important;
}


/* Acknowledged alarm */

html[data-theme="light"] .alarm-row.acked {
  opacity: 0.68 !important;
  background: #f2f5f7 !important;
}

html[data-theme="light"] .alarm-row.acked b {
  color: #465d70 !important;
}

html[data-theme="light"] .alarm-row.acked p {
  color: #72899d !important;
}

html[data-theme="light"] .alarm-row.acked small {
  color: #8296a8 !important;
}


/* No alarms */

html[data-theme="light"] .no-alarms {
  color: #16865f !important;
}


/* Scrollbar */

html[data-theme="light"] .alarm-list {
  scrollbar-color: #bdc9d2 #eef2f5;
}

html[data-theme="light"] .alarm-list::-webkit-scrollbar {
  width: 7px;
}

html[data-theme="light"] .alarm-list::-webkit-scrollbar-track {
  background: #eef2f5;
}

html[data-theme="light"] .alarm-list::-webkit-scrollbar-thumb {
  background: #bdc9d2;
  border-radius: 8px;
}

html[data-theme="light"] .alarm-list::-webkit-scrollbar-thumb:hover {
  background: #9faeba;
}

'@

    Add-Content -Path $cssFile -Value $styles -Encoding UTF8

    Write-Host "[OK] Light alarm drawer styles added." -ForegroundColor Green
}


# Clear Next.js cache
Write-Host ""
Write-Host "Clearing Next.js cache..." -ForegroundColor Yellow

if (Test-Path ".next") {
    Remove-Item ".next" -Recurse -Force
    Write-Host "[OK] .next removed." -ForegroundColor Green
}
else {
    Write-Host "[SKIP] .next not present." -ForegroundColor DarkGray
}


Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host " LIGHT ALARM DRAWER FIX COMPLETE" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Fixed:" -ForegroundColor Cyan
Write-Host "  - White/light-grey alarm drawer"
Write-Host "  - Dark readable alarm text"
Write-Host "  - Warning amber accents"
Write-Host "  - Critical red accents"
Write-Host "  - ACK button visibility"
Write-Host "  - Acknowledged alarm readability"
Write-Host "  - Light scrollbar"
Write-Host "  - Drawer backdrop"
Write-Host ""
Write-Host "Run:" -ForegroundColor Cyan
Write-Host "npm.cmd run dev"
Write-Host ""