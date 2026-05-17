#!/usr/bin/env python3
"""
TriPoint keyword research: SerpApi, optional Brave, Search Console, Ads exports.

Loads .env from this directory. SerpApi key required unless --expansion-only
or --validation-only (or --use-serpapi is off with other sources).
"""

from __future__ import annotations

import argparse
import csv
import logging
import os
import sys
import time
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

from ads_script_loader import build_validation_index, load_ads_exports
from config import ResearchSettings, flatten_seeds
from csv_writer import write_all_csvs
from modifier_expander import generate_modifier_candidates
from query_shape import is_query_shaped_organic_title
from scoring import normalize_keyword, score_relevance, score_row
from serpapi_collector import fetch_autocomplete, fetch_search_results

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s %(message)s",
)
logger = logging.getLogger(__name__)

SCRIPT_DIR = Path(__file__).resolve().parent


def load_env() -> None:
    load_dotenv(SCRIPT_DIR / ".env")


def load_serpapi_key(required: bool) -> str | None:
    k = os.environ.get("SERPAPI_API_KEY") or os.environ.get("SerpApi_API_KEY")
    k = str(k).strip() if k else ""
    if required and not k:
        print(
            "ERROR: Set SERPAPI_API_KEY or SerpApi_API_KEY in .env "
            "(or disable SerpApi with --no-serpapi if other sources suffice).",
            file=sys.stderr,
        )
        sys.exit(1)
    return k or None


def load_brave_keys() -> tuple[str | None, str | None]:
    """
    (suggest_key, web_key) for Brave Search API.

    Use brave_suggest_api_key (or brave_autosuggest_api_key) for /suggest/search;
    brave_search_api_key for /web/search. If only one is set, it is reused for both.
    """
    web = (os.environ.get("brave_search_api_key") or "").strip() or None
    sug = (
        (os.environ.get("brave_suggest_api_key") or "").strip()
        or (os.environ.get("brave_autosuggest_api_key") or "").strip()
        or None
    )
    if sug is None and web:
        sug = web
    if web is None and sug:
        web = sug
    return (sug, web)


def collect_for_seed_serp(
    entry: dict[str, str],
    api_key: str,
    settings: ResearchSettings,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    seed = entry["seed_keyword"]
    family = entry["campaign_family"]
    theme = entry["seed_ad_group_theme"]
    candidates: list[dict[str, Any]] = []
    dump_rows: list[dict[str, Any]] = []

    def add_candidate(text: str, source: str) -> None:
        t = (text or "").strip()
        if len(t) < 2:
            return
        candidates.append(
            {
                "campaign_family": family,
                "seed_ad_group_theme": theme,
                "seed_keyword": seed,
                "keyword_candidate": t,
                "source": source,
            }
        )

    add_candidate(seed, "seed")

    if settings.include_autocomplete:
        time.sleep(settings.request_delay)
        try:
            for sug in fetch_autocomplete(seed, api_key, settings):
                val = sug.get("value", "")
                add_candidate(val, "autocomplete")
                dump_rows.append(
                    {
                        "seed_keyword": seed,
                        "source": "autocomplete",
                        "raw_text": val,
                        "api_endpoint": sug.get("api_endpoint", "google_autocomplete"),
                        "result_position": "",
                        "title": "",
                        "snippet": "",
                        "link": "",
                    }
                )
        except Exception as e:
            logger.error("Autocomplete failed for %r: %s", seed, e)

    if settings.include_search:
        time.sleep(settings.request_delay)
        try:
            search = fetch_search_results(seed, api_key, settings)
        except Exception as e:
            logger.error("Search failed for %r: %s", seed, e)
            search = {
                "related_searches": [],
                "organic_results": [],
                "related_questions": [],
                "seed": seed,
                "api_endpoint": "google",
            }

        ep = search.get("api_endpoint", "google")

        if settings.include_related:
            for r in search.get("related_searches") or []:
                q = r.get("query", "")
                add_candidate(q, "related_searches")
                dump_rows.append(
                    {
                        "seed_keyword": seed,
                        "source": "related_searches",
                        "raw_text": q,
                        "api_endpoint": ep,
                        "result_position": "",
                        "title": "",
                        "snippet": "",
                        "link": "",
                    }
                )

        for o in search.get("organic_results") or []:
            title = o.get("title", "")
            snippet = o.get("snippet", "")
            link = o.get("link", "")
            pos = o.get("position")
            if title and is_query_shaped_organic_title(str(title)):
                add_candidate(str(title).strip(), "organic_title")
            dump_rows.append(
                {
                    "seed_keyword": seed,
                    "source": "organic_result",
                    "raw_text": f"{title} | {snippet}",
                    "api_endpoint": ep,
                    "result_position": pos if pos is not None else "",
                    "title": title,
                    "snippet": snippet,
                    "link": link,
                }
            )

        if settings.include_paa:
            for rq in search.get("related_questions") or []:
                q = rq.get("question", "")
                add_candidate(q, "paa")
                dump_rows.append(
                    {
                        "seed_keyword": seed,
                        "source": "paa",
                        "raw_text": q,
                        "api_endpoint": ep,
                        "result_position": "",
                        "title": rq.get("question", ""),
                        "snippet": rq.get("snippet", ""),
                        "link": "",
                    }
                )

    return candidates, dump_rows


def collect_for_seed_brave(
    entry: dict[str, str],
    brave_suggest_key: str,
    brave_web_key: str,
    settings: ResearchSettings,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    from brave_collector import fetch_brave_suggest, fetch_brave_web

    seed = entry["seed_keyword"]
    family = entry["campaign_family"]
    theme = entry["seed_ad_group_theme"]
    candidates: list[dict[str, Any]] = []
    brave_dump: list[dict[str, Any]] = []

    time.sleep(settings.request_delay)
    try:
        for row in fetch_brave_suggest(seed, brave_suggest_key, settings):
            val = row.get("value", "")
            if val:
                candidates.append(
                    {
                        "campaign_family": family,
                        "seed_ad_group_theme": theme,
                        "seed_keyword": seed,
                        "keyword_candidate": val,
                        "source": "brave_suggest",
                    }
                )
                brave_dump.append(
                    {
                        "seed_keyword": seed,
                        "source": "brave_suggest",
                        "raw_text": val,
                        "altered_query": "",
                        "title": "",
                        "description": "",
                    }
                )
    except Exception as e:
        logger.error("Brave suggest failed for %r: %s", seed, e)

    time.sleep(settings.request_delay)
    try:
        web = fetch_brave_web(seed, brave_web_key, settings)
        alt = web.get("altered_query") or ""
        for t in web.get("titles") or []:
            if t and is_query_shaped_organic_title(str(t)):
                candidates.append(
                    {
                        "campaign_family": family,
                        "seed_ad_group_theme": theme,
                        "seed_keyword": seed,
                        "keyword_candidate": str(t).strip(),
                        "source": "brave_web_title",
                    }
                )
            brave_dump.append(
                {
                    "seed_keyword": seed,
                    "source": "brave_web_title",
                    "raw_text": t,
                    "altered_query": alt,
                    "title": t,
                    "description": "",
                }
            )
        for d in web.get("descriptions") or []:
            brave_dump.append(
                {
                    "seed_keyword": seed,
                    "source": "brave_web_description",
                    "raw_text": d[:500],
                    "altered_query": alt,
                    "title": "",
                    "description": d[:500],
                }
            )
    except Exception as e:
        logger.error("Brave web failed for %r: %s", seed, e)

    return candidates, brave_dump


def gsc_rows_to_candidates(
    gsc_rows: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for r in gsc_rows:
        q = (r.get("query") or "").strip()
        if not q:
            continue
        fam = str(r.get("inferred_campaign_family", "Diagnostics & VOR"))
        out.append(
            {
                "campaign_family": fam,
                "seed_ad_group_theme": "Search Console",
                "seed_keyword": q,
                "keyword_candidate": q,
                "source": "gsc_query",
            }
        )
    return out


def dedupe_and_score(
    raw: list[dict[str, Any]],
    settings: ResearchSettings,
    validation_ctx: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    """Merge by (campaign_family, normalized_keyword); score once."""
    by_key: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
    for it in raw:
        nk = normalize_keyword(it["keyword_candidate"])
        if not nk:
            continue
        key = (it["campaign_family"], nk)
        by_key[key].append(it)

    master: list[dict[str, Any]] = []
    for (_fam, nk), group in sorted(by_key.items(), key=lambda x: (x[0][0], x[0][1])):
        sources = sorted({str(it["source"]) for it in group})
        source_merged = ";".join(sources)
        best_seed = group[0]["seed_keyword"]
        best_kw = group[0]["keyword_candidate"]
        best_rel = -1
        fam = group[0]["campaign_family"]
        for it in group:
            rel = score_relevance(
                nk,
                normalize_keyword(it["seed_keyword"]),
                fam,
            )
            if rel > best_rel:
                best_rel = rel
                best_seed = it["seed_keyword"]
                best_kw = it["keyword_candidate"]
        scored = score_row(
            best_kw,
            best_seed,
            fam,
            settings,
            source_merged=source_merged,
            validation_ctx=validation_ctx,
        )
        row: dict[str, Any] = {
            "campaign_family": fam,
            "ad_group_theme": scored["ad_group_theme"],
            "seed_keyword": best_seed,
            "keyword_candidate": best_kw.strip(),
            "source": source_merged,
            "normalized_keyword": nk,
            "tier_status": scored["tier_status"],
            "intent_score": scored["intent_score"],
            "local_intent_score": scored["local_intent_score"],
            "commercial_intent_score": scored["commercial_intent_score"],
            "relevance_score": scored["relevance_score"],
            "adjusted_relevance_score": scored["adjusted_relevance_score"],
            "source_trust_multiplier": scored["source_trust_multiplier"],
            "negative_risk_score": scored["negative_risk_score"],
            "landing_page_fit_score": scored["landing_page_fit_score"],
            "source_validation_score": scored["source_validation_score"],
            "breadth_score": scored["breadth_score"],
            "ambiguity_risk_score": scored["ambiguity_risk_score"],
            "recommended_match_type": scored["recommended_match_type"],
            "status_recommendation": scored["status_recommendation"],
            "notes": scored["notes"],
        }
        master.append(row)
    return master


def build_seed_summary(
    raw: list[dict[str, Any]],
    master: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    master_by_fam_norm: dict[tuple[str, str], dict[str, Any]] = {}
    for m in master:
        master_by_fam_norm[(m["campaign_family"], m["normalized_keyword"])] = m

    seeds_seen: dict[tuple[str, str], None] = {}
    for it in raw:
        seeds_seen[(it["campaign_family"], it["seed_keyword"])] = None

    summary: list[dict[str, Any]] = []
    for fam, seed_kw in sorted(seeds_seen.keys(), key=lambda x: (x[0], x[1])):
        norms: set[str] = set()
        for it in raw:
            if it["campaign_family"] != fam or it["seed_keyword"] != seed_kw:
                continue
            nk = normalize_keyword(it["keyword_candidate"])
            if nk:
                norms.add(nk)
        inc = rev = neg = 0
        for nk in norms:
            m = master_by_fam_norm.get((fam, nk))
            if not m:
                continue
            tier = m.get("tier_status", "")
            if tier == "include_now":
                inc += 1
            elif tier == "exclude_negative":
                neg += 1
            elif tier in (
                "review_high_priority",
                "review_broad_test",
                "future_test",
            ):
                rev += 1
            elif m.get("status_recommendation") == "include":
                inc += 1
            elif m.get("status_recommendation") == "exclude_negative":
                neg += 1
            else:
                rev += 1
        summary.append(
            {
                "seed_keyword": seed_kw,
                "campaign_family": fam,
                "total_candidates": len(norms),
                "include_count": inc,
                "review_count": rev,
                "negative_count": neg,
            }
        )
    return summary


def build_ads_match_rows(
    master: list[dict[str, Any]],
    idx: dict[str, set[str]],
) -> list[dict[str, Any]]:
    st = idx.get("known_search_terms", set())
    neg = idx.get("known_negatives", set())
    rec = idx.get("recommended_keywords", set())
    out: list[dict[str, Any]] = []
    for r in master:
        nk = str(r.get("normalized_keyword", "")).strip().lower()
        nk2 = " ".join(nk.split())
        out.append(
            {
                "normalized_keyword": nk2,
                "campaign_family": r.get("campaign_family", ""),
                "matched_search_term": "yes" if nk2 in st else "",
                "matched_negative": "yes" if nk2 in neg else "",
                "matched_recommendation": "yes" if nk2 in rec else "",
            }
        )
    return out


def source_contribution_stats(master: list[dict[str, Any]]) -> Counter[str]:
    c: Counter[str] = Counter()
    for r in master:
        for p in str(r.get("source", "")).split(";"):
            p = p.strip()
            if p:
                c[p] += 1
    return c


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="Keyword research for TriPoint (SerpApi + optional sources)"
    )
    p.add_argument(
        "--sample",
        action="store_true",
        help="Use first 3 seeds per campaign family only (smoke test).",
    )
    p.add_argument(
        "--output-dir",
        default=None,
        help="Override output directory (default from settings).",
    )
    p.add_argument(
        "--delay",
        type=float,
        default=None,
        help="Override request delay seconds between API calls.",
    )
    p.add_argument("--use-serpapi", action="store_true", help="Enable SerpApi (default on).")
    p.add_argument(
        "--no-serpapi",
        action="store_true",
        help="Disable SerpApi collection.",
    )
    p.add_argument("--use-brave", action="store_true", help="Enable Brave Search API.")
    p.add_argument(
        "--use-search-console",
        action="store_true",
        help="Pull queries from Google Search Console.",
    )
    p.add_argument(
        "--use-ads-script-exports",
        action="store_true",
        help="Load Ads Script CSV exports from ads_export_dir.",
    )
    p.add_argument(
        "--all-sources",
        action="store_true",
        help="Enable Brave, Search Console, and Ads exports where configured.",
    )
    p.add_argument(
        "--broad-mode",
        action="store_true",
        help="Softer relevance/commercial thresholds; tiered classification.",
    )
    p.add_argument(
        "--tiered",
        action="store_true",
        help="Use five-tier classification (overrides default legacy include/review/exclude).",
    )
    p.add_argument(
        "--expansion-only",
        action="store_true",
        help="Modifier expansion + scoring only; no SerpApi/Brave/GSC API calls.",
    )
    p.add_argument(
        "--validation-only",
        action="store_true",
        help="Re-score existing keyword_research_master.csv with validation context only.",
    )
    p.add_argument(
        "--modifier-expansion",
        action="store_true",
        help="Run combinational modifier expansion (also on with --broad-mode).",
    )
    p.add_argument(
        "--no-modifier-expansion",
        action="store_true",
        help="Disable modifier expansion even if --broad-mode.",
    )
    return p.parse_args()


def run_validation_only(settings: ResearchSettings, out_dir: str) -> None:
    from validation import build_validation_context

    master_path = Path(out_dir) / "keyword_research_master.csv"
    if not master_path.is_file():
        logger.error("Missing %s", master_path)
        sys.exit(1)
    rows_in: list[dict[str, str]] = []
    with open(master_path, newline="", encoding="utf-8") as f:
        rows_in = list(csv.DictReader(f))

    gsc_data = None
    ads_exports: dict[str, Any] | None = None
    idx = None
    site = (
        settings.search_console_site_url
        or os.environ.get("SEARCH_CONSOLE_SITE_URL", "").strip()
    )
    if site:
        from search_console_collector import fetch_search_console_queries, match_gsc_to_seeds

        gsc_data = match_gsc_to_seeds(
            fetch_search_console_queries(site, settings),
        )
    export_path = SCRIPT_DIR / settings.ads_export_dir
    if export_path.is_dir():
        ads_exports = load_ads_exports(str(export_path))
        idx = build_validation_index(ads_exports)
        ads_exports = dict(ads_exports)
        ads_exports["_index"] = idx

    validation_ctx = build_validation_context(gsc_data, ads_exports)

    master: list[dict[str, Any]] = []
    for r in rows_in:
        kw = r.get("keyword_candidate", "")
        seed = r.get("seed_keyword", kw)
        fam = r.get("campaign_family", "Diagnostics & VOR")
        src = r.get("source", "")
        scored = score_row(
            kw,
            seed,
            fam,
            settings,
            source_merged=src,
            validation_ctx=validation_ctx,
        )
        row = {
            "campaign_family": fam,
            "ad_group_theme": scored["ad_group_theme"],
            "seed_keyword": seed,
            "keyword_candidate": kw,
            "source": src,
            "normalized_keyword": scored["normalized_keyword"],
            "tier_status": scored["tier_status"],
            "intent_score": scored["intent_score"],
            "local_intent_score": scored["local_intent_score"],
            "commercial_intent_score": scored["commercial_intent_score"],
            "relevance_score": scored["relevance_score"],
            "adjusted_relevance_score": scored["adjusted_relevance_score"],
            "source_trust_multiplier": scored["source_trust_multiplier"],
            "negative_risk_score": scored["negative_risk_score"],
            "landing_page_fit_score": scored["landing_page_fit_score"],
            "source_validation_score": scored["source_validation_score"],
            "breadth_score": scored["breadth_score"],
            "ambiguity_risk_score": scored["ambiguity_risk_score"],
            "recommended_match_type": scored["recommended_match_type"],
            "status_recommendation": scored["status_recommendation"],
            "notes": scored["notes"],
        }
        master.append(row)

    raw_fake = [
        {
            "campaign_family": m["campaign_family"],
            "seed_keyword": m["seed_keyword"],
            "keyword_candidate": m["keyword_candidate"],
            "source": m["source"],
        }
        for m in master
    ]
    summary = build_seed_summary(raw_fake, master)
    ads_match = build_ads_match_rows(master, idx) if idx else None
    paths = write_all_csvs(
        out_dir,
        master,
        [],
        summary,
        validation_ctx=validation_ctx,
        gsc_rows=gsc_data,
        brave_dump_rows=None,
        ads_match_rows=ads_match,
    )
    _print_done(master, paths, source_contribution_stats(master))


def _print_done(
    master: list[dict[str, Any]],
    paths: list[str],
    stats: Counter[str],
) -> None:
    n_inc = sum(1 for r in master if r.get("tier_status") == "include_now")
    n_rev_hp = sum(
        1 for r in master if r.get("tier_status") == "review_high_priority"
    )
    n_broad = sum(
        1 for r in master if r.get("tier_status") == "review_broad_test"
    )
    n_future = sum(1 for r in master if r.get("tier_status") == "future_test")
    n_neg = sum(1 for r in master if r.get("tier_status") == "exclude_negative")

    print()
    print("--- Keyword research complete ---")
    print(f"Total candidates (deduped): {len(master)}")
    print(f"include_now: {n_inc}")
    print(f"review_high_priority: {n_rev_hp}")
    print(f"review_broad_test: {n_broad}")
    print(f"future_test: {n_future}")
    print(f"exclude_negative: {n_neg}")
    if stats:
        print("Source contribution (row counts after dedupe):")
        for k, v in stats.most_common():
            print(f"  {k}: {v}")
    print("Output files:")
    for path in paths:
        print(f"  {path}")


def main() -> None:
    args = parse_args()
    load_env()
    settings = ResearchSettings()
    if args.output_dir:
        settings.output_dir = args.output_dir
    if args.delay is not None:
        settings.request_delay = args.delay

    if args.no_serpapi:
        settings.use_serpapi = False
    elif args.use_serpapi:
        settings.use_serpapi = True

    if args.all_sources:
        settings.use_brave = True
        settings.use_search_console = True
        settings.use_ads_exports = True

    if args.use_brave:
        settings.use_brave = True
    if args.use_search_console:
        settings.use_search_console = True
    if args.use_ads_script_exports:
        settings.use_ads_exports = True

    if args.broad_mode:
        settings.broad_mode = True
        settings.legacy_three_bucket = False
        settings.modifier_expansion = True

    if args.modifier_expansion:
        settings.modifier_expansion = True

    if args.no_modifier_expansion:
        settings.modifier_expansion = False

    out_dir = str(SCRIPT_DIR / settings.output_dir)

    if args.validation_only:
        run_validation_only(settings, out_dir)
        return

    serp_needed = settings.use_serpapi and not args.expansion_only
    api_key = load_serpapi_key(required=serp_needed)
    brave_suggest_key: str | None = None
    brave_web_key: str | None = None
    if settings.use_brave:
        brave_suggest_key, brave_web_key = load_brave_keys()
    if settings.use_brave and not brave_suggest_key and not brave_web_key:
        logger.warning(
            "use_brave set but no Brave keys found "
            "(brave_suggest_api_key / brave_search_api_key); skipping Brave."
        )
        settings.use_brave = False

    settings.search_console_site_url = (
        settings.search_console_site_url
        or os.environ.get("SEARCH_CONSOLE_SITE_URL", "").strip()
    )

    use_expanded = settings.broad_mode
    seeds = flatten_seeds(use_expanded=use_expanded)
    if args.sample:
        by_fam: dict[str, list[dict[str, str]]] = defaultdict(list)
        for e in seeds:
            by_fam[e["campaign_family"]].append(e)
        seeds = []
        for fam in sorted(by_fam.keys()):
            seeds.extend(by_fam[fam][:3])
        logger.info("Sample mode: %s seeds", len(seeds))

    raw_all: list[dict[str, Any]] = []
    dump_all: list[dict[str, Any]] = []
    brave_dump_all: list[dict[str, Any]] = []
    gsc_enriched: list[dict[str, Any]] = []

    if args.expansion_only or not settings.use_serpapi:
        for entry in seeds:
            raw_all.append(
                {
                    "campaign_family": entry["campaign_family"],
                    "seed_ad_group_theme": entry["seed_ad_group_theme"],
                    "seed_keyword": entry["seed_keyword"],
                    "keyword_candidate": entry["seed_keyword"],
                    "source": "seed",
                }
            )

    if not args.expansion_only:
        if settings.use_serpapi and api_key:
            for i, entry in enumerate(seeds):
                logger.info(
                    "[%s/%s] SerpApi %s / %r",
                    i + 1,
                    len(seeds),
                    entry["campaign_family"],
                    entry["seed_keyword"],
                )
                cands, dumps = collect_for_seed_serp(entry, api_key, settings)
                raw_all.extend(cands)
                dump_all.extend(dumps)

        if settings.use_brave and brave_suggest_key and brave_web_key:
            for i, entry in enumerate(seeds):
                logger.info(
                    "[%s/%s] Brave %s / %r",
                    i + 1,
                    len(seeds),
                    entry["campaign_family"],
                    entry["seed_keyword"],
                )
                cands, bd = collect_for_seed_brave(
                    entry,
                    brave_suggest_key,
                    brave_web_key,
                    settings,
                )
                raw_all.extend(cands)
                brave_dump_all.extend(bd)

        if settings.use_search_console and settings.search_console_site_url:
            from search_console_collector import (
                fetch_search_console_queries,
                match_gsc_to_seeds,
            )

            try:
                gsc_enriched = match_gsc_to_seeds(
                    fetch_search_console_queries(
                        settings.search_console_site_url,
                        settings,
                    )
                )
                raw_all.extend(gsc_rows_to_candidates(gsc_enriched))
            except Exception as e:
                logger.error("Search Console failed: %s", e)

    if settings.modifier_expansion:
        for fam in ("Diagnostics & VOR", "Mercedes Van Servicing", "Van Tuning"):
            raw_all.extend(generate_modifier_candidates(fam, settings))

    ads_exports: dict[str, Any] | None = None
    ads_idx = None
    if settings.use_ads_exports:
        export_path = SCRIPT_DIR / settings.ads_export_dir
        if export_path.is_dir():
            ads_exports = load_ads_exports(str(export_path))
            ads_idx = build_validation_index(ads_exports)
            ads_exports = dict(ads_exports)
            ads_exports["_index"] = ads_idx
        else:
            logger.warning("Ads export dir missing: %s", export_path)

    from validation import build_validation_context

    validation_ctx = build_validation_context(gsc_enriched, ads_exports)

    master = dedupe_and_score(raw_all, settings, validation_ctx=validation_ctx)
    summary = build_seed_summary(raw_all, master)

    ads_match = (
        build_ads_match_rows(master, ads_idx)
        if ads_idx is not None
        else None
    )

    paths = write_all_csvs(
        out_dir,
        master,
        dump_all,
        summary,
        validation_ctx=validation_ctx,
        gsc_rows=gsc_enriched if gsc_enriched else None,
        brave_dump_rows=brave_dump_all if brave_dump_all else None,
        ads_match_rows=ads_match,
    )

    _print_done(master, paths, source_contribution_stats(master))


if __name__ == "__main__":
    main()
