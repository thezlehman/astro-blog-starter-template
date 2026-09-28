import math
from PIL import Image, ImageDraw

NAVY = (20, 33, 61, 255)
FLAG_RED = (178, 58, 46, 255)
CREAM = (243, 237, 224, 255)
SKY = (127, 179, 213, 255)

SIZE = 1024


def make_mark(size, bg=None):
    img = Image.new("RGBA", (size, size), bg if bg else (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx = cy = size / 2
    r = size * 0.42
    ring_w = max(2, size * 0.028)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=NAVY, width=int(ring_w))

    # compass needle: two triangles (diamond), north tip flag-red, south tip navy
    tip = size * 0.34
    half_w = size * 0.075
    # north triangle (pointing up)
    d.polygon(
        [(cx, cy - tip), (cx - half_w, cy), (cx + half_w, cy)],
        fill=FLAG_RED,
    )
    # south triangle (pointing down)
    d.polygon(
        [(cx, cy + tip), (cx - half_w, cy), (cx + half_w, cy)],
        fill=NAVY,
    )
    # center dot
    dot_r = size * 0.045
    d.ellipse([cx - dot_r, cy - dot_r, cx + dot_r, cy + dot_r], fill=NAVY)

    # four small tick marks at N/E/S/W just outside ring
    tick_len = size * 0.035
    tick_w = max(2, size * 0.018)
    for angle_deg in (0, 90, 180, 270):
        a = math.radians(angle_deg - 90)
        x1 = cx + (r + ring_w) * math.cos(a)
        y1 = cy + (r + ring_w) * math.sin(a)
        x2 = cx + (r + ring_w + tick_len) * math.cos(a)
        y2 = cy + (r + ring_w + tick_len) * math.sin(a)
        d.line([(x1, y1), (x2, y2)], fill=NAVY, width=int(tick_w))

    return img


mark = make_mark(SIZE)
mark.save("public/assets/img/mark-master.png")

for name, size in [
    ("favicon-16.png", 16),
    ("favicon-32.png", 32),
    ("favicon-48.png", 48),
    ("apple-touch-icon.png", 180),
    ("icon-192.png", 192),
]:
    Image.open("public/assets/img/mark-master.png").resize((size, size), Image.LANCZOS).save(
        f"public/assets/img/{name}"
    )

# maskable / large icon with cream circular backing so it isn't clipped oddly
icon_512 = make_mark(512, bg=CREAM)
icon_512.save("public/assets/img/icon-512.png")

print("icons done")
