#!/usr/bin/env python3
"""
Convenience launcher from ``keyword_research/`` (same as ``python -m llm_keyword_reorganizer``).

Example:
  python run_llm_reorganizer.py --input-dir output --dry-run --max-keywords 50
"""

from __future__ import annotations

import runpy
import sys


def main() -> None:
    sys.argv[0] = "llm_keyword_reorganizer"
    runpy.run_module("llm_keyword_reorganizer", run_name="__main__", alter_sys=True)


if __name__ == "__main__":
    main()
