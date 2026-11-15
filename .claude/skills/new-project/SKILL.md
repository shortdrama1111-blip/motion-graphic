---
name: new-project
description: Start a new motion graphics production from an idea, following the style bible. Use when the user pitches an idea, asks for a video/animation/ad/intro, or says "make me…".
---
1. Read every file in `bible/` and `skills/INDEX.md`.
2. Create `projects/<slug>/brief.md` from `ideas/BRIEF_TEMPLATE.md`; add the idea to `ideas/BACKLOG.md`. Ask only for things the bible and the request can't answer (usually: copy, assets, duration).
3. Fill the beat table, mapping each beat to bible rules and skills. Share the beat table with the user before building anything costly.
4. Build: Remotion for code-driven graphics (`npx create-video@latest` in `projects/<slug>/`, render headless), ffmpeg for edit/assembly, Higgsfield/ElevenLabs for generated footage, SFX, VO (confirm credit spend on long runs).
5. Render a low-res preview, grab frames with ffmpeg, check them against the bible, fix, then render the final into `projects/<slug>/renders/`.
6. Log new rules/skills back into `bible/` and `skills/`.
