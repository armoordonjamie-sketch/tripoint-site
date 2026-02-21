"""
TriPoint Diagnostics - Image Processor
1. Converts HEIC/PNG images to JPEG
2. Sends each image to Gemini 3 Flash Preview via OpenRouter for analysis
3. Builds a JSON file with descriptions
4. Assigns best image to each website section
5. Copies assigned images to tripoint-frontend/public/images/

Usage:
    python process_images.py                  # full pipeline
    python process_images.py --convert-only   # just convert HEIC→JPEG
    python process_images.py --analyze-only   # just analyze (skip convert)
    python process_images.py --assign-only    # just assign from existing JSON
"""

import argparse
import base64
import json
import os
import shutil
import sys
import time
from pathlib import Path
from typing import Optional

try:
    import requests
except ImportError:
    print("ERROR: 'requests' not installed. Run: pip install requests")
    sys.exit(1)

try:
    from PIL import Image
    from pillow_heif import register_heif_opener
    register_heif_opener()
    HEIF_SUPPORT = True
except ImportError:
    HEIF_SUPPORT = False
    print("WARNING: pillow-heif not installed. HEIC files will be skipped.")
    print("         Run: pip install pillow-heif")

# ── Config ────────────────────────────────────────────────────────────
OPENROUTER_API_KEY = os.getenv(
    "OPENROUTER_API_KEY",
    "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",
)
GEMINI_MODEL = "google/gemini-3-flash-preview"
API_URL = "https://openrouter.ai/api/v1/chat/completions"

SCRIPT_DIR = Path(__file__).resolve().parent
MY_IMAGES_DIR = SCRIPT_DIR / "my-images"
CONVERTED_DIR = SCRIPT_DIR / "converted"
JSON_FILE = SCRIPT_DIR / "image-descriptions.json"
OUTPUT_DIR = SCRIPT_DIR.parent / "tripoint-frontend" / "public" / "images"

DELAY_BETWEEN_REQUESTS = 2  # seconds

# ── Website sections that need images ─────────────────────────────────
SECTIONS = [
    {
        "id": "hero-bg",
        "filename": "hero-bg.jpg",
        "description": "Hero background - the main banner image at the top of the homepage. Best fit: a wide shot of your van, your setup, or something that represents mobile diagnostics at a glance. Preferably dramatic or atmospheric.",
        "priority_keywords": ["van", "sprinter", "parked", "driveway", "road", "setup", "mobile", "wide shot"],
    },
    {
        "id": "diagnostic-callout",
        "filename": "diagnostic-callout.jpg",
        "description": "Diagnostic Callout service page - showing diagnostic work. Best fit: OBD cable connected, laptop showing diagnostics, Xentry screen, or hands-on diagnostic work.",
        "priority_keywords": ["diagnostic", "obd", "xentry", "laptop", "screen", "cable", "connected", "fault", "scan"],
    },
    {
        "id": "vor-triage",
        "filename": "vor-triage.jpg",
        "description": "VOR / Priority Triage service page - urgent commercial vehicle repair. Best fit: a commercial van or fleet vehicle, depot setting, or urgent breakdown scenario.",
        "priority_keywords": ["van", "commercial", "fleet", "breakdown", "urgent", "depot", "loading", "sprinter", "parked"],
    },
    {
        "id": "emissions-diagnostics",
        "filename": "emissions-diagnostics.jpg",
        "description": "Emissions Diagnostics service page - exhaust, DPF, AdBlue, SCR work. Best fit: exhaust system, engine bay, emissions-related components, under-vehicle work.",
        "priority_keywords": ["exhaust", "dpf", "adblue", "engine", "emissions", "underside", "pipe", "filter"],
    },
    {
        "id": "pre-purchase",
        "filename": "pre-purchase.jpg",
        "description": "Pre-Purchase Health Check service page - inspecting a vehicle before buying. Best fit: checking a vehicle, inspection report, looking at a van critically.",
        "priority_keywords": ["inspection", "check", "report", "condition", "exterior", "bodywork", "full vehicle"],
    },
    {
        "id": "about-hero",
        "filename": "about-hero.jpg",
        "description": "About / Trust section - professional credibility. Best fit: your full setup, branded van, professional equipment laid out, or a wide atmospheric shot.",
        "priority_keywords": ["professional", "setup", "branded", "equipment", "tools", "van", "workshop"],
    },
    {
        "id": "sprinter-specialist",
        "filename": "sprinter-specialist.jpg",
        "description": "Sprinter Specialist section - Mercedes Sprinter expertise. Best fit: engine bay of a Sprinter, Sprinter-specific work, close-up of Mercedes engine or components.",
        "priority_keywords": ["sprinter", "mercedes", "engine bay", "engine", "bonnet", "diesel", "motor"],
    },
    {
        "id": "tools-array",
        "filename": "tools-array.jpg",
        "description": "Equipment/Tools banner - showing your professional toolkit. Best fit: tools laid out, diagnostic equipment, laptop and cables, professional setup.",
        "priority_keywords": ["tools", "equipment", "laptop", "cables", "laid out", "organised", "kit", "case"],
    },
    {
        "id": "testimonial-bg",
        "filename": "testimonial-bg.jpg",
        "description": "Testimonial background - subtle dark background for customer quotes. Best fit: dashboard close-up, dark moody shot, interior of van, abstract/atmospheric.",
        "priority_keywords": ["dashboard", "dark", "interior", "moody", "night", "close-up", "abstract", "subtle"],
    },
    {
        "id": "cta-bg",
        "filename": "cta-bg.jpg",
        "description": "Footer CTA background - call-to-action banner. Best fit: road shot, light trails, atmospheric driving shot, or dramatic wide angle.",
        "priority_keywords": ["road", "driving", "wide", "atmospheric", "night", "lights", "dramatic"],
    },
    {
        "id": "blog-header",
        "filename": "blog-header.jpg",
        "description": "Blog header - technical/knowledge section. Best fit: laptop with diagnostic screen, technical documentation, workspace setup.",
        "priority_keywords": ["laptop", "screen", "technical", "desk", "work", "data", "reading"],
    },
    {
        "id": "mobile-setup",
        "filename": "mobile-setup.jpg",
        "description": "Mobile Van Setup - showing your mobile workshop. Best fit: van interior with organised equipment, rear doors open showing kit, mobile workshop setup.",
        "priority_keywords": ["van interior", "rear", "doors open", "kit", "organised", "mobile", "workshop", "storage"],
    },
    {
        "id": "coverage-map",
        "filename": "coverage-map.jpg",
        "description": "Coverage map section background. Best fit: road/driving shot, area landscape, or any wide scenic shot. Can be atmospheric.",
        "priority_keywords": ["road", "landscape", "driving", "aerial", "wide", "countryside"],
    },
]


# ── Step 1: Convert HEIC/PNG to JPEG ──────────────────────────────────
def convert_images():
    """Convert HEIC and PNG images to JPEG format."""
    print("\n📸 Step 1: Converting images to JPEG...")
    CONVERTED_DIR.mkdir(parents=True, exist_ok=True)

    source_files = list(MY_IMAGES_DIR.iterdir())
    converted = 0
    skipped = 0

    for f in sorted(source_files):
        if not f.is_file():
            continue

        ext = f.suffix.upper()
        out_name = f.stem + ".jpg"
        out_path = CONVERTED_DIR / out_name

        if out_path.exists():
            skipped += 1
            continue

        if ext in (".HEIC", ".HEIF"):
            if not HEIF_SUPPORT:
                print(f"  ⚠ Skipping {f.name} (no HEIC support)")
                continue
            try:
                img = Image.open(f)
                img = img.convert("RGB")
                img.save(out_path, "JPEG", quality=90)
                print(f"  ✓ {f.name} → {out_name}")
                converted += 1
            except Exception as e:
                print(f"  ✗ {f.name}: {e}")

        elif ext == ".PNG":
            try:
                img = Image.open(f)
                img = img.convert("RGB")
                img.save(out_path, "JPEG", quality=90)
                print(f"  ✓ {f.name} → {out_name}")
                converted += 1
            except Exception as e:
                print(f"  ✗ {f.name}: {e}")

        elif ext in (".JPG", ".JPEG"):
            # Already JPEG - just copy
            shutil.copy2(f, out_path)
            print(f"  ✓ {f.name} → {out_name} (copied)")
            converted += 1

    print(f"\n  Done: {converted} converted, {skipped} already existed")
    print(f"  Output: {CONVERTED_DIR}")
    return True


# ── Step 2: Analyze images with Gemini ──────────────────────────────
def image_to_base64(path: Path) -> str:
    """Read image and encode as base64."""
    data = path.read_bytes()
    return base64.b64encode(data).decode("utf-8")


def analyze_image(path: Path) -> Optional[str]:
    """Send image to Gemini 3 Flash Preview for analysis."""
    b64 = image_to_base64(path)

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://tripointdiagnostics.co.uk",
        "X-Title": "TriPoint Image Analyzer",
    }

    payload = {
        "model": GEMINI_MODEL,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": (
                            "You are analyzing images for a mobile vehicle diagnostics business called TriPoint Diagnostics. "
                            "They specialise in Mercedes Sprinter vans, using Xentry diagnostic software and Star Diagnosis equipment.\n\n"
                            "Describe this image in detail. Include:\n"
                            "1. What is shown (objects, vehicles, equipment, setting)\n"
                            "2. The type of vehicle if visible (make, model, color)\n"
                            "3. Any diagnostic tools, laptops, OBD cables, or equipment visible\n"
                            "4. The lighting and mood (bright, dark, moody, professional)\n"
                            "5. Whether it shows: van exterior, van interior, engine bay, diagnostic screen, tools, road/driving, workshop\n"
                            "6. Image orientation (portrait or landscape) and quality assessment\n"
                            "7. Whether any people/faces are visible\n\n"
                            "Be specific and factual. Keep to 3-5 sentences."
                        ),
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{b64}",
                        },
                    },
                ],
            }
        ],
        "max_tokens": 500,
    }

    try:
        resp = requests.post(API_URL, headers=headers, json=payload, timeout=60)
        resp.raise_for_status()
        data = resp.json()

        content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
        if content:
            return content.strip()
        else:
            print(f"    ⚠ Empty response")
            return None

    except requests.exceptions.HTTPError as e:
        print(f"    ✗ HTTP {e.response.status_code}: {e.response.text[:200]}")
        return None
    except Exception as e:
        print(f"    ✗ Error: {e}")
        return None


def analyze_all_images():
    """Analyze all converted images and save descriptions to JSON."""
    print("\n🔍 Step 2: Analyzing images with Gemini 3 Flash Preview...")

    # Load existing results
    existing = {}
    if JSON_FILE.exists():
        try:
            existing = {img["filename"]: img for img in json.loads(JSON_FILE.read_text(encoding="utf-8"))}
            print(f"  Loaded {len(existing)} existing analyses")
        except Exception:
            pass

    jpeg_files = sorted(CONVERTED_DIR.glob("*.jpg"))
    print(f"  Found {len(jpeg_files)} images to analyze\n")

    results = []
    analyzed = 0
    skipped = 0

    for i, f in enumerate(jpeg_files):
        if f.name in existing:
            print(f"  [{i+1:>3}/{len(jpeg_files)}] {f.name} - cached")
            results.append(existing[f.name])
            skipped += 1
            continue

        print(f"  [{i+1:>3}/{len(jpeg_files)}] {f.name}...", end=" ", flush=True)
        desc = analyze_image(f)

        if desc:
            entry = {
                "filename": f.name,
                "original_path": str(f),
                "description": desc,
                "size_kb": round(f.stat().st_size / 1024),
            }
            # Get dimensions
            try:
                with Image.open(f) as img:
                    entry["width"] = img.width
                    entry["height"] = img.height
                    entry["orientation"] = "landscape" if img.width > img.height else "portrait"
            except Exception:
                pass

            results.append(entry)
            print(f"✓")
            analyzed += 1
        else:
            print(f"✗")

        # Save progress after each image (resume-friendly)
        JSON_FILE.write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding="utf-8")

        if i < len(jpeg_files) - 1:
            time.sleep(DELAY_BETWEEN_REQUESTS)

    print(f"\n  Done: {analyzed} analyzed, {skipped} cached")
    print(f"  JSON: {JSON_FILE}")
    return results


# ── Step 3: Assign images to sections ─────────────────────────────────
def assign_images(descriptions: list):
    """Use Gemini to assign the best image to each website section."""
    print("\n🎯 Step 3: Assigning images to website sections...\n")

    # Build a summary of all images for Gemini
    image_summaries = []
    for i, img in enumerate(descriptions):
        image_summaries.append(
            f"  [{i}] {img['filename']} - {img.get('orientation', '?')}, "
            f"{img.get('width', '?')}×{img.get('height', '?')}, "
            f"{img.get('size_kb', '?')}KB\n"
            f"      Description: {img['description']}"
        )

    section_list = []
    for s in SECTIONS:
        section_list.append(
            f"  - \"{s['id']}\" ({s['filename']}): {s['description']}"
        )

    prompt = (
        "You are helping assign images to website sections for TriPoint Diagnostics, "
        "a mobile Mercedes Sprinter diagnostic business.\n\n"
        "Here are the available images:\n\n"
        + "\n\n".join(image_summaries)
        + "\n\n"
        "Here are the website sections that need images:\n\n"
        + "\n".join(section_list)
        + "\n\n"
        "RULES:\n"
        "- Assign exactly ONE image to each section\n"
        "- You may use the same image for multiple sections if it's the best fit\n"
        "- Prefer landscape images for wide banners (hero-bg, about-hero, cta-bg, testimonial-bg, tools-array, coverage-map, blog-header)\n"
        "- Prefer images showing diagnostic equipment/Xentry/laptop for diagnostic sections\n"
        "- Prefer van exterior shots for hero and van-related sections\n"
        "- Avoid using images with people's faces visible for background sections\n\n"
        "Return ONLY a JSON object mapping section_id to the image index number. Example:\n"
        '{"hero-bg": 0, "diagnostic-callout": 5, ...}\n'
        "Return ONLY the JSON, no explanation."
    )

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://tripointdiagnostics.co.uk",
        "X-Title": "TriPoint Image Assigner",
    }

    payload = {
        "model": GEMINI_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 1000,
    }

    try:
        resp = requests.post(API_URL, headers=headers, json=payload, timeout=60)
        resp.raise_for_status()
        data = resp.json()
        content = data.get("choices", [{}])[0].get("message", {}).get("content", "")

        # Extract JSON from response
        content = content.strip()
        if content.startswith("```"):
            content = content.split("\n", 1)[1] if "\n" in content else content[3:]
            content = content.rsplit("```", 1)[0]
        content = content.strip()

        assignments = json.loads(content)
        print("  Gemini assignment:")

        for section in SECTIONS:
            sid = section["id"]
            if sid in assignments:
                idx = assignments[sid]
                if 0 <= idx < len(descriptions):
                    img = descriptions[idx]
                    print(f"    {sid:.<30} [{idx}] {img['filename']}")
                else:
                    print(f"    {sid:.<30} ✗ Invalid index {idx}")
            else:
                print(f"    {sid:.<30} ✗ Not assigned")

        return assignments

    except json.JSONDecodeError as e:
        print(f"  ✗ JSON parse error: {e}")
        print(f"  Raw response: {content[:300]}")
        return None
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return None


# ── Step 4: Copy assigned images to output ────────────────────────────
def copy_to_output(descriptions: list, assignments: dict):
    """Copy assigned images to the website's public/images directory."""
    print(f"\n📁 Step 4: Copying images to {OUTPUT_DIR}...\n")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    copied = 0
    for section in SECTIONS:
        sid = section["id"]
        if sid not in assignments:
            print(f"  ⚠ {sid} - no assignment, skipping")
            continue

        idx = assignments[sid]
        if idx < 0 or idx >= len(descriptions):
            print(f"  ⚠ {sid} - invalid index {idx}")
            continue

        src = Path(descriptions[idx]["original_path"])
        dst = OUTPUT_DIR / section["filename"]

        if not src.exists():
            print(f"  ✗ {sid} - source not found: {src.name}")
            continue

        shutil.copy2(src, dst)
        kb = dst.stat().st_size / 1024
        print(f"  ✓ {section['filename']:.<35} ← {src.name} ({kb:.0f} KB)")
        copied += 1

    print(f"\n  Done: {copied}/{len(SECTIONS)} sections filled")
    print(f"  Output: {OUTPUT_DIR}")

    # Save assignments JSON for reference
    assignments_file = SCRIPT_DIR / "image-assignments.json"
    assignment_details = {}
    for section in SECTIONS:
        sid = section["id"]
        if sid in assignments:
            idx = assignments[sid]
            if 0 <= idx < len(descriptions):
                assignment_details[sid] = {
                    "section_filename": section["filename"],
                    "source_image": descriptions[idx]["filename"],
                    "description": descriptions[idx]["description"],
                }
    assignments_file.write_text(json.dumps(assignment_details, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"  Assignments saved: {assignments_file}")


# ── Main ──────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Process TriPoint images: convert → analyze → assign → copy")
    parser.add_argument("--convert-only", action="store_true", help="Only convert HEIC→JPEG")
    parser.add_argument("--analyze-only", action="store_true", help="Only analyze (skip convert)")
    parser.add_argument("--assign-only", action="store_true", help="Only assign from existing JSON")
    args = parser.parse_args()

    print("=" * 60)
    print("  TriPoint Diagnostics - Image Processor")
    print("=" * 60)

    if args.assign_only:
        if not JSON_FILE.exists():
            print(f"ERROR: {JSON_FILE} not found. Run without --assign-only first.")
            sys.exit(1)
        descriptions = json.loads(JSON_FILE.read_text(encoding="utf-8"))
        assignments = assign_images(descriptions)
        if assignments:
            copy_to_output(descriptions, assignments)
        return

    if not args.analyze_only:
        convert_images()

    if args.convert_only:
        return

    descriptions = analyze_all_images()

    if not descriptions:
        print("ERROR: No images analyzed.")
        sys.exit(1)

    assignments = assign_images(descriptions)
    if assignments:
        copy_to_output(descriptions, assignments)

    print(f"\n{'=' * 60}")
    print("  ✅ All done!")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
