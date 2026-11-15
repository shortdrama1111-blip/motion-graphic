# Motion Graphic Master Repo — Operating Manual for Claude

This repo is the **style bible + toolkit** for all motion graphics work. Every
session that works here must follow this file.

## Golden rules
1. **The bible wins.** Before designing or rendering anything, read `bible/`
   (start with `bible/00-identity.md`). Never invent a look that contradicts it.
   If the bible is silent on something, pick the option closest to the
   references in `references/breakdowns/`, then note the decision so it can be
   added to the bible.
2. **References are evidence.** Rules in `bible/` should cite the reference
   breakdown(s) they came from (e.g. `[ref: 2026-11-15-brand-promo]`).
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
| `tools/` | Scripts (ingest/analyze references, render helpers) |
| `.claude/skills/` | Slash-command workflows: `/ingest-reference`, `/new-project`, `/add-skill` |

## Execution stack
- **Code-driven animation:** Remotion (React → MP4) is the default engine for
  2D/typographic/UI/infographic motion, rendered headless with the
  pre-installed Chromium. Set up per project in `projects/<slug>/`.
- **Video/audio ops:** ffmpeg/ffprobe (cuts, stitching, encoding, frame grabs).
- **Image ops:** ImageMagick `convert`.
- **Generative footage/3D/product shots:** Higgsfield and ElevenLabs connectors
  (video, image, SFX, voice) when a shot can't be built in code. Generation
  costs credits — confirm long/expensive runs with the user first.
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
