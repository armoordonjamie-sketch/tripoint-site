"""
TriPoint Diagnostics — Stock Photo Downloader
Downloads curated real stock photographs — NO PEOPLE visible.
Focused on: white vans, engine bays, diagnostic tools, UK roads, dashboards.

Usage:
    python generate_images.py              # download all
    python generate_images.py --dry-run    # preview only
    python generate_images.py --force      # overwrite existing
    python generate_images.py --only 1 3   # specific images only

All images: Pexels (free, no attribution required) or Unsplash (free).
"""

import argparse
import os
import sys
import time
from pathlib import Path

try:
    import requests
except ImportError:
    print("ERROR: 'requests' not installed. Run: pip install requests")
    sys.exit(1)

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
DEFAULT_OUTPUT_DIR = PROJECT_ROOT / "tripoint-frontend" / "public" / "images"
DELAY = 1

# ── Curated stock photos — NO PEOPLE ─────────────────────────────────
# Every image verified: no people, fits mobile diagnostics / automotive
IMAGES = [
    {
        "number": "1",
        "title": "Hero Background — White van on road at dusk",
        "filename": "hero-bg.jpg",
        "width": 1920, "height": 1080,
        # White delivery van driving on road, moody dusk sky
        "url": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&h=1080&fit=crop&crop=center",
        "credit": "Unsplash",
    },
    {
        "number": "2",
        "title": "Diagnostic Callout — OBD port close-up",
        "filename": "diagnostic-callout.jpg",
        "width": 800, "height": 600,
        # Car OBD port / diagnostic connector under dashboard
        "url": "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&h=600&fit=crop&crop=center",
        "credit": "Unsplash",
    },
    {
        "number": "3",
        "title": "VOR / Priority Triage — Delivery van at depot",
        "filename": "vor-triage.jpg",
        "width": 800, "height": 600,
        # White cargo van at loading dock / industrial
        "url": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop&crop=center",
        "credit": "Unsplash",
    },
    {
        "number": "4",
        "title": "Emissions Diagnostics — Exhaust pipe close-up",
        "filename": "emissions-diagnostics.jpg",
        "width": 800, "height": 600,
        # Exhaust pipe / tailpipe close-up, no people
        "url": "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=800&h=600&fit=crop&crop=center",
        "credit": "Unsplash",
    },
    {
        "number": "5",
        "title": "Pre-Purchase Health Check — Used van for sale",
        "filename": "pre-purchase.jpg",
        "width": 800, "height": 600,
        # Parked white van, clean, could be for sale, suburban setting
        "url": "https://images.unsplash.com/photo-1532581140115-3e355d1ed1de?w=800&h=600&fit=crop&crop=center",
        "credit": "Unsplash",
    },
    {
        "number": "6",
        "title": "About / Trust — Road at golden hour",
        "filename": "about-hero.jpg",
        "width": 1200, "height": 600,
        # Open road at golden hour, van perspective, no people
        "url": "https://images.unsplash.com/photo-1505170448632-e90b7bce19a0?w=1200&h=600&fit=crop&crop=center",
        "credit": "Unsplash",
    },
    {
        "number": "7",
        "title": "Coverage Map — English countryside aerial",
        "filename": "coverage-map.jpg",
        "width": 1200, "height": 600,
        # Aerial English countryside, green fields, winding roads
        "url": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=600&fit=crop&crop=center",
        "credit": "Unsplash",
    },
    {
        "number": "8.1",
        "title": "Step 1 — Phone on table",
        "filename": "step-1-get-in-touch.jpg",
        "width": 400, "height": 400,
        # Smartphone on a table, clean, no people
        "url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&crop=center",
        "credit": "Unsplash",
    },
    {
        "number": "8.2",
        "title": "Step 2 — Calendar / booking",
        "filename": "step-2-confirm-book.jpg",
        "width": 400, "height": 400,
        # Calendar / planner on desk, no people
        "url": "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&h=400&fit=crop&crop=center",
        "credit": "Unsplash",
    },
    {
        "number": "8.3",
        "title": "Step 3 — Laptop with data",
        "filename": "step-3-on-site-diagnosis.jpg",
        "width": 400, "height": 400,
        # Laptop screen showing data/graphs, no people
        "url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop&crop=center",
        "credit": "Unsplash",
    },
    {
        "number": "8.4",
        "title": "Step 4 — Clipboard / report",
        "filename": "step-4-written-fix-plan.jpg",
        "width": 400, "height": 400,
        # Clipboard with document, pen, on desk, no people
        "url": "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=400&fit=crop&crop=center",
        "credit": "Unsplash",
    },
    {
        "number": "9",
        "title": "Equipment / Tools — Flat lay",
        "filename": "tools-array.jpg",
        "width": 1200, "height": 400,
        # Mechanic tools arranged on dark surface, wrenches, flat lay
        "url": "https://images.unsplash.com/photo-1530124566582-a45a7e3f6391?w=1200&h=400&fit=crop&crop=center",
        "credit": "Unsplash",
    },
    {
        "number": "10",
        "title": "Testimonial Background — Dashboard at night",
        "filename": "testimonial-bg.jpg",
        "width": 1920, "height": 400,
        # Car dashboard / instrument cluster at night, dark moody
        "url": "https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=1920&h=400&fit=crop&crop=center",
        "credit": "Unsplash",
    },
    {
        "number": "11",
        "title": "Sprinter Specialist — Engine bay",
        "filename": "sprinter-specialist.jpg",
        "width": 800, "height": 600,
        # Car/van engine bay close-up, bonnet open, no people
        "url": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=600&fit=crop&crop=center",
        "credit": "Unsplash",
    },
    {
        "number": "12",
        "title": "Footer CTA — Road light trails at night",
        "filename": "cta-bg.jpg",
        "width": 1920, "height": 400,
        # Light trails on road at night, long exposure
        "url": "https://images.unsplash.com/photo-1524673450801-b5aa9b621b76?w=1920&h=400&fit=crop&crop=center",
        "credit": "Unsplash",
    },
    {
        "number": "13",
        "title": "Blog Header — Laptop on desk",
        "filename": "blog-header.jpg",
        "width": 1200, "height": 400,
        # Laptop on clean desk, no people, work setup
        "url": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&h=400&fit=crop&crop=center",
        "credit": "Unsplash",
    },
    {
        "number": "14",
        "title": "Mobile Van Setup — Van rear doors open",
        "filename": "mobile-setup.jpg",
        "width": 800, "height": 600,
        # Van with open rear doors showing cargo area / equipment
        "url": "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=800&h=600&fit=crop&crop=center",
        "credit": "Unsplash",
    },
]


def download_image(url: str, output_path: Path) -> bool:
    """Download image from URL."""
    try:
        resp = requests.get(url, timeout=30, stream=True, headers={
            "User-Agent": "TriPointDiagnostics/1.0",
        })
        resp.raise_for_status()

        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)

        kb = output_path.stat().st_size / 1024
        print(f"    ✓ Saved: {output_path.name} ({kb:.0f} KB)")
        return True

    except requests.exceptions.HTTPError as e:
        print(f"    ✗ HTTP {e.response.status_code}")
        return False
    except Exception as e:
        print(f"    ✗ Error: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Download stock photos for TriPoint site")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--only", nargs="+")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    images = IMAGES
    if args.only:
        images = [img for img in images if img["number"] in args.only]

    print(f"\n📸 TriPoint Diagnostics — Stock Photo Downloader")
    print(f"   {len(images)} images  |  NO people  |  Unsplash (free)\n")
    print("=" * 60)
    for img in images:
        print(f"  [{img['number']:>4}] {img['title']}")
        print(f"         {img['filename']} ({img['width']}×{img['height']})")
    print("=" * 60)

    if args.dry_run:
        print("\n🏁 Dry run — no files downloaded.")
        return

    output_dir = args.output.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    print(f"\n⬇ Downloading to: {output_dir}\n")

    ok = skip = fail = 0
    for i, img in enumerate(images):
        path = output_dir / img["filename"]
        if path.exists() and not args.force:
            print(f"[{img['number']:>4}] {img['title']} — SKIPPED")
            skip += 1; continue

        print(f"[{img['number']:>4}] {img['title']}...")
        if download_image(img["url"], path):
            ok += 1
        else:
            fail += 1

        if i < len(images) - 1:
            time.sleep(DELAY)

    print(f"\n{'=' * 60}")
    print(f"🏁 {ok} downloaded, {skip} skipped, {fail} failed.")
    print(f"   Output: {output_dir}")


if __name__ == "__main__":
    main()
