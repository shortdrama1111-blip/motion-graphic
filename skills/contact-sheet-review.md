# Contact-Sheet Review ("watch it like a client")
- **Category:** QA · **Engine:** ffmpeg + ImageMagick · **Source:** [ref: 2026-11-15-keemfinity-whatsapp-specad], [ref: 2026-11-15-keemfinity-moniepoint-listen]

- Stills at ~20 key moments → contact sheet → fix.
- Preview: 30 fps 720p with full mix; then a frame every 0.25 s for the whole film, and a 10 fps strip across every hand-over.
- `ffmpeg -i preview.mp4 -vf "fps=4,scale=320:-2,tile=8x6" sheet_%02d.jpg`
- For each frame, name every reason it reads as cheap: two light heads, glow clipped flat, things bleeding through the hero, loose letter dots, floating/no contact shadow, half-typed words, logo not pixel-exact, empty set, text over faces.
