@echo off
REM ==============================================================================
REM SoilGuard-SOC: One-Command Live Demonstration Launcher (Windows Batch)
REM National Space Day Ideathon 2026 – COSINE NIT Raipur + NRSC/ISRO
REM ==============================================================================

TITLE SoilGuard-SOC Live Demo Launcher (Ideathon 2026)
COLOR 0A

echo ======================================================================
echo   SoilGuard-SOC: Chhattisgarh Soil Carbon Sentinel Live Demo
echo   National Space Day Ideathon 2026 -- COSINE NIT Raipur x NRSC/ISRO
echo ======================================================================
echo.

IF EXIST "soilguard-cg" (
    CD /D "%~dp0soilguard-cg"
) ELSE (
    CD /D "%~dp0"
)

REM Determine Python Launcher
SET PYTHON_CMD=py -3.11
WHERE py >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    SET PYTHON_CMD=python
)

echo [+] Launching SoilGuard-SOC full offline pipeline using %PYTHON_CMD%...
echo.

%PYTHON_CMD% src/run_full_demo.py

IF %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================================================
    echo  [OK] SoilGuard-SOC Live Demonstration Completed Successfully!
    echo       All presentation maps, CSVs, and executive reports generated.
    echo ======================================================================
) ELSE (
    echo.
    echo  [ERROR] Pipeline encountered an issue!
    echo          Engaging pre-generated offline fallback system...
    IF EXIST "outputs\phase4" (
        echo  [FALLBACK] Showing pre-generated outputs from outputs\phase4\
    )
    PAUSE
    EXIT /B 1
)

PAUSE
