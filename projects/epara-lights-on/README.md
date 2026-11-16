# epara — "Qyteti ndizet" (FINAL, approved)

`renders/FINAL-epara-qyteti-ndizet-9x16.mp4` — 19.2 s, 1080×1920, 30 fps, −14 LUFS. User: "the video was perfect".
Stems: `renders/vo-stem.wav`, `renders/sfx-stem.wav`, `renders/music-stem.wav`.

Pipeline: `shotlist.md` (prompts for the user's AI shots) → `plates/`, `footage/` → `tools/prep_plates.py`, `tools/phone_comp.py`, `tools/blender_lockup.py`, S3 cleanup → Remotion `src/` (timing `src/beats.json`, VO-first) → `audio/mix.py`.
Rebuild: `python3 tools/prep_plates.py && python3 tools/phone_comp.py && python3 tools/blender_lockup.py --frames=0-59 --res=720 --samples=24 && cp build/lockup/*.png public/lockup/ && python3 audio/mix.py && npx remotion render src/index.ts LightsOn renders/out.mp4 --crf=17`
