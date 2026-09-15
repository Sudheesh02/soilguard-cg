#!/usr/bin/env python3
"""
Single-Command Launcher for SoilGuard-CG & CloudGap-CG Operational FastAPI Server
Hosts Swagger UI at http://localhost:8000/docs
"""
import os
import sys

# Ensure Python 3.11 UTF-8 console output
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

_ROOT = os.path.dirname(os.path.abspath(__file__))
_SG_API = os.path.join(_ROOT, "soilguard-cg", "api")
for _p in (_ROOT, _SG_API):
    if _p not in sys.path:
        sys.path.insert(0, _p)

try:
    import uvicorn
    from api.server import app
except ImportError:
    # Auto-forward to Python 3.11 if needed
    py311 = r"C:\Users\Asus\AppData\Local\Programs\Python\Python311\python.exe"
    if os.path.exists(py311) and sys.executable.lower() != py311.lower():
        import subprocess
        res = subprocess.run([py311, __file__] + sys.argv[1:], check=False)
        sys.exit(res.returncode)
    else:
        raise

if __name__ == "__main__":
    port = 8000
    print("=" * 70)
    print("SoilGuard-CG & CloudGap-CG Operational FastAPI REST Server")
    print(f"Interactive Swagger Docs: http://localhost:{port}/docs")
    print(f"Alternative ReDoc Portal: http://localhost:{port}/redoc")
    print(f"Health Telemetry:        http://localhost:{port}/health")
    print(f"33 District Catalog:     http://localhost:{port}/api/v1/districts")
    print("=" * 70)
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
