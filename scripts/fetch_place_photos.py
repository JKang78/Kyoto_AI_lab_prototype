"""Download the chosen Wikimedia Commons place photos with their licence metadata.

    python3 scripts/fetch_place_photos.py     # standard library only

Each photo was picked by hand to show its exact place (see docs/visuals.md, E9). The script
re-checks the licence through the Commons API, keeps only CC BY, CC BY-SA, CC0 or public
domain files, saves an 800 px copy to public/places/<place-id>.jpg, and writes
src/data/place-photos.json with author, licence and source for on-screen credits.
Places with no suitable photo (Chion-in's south gate) are left out and show a placeholder.
"""
import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
UA = {"User-Agent": "KyotoFlowPrototype/0.1 (place photos; contact via repository)"}
ALLOWED = re.compile(r"^(CC BY(-SA)? [0-9.]+|CC0|Public domain)$", re.I)
CHOSEN = {
    "shijo-kawaramachi": "File:Shijo Kawaramachi 2020-04-05.jpg",
    "shijo-ohashi": "File:Shijô-Ôhashi Bridge.jpg",
    "yasaka-west-view": "File:Nishiromon Gate, Yasaka Shrine, Kyoto, West view 20190416 1.jpg",
    "kawabata-riverside": "File:Kamo River from Shijo Bridge.jpg",
    "sanjo-ohashi": "File:三条大橋 Sanjo Ohashi (22402221530).jpg",
    "maruyama-cherry-path": "File:Maruyama Park (3515270775).jpg",
}


def fetch(url: str) -> bytes:
    for attempt in range(8):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as response:
                return response.read()
        except Exception:
            if attempt == 7:
                raise
            time.sleep(2 * (attempt + 1))
    raise RuntimeError(url)


def main() -> None:
    out_dir = ROOT / "public/places"
    out_dir.mkdir(parents=True, exist_ok=True)
    manifest = {}
    for place_id, title in CHOSEN.items():
        query = urllib.parse.urlencode({"action": "query", "format": "json", "titles": title, "prop": "imageinfo",
                                        "iiprop": "url|extmetadata", "iiurlwidth": 800})
        page = next(iter(json.loads(fetch(f"https://commons.wikimedia.org/w/api.php?{query}"))["query"]["pages"].values()))
        info = page["imageinfo"][0]
        meta = info["extmetadata"]
        licence = meta["LicenseShortName"]["value"].strip()
        if not ALLOWED.match(licence):
            raise SystemExit(f"{title}: licence {licence!r} is not allowed")
        author = re.sub(r"<[^>]+>", "", meta.get("Artist", {}).get("value", "")).strip() or "Unknown"
        (out_dir / f"{place_id}.jpg").write_bytes(fetch(info["thumburl"]))
        manifest[place_id] = {
            "src": f"/places/{place_id}.jpg",
            "width": info["thumbwidth"], "height": info["thumbheight"],
            "title": title.removeprefix("File:"),
            "author": author,
            "license": licence,
            "licenseUrl": meta.get("LicenseUrl", {}).get("value"),
            "sourceUrl": info["descriptionurl"],
        }
        print(place_id, licence, author)
        time.sleep(0.5)
    (ROOT / "src/data/place-photos.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    main()
