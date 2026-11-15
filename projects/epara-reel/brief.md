# Brief — epara reel (9:16, 20 s)

- **Concept:** A + C — "Pa radhë në bankë" hook, then the site's own "PO!" device rapid-fire.
- **Format:** 1080×1920, 30 fps, 20 s. Safe zone: all key content between y 170–1330.
- **Audio:** SFX only (`audio/sfx.py` → `public/sfx.wav`, ~−17 LUFS stem). User adds music at **120 BPM**: downbeats on every even second; every PO! lands at 6.0 / 8.0 / 10.0 / 12.0 / 14.0 / 16.5 s, logo hit 18.0 s.
- **Credit (kredi):** not mentioned until the user gives exact wording.

| Time | Screen | Copy |
|---|---|---|
| 0–3.5 | Bank queue: ticket 147, "58 klientë para jush", LED 089→090, clock to 15:00, MBYLLUR stamp | Prapë në radhë? · Dega mbyllet në 15:00. |
| 3.5–5 | Brand-gradient wipe | Jo më. · Me epara gjithçka është në telefon. |
| 5–7 | Onboarding checks | Llogari pa shkuar në degë? **PO!** |
| 7–9 | Virtual card flips in | Kartë virtuale, menjëherë? **PO!** |
| 9–11 | ATM, 140+ counter, cash out | Cash në çdo ATM të BKT-së? **PO!** |
| 11–13 | Ti → Ana, 00:00, 5,000 ALL, Falas | Para shokut, falas, edhe në mesnatë? **PO!** |
| 13–15 | QR scan, Paguar 250 ALL | Paguan me QR kudo? **PO!** |
| 15–17 | Chips: kartë fizike jashtë, LEK & EUR, RIA, fatura 24/7, cashback | Edhe më shumë? **PO!** |
| 17–18 | Breath (blur out, silence) | — |
| 18–20 | Official logo + tagline art, CTA | Më mirë se para! · Shkarko falas · App Store · Google Play |

Renders: `renders/epara-reel-9x16.mp4` (with SFX), `-silent.mp4`, `epara-sfx-stem.wav`.
Rebuild: `python3 audio/sfx.py && npm run render`.
