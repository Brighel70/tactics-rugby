"""Render the TACTICS field and T mark to the PNG sizes used by the PWA."""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SCALE = 3
SIZE = 512

def point(value):
    return round(value * SCALE)

image = Image.new("RGB", (point(SIZE), point(SIZE)), "#101a21")
draw = ImageDraw.Draw(image)
draw.rounded_rectangle((point(85), point(61), point(427), point(451)), radius=point(22), fill="#1b6949", outline="#b1edc1", width=point(9))
for y in (191, 321):
    draw.line((point(85), point(y), point(427), point(y)), fill="#b1edc1", width=point(7))
draw.line((point(256), point(61), point(256), point(451)), fill="#b1edc1", width=point(7))
draw.line((point(172), point(198), point(340), point(198)), fill="#fff9db", width=point(34))
draw.line((point(256), point(198), point(256), point(362)), fill="#fff9db", width=point(34))
draw.ellipse((point(234), point(385), point(278), point(413)), fill="#fff9db", outline="#775534", width=point(4))
image = image.resize((SIZE, SIZE), Image.Resampling.LANCZOS)

icons = ROOT / "icons"
for pixels in (180, 192, 512):
    image.resize((pixels, pixels), Image.Resampling.LANCZOS).save(icons / f"icon-t-{pixels}.png", optimize=True)
