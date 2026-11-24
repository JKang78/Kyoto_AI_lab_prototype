"""Download the chosen Wikimedia Commons place photos with their licence metadata.

    python3 scripts/fetch_place_photos.py     # standard library only

Each photo was picked by hand to show its exact place (see docs/visuals.md, E9). The script
re-checks the licence through the Commons API, keeps only CC BY, CC BY-SA, CC0 or public
domain files, saves an 800 px copy to public/places/<place-id>.jpg, and writes
src/data/place-photos.json with author, licence and source for on-screen credits.
Places with no suitable photo (Chion-in's south gate, the Hōnen-in stretch of the Philosopher's Path) are left out and show a placeholder.
"""
import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
UA = {"User-Agent": "KyotoFlowPrototype/0.1 (https://github.com/JKang78/Kyoto_AI_lab_prototype)"}
ALLOWED = re.compile(r"^(CC BY(-SA)? [0-9.]+|CC0|Public domain)$", re.I)
CHOSEN = {
    "shijo-kawaramachi": "File:Shijo Kawaramachi 2020-04-05.jpg",
    "shijo-ohashi": "File:Shijô-Ôhashi Bridge.jpg",
    "yasaka-west-view": "File:Nishiromon Gate, Yasaka Shrine, Kyoto, West view 20190416 1.jpg",
    "kawabata-riverside": "File:Kamo River from Shijo Bridge.jpg",
    "sanjo-ohashi": "File:三条大橋 Sanjo Ohashi (22402221530).jpg",
    "maruyama-cherry-path": "File:Maruyama Park (3515270775).jpg",
    "sosui-museum-basin": "File:Lake Biwa Canal (Kyoto) IMG 5588 a.JPG",
    "okazaki-canal-promenade": "File:Okazaki canal (3477793760).jpg",
    "heian-otorii": "File:Heian Shrine 20240309 01.jpg",
    "heian-otenmon": "File:Heian Shrine @ Kyoto (13310814664).jpg",
    "ginkakuji-bridge": "File:Ginkakujibashi Bridge from Philosopher’s Walk.JPG",
    "wakaoji-bridge": "File:Kumano-nyakuoji-jinja.jpg",
    "eikando-gate": "File:Kyoto Eikan-do Zenrin-ji Haupttor 1.jpg",
    "nanzenji-sanmon-approach": "File:Kyoto Nanzenji01s5s4272.jpg",
    "kawai-bridge": "File:Kawai bridge 20200505.jpg",
    "kamogawa-delta": "File:Kamogawa Delta.jpg",
    "tadasu-south-side": "File:Tadasu no mori 200906c.jpg",
    "kawai-shrine-approach": "File:Kawai-jinja Kyoto HDSR IMG 6133.jpg",
    "shimogamo-romon": "File:Kamomioya-jinja romon.jpg",
    "nakanoshima-bridge": "File:Arashiyama, Nakanoshima-bashi Bridge -1 (April 2009) - panoramio.jpg",
    "togetsukyo-bridge": "File:Arashiyama (8741759830).jpg",
    "katsura-north-bank": "File:2014-11-19 Arashiyama (15876139908).jpg",
    "kameyama-riverside": "File:Arashiyama Park (8278674903).jpg",
    "sakaimachi-gomon": "File:Kyoto-gyoen Sakaimachi-gomon-2.JPG",
    "kujo-pond": "File:Itsukushima jinja Kyoto Gyoen 004.jpg",
    "kenreimon-avenue": "File:Kyoto Gyoen National Garden in Kyoto, Japan (2019) - 117.jpg",
    "hamaguri-gomon": "File:Kyoto-gyoen Hamaguri-gomon.JPG",
    "kyoto-station-plaza": "File:130609 Kyoto Station Kyoto Japan03s3.jpg",
    "higashi-honganji-plaza": "File:Founder's Hall gate of Higashi-Honganji Temple, with water reflection, Kyoto, Japan.jpg",
    "nishi-honganji-gate": "File:Goeidō-mon, Nishi Hongwanji.jpg",
    "umekoji-park-east": "File:Umekoji park in 2013-5-2 No,1.JPG",
}


def fetch(url: str) -> bytes:
    for attempt in range(8):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as response:
                return response.read()
        except Exception as error:
            if attempt == 7:
                raise
            # Wikimedia rate-limits large batches with HTTP 429; honour Retry-After when it is given.
            retry_after = getattr(error, "headers", None) and error.headers.get("Retry-After")
            time.sleep(int(retry_after) if retry_after and retry_after.isdigit() else 5 * (attempt + 1))
    raise RuntimeError(url)


def main() -> None:
    out_dir = ROOT / "public/places"
    out_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = ROOT / "src/data/place-photos.json"
    manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
    pending = [(pid, title) for pid, title in CHOSEN.items() if pid not in manifest or not (out_dir / f"{pid}.jpg").exists()]
    if not pending:
        print("All photos already present and indexed.")
        return

    # Fetch metadata in small batches (<= 15 titles per request) to stay well under Wikimedia rate limits.
    meta_by_title: dict[str, dict] = {}
    for i in range(0, len(pending), 15):
        batch = pending[i:i + 15]
        query = urllib.parse.urlencode({
            "action": "query", "format": "json",
            "titles": "|".join(title for _, title in batch),
            "prop": "imageinfo", "iiprop": "url|extmetadata", "iiurlwidth": 800,
        })
        data = json.loads(fetch(f"https://commons.wikimedia.org/w/api.php?{query}"))
        normalized = {n["from"]: n["to"] for n in data.get("query", {}).get("normalized", [])}
        pages = data["query"]["pages"].values()
        by_norm = {p["title"]: p for p in pages if "imageinfo" in p}
        for _, title in batch:
            resolved = normalized.get(title, title)
            if resolved in by_norm:
                meta_by_title[title] = by_norm[resolved]["imageinfo"][0]
        time.sleep(1.5)

    for place_id, title in pending:
        info = meta_by_title.get(title)
        if not info:
            raise SystemExit(f"{title}: missing imageinfo from Commons API")
        meta = info["extmetadata"]
        licence = meta["LicenseShortName"]["value"].strip()
        if not ALLOWED.match(licence):
            raise SystemExit(f"{title}: licence {licence!r} is not allowed")
        author = re.sub(r"<[^>]+>", "", meta.get("Artist", {}).get("value", "")).strip() or "Unknown"
        img_path = out_dir / f"{place_id}.jpg"
        if not img_path.exists():
            img_path.write_bytes(fetch(info["thumburl"]))
            time.sleep(2.5)
        manifest[place_id] = {
            "src": f"/places/{place_id}.jpg",
            "width": info["thumbwidth"], "height": info["thumbheight"],
            "title": title.removeprefix("File:"),
            "author": author,
            "license": licence,
            "licenseUrl": meta.get("LicenseUrl", {}).get("value"),
            "sourceUrl": info["descriptionurl"],
        }
        # Persist incrementally in CHOSEN order so interrupted runs never lose progress.
        ordered = {pid: manifest[pid] for pid in CHOSEN if pid in manifest}
        manifest_path.write_text(json.dumps(ordered, ensure_ascii=False, indent=2) + "\n")
        print(place_id, licence, author)


if __name__ == "__main__":
    main()
