"""Add `python-scripts` to sys.path for `from lead_constants` / `from services.*` imports."""
from __future__ import annotations

import sys
from pathlib import Path

_scripts = Path(__file__).resolve().parent.parent
if str(_scripts) not in sys.path:
    sys.path.insert(0, str(_scripts))
