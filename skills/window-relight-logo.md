# Logo Lit Into Real Windows
- **Category:** brand / photoreal · **Engine:** Python (OpenCV) · **Source:** [ref: 2026-11-16-tinder-lights-on] · **Code:** `projects/epara-lights-on/tools/prep_plates.py`

Needs a plate (tower, dark) and its **lit twin** (same framing, all rooms lit). Steps: find the window grid period/phase (autocorrelation of column/row profiles), map each **pane** (two per window) to its rect, sample the official mark mask at each pane centre, fill those panes with real lit rooms from the twin (or borrowed from other lit panes), tint by brand gradient (luma × colour), add a soft glow layer. Export an RGBA overlay + reveal it floor by floor (bottom-up) in Remotion with a stepped clip.
City version: warp the mark onto the ground with a perspective homography, dim outside, push lights inside to the gradient, reveal with a radial mask, punch on the drop.
