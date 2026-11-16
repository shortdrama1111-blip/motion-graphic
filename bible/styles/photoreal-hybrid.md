# Preset — Photoreal Hybrid ("Lights On")
[ref: 2026-11-16-tinder-lights-on] · proven on `projects/epara-lights-on` (user: "perfect")

**Look:** real night city, photographic everywhere; the brand appears *inside* reality (windows, a whole district) in the brand gradient, then lands on the official logo.

**Who makes what**
- **User** generates the AI stills/videos (Seedance / Higgsfield) from Claude's shot list + prompts. **Claude never generates with Higgsfield.**
- **Claude** does everything else in code (0 credits): relighting, green-screen phone comp, app screens, overlays, Blender, VO edit, SFX, mix.

**Pipeline (in order)**
1. Ask: brand-name pronunciation, logo files, app screenshots (Claude rebuilds them clean), format, facts to claim.
2. Shot list + prompts (`projects/epara-lights-on/shotlist.md` is the template): hook tower plate + its *lit twin* (edit of the same plate), two-tower plate, city aerial, district-in-gradient + window close-up keyframes, hand+phone with **green screen**, video moves with **start/end frames**.
3. VO first (brand name never spoken if TTS stresses it wrong); everything is timed to it (`src/beats.json`).
4. Code: `tools/prep_plates.py` (logo lit in windows + city), `tools/phone_comp.py` (green-screen tracking), S3 text cleanup, `tools/blender_lockup.py` (panes → mark), Remotion `src/Main.tsx`.
5. Contact sheets at every hand-over (10 fps strips) before every final render.

**Rules that made it work**
- Logo lit into real rooms, never AI-drawn; dense window grid; light each *pane* (doubles resolution); widen thin gaps in the mark.
- Transitions: start/end-frame AI shots from the *exact* edit frames; push *through* the window glass (reflection sweep + soft flare) into the next room; **no zoom/blur on cuts** (clean cuts on the voice).
- Ending: pane lock-up dissolves into the official mark *in place*, mark travels into the full logo, wordmark written out; switch to a **light background** if the official logo is made for light.
- Sound: few designed sounds (air, sub, shimmer, room reverb), **no UI pops/dings/jingles**; align the music's own drop to the main visual drop by offsetting the track; voice ≥ 10 dB over music.
