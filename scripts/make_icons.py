from PIL import Image, ImageDraw
from pathlib import Path

out = Path(__file__).resolve().parent.parent / 'icons'
for size in (180, 192, 512):
    s = size / 512
    image = Image.new('RGB', (size, size), '#101a21')
    draw = ImageDraw.Draw(image)
    box = lambda coords: tuple(round(value * s) for value in coords)
    draw.rounded_rectangle(box((84, 60, 428, 452)), radius=round(32*s), fill='#1b6949', outline='#b1edc1', width=max(2, round(9*s)))
    for y in (191, 321):
        draw.line(box((85, y, 427, y)), fill='#a6dbad', width=max(2, round(7*s)))
    draw.line(box((256, 61, 256, 451)), fill='#a6dbad', width=max(2, round(7*s)))
    draw.line(box((176, 337, 256, 175, 336, 337)), fill='#fff9db', width=max(5, round(29*s)), joint='curve')
    draw.line(box((204, 281, 308, 281)), fill='#fff9db', width=max(5, round(27*s)))
    draw.ellipse(box((240, 159, 272, 191)), fill='#fff9db')
    image.save(out / f'icon-{size}.png', optimize=True)
