# Dot-Matrix Map with Arcs / Ripples
- **Category:** data / world · **Engine:** Canvas 3D projection or three.js · **Source:** [ref: 2026-11-15-keemfinity-whatsapp-specad], [ref: 2026-11-15-keemfinity-moniepoint-listen]

1. Rasterise land (Natural Earth / country GeoJSON) to a dot grid (world: 1.15° → ~11.8k dots).
2. Place on a true 3D plane with a perspective camera; dots muted (#54656F @30–45% or #D5DCE8), turning accent near the light/ripples.
3. **Arcs:** lifted great-circle-style curves between cities; the carrier rides one, then 20 more light up as the camera pulls back; tiny tonal click as each lands.
4. **Ripples:** alerts spawn from cities weighted by size (e.g. Lagos 6, Kano 4, Abuja 4), each lighting dots; one tiny bell per ripple panned by x.
5. Pair with an odometer that finishes on the key word, plus a source line.
