# Deterministic Renderer (Canvas / three.js → ffmpeg)
- **Category:** pipeline · **Engine:** Node + Playwright + ffmpeg · **Source:** [ref: 2026-11-15-keemfinity-whatsapp-specad], [ref: 2026-11-15-keemfinity-moniepoint-listen]

## What it is
One HTML page + `engine.js`; `renderFrame(t)` draws any frame from t alone (no accumulated state, seeded randomness). Playwright steps frames, grabs PNGs, pipes to ffmpeg.

## How to build it
1. Scenes = functions of t, each with its own camera function. A master timeline dispatches t to scene(s); overlaps for hand-overs.
2. Phone/UI screens on their own 2× canvas placed with a transform. Footage pre-extracted to JPEG frames at the target fps and drawn as images.
3. `renderall.js out.mp4 <fps> <from> <to>` → `page.evaluate(t => renderFrame(t))` → `canvas.toDataURL` / screenshot → ffmpeg `-f image2pipe -c:v libx264 -crf 14`.
4. **Stills mode** `--times 1.2,9.0,…` (≈0.3 s/frame) for iteration; **per-scene files** so a fix only re-renders its stretch; join with ffmpeg concat.
5. Mux: `ffmpeg -i video.mp4 -i mix.wav -c:v copy -c:a aac -b:a 320k -movflags +faststart final.mp4`.
6. Fast moves render 4 sub-frames (see motion-blur-float); holds render 1.

Benchmarks: canvas 2D ≈0.45 s/1080p frame on 2 cores; three.js software WebGL 2–10 s/frame.
