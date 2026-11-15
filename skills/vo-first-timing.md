# VO-First Timing & beats.json
- **Category:** timing / audio · **Engine:** ElevenLabs + faster-whisper + Python · **Source:** [ref: 2026-11-15-keemfinity-whatsapp-specad], [ref: 2026-11-15-keemfinity-moniepoint-listen]

1. Script of 1–3-word lines. ElevenLabs (eleven_v4) with audio tags, e.g. `[energetic, upbeat, confident, punchy commercial read]` … `[warm, confident] Brand.` Audition ~4 voices on the same script (≈230 credits/take — confirm spend).
2. Transcribe each take with word timestamps (faster-whisper small.en). Reject mumbled/dropped/repeated words.
3. Cut at silences (−40 dB, ≥0.12 s); trim to first sound, 8 ms fade-in, 20 ms fade-out. Never time-stretch.
4. Place clips: `start = beat − onset` so each key word lands on its picture beat.
5. Write `beats.json`: beat grid, key-word times, clip starts, taps, counters, cue list, music edits. Both renderer and mixer read it.
