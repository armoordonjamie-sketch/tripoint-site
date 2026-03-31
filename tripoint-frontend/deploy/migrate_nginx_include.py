#!/usr/bin/env python3
"""
One-time migration: replace inline `location / { ... }` with `include` of nginx-location-root.conf
so future git pulls update SPA/prerender behaviour without editing sites-available.

Also patches legacy `try_files ... =404` when no location block matches.
"""
from __future__ import annotations

import pathlib
import re
import sys


def main() -> int:
    if len(sys.argv) != 3:
        print("usage: migrate_nginx_include.py SITE_PATH FRAGMENT_PATH", file=sys.stderr)
        return 2

    site_path = pathlib.Path(sys.argv[1])
    frag_path = pathlib.Path(sys.argv[2]).resolve()

    if not site_path.is_file() or not frag_path.is_file():
        return 0

    text = site_path.read_text(encoding="utf-8", errors="replace")
    inc_path = str(frag_path)

    if re.search(r"include\s+" + re.escape(inc_path) + r"\s*;", text):
        return 0

    # Multiline `location / { ... }` (allows blank lines inside); indent matches closing `}`
    pattern = re.compile(
        r"^(\s*)location\s+/\s*\{(.*?)^\1\}\s*$",
        re.MULTILINE | re.DOTALL,
    )

    new_text, n = pattern.subn(lambda m: f"{m.group(1)}include {inc_path};\n", text)

    if n > 0:
        site_path.write_text(new_text, encoding="utf-8", newline="\n")
        print(f">>> Nginx: replaced {n} inline location / block(s) with include of repo fragment.")
        return 0

    # Legacy: try_files ... =404 (no include migration possible)
    old = "try_files $uri $uri/index.html $uri.html =404;"
    new = "try_files $uri $uri/index.html $uri.html /index.html;"
    if old in text:
        site_path.write_text(text.replace(old, new), encoding="utf-8", newline="\n")
        print(">>> Nginx: patched legacy try_files (=404 -> /index.html).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
