# Motion Graphic Master Repo — Operating Manual for Claude

This repo is the **style bible + toolkit** for all motion graphics work. Every
session that works here must follow this file.

## Golden rules
1. **The bible is a guide, not law.** It is a library of options, techniques and
   lessons collected from references. Read `bible/` before designing, use it to
   propose directions, and discuss trade-offs with the user. Breaking a
   guideline is fine when the idea calls for it: say so and why. The user's
   call on a project always wins over any reference.
2. **References are inspiration, with their source.** Entries in `bible/` cite
   the breakdown they came from (e.g. `[ref: 2026-11-15-brand-promo]`), so we
   can talk about what that creator did, what worked, and what we'd do
   differently.
3. **Skills are reusable techniques.** Check `skills/INDEX.md` before building a
   technique from scratch. When a new technique is built, add it as a skill.
4. **Projects are isolated.** Each piece of work lives in `projects/<slug>/`
   with a `brief.md` (from `ideas/BRIEF_TEMPLATE.md`), source, and renders.
5. **Keep the bible alive.** When the user gives feedback ("too slow", "love
   that easing"), update the relevant bible file in the same session.

## Layout
| Path | What lives there |
|---|---|
| `bible/` | The style bible: identity, color, type, motion, transitions, composition, sound, do/don't, production method (`08-method.md`), style presets (`styles/`) |
| `skills/` | Technique recipes (one `.md` per technique) + `INDEX.md` |
| `references/videos/` | Raw reference videos |
| `references/docs/` | Reference PDFs / written recipes |
| `references/images/` | Stills, frames, boards, logos, fonts samples |
| `references/breakdowns/` | One analysis `.md` per reference + extracted frames/contact sheets |
| `ideas/` | Brief template and the backlog of ideas |
| `projects/` | Actual productions |
| `assets/` | Shared fonts (OFL) and SFX usable in any project |
| `tools/` | Scripts (ingest/analyze references, render helpers) |
| `.claude/skills/` | Slash-command workflows: `/ingest-reference`, `/new-project`, `/add-skill` |

## Execution stack
- **Code-driven animation:** Remotion 4 (React → MP4) is the default engine.
  Point it at the pre-installed Chromium in `remotion.config.ts`
  (`Config.setBrowserExecutable('/opt/pw-browsers/chromium-1243/chrome-linux64/chrome')`).
  Fonts via `@fontsource/*` from npm (Google Fonts hosts are blocked here).
  `projects/cyberoz-15s/` is the reference project: one-light carrier, morphs,
  `beats.json` shared with the Python mixer, 16:9 + 1:1 from one codebase.
- **Audio:** score + SFX synthesised in Python (`audio/mix.py` pattern:
  numpy/scipy, pyloudnorm −14 LUFS, oversampled limiter).
- **Video/audio ops:** ffmpeg/ffprobe (cuts, stitching, encoding, frame grabs).
- **Image ops:** ImageMagick `convert`.
- **NO Higgsfield generation by Claude.** The user generates AI shots
  (Seedance/Higgsfield) themselves; Claude writes the shot list + prompts and
  exports exact start/end frames, then does everything else in code
  (see `bible/styles/photoreal-hybrid.md`, reference project `projects/epara-lights-on/`).
- **Blender:** `pip install bpy==5.3.0` gives headless Blender (Cycles CPU) here.
- **ElevenLabs** (voice/SFX) only when the user asks for it; it costs credits,
  so confirm before generating.
- Default deliverables unless the bible says otherwise: 1080x1920 (9:16) and
  1920x1080 (16:9), 30 fps, H.264 MP4, AAC audio.

## Workflow for a new idea
1. Read `bible/` + `skills/INDEX.md`.
2. Write `projects/<slug>/brief.md` (concept, format, duration, beats).
3. Storyboard beats → map each beat to bible rules + skills.
4. Build, render a low-res preview, check frames against the bible, then
   render final.
5. Log any new rule/skill discovered back into `bible/` / `skills/`.

## Large files
Git LFS is NOT used: the cloud sessions can't reach lfs.github.com. Commit
media normally, keep each file under ~50 MB (GitHub rejects >100 MB), and
compress reference videos (e.g. `ffmpeg -i in.mp4 -vf scale=-2:1080 -crf 26 out.mp4`)
or host huge ones elsewhere and link them in the breakdown.
