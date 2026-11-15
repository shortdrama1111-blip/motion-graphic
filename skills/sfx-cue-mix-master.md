# SFX Cue Sheet, Mix & Master
- **Category:** audio · **Engine:** Python (numpy/scipy/pyloudnorm) + ffmpeg · **Source:** [ref: 2026-11-15-keemfinity-whatsapp-specad], [ref: 2026-11-15-keemfinity-moniepoint-listen]

1. Cue list from beats.json: every visible move gets a sound, peaking on its exact frame (SFX at 48 kHz).
2. Typical layers: hook clicks/bleeps · reverse whoosh into hits · impact+sub+sparkle on slams · quiet tonal clicks panned wide for small UI · keystrokes for typing/counters (alt L/R) · whooshes on flights/whips · scan bed + crunches for data · mechanical click + air-lock for locks · riser cut 70 ms before the hit.
3. Duck music −10/−11 dB under voice (envelope, 250 ms smoothing), −14 dB for the breath; EQ-carve 0.9–4.2 kHz under voice.
4. Verify voice ≥12–15 dB above music in 1–4 kHz per line (median target ~19 dB).
5. Master −14 LUFS integrated, TP ≤ −1 dBTP via 4× oversampled lookahead limiter, 4 ms fade-in. Re-measure after AAC.
