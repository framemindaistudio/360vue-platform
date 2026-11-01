"""
Builds the 360VUE key visual (public/media/keyvisual.webp and keyvisual-sm.webp) from the shared icon in .assets-raw/.

  python scripts/keyvisual.py

Midnight, a warm glow, a few sweeping light trails and gold dust, with the icon floating right of centre (the site lays
dark gradients over the left side for text). Composed here, not generated, so it always shows the current icon.
"""
import math
import random
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / ".assets-raw"
MEDIA = ROOT / "public" / "media"
W, H = 2560, 1440
MIDNIGHT = (14, 11, 8)

random.seed(360)
img = Image.new("RGBA", (W, H), MIDNIGHT + (255,))

# warm glow behind the icon, and a low one along the floor
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(glow)
d.ellipse((1020, 220, 2220, 1220), fill=(245, 158, 76, 70))
d.ellipse((600, 1150, 2560, 1700), fill=(217, 149, 63, 40))
img.alpha_composite(glow.filter(ImageFilter.GaussianBlur(260)))

# sweeping light trails, bottom-left to top-right
trails = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(trails)
for k, (lift, width, alpha) in enumerate([(0, 10, 150), (70, 5, 120), (150, 3, 90), (-90, 4, 80)]):
    pts = []
    for i in range(0, 241):
        t = i / 240
        x = -200 + t * (W + 400)
        y = H * 0.92 - lift - math.sin(t * math.pi * 0.9) * 420 - t * 520
        pts.append((x, y))
    d.line(pts, fill=(250, 190, 110, alpha), width=width, joint="curve")
img.alpha_composite(trails.filter(ImageFilter.GaussianBlur(6)))
img.alpha_composite(trails.filter(ImageFilter.GaussianBlur(28)))

# gold dust: small soft dots, more of them near the trails and the icon
dust = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(dust)
for _ in range(900):
    x = random.gauss(1650, 620)
    y = random.gauss(620, 380)
    r = random.choice([1, 1, 1.5, 2, 2, 3, 5, 9])
    a = random.randint(40, 200) if r < 5 else random.randint(25, 70)
    d.ellipse((x - r, y - r, x + r, y + r), fill=(250, 200, 120, a))
img.alpha_composite(dust.filter(ImageFilter.GaussianBlur(1.2)))

# the icon, right of centre, with a soft reflection on the floor
icon = Image.open(RAW / "emblem-transparent.png").convert("RGBA")
icon = icon.crop(icon.getbbox())
# kept inside the middle band (y 370-1070) so it survives the crop of very wide sections, like the closing band
ih = 700
icon = icon.resize((round(icon.width * ih / icon.height), ih), Image.LANCZOS)
x, y = 1620 - icon.width // 2, (H - ih) // 2
halo = Image.new("RGBA", (W, H), (0, 0, 0, 0))
halo.alpha_composite(icon, (x, y))
img.alpha_composite(Image.eval(halo.filter(ImageFilter.GaussianBlur(60)), lambda v: v).point(lambda v: v * 0.55 if v else 0))
refl = icon.transpose(Image.FLIP_TOP_BOTTOM).filter(ImageFilter.GaussianBlur(14))
fade = Image.linear_gradient("L").resize(refl.size).point(lambda v: max(0, 255 - v * 3) * 0.22)
r, g, b, a = refl.split()
refl.putalpha(Image.composite(a, Image.new("L", refl.size, 0), fade.convert("L")))
img.alpha_composite(refl, (x, y + ih + 20))
img.alpha_composite(icon, (x, y))

out = img.convert("RGB")
out.save(MEDIA / "keyvisual.webp", quality=88)
out.resize((1200, 675), Image.LANCZOS).save(MEDIA / "keyvisual-sm.webp", quality=84)
print("done")
