"""
Zone and drive-time tool for Carl.

Uses WazeRouteCalculator (live routing) to find the fastest route from either
TriPoint base to the customer's postcode, then assigns Zone A / B / C / Out of area.

Ported from TriPoint-site/python-scripts/api.py.
"""

from __future__ import annotations

import json
import sys
from typing import Any

_WAZE_AVAILABLE = False
try:
    import WazeRouteCalculator  # type: ignore[import-untyped]

    # EU region uses the working US endpoint (same patch as the main site).
    WazeRouteCalculator.WazeRouteCalculator.COORD_SERVERS["EU"] = "SearchServer/mozi"
    _WAZE_AVAILABLE = True
except Exception as exc:  # pragma: no cover
    print(f"WazeRouteCalculator not available — zone tool disabled: {exc}", file=sys.stderr)

BASES: dict[str, str] = {
    "Eltham": "SE9 4HA",
    "Tonbridge": "TN9 1PP",
}

_REGION = "EU"

_ZONE_PRICES: dict[str, int] = {"A": 120, "B": 135, "C": 150}


def get_zone(minutes: float) -> str:
    if minutes <= 25:
        return "A"
    if minutes <= 45:
        return "B"
    if minutes <= 60:
        return "C"
    return "Out of area"


def _calculate_route(start: str, end: str) -> tuple[float | None, float | None]:
    try:
        route = WazeRouteCalculator.WazeRouteCalculator(start, end, _REGION)
        time_mins, distance_km = route.calc_route_info()
        return float(time_mins), float(distance_km)
    except Exception as exc:
        print(f"Waze route error {start!r} -> {end!r}: {exc}", file=sys.stderr)
        return None, None


def calculate_zone_and_drive_time(postcode: str) -> dict[str, Any]:
    """
    Calculate zone for a postcode by routing from both TriPoint bases via Waze.
    Picks the closest base. Returns a dict with zone, base, drive time, and price.
    Raises ValueError if routing fails or WazeRouteCalculator is not installed.
    """
    if not _WAZE_AVAILABLE:
        raise ValueError(
            "WazeRouteCalculator is not installed. "
            "Run: pip install WazeRouteCalculator"
        )

    postcode = postcode.strip().upper()
    valid: list[dict[str, Any]] = []

    for base_name, base_address in BASES.items():
        time_mins, dist_km = _calculate_route(base_address, postcode)
        if time_mins is not None:
            valid.append(
                {
                    "base_name": base_name,
                    "base_address": base_address,
                    "time_minutes": round(time_mins, 1),
                    "distance_km": round(dist_km, 1) if dist_km is not None else None,
                }
            )

    if not valid:
        raise ValueError(
            f"Could not calculate a route to postcode '{postcode}'. "
            "Check the postcode is correct."
        )

    best = min(valid, key=lambda x: x["time_minutes"])
    zone = get_zone(best["time_minutes"])
    price = _ZONE_PRICES.get(zone)

    return {
        "postcode": postcode,
        "zone": zone,
        "best_base": best["base_name"],
        "drive_time_minutes": best["time_minutes"],
        "distance_km": best["distance_km"],
        "diagnostic_price_ex_vat": price,
    }


def execute_zone_tool(tool_input: dict[str, Any]) -> str:
    """Tool executor — returns a JSON string result for OpenRouter."""
    postcode = (tool_input.get("postcode") or "").strip()
    if not postcode:
        return json.dumps({"error": "postcode is required"})
    try:
        result = calculate_zone_and_drive_time(postcode)
        zone = result["zone"]
        base = result["best_base"]
        drive = result["drive_time_minutes"]
        price = result["diagnostic_price_ex_vat"]

        if zone == "Out of area":
            summary = (
                f"{postcode} is {drive} minutes from the {base} base, "
                f"which is outside the standard 60-minute coverage area. "
                f"Take the enquiry and advise we will review and confirm whether we can cover it."
            )
        else:
            summary = (
                f"{postcode} is Zone {zone}, {drive} minutes from the {base} base. "
                f"Standard diagnostic callout: £{price} + VAT."
            )

        return json.dumps({**result, "summary": summary})
    except ValueError as exc:
        return json.dumps({"error": str(exc)})


# ── OpenRouter tool definition (Anthropic function-calling format) ──────────

ZONE_TOOL: dict[str, Any] = {
    "type": "function",
    "function": {
        "name": "get_zone_and_price",
        "description": (
            "Calculate the zone (A, B, C, or Out of area) and drive time from TriPoint's "
            "nearest base to a customer's postcode or location, using live Waze routing. "
            "Use this any time a customer gives a postcode or town and you need to confirm "
            "their zone, correct callout price, and whether they are covered. "
            "Never guess the zone — always call this tool when you have a postcode."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "postcode": {
                    "type": "string",
                    "description": (
                        "Full UK postcode of the customer's location, e.g. 'ME5 7SZ', "
                        "'BR1 2JH', 'TN9 1PP'. Normalise spacing before calling."
                    ),
                }
            },
            "required": ["postcode"],
        },
    },
}
