"""Relight the photo plates with the official epara mark (no AI-generated logo).

Outputs (build/):
  hook_overlay.png  RGBA: the mark lit into the real rooms of the tower (P2 rooms, brand gradient), with glow
  hook_rowmap.png   grey: per-cell switch-on order (bottom-up), used to reveal the overlay floor by floor
  city_dim.jpg      the city aerial with lights dimmed
  city_mark.jpg     the city aerial with the epara mark glowing across the whole district
"""
import os

import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)
os.makedirs(P('build'), exist_ok=True)

STOPS = [(0.0, (240, 78, 69)), (0.33, (224, 37, 106)), (0.55, (200, 0, 123)), (0.78, (91, 42, 155)), (1.0, (0, 114, 188))]


def grad(u):
    u = float(np.clip(u, 0, 1))
    for (a0, c0), (a1, c1) in zip(STOPS, STOPS[1:]):
        if u <= a1:
            t = (u - a0) / (a1 - a0)
            return np.array(c0) * (1 - t) + np.array(c1) * t
    return np.array(STOPS[-1][1], float)


def mark_mask():
    """Official epara mark (flag + drop) from the logo raster, as 0..1 float."""
    a = cv2.imread(P('plates', 'logo-2000.png'), cv2.IMREAD_UNCHANGED)[:, :, 3]
    mk = a[9:1207, 35:909].copy()
    yy, xx = np.mgrid[0:mk.shape[0], 0:mk.shape[1]]
    mk[(xx + 35 >= 470) & (yy + 9 >= 740)] = 0          # drop the wordmark letters
    mk = (mk > 40).astype(np.uint8) * 255
    # widen the thin gap between flag and drop so it survives a coarse window grid
    gap = cv2.dilate(255 - mk, np.ones((45, 45), np.uint8))
    flag_drop_gap = (gap > 0) & (yy > 600) & (yy < 900)
    mk[flag_drop_gap] = 0
    return mk.astype(np.float32) / 255.0


def hook():
    P1 = cv2.imread(P('plates', 'P1-tower.jpg')).astype(np.float32)
    P2 = cv2.imread(P('plates', 'P2-tower-lit.jpg')).astype(np.float32)
    H, W = P1.shape[:2]
    mk = mark_mask()
    fx0, fx1, fy0, fy1 = 306, 1094, 492, 1555
    sc = min((fx1 - fx0) / mk.shape[1], (fy1 - fy0) / mk.shape[0])
    mw, mh = int(mk.shape[1] * sc), int(mk.shape[0] * sc)
    ox, oy = (fx0 + fx1 - mw) // 2, fy0
    M = np.zeros((H, W), np.float32)
    M[oy:oy + mh, ox:ox + mw] = cv2.resize(mk, (mw, mh), interpolation=cv2.INTER_AREA)
    xls = [303 + k * 41 for k in range(40) if 300 < 303 + k * 41 < 1090]
    yls = [494 + j * 39 for j in range(40) if 500 < 494 + j * 39 < 1565]
    L1, L2 = P1.mean(2), P2.mean(2)
    panes = []
    for yl in yls:
        for xl in xls:
            for px0, px1 in ((xl + 1, xl + 12), (xl + 12, xl + 23)):
                panes.append((px0, px1, yl - 21, yl - 1))
    lit = [p for p in panes if (L2[p[2]:p[3], p[0]:p[1]] - L1[p[2]:p[3], p[0]:p[1]]).mean() > 25]
    rng = np.random.default_rng(3)
    over = np.zeros((H, W, 4), np.float32)
    glow = np.zeros((H, W, 3), np.float32)
    order = np.zeros((H, W), np.float32)
    nfl = len(yls)
    for (x0, x1, y0, y1) in panes:
        cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
        if M[cy, cx] < 0.5:
            continue
        src = (x0, x1, y0, y1) if (x0, x1, y0, y1) in lit else lit[rng.integers(len(lit))]
        patch = P2[src[2]:src[3], src[0]:src[1]]
        patch = cv2.resize(patch, (x1 - x0, y1 - y0))
        u = np.clip((cx - ox) / mw * 1.05 - 0.05 + (1 - (cy - oy) / mh) * 0.1, 0, 1)
        col = grad(u)[::-1] / 255.0                          # BGR
        lum = patch.mean(2, keepdims=True) / 255.0
        tinted = np.clip((0.3 * patch / 255.0 + 0.75 * lum * col * 2.1), 0, 1)
        over[y0:y1, x0:x1, :3] = tinted * 255
        over[y0:y1, x0:x1, 3] = 255
        glow[y0:y1, x0:x1] = col * 255
        floor = (cy - 494) / 39.0
        order[y0 - 2:y1 + 2, x0 - 1:x1 + 1] = 1 - floor / nfl      # 1 = bottom floor (first on)
    g = cv2.GaussianBlur(glow, (0, 0), 16)
    ga = np.clip(g.max(2) / 255.0 * 1.4, 0, 1)
    # composite glow under the panes into the overlay
    base_a = over[:, :, 3:4] / 255.0
    rgb = over[:, :, :3] * base_a + g * 0.55 * (1 - base_a)
    a = np.maximum(base_a[:, :, 0], ga * 0.55)
    out = np.dstack([np.clip(rgb / np.maximum(a[:, :, None], 1e-3), 0, 255), a * 255])
    cv2.imwrite(P('build', 'hook_overlay.png'), out.astype(np.uint8))
    om = cv2.dilate(order, np.ones((25, 25), np.uint8))           # glow follows its floor
    cv2.imwrite(P('build', 'hook_rowmap.png'), (om * 255).astype(np.uint8))
    preview = P1 * (1 - a[:, :, None]) + out[:, :, :3] * a[:, :, None]
    cv2.imwrite(P('tests', 'hook-mark-test2.jpg'), preview.astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 92])
    print('hook: panes lit', int((over[:, :, 3] > 0).sum() / 220))


def city():
    C = cv2.imread(P('plates', 'P4-city-aerial.jpg')).astype(np.float32)
    H, W = C.shape[:2]
    mk = mark_mask()
    h0, w0 = mk.shape
    # the mark lies on the ground: map its rectangle onto a perspective quad over the district
    src = np.float32([[0, 0], [w0, 0], [w0, h0], [0, h0]])
    dst = np.float32([[230, 800], [990, 800], [1130, 1930], [70, 1930]])
    Hm = cv2.getPerspectiveTransform(src, dst)
    M = cv2.warpPerspective(mk, Hm, (W, H))
    M = cv2.GaussianBlur(M, (0, 0), 2.5)
    lum = C.mean(2) / 255.0
    lights = np.clip((lum - 0.25) / 0.5, 0, 1)[:, :, None]
    yy, xx = np.mgrid[0:H, 0:W]
    u = np.clip((xx + 40) / (W + 80) * 1.0, 0, 1)
    lut = np.array([grad(v)[::-1] for v in np.linspace(0, 1, 256)], np.float32)
    col = lut[(u * 255).astype(int)] / 255.0
    dim = C * 0.42
    lit = C * 0.25 + (0.5 + lights * 1.3) * col * 255
    m = M[:, :, None]
    mark = dim * (1 - m) + np.clip(lit, 0, 255) * m
    bloom = cv2.GaussianBlur(np.clip(mark - 120, 0, 255), (0, 0), 22)
    mark = np.clip(mark + bloom * 0.6, 0, 255)
    cv2.imwrite(P('build', 'city_dim.jpg'), dim.astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 94])
    cv2.imwrite(P('build', 'city_mark.jpg'), mark.astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 94])
    cv2.imwrite(P('build', 'city_mask.png'), (M * 255).astype(np.uint8))
    print('city done')


if __name__ == '__main__':
    hook()
    city()
