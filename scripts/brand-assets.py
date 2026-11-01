"""
Builds every 360VUE logo file from the icon renders in .assets-raw/ (not committed).

The icon is shared with the parent company, FrameMind AI Studio (the gold shutter rings with a mind inside); only the
wordmark differs. Copy FrameMind's 4K sources in as .assets-raw/emblem-transparent.png, emblem-dark.png and
emblem-mono.png and rerun this script. The icon is a little wider than it is tall, so it is always fitted by its
proportions, never squashed into a square.

  python scripts/brand-assets.py

Outputs to public/brand/ (site + favicons) and public/brand/kit/ (4K logo kit for print and social).
The wordmark is set in Montserrat here, not generated, so the letters are always exact.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / ".assets-raw"
OUT = ROOT / "public" / "brand"
KIT = OUT / "kit"
OUT.mkdir(parents=True, exist_ok=True)
KIT.mkdir(parents=True, exist_ok=True)
FONT = str(RAW / "fonts" / "Montserrat.ttf")

MIDNIGHT = (14, 11, 8)
CREAM = (249, 245, 237)
SAND = (235, 214, 181)
INK = (28, 22, 16)
GOLD_STOPS = [(0.0, (250, 214, 150)), (0.45, (232, 168, 84)), (1.0, (164, 98, 44))]


def font(size, weight="Bold"):
    f = ImageFont.truetype(FONT, size)
    f.set_variation_by_name(weight)
    return f


def gradient(w, h, stops):
    """Vertical gradient image (RGB)."""
    g = Image.new("RGB", (1, h))
    for y in range(h):
        t = y / max(1, h - 1)
        for (t0, c0), (t1, c1) in zip(stops, stops[1:]):
            if t0 <= t <= t1:
                k = (t - t0) / (t1 - t0)
                g.putpixel((0, y), tuple(round(a + (b - a) * k) for a, b in zip(c0, c1)))
                break
    return g.resize((w, h))


def text_width(f, s, tracking=0):
    return sum(f.getlength(ch) for ch in s) + tracking * (len(s) - 1)


def draw_tracked(img, xy, s, f, fill, tracking=0):
    """Draws text letter by letter so tracking is exact. fill is a colour or a gradient image."""
    x, y = xy
    for ch in s:
        if isinstance(fill, Image.Image):
            mask = Image.new("L", img.size, 0)
            ImageDraw.Draw(mask).text((x, y), ch, font=f, fill=255)
            img.paste(fill, (0, 0), mask) if fill.size == img.size else None
        else:
            ImageDraw.Draw(img).text((x, y), ch, font=f, fill=fill)
        x += f.getlength(ch) + tracking


def wordmark(img, cx, top, size, first_fill, gold=True, mono=None):
    """'360' + 'VUE', centred on cx. Returns the bottom y."""
    f = font(size, "Bold")
    tr = size * 0.02
    w360 = text_width(f, "360", tr)
    wvue = text_width(f, "VUE", tr)
    total = w360 + tr + wvue
    x = cx - total / 2
    asc, desc = f.getmetrics()
    draw_tracked(img, (x, top), "360", f, mono or first_fill, tr)
    if mono:
        draw_tracked(img, (x + w360 + tr, top), "VUE", f, mono, tr)
    else:
        # the gold gradient spans just the letter height
        g =Image.new("RGB", img.size, GOLD_STOPS[-1][1])
        band = gradient(img.width, int(asc), GOLD_STOPS)
        g.paste(band, (0, int(top)))
        draw_tracked(img, (x + w360 + tr, top), "VUE", f, g, tr)
    return top + asc


def tagline(img, cx, top, size, fill, text="SEE EVERY ANGLE."):
    f = font(size, "Medium")
    tr = size * 0.55
    w = text_width(f, text, tr)
    draw_tracked(img, (cx - w / 2, top), text, f, fill, tr)
    return top + f.getmetrics()[0]


def emblem(kind="color"):
    name = {"color": "emblem-transparent.png", "mono": "emblem-mono.png"}[kind]
    im = Image.open(RAW / name).convert("RGBA")
    return im.crop(im.getbbox())


def fit(im, w, h):
    """The icon scaled to fit inside w x h, keeping its proportions."""
    s = min(w / im.width, h / im.height)
    return im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)


def square_icon(im, side):
    """The icon centred in a transparent square, keeping its proportions (favicons, app icons, emblem files)."""
    r = fit(im, side, side)
    sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    sq.alpha_composite(r, ((side - r.width) // 2, (side - r.height) // 2))
    return sq


def fit_width(im, width):
    return im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)


def lockup(bg, first_fill, tag_fill, kind="color", mono_text=None, w=3840, h=3840, name="lockup"):
    img = Image.new("RGBA", (w, h), bg + (255,) if bg else (0, 0, 0, 0))
    em = fit(emblem(kind), int(h * 0.46), int(h * 0.42))
    es = em.height
    top = int(h * 0.13)
    if bg == MIDNIGHT:
        glow = Image.new("RGBA", img.size, (0, 0, 0, 0))
        ImageDraw.Draw(glow).ellipse((w / 2 - em.width * 0.6, top - es * 0.1, w / 2 + em.width * 0.6, top + es * 1.1), fill=(245, 158, 76, 46))
        img.alpha_composite(glow.filter(ImageFilter.GaussianBlur(es * 0.18)))
    img.alpha_composite(em, (w // 2 - em.width // 2, top))
    y = wordmark(img, w / 2, top + es + h * 0.06, int(h * 0.135), first_fill, mono=mono_text)
    tagline(img, w / 2, y + h * 0.055, int(h * 0.028), tag_fill)
    img.save(KIT / f"{name}.png", optimize=True)
    return img


def horizontal(bg, first_fill, tag_fill, name, w=3840, h=1280, kind="color", mono_text=None):
    img = Image.new("RGBA", (w, h), bg + (255,) if bg else (0, 0, 0, 0))
    em = fit(emblem(kind), int(h * 0.78), int(h * 0.72))
    img.alpha_composite(em, (int(h * 0.15), (h - em.height) // 2))
    size = int(h * 0.36)
    f = font(size, "Bold")
    tr = size * 0.02
    total = text_width(f, "360", tr) + tr + text_width(f, "VUE", tr)
    tx = int(h * 0.15) + em.width + h * 0.12
    cx = tx + total / 2
    top = h * 0.2
    y = wordmark(img, cx, top, size, first_fill, mono=mono_text)
    tagline(img, cx, y + h * 0.07, int(h * 0.062), tag_fill)
    if bg:
        img = img.crop((0, 0, int(tx + total + h * 0.15), h))
    else:
        l, t, r, b = img.getbbox()
        p = int(h * 0.06)
        img = img.crop((max(0, l - p), max(0, t - p), min(w, r + p), min(h, b + p)))
    img.save(KIT / f"{name}.png", optimize=True)
    return img


if __name__ == "__main__":
    import json

    # 4K emblem files: the icon centred in a 4096 square, with a margin
    em = emblem("color")
    sq = Image.new("RGBA", (4096, 4096), (0, 0, 0, 0))
    sq.alpha_composite(square_icon(em, 4096 - 2 * 198), (198, 198))
    sq.save(KIT / "360vue-emblem-4k.png", optimize=True)
    sq2 = Image.new("RGBA", (4096, 4096), (0, 0, 0, 0))
    sq2.alpha_composite(square_icon(emblem("mono"), 4096 - 2 * 198), (198, 198))
    sq2.save(KIT / "360vue-emblem-mono-4k.png", optimize=True)

    # the emblem on Midnight, with the warm glow behind it
    mid = Image.new("RGBA", (4096, 4096), MIDNIGHT + (255,))
    glow = Image.new("RGBA", mid.size, (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse((700, 700, 3396, 3396), fill=(245, 158, 76, 40))
    mid.alpha_composite(glow.filter(ImageFilter.GaussianBlur(420)))
    mid.alpha_composite(square_icon(em, 3200), (448, 448))
    mid.convert("RGB").save(KIT / "360vue-emblem-on-midnight-4k.png", optimize=True)

    lockup(MIDNIGHT, CREAM, SAND, name="360vue-logo-dark-4k")
    lockup(CREAM, INK, (122, 86, 52), name="360vue-logo-light-4k")
    lockup((236, 234, 230), None, (90, 90, 90), kind="mono", mono_text=(38, 38, 38), name="360vue-logo-mono-4k")
    lockup(None, CREAM, SAND, name="360vue-logo-transparent-4k")
    horizontal(MIDNIGHT, CREAM, SAND, "360vue-horizontal-dark-4k")
    hz_on_dark = horizontal(None, CREAM, SAND, "360vue-horizontal-on-dark-transparent-4k")
    hz_on_light = horizontal(None, INK, (122, 86, 52), "360vue-horizontal-on-light-transparent-4k")

    # Site + favicon sizes (square files: the icon centred, never squashed)
    square_icon(em, 512).save(OUT / "emblem-512.png", optimize=True)
    square_icon(em, 256).save(OUT / "emblem-256.webp", quality=90)
    square_icon(em, 128).save(OUT / "emblem-128.webp", quality=88)
    for s, n in [(192, "icon-192.png"), (512, "icon-512.png"), (180, "apple-touch-icon.png")]:
        tile = Image.new("RGBA", (s, s), MIDNIGHT + (255,))
        es = int(s * 0.82)
        tile.alpha_composite(square_icon(em, es), ((s - es) // 2, (s - es) // 2))
        tile.save(OUT / n, optimize=True)
    square_icon(em, 256).save(ROOT / "src" / "app" / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    square_icon(em, 512).save(ROOT / "src" / "app" / "icon.png", optimize=True)
    Image.open(OUT / "apple-touch-icon.png").save(ROOT / "src" / "app" / "apple-icon.png")

    # small horizontal logos used in HQ decks and documents
    fit_width(hz_on_dark, 900).save(OUT / "logo-on-dark.png", optimize=True)
    fit_width(hz_on_light, 900).save(OUT / "logo-on-light.png", optimize=True)

    # the social share image (1200 x 630): the horizontal logo on Midnight with a soft glow
    og = Image.new("RGBA", (1200, 630), MIDNIGHT + (255,))
    g = Image.new("RGBA", og.size, (0, 0, 0, 0))
    ImageDraw.Draw(g).ellipse((80, 40, 640, 600), fill=(245, 158, 76, 46))
    og.alpha_composite(g.filter(ImageFilter.GaussianBlur(120)))
    hz = fit_width(hz_on_dark, 980)
    og.alpha_composite(hz, ((1200 - hz.width) // 2, (630 - hz.height) // 2))
    og.convert("RGB").save(ROOT / "public" / "og-image.jpg", quality=92)

    # light previews and real sizes for HQ -> Brand Kit (the 4K files are for download)
    prev = KIT / "preview"
    prev.mkdir(exist_ok=True)
    sizes = {}
    for f in sorted(KIT.glob("*.png")):
        im = Image.open(f)
        sizes[f.name] = {"w": im.width, "h": im.height, "bytes": f.stat().st_size}
        im.thumbnail((900, 900), Image.LANCZOS)
        im.save(prev / (f.stem + ".webp"), quality=86)
    (KIT / "sizes.json").write_text(json.dumps(sizes, indent=2) + "\n", encoding="utf8")
    print("done")
