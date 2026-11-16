# Photo-Filled Type
- **Category:** type · **Engine:** CSS (background-clip:text) / canvas mask · **Source:** [ref: 2026-11-16-amazon-a-to-z]

Huge bold words whose letters are windows onto product photos ("Everything you love." with each letter showing a different product), then the photos fade so the letters settle to white, with the one key word turning to the accent colour. Then the line re-forms into the next phrase.

Build: in Remotion/CSS use `background-image` (one photo, or a slow-panning collage) + `background-clip: text; color: transparent`, then cross-fade to a solid white text layer. Stagger photos per letter by wrapping each letter in its own span with its own background. Use unbranded photos only.
