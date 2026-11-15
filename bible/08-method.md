# 08 — Production Method (lessons & options)

> What keemfinity did and why it worked, written as **guidance, not law**. Use
> what fits the project, skip or change what doesn't, and discuss it. See
> "Our take" at the bottom for where we might differ. Sources: [ref: 2026-11-15-keemfinity-whatsapp-specad],
> [ref: 2026-11-15-keemfinity-moniepoint-listen].

## Concept
- **Find the one thing only the brand owns** (an icon, a UI moment, a *sound*) and open on it. It should say the brand before the logo appears. (✓✓ turning blue; the payment-alert chime.)
- **One carrier runs through the whole film** — a single light / line / object that does every job (draws the logo, becomes a focus line, a playhead, a ring, an underline). Zero hard cuts: one continuous film.
- **A transition is one move, not three.** Each hand-over is a single gesture (the word dissolves in place and the card grows out of the light; push into a card's face which *becomes* the page).

## Script & voice
- Short, punchy lines — 1–3 words each, every word landing on a picture beat. Long warm reads feel slow.
- **Record the voice first; picture follows it.** Audition ~4 voices on the same script.
- Transcribe takes with word timestamps; reject takes that blur, drop or repeat words.
- Tighten by cutting silences (−40 dB, ≥0.12 s), 8 ms fade-in / 20 ms fade-out. **Never time-stretch the voice** — move the picture or the line.
- Place each clip so its key word lands on its beat: `start = beat − onset`.

## Timing
- **One timing file** (`beats.json`) shared by picture *and* mixer: beat grid, key-word times, taps, counters, cues, music edits.
- Beat-track the real music period (librosa) — don't trust the label BPM.
- Big moments land on downbeats: the first slam, the "drums in" landing, the logo on the biggest section change.
- Counters finish on their word ("paid", "minute").
- **Land the logo after a silence** (~0.3–0.5 s of total silence, or music thinned −14 dB). The hit lands twice as hard.

## Rendering
- Deterministic: `renderFrame(t)` is a pure function of time. Headless Chromium steps frames → PNG → ffmpeg.
- Every scene is a function of t with its own camera; hand-overs are solved in **screen space** through both cameras.
- Render per scene so a fix re-renders only that stretch; a `--times` stills mode for checks.
- Motion blur: sub-frames across the shutter, **averaged in Float32** (1 sample on holds, 4–8 on moves, 16 on whips). 8-bit stacking gives ghosts and a purple cast.
- Text holds still whenever it has to be read.

## Brand handling
- Official brand files only. Never redraw, recolour or distort: only move, scale, fade, mask. **Pixel-exact (integer position, no transform) whenever at rest.** Pre-scale with Lanczos.
- Fictional names, amounts, businesses; no other brands. Stats carry a source line.
- Spec work: "Spec ad · not affiliated with [BRAND]" + "made by [name]" end card.

## Realism
- Real people where people matter — a drawn silhouette on a video call reads as a mannequin.
- Nothing floats, nothing passes through anything; contact shadows on touch.
- Small fakes to hunt: glow clipped flat by the floor, objects bleeding through the hero, letter tips appearing as loose dots during a rise, a ball where an arrow should point.

## Process — approve each phase before the next
1. Script → beat sheet with exact times
2. Voice: auditions, transcription, pick, tighten, lock key-word times
3. Assets (logos at exact sizes, fonts, footage frames, SFX at 48 kHz)
4. **Look test: the hardest ~8 s only**, approved on stills
5. Engine + full build, scene by scene
6. **Contact sheet every 0.25 s (10 fps strip across every hand-over); read it like a client** and name every reason a frame looks cheap
7. 30 fps 720p preview with full mix → fixes
8. Final render once, mux, re-measure loudness after AAC encode

## Our take — what to keep, question, or adapt
- **Keep as strong defaults:** brand-owned opening, one-move transitions, sound on visible moves, the logo landing after a breath, contact-sheet review.
- **Situational:** "zero hard cuts / one carrier" suits premium brand films; fast social edits, kinetic type and UGC often *want* hard cuts on the beat.
- **Situational:** "never time-stretch the voice" is good practice; tiny stretches can be OK on quick social pieces.
- **Scale to the job:** 95 cues, an 8-phase approval process and 2-hour 3D renders are right for a portfolio piece, overkill for a quick test. Pick the depth per project.
- **Light vs dark stage:** "light, not dark" was right *for WhatsApp*; plenty of brands and styles live on dark.
- **Real brands:** spec ads of real brands are portfolio-only and need official files + disclaimers; for anything public prefer fictional or client-owned brands.
