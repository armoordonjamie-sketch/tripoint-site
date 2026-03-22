#!/usr/bin/env python3
"""Extract all user-facing text from service pages into a Markdown doc."""

import re
from pathlib import Path

SERVICES_DIR = Path(__file__).resolve().parent.parent / "src" / "pages" / "services"
OUTPUT_FILE = Path(__file__).resolve().parent.parent / "docs" / "service-pages-text.md"

# Patterns that indicate code, not copy - skip these
SKIP_PATTERNS = (
    r"^[a-z][a-z-]*\.[a-z]+$",
    r"^\/[a-zA-Z0-9\/\-_.]+$",
    r"^@/",
    r"^https?://",
    r"className",
    r"^\d+px",
    r"^var\(--",
    r"^[{}()\[\];]$",
    r"^[a-z]+-\d+",  # tailwind
    r"react-router|lucide-react|@/components",
    r"^\w+_\w+_top$|^\w+_\w+_footer$",  # analytics slugs
)
# Substrings that indicate code
SKIP_CONTAINS = (
    "inset-0", "object-cover", "absolute", "relative", "flex ", "grid ",
    "rounded-", "border-", "bg-", "text-", "font-", "px-", "py-", "mt-", "mb-", "gap-",
    "max-w-", "min-h-", "aspect-", "overflow-", "transition-", "hover:",
    "overflow-hidden", "items-center", "justify-", "space-y-", "leading-",
    "bg-gradient", "from-", "to-", "via-", "z-10", "shrink-0",
    "step-number", "reveal", "border-b ", "border-t ",
)


def unescape(s: str) -> str:
    s = s.replace("&apos;", "'").replace("&amp;", "&").replace("&bull;", "•")
    s = s.replace("\\'", "'").replace('\\"', '"').replace("\\n", "\n")
    s = s.replace("\u2019", "'").replace("\u00a3", "£")
    s = s.replace(r"\u00a3", "£").replace(r"\u2019", "'")
    return s


def is_prose(s: str) -> bool:
    """Heuristic: likely user-facing prose."""
    if not s or len(s) < 8:
        return False
    for p in SKIP_PATTERNS:
        if re.search(p, s):
            return False
    for sub in SKIP_CONTAINS:
        if sub in s:
            return False
    if s.startswith("from ") or s.startswith("import ") or s.startswith("@"):
        return False
    # Must have at least one space (sentence) or be a short readable label
    if " " not in s and len(s) > 25:
        return False
    # Skip if looks like CSS/value
    if re.match(r"^[\d\s\-\.px%]+$", s):
        return False
    return True


def extract_all_strings(content: str) -> list[str]:
    out = []
    # Single-quoted: handle \' and multiline
    for m in re.finditer(r"'((?:[^'\\]|\\.)*)'", content):
        s = unescape(m.group(1))
        if is_prose(s):
            out.append(s)
    # Double-quoted
    for m in re.finditer(r'"((?:[^"\\]|\\.)*)"', content):
        s = unescape(m.group(1))
        if is_prose(s):
            out.append(s)
    # text: '...' in object literals (for .map items)
    for m in re.finditer(r"text:\s*['\"]((?:[^'\"\\]|\\.)*)['\"]", content):
        s = unescape(m.group(1))
        if is_prose(s):
            out.append(s)
    # label: '...'
    for m in re.finditer(r"label:\s*['\"]((?:[^'\"\\]|\\.)*)['\"]", content):
        s = unescape(m.group(1))
        if is_prose(s):
            out.append(s)
    # detail: '...'
    for m in re.finditer(r"detail:\s*['\"]((?:[^'\"\\]|\\.)*)['\"]", content):
        s = unescape(m.group(1))
        if is_prose(s):
            out.append(s)
    # desc: '...'
    for m in re.finditer(r"desc:\s*['\"]((?:[^'\"\\]|\\.)*)['\"]", content):
        s = unescape(m.group(1))
        if is_prose(s):
            out.append(s)
    return out


def extract_faqs(content: str) -> list[tuple[str, str]]:
    faqs = []
    # Match question: '...' ... answer: '...' (can span newlines)
    blocks = re.split(r"question:\s*", content)
    for block in blocks[1:]:
        qm = re.match(r"['\"]([^'\"]*(?:\\.[^'\"]*)*)['\"][^a]*answer:\s*['\"]([^'\"]*(?:\\.[^'\"]*)*)['\"]", block, re.DOTALL)
        if qm:
            q = unescape(qm.group(1).replace("\\'", "'"))
            a = unescape(qm.group(2).replace("\\'", "'").replace("\\n", " "))
            faqs.append((q, a))
    return faqs


def extract_cross_sell(content: str) -> list[tuple[str, str]]:
    items = []
    for m in re.finditer(r"title:\s*['\"]([^'\"]+)['\"][^}]*desc:\s*['\"]([^'\"]+)['\"]", content):
        items.append((unescape(m.group(1)), unescape(m.group(2))))
    return items


def extract_table_rows(content: str) -> list[str]:
    """Extract feature/stock/tuned etc from table rows."""
    rows = []
    for m in re.finditer(r"(?:feature|stock|tuned):\s*['\"]([^'\"]+)['\"]", content):
        rows.append(unescape(m.group(1)))
    return rows


def extract_page(name: str, content: str) -> dict:
    title = ""
    desc = ""
    if m := re.search(r'<Seo\s+title="([^"]+)"\s+description="([^"]+)"', content):
        title = unescape(m.group(1))
        desc = unescape(m.group(2))
    h1 = ""
    if m := re.search(r"<h1[^>]*>([^<]+)</h1>", content):
        h1 = unescape(m.group(1).strip())
    return {
        "name": name,
        "title": title or h1,
        "description": desc,
        "all_strings": extract_all_strings(content),
        "faqs": extract_faqs(content),
        "cross_sell": extract_cross_sell(content),
        "table_rows": extract_table_rows(content),
    }


def dedupe_preserve_order(items: list[str]) -> list[str]:
    seen = set()
    out = []
    for x in items:
        x = x.strip()
        if not x or x in seen:
            continue
        seen.add(x)
        out.append(x)
    return out


def main():
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    pages = sorted(SERVICES_DIR.glob("*.tsx"))

    parts = ["# Service Pages - Extracted Text\n"]

    for path in pages:
        content = path.read_text(encoding="utf-8")
        data = extract_page(path.stem.replace("Page", ""), content)

        lines = [
            f"\n---\n\n# {data['name']}\n",
            f"**Title:** {data['title']}\n",
            f"**Description:** {data['description']}\n",
        ]

        # Main prose (deduplicated)
        all_str = dedupe_preserve_order(data["all_strings"])
        # Drop very short and duplicates with FAQs
        faq_texts = {q for q, a in data["faqs"]} | {a for q, a in data["faqs"]}
        prose = [s for s in all_str if len(s) > 15 and s not in faq_texts]
        if prose:
            lines.append("\n## Content\n\n")
            for s in prose[:120]:
                lines.append(f"{s}\n\n")

        if data["table_rows"]:
            lines.append("\n## Table (Before/After etc)\n\n")
            for r in data["table_rows"]:
                lines.append(f"- {r}\n")

        if data["faqs"]:
            lines.append("\n## FAQs\n\n")
            for q, a in data["faqs"]:
                lines.append(f"### {q}\n\n")
                lines.append(f"{a}\n\n")

        if data["cross_sell"]:
            lines.append("\n## Cross-sell\n\n")
            for t, d in data["cross_sell"]:
                lines.append(f"- **{t}:** {d}\n")

        parts.append("".join(lines))

    OUTPUT_FILE.write_text("".join(parts), encoding="utf-8")
    print(f"Wrote {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
