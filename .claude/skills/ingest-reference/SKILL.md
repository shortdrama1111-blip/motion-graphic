---
name: ingest-reference
description: Ingest a reference video, image, or written style note into the motion graphics style bible. Use when the user adds a reference file or describes a style/technique they want captured.
---
1. Locate the file (ask only if none given). Move it into `references/videos/` or `references/images/` with a dated kebab-case name (`YYYY-MM-DD-<topic>.<ext>`).
2. Videos: run `tools/analyze_reference.sh <file> <slug>`. Then look at `contact_sheet.jpg` and the frames in `scenes/` with Read, and use `cuts.txt` for timing.
   Images: view them directly.
   Text notes: skip to step 3.
3. Write `references/breakdowns/<slug>.md` from `references/breakdowns/_TEMPLATE.md`: shot list, color, type, motion/easing (estimate frame counts at 30fps), transitions, composition, sound.
4. Promote findings into `bible/0X-*.md` with `[ref: <slug>]` citations. If a finding contradicts an existing rule, ask the user which wins.
5. Each distinct reusable technique → `skills/<name>.md` from `skills/_TEMPLATE.md`, and add a row to `skills/INDEX.md`.
6. Add a line to `bible/CHANGELOG.md`. Summarize to the user what was learned and what was added.
