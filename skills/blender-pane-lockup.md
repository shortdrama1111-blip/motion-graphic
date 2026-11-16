# Blender Pane Lock-up → Official Logo
- **Category:** 3D / brand · **Engine:** bpy 5.3 (pip), Cycles CPU · **Code:** `projects/epara-lights-on/tools/blender_lockup.py`

Sample the official mark on a grid → one bevelled emissive pane per cell (per-object brand-gradient colour, glossy coat), start scattered in depth, staggered bottom-up, ease into place by frame 34, pivot turns to face camera by frame 56. 720×1280, 24 spp + denoise ≈ 6–8 s/frame on 2 cores. In Remotion: measure the final pane bbox, dissolve into the **official mark PNG at the identical rect**, move the mark into its place in the full logo, write out the wordmark with a moving mask.
