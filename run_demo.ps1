# ==============================================================================
# SoilGuard-SOC: One-Command Live Demonstration Launcher (PowerShell)
# National Space Day Ideathon 2026 – COSINE NIT Raipur + NRSC/ISRO
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " 🌱  SoilGuard-SOC: Chhattisgarh Soil Carbon Sentinel Live Demo" -ForegroundColor Green
Write-Host "     National Space Day Ideathon 2026 – COSINE NIT Raipur x NRSC/ISRO" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$TargetDir = Join-Path $ScriptDir "soilguard-cg"

if (Test-Path $TargetDir) {
    Set-Location $TargetDir
} else {
    Set-Location $ScriptDir
}

# Python Selection
$PythonCmd = "py"
$PythonArgs = @("-3.11", "src/run_full_demo.py")

if (-not (Get-Command py -ErrorAction SilentlyContinue)) {
    $PythonCmd = "python"
    $PythonArgs = @("src/run_full_demo.py")
}

Write-Host "[+] Launching SoilGuard-SOC full pipeline via $PythonCmd $($PythonArgs -join ' ')..." -ForegroundColor Yellow
Write-Host ""

try {
    & $PythonCmd $PythonArgs
    Write-Host ""
    Write-Host "======================================================================" -ForegroundColor Green
    Write-Host " [OK] SoilGuard-SOC Live Demonstration Completed Successfully!" -ForegroundColor Green
    Write-Host "      Presentation-Ready Maps & Executive Report generated." -ForegroundColor Green
    Write-Host "======================================================================" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host " [ERROR] Pipeline execution failed: $_" -ForegroundColor Red
    Write-Host " [FALLBACK] Accessing pre-rendered offline deliverables in outputs/..." -ForegroundColor Yellow
    exit 1
}
