# Brief — cyberOZ "Live, not yearly" (15 s)

- **Slug:** cyberoz-15s · **Product:** cyberOZ (user's own startup) — see `research.md`
- **Selling point:** continuous compliance — "When a resource drifts out of line, you see it the moment it happens, not months later during an audit."
- **Formats:** 1920×1080 + 1080×1080, 30 fps, H.264/AAC, −14 LUFS. LinkedIn / web.
- **Look:** cyberOZ's own light world (white + soft lilac/pink blobs from their demo), wine #660033, Outfit + Inter. Method borrowed from `light-ui-stroke`: the OZ **sparkle ✦ is the one continuous light** and lands as the logo's own sparkle at the end.
- **Audio:** no VO (user's call); score + SFX in code (`audio/mix.py`), kit SFX.
- **Engine:** Remotion 4 (`src/`), timing shared with the mixer in `src/beats.json`.

## Beats (115.66 BPM; downbeats 2.525 / 4.6 / 6.675 / 8.75 / 10.825 / 12.9)
| Time | Picture | Copy | Sound |
|---|---|---|---|
| 0–2.5 | Change chips pop around the headline | Your stack changes *every day.* | pad, plucks, tick per chip |
| 2.5–4.6 | Stale spreadsheet, "Last checked 11 months ago", OUTDATED stamp; world desaturates | Your compliance? Checked *once a year.* | dull pad, clock ticks, stamp, riser |
| 4.6 | Everything is sucked into the ✦ sparkle → slam → OZ hub | — | impact on downbeat, drums in |
| 4.9–7.2 | Light shuttles to GitHub / Google Cloud / AWS / Azure, lines + data pulses, LIVE | cyberOZ checks it *live.* | pop per connection |
| 7.2–10.25 | AWS card morphs into Security checks; S3 encryption flips to Failing, light dashes there instantly, mapped to ISO 27001 A.8.24 / NIS2 Art. 21 / SOC 2 CC6.1, fixed | Something drifts? → You see it *instantly.* | alarm beeps, ticks, success |
| 10.3–12.35 | Panel morphs into compliance ring; light is the progress head 0→100%; ISO 27001 / SOC 2 / NIS2 / GDPR ✓ | Audit-ready. *Every day.* | counter, chime, ticks |
| 12.35–12.9 | Breath: blur out, light flies to the sparkle spot; silence | — | silence |
| 12.9–15 | OZ logo blooms out of the sparkle | Compliance *Simplified.* · Get early access → · cyberoz.io | boom + F-major bells, pop |

## Render
```
npm install
python3 audio/mix.py
npx remotion render src/index.ts Cyberoz16x9 renders/cyberoz-16x9.mp4 --crf=16
npx remotion render src/index.ts Cyberoz1x1 renders/cyberoz-1x1.mp4 --crf=16
```
