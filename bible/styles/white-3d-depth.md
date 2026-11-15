# Preset — White 3D Depth
[ref: 2026-11-15-keemfinity-moniepoint-listen]

- **Stage:** white #ECF0F6, floor #F1F4F9 **fogged into the background** (near 9–16, far 24–46) — never a horizon or floor edge.
- **One accent** colour only (Moniepoint example #0357EE; screen light #2C6BFF).
- **Depth comes from shadows, focus, fog and thickness — not glow.** Neutral tone mapping, soft PCF shadows, room-environment reflections, contact shadows, DOF pulled to whatever the voice talks about. Nothing sits at the same depth as everything else.
- **Objects:** white rounded slabs with real thickness + clearcoat (card #FBFCFE), slight idle drift; edges catch light.
- **Carrier:** small emissive sphere + soft sprite glow, breathing; glow has depth-test off so the floor never clips it flat.
- **Type:** Inter 500–700, ink #0B1220, grey #5B6475, dim #9AA3B5. 2D type on its own canvas over the render; in-scene type as textures on 3D planes.
- **Camera:** one continuous `camAt(t)`; whips are camera moves, never cuts.
- **Format:** 1920×1080, 30 fps (2–10 s/frame software WebGL; render per scene).
