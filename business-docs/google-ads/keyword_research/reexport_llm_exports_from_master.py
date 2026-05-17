#!/usr/bin/env python3
"""
Re-generate slice + Google Ads Editor CSVs from an existing llm_keywords_master.csv.
Does not call the LLM. Use after fixing exporters.kw_col or when you only need refreshed
derived files. Overwrites the default output filenames in --output-dir.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import pandas as pd

from llm_keyword_reorganizer.config import load_campaign_editor_names
from llm_keyword_reorganizer.exporters import LLM_MASTER_COLUMNS, export_all


def main() -> None:
    p = argparse.ArgumentParser(
        description="Re-export LLM CSVs from master (no API)."
    )
    p.add_argument(
        "--master",
        type=Path,
        default=Path("llm_keyword_reorganizer/outputs/llm_keywords_master.csv"),
        help="Path to llm_keywords_master.csv",
    )
    p.add_argument(
        "--output-dir",
        type=Path,
        default=Path("llm_keyword_reorganizer/outputs"),
        help="Directory to write llm_keywords_*.csv and Editor files",
    )
    args = p.parse_args()
    master = args.master.resolve()
    out = args.output_dir.resolve()
    out.mkdir(parents=True, exist_ok=True)

    df = pd.read_csv(master, dtype=str, keep_default_na=False)
    for c in LLM_MASTER_COLUMNS:
        if c not in df.columns:
            df[c] = ""
    rows = df[LLM_MASTER_COLUMNS].to_dict("records")
    names = load_campaign_editor_names()
    export_all(
        out,
        rows,
        names,
        audit_path=out / "reexport_audit_placeholder.jsonl",
        summary_path=out / "reexport_summary_placeholder.json",
    )
    print(f"Re-exported {len(rows)} rows from {master} -> {out}")


if __name__ == "__main__":
    main()
