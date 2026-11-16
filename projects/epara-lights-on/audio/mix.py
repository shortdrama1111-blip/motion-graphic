"""v3 sound for "Qyteti ndizet": fewer, softer, designed SFX (no UI pops/dings/jingles) + VO, no music yet.

- VO lines are moved only inside their real pauses (beats.json voShift), never stretched.
- Every SFX goes through a small synthetic room (convolution reverb) so nothing sounds dry/cheap.
Writes ../public/mix.wav (-14 LUFS, ~-1 dBTP) and ../renders/sfx-stem.wav.
"""
import json
import os

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from scipy.ndimage import maximum_filter1d, uniform_filter1d
from scipy.signal import butter, fftconvolve, resample_poly, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B = json.load(open(os.path.join(ROOT, 'src', 'beats.json')))
SR, DUR = 48000, B['duration']
N = int(DUR * SR)
rng = np.random.default_rng(31)
dry = np.zeros((N, 2))


def tt(n):
    return np.arange(n) / SR


def filt(x, kind, f):
    return sosfilt(butter(2, f, kind, fs=SR, output='sos'), x)


def env(n, a, d):
    e = np.ones(n)
    na, nd = min(n, max(1, int(a * SR))), min(n, max(1, int(d * SR)))
    e[:na] = np.linspace(0, 1, na) ** 2
    e[-nd:] *= np.linspace(1, 0, nd) ** 2
    return e


def place(sig, at, g=1.0, pan=0.0, width=0.0):
    i = int(round(at * SR))
    if i >= N:
        return
    if sig.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        d = int(width * 0.012 * SR)
        right = np.roll(sig, d) if d else sig
        sig = np.stack([sig * l * 1.41, right * r * 1.41], 1)
    if i < 0:
        sig, i = sig[-i:], 0
    j = min(N, i + len(sig))
    dry[i:j] += sig[: j - i] * g


# ---------------------------------------------------------------- designed sounds
def air(d=0.6, lo=250, hi=2400, up=True):
    """soft swell of air: band-limited noise sweeping, smooth bell-shaped envelope"""
    n = int(d * SR)
    x = rng.standard_normal(n)
    y = np.zeros(n)
    for k in range(0, n, 1200):
        u = k / n
        c = lo * (hi / lo) ** (u if up else 1 - u)
        y[k:k + 1200] = filt(x[k:k + 1200], 'band', [max(40, c * 0.5), min(20000, c * 1.6)])
    return y * np.sin(np.pi * np.linspace(0, 1, n)) ** 2.2


def sub(d=1.2, f0=42, punch=1.8):
    n = int(d * SR)
    f = f0 * (1 + punch * np.exp(-tt(n) * 14))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt(n) * 3.0) * env(n, 0.004, 0.3)


def soft_click(f=2600):
    n = int(0.05 * SR)
    return filt(rng.standard_normal(n), 'band', [f * 0.6, f * 1.4]) * np.exp(-tt(n) * 120)


def shimmer(d=1.6, root=523.25, notes=(0, 7, 12, 16, 19), attack=0.25):
    """glassy pad: soft sines with slow attack and gentle beating, high-passed"""
    n = int(d * SR)
    s = np.zeros(n)
    for k, st in enumerate(notes):
        f = root * 2 ** (st / 12)
        for det in (-0.004, 0.004):
            s += np.sin(2 * np.pi * f * (1 + det) * tt(n) + k) / (1 + k * 0.4)
    s = filt(s, 'high', 300)
    return s / np.abs(s).max() * env(n, attack, d * 0.6)


def sparkle(d=0.9, count=14):
    """quiet granular glints: very short high sines spread in time"""
    n = int(d * SR)
    s = np.zeros(n)
    for _ in range(count):
        i = int(rng.uniform(0, 0.8) * n)
        f = rng.uniform(3000, 6500)
        m = int(0.06 * SR)
        g = np.sin(2 * np.pi * f * tt(m)) * np.exp(-tt(m) * 60) * rng.uniform(0.3, 1)
        s[i:i + m] += g[: max(0, min(m, n - i))]
    return s


def riser(d):
    n = int(d * SR)
    x = rng.standard_normal(n)
    out = np.zeros(n)
    for j in range(0, n, 2400):
        fc = 200 + 3000 * (j / n) ** 2
        out[j:j + 2400] = filt(filt(x[j:j + 2400], 'low', min(fc * 2, 18000)), 'high', fc)
    return out * np.linspace(0, 1, n) ** 3


# ---------------------------------------------------------------- cue sheet (less is more)
place(filt(sub(1.4, 38, 0.6), 'low', 200), 0.02, 0.35)                     # room tone under the hook
place(soft_click(1800), B['tap'], 0.35)                                     # the tap
place(sub(0.25, 70, 0.4), B['tap'], 0.2)
place(air(0.45, 400, 3200), B['bolt'] - 0.05, 0.5, 0.3, 1)                  # light leaves the phone
place(air(0.35, 300, 2200), B['hook'] - 0.02, 0.35, 0, 1)
place(sub(1.2, 44), B['impact'], 0.8)                                       # light hits the tower
place(air(0.25, 2000, 600, up=False), B['impact'], 0.25, 0, 1)
place(shimmer(1.8, 523.25), B['lightOn'], 0.35, 0, 1)                       # windows switch on (C major add9)
place(sparkle(0.6, 10), B['lightOn'] + 0.1, 0.12, 0, 1)
place(air(0.3, 300, 1800), B['towers'] - 0.12, 0.25, 0, 1)                  # cut
place(air(0.6, 500, 4000), B['ribbon'], 0.4, -0.3, 1)                      # light travels window to window
place(shimmer(1.2, 659.25, (0, 7, 12)), B['winB'], 0.22, 0.4, 1)
place(air(0.3, 300, 1800), B['skim'] - 0.12, 0.25, 0, 1)                    # cut into the flight
place(filt(air(3.6, 150, 700), 'low', 900), B['skim'], 0.35, 0, 1)          # wind of the flight
place(soft_click(3200), B['paid'], 0.18, -0.3)
place(air(0.3, 300, 1800), B['city'] - 0.12, 0.25, 0, 1)
place(riser(B['drop'] - 0.07 - B['cityReveal']), B['cityReveal'], 0.22, 0, 1)   # build into the drop
place(sub(2.4, 40, 2.2), B['drop'], 0.95)                                  # the city becomes the mark
place(shimmer(2.4, 392.0, (0, 7, 12, 16, 19, 24)), B['drop'], 0.4, 0, 1)
place(filt(air(B['diveDur'], 120, 900), 'low', 1200), B['dive'], 0.45, 0, 1)    # the descent
place(air(0.6, 1500, 400, up=False), B['phone2'] - 0.3, 0.2, 0, 1)
place(soft_click(2200), B['phone2'] + 0.2, 0.2)
place(air(0.5, 200, 1500), B['end'] - 0.1, 0.3, 0, 1)                      # into the lock-up
place(sparkle(1.2, 26), B['end'] + 0.2, 0.18, 0, 1)                         # panes arriving
place(sub(0.6, 60, 0.8), B['end'] + 34 / 30, 0.45)                          # panes lock
place(shimmer(2.2, 523.25, (0, 4, 7, 12, 16)), B['logoSwap'], 0.38, 0, 1)   # official logo
place(air(0.5, 300, 2000), B['markMove'], 0.15, 0, 1)

# small room: synthetic stereo impulse response, ~1.1 s decay
irn = int(1.1 * SR)
ir = np.stack([rng.standard_normal(irn), rng.standard_normal(irn)], 1) * np.exp(-tt(irn) * 5.5)[:, None]
ir = filt(ir.T, 'low', 6000).T
ir /= np.abs(ir).sum(0, keepdims=True) ** 0.5 * 30
wet = np.stack([fftconvolve(dry[:, c], ir[:, c])[:N] for c in range(2)], 1)
sfx = dry * 0.82 + wet * 0.55
sfx[-int(0.4 * SR):] *= np.linspace(1, 0, int(0.4 * SR))[:, None]

# ---------------------------------------------------------------- VO, moved only in its pauses
meter = pyln.Meter(SR)
v, sr = sf.read(os.path.join(ROOT, 'public', 'vo.wav'), always_2d=True)
v = v.mean(1)
if sr != SR:
    v = resample_poly(v, SR, sr)
cuts = [0.0] + [c for c, _ in B['voShift']] + [len(v) / SR]
shifts = [0.0] + [s for _, s in B['voShift']]
vo = np.zeros(N)
for (a, b), s in zip(zip(cuts, cuts[1:]), shifts):
    seg_ = v[int(a * SR):int(b * SR)]
    i = int((a + s) * SR)
    j = min(N, i + len(seg_))
    vo[i:j] += seg_[: j - i]
vo = np.stack([vo, vo], 1)
vo = pyln.normalize.loudness(vo, meter.integrated_loudness(vo), -16.0)
sfx_n = pyln.normalize.loudness(sfx, meter.integrated_loudness(sfx), -23.0)
os.makedirs(os.path.join(ROOT, 'renders'), exist_ok=True)
sf.write(os.path.join(ROOT, 'renders', 'sfx-stem.wav'), sfx_n.astype(np.float32), SR, subtype='PCM_24')
sf.write(os.path.join(ROOT, 'renders', 'vo-stem.wav'), vo.astype(np.float32), SR, subtype='PCM_24')
# music: placed so its own drop (8.0 s in the track) lands on the city drop; ducked under every word
mus = np.zeros((N, 2))
if B.get('musicFile'):
    mu, msr = sf.read(os.path.join(ROOT, B['musicFile']), always_2d=True)
    if msr != SR:
        mu = resample_poly(mu, SR, msr, axis=0)
    i = int(B['musicOffset'] * SR)
    j = min(N, i + len(mu))
    mus[i:j] = mu[: j - i, :2]
    mus[-int(0.9 * SR):] *= np.linspace(1, 0, int(0.9 * SR))[:, None] ** 1.5
    mus = pyln.normalize.loudness(mus, meter.integrated_loudness(mus[i:]), -20.0)
    envv = uniform_filter1d(maximum_filter1d(np.abs(vo).max(1), int(0.05 * SR)), int(0.25 * SR))
    envv = np.clip(envv / (np.percentile(envv[envv > 1e-4], 90) + 1e-9), 0, 1)
    mus *= (1 - 0.5 * envv)[:, None]
    sf.write(os.path.join(ROOT, 'renders', 'music-stem.wav'), mus.astype(np.float32), SR, subtype='PCM_24')
mix = vo + sfx_n * 0.8 + mus
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
