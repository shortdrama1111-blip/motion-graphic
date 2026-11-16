"""Put the rebuilt epara app into the green phone screen of S1 (corner tracking + key + despill).

Writes build/S1a.mp4 (send screen, tap -> pressed) and build/S1b.mp4 (success screen).
"""
import os

import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)

cap = cv2.VideoCapture(P('footage', 'S1-tap.mp4'))
FPS = cap.get(5)
frames = []
while True:
    ok, f = cap.read()
    if not ok:
        break
    frames.append(f)


def green(f):
    b, g, r = [f[:, :, i].astype(np.float32) for i in range(3)]
    return np.clip((g - np.maximum(r, b) - 25) / 60.0, 0, 1)   # 0 = not green, 1 = pure screen green


def screen_quad(f):
    m = (green(f) > 0.5).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((25, 25), np.uint8))
    cnts, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    c = max(cnts, key=cv2.contourArea)
    hull = cv2.convexHull(c).reshape(-1, 2).astype(np.float32)
    # corners = extreme points along the diagonals (robust when the thumb covers an edge)
    s, d = hull.sum(1), hull[:, 0] - hull[:, 1]
    tl, br = hull[np.argmin(s)], hull[np.argmax(s)]
    tr, bl = hull[np.argmax(d)], hull[np.argmin(d)]
    return np.float32([tl, tr, br, bl])


quads = np.array([screen_quad(f) for f in frames])
# smooth the track over time (hand shake stays, detection jitter goes)
k = 5
sm = quads.copy()
for i in range(len(quads)):
    a, b = max(0, i - k // 2), min(len(quads), i + k // 2 + 1)
    sm[i] = quads[a:b].mean(0)
# the screen has rounded corners: grow the quad a little so the UI reaches them
ctr = sm.mean(1, keepdims=True)
sm = ctr + (sm - ctr) * 1.035


def comp(f, quad, ui):
    h, w = ui.shape[:2]
    src = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    Hm = cv2.getPerspectiveTransform(src, quad)
    warped = cv2.warpPerspective(ui, Hm, (f.shape[1], f.shape[0]), flags=cv2.INTER_LINEAR)
    inside = cv2.warpPerspective(np.ones((h, w), np.float32), Hm, (f.shape[1], f.shape[0]))
    a = green(f) * inside
    a = cv2.GaussianBlur(a, (0, 0), 1.2)[..., None]
    out = f.astype(np.float32)
    # despill: green light on the face, hand and shirt becomes the app's own white/purple glow
    b, g, r = out[:, :, 0], out[:, :, 1], out[:, :, 2]
    lim = np.maximum(r, b)
    spill = np.clip(g - lim, 0, None)
    out[:, :, 1] = g - spill
    out[:, :, 0] = b + spill * 0.55
    out[:, :, 2] = r + spill * 0.45
    out = out * (1 - a) + warped.astype(np.float32) * a
    return np.clip(out, 0, 255).astype(np.uint8)


def write(name, idx, ui_for):
    vw = cv2.VideoWriter(P('build', name), cv2.VideoWriter_fourcc(*'mp4v'), FPS, (1080, 1920))
    for n, i in enumerate(idx):
        vw.write(comp(frames[i], sm[i], ui_for(n / FPS)))
    vw.release()


ui = {k: cv2.imread(P('build', f'ui-{k}.png')) for k in ('send-normal', 'send-pressed', 'success')}
TAP = 0.55
write('S1a.mp4', range(0, min(len(frames), int(1.3 * FPS))), lambda t: ui['send-pressed'] if t >= TAP else ui['send-normal'])
start = int(1.5 * FPS)
write('S1b.mp4', range(start, min(len(frames), start + int(1.4 * FPS))), lambda t: ui['success'])
cv2.imwrite(P('tests', 'phone-comp.jpg'), np.hstack([cv2.resize(comp(frames[j], sm[j], ui['send-pressed' if j > 13 else 'send-normal']), (360, 640)) for j in (2, 16, 40)]))
print('ok', len(frames), 'frames')
