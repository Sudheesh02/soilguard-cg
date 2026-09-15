"""
SoilGuard-CG & CloudGap-CG Unified API Entry Point
"""
import os
import sys

_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_SG_API = os.path.join(_ROOT, "soilguard-cg", "api")
for _p in (_ROOT, _SG_API):
    if _p not in sys.path:
        sys.path.insert(0, _p)

from server import app

__all__ = ["app"]
