"""Export script-loadable copies of the static viewer data for sandboxed hosting."""

import argparse
import hashlib
import json
import re
from pathlib import Path


# Keep every generated script below the anonymous host's 8 MB file limit.
MAX_LITERAL_BYTES = 3 * 1024 * 1024


def json_literal(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).replace(
        "\u2028", "\\u2028"
    ).replace("\u2029", "\\u2029")


def write_payload(output, key, value):
    stem = key.rsplit(".", 1)[0] if key.endswith((".json", ".txt")) else key
    destination = output / f"{stem}.js"
    destination.parent.mkdir(parents=True, exist_ok=True)
    source = f"window.RTLBenchLSData.register({json_literal(key)},{json_literal(value)});\n"
    destination.write_text(source, encoding="utf-8")


def split_text(text):
    """Split by encoded JavaScript size, preserving the exact decoded text."""
    if len(json_literal(text).encode("utf-8")) <= MAX_LITERAL_BYTES:
        return [text]
    midpoint = len(text) // 2
    return split_text(text[:midpoint]) + split_text(text[midpoint:])


def build(root):
    output = root / "viewer-data"
    catalog = json.loads((root / "catalog.json").read_text(encoding="utf-8"))
    write_payload(output, "catalog.json", catalog)
    asset_paths = set()
    case_count = 0
    for task in catalog["tasks"]:
        for item in task["cases"]:
            detail = json.loads((root / item["detail"]).read_text(encoding="utf-8"))
            write_payload(output, item["detail"], detail)
            asset_paths.update(file["url"] for file in detail["files"] if not file["binary"])
            case_count += 1

    multipart_count = 0
    for asset_path in sorted(asset_paths):
        text = (root / asset_path).read_bytes().decode("utf-8", errors="replace")
        parts = split_text(text)
        if len(parts) == 1:
            write_payload(output, asset_path, text)
            continue
        part_keys = []
        for index, part in enumerate(parts):
            key = f"{asset_path.rsplit('.', 1)[0]}.part-{index:04d}"
            write_payload(output, key, part)
            part_keys.append(key)
        write_payload(output, asset_path, {"parts": part_keys})
        multipart_count += 1

    # Refresh the browser script after interface or data-loader changes.
    interface_version = hashlib.sha256((root / "app.js").read_bytes()).hexdigest()[:12]
    review = root / "review.html"
    source = review.read_text(encoding="utf-8")
    source = re.sub(r"app\.js\?v=[a-f0-9]+", f"app.js?v={interface_version}", source)
    review.write_text(source, encoding="utf-8")
    print(f"Exported {case_count:,} cases and {len(asset_paths):,} text assets; "
          f"{multipart_count} assets use multiple scripts.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    build(parser.parse_args().root)
