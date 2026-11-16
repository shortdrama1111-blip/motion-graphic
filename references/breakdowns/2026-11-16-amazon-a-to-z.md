# Breakdown — 2026-11-16-amazon-a-to-z

- **File:** `references/docs/2026-11-16-amazon-a-to-z.pdf` (3-page prompt, "From A to Z", Amazon spec ad). Contains Higgsfield affiliate links: ignore them (user rule: no Higgsfield).
- **Film:** 19.2 s + 2 s end card, 60 fps, 16:9 and a *real* 9:16 re-layout. One continuous shot, built entirely in code (Python 2.5D renderer: numpy / Pillow / OpenCV + ffmpeg).

## Concept
The logo's own idea is the story: the Amazon smile is an arrow from a to z, so one orange line does every job: slams in under the wordmark → search-field focus line → Buy Now fill → delivery route through a night city → smile printed on the box at the door → arrow under "From A to Z." → slots back into the logo on the final hit.

## Shot list (s)
| Time | What happens | Technique |
|---|---|---|
| 0.00–1.60 | Frame 0 already moving: the smile streaks at camera from deep space, SLAMS under the wordmark at 0.17 (shake, shards, sub); its light reveals the logo a→z | instant hook, light-reveal |
| 1.60–4.80 | Logo rises away, a light copy peels off; titanium phone lands on the beat (2.40); line = search focus line; "wireless headphones" types with real autocomplete rows; 6 result cards lift off the screen into 3D, fan out; line traces card 1, camera pushes in | cards-off-screen fan |
| 4.80–7.20 | Product page; camera glides to Buy Now; the line *is* the button's fill (hot head = leading edge); TAP; "Order placed"; line shoots out, camera flies through the screen | fill-as-light, fly-through |
| 7.20–10.00 | Drop: screen becomes a night city from above, blocks rise, swoop to 3/4; the line draws the route to a home pin; glass card "Arriving today" + 4-step tracker; dive into defocus | screen→world |
| 10.00–13.30 | Night doorstep, kraft box hovering; line runs the boards, wraps the box, lands on its face as the smile and *cools from light into printed ink*; box touches down on the word "door" | light→ink |
| 13.30–16.50 | "Everything you love." letters filled with product photos, settling to white, "love" in orange; re-forms "From A to Z.", arrow runs A→Z and hooks up like the smile | photo-filled type |
| 16.50–19.20 | Breath (music out, reversed swell only) → hit at 16.80: arrow slots into the official smile, wordmark reveal a→z, logo holds alive with a slow light under it | logo on breath |
| 19.20–21.20 | End card: signature + "Spec ad · not affiliated" | |

## Extracted style
- **Dark stage, bright heroes** (contrast with WhatsApp's "light, not dark": it depends on the brand). Near-black #070707, warm amber glow that drifts and breathes, faint brand-colour corner (#232F3E), fine grain. One accent (#FF9900), at most one accent word per line. Brand app rebuilt by eye in dark mode.
- Heavy motion blur, shallow DOF, a camera that always drifts, long eases.
- VO: warm friendly narrator at natural speed (never sped up), whole script in one call, 2 takes, keep the word-perfect one, each line placed at its start time. Music ≥ 12 dB under every word; nothing but the hero hit within 60 ms of it. Master −14 LUFS / −1.25 dBTP. ~90 SFX cues.
- Process: build in parallel parts (light+logo+type / phone / map+box / sound) that all draw the line through ONE shared function. Optional layered DaVinci Resolve project as a deliverable.

## → Added to bible
`styles/dark-hero-stage.md`, `04-transitions.md`, `07-do-dont.md`, skills: photo-filled-type, light-to-ink, screen-to-world, cards-off-screen-fan, real-objects-checklist.
