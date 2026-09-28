import math
from PIL import Image, ImageDraw, ImageFont

CREAM = (243, 237, 224, 255)
NAVY = (20, 33, 61, 255)
SKY = (127, 179, 213, 255)
FLAG_RED = (178, 58, 46, 255)

W, H = 1200, 630
img = Image.new("RGB", (W, H), CREAM)
d = ImageDraw.Draw(img)

# thin flowing wind lines in the background
for i in range(6):
    y0 = 90 + i * 80
    pts = []
    for x in range(0, W + 20, 20):
        y = y0 + 10 * math.sin((x / 140) + i)
        pts.append((x, y))
    d.line(pts, fill=SKY + (255,) if len(SKY) == 3 else SKY, width=1)

# inset border frame
margin = 28
d.rectangle([margin, margin, W - margin, H - margin], outline=NAVY, width=2)

fraunces = ImageFont.truetype("public/assets/fonts/fraunces-variable.ttf", 76)
fraunces.set_variation_by_axes([600])
mono = ImageFont.truetype("public/assets/fonts/ibm-plex-mono-regular.ttf", 22)
mono_sb = ImageFont.truetype("public/assets/fonts/ibm-plex-mono-semibold.ttf", 20)
inst = ImageFont.truetype("public/assets/fonts/instrument-sans-variable.ttf", 30)

# compass mark, small, top-left
mark = Image.open("public/assets/img/mark-master.png").convert("RGBA").resize((72, 72), Image.LANCZOS)
img.paste(mark, (70, 66), mark)

d.text((156, 78), "WINDSTORM SERVICES", font=mono_sb, fill=NAVY)
d.text((156, 106), "SHAMOKIN, PA — FAN REVIVAL", font=mono, fill=NAVY)

d.text((70, 230), "Whirled:", font=fraunces, fill=NAVY)
d.text((70, 320), "Second Wind", font=fraunces, fill=NAVY)

d.text((70, 430), "A community-driven revival of the classic virtual world.", font=inst, fill=NAVY)
d.text((70, 470), "In development — getting ready for testers.", font=inst, fill=NAVY)

# status chip bottom right, beaufort-style
chip_w, chip_h = 300, 56
cx0, cy0 = W - margin - chip_w - 20, H - margin - chip_h - 24
d.rectangle([cx0, cy0, cx0 + chip_w, cy0 + chip_h], outline=NAVY, width=2, fill=(255, 255, 255))
d.text((cx0 + 16, cy0 + 15), "FORCE 8 — GALE", font=mono_sb, fill=FLAG_RED)

img.save("public/assets/img/og-image.png")
print("og image done", img.size)
