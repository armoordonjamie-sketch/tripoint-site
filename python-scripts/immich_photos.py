"""
TriPoint Diagnostics - Immich Photo Puller
Connects to a self-hosted Immich server to browse, search, and download
relevant photos for use on the TriPoint website.

Usage:
    python immich_photos.py albums                     # list all albums
    python immich_photos.py album <id>                 # list assets in an album
    python immich_photos.py search <query>             # smart search for photos
    python immich_photos.py download <asset-id>        # download a single asset
    python immich_photos.py pull-album <id>            # download all assets in an album
    python immich_photos.py pull-search <query>        # search + download matches

Options:
    --output <dir>       Output directory (default: tripoint-frontend/public/images/immich)
    --max-width <px>     Resize images to fit within this width
    --max-height <px>    Resize images to fit within this height
    --dry-run            Preview only, don't download
    --force              Overwrite existing files
    --limit <n>          Max results for search (default: 50)
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path

try:
    import requests
except ImportError:
    print("ERROR: 'requests' not installed. Run: pip install requests")
    sys.exit(1)

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None

try:
    from PIL import Image
    PIL_AVAILABLE = True
    try:
        from pillow_heif import register_heif_opener
        register_heif_opener()
    except ImportError:
        pass
except ImportError:
    PIL_AVAILABLE = False

# ── Config ────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
DEFAULT_OUTPUT_DIR = PROJECT_ROOT / "tripoint-frontend" / "public" / "images" / "immich"

# Load .env
if load_dotenv:
    env_file = SCRIPT_DIR / ".env"
    if env_file.exists():
        load_dotenv(env_file)

IMMICH_BASE_URL = os.getenv("IMMICH_BASE_URL", "https://photos.jamiearmoordon.co.uk")
IMMICH_API_KEY = os.getenv("IMMICH_API_KEY", "")

DELAY_BETWEEN_DOWNLOADS = 0.5  # seconds


# ── Immich API Client ─────────────────────────────────────────────────
class ImmichClient:
    """Lightweight wrapper around the Immich REST API."""

    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url.rstrip("/")
        self.api_url = f"{self.base_url}/api"
        self.session = requests.Session()
        self.session.headers.update({
            "x-api-key": api_key,
            "Accept": "application/json",
        })

    def _get(self, path: str, **kwargs) -> requests.Response:
        url = f"{self.api_url}{path}"
        resp = self.session.get(url, timeout=30, **kwargs)
        resp.raise_for_status()
        return resp

    def _post(self, path: str, json_data: dict = None, **kwargs) -> requests.Response:
        url = f"{self.api_url}{path}"
        resp = self.session.post(url, json=json_data, timeout=30, **kwargs)
        resp.raise_for_status()
        return resp

    # ── Albums ────────────────────────────────────────────────────────

    def list_albums(self) -> list:
        """List all albums."""
        resp = self._get("/albums")
        return resp.json()

    def get_album(self, album_id: str) -> dict:
        """Get album details including assets."""
        resp = self._get(f"/albums/{album_id}")
        return resp.json()

    # ── Assets ────────────────────────────────────────────────────────

    def get_asset_info(self, asset_id: str) -> dict:
        """Get info for a single asset."""
        resp = self._get(f"/assets/{asset_id}")
        return resp.json()

    def download_asset(self, asset_id: str) -> tuple:
        """Download original asset. Returns (bytes, content_type, filename)."""
        resp = self._get(f"/assets/{asset_id}/original", stream=True)
        content_type = resp.headers.get("Content-Type", "application/octet-stream")

        # Try to get filename from Content-Disposition header
        cd = resp.headers.get("Content-Disposition", "")
        filename = None
        if "filename=" in cd:
            filename = cd.split("filename=")[-1].strip('"').strip("'")

        data = resp.content
        return data, content_type, filename

    # ── Search ────────────────────────────────────────────────────────

    def search_metadata(self, query: str = None, limit: int = 50, **filters) -> list:
        """Search assets by metadata."""
        payload = {"size": limit}

        if query:
            payload["description"] = query

        # Merge any extra filters (city, country, make, model, etc.)
        payload.update(filters)

        resp = self._post("/search/metadata", json_data=payload)
        data = resp.json()

        # The response has assets in data.items
        if isinstance(data, dict):
            return data.get("assets", {}).get("items", data.get("items", []))
        return data

    def search_smart(self, query: str, limit: int = 50) -> list:
        """Smart / CLIP search for assets."""
        payload = {"query": query, "size": limit}
        try:
            resp = self._post("/search/smart", json_data=payload)
            data = resp.json()
            if isinstance(data, dict):
                return data.get("assets", {}).get("items", data.get("items", []))
            return data
        except requests.exceptions.HTTPError:
            # Smart search may not be available, fall back to metadata
            return self.search_metadata(query, limit)

    def get_random_assets(self, count: int = 10) -> list:
        """Get random assets."""
        resp = self._get(f"/search/random?size={count}")
        return resp.json()


# ── Helpers ───────────────────────────────────────────────────────────

def sanitise_filename(name: str) -> str:
    """Clean up a filename for the filesystem."""
    # Keep alphanumeric, dashes, underscores, dots
    clean = "".join(c if c.isalnum() or c in "-_." else "_" for c in name)
    # Collapse multiple underscores
    while "__" in clean:
        clean = clean.replace("__", "_")
    return clean.strip("_")


def format_size(size_bytes: int) -> str:
    """Human-readable file size."""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.0f} KB"
    else:
        return f"{size_bytes / (1024 * 1024):.1f} MB"


def format_asset_row(asset: dict, index: int = None) -> str:
    """Format a single asset for console output."""
    aid = asset.get("id", "?")[:8]
    fname = asset.get("originalFileName", "unknown")
    atype = asset.get("type", "?")
    created = asset.get("fileCreatedAt", asset.get("createdAt", "?"))
    if isinstance(created, str) and len(created) > 10:
        created = created[:10]

    dims = ""
    exif = asset.get("exifInfo", {})
    if exif:
        w = exif.get("exifImageWidth") or exif.get("imageWidth")
        h = exif.get("exifImageHeight") or exif.get("imageHeight")
        if w and h:
            dims = f" {w}×{h}"

    prefix = f"  [{index:>3}]" if index is not None else "  •"
    return f"{prefix} {aid}…  {fname:<35} {atype:<6} {created}{dims}"


def save_and_process(
    data: bytes,
    output_path: Path,
    content_type: str,
    max_width: int = None,
    max_height: int = None,
) -> bool:
    """Save downloaded asset, optionally convert HEIC→JPEG and resize."""
    try:
        output_path.parent.mkdir(parents=True, exist_ok=True)

        # Check if HEIC and convert
        is_heic = (
            "heic" in content_type.lower()
            or "heif" in content_type.lower()
            or output_path.suffix.lower() in (".heic", ".heif")
        )

        needs_resize = max_width or max_height
        needs_conversion = is_heic

        if (needs_conversion or needs_resize) and PIL_AVAILABLE:
            # Save temp, process with PIL
            import io
            img = Image.open(io.BytesIO(data))
            img = img.convert("RGB")

            if needs_resize:
                orig_w, orig_h = img.size
                new_w, new_h = orig_w, orig_h

                if max_width and orig_w > max_width:
                    ratio = max_width / orig_w
                    new_w = max_width
                    new_h = int(orig_h * ratio)

                if max_height and new_h > max_height:
                    ratio = max_height / new_h
                    new_h = max_height
                    new_w = int(new_w * ratio)

                if (new_w, new_h) != (orig_w, orig_h):
                    img = img.resize((new_w, new_h), Image.LANCZOS)

            # Always save as JPEG if converting
            if is_heic:
                output_path = output_path.with_suffix(".jpg")

            img.save(output_path, "JPEG", quality=90)
        else:
            # Save raw bytes
            with open(output_path, "wb") as f:
                f.write(data)

        return True
    except Exception as e:
        print(f"    ✗ Save error: {e}")
        return False


# ── Subcommands ───────────────────────────────────────────────────────

def cmd_albums(client: ImmichClient, args):
    """List all albums."""
    print("\n📂 Immich Albums\n")

    try:
        albums = client.list_albums()
    except requests.exceptions.HTTPError as e:
        print(f"  ✗ API error: {e}")
        if e.response.status_code == 401:
            print("    Check your IMMICH_API_KEY in .env")
        return

    if not albums:
        print("  No albums found.")
        return

    print(f"  Found {len(albums)} album(s):\n")
    print(f"  {'ID':<38} {'Name':<35} {'Assets':>6}")
    print(f"  {'─' * 38} {'─' * 35} {'─' * 6}")

    for album in sorted(albums, key=lambda a: a.get("albumName", "")):
        aid = album.get("id", "?")
        name = album.get("albumName", "Untitled")
        count = album.get("assetCount", 0)
        print(f"  {aid:<38} {name:<35} {count:>6}")

    print(f"\n  💡 Use: python immich_photos.py album <ID>  to see contents")
    print(f"  💡 Use: python immich_photos.py pull-album <ID>  to download\n")


def cmd_album(client: ImmichClient, args):
    """List assets in a specific album."""
    album_id = args.id
    print(f"\n📂 Album: {album_id}\n")

    try:
        album = client.get_album(album_id)
    except requests.exceptions.HTTPError as e:
        print(f"  ✗ API error: {e}")
        return

    name = album.get("albumName", "Untitled")
    desc = album.get("description", "")
    assets = album.get("assets", [])

    print(f"  Name:   {name}")
    if desc:
        print(f"  Desc:   {desc}")
    print(f"  Assets: {len(assets)}\n")

    for i, asset in enumerate(assets):
        print(format_asset_row(asset, i))

    print(f"\n  💡 Use: python immich_photos.py download <ASSET-ID>  to download one")
    print(f"  💡 Use: python immich_photos.py pull-album {album_id}  to download all\n")


def cmd_search(client: ImmichClient, args):
    """Search for photos."""
    query = args.query
    limit = args.limit
    print(f"\n🔍 Searching: \"{query}\" (limit: {limit})\n")

    try:
        # Try smart search first (CLIP-based), fall back to metadata
        assets = client.search_smart(query, limit=limit)
    except Exception as e:
        print(f"  ✗ Search error: {e}")
        return

    if not assets:
        print("  No results found.")
        print("  💡 Try broader terms or check albums with: python immich_photos.py albums")
        return

    print(f"  Found {len(assets)} result(s):\n")
    for i, asset in enumerate(assets):
        print(format_asset_row(asset, i))

    print(f"\n  💡 Use: python immich_photos.py pull-search \"{query}\"  to download these\n")


def cmd_download(client: ImmichClient, args):
    """Download a single asset."""
    asset_id = args.id
    output_dir = Path(args.output).resolve()

    print(f"\n⬇ Downloading asset: {asset_id}")

    if args.dry_run:
        try:
            info = client.get_asset_info(asset_id)
            print(f"  Name: {info.get('originalFileName', '?')}")
            print(f"  Type: {info.get('type', '?')}")
            print(f"  Created: {info.get('fileCreatedAt', '?')}")
            print(f"  🏁 Dry run - not downloaded.")
        except Exception as e:
            print(f"  ✗ Error: {e}")
        return

    try:
        # Get info first for the filename
        info = client.get_asset_info(asset_id)
        orig_name = info.get("originalFileName", f"{asset_id}.jpg")

        print(f"  File: {orig_name}")

        data, content_type, _ = client.download_asset(asset_id)
        output_path = output_dir / sanitise_filename(orig_name)

        if output_path.exists() and not args.force:
            print(f"  ⚠ Already exists: {output_path.name} (use --force to overwrite)")
            return

        if save_and_process(data, output_path, content_type, args.max_width, args.max_height):
            size = format_size(output_path.stat().st_size)
            print(f"  ✓ Saved: {output_path} ({size})")
        else:
            print(f"  ✗ Failed to save")

    except requests.exceptions.HTTPError as e:
        print(f"  ✗ API error: {e}")
    except Exception as e:
        print(f"  ✗ Error: {e}")


def cmd_pull_album(client: ImmichClient, args):
    """Download all assets from an album."""
    album_id = args.id
    output_dir = Path(args.output).resolve()

    print(f"\n📂 Pulling album: {album_id}")

    try:
        album = client.get_album(album_id)
    except requests.exceptions.HTTPError as e:
        print(f"  ✗ API error: {e}")
        return

    name = album.get("albumName", "Untitled")
    assets = album.get("assets", [])

    # Create a subdirectory named after the album
    safe_name = sanitise_filename(name)
    album_dir = output_dir / safe_name
    print(f"  Album: {name} ({len(assets)} assets)")
    print(f"  Output: {album_dir}\n")

    if args.dry_run:
        for i, asset in enumerate(assets):
            print(format_asset_row(asset, i))
        print(f"\n  🏁 Dry run - {len(assets)} assets would be downloaded.\n")
        return

    album_dir.mkdir(parents=True, exist_ok=True)
    ok = skip = fail = 0

    for i, asset in enumerate(assets):
        asset_id = asset.get("id")
        orig_name = asset.get("originalFileName", f"{asset_id}.jpg")
        safe_fname = sanitise_filename(orig_name)
        output_path = album_dir / safe_fname

        if output_path.exists() and not args.force:
            print(f"  [{i+1:>3}/{len(assets)}] {orig_name} - SKIPPED (exists)")
            skip += 1
            continue

        print(f"  [{i+1:>3}/{len(assets)}] {orig_name}...", end=" ", flush=True)

        try:
            data, content_type, _ = client.download_asset(asset_id)
            if save_and_process(data, output_path, content_type, args.max_width, args.max_height):
                size = format_size(output_path.stat().st_size)
                print(f"✓ ({size})")
                ok += 1
            else:
                print("✗")
                fail += 1
        except Exception as e:
            print(f"✗ ({e})")
            fail += 1

        if i < len(assets) - 1:
            time.sleep(DELAY_BETWEEN_DOWNLOADS)

    print(f"\n  {'=' * 50}")
    print(f"  🏁 {ok} downloaded, {skip} skipped, {fail} failed")
    print(f"  📁 Output: {album_dir}\n")


def cmd_pull_search(client: ImmichClient, args):
    """Search + download matching assets."""
    query = args.query
    limit = args.limit
    output_dir = Path(args.output).resolve()

    print(f"\n🔍 Search + Download: \"{query}\" (limit: {limit})")

    try:
        assets = client.search_smart(query, limit=limit)
    except Exception as e:
        print(f"  ✗ Search error: {e}")
        return

    if not assets:
        print("  No results found.")
        return

    # Create a subdirectory named after the search query
    safe_name = sanitise_filename(query)
    search_dir = output_dir / safe_name
    print(f"  Found: {len(assets)} results")
    print(f"  Output: {search_dir}\n")

    if args.dry_run:
        for i, asset in enumerate(assets):
            print(format_asset_row(asset, i))
        print(f"\n  🏁 Dry run - {len(assets)} assets would be downloaded.\n")
        return

    search_dir.mkdir(parents=True, exist_ok=True)
    ok = skip = fail = 0

    for i, asset in enumerate(assets):
        asset_id = asset.get("id")
        orig_name = asset.get("originalFileName", f"{asset_id}.jpg")
        safe_fname = sanitise_filename(orig_name)
        output_path = search_dir / safe_fname

        if output_path.exists() and not args.force:
            print(f"  [{i+1:>3}/{len(assets)}] {orig_name} - SKIPPED (exists)")
            skip += 1
            continue

        print(f"  [{i+1:>3}/{len(assets)}] {orig_name}...", end=" ", flush=True)

        try:
            data, content_type, _ = client.download_asset(asset_id)
            if save_and_process(data, output_path, content_type, args.max_width, args.max_height):
                size = format_size(output_path.stat().st_size)
                print(f"✓ ({size})")
                ok += 1
            else:
                print("✗")
                fail += 1
        except Exception as e:
            print(f"✗ ({e})")
            fail += 1

        if i < len(assets) - 1:
            time.sleep(DELAY_BETWEEN_DOWNLOADS)

    print(f"\n  {'=' * 50}")
    print(f"  🏁 {ok} downloaded, {skip} skipped, {fail} failed")
    print(f"  📁 Output: {search_dir}\n")


def cmd_random(client: ImmichClient, args):
    """Show random assets from the library."""
    count = args.limit
    print(f"\n🎲 Random assets (showing {count})\n")

    try:
        assets = client.get_random_assets(count)
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return

    for i, asset in enumerate(assets):
        print(format_asset_row(asset, i))

    print()


# ── CLI ───────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="TriPoint Diagnostics - Immich Photo Puller",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Examples:\n"
            "  python immich_photos.py albums\n"
            "  python immich_photos.py album <album-id>\n"
            "  python immich_photos.py search \"sprinter engine\"\n"
            "  python immich_photos.py download <asset-id>\n"
            "  python immich_photos.py pull-album <album-id>\n"
            "  python immich_photos.py pull-search \"diagnostic\" --max-width 1920\n"
            "  python immich_photos.py random\n"
        ),
    )

    # Global options
    parser.add_argument(
        "--output", type=str, default=str(DEFAULT_OUTPUT_DIR),
        help=f"Output directory (default: {DEFAULT_OUTPUT_DIR})",
    )
    parser.add_argument("--max-width", type=int, default=None, help="Max width in pixels")
    parser.add_argument("--max-height", type=int, default=None, help="Max height in pixels")
    parser.add_argument("--dry-run", action="store_true", help="Preview only, don't download")
    parser.add_argument("--force", action="store_true", help="Overwrite existing files")
    parser.add_argument("--limit", type=int, default=50, help="Max search results (default: 50)")

    subparsers = parser.add_subparsers(dest="command", help="Command to run")

    # albums
    subparsers.add_parser("albums", help="List all albums")

    # album <id>
    p_album = subparsers.add_parser("album", help="List assets in an album")
    p_album.add_argument("id", help="Album ID")

    # search <query>
    p_search = subparsers.add_parser("search", help="Smart search for photos")
    p_search.add_argument("query", help="Search query")

    # download <id>
    p_dl = subparsers.add_parser("download", help="Download a single asset")
    p_dl.add_argument("id", help="Asset ID")

    # pull-album <id>
    p_pa = subparsers.add_parser("pull-album", help="Download all assets in an album")
    p_pa.add_argument("id", help="Album ID")

    # pull-search <query>
    p_ps = subparsers.add_parser("pull-search", help="Search + download matching assets")
    p_ps.add_argument("query", help="Search query")

    # random
    subparsers.add_parser("random", help="Show random assets")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(0)

    # ── Validate config ───────────────────────────────────────────────
    if not IMMICH_API_KEY:
        print("\n❌ IMMICH_API_KEY not set!")
        print("   1. Go to your Immich UI → User Settings → API Keys")
        print("   2. Create a new key")
        print(f"   3. Add it to {SCRIPT_DIR / '.env'}:")
        print(f"      IMMICH_API_KEY=your-key-here\n")
        sys.exit(1)

    print(f"\n🔗 Immich: {IMMICH_BASE_URL}")

    client = ImmichClient(IMMICH_BASE_URL, IMMICH_API_KEY)

    # ── Dispatch ──────────────────────────────────────────────────────
    commands = {
        "albums": cmd_albums,
        "album": cmd_album,
        "search": cmd_search,
        "download": cmd_download,
        "pull-album": cmd_pull_album,
        "pull-search": cmd_pull_search,
        "random": cmd_random,
    }

    handler = commands.get(args.command)
    if handler:
        handler(client, args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
