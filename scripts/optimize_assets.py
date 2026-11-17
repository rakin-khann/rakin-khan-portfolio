import os
from PIL import Image

A = 'public/assets'
report = []

def to_webp(name, out, max_w=None, q=85, keep_alpha=False):
    src = os.path.join(A, name)
    im = Image.open(src)
    im = im.convert('RGBA' if keep_alpha else 'RGB')
    if max_w and im.width > max_w:
        h = round(im.height * max_w / im.width)
        im = im.resize((max_w, h), Image.LANCZOS)
    dst = os.path.join(A, out)
    im.save(dst, 'WEBP', quality=q, method=6)
    before = os.path.getsize(src); after = os.path.getsize(dst)
    report.append((name, before, out, after))

towebp = [
    ('samurai.png',   'samurai.webp',   None, 88, True),   # hero character, keep alpha + full res
    ('bg-hero.png',   'bg-hero.webp',   1920, 78, False),
    ('bg-torii.png',  'bg-torii.webp',  1920, 78, False),
    ('portrait.png',  'portrait.webp',  900,  85, False),
    ('logo.png',      'logo.webp',      640,  90, True),
    ('work-neon.jpg',       'work-neon.webp',       900, 82, False),
    ('work-headphones.jpg', 'work-headphones.webp', 900, 82, False),
    ('work-character.jpg',  'work-character.webp',  900, 82, False),
    ('work-moon.jpg',       'work-moon.webp',       900, 82, False),
]
for args in towebp:
    to_webp(*args)

for name, b, out, a in report:
    print(f'{name:24s} {b//1024:>5} KB -> {out:24s} {a//1024:>4} KB')

# remove the heavy originals from public (sources remain in ~/uploads)
for name, *_ in towebp:
    os.remove(os.path.join(A, name))
print('originals removed from public/assets')
