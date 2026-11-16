"""SFX + voice-over mix for "Qyteti ndizet" (no music yet: the user may add a track).

Reads ../src/beats.json, ../public/vo.wav and the kit SFX; writes ../public/mix.wav (-14 LUFS, ~-1 dBTP)
and ../renders/sfx-stem.wav (SFX only, for re-mixing with music).
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
rng = np.random.default_rng(21)
sfx = np.zeros((N, 2))
KIT = os.path.join(ROOT, '..', '..', 'assets', 'sfx')


def tt(n):
    return np.arange(n) / SR


def bp(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], 'band', fs=SR, output='sos'), x)


def lp(x, fc):
    return sosfilt(butter(2, fc, 'low', fs=SR, output='sos'), x)


def hp(x, fc):
    return sosfilt(butter(2, fc, 'high', fs=SR, output='sos'), x)


def env(n, a, d):
    e = np.ones(n)
    na, nd = min(n, max(1, int(a * SR))), min(n, max(1, int(d * SR)))
    e[:na] = np.linspace(0, 1, na)
    e[-nd:] *= np.linspace(1, 0, nd)
    return e


def place(sig, at, g=1.0, pan=0.0):
    i = int(round(at * SR))
    if i >= N:
        return
    if sig.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        sig = np.stack([sig * l * 1.41, sig * r * 1.41], 1)
    if i < 0:
        sig, i = sig[-i:], 0
    j = min(N, i + len(sig))
    sfx[i:j] += sig[: j - i] * g


def load(name):
    x, sr = sf.read(os.path.join(KIT, name + '.wav'), always_2d=True)
    x = x.mean(1)
    if sr != SR:
        x = resample_poly(x, SR, sr)
    return x / (np.abs(x).max() + 1e-9)


def whoosh(d=0.3, up=True, lo=300, hi=6000):
    n = int(d * SR)
    x = rng.standard_normal(n)
    y = np.zeros(n)
    for k in range(0, n, 960):
        u = k / n
        f = lo + (hi - lo) * (u if up else 1 - u) ** 1.5
        y[k:k + 960] = bp(x[k:k + 960], max(80, f * 0.6), min(20000, f * 1.4))
    return y * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5


def boom(d=2.0, f0=46):
    n = int(d * SR)
    f = f0 * (1 + 1.6 * np.exp(-tt(n) * 10))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt(n) * 2.6) + lp(rng.standard_normal(n), 1200) * np.exp(-tt(n) * 16) * 0.4


def bell(f, d=1.4):
    n = int(d * SR)
    return sum(a * np.sin(2 * np.pi * f * r * tt(n)) * np.exp(-tt(n) * k) for r, a, k in ((1, 1, 2.6), (2.76, 0.3, 5), (5.4, 0.12, 8))) * env(n, 0.002, 0.2)


def glass(f=None):
    """small glass tick: a short high bell + a click"""
    f = f or rng.uniform(2400, 4200)
    n = int(0.25 * SR)
    s = bell(f, 0.25) * 0.7
    c = hp(rng.standard_normal(int(0.01 * SR)), 3000)
    s[: len(c)] += c * 0.4
    return s


def thunk(f0=120):
    n = int(0.35 * SR)
    s = np.sin(2 * np.pi * np.cumsum(f0 * (1 + 2 * np.exp(-tt(n) * 40))) / SR) * np.exp(-tt(n) * 14)
    return s + bell(1800, 0.35) * 0.2


def riser(d):
    n = int(d * SR)
    x = rng.standard_normal(n)
    out = np.zeros(n)
    for j in range(0, n, 2400):
        fc = 300 + 5000 * (j / n) ** 2
        out[j:j + 2400] = hp(lp(x[j:j + 2400], min(fc * 2, 20000)), fc)
    return out * np.linspace(0, 1, n) ** 2


tick, pop, success, chime, star, switch, counter = (load(k) for k in ('tick', 'pop', 'success', 'chime', 'star', 'switch', 'counter'))

# --- hook: tap, bolt, impact, windows switch on floor by floor
place(lp(boom(1.0, 42), 300), 0.03, 0.25)
place(tick, B['tap'], 0.6)
place(thunk(160), B['tap'], 0.35)
place(whoosh(0.35, True, 500, 8000), B['bolt'], 0.6, 0.4)
place(whoosh(0.32, True, 300, 6000), B['hook'], 0.55)
place(thunk(90), B['impact'], 0.8)
place(lp(boom(1.2, 50), 500), B['impact'], 0.5)
for k in range(14):
    place(glass(), B['lightOn'] + k * (B['lightFull'] - B['lightOn']) / 14, 0.18, rng.uniform(-0.6, 0.6))
place(star, B['lightFull'], 0.45)
place(bell(1568, 1.6), B['lightFull'], 0.18)
# --- towers: send / receive / instant
place(whoosh(0.25, True, 600, 7000), B['towers'] - 0.18, 0.5)
place(pop, B['winA'], 0.45, -0.5)
place(whoosh(0.5, True, 400, 5000), B['ribbon'], 0.45, 0.2)
place(chime, B['winB'], 0.4, 0.5)
place(success, B['instant'], 0.5)
# --- skim: café QR, ATM, day & night
place(whoosh(0.25, True, 600, 7000), B['skim'] - 0.18, 0.5)
place(pop, B['qr'], 0.45, -0.4)
place(bell(1760, 0.12) * 0.6, B['paid'] - 0.25, 0.35, -0.4)
place(success, B['paid'], 0.4)
place(pop, B['atm'], 0.45)
place(counter, B['atm'] + 0.1, 0.25)
place(pop, B['daynight'], 0.45)
place(bell(1318, 1.0), B['daynight'] + 0.05, 0.18)
# --- city: rise into the drop
place(whoosh(0.25, True, 600, 7000), B['city'] - 0.18, 0.5)
place(riser(B['drop'] - 0.07 - B['cityReveal']), B['cityReveal'], 0.25)
place(boom(2.2, 44), B['drop'], 0.9)
for k in range(10):
    place(glass(), B['drop'] + 0.02 + k * 0.04, 0.16, rng.uniform(-0.8, 0.8))
# --- dive, phone, lock-up
place(whoosh(1.8, True, 200, 4000), B['dive'] - 0.05, 0.5)
place(whoosh(0.25, True, 600, 7000), B['phone2'] - 0.18, 0.45)
place(success, B['phone2'] + 0.1, 0.45)
place(whoosh(0.4, False, 300, 5000), B['end'] - 0.1, 0.4)
for k in range(26):
    place(glass(), B['end'] + 0.15 + k * 0.042, 0.11, rng.uniform(-0.9, 0.9))
place(thunk(110), B['end'] + 34 / 30, 0.55)
place(pop, B['cta'], 0.4)
place(bell(1046.5, 2.0), B['logoSwap'], 0.22)
place(bell(1568, 2.0), B['logoSwap'] + 0.1, 0.16)
place(star, B['tagline'], 0.35)
sfx[-int(0.3 * SR):] *= np.linspace(1, 0, int(0.3 * SR))[:, None]

meter = pyln.Meter(SR)
vo, sr = sf.read(os.path.join(ROOT, 'public', 'vo.wav'), always_2d=True)
vo = np.repeat(vo.mean(1, keepdims=True), 2, 1)[:N]
vo = np.pad(vo, ((0, N - len(vo)), (0, 0)))
vo = pyln.normalize.loudness(vo, meter.integrated_loudness(vo), -16.0)
sfx_n = pyln.normalize.loudness(sfx, meter.integrated_loudness(sfx), -20.0)
os.makedirs(os.path.join(ROOT, 'renders'), exist_ok=True)
sf.write(os.path.join(ROOT, 'renders', 'sfx-stem.wav'), (sfx_n * 0.5).astype(np.float32), SR, subtype='PCM_24')
mix = vo + sfx_n
mix = pyln.normalize.loudness(mix, meter.integrated_loudness(mix), -14.0)
ceil = 10 ** (-1.2 / 20)
up = resample_poly(mix, 4, 1, axis=0)
pk = np.abs(up).max(1)
look = int(0.003 * SR * 4)
g = uniform_filter1d(np.minimum(1, ceil / np.maximum(maximum_filter1d(pk, 2 * look + 1), 1e-9)), look)
g = np.minimum(g, ceil / np.maximum(pk, 1e-9))
mix = resample_poly(up * g[:, None], 1, 4, axis=0)[:N]
print('LUFS', round(meter.integrated_loudness(mix), 2), 'peak', round(20 * np.log10(np.abs(mix).max()), 2))
sf.write(os.path.join(ROOT, 'public', 'mix.wav'), mix.astype(np.float32), SR, subtype='PCM_24')
