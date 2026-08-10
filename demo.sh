#!/usr/bin/env bash
# ==============================================================================
# SoilGuard-SOC: One-Command Live Demonstration Launcher (Linux/WSL)
# National Space Day Ideathon 2026 – COSINE NIT Raipur + NRSC/ISRO
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${SCRIPT_DIR}/soilguard-cg"

if [ ! -d "${PROJECT_ROOT}" ]; then
    PROJECT_ROOT="${SCRIPT_DIR}"
fi

cd "${PROJECT_ROOT}"

echo "======================================================================"
echo " 🌱  SoilGuard-SOC: Chhattisgarh Soil Carbon Sentinel Demo"
echo "     National Space Day Ideathon 2026 – COSINE NIT Raipur x NRSC/ISRO"
echo "======================================================================"

# Determine Python Executable
PYTHON_EXEC="python3"
if command -v python3 &>/dev/null; then
    PYTHON_EXEC="python3"
elif command -v python &>/dev/null; then
    PYTHON_EXEC="python"
elif command -v py &>/dev/null; then
    PYTHON_EXEC="py -3.11"
fi

# Activate virtualenv if present
if [ -d "venv" ]; then
    echo "[+] Activating local virtualenv (venv)..."
    source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null || true
elif [ -d "../venv" ]; then
    echo "[+] Activating parent virtualenv (venv)..."
    source ../venv/bin/activate 2>/dev/null || source ../venv/Scripts/activate 2>/dev/null || true
fi

echo "[+] Executing SoilGuard-SOC Full Pipeline via ${PYTHON_EXEC}..."
echo ""

if ${PYTHON_EXEC} src/run_full_demo.py; then
    echo ""
    echo "======================================================================"
    echo " [OK] SoilGuard-SOC Execution Complete!"
    echo "      Deliverables & High-Res Maps ready in outputs/"
    echo "======================================================================"
else
    echo ""
    echo " [ERROR] SoilGuard-SOC pipeline execution failed!"
    echo "         Loading pre-generated offline fallback deliverables..."
    if [ -d "outputs/phase4" ]; then
        echo " [FALLBACK] Pre-generated artifacts are available at:"
        echo "            - outputs/phase3/risk_score_map.png"
        echo "            - outputs/phase4/zonal_risk_map.png"
        echo "            - outputs/phase4/SoilGuard_SOC_Executive_Summary.md"
    fi
    exit 1
fi
