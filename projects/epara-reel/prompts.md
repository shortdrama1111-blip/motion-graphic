# epara reel — ElevenLabs prompts (music + voice-over)

Reel: 26.5 s, 9:16, 120 BPM (1 beat = 0.5 s, downbeats on every even second).
Every "PO!" stamp lands at 6, 8, 10, 12, 14, 16, 18, 20 and 22.5 s; logo hit at 24.0 s.

## 1. ElevenLabs Music — prompt

```
Upbeat, modern Balkan-pop / afro-house fintech ad track for an Instagram Reel, 120 BPM, exactly 27 seconds, instrumental only, no vocals.

0:00–0:03.5 — Tense and dull: a muted ticking-clock percussion loop, low filtered synth pad, slightly sad and impatient, like waiting in a long bank queue. Sparse.
0:03.5–0:05 — Quick rising swoosh/riser and a short drum fill that explodes into a bright, confident groove exactly at 0:05.
0:05–0:15 — Energetic, happy, punchy groove: four-on-the-floor kick, tight claps, plucky marimba/synth hook, warm bass. A short punchy brass or synth STAB on every downbeat (0:06, 0:08, 0:10, 0:12, 0:14).
0:15–0:17 — Night moment: the groove drops to a dreamy, filtered, half-time feel with soft bells and sparkle, then snaps back on 0:17.
0:17–0:21 — Full groove again, stabs on 0:18 and 0:20.
0:21–0:22.5 — Build-up: snare roll and rising filter, ending in a big stab exactly at 0:22.5.
0:23–0:24 — Total silence (one second of complete breath).
0:24 — One big, warm, uplifting final hit (major chord + soft bell) that rings out and fades by 0:27.

Clean modern mix, bright and optimistic, leaves space in the mids for a voice-over. Key: F major.
```

Tips: generate 2–3 versions; keep the one whose groove starts closest to 0:05 and whose silence sits at 0:23–0:24. Do not stretch it, send it to me and I'll align it to the picture.

## 2. ElevenLabs Voice Design — voice prompt (if you want a new voice)

```
A young Albanian voice, 25–30 years old, native Albanian speaker with a neutral Tirana accent. Warm, confident and energetic, smiling while speaking, like a modern social-media ad for a fintech app. Clear, crisp diction, fast but easy to understand, close-mic studio quality, no background noise.
```

Sample text for Voice Design (Albanian, needed to preview the voice):

```
Prapë në radhë në bankë? Jo më! Me epara hap llogarinë nga telefoni, merr kartën virtuale menjëherë dhe dërgo para te shokët falas, edhe në mesnatë. epara, më mirë se para!
```

## 3. Text to Speech — voice-over script

Model: **Eleven v3 or newer** (supports Albanian and audio tags). Generate **each line separately** (or the whole script and I'll cut it); I place every line on its beat.

| # | Starts at | Line (paste as-is) |
|---|---|---|
| 1 | 0.3 s | `[tired, sighing] Prapë në radhë në bankë?` |
| 2 | 2.0 s | `[annoyed] Dhe dega mbyllet në tre…` |
| 3 | 3.8 s | `[confident, punchy] Jo më!` |
| 4 | 4.3 s | `[excited] Me epara, gjithçka në telefon.` |
| 5 | 5.0 s | `[energetic] Llogari pa degë?` |
| 6 | 7.0 s | `[energetic] Kartë virtuale, menjëherë?` |
| 7 | 9.0 s | `[energetic] Kartë fizike, edhe jashtë?` |
| 8 | 11.0 s | `[energetic] Me QR apo me kartë?` |
| 9 | 13.0 s | `[energetic] Cash në çdo ATM?` |
| 10 | 15.0 s | `[whispering, playful] Para shokut… në mesnatë?` |
| 11 | 17.0 s | `[energetic] Transferta me RIA?` |
| 12 | 19.0 s | `[energetic] Cashback?` |
| 13 | 21.0 s | `[excited] Edhe më shumë?` |
| 14 | 24.2 s | `[warm, confident] epara.` |
| 15 | 24.8 s | `[smiling, proud] Më mirë se para!` |
| 16 | 25.7 s | `[friendly] Shkarko falas.` |

"PO!" (separately, 3 takes, so it isn't the same every time):

```
[shouting, excited] Po!
```
```
[enthusiastic, big smile] Po!
```
```
[shouting, triumphant, very loud] PO!
```

The last, biggest "PO!" goes at 22.5 s; the others at 6, 8, 10, 12, 14, 16, 18, 20 s.

Settings: Stability ~40–50 % (more life), Similarity ~75 %, Style ~30 %, speed 1.05–1.1.

---

## 4. Full voice-over in ONE generation (single take)

Use when you want one consistent performance; I cut it into lines and place each on its beat.
Model: Eleven v3 or newer. Settings: Stability 40–50 %, Similarity ~75 %, Style ~30–40 %, speed ~1.05.

```
[tired, sighing] Prapë në radhë në bankë?
[annoyed] Dhe dega mbyllet në tre…
[short pause]
[confident, punchy] Jo më!
[excited, smiling] Me epara, gjithçka në telefon.
[short pause]
[energetic, fast] Llogari pa degë? [shouting, excited] Po!
[energetic, fast] Kartë virtuale, menjëherë? [shouting, excited] Po!
[energetic, fast] Kartë fizike, edhe jashtë? [shouting, excited] Po!
[energetic, fast] Me QR apo me kartë? [shouting, excited] Po!
[energetic, fast] Cash në çdo ATM? [shouting, excited] Po!
[whispering, playful] Para shokut… në mesnatë? [whispering, excited] Po!
[energetic, fast] Transferta me RIA? [shouting, excited] Po!
[energetic, fast] Cashback? [shouting, excited] Po!
[excited, building up] Edhe më shumë?
[shouting, triumphant, very loud] PO!
[long pause]
[warm, confident] epara.
[smiling, proud] Më mirë se para!
[friendly, upbeat] Shkarko falas.
```

If "epara" is mispronounced, write it as "e-pára" in the voice text only.

## 5. Music received: "Four Eras One Rescue" (2026-11-15 analysis)

- 112 s, 48 kHz stereo, −13.3 LUFS, peak −0.1 dBFS.
- Tempo ≈ 161.5 BPM (beat 0.3715 s; may read as ~81 BPM half-time), NOT 120 → the current picture grid does not line up with it.
- Shape: steady driving section 0–58 s; change/breakdown 58–80 s; near-silences around 84–88 s and 96–100 s; ending 100–108 s.
- Plan: pick a ~27–30 s excerpt and retime `src/beats.json` to the track's own beat grid (items every 6 beats ≈ 2.23 s, stamps on beats), instead of cutting the music to 120 BPM.

## 6. Pronunciation fixes (after take 1, 2026-11-15)

Take 1 (`audio/vo/take1_v4_s46_sim75.mp3`, 30.4 s, clean pauses between lines) had two errors:
- **QR** must be said "kju-ar" → write `kju-ar` in the voice text.
- **epara** is "e" + "para" (like e-money: e-para), not one run-together word → write `e-para` in the voice text.

Corrected single-take prompt:

```
[tired, sighing] Prapë në radhë në bankë?
[annoyed] Dhe dega mbyllet në tre…
[short pause]
[confident, punchy] Jo më!
[excited, smiling] Me e-para, gjithçka në telefon.
[short pause]
[energetic, fast] Llogari pa degë? [shouting, excited] Po!
[energetic, fast] Kartë virtuale, menjëherë? [shouting, excited] Po!
[energetic, fast] Kartë fizike, edhe jashtë? [shouting, excited] Po!
[energetic, fast] Me kju-ar apo me kartë? [shouting, excited] Po!
[energetic, fast] Cash në çdo ATM? [shouting, excited] Po!
[whispering, playful] Para shokut… në mesnatë? [whispering, excited] Po!
[energetic, fast] Transferta me RIA? [shouting, excited] Po!
[energetic, fast] Cashback? [shouting, excited] Po!
[excited, building up] Edhe më shumë?
[shouting, triumphant, very loud] PO!
[long pause]
[warm, confident] e-para.
[smiling, proud] Më mirë se para!
[friendly, upbeat] Shkarko falas.
```

Permanent fix: in ElevenLabs add a Pronunciation Dictionary with alias rules `epara → e-para` and `QR → kju-ar`, then the normal spelling can stay in scripts.

## 7. FINAL script — brand name never spoken (user decision 2026-11-16)

The user does not want "epara" / "Më mirë se para" spoken at all (TTS stress keeps coming out wrong; correct stress is e-pa-RÁ, like Turkish "para"). Brand + tagline stay on screen only.

```
[tired, sighing] Prapë në radhë në bankë?
[annoyed] Dhe dega mbyllet në tre…
[short pause]
[confident, punchy] Jo më!
[excited, smiling] Tani gjithçka është në telefon.
[short pause]
[energetic, fast] Llogari pa degë? [shouting, excited] Po!
[energetic, fast] Kartë virtuale, menjëherë? [shouting, excited] Po!
[energetic, fast] Kartë fizike, edhe jashtë? [shouting, excited] Po!
[energetic, fast] Me kju-ar apo me kartë? [shouting, excited] Po!
[energetic, fast] Cash në çdo ATM? [shouting, excited] Po!
[whispering, playful] Para shokut… në mesnatë? [whispering, excited] Po!
[energetic, fast] Transferta me RIA? [shouting, excited] Po!
[energetic, fast] Cashback? [shouting, excited] Po!
[excited, building up] Edhe më shumë?
[shouting, triumphant, very loud] PO!
[long pause]
[warm, confident] Gjithçka në një aplikacion.
[friendly, upbeat] Shkarko falas.
```
