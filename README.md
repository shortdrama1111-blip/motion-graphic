# motion-graphic

Master repository and **style bible** for motion graphics production.

- `bible/` — the rules of the look (identity, color, type, motion, transitions, composition, sound)
- `references/` — videos, images and written breakdowns that the rules come from
- `skills/` — reusable motion techniques
- `projects/` — productions built from the bible
- `tools/` — helper scripts (e.g. `tools/analyze_reference.sh` for reference ingest)

## Feeding the bible
Drop reference videos into `references/videos/` and images into
`references/images/`, then ask Claude to run `/ingest-reference <file>`.
Written style notes or skill descriptions can be pasted straight into chat —
Claude files them into `bible/` or `skills/`.
