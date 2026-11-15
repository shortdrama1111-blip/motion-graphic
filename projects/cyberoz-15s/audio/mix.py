"""Score + SFX + master for the cyberOZ 15 s film.

Reads ../src/beats.json (same timing the picture uses), writes ../public/mix.wav.
Music is synthesised here: D minor -> F major, 115.66 BPM so the slam (4.6 s) and
the logo hit (12.9 s) both fall on downbeats.
Run: python3 audio/mix.py
"""
import json
import os

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from scipy.signal import butter, sosfilt, resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
B = json.load(open(os.path.join(ROOT, 'src', 'beats.json')))
SR = 48000
DUR = B['duration']
N = int(DUR * SR)
rng = np.random.default_rng(7)

beat = B['beat']
bar = beat * 4
DB0 = B['firstDownbeat']
s1, s2, s3, s4, s5, s6 = (B[k] for k in ('s1', 's2', 's3', 's4', 's5', 's6'))


def t_(n):
    return np.arange(n) / SR


def place(buf, sig, at, gain=1.0, pan=0.0):
    """Add mono or stereo sig into stereo buf at time `at`, equal-power pan (-1..1)."""
    i = int(round(at * SR))
    if i >= N:
        return
    if sig.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        sig = np.stack([sig * l * 1.41, sig * r * 1.41], 1)
    j = min(N, i + len(sig))
    if i < 0:
        sig, i = sig[-i:], 0
    buf[i:j] += sig[: j - i] * gain


def load(name):
    x, sr = sf.read(os.path.join(ROOT, 'public', 'sfx', name), always_2d=True)
    x = x.mean(1)
    if sr != SR:
        x = resample_poly(x, SR, sr)
    return x / (np.abs(x).max() + 1e-9)


def lp(x, fc, order=2):
    return sosfilt(butter(order, fc, 'low', fs=SR, output='sos'), x)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, 'high', fs=SR, output='sos'), x)


def env(n, a, d):
    e = np.ones(n)
    na, nd = int(a * SR), int(d * SR)
    if na:
        e[:na] = np.linspace(0, 1, na)
    if nd:
        e[-nd:] *= np.linspace(1, 0, nd)
    return e


def note(m):
    return 440 * 2 ** ((m - 69) / 12)


def saw(f, n, detune=0.0):
    ph = np.cumsum(np.full(n, f * (1 + detune) / SR))
    return 2 * (ph % 1) - 1


# ------------------------------------------------------------------ music
music = np.zeros((N, 2))
drums = np.zeros((N, 2))

CH = {  # chord tones (midi)
    'Dm': [50, 57, 62, 65, 69], 'Bb': [46, 58, 62, 65, 70], 'F': [41, 57, 60, 65, 69], 'C': [48, 55, 60, 64, 67],
}
prog = [(0.0, 'Dm'), (DB0 + bar, 'Bb'), (DB0 + 2 * bar, 'F'), (DB0 + 3 * bar, 'C'), (DB0 + 4 * bar, 'Dm'), (DB0 + 5 * bar, 'Bb')]
end_music = s5['silence']


def cutoff(t):
    """Pad brightness: open, dull and frozen in the 'once a year' section, opens on the slam."""
    if t < s2['in']:
        return 1100
    if t < s3['slam']:
        return 450
    return 1100 + 900 * min(1, (t - s3['slam']) / 6)


for k, (t0, ch) in enumerate(prog):
    t1 = prog[k + 1][0] if k + 1 < len(prog) else end_music
    n = int((t1 - t0) * SR)
    sig = np.zeros(n)
    for m in CH[ch]:
        for dt in (-0.006, 0.0, 0.006):
            sig += saw(note(m), n, dt)
    sig /= len(CH[ch]) * 3
    sig = lp(sig, cutoff((t0 + t1) / 2), 2) * env(n, 0.25 if k else 0.9, 0.12)
    place(music, np.stack([sig, np.roll(sig, 240)], 1), t0, 0.95 if t0 < s3['slam'] else 0.5)

# 8th-note pluck arpeggio: light in S1, gone in S2 (frozen), 16ths after the slam
def pluck(f, d=0.22):
    n = int(d * SR)
    x = np.sin(2 * np.pi * f * t_(n)) + 0.3 * np.sin(4 * np.pi * f * t_(n))
    return x * np.exp(-t_(n) * 18)


for k, (t0, ch) in enumerate(prog):
    t1 = prog[k + 1][0] if k + 1 < len(prog) else s5['breath']
    tones = [m + 12 for m in CH[ch][1:]]
    step = beat / 2 if t0 < s3['slam'] else beat / 4
    i, tt = 0, max(t0, DB0)
    while tt < t1:
        if not (s2['in'] <= tt < s3['slam']):
            place(music, pluck(note(tones[i % len(tones)])), tt, 0.2 if tt < s3['slam'] else 0.075, pan=0.35 * np.sin(i))
        i += 1
        tt += step

# drums from the slam to the breath
def kick():
    n = int(0.32 * SR)
    f = 45 + 80 * np.exp(-t_(n) * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t_(n) * 9)


def hat():
    n = int(0.05 * SR)
    return hp(rng.standard_normal(n), 7000) * np.exp(-t_(n) * 80)


def clap():
    n = int(0.18 * SR)
    x = lp(hp(rng.standard_normal(n), 900), 4000) * np.exp(-t_(n) * 22)
    return x


tt = s3['slam']
k = 0
while tt < s5['breath'] - 0.01:
    place(drums, kick(), tt, 0.6)
    place(drums, hat(), tt + beat / 2, 0.18, pan=0.3)
    if tt >= s3['slam'] + bar and k % 2 == 1:
        place(drums, clap(), tt, 0.35, pan=-0.1)
    tt += beat
    k += 1

# sidechain pump on the music while drums play
pump = np.ones(N)
tt = s3['slam']
while tt < s5['breath']:
    i = int(tt * SR)
    n = int(beat * SR)
    seg = 1 - 0.45 * np.exp(-t_(n) * 14)
    pump[i:i + n] = seg[: max(0, min(n, N - i))]
    tt += beat
music *= pump[:, None]

# breath: thin the music then total silence before the logo
tb = t_(N)
g = np.ones(N)
g = np.where(tb >= s5['breath'], np.clip(1 - (tb - s5['breath']) / (s5['silence'] - s5['breath']) * 0.8, 0.2, 1), g)
g = np.where(tb >= s5['silence'], 0, g)
music *= g[:, None]
drums *= g[:, None]

# ------------------------------------------------------------------ designed sounds
def boom(d=1.6, f0=60):
    n = int(d * SR)
    f = f0 * (1 + 1.5 * np.exp(-t_(n) * 12))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t_(n) * 2.6)
    noise = lp(rng.standard_normal(n), 1500) * np.exp(-t_(n) * 18) * 0.5
    return x + noise


def riser(d):
    n = int(d * SR)
    x = rng.standard_normal(n)
    out = np.zeros(n)
    for j in range(0, n, 2400):  # stepped band sweep
        fc = 300 + 5000 * (j / n) ** 2
        blk = x[j:j + 2400]
        out[j:j + 2400] = hp(lp(blk, min(fc * 2, 20000)), fc)
    return out * np.linspace(0, 1, n) ** 2


def bell(f, d=2.5):
    n = int(d * SR)
    x = sum(a * np.sin(2 * np.pi * f * r * t_(n)) * np.exp(-t_(n) * dec) for r, a, dec in ((1, 1, 1.6), (2.76, 0.35, 3.5), (5.4, 0.15, 6)))
    return x * env(n, 0.003, 0.3)


def beep(f, d=0.11):
    n = int(d * SR)
    x = np.sign(np.sin(2 * np.pi * f * t_(n))) * 0.5 + np.sin(2 * np.pi * f * t_(n)) * 0.5
    return lp(x, 3500) * env(n, 0.004, 0.03)


sfx = np.zeros((N, 2))
tick, pop, snap, switch, success, counter, chime, star = (load(f) for f in ('tick.wav', 'pop.wav', 'snap.wav', 'switch.wav', 'success.wav', 'counter.wav', 'chime.wav', 'star.wav'))

# open: never start in silence
place(sfx, lp(boom(1.2, 48), 400), 0.06, 0.25)
# S1 stack chips: tick per chip, panned by x
pans = [-0.6, 0.6, -0.7, 0.75, -0.5, 0.5, 0.65, 0.0]
for i in range(s1['chipCount']):
    place(sfx, tick, s1['chipsStart'] + i * s1['chipStep'], 0.55, pans[i])
# S2 frozen clock + OUTDATED stamp
tt = s2['in']
while tt < s2['suck']:
    place(sfx, hp(tick, 2000), tt, 0.16, 0.2)
    tt += beat
place(sfx, snap, s2['line2'] + 0.4, 0.55)
place(sfx, lp(boom(0.5, 70), 300), s2['line2'] + 0.4, 0.35)
r = riser(s3['slam'] - 0.07 - 3.65)
place(sfx, r, 3.65, 0.22)
# S3 slam
place(sfx, boom(1.8, 55), s3['slam'], 0.95)
place(sfx, snap, s3['slam'], 0.6)
place(sfx, bell(note(81), 1.2), s3['slam'] + 0.02, 0.18, 0.3)
for i in range(4):
    arrive = s3['legsStart'] + 2 * i * s3['legDur'] + s3['legDur']
    place(sfx, pop, arrive - 0.02, 0.45, [-0.6, -0.6, 0.6, 0.6][i])
place(sfx, star, s3['legsStart'] + 8 * s3['legDur'], 0.4)
# S4 drift: morph swish, alarm, chips, fix
place(sfx, switch, s4['morph'], 0.45)
place(sfx, beep(988), s4['fail'], 0.32, 0.2)
place(sfx, beep(784), s4['fail'] + 0.13, 0.32, 0.2)
place(sfx, lp(boom(0.6, 50), 250), s4['fail'], 0.55)
place(sfx, hp(riser(0.15), 1500), s4['fail'] - 0.02, 0.15)
for i in range(3):
    place(sfx, tick, s4['chips'] + i * 0.08, 0.4, -0.3 + 0.3 * i)
place(sfx, success, s4['fix'], 0.55)
# S5 ring
place(sfx, switch, s5['morph'], 0.35)
place(sfx, counter, s5['fill'], 0.45)
n = int((s5['full'] - s5['fill']) * SR)
sweep = np.sin(2 * np.pi * np.cumsum(np.linspace(300, 900, n)) / SR) * env(n, 0.1, 0.1)
place(sfx, sweep, s5['fill'], 0.06)
place(sfx, chime, s5['full'], 0.55)
for i in range(4):
    place(sfx, tick, s5['frameworks'] + i * 0.09, 0.3, -0.45 + 0.3 * i)
place(sfx, riser(s6['hit'] - 0.07 - s5['breath']), s5['breath'], 0.12)
# S6 logo out of silence
hit = s6['hit']
place(sfx, boom(2.4, 50), hit, 0.85)
for m, d, gn in ((77, 0.0, 0.3), (81, 0.12, 0.22), (84, 0.24, 0.16)):  # F5 A5 C6: the sparkle resolves
    place(sfx, bell(note(m), 2.2), hit + d, gn, 0.25 * (m - 81) / 4)
n = int((DUR - hit) * SR)
chord = sum(saw(note(m), n, dt) for m in (41, 53, 57, 60, 65) for dt in (-0.005, 0.005)) / 10
chord = lp(chord, 1400) * env(n, 0.02, 0.9)
place(sfx, np.stack([chord, np.roll(chord, 300)], 1), hit, 0.45)
place(sfx, pop, s6['cta'], 0.5)
place(sfx, tick, s6['url'], 0.2)

# ------------------------------------------------------------------ mix + master
mix = music * 0.55 + drums * 0.6 + sfx
mix[: int(0.004 * SR)] *= np.linspace(0, 1, int(0.004 * SR))[:, None]
fade = int(0.35 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None]

meter = pyln.Meter(SR)
mix = pyln.normalize.loudness(mix, meter.integrated_loudness(mix), -14.0)

# 4x oversampled look-ahead peak limiter to -1.2 dBTP
ceil = 10 ** (-1.2 / 20)
up = resample_poly(mix, 4, 1, axis=0)
peak = np.abs(up).max(1)
look = int(0.003 * SR * 4)
from scipy.ndimage import maximum_filter1d, uniform_filter1d
pk = maximum_filter1d(peak, look * 2 + 1)
gain = np.minimum(1, ceil / np.maximum(pk, 1e-9))
gain = uniform_filter1d(gain, look)
gain = np.minimum(gain, ceil / np.maximum(peak, 1e-9))
mix = resample_poly(up * gain[:, None], 1, 4, axis=0)[:N]

print('integrated LUFS', round(meter.integrated_loudness(mix), 2), 'sample peak dBFS', round(20 * np.log10(np.abs(mix).max()), 2))
sf.write(os.path.join(ROOT, 'public', 'mix.wav'), mix.astype(np.float32), SR, subtype='PCM_24')
