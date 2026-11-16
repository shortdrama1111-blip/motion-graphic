# Music Drop Alignment
- **Category:** audio · **Engine:** librosa + numpy

AI music rarely follows a timed prompt. Measure the track (librosa beat + loudness per 0.5 s), find its drop (largest loudness jump), then **offset the track** so its drop lands on the film's main visual drop; fade the tail at the end; duck under the voice (envelope, 250 ms, ~−6 dB); verify voice vs music in 1–4 kHz (median ≥ 10 dB).
