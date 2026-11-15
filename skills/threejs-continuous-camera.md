# three.js One Continuous Camera
- **Category:** camera / 3D · **Engine:** three.js r169 + EffectComposer · **Source:** [ref: 2026-11-15-keemfinity-moniepoint-listen]

1. `camAt(t) → {pos, target}` built from one small function per section; sections blend with eased cubic Bézier between poses; every hand-over lands on a beat.
2. Whips between subjects are camera moves with 16-sample blur, never cuts.
3. Push into objects with log-space distance interpolation: `d = exp(lerp(log d0, log d1, ease(u)))`.
4. Look: fog floor into background (near 9–16, far 24–46), neutral tone mapping, PCF soft shadows, RoomEnvironment reflections, clearcoat slabs with thickness, bokeh pass with focus on the element the VO names, 4× MSAA.
5. Glow sprites: `depthTest:false` so the floor never clips them flat. Hide objects waiting underneath the hero.
6. 2D type on an overlay canvas; in-scene type as textures on planes.
