#!/usr/bin/env python3
"""
CLI: LLM-assisted reorganizer for TriPoint keyword research CSVs (OpenRouter + Gemini).
Run: ``python -m llm_keyword_reorganizer`` from ``keyword_research/`` (parent folder).
"""

from __future__ import annotations

import argparse
import logging
import sys
from datetime import datetime
from pathlib import Path

from .env_loader import load_llm_env
from .pipeline import run_pipeline

_PKG = Path(__file__).resolve().parent
_DEFAULT_INPUT = _PKG.parent / "output"
_DEFAULT_OUTPUT = _PKG / "outputs"
_DEFAULT_CHECKPOINT = _PKG / "checkpoints"
_DEFAULT_LOG = _PKG / "logs"


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="Clean and reorganize keyword CSVs via OpenRouter (Gemini 3 Flash)."
    )
    p.add_argument(
        "--input-dir",
        type=str,
        default=str(_DEFAULT_INPUT),
        help="Directory containing keyword_research_master.csv / keyword_universe.csv",
    )
    p.add_argument(
        "--output-dir",
        type=str,
        default=str(_DEFAULT_OUTPUT),
        help="Directory for llm_*.csv, jsonl, and summary",
    )
    p.add_argument(
        "--checkpoint-dir",
        type=str,
        default=str(_DEFAULT_CHECKPOINT),
        help="SQLite checkpoint directory",
    )
    p.add_argument(
        "--log-dir",
        type=str,
        default=str(_DEFAULT_LOG),
        help="Directory for run logs",
    )
    p.add_argument(
        "--batch-size",
        type=int,
        default=10,
        help="Keywords per API request",
    )
    p.add_argument(
        "--max-keywords",
        type=int,
        default=0,
        help="Cap rows after merge (0 = no cap)",
    )
    p.add_argument(
        "--campaign-filter",
        type=str,
        default="",
        help="Substring filter on campaign_family",
    )
    p.add_argument(
        "--ad-group-filter",
        type=str,
        default="",
        help="Substring filter on ad_group_theme",
    )
    p.add_argument(
        "--include-tuning-expansion",
        action="store_true",
        help="Add codegen non-Mercedes van tuning candidates",
    )
    p.add_argument(
        "--resume",
        action="store_true",
        help="Resume from SQLite checkpoint (skips completed keys)",
    )
    p.add_argument(
        "--dry-run",
        action="store_true",
        help="No API calls; rule engine + placeholder review tier only",
    )
    p.add_argument(
        "--verbose",
        action="store_true",
        help="DEBUG logging",
    )
    p.add_argument(
        "--reasoning-effort",
        type=str,
        default="low",
        choices=("low", "medium", "high"),
        help="OpenRouter extra_body reasoning.effort",
    )
    p.add_argument(
        "--timeout",
        type=float,
        default=120.0,
        help="Per-request timeout seconds",
    )
    p.add_argument(
        "--no-progress",
        action="store_true",
        help="Disable tqdm batch bar",
    )
    return p.parse_args()


def main() -> None:
    load_llm_env()
    args = parse_args()
    args.progress = not args.no_progress

    log_dir = Path(args.log_dir)
    log_dir.mkdir(parents=True, exist_ok=True)
    log_file = log_dir / f"llm_reorganizer_{datetime.now():%Y%m%d_%H%M%S}.log"
    level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler(log_file, encoding="utf-8"),
        ],
    )

    summary = run_pipeline(args)
    logging.getLogger(__name__).info("Done. Summary: %s", summary.get("totals"))
    print("\n--- Run complete ---")
    print(f"Totals: {summary.get('totals')}")
    print(f"API calls: {summary.get('api_calls')}")
    print(f"Token usage: {summary.get('token_usage')}")
    print(f"Log file: {log_file}")


if __name__ == "__main__":
    main()
