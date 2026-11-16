# Green-Screen Phone + Rebuilt App
- **Category:** UI / compositing · **Engine:** Python (OpenCV) + HTML screens · **Code:** `projects/epara-lights-on/tools/phone_comp.py`, `projects/epara-lights-on/app/*.html`

Track the green screen per frame (largest green blob → convex hull → diagonal extremes = 4 corners), smooth over 5 frames, grow 3.5% for rounded corners, warp the UI with a homography, key by greenness (thumb stays in front), **despill** green on face/hand into the app's own pink-purple light. App screens are **rebuilt in HTML from the user's screenshots** with fictional names/amounts (originals stay local: `*-PRIVATE.*` is gitignored).
