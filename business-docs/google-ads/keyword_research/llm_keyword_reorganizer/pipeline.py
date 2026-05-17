"""Load CSVs, rule engine, OpenRouter batches, checkpoints, post-process, export."""

from __future__ import annotations

import argparse
import json
import logging
import time
import uuid
from pathlib import Path
from typing import Any

import pandas as pd
from pydantic import ValidationError
from tqdm import tqdm

from . import config
from .checkpoint_store import CheckpointStore
from .exporters import append_audit_line, export_all, write_summary
from .heuristics import bias_hint_line, compute_heuristic_tags
from .models import BatchLLMResponse, KeywordLLMItem
from .normalizers import apply_post_rules, apply_pre_rules, normalize_keyword_text
from .openrouter_client import (
    OpenRouterBatchError,
    build_client,
    chat_completion_json,
    parse_batch_json,
)
from .tuning_expansion import generate_tuning_rows

logger = logging.getLogger(__name__)

PRIMARY_CANDIDATES = ("keyword_universe.csv", "keyword_research_master.csv")
AUGMENT_FILES = (
    "keywords_include.csv",
    "keywords_review.csv",
    "keywords_broad_test.csv",
    "negative_keywords.csv",
)
VALIDATION_FILE = "keyword_validation_summary.csv"


def _read_csv(path: Path) -> pd.DataFrame:
    if not path.is_file():
        return pd.DataFrame()
    return pd.read_csv(path, dtype=str, keep_default_na=False)


def discover_primary(input_dir: Path) -> Path | None:
    for name in PRIMARY_CANDIDATES:
        p = input_dir / name
        if p.is_file():
            return p
    return None


def standardize_row(r: pd.Series) -> dict[str, Any]:
    kw = str(r.get("keyword_candidate", "") or "").strip()
    orig = kw
    nk = str(r.get("normalized_keyword", "") or "").strip()
    if not nk:
        nk = normalize_keyword_text(kw)
    fam = str(r.get("campaign_family", "") or "Diagnostics & VOR").strip()
    ag = str(r.get("ad_group_theme", "") or "").strip()
    return {
        "original_keyword": orig,
        "normalized_keyword": nk,
        "campaign_family": fam,
        "ad_group_theme": ag,
        "seed_keyword": str(r.get("seed_keyword", "") or "").strip(),
        "source": str(r.get("source", "") or "").strip(),
        "tier_status": str(r.get("tier_status", "") or "").strip(),
        "recommended_match_type": str(
            r.get("recommended_match_type", "") or ""
        ).strip(),
        "notes": str(r.get("notes", "") or r.get("reason", "") or "").strip(),
        "intent_score": r.get("intent_score", ""),
        "relevance_score": r.get("relevance_score", ""),
        "negative_risk_score": r.get("negative_risk_score", ""),
    }


def load_and_merge(input_dir: Path) -> pd.DataFrame:
    primary = discover_primary(input_dir)
    if primary is None:
        raise FileNotFoundError(
            f"No {PRIMARY_CANDIDATES[0]} or {PRIMARY_CANDIDATES[1]} in {input_dir}"
        )
    df = _read_csv(primary)
    if df.empty:
        raise ValueError(f"Empty primary file: {primary}")

    seen: set[tuple[str, str]] = set()
    rows: list[dict[str, Any]] = []
    for _, r in df.iterrows():
        d = standardize_row(r)
        key = (d["normalized_keyword"], d["campaign_family"])
        if not d["normalized_keyword"]:
            continue
        if key in seen:
            continue
        seen.add(key)
        rows.append(d)

    for name in AUGMENT_FILES:
        aug = _read_csv(input_dir / name)
        if aug.empty:
            continue
        for _, r in aug.iterrows():
            d = standardize_row(r)
            key = (d["normalized_keyword"], d["campaign_family"])
            if not d["normalized_keyword"]:
                continue
            if key in seen:
                continue
            seen.add(key)
            rows.append(d)

    out = pd.DataFrame(rows)
    val_path = input_dir / VALIDATION_FILE
    if val_path.is_file():
        val = _read_csv(val_path)
        if not val.empty and "normalized_keyword" in val.columns:
            val_small = val[
                [
                    c
                    for c in val.columns
                    if c
                    in (
                        "normalized_keyword",
                        "in_gsc",
                        "gsc_clicks",
                        "gsc_impressions",
                        "in_ads_search_terms",
                        "in_ads_negatives",
                    )
                ]
            ]
            out = out.merge(
                val_small,
                how="left",
                left_on="normalized_keyword",
                right_on="normalized_keyword",
            )
    return out


def coerce_family(name: str, prior: str) -> str:
    n = (name or "").strip()
    if n in config.CAMPAIGN_FAMILIES:
        return n
    p = (prior or "").strip()
    if p in config.CAMPAIGN_FAMILIES:
        return p
    return "Diagnostics & VOR"


def coerce_ad_group(family: str, ag: str) -> tuple[str, bool]:
    """Return (fixed_ad_group, unknown_fixed)."""
    agn = config.normalize_ad_group_name((ag or "").strip())
    allowed = config.AD_GROUPS_BY_FAMILY.get(family, ())
    if agn in allowed:
        return agn, False
    al = agn.lower()
    for a in allowed:
        if a.lower() == al:
            return a, False
    fb = config.FAMILY_FALLBACK_AD_GROUP.get(family, "")
    if fb in allowed:
        return fb, True
    if allowed:
        return allowed[0], True
    return agn, True


def match_type_to_internal(mt: str) -> str:
    m = (mt or "phrase").strip().lower()
    if m == "exact":
        return "exact"
    if m == "broad":
        return "broad"
    return "phrase"


def build_base_output_row(src: dict[str, Any], tags: list[str]) -> dict[str, Any]:
    return {
        "original_keyword": src["original_keyword"],
        "normalized_keyword": src["normalized_keyword"],
        "campaign_family": src["campaign_family"],
        "ad_group_theme": src["ad_group_theme"],
        "seed_keyword": src.get("seed_keyword", ""),
        "source": src.get("source", ""),
        "input_tier_status": src.get("tier_status", ""),
        "input_recommended_match_type": src.get("recommended_match_type", ""),
        "input_notes": src.get("notes", ""),
        "heuristic_tags": ";".join(tags),
        "pre_rule_id": "",
        "pre_rule_reason": "",
        "skipped_llm": False,
        "llm_keep_decision": "",
        "llm_recommended_match_type": "",
        "llm_confidence": "",
        "llm_reason": "",
        "llm_negative_reason": "",
        "llm_tags": "",
        "llm_rewritten_clean_keyword": "",
        "final_keep_decision": "",
        "final_recommended_match_type": "",
        "final_negative_reason": "",
        "post_rule_id": "",
        "parse_status": "",
        "api_error": "",
        "_tags": tags,
        "_val_ctx": {
            k: src.get(k, "")
            for k in (
                "in_gsc",
                "gsc_clicks",
                "gsc_impressions",
                "in_ads_search_terms",
                "in_ads_negatives",
            )
            if k in src
        },
    }


def apply_llm_item_to_row(
    row: dict[str, Any],
    item: KeywordLLMItem,
) -> None:
    row["llm_keep_decision"] = item.keep_decision
    row["llm_recommended_match_type"] = match_type_to_internal(
        item.recommended_match_type
    )
    row["llm_confidence"] = item.confidence
    row["llm_reason"] = item.reason
    row["llm_negative_reason"] = item.negative_reason or ""
    row["llm_tags"] = ";".join(item.tags)
    rw = (item.rewritten_clean_keyword or "").strip()
    row["llm_rewritten_clean_keyword"] = rw
    fam = coerce_family(item.campaign_family, row["campaign_family"])
    row["campaign_family"] = fam
    ag, unk = coerce_ad_group(fam, item.ad_group_theme)
    row["ad_group_theme"] = ag
    row["_ad_group_unknown"] = unk


def finalize_row(row: dict[str, Any]) -> None:
    """Post rules + confidence clamp + set final_* fields."""
    fd = str(row.get("llm_keep_decision") or row.get("final_keep_decision") or "")
    mt = str(row.get("llm_recommended_match_type") or "phrase")
    conf_raw = row.get("llm_confidence", "")
    try:
        conf = float(conf_raw)
    except (TypeError, ValueError):
        conf = 0.0

    rw = row.get("llm_rewritten_clean_keyword") or ""
    post = apply_post_rules(
        row["original_keyword"],
        row["normalized_keyword"],
        rw if rw else None,
    )
    row["post_rule_id"] = ""
    if post:
        row["post_rule_id"] = post.rule_id
        row["final_keep_decision"] = "exclude_negative"
        row["final_negative_reason"] = post.reason
        row["final_recommended_match_type"] = "phrase"
        return

    if fd == "include_now" and conf < config.CONFIDENCE_INCLUDE_THRESHOLD:
        fd = "review_high_priority"
        row["llm_reason"] = (
            str(row.get("llm_reason") or "")
            + " [downgraded: confidence below threshold]"
        ).strip()

    if row.get("_ad_group_unknown"):
        if fd == "include_now":
            fd = "review_high_priority"
        row["llm_reason"] = (
            str(row.get("llm_reason") or "") + " [ad group coerced to allowed list]"
        ).strip()

    row["final_keep_decision"] = fd or "review_high_priority"
    row["final_recommended_match_type"] = mt or "phrase"
    row["final_negative_reason"] = (
        row.get("llm_negative_reason") or ""
        if row["final_keep_decision"] == "exclude_negative"
        else ""
    )


def dedupe_rewrites(rows: list[dict[str, Any]]) -> None:
    """Demote duplicate rewritten_clean_keyword to review with merge note."""
    by_rw: dict[str, list[dict[str, Any]]] = {}
    for r in rows:
        rw = str(r.get("llm_rewritten_clean_keyword") or "").strip()
        if not rw:
            continue
        nk = normalize_keyword_text(rw)
        by_rw.setdefault(nk, []).append(r)

    for _k, group in by_rw.items():
        if len(group) < 2:
            continue
        group.sort(
            key=lambda x: (
                0 if x.get("final_keep_decision") == "include_now" else 1,
                -float(x.get("llm_confidence") or 0),
            )
        )
        keeper = group[0]
        for other in group[1:]:
            if other is keeper:
                continue
            if other.get("final_keep_decision") == "exclude_negative":
                continue
            other["final_keep_decision"] = "review_high_priority"
            other["llm_reason"] = (
                str(other.get("llm_reason") or "")
                + " [deduped_rewrite_merge]"
            ).strip()


def build_user_message(batch: list[dict[str, Any]]) -> str:
    payload = []
    for r in batch:
        tags = r.get("_tags") or []
        ctx = r.get("_val_ctx") or {}
        payload.append(
            {
                "original_keyword": r["original_keyword"],
                "normalized_keyword": r["normalized_keyword"],
                "prior_campaign_family": r["campaign_family"],
                "prior_ad_group_theme": r["ad_group_theme"],
                "prior_tier_status": r["input_tier_status"],
                "source": r["source"],
                "seed_keyword": r["seed_keyword"],
                "heuristic_bias": bias_hint_line(tags),
                "validation_context": ctx,
            }
        )
    return (
        "Return JSON only with key 'items' (array). One object per input row, "
        "same order. Input:\n"
        + json.dumps({"input_rows": payload}, ensure_ascii=False)
    )


def run_pipeline(ns: argparse.Namespace) -> dict[str, Any]:
    input_dir = Path(ns.input_dir).resolve()
    output_dir = Path(ns.output_dir).resolve()
    checkpoint_dir = Path(ns.checkpoint_dir).resolve()
    log_dir = Path(ns.log_dir).resolve()
    for d in (output_dir, checkpoint_dir, log_dir):
        d.mkdir(parents=True, exist_ok=True)

    audit_path = output_dir / "llm_batch_audit.jsonl"
    summary_path = output_dir / "llm_run_summary.json"
    if not ns.resume and audit_path.is_file():
        audit_path.unlink()

    df = load_and_merge(input_dir)
    if ns.campaign_filter:
        cf = ns.campaign_filter.lower()
        df = df[df["campaign_family"].str.lower().str.contains(cf, na=False)]
    if ns.ad_group_filter:
        gf = ns.ad_group_filter.lower()
        df = df[df["ad_group_theme"].str.lower().str.contains(gf, na=False)]

    existing_keys: set[tuple[str, str]] = set(
        zip(
            df["normalized_keyword"].astype(str),
            df["campaign_family"].astype(str),
        )
    )
    if ns.include_tuning_expansion:
        extra = generate_tuning_rows(existing_keys)
        if extra:
            df = pd.concat([df, pd.DataFrame(extra)], ignore_index=True)

    if ns.max_keywords and ns.max_keywords > 0:
        df = df.head(ns.max_keywords)

    work_rows: list[dict[str, Any]] = []
    for _, rec in df.iterrows():
        src = standardize_row(rec)
        tags = compute_heuristic_tags(
            src["original_keyword"],
            src["normalized_keyword"],
        )
        row = build_base_output_row(src, tags)
        for k in (
            "in_gsc",
            "gsc_clicks",
            "gsc_impressions",
            "in_ads_search_terms",
            "in_ads_negatives",
        ):
            if k in rec.index:
                row[k] = rec.get(k, "")
                row["_val_ctx"][k] = rec.get(k, "")
        work_rows.append(row)

    # Pre-rules
    llm_pending: list[dict[str, Any]] = []
    for row in work_rows:
        hit = apply_pre_rules(row["original_keyword"], row["normalized_keyword"])
        if hit:
            row["pre_rule_id"] = hit.rule_id
            row["pre_rule_reason"] = hit.reason
            row["skipped_llm"] = True
            row["llm_keep_decision"] = "exclude_negative"
            row["llm_reason"] = hit.reason
            row["llm_negative_reason"] = hit.reason
            row["final_keep_decision"] = "exclude_negative"
            row["final_recommended_match_type"] = "phrase"
            row["final_negative_reason"] = hit.reason
            row["parse_status"] = "rule_pre"
            continue
        llm_pending.append(row)

    cp_path = checkpoint_dir / "progress.sqlite"
    store = CheckpointStore(cp_path)
    checkpointed = store.load_all() if ns.resume else {}

    api_calls = 0
    token_prompt = 0
    token_completion = 0

    client = None
    if not ns.dry_run and llm_pending:
        import os

        key = os.environ.get("OPENROUTER_API_KEY", "").strip()
        if not key:
            raise RuntimeError("OPENROUTER_API_KEY is not set")
        client = build_client(key)

    batch_size = max(1, int(ns.batch_size))
    batches: list[list[dict[str, Any]]] = [
        llm_pending[i : i + batch_size]
        for i in range(0, len(llm_pending), batch_size)
    ]

    for batch in tqdm(batches, desc="LLM batches", disable=not ns.progress):
        batch_id = str(uuid.uuid4())
        need_api: list[dict[str, Any]] = []
        for row in batch:
            key = (row["normalized_keyword"], row["campaign_family"])
            if ns.resume and key in checkpointed:
                restored = checkpointed[key]
                for k, v in restored.items():
                    if not k.startswith("_"):
                        row[k] = v
                row["parse_status"] = restored.get("parse_status", "resumed")
                continue
            need_api.append(row)

        if not need_api:
            continue

        if ns.dry_run:
            for row in need_api:
                row["skipped_llm"] = True
                row["llm_keep_decision"] = "review_high_priority"
                row["llm_reason"] = "dry_run_no_llm"
                row["llm_confidence"] = 0.5
                row["parse_status"] = "dry_run"
                finalize_row(row)
                store.put(
                    row["normalized_keyword"],
                    row["campaign_family"],
                    {k: v for k, v in row.items() if not k.startswith("_")},
                    batch_id,
                )
            continue

        assert client is not None
        user_msg = build_user_message(need_api)
        audit_base: dict[str, Any] = {
            "batch_id": batch_id,
            "size": len(need_api),
            "t_start": time.time(),
        }
        parsed_ok = False
        raw_content = ""
        usage: dict[str, Any] = {}
        reasoning_details = None
        err_msg = ""

        try:
            api_calls += 1
            raw = chat_completion_json(
                client,
                system_prompt=config.SYSTEM_PROMPT,
                user_content=user_msg,
                reasoning_effort=ns.reasoning_effort,
                timeout=float(ns.timeout),
            )
            raw_content = raw.get("content", "")
            usage = raw.get("usage") or {}
            reasoning_details = raw.get("reasoning_details")
            tp = usage.get("prompt_tokens")
            tc = usage.get("completion_tokens")
            if isinstance(tp, int):
                token_prompt += tp
            if isinstance(tc, int):
                token_completion += tc

            data = parse_batch_json(raw_content)
            batch_model = BatchLLMResponse.model_validate(data)
            if len(batch_model.items) != len(need_api):
                raise ValueError(
                    f"Item count mismatch: got {len(batch_model.items)}, "
                    f"expected {len(need_api)}"
                )
            for row, item in zip(need_api, batch_model.items, strict=True):
                apply_llm_item_to_row(row, item)
                row["parse_status"] = "ok"
                finalize_row(row)
                store.put(
                    row["normalized_keyword"],
                    row["campaign_family"],
                    {k: v for k, v in row.items() if not k.startswith("_")},
                    batch_id,
                )
            parsed_ok = True
        except (json.JSONDecodeError, ValidationError, ValueError, KeyError) as e:
            err_msg = str(e)
            logger.warning("Batch parse failed, attempting repair: %s", e)
            try:
                api_calls += 1
                repair = chat_completion_json(
                    client,
                    system_prompt=config.SYSTEM_PROMPT,
                    user_content=config.REPAIR_USER_PROMPT.format(
                        snippet=raw_content[:12000]
                    ),
                    reasoning_effort=ns.reasoning_effort,
                    timeout=float(ns.timeout),
                )
                raw_content = repair.get("content", "")
                usage = repair.get("usage") or {}
                reasoning_details = repair.get("reasoning_details")
                data = parse_batch_json(raw_content)
                batch_model = BatchLLMResponse.model_validate(data)
                if len(batch_model.items) != len(need_api):
                    raise ValueError("repair item count mismatch")
                for row, item in zip(need_api, batch_model.items, strict=True):
                    apply_llm_item_to_row(row, item)
                    row["parse_status"] = "ok_repair"
                    finalize_row(row)
                    store.put(
                        row["normalized_keyword"],
                        row["campaign_family"],
                        {k: v for k, v in row.items() if not k.startswith("_")},
                        batch_id,
                    )
                parsed_ok = True
            except Exception as e2:
                err_msg = f"{err_msg}; repair_failed: {e2}"
                logger.error("Batch failed after repair: %s", e2)
                for row in need_api:
                    row["parse_status"] = "parse_failed"
                    row["api_error"] = err_msg[:2000]
                    row["llm_keep_decision"] = "review_high_priority"
                    row["llm_reason"] = "llm_parse_failed"
                    row["llm_confidence"] = 0.3
                    finalize_row(row)
        except OpenRouterBatchError as e:
            err_msg = str(e)
            for row in need_api:
                row["parse_status"] = "api_error"
                row["api_error"] = err_msg[:2000]
                row["llm_keep_decision"] = "review_high_priority"
                row["llm_reason"] = "api_error"
                row["llm_confidence"] = 0.3
                finalize_row(row)

        audit_base.update(
            {
                "t_end": time.time(),
                "parsed_ok": parsed_ok,
                "error": err_msg or None,
                "usage": usage,
                "reasoning_details": reasoning_details,
                "raw_response_preview": (raw_content or "")[:2000],
            }
        )
        append_audit_line(audit_path, audit_base)

    # Finalize pre-rule rows (already have final_*)
    for row in work_rows:
        if row.get("parse_status") == "rule_pre":
            continue
        if not row.get("final_keep_decision"):
            finalize_row(row)

    dedupe_rewrites(work_rows)

    # Strip private keys for export
    export_rows: list[dict[str, Any]] = []
    for r in work_rows:
        clean = {k: v for k, v in r.items() if not k.startswith("_")}
        export_rows.append(clean)

    editor_names = config.load_campaign_editor_names()
    export_all(
        output_dir,
        export_rows,
        editor_names,
        audit_path=audit_path,
        summary_path=summary_path,
    )

    # Summary stats
    summary = build_summary(export_rows, api_calls, token_prompt, token_completion)
    write_summary(summary_path, summary)
    return summary


def build_summary(
    rows: list[dict[str, Any]],
    api_calls: int,
    token_prompt: int,
    token_completion: int,
) -> dict[str, Any]:
    from collections import Counter

    by_fam: Counter[str] = Counter()
    by_ag: Counter[str] = Counter()
    by_dec: Counter[str] = Counter()
    neg_reasons: Counter[str] = Counter()
    rewrite_hits: Counter[str] = Counter()

    for r in rows:
        by_fam[str(r.get("campaign_family", ""))] += 1
        by_ag[str(r.get("ad_group_theme", ""))] += 1
        by_dec[str(r.get("final_keep_decision", ""))] += 1
        if r.get("final_keep_decision") == "exclude_negative":
            neg_reasons[
                str(r.get("final_negative_reason") or r.get("pre_rule_reason") or "")[
                    :120
                ]
            ] += 1
        rw = str(r.get("llm_rewritten_clean_keyword") or "").strip()
        if rw:
            rewrite_hits[normalize_keyword_text(rw)] += 1

    top_rewrites = [
        {"normalized": k, "count": v} for k, v in rewrite_hits.most_common(15) if v > 1
    ]

    return {
        "total_processed": len(rows),
        "by_final_decision": dict(by_dec),
        "totals": {
            "include_now": by_dec.get("include_now", 0),
            "review_high_priority": by_dec.get("review_high_priority", 0),
            "review_broad_test": by_dec.get("review_broad_test", 0),
            "future_test": by_dec.get("future_test", 0),
            "exclude_negative": by_dec.get("exclude_negative", 0),
        },
        "by_campaign_family": dict(by_fam),
        "by_ad_group": dict(by_ag),
        "top_exclusion_reasons": [
            {"reason": k, "count": v} for k, v in neg_reasons.most_common(20)
        ],
        "top_rewrite_merges": top_rewrites,
        "api_calls": api_calls,
        "token_usage": {
            "prompt_tokens": token_prompt,
            "completion_tokens": token_completion,
            "total_estimated": token_prompt + token_completion,
        },
    }
