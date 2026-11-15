"""SFX-only stem for the epara reel (the user adds their own music at 120 BPM).

Reads ../src/beats.json, writes ../public/sfx.wav (48 kHz, 24-bit) mastered to
about -16 LUFS / -1 dBTP so a music bed can sit under it.
Run: python3 audio/sfx.py
"""
import json
import os

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from scipy.ndimage import maximum_filter1d, uniform_filter1d
from scipy.signal import butter, resample_poly, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B = json.load(open(os.path.join(ROOT, 'src', 'beats.json')))
SR, DUR = 48000, B['duration']
N = int(DUR * SR)
rng = np.random.default_rng(11)
out = np.zeros((N, 2))


def tt(n):
    return np.arange(n) / SR


def lp(x, fc):
    return sosfilt(butter(2, fc, 'low', fs=SR, output='sos'), x)


def hp(x, fc):
    return sosfilt(butter(2, fc, 'high', fs=SR, output='sos'), x)


def bp(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], 'band', fs=SR, output='sos'), x)


def env(n, a, d):
    e = np.ones(n)
    na, nd = max(1, int(a * SR)), max(1, int(d * SR))
    e[:na] = np.linspace(0, 1, na)
    e[-nd:] *= np.linspace(1, 0, nd)
    return e


def place(sig, at, g=1.0, pan=0.0):
    i = int(round(at * SR))
    if i >= N or i + len(sig) <= 0:
        return
    if sig.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        sig = np.stack([sig * l * 1.41, sig * r * 1.41], 1)
    if i < 0:
        sig, i = sig[-i:], 0
    j = min(N, i + len(sig))
    out[i:j] += sig[: j - i] * g


def load(name):
    x, sr = sf.read(os.path.join(ROOT, 'public', 'sfx', name), always_2d=True)
    x = x.mean(1)
    if sr != SR:
        x = resample_poly(x, SR, sr)
    return x / (np.abs(x).max() + 1e-9)


tick, pop, snap, switch, success, counter, chime, star, fill = (load(f + '.wav') for f in
    ('tick', 'pop', 'snap', 'switch', 'success', 'counter', 'chime', 'star', 'fill'))


# ---------------------------------------------------------------- designed sounds
def whoosh(d=0.28, up=True, lo=400, hi=6000):
    n = int(d * SR)
    x = rng.standard_normal(n)
    y = np.zeros(n)
    blk = 960
    for k in range(0, n, blk):
        u = k / n
        f = lo + (hi - lo) * (u if up else 1 - u) ** 1.5
        y[k:k + blk] = bp(x[k:k + blk], max(80, f * 0.6), min(20000, f * 1.4))
    return y * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5


def thump(d=0.35, f0=70):
    n = int(d * SR)
    f = f0 * (1 + 2.5 * np.exp(-tt(n) * 35))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt(n) * 11)


def stamp():
    """the PO! stamp: low thump + paper slap + bright blip"""
    n = int(0.5 * SR)
    slap = hp(rng.standard_normal(int(0.06 * SR)), 1200) * np.exp(-tt(int(0.06 * SR)) * 60)
    s = np.zeros(n)
    s[: len(slap)] += slap * 0.9
    th = thump(0.45, 62)
    s[: len(th)] += th * 1.1
    blip = (np.sin(2 * np.pi * 1320 * tt(int(0.12 * SR))) + 0.5 * np.sin(2 * np.pi * 1980 * tt(int(0.12 * SR)))) * np.exp(-tt(int(0.12 * SR)) * 30)
    s[int(0.01 * SR): int(0.01 * SR) + len(blip)] += blip * 0.25
    return s


def boom(d=2.0, f0=48):
    n = int(d * SR)
    f = f0 * (1 + 1.5 * np.exp(-tt(n) * 10))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt(n) * 2.4) + lp(rng.standard_normal(n), 1200) * np.exp(-tt(n) * 16) * 0.4


def bell(f, d=1.6):
    n = int(d * SR)
    return sum(a * np.sin(2 * np.pi * f * r * tt(n)) * np.exp(-tt(n) * k) for r, a, k in ((1, 1, 2.2), (2.76, 0.3, 4), (5.4, 0.12, 7))) * env(n, 0.002, 0.2)


def beep(f, d=0.1, sq=0.5):
    n = int(d * SR)
    x = (1 - sq) * np.sin(2 * np.pi * f * tt(n)) + sq * np.sign(np.sin(2 * np.pi * f * tt(n)))
    return lp(x, 4000) * env(n, 0.003, 0.03)


def printer(d=0.7):
    n = int(d * SR)
    buzz = np.sign(np.sin(2 * np.pi * 95 * tt(n))) * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * tt(n)))
    return bp(buzz + 0.6 * rng.standard_normal(n), 300, 3500) * env(n, 0.02, 0.08)


def rustle(d=0.45):
    n = int(d * SR)
    am = (np.abs(np.sin(2 * np.pi * 14 * tt(n))) ** 3)
    return hp(rng.standard_normal(n), 2500) * am * env(n, 0.01, 0.15)


def ka_ching():
    n = int(0.9 * SR)
    s = np.zeros(n)
    k = hp(rng.standard_normal(int(0.04 * SR)), 2000) * np.exp(-tt(int(0.04 * SR)) * 80)
    s[: len(k)] += k
    for f, d in ((2093, 0.06), (2637, 0.12)):
        b = bell(f, 0.8)
        i = int(d * SR)
        s[i:i + len(b)] += b[: n - i] * 0.5
    return s


# ---------------------------------------------------------------- cue sheet
h = B['hook']
place(lp(boom(1.0, 45), 300), 0.03, 0.35)                   # never start silent
place(printer(0.7), h['ticket'], 0.45)                        # ticket prints
place(snap, h['ticket'] + 0.68, 0.35)                         # ticket tears
place(beep(1046, 0.12) , h['serve'], 0.35, -0.3)              # "now serving" ding-dong
place(beep(784, 0.18), h['serve'] + 0.14, 0.35, -0.3)
for k in range(4):                                            # clock ticks to 15:00
    place(hp(tick, 1500), h['head2'] + k * 0.5, 0.45, 0.4)
place(stamp(), h['closed'], 0.8)                              # MBYLLUR
place(whoosh(0.32, True), h['wipe'] - 0.04, 0.6)             # gradient wipes up
place(thump(0.5, 55), h['nomore'], 0.9)                       # "Jo më."
place(lp(boom(0.8, 60), 900), h['nomore'], 0.35)
place(pop, h['phone'], 0.35)

for key, T in zip(B['itemKeys'], B['items']):
    place(whoosh(0.24, True, 600, 7000), T - 0.19, 0.5, 0.0)  # whip to next screen
    place(stamp(), T + 1.0, 0.95)                             # PO!
    if key == 'onboard':      # three checks + done
        for k in range(3):
            place(tick, T + 0.2 + k * 0.25, 0.55, -0.2 + 0.2 * k)
        place(success, T + 1.02, 0.45)
    elif key == 'vcard':      # card flips in, shine
        place(switch, T + 0.0, 0.5)
        place(whoosh(0.35, False, 300, 3000), T + 0.0, 0.35)
        place(pop, T + 0.55, 0.35)
        place(star, T + 1.05, 0.5, 0.3)
    elif key == 'pcard':      # card lands, plane flies, paid abroad
        place(thump(0.3, 90), T + 0.42, 0.5)
        place(whoosh(0.6, True, 300, 4000), T + 0.35, 0.4, -0.5)
        place(chime, T + 0.8, 0.35, 0.3)
    elif key == 'pay':        # QR scan beep, card tap, paid
        place(lp(rng.standard_normal(int(0.45 * SR)), 900) * 0.25, T + 0.1, 0.4, -0.4)
        place(beep(1760, 0.08, 0.2), T + 0.6, 0.45, -0.4)
        place(whoosh(0.3, True, 800, 6000), T + 0.5, 0.35, 0.5)
        place(beep(2093, 0.12, 0.1), T + 0.84, 0.45, 0.4)
        place(success, T + 0.95, 0.4)
    elif key == 'atm':        # counter to 140+, cash out
        place(counter, T + 0.1, 0.4)
        place(rustle(0.5), T + 1.0, 0.6, -0.1)
        place(ka_ching(), T + 1.08, 0.55)
    elif key == 'night':      # button tap, comet whoosh, received ping + sparkle
        place(tick, T + 0.2, 0.5, -0.5)
        place(whoosh(0.6, True, 400, 7000), T + 0.3, 0.55)
        place(bell(1568, 1.0), T + 0.86, 0.35, 0.5)
        place(chime, T + 0.86, 0.45, 0.5)
        place(star, T + 0.9, 0.4, 0.5)
    elif key == 'ria':        # pins pop, euro flies, arrives
        place(pop, T + 0.05, 0.35, -0.5)
        place(pop, T + 0.15, 0.35, 0.5)
        place(whoosh(0.6, True, 300, 5000), T + 0.25, 0.45)
        place(chime, T + 0.9, 0.4, 0.3)
    elif key == 'cashback':   # coins jump back, each lands
        for k in range(5):
            place(beep(1318 + 120 * k, 0.07, 0.0), T + 0.55 + k * 0.08, 0.3, -0.3 + 0.15 * k)
        place(ka_ching(), T + 0.9, 0.4)

r = B['rapid']
place(whoosh(0.24, True, 600, 7000), r['start'] - 0.19, 0.5)
for k in range(4):
    place(pop, r['start'] + 0.25 + k * r['chipStep'], 0.45, -0.3 + 0.2 * k)
place(stamp(), r['po'], 1.0)
place(lp(boom(0.7, 55), 600), r['po'], 0.4)
e = B['end']
place(whoosh(0.9, False, 300, 5000)[::-1], e['hit'] - 0.97, 0.35)  # reverse swell into the hit, cut 70 ms early
place(boom(2.4, 46), e['hit'], 0.9)
for m, d, g in ((1046.5, 0.0, 0.32), (1318.5, 0.1, 0.24), (1568.0, 0.2, 0.18)):
    place(bell(m, 1.8), e['hit'] + d, g, (m - 1318) / 1000)
place(pop, e['cta'], 0.5)
place(hp(tick, 2000), e['cta'] + 0.3, 0.25)

# ---------------------------------------------------------------- master
fade = int(0.3 * SR)
out[-fade:] *= np.linspace(1, 0, fade)[:, None]
m = pyln.Meter(SR)
out = pyln.normalize.loudness(out, m.integrated_loudness(out), -16.0)
ceil = 10 ** (-1.2 / 20)
up = resample_poly(out, 4, 1, axis=0)
pk = np.abs(up).max(1)
look = int(0.003 * SR * 4)
g = uniform_filter1d(np.minimum(1, ceil / np.maximum(maximum_filter1d(pk, 2 * look + 1), 1e-9)), look)
g = np.minimum(g, ceil / np.maximum(pk, 1e-9))
out = resample_poly(up * g[:, None], 1, 4, axis=0)[:N]
print('LUFS', round(m.integrated_loudness(out), 2), 'peak dBFS', round(20 * np.log10(np.abs(out).max()), 2))
sf.write(os.path.join(ROOT, 'public', 'sfx.wav'), out.astype(np.float32), SR, subtype='PCM_24')
