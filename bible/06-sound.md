# 06 — Sound

> Status: PARTIAL — method-level rules filled; house-specific values still open.

- Music genre / energy / BPM range:
- SFX palette (whooshes, pops, clicks, risers, impacts):
- Hit points (what gets a sound):
- Voiceover style:
- Loudness target (e.g. -14 LUFS for social):

## Rules from references
- **Every visible move has a sound** (WhatsApp ad: 95 cues in 24 s). Tie sounds to the brand: ticks/bleeps for a messenger, alert chime for payments.
- Music: cut on the song's own downbeats with 15 ms crossfades; leave out the vocal stem. Or write the score in code (chords, pads, arp, sidechain) so it fits exactly.
- Duck music −10 to −11 dB under every word (voice envelope, 250 ms smoothing); carve 0.9–4.2 kHz while voice speaks. **Voice ≥12–15 dB above music in 1–4 kHz**, measured.
- Risers cut ~70 ms before the hit so nothing touches it. Never start the film in silence — a faint low boom + air at 0.06 s.
- Sonic logo = the brand's own sound resolved (e.g. the alert chime as C5–F5, then A5).
- Counters: one keystroke per digit change, rate follows the ease, alternating L/R; a "receive" tick when the count lands. Pan cues by x position.
- **Master:** −14 LUFS integrated, true peak ≤ −1 dBTP (oversampled limiter), 4 ms fade-in; re-measure after AAC encode. Voice bus ≈ −16 LUFS.
