#!/usr/bin/env python3
"""CLI utility to fetch JPG images for a keyword search."""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
from io import BytesIO
from pathlib import Path
from typing import Iterable

import requests
from bs4 import BeautifulSoup
from PIL import Image


def parse_args() -> argparse.Namespace:
  parser = argparse.ArgumentParser(
    description="Download JPG images for a keyword search via Bing Images."
  )
  parser.add_argument(
    "keywords",
    nargs="+",
    help="Search keywords (quotes recommended for multi-word terms)",
  )
  parser.add_argument(
    "-c",
    "--c",
    "--count",
    dest="count",
    type=int,
    default=5,
    help="Number of images to download (default: 5)",
  )
  parser.add_argument(
    "--out",
    type=Path,
    help="Output directory. Defaults to downloads/<slugified-query>",
  )
  parser.add_argument(
    "--timeout",
    type=float,
    default=10.0,
    help="HTTP timeout in seconds per image (default: 10)",
  )
  parser.add_argument(
    "--max-results",
    type=int,
    default=None,
    help="Internal override: max candidate images to request",
  )
  return parser.parse_args()


def slugify(value: str) -> str:
  slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
  return slug or "images"


BING_ENDPOINT = "https://www.bing.com/images/search"
HEADERS = {
  "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
}


def candidate_urls(
  session: requests.Session,
  query: str,
  target: int,
  max_results: int | None = None,
) -> Iterable[str]:
  max_candidates = max_results or max(target * 3, target + 5)
  per_page = 35
  first = 0
  yielded = 0

  while yielded < max_candidates:
    params = {
      "q": query,
      "first": str(first),
      "count": str(per_page),
      "adlt": "off",
      "scenario": "ImageBasicHover",
      "setmkt": "en-US",
      "setlang": "en",
      "form": "HDRSC2",
    }
    try:
      response = session.get(
        BING_ENDPOINT,
        params=params,
        headers=HEADERS,
        timeout=10,
      )
      response.raise_for_status()
    except requests.RequestException as exc:
      print(f"[warn] Failed to query Bing Images: {exc}", file=sys.stderr)
      break

    soup = BeautifulSoup(response.text, "html.parser")
    tiles = soup.select("a.iusc")
    if not tiles:
      break

    for tile in tiles:
      meta = tile.get("m")
      if not meta:
        continue
      try:
        meta_json = json.loads(html.unescape(meta))
      except json.JSONDecodeError:
        continue
      url = meta_json.get("murl")
      if not url or not url.startswith("http"):
        continue
      yield url
      yielded += 1
      if yielded >= max_candidates:
        return

    first += per_page


def ensure_jpg(data: bytes, dest: Path) -> None:
  with Image.open(BytesIO(data)) as img:
    rgb_image = img.convert("RGB")
    rgb_image.save(dest, format="JPEG", quality=90, optimize=True)


def download_single(
  url: str,
  dest_dir: Path,
  base_name: str,
  index: int,
  session: requests.Session,
  timeout: float,
) -> bool:
  dest = dest_dir / f"{base_name}-{index:02d}.jpg"
  try:
    response = session.get(url, timeout=timeout)
    response.raise_for_status()
  except requests.RequestException as exc:
    print(f"[warn] Failed to fetch {url}: {exc}")
    return False

  content_type = (response.headers.get("Content-Type") or "").lower()
  try:
    if "jpeg" in content_type or "jpg" in content_type:
      dest.write_bytes(response.content)
    else:
      ensure_jpg(response.content, dest)
  except OSError as exc:
    print(f"[warn] Could not decode image from {url}: {exc}")
    return False

  print(f"[ok] Saved {dest.name} from {url}")
  return True


def main() -> int:
  args = parse_args()
  query = " ".join(args.keywords)

  if args.count <= 0:
    print("[error] --count must be greater than zero", file=sys.stderr)
    return 1

  output_dir = args.out or Path("public/downloads") / slugify(query)
  output_dir.mkdir(parents=True, exist_ok=True)

  session = requests.Session()
  downloaded = 0

  slug = slugify(query)

  for url in candidate_urls(session, query, args.count, args.max_results):
    if downloaded >= args.count:
      break
    if download_single(url, output_dir, slug, downloaded + 1, session, args.timeout):
      downloaded += 1

  if downloaded < args.count:
    print(
      f"[warn] Requested {args.count} images but only downloaded {downloaded}.",
      file=sys.stderr,
    )
    return 1

  print(f"[done] Downloaded {downloaded} image(s) to {output_dir}")
  return 0


if __name__ == "__main__":
  sys.exit(main())
