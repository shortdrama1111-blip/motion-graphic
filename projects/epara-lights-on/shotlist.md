# epara — "Qyteti ndizet" (Lights On method) — shot list + prompts

Test of the photoreal-hybrid method [ref: Tinder "Lights On" prompt v4]. 9:16 (1080×1920), 30 fps, ~18 s + end card.
**The user generates the AI shots (Seedance / Higgsfield). Claude does everything else in code + Blender (bpy), 0 credits.**

## The idea (about epara)
You pay or send money with epara, and the tower across the street answers: its windows switch on in the exact shape of the
epara mark (the waving card + drop), in the brand gradient (coral #F04E45 → magenta #C8007B → purple #5B2A9B → blue #0072BC).
Then a flight over the city at night: every epara moment lights up — a send between two windows in two buildings, a QR payment
in a café, an ATM on the street — tied by ribbons of light, until the whole city glows into the epara mark. Dive back into one
window, one phone: "Ana mori 5,000 ALL · Falas". Lock-up: glass shards assemble the mark → official flat logo, "Më mirë se para!".
The brand name is never spoken (user's rule); the logo and tagline are on screen only.

## Beat map
| # | Time | Picture | Made with |
|---|---|---|---|
| 1a | 0.0–0.4 | Over the shoulder: thumb taps "Dërgo" on the phone, in a dark apartment by the window | **S1 video** + code UI on green screen |
| 1b | 0.4–1.6 | A bolt of gradient light flies from the phone through the glass and hits the tower; its windows light up in the epara mark shape and push out in 3D, settle back lit | **P1 + P2 stills** + code relight + projective 3D |
| 2 | 1.6–4.6 | Two towers at night: window A lights (send), a ribbon arcs behind a tower edge to window B in another building (receive), both flash | **P3 still** + code ribbons/relight |
| 3 | 4.6–8.0 | Fast low skim over the city: windows, a café QR payment, an ATM on the street light up on the beat, tied by ribbons | **S2 video** (start+end frames) + code |
| 4 | 8.0–11.0 | DROP: the whole city glows into the epara mark; lit windows peel off as glass panes and lock into an extruded 3D mark. Super: "Mijëra dyqane · 140+ ATM · 24/7" | **P4 still** + code relight + Blender |
| 5 | 11.0–12.6 | FPV dive between towers straight into one window glowing in the brand gradient | **S3 video** (start+end = P5, P6) |
| 6 | 12.6–14.2 | Back on the phone: notification "Ana mori 5,000 ALL · Falas", "Paguar ✓" | code UI over **S1** (or P7) |
| 7 | 14.2–17.0 | Glass shards assemble the extruded mark, turn to camera, become the official flat logo; "Më mirë se para!" + "Shkarko falas" | Blender + code |
| EC | 17.0–18.5 | End card | code |

## Stills to generate (image model, 9:16, highest quality, no text/logos)

### P1 — Hook plate: the tower across the street
```
Photorealistic vertical night photograph taken from inside a dark high-rise apartment in Tirana, Albania, looking straight out through a floor-to-ceiling glass window. About 120 metres away stands a very tall, broad modern residential tower seen perfectly straight-on, its flat facade parallel to the camera, filling the middle 70 percent of the frame width. Its flat roof line is at about 20 percent of the frame height, dark navy night sky above. From the roof down to the bottom of the window we see at least 45 floors. The facade is an extremely dense, uniform grid of SMALL individual apartment windows: about 30 small windows per floor, each a tiny separate rectangle with its own curtains, thin dark mullions, thin pale floor slabs, no balconies, no large pilasters. Almost every window is dark with faint dim interiors; only 8 scattered tiny rooms glow warm amber. We are level with the upper floors, so the verticals are straight. Far below, a street with soft red and white car light trails. Foreground: the apartment interior is nearly black, a thin black window frame at the far left edge, faint reflections of the dark room on the glass. Full-frame camera, 50 mm lens, f/2.8, natural night exposure, subtle halation, fine film grain. No people, no hands, no phone, no text, no logos, no signs, no neon.
```
The dense, regular window grid is essential: a coarse grid makes a blocky logo.

### P2 — The same plate with ALL windows lit (edit of P1, P1 as reference)
```
Edit the reference photo. Keep the image pixel-identical in framing, camera position, building geometry, window grid, sky, street and the dark apartment foreground. The ONLY change: every single window of the large residential tower is now lit from inside, as real occupied apartments at night: warm lamp light, visible curtains, lampshades, ceiling lights and room interiors, each window slightly different (warm white, soft amber, a few cooler), all clearly lit and bright. The floor slabs and mullions stay the same. No text, no logos, no people.
```
The logo is NOT generated: I light the real rooms from P2 inside the official epara mark, in the brand gradient.

### P3 — Two towers (the send / receive)
```
Photorealistic vertical night photograph of two modern residential towers in Tirana, Albania, seen from street level across a wide boulevard, slightly looking up. The near tower on the left is closer and larger, its right edge crossing the middle of the frame; the second tower stands further back on the right. Both facades are dense regular grids of small apartment windows, mostly dark with a few scattered warm lit rooms. Between them, deep blue-black night sky with a thin haze. At the bottom, a few street lights and soft car light trails. 35 mm lens, f/2.8, realistic night exposure, fine film grain, slight halation. No text, no logos, no signs, no neon, no people.
```

### P4 — The city from above (for the city-wide logo)
```
Real night drone photograph, slightly underexposed, from about 350 metres above Tirana, Albania, high oblique view looking forward and down about 40 degrees. A dense city grid fills the frame: a mix of modern glass towers and colourful painted 1990s apartment blocks, wide boulevards as glowing lines of warm sodium and white LED street lights, thousands of small lit windows, a few parks as dark patches. Mountains as a faint dark silhouette on the horizon under a blue-black sky, thin haze over the city. Real lens, slight vignette, fine sensor grain, natural contrast. No text, no signs, no logos, no recognisable landmarks, no aircraft parts, no people.
```

### P5 — Dive START (references: P4 for colour/haze)
```
Real night drone photograph from about 250 metres above a cluster of 25–35 storey residential towers in Tirana, Albania, high oblique view looking forward and down about 35 degrees. In this one district many lit rooms and the street lights glow a soft pink-magenta (#C8007B) warming to coral-orange (#F04E45) on one side and cooling to blue (#0072BC) on the other, as if the district is lit in a gradient. Around it a flat grid of dim amber street lights fading into haze, blue-black sky, real lens, fine sensor grain. Use the references only for colour, haze and window style, not composition. No text, no signs, no logos, no landmarks, no people.
```

### P6 — Dive END (reference: P5)
```
Real night photograph from a drone hovering about 6 metres outside one of the residential towers in the reference image: the facade fills the frame, a grid of dark floor-to-ceiling windows with thin mullions, a few neighbouring rooms warmly lit. Dead centre: ONE window, larger than the others because it is closest; behind it a dim apartment room at night with a warm lamp and a soft magenta-to-purple glow from a phone screen lighting the room; faint reflections of the city lights on the glass. Same colour, haze and lens as the reference, slight motion blur at the frame edges, fine sensor grain. No people visible, no text, no logos.
```

### P7 (optional) — Hand + phone, green screen (if S1 doesn't work as video)
```
Photorealistic over-the-shoulder night photograph inside a dark apartment: a young person's hand holds a modern smartphone in the lower half of the frame, thumb resting on the screen, a floor-to-ceiling window behind looking at a city of lit towers, softly out of focus. The phone screen is a plain, perfectly flat solid green (#00FF00), evenly lit, filling the whole screen. Warm low light, 35 mm, f/2, fine grain. No text, no logos, no visible face.
```

## Videos to generate (Seedance, 9:16, 1080p, no audio)

### S1 — The tap (start frame = P7 if you made it, otherwise text-only), ~3 s
```
Real handheld night footage, over the shoulder inside a dark apartment: a hand holds a smartphone whose screen is a plain solid bright green, the thumb taps the lower middle of the screen once, firmly, then rests. Behind, a floor-to-ceiling window with a city of lit towers softly out of focus. Subtle natural hand movement, stable framing, real lens, fine grain. The phone and hand stay rigid and realistic, no morphing, no text, no logos.
```
The green screen is for me: I put the epara app UI into it.

### S2 — The skim (start = last frame of shot 2 / P3, end = P4), 4 s
```
Real night FPV drone footage, one continuous shot, no cuts, from the start frame to the end frame. The drone rises past the two towers, then dives fast toward a dense city grid of warm street lights and skims very fast and low, about 30 metres above flat rooftops of apartment blocks, streets and lit windows streaming past underneath, a café with warm light and a street corner with a glowing cash machine passing below, a slight bank to the right, heavy natural motion blur, then eases off and pitches up to the wide view of the end frame. Photoreal night, warm sodium and white LED lights, black sky, buildings rigid and straight, no morphing, no text, no logos.
```

### S3 — The dive (start = P5, end = P6), 4 s
```
Real night FPV drone footage, one continuous very fast dive, no cuts. The camera starts high above the cluster of towers glowing in pink, coral and blue, plunges steeply forward and down through a thin layer of coloured haze, swoops between two towers with streaks of car light trails far below, then levels out and rushes straight at one single apartment window with a magenta-purple glow inside; the window grows quickly until its glass fills the frame. Heavy natural motion blur, stable horizon, real lens, the towers stay rigid and straight, no morphing, no text, no logos.
```

## Stock alternative (0 credits)
Shots 2 and 3 can also come from free stock night footage (Pexels: "city night drone", "apartment towers night") if the AI versions don't convince; P1/P2 must be AI or a real photo of a tower with a dense window grid (+ its lit twin).

## What I build in code (0 credits)
- Relight: epara mark lit into the real rooms of P2 (gradient, switching on bottom-up in 3 frames); window pairs + ribbons; city-wide mark on P4.
- Projective 3D: plates on proxy planes for real parallax (hook, barrel roll, lens passes).
- Blender (bpy, Cycles CPU): ~800 glass panes with real thickness that peel off and lock into the extruded epara mark; lock-up shards → official flat logo.
- UI on the phone (green screen), supers, end card, SFX, VO cut + mix (−14 LUFS).

## Voice-over (Eleven v4, same voice as the reel; brand name never spoken)
```
[confident, playful] Një prekje… [energetic] dhe qyteti ndizet.
[playful] Ti dërgon, ajo merr. Menjëherë.
[energetic] Një kafe me kju-ar. Cash në çdo ATM. Ditë e natë.
[building up] Derisa i gjithë qyteti flet të njëjtën gjuhë.
[short pause]
[warm, smiling] Gjithçka në një aplikacion.
[friendly, upbeat] Shkarko falas.
```
Generate first; I time the whole picture to it (voice-first).
