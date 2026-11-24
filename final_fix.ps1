$ErrorActionPreference = "Stop"

$header = "components\header.tsx"
$css = "app\globals.css"

Write-Host "Applying header/UI cleanup..." -ForegroundColor Cyan

# ============================================================
# HEADER
# ============================================================

$content = Get-Content $header -Raw

# Remove unused icons
$content = $content.Replace(
'import {Bell,Expand,LockKeyhole,Pause,Play,Printer,Sun,Moon,Volume2,VolumeX} from "lucide-react";',
'import {Bell,Expand,LockKeyhole,Printer,Sun,Moon} from "lucide-react";'
)

# Remove Live / Pause button
$content = [regex]::Replace(
    $content,
    '\s*<button onClick=\{\(\)=>onPause\(!paused\)\}.*?</button>',
    '',
    [System.Text.RegularExpressions.RegexOptions]::Singleline
)

# Remove Sound button
$content = [regex]::Replace(
    $content,
    '\s*<button onClick=\{onSound\}.*?</button>',
    '',
    [System.Text.RegularExpressions.RegexOptions]::Singleline
)

# Remove old Insights link
$content = $content.Replace(
    '<Link href="/insights">Insights</Link>',
    ''
)

# Add new Insights button after Admin
$adminOld = '<Link className="admin-lock" href="/admin" title="Admin"><LockKeyhole/></Link><em/>'

$adminNew = @'
<Link className="admin-lock" href="/admin" title="Admin"><LockKeyhole/></Link>
     <Link className="insights-button" href="/insights">
       Insights <span aria-hidden="true">↗</span>
     </Link>
     <em/>
'@

if ($content.Contains($adminOld)) {
    $content = $content.Replace($adminOld, $adminNew.Trim())
}
elseif (-not $content.Contains('className="insights-button"')) {
    Write-Host "Could not locate Admin/Insights insertion point." -ForegroundColor Yellow
}

Set-Content $header $content -Encoding UTF8


# ============================================================
# CSS
# ============================================================

$styles = @'

/* ==========================================================
   HEADER CLEANUP
   ========================================================== */

/* Remove KPI black separator */
.kpi footer {
    border-top: none !important;
}

/* Insights navigation */
.actions .insights-button {
    height: 34px;

    display: inline-flex;
    align-items: center;
    justify-content: center;

    gap: 6px;

    padding: 0 13px;

    border: 1px solid #2b3741;
    border-radius: 6px;

    background: #0d1115;

    color: #9db5ca;

    text-decoration: none;

    font-family: var(--font-inter), Inter, Arial, sans-serif;

    font-size: 10px;
    font-weight: 650;

    white-space: nowrap;

    transition:
        background 160ms ease,
        border-color 160ms ease,
        color 160ms ease,
        transform 120ms ease;
}

.actions .insights-button span {
    font-size: 13px;
    line-height: 1;

    transition:
        transform 160ms ease;
}

.actions .insights-button:hover {
    background: #151c22;

    border-color: #536b7d;

    color: #ffffff;

    transform: translateY(-1px);
}

.actions .insights-button:hover span {
    transform: translate(2px, -2px);
}

.actions .insights-button:active {
    transform: scale(.97);
}


/* ==========================================================
   LIGHT THEME HEADER
   ========================================================== */

html[data-theme="light"] .innovation strong {
    color: #17212a !important;
}

html[data-theme="light"] .innovation span {
    color: #66829d !important;
}

html[data-theme="light"] .innovation b {
    color: #147bd1 !important;
}


/* Insights becomes primary navigation action */

html[data-theme="light"] .actions .insights-button {
    background: #15202a !important;

    border-color: #15202a !important;

    color: #ffffff !important;
}

html[data-theme="light"] .actions .insights-button:hover {
    background: #263746 !important;

    border-color: #263746 !important;
}


/* ==========================================================
   HEADER SPACING AFTER REMOVING LIVE + SOUND
   ========================================================== */

.actions {
    gap: 7px !important;
}

.actions em {
    margin-left: 4px;
    margin-right: 4px;
}


/* ==========================================================
   KPI CLEANUP
   ========================================================== */

.kpi footer {
    border-top: 0 !important;
    box-shadow: none !important;
}

/* Remove any pseudo-element separator */

.kpi footer::before,
.kpi footer::after {
    display: none !important;
    content: none !important;
}

'@

Add-Content $css $styles

Write-Host ""
Write-Host "Changes applied successfully." -ForegroundColor Green
Write-Host ""
Write-Host "Removed:" -ForegroundColor Cyan
Write-Host "  - Live/Pause button"
Write-Host "  - Sound button"
Write-Host "  - KPI horizontal separator"
Write-Host ""
Write-Host "Updated:" -ForegroundColor Cyan
Write-Host "  - Insights navigation"
Write-Host "  - Innovation text in light mode"
Write-Host "  - Header spacing"