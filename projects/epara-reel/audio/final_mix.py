"""Final mix for the epara reel: voice-over (lead) + user's music + SFX stem.

Everything is timed from ../src/beats.json (VO-first). Writes ../public/final-mix.wav
mastered to -14 LUFS, true peak about -1 dBTP.
Run after audio/sfx.py: python3 audio/final_mix.py
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
meter = pyln.Meter(SR)


def read(path, ch=2):
    x, sr = sf.read(os.path.join(ROOT, path), always_2d=True)
    if sr != SR:
        x = resample_poly(x, SR, sr, axis=0)
    if x.shape[1] != ch:
        x = np.repeat(x.mean(1, keepdims=True), ch, 1)
    return x


def fit(x, at=0.0):
    out = np.zeros((N, 2))
    i = int(at * SR)
    j = min(N, i + len(x))
    if j > i:
        out[i:j] = x[: j - i]
    return out


def ramp(n, up=True):
    r = np.linspace(0, 1, n) if up else np.linspace(1, 0, n)
    return r[:, None]


def norm(x, lufs):
    return pyln.normalize.loudness(x, meter.integrated_loudness(x), lufs)


# ---------------------------------------------------------------- voice
vo = read(B['vo']['file'])
for a, b in B['vo']['mute']:
    vo[int(a * SR):int(b * SR)] = 0
vo = norm(vo, -16.0)
vo = fit(vo, B['vo']['offset'])

# ---------------------------------------------------------------- music
mu_src = read(B['music']['file'])
m = B['music']
body = mu_src[int(m['bodyFrom'] * SR): int((m['bodyFrom'] + m['stopAt']) * SR)].copy()
# muffled "from the next room" during the bank-queue hook, opens on "Jo më!"
lp = sosfilt(butter(4, 700, 'low', fs=SR, output='sos'), body, axis=0)
x = int(m['lowpassUntil'] * SR)
xf = int(0.12 * SR)
w = np.ones((len(body), 1))
w[:x] = 0
w[x:x + xf] = ramp(xf)
body = lp * (1 - w) * 0.7 + body * w
body[-int(0.06 * SR):] *= ramp(int(0.06 * SR), False)
# ending: the track's own re-entry after its silence, on the logo hit
mono = mu_src.mean(1)
h = int(0.01 * SR)
seek = int(m['endFrom'] * SR)
rms = np.array([np.sqrt(np.mean(mono[seek + i:seek + i + h] ** 2)) for i in range(0, int(12 * SR), h)])
on = m['endFrom'] + 0.01 * int(np.argmax(20 * np.log10(rms + 1e-9) > -24))
end_len = DUR - B['end']['hit']
ending = mu_src[int(on * SR) - int(0.01 * SR): int((on + end_len) * SR)].copy()
ending[-int(1.4 * SR):] *= ramp(int(1.4 * SR), False)
music = fit(body, 0.0) + fit(ending, B['end']['hit'] - 0.01)
music = norm(music, -21.0)
# duck under the voice (~-7 dB), 250 ms smoothing
env = uniform_filter1d(maximum_filter1d(np.abs(vo).max(1), int(0.05 * SR)), int(0.25 * SR))
env = np.clip(env / (np.percentile(env[env > 1e-4], 90) + 1e-9), 0, 1)
music *= (1 - 0.55 * env)[:, None]

# ---------------------------------------------------------------- sfx
sfx = fit(read('public/sfx.wav'))
sfx = norm(sfx, -21.5)

# ---------------------------------------------------------------- master
mix = vo + music + sfx
mix[: int(0.004 * SR)] *= ramp(int(0.004 * SR))
mix[-int(0.3 * SR):] *= ramp(int(0.3 * SR), False)
mix = norm(mix, -14.0)
ceil = 10 ** (-1.2 / 20)
up = resample_poly(mix, 4, 1, axis=0)
pk = np.abs(up).max(1)
look = int(0.003 * SR * 4)
g = uniform_filter1d(np.minimum(1, ceil / np.maximum(maximum_filter1d(pk, 2 * look + 1), 1e-9)), look)
g = np.minimum(g, ceil / np.maximum(pk, 1e-9))
mix = resample_poly(up * g[:, None], 1, 4, axis=0)[:N]
print('music ending starts at source', round(on, 2), 's')
print('LUFS', round(meter.integrated_loudness(mix), 2), 'peak dBFS', round(20 * np.log10(np.abs(mix).max()), 2))
sf.write(os.path.join(ROOT, 'public', 'final-mix.wav'), mix.astype(np.float32), SR, subtype='PCM_24')
