# Breakdown — 2026-11-15-keemfinity-moniepoint-listen

- **File:** `references/docs/2026-11-15-keemfinity-moniepoint-listen.pdf` (prompt/recipe, 8 pp, by keemfinity)
- **Film:** "Listen. Every alert is a dream." — Moniepoint spec ad, 30.2 s, 1920×1080, 30 fps, 906 frames. Real-time three.js 3D, one continuous camera, no AI video, no stock.
- **Why it's in the bible:** user: "the video they made is great".
- **Frames:** `2026-11-15-keemfinity-moniepoint-listen/stills.jpg`

## Concept
The brand's world is the payment-alert *sound*. One blue point of light; every tap is an alert chime. Three businesses get paid → alerts spread across a Nigeria dot map → terminals light → becomes the app → camera pushes into the last card's white face, which becomes the page → underline becomes an arrow → logo out of total silence.

## Shot list (s) — beat grid 116.13 BPM, beat = 0.5167 s, beat(k)=1.15+k·0.5167
| Time | What happens | Technique |
|---|---|---|
| 0.00–1.15 | White field, breathing blue point. "Listen" (92px/600) rises 0.30, blurs/fades in place 0.80–1.12 | type rise / blur exit |
| 1.15 (k0) | Tap 1 + alert chime: light swells, bakery card grows *out of the light* on the camera ray at its final depth; floor rings | emerge-from-light |
| 1.75–4.28 | "bakery in Lagos, getting paid": payment pill flies in, ₦0→4,500 counts from "getting" to "paid"+0.32 | counter lands on word |
| 4.28–6.58 | Whip pans (still camera moves, never cuts) to pharmacy (₦12,800) and fabric stall (₦86,000) | whip pan |
| 7.70–8.90 | Pull back & rise, cards tip and fall | |
| 8.90 (k15) | Nigeria dot map drops; alerts ripple from cities weighted by size; odometer → "6,000+ … every minute" finishing on "minute"; source line | dot map, odometer |
| 13.03 (k23) | POS terminals rise, screens light one by one, "8 in 10" lands on "eight"/"ten"; floor ring pulses | sequential light-up |
| 17.68 (k32) | Blue flash into app: 3 tall cards (paid instantly / loan counts to ₦500k / savings ring to 100%), blue line between | |
| 21.30–21.85 | Push into "100%" card face; blank face hands over invisibly to a pixel-matched white page | match-white hand-over |
| 21.91–25.20 | "Every alert / is a dream, moving forward" on the page; underline = blue tube → cone arrowhead that travels on | underline→arrow |
| 25.62 | Music cuts to total silence | silence before logo |
| 25.95 (k48) | Logo out of silence: soft-edge mask wipe; VO "Moniepoint" 26.19; tagline 26.95 | logo on silence |
| 28.20–30.20 | End card + disclaimer | |

## Extracted style
- **Color:** white stage #ECF0F6, floor #F1F4F9 fogged into background (no horizon), one accent #0357EE, ink #0B1220 / #5B6475 / #9AA3B5.
- **Depth:** real 3D, slabs with thickness + clearcoat, soft PCF shadows, contact shadows, fog (near 9–16, far 24–46), DOF pulled to whatever the voice talks about, idle drift; nothing at the same depth.
- **Type:** Inter 500–700. Rise through a mask with alpha over first 35% of rise; exit = blur 0→7px + tracking −2→+4 in place, never sink/slice.
- **Camera:** one `camAt(t)`; Bézier blends between sections landing on beats; push-ins interpolated in log-space distance.
- **Sound:** score written in code (F major, 116 BPM, pads/arp/sidechain, riser into silence); sonic logo = alert chime resolved; every visible move has a sound; voice ≥15 dB over music in 1–4 kHz.

## → Rules added to bible
`08-method.md`, `styles/white-3d-depth.md`, `02-typography.md`, `03-motion.md`, `06-sound.md`.
## → Skills created
threejs-continuous-camera, motion-blur-float, type-rise-blur-exit, emerge-from-light, match-white-handover, code-scored-music, plus shared ones from the WhatsApp breakdown.
