import os, shutil
from collections import deque
import numpy as np
from PIL import Image, ImageFilter

SRC = '/home/user/uploads'
DST = '/home/user/rakin-khan-portfolio/public/assets'
os.makedirs(DST, exist_ok=True)

def flood_remove(src, dst, thresh=26, feather=1.0, pad=10):
    im = Image.open(src).convert('RGBA')
    a = np.array(im)
    h, w = a.shape[:2]
    dark = a[..., :3].max(axis=2) < thresh
    visited = np.zeros((h, w), dtype=bool)
    dq = deque()
    for x in range(w):
        if dark[0, x] and not visited[0, x]: visited[0, x] = True; dq.append((0, x))
        if dark[h-1, x] and not visited[h-1, x]: visited[h-1, x] = True; dq.append((h-1, x))
    for y in range(h):
        if dark[y, 0] and not visited[y, 0]: visited[y, 0] = True; dq.append((y, 0))
        if dark[y, w-1] and not visited[y, w-1]: visited[y, w-1] = True; dq.append((y, w-1))
    pop = dq.popleft; app = dq.append
    while dq:
        y, x = pop()
        if y > 0 and dark[y-1, x] and not visited[y-1, x]: visited[y-1, x] = True; app((y-1, x))
        if y < h-1 and dark[y+1, x] and not visited[y+1, x]: visited[y+1, x] = True; app((y+1, x))
        if x > 0 and dark[y, x-1] and not visited[y, x-1]: visited[y, x-1] = True; app((y, x-1))
        if x < w-1 and dark[y, x+1] and not visited[y, x+1]: visited[y, x+1] = True; app((y, x+1))
    a[visited, 3] = 0
    out = Image.fromarray(a, 'RGBA')
    if feather:
        alpha = out.getchannel('A').filter(ImageFilter.GaussianBlur(feather))
        out.putalpha(alpha)
    bbox = out.getchannel('A').getbbox()
    if bbox:
        l, t, r, b = bbox
        l = max(0, l-pad); t = max(0, t-pad); r = min(w, r+pad); b = min(h, b+pad)
        out = out.crop((l, t, r, b))
    out.save(dst)
    removed = int(visited.sum())
    print(f'{os.path.basename(src)} -> {os.path.basename(dst)}: out={out.size}, removed {removed*100//(h*w)}% of pixels')

flood_remove(f'{SRC}/Crimson Ronin with Flowing Cloak.png', f'{DST}/samurai.png', thresh=26)
flood_remove(f'{SRC}/RAKIN KHAN Angular Logo.png', f'{DST}/logo.png', thresh=30, feather=0.8)
shutil.copy(f'{SRC}/Cubist Pop-Art Portrait of a Bearded Man.png', f'{DST}/portrait.png')

logo = Image.open(f'{DST}/logo.png')
fh = 64; fw = int(logo.width * fh / logo.height)
logo.resize((fw, fh), Image.LANCZOS).save(f'{DST}/favicon.png')
print('done')
