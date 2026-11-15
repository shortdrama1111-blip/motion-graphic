# 03 — Motion Principles

> Status: PARTIAL — method-level rules filled; house-specific values still open.

## Easing
| Name | Curve (cubic-bezier / spring) | Used for |
|---|---|---|
| | | |

## Timing
- Base tempo / BPM sync:
- Typical in / hold / out durations (frames @30fps):
- Stagger between elements:
- Overshoot / bounce amount:

## Camera
- Virtual camera moves (push, parallax, shake, whip):
- Depth / 2.5D / 3D usage:

## Texture & finishing
- Motion blur:
- Grain / noise / chromatic aberration / glow:

## Rules from references
- **Easing:** heads/travel on cubic Béziers with eased progress; pops use ease-back; camera blends are cubic Bézier between poses. [ref: both keemfinity]
- **Push-ins:** interpolate camera distance in log space so it feels like a steady zoom, not a lurch. When a section ends on an object, push *into* it rather than away. [ref: 2026-11-15-keemfinity-moniepoint-listen]
- **Impact/slam:** shake 16–24px decaying e^(−9t), scale punch 1.10→1.00, shards + one shockwave ring. **No white flash.** Smaller hits: 8px shake. [ref: 2026-11-15-keemfinity-whatsapp-specad]
- **Button press:** −12% scale, then result pops with ease-back.
- **Stagger:** depth fly-ins staggered over ~0.4 s, then dolly.
- **Motion blur:** only on things that fly; averaged sub-frames (see `08-method.md`).
- **Idle life:** slow drift on backgrounds/objects, breathing lights; nothing fully static except brand marks at rest (pixel-exact).
