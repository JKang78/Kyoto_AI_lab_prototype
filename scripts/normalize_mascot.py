"""Derive web mascot images from the official 2048 px masters without redrawing them.

    python3 scripts/normalize_mascot.py          # requires Pillow

Masters (source of truth, never edited): design/mascot/originals/fox-<state>.png
Output (served by the app):               public/assets/mascot/fox-<state>.png

For each state it:
1. Removes stray background specks: any pixel more than ~16 px (at 2048 px) from the
   solid body of the fox becomes fully transparent. Edge anti-aliasing is kept.
2. Frames every state the same way: the fox is centred and scaled so it fits inside the
   circular avatar ring with the same margin, and states with very different footprints
   (the wide walking pose, the tall reward pose) end up with similar apparent size.
3. Writes a 512 px RGBA PNG (enough for the largest 88 px ring at 4x density).
"""
from pathlib import Path

from PIL import Image, ImageFilter

STATES = ["idle", "walking", "arrived", "reward", "warning"]
ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "design/mascot/originals"
OUTPUT = ROOT / "public/assets/mascot"
SIZE = 512
FIT_RADIUS = 0.47   # every opaque pixel lies within this fraction of the canvas from the centre
TARGET_AREA = 0.30  # fraction of the canvas covered by the fox, before the radius cap
SOLID_ALPHA = 200
KEEP_DISTANCE = 16  # px at master resolution


def clean_alpha(image: Image.Image) -> Image.Image:
    alpha = image.getchannel("A")
    small = alpha.resize((512, 512), Image.Resampling.BILINEAR)
    solid = small.point(lambda value: 255 if value >= SOLID_ALPHA else 0)
    radius = max(1, KEEP_DISTANCE * 512 // image.width)
    keep = solid.filter(ImageFilter.MaxFilter(radius * 2 + 1)).resize(image.size, Image.Resampling.NEAREST)
    cleaned = Image.composite(alpha, Image.new("L", image.size, 0), keep)
    result = image.copy()
    result.putalpha(cleaned)
    return result


def frame(image: Image.Image) -> Image.Image:
    alpha = image.getchannel("A")
    left, top, right, bottom = alpha.point(lambda value: 255 if value > 8 else 0).getbbox()
    cx, cy = (left + right) / 2, (top + bottom) / 2
    opaque = alpha.point(lambda value: 255 if value > 64 else 0)
    # Furthest opaque pixel from the bounding-box centre, sampled on a coarse grid for speed.
    pixels, step, reach = opaque.load(), 4, 0.0
    area = 0
    for y in range(top, bottom, step):
        for x in range(left, right, step):
            if pixels[x, y]:
                area += step * step
                reach = max(reach, ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5)
    scale_fit = FIT_RADIUS * SIZE / reach
    scale_area = (TARGET_AREA * SIZE * SIZE / area) ** 0.5
    scale = min(scale_fit, scale_area)
    crop = image.crop((left, top, right, bottom)).convert("RGBa")
    width, height = round(crop.width * scale), round(crop.height * scale)
    resized = crop.resize((width, height), Image.Resampling.LANCZOS).convert("RGBA")
    canvas = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    canvas.alpha_composite(resized, (round(SIZE / 2 - (cx - left) * scale), round(SIZE / 2 - (cy - top) * scale)))
    return canvas


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for state in STATES:
        master = Image.open(SOURCE / f"fox-{state}.png").convert("RGBA")
        frame(clean_alpha(master)).save(OUTPUT / f"fox-{state}.png", optimize=True)
        print(f"fox-{state}.png")


if __name__ == "__main__":
    main()
