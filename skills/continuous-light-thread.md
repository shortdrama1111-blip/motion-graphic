# Continuous Light Thread
- **Category:** carrier / shape · **Engine:** Canvas 2D (or three.js line) · **Source:** [ref: 2026-11-15-keemfinity-whatsapp-specad]

## What it looks like
One light that never stops moving and does every job in the film. On light stages it's a crisp stroke with a small bright head that fades out behind it — like the brand's own progress bar — not a neon tube.

## Parameters
| Param | Default |
|---|---|
| Tail intensity | f^1.6 (f=0 tail → 1 head) |
| Stroke layers | [8px, α0.10, brand] · [3.6px, α0.95, brand-deep] · [1.2px, α0.55, near-white] |
| Head | 16px soft halo · 3.4px dot · 1.3px white highlight |
| Contact shadow | same path +9px y, 6px wide, rgba(16,60,36,≤0.2), blur 4 at ¼ res, multiply |
| Spill | soft-light radial 220px, α≤0.35 at head, 75% and 50% of tail |
| Bloom | ≤ 6% |
| Hand-over tail retract | 0.12–0.15 s |

## How to build it
1. One function `drawLight(polyline, I)` used for every light (hook stroke, logo trace, thread, focus line, route, playhead, ring, rim, underline). Draw tail→head, segment alpha = layerAlpha · I · f^1.6.
2. Heads follow cubic Béziers, Catmull-Rom paths through targets, or the outline of a real UI shape, with eased progress.
3. **Hand-over rule:** map the leaving point through scene A's camera and the arriving point through scene B's camera at the current t (screen space). The old line ends exactly where the new one starts; old tail retracts into the point while new tail grows from zero. **Never two heads on screen.**
4. Things the light passes react (avatars flash a ring, bars turn colour, letters scramble).

## Variations
Wedge-mask reveal (head traces a ring, angular mask reveals the logo behind it) · playhead · orbit · underline that ends in a dot or arrow.
