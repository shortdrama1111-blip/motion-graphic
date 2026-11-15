# Brief — epara reel (9:16, 26.5 s) — v2

- **Concept:** A + C — "Pa radhë në bankë" hook, then the site's own "PO!" device over 8 features.
- **Format:** 1080×1920, 30 fps, 26.5 s. Key content between y 170–1330.
- **Audio:** SFX only (`audio/sfx.py` → `public/sfx.wav`, ~−17 LUFS stem). User's music at **120 BPM**: downbeats on even seconds; PO! at 6, 8, 10, 12, 14, 16, 18, 20, 22.5 s; logo hit 24.0 s.
- **Virtual card:** official SVG from the user (`public/virtual-card.svg`), also used for the physical card until a photo of it arrives.
- **User corrections (v2):** cash withdrawals at any ATM, no commission at 140+ BKT ATMs; payments by QR and by physical card; RIA and cashback get their own moments; midnight transfer gets its own night-scene style; longer is fine. Credit not mentioned.

| Time | Screen | Copy |
|---|---|---|
| 0–3.5 | Bank queue: ticket 147, LED 089→090, clock to 15:00, MBYLLUR | Prapë në radhë? · Dega mbyllet në 15:00. |
| 3.5–5 | Brand-gradient wipe | Jo më. · Me epara gjithçka është në telefon. |
| 5–7 | Onboarding checks | Llogari pa shkuar në degë? **PO!** |
| 7–9 | Official virtual card flips in | Kartë virtuale, menjëherë? **PO!** |
| 9–11 | Physical card lands, plane flies, paid abroad 24.00 € | Kartë fizike, edhe jashtë vendit? **PO!** |
| 11–13 | QR scan **or** card tap on POS | Paguan me QR ose me kartë? **PO!** |
| 13–15 | ATM, "Pa komision në 140+ ATM të BKT-së", cash out | Cash në çdo ATM? **PO!** |
| 15–17 | NIGHT: stars, moon, skyline, glowing 00:00, comet coin phone→phone, +5,000 ALL Falas | Para shokut, falas, edhe në mesnatë? **PO!** |
| 17–19 | Globe, pins abroad → Shqipëri, € flies, +200 € | Transferta me RIA? **PO!** |
| 19–21 | Payment 1,200 ALL, coins jump back into "+ Cashback" | Cashback sa herë paguan? **PO!** |
| 21–23 | Chips: LEK & EUR, fatura 24/7, shto para nga banka/karta, epara Biznes | Edhe më shumë? **PO!** |
| 23–24 | Breath | — |
| 24–26.5 | Logo + tagline art + CTA | Më mirë se para! · Shkarko falas · App Store · Google Play |

Rebuild: `python3 audio/sfx.py && npm run render`.
