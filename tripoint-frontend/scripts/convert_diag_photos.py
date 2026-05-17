"""Convert HEIC + JPG photos in public/images/diag_photos to web-ready JPGs."""
from pathlib import Path
import pillow_heif
from PIL import Image, ImageOps

pillow_heif.register_heif_opener()

ROOT = Path(__file__).resolve().parents[1] / "public" / "images" / "diag_photos"

RENAME = {
    "air_filter_clogged": "air-filter-clogged",
    "coilpacks_being swapped": "coilpacks-swap",
    "corroded_connector": "corroded-connector",
    "desoldered_chip_from_control_unit_circuit_board": "desoldered-ecu-chip",
    "ezs_opened_circuit_board": "ezs-circuit-board",
    "found_CAN_piggyback_device": "can-piggyback-device",
    "hairline_crack_intercooler": "intercooler-crack",
    "inside_intake_manifold_blocked": "intake-manifold-blocked",
    "multimer_showing_voltage": "multimeter-voltage",
    "multimeter_being_used": "multimeter-in-use",
    "multimeter_leads_in_exhuast_fpa-": "multimeter-exhaust-pulse",
    "oil_contaminated_egr_pipe": "egr-pipe-oil",
    "picoscope_and_multimeter": "picoscope-multimeter",
    "sensor_sooted_up": "sensor-sooted",
    "smoke_machine_leak_testing": "smoke-leak-test",
    "sump_off_cranksaft": "sump-off-crank",
}

MAX_WIDTH = 1600
QUALITY = 80
ALLOWED = {".heic", ".heif", ".jpg", ".jpeg"}

for src in sorted(ROOT.iterdir()):
    if not src.is_file():
        continue
    if src.suffix.lower() not in ALLOWED:
        continue
    target = RENAME.get(src.stem)
    if not target:
        print(f"skip (no rename): {src.name}")
        continue
    out = ROOT / f"{target}.jpg"
    if out.exists() and out.stat().st_mtime >= src.stat().st_mtime and out != src:
        print(f"up-to-date: {target}.jpg")
        continue
    img = Image.open(src)
    img = ImageOps.exif_transpose(img)
    if img.mode != "RGB":
        img = img.convert("RGB")
    if img.width > MAX_WIDTH:
        ratio = MAX_WIDTH / img.width
        img = img.resize((MAX_WIDTH, int(img.height * ratio)), Image.Resampling.LANCZOS)
    img.save(out, "JPEG", quality=QUALITY, optimize=True, progressive=True)
    kb = out.stat().st_size / 1024
    print(f"wrote {target}.jpg  ({kb:.0f} kB, {img.width}x{img.height})")

print("done")
