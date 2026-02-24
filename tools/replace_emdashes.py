import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

EXCLUDE_DIRS = {
    ".git",
    "node_modules",
    "dist",
    "build",
    ".next",
    "out",
    ".turbo",
    "coverage",
    ".cache",
}

BINARY_SUFFIXES = (
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".avif",
    ".ico",
    ".pdf",
    ".zip",
    ".gz",
    ".tgz",
    ".bz2",
    ".xz",
    ".7z",
    ".rar",
    ".mp4",
    ".mp3",
    ".mov",
    ".avi",
    ".wmv",
    ".flac",
    ".wav",
    ".woff",
    ".woff2",
    ".ttf",
    ".eot",
    ".otf",
)

LOCK_LIKE_NAMES = {
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "composer.lock",
    "Cargo.lock",
    "poetry.lock",
}


def should_skip_file(name: str) -> bool:
    if name in LOCK_LIKE_NAMES:
        return True
    for suffix in BINARY_SUFFIXES:
        if name.endswith(suffix):
            return True
    return False


def main() -> None:
    changed_files = 0

    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]

        for name in filenames:
            if should_skip_file(name):
                continue

            path = os.path.join(dirpath, name)

            try:
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()
            except (UnicodeDecodeError, OSError):
                continue

            if "-" not in content:
                continue

            new_content = content.replace("-", "-")
            if new_content == content:
                continue

            try:
                with open(path, "w", encoding="utf-8", newline="") as f:
                    f.write(new_content)
            except OSError:
                continue

            changed_files += 1

    print(f"Changed files: {changed_files}")


if __name__ == "__main__":
    main()

