#!/usr/bin/env python3
"""
Convert a MileTrack CSV export into a FreeAgent mileage import CSV.

Designed for MileTrack "accounting" exports and FreeAgent's mileage import template.

Example:
    python miletrack_to_freeagent.py \
        --input miletrack.csv \
        --output freeagent.csv \
        --claimant-name "Jamie Armoordon" \
        --engine-type Diesel \
        --engine-size "Over 2000cc" \
        --have-vat-receipt

By default, the script only exports trips that look claimable:
- Classification/business flags indicate business
- Deductibility is "deductible"
- Commute trips are excluded if MileTrack marks them as commute

Review the output before importing into FreeAgent.
"""
from __future__ import annotations

import argparse
import csv
import math
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional


FREEAGENT_HEADERS = [
    "claimant_name",
    "DD/MM/YYYY",
    "description",
    "mileage",
    "vehicle_type",
    "engine_type",
    "engine_size",
    "reclaim_mileage",
    "project_client",
    "project_name",
    "rebill_to_project",
    "rebill_mileage_rate",
    "have_vat_receipt",
]


REQUIRED_MILETRACK_COLUMNS = {"Date", "Purpose"}


def fail(message: str, exit_code: int = 1) -> None:
    print(f"Error: {message}", file=sys.stderr)
    raise SystemExit(exit_code)


def text(value: object) -> str:
    if value is None:
        return ""
    value = str(value)
    if value.lower() == "nan":
        return ""
    return value.strip()


def parse_bool(value: object) -> Optional[bool]:
    s = text(value).lower()
    if s in {"1", "true", "yes", "y"}:
        return True
    if s in {"0", "false", "no", "n"}:
        return False
    return None


def parse_float(value: object) -> Optional[float]:
    s = text(value)
    if not s:
        return None
    try:
        return float(s)
    except ValueError:
        return None


def detect_distance_unit(row: Dict[str, object]) -> str:
    # Prefer explicit unit fields when present.
    for key in ("trip_distance_unit", "report_distance_unit"):
        unit = text(row.get(key)).lower()
        if unit:
            return unit

    distance = text(row.get("Distance")).lower()
    if distance.endswith(" mi"):
        return "miles"
    if distance.endswith(" km"):
        return "kilometres"
    return ""


def parse_distance_to_miles(row: Dict[str, object]) -> float:
    """
    Return distance in miles, suitable for FreeAgent.

    Uses `trip_reimbursable_units` if present, otherwise parses the `Distance`
    display field.
    """
    unit = detect_distance_unit(row)

    units_value = parse_float(row.get("trip_reimbursable_units"))
    if units_value is not None:
        value = units_value
    else:
        raw = text(row.get("Distance"))
        if not raw:
            fail("Could not find a usable distance value in MileTrack row.")
        number = raw.split()[0].replace(",", "")
        try:
            value = float(number)
        except ValueError:
            fail(f"Could not parse distance value: {raw!r}")

    if unit in {"mile", "miles", "mi"} or not unit:
        return value
    if unit in {"kilometre", "kilometres", "kilometer", "kilometers", "km"}:
        return value / 1.609344

    fail(f"Unsupported distance unit: {unit!r}")
    return value  # Unreachable.


def format_mileage(value: float) -> str:
    # FreeAgent accepts numbers in the mileage column; keeping up to 2dp is tidy.
    rounded = round(value + 1e-9, 2)
    if math.isclose(rounded, round(rounded)):
        return str(int(round(rounded)))
    return f"{rounded:.2f}".rstrip("0").rstrip(".")


def row_is_business(row: Dict[str, object]) -> bool:
    # Respect a few possible MileTrack business indicators.
    for key in ("trip_is_business",):
        parsed = parse_bool(row.get(key))
        if parsed is not None:
            return parsed

    for key in ("Classification", "trip_classification"):
        s = text(row.get(key)).lower()
        if s:
            return s == "business"

    return True


def row_is_deductible(row: Dict[str, object]) -> bool:
    s = text(row.get("Deductibility")).lower()
    if s:
        return s == "deductible"

    commute = parse_bool(row.get("trip_is_commute"))
    if commute is True:
        return False

    return True


@dataclass
class Config:
    claimant_name: str
    vehicle_type: str
    engine_type: str
    engine_size: str
    reclaim_mileage: bool
    have_vat_receipt: bool
    include_non_business: bool
    include_non_deductible: bool
    project_client: str
    project_name: str
    rebill_to_project: bool
    rebill_mileage_rate: str


def convert_rows(rows: Iterable[Dict[str, object]], config: Config) -> List[Dict[str, str]]:
    output_rows: List[Dict[str, str]] = []

    for idx, row in enumerate(rows, start=1):
        if not config.include_non_business and not row_is_business(row):
            continue
        if not config.include_non_deductible and not row_is_deductible(row):
            continue

        date_str = text(row.get("Date"))
        description = text(row.get("Purpose")) or "Mileage claim"
        mileage_miles = parse_distance_to_miles(row)

        freeagent_row = {
            "claimant_name": config.claimant_name,
            "DD/MM/YYYY": date_str,
            "description": description,
            "mileage": format_mileage(mileage_miles),
            "vehicle_type": config.vehicle_type,
            "engine_type": config.engine_type if config.vehicle_type.lower() == "car" else "",
            "engine_size": config.engine_size if config.vehicle_type.lower() == "car" else "",
            "reclaim_mileage": "1" if config.reclaim_mileage else "0",
            "project_client": config.project_client,
            "project_name": config.project_name,
            "rebill_to_project": "True" if config.rebill_to_project else "",
            "rebill_mileage_rate": config.rebill_mileage_rate if config.rebill_to_project else "",
            "have_vat_receipt": "True" if config.have_vat_receipt else "",
        }

        # Minimal validation.
        if not freeagent_row["claimant_name"]:
            fail("claimant_name cannot be blank.")
        if not freeagent_row["DD/MM/YYYY"]:
            fail(f"Missing Date value on MileTrack row {idx}.")
        if not freeagent_row["description"]:
            fail(f"Missing Purpose/description on MileTrack row {idx}.")
        if not freeagent_row["mileage"]:
            fail(f"Missing mileage on MileTrack row {idx}.")

        output_rows.append(freeagent_row)

    return output_rows


def read_csv(path: Path) -> List[Dict[str, object]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        if reader.fieldnames is None:
            fail("Input CSV has no header row.")
        missing = REQUIRED_MILETRACK_COLUMNS - set(reader.fieldnames)
        if missing:
            fail(
                "Input CSV does not look like a MileTrack export. Missing columns: "
                + ", ".join(sorted(missing))
            )
        return list(reader)


def write_csv(path: Path, rows: List[Dict[str, str]]) -> None:
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=FREEAGENT_HEADERS)
        writer.writeheader()
        writer.writerows(rows)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Convert a MileTrack CSV export into a FreeAgent mileage CSV."
    )
    parser.add_argument("--input", required=True, help="Path to MileTrack CSV export")
    parser.add_argument("--output", required=True, help="Path to output FreeAgent CSV")
    parser.add_argument(
        "--claimant-name",
        required=True,
        help="Exact FreeAgent user name for the mileage claimant",
    )
    parser.add_argument("--vehicle-type", default="Car", help="FreeAgent vehicle_type value")
    parser.add_argument(
        "--engine-type",
        default="Diesel",
        help="FreeAgent engine_type value (for cars), e.g. Diesel",
    )
    parser.add_argument(
        "--engine-size",
        default="Over 2000cc",
        help='FreeAgent engine_size value (for cars), e.g. "Over 2000cc"',
    )
    parser.add_argument(
        "--no-reclaim-mileage",
        action="store_true",
        help="Set reclaim_mileage to 0 instead of 1",
    )
    parser.add_argument(
        "--have-vat-receipt",
        action="store_true",
        help="Set have_vat_receipt=True for all exported rows",
    )
    parser.add_argument(
        "--include-non-business",
        action="store_true",
        help="Include rows that are not marked as business",
    )
    parser.add_argument(
        "--include-non-deductible",
        action="store_true",
        help="Include rows that are not marked as deductible/claimable",
    )
    parser.add_argument("--project-client", default="", help="Optional FreeAgent project contact")
    parser.add_argument("--project-name", default="", help="Optional FreeAgent project name")
    parser.add_argument(
        "--rebill-to-project",
        action="store_true",
        help="Mark each mileage row as rebillable to the project/contact",
    )
    parser.add_argument(
        "--rebill-mileage-rate",
        default="",
        help="Required if --rebill-to-project is used; value per mile plus VAT",
    )
    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()

    if bool(args.project_client) != bool(args.project_name):
        fail("If you use project linking, provide both --project-client and --project-name.")

    if args.rebill_to_project and not (args.project_client and args.project_name):
        fail("--rebill-to-project requires both --project-client and --project-name.")

    if args.rebill_to_project and not args.rebill_mileage_rate:
        fail("--rebill-to-project requires --rebill-mileage-rate.")

    input_path = Path(args.input)
    output_path = Path(args.output)

    if not input_path.exists():
        fail(f"Input file does not exist: {input_path}")

    rows = read_csv(input_path)

    config = Config(
        claimant_name=args.claimant_name,
        vehicle_type=args.vehicle_type,
        engine_type=args.engine_type,
        engine_size=args.engine_size,
        reclaim_mileage=not args.no_reclaim_mileage,
        have_vat_receipt=args.have_vat_receipt,
        include_non_business=args.include_non_business,
        include_non_deductible=args.include_non_deductible,
        project_client=args.project_client,
        project_name=args.project_name,
        rebill_to_project=args.rebill_to_project,
        rebill_mileage_rate=args.rebill_mileage_rate,
    )

    converted = convert_rows(rows, config)
    if not converted:
        fail(
            "No rows were exported. The input file may only contain non-business or "
            "non-deductible trips. Try reviewing the source file or use "
            "--include-non-business / --include-non-deductible if appropriate."
        )

    write_csv(output_path, converted)

    total_miles = sum(float(row["mileage"]) for row in converted)
    print(f"Created {output_path}")
    print(f"Exported rows: {len(converted)}")
    print(f"Total mileage: {format_mileage(total_miles)} miles")
    print("FreeAgent vehicle config:")
    print(f"  vehicle_type={config.vehicle_type}")
    if config.vehicle_type.lower() == "car":
        print(f"  engine_type={config.engine_type}")
        print(f"  engine_size={config.engine_size}")
    print(f"  reclaim_mileage={'1' if config.reclaim_mileage else '0'}")
    print(f"  have_vat_receipt={'True' if config.have_vat_receipt else 'blank'}")


if __name__ == "__main__":
    main()
