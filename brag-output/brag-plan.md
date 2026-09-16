# Brag Plan: pricegrid

## What is this app?
pricegrid replaces the scrolling trading ladder with a spatial grid of tappable price blocks — tap a block to arm a level, and it executes itself the instant price hits it, no order form required.

## The angle
The order book has looked the same for thirty years: a scrolling column of numbers. pricegrid throws that out and turns it into a grid you tap like a board game — arm a square, watch the market walk into it, get filled automatically. The video's premise: "the trading ladder just got a glow-up." Let the neon-on-void visual identity and the pulsing ARMED state do the selling — this is a UI that looks like nothing else in trading software.

## Hook (first 2-3 seconds)
Hard cut into total black, then the grid of price blocks snaps into formation — dozens of dark cards assembling into a spatial grid, each stamped with a live-looking price. Big type slams in: "FORGET THE LADDER." The grid is the hook; the line is the dare.

## Key moments (the middle)
- A cursor taps a block. It flips into the ARMED state: lime-green border, pulsing glow ring, the block breathing light. Label: "ARM A LEVEL."
- Price ticks toward it and the block flips to EXECUTED — hard color-coded glow (green for profit), live P&L climbing in mono type inside the block itself. Label: "IT EXECUTES ITSELF."
- "Exit All" is tapped; the Square Off confirmation dialog drops in over the dimmed grid, showing the real total P&L line ("+₹111.63") in lime. Label: "SQUARE OFF, INSTANTLY."

## Outro / punchline
The grid fades to a clean dark card. "pricegrid" in bold display type, tagline underneath, then the line lands: "An open trading UI experiment. Tap it. Break it. Fork it." — playful nod to it being open source and unproven by design.

## User flow worth showing
The centerpiece is the real arm → execute → square-off flow, not just the landing page:
1. Entry: idle grid of price blocks around the live price.
2. Key action: tap a block to arm it (pulsing lime), price moves, block auto-executes with live color-coded P&L.
3. Result: "Exit All" triggers the Square Off confirmation showing total realized P&L, then confirms.

## Tone
- Preset: cinematic
- Creative direction: a trading terminal built for a cyberpunk heist film — dark, glowing, high-stakes, but never silly.
- Interpretation: wide, confident holds on the grid; big slammed-in type that then settles; dramatic glow/light as the emotional driver rather than jokes; transitions are deliberate wipes/crossfades, not chaotic cuts. Restraint sells the "premium fintech" read even though the product is an experiment.

## Format: landscape — 1920x1080
## Duration: 19s

## Visual identity (from the project)
- Background: `#0A0510` (dark void), card surfaces `#120A14`, grid borders `#3D2840`
- Accent: `#E0FF66` (neon lime — armed/positive state), `#F555A2` (neon pink — labels, secondary accent, negative delta)
- Text: `#FFFFFF` primary, with lime/pink/green/red used functionally per block state
- Display font: Manrope (bold, tight tracking, used for headline/price type)
- Body/data font: JetBrains Mono (used for all price, P&L, and numeric readouts — keep numbers in mono in the video for authenticity)
- Strongest visual element: the ARMED block's pulsing lime glow ring (`box-shadow` breathing animation) and the EXECUTED block's green/red glow with live P&L — this is the product's signature visual and should anchor scenes 2 and 3.

## Share copy (draft)
Trading ladders just got a glow-up. Tap a block, arm a level, watch it execute — pricegrid turns the order book into a grid you can actually feel. Open source, experimental, and looking for your feedback.

## Audio direction
- Role: cinematic support — a driving-but-restrained bed that swells under the two execution beats, never a wall of sound
- Music: `happy-beats-business-moves-vol-11-by-ende-dot-app.mp3` (114.84 BPM) — bundled track, best balance of drive and headroom for a cinematic edit at this tempo
- Music treatment: start at low presence under the hook, build presence into the arm/execute beats (scenes 2-3), hold at fuller presence through the square-off reveal, gentle fade under the outro card
- Music cue guidance: preset read from bundled cues. Strong cues in window: 1.60s, 3.70s, 5.80s, 6.34s, 8.96s, 9.50s, 12.65s, 17.91s. Target the hook slam near 1.60s–3.70s, the arm-tap glow-in near 6.34s–6.86s, the execute flip near 8.96s–9.50s, and the square-off dialog drop near 12.65s. No dense sequential reveal in this storyboard (single-item beats, not lists), so no beat-grid list-timing needed — align single accents to the nearest strong cue only when it doesn't cost readability.
- Audio-reactive treatment: subtle — the ARMED pulse glow and EXECUTED flash may breathe slightly with the music's beat/RMS, but the grid's own state-driven glow stays the primary motion source, not the audio
- SFX posture: moderate — one distinct sound per state change (tap-to-arm, execute flip, dialog confirm), always motion-matched, never layered/dense
- Audio-coupled moments: tap-to-arm click on the cursor tap in scene 2; a sharper confirm/chime on the execute flip in scene 3; a soft UI-drop sound on the dialog appearing in scene 4
- Restraint rule: never let music or SFX outrun the visual — every state-change sound follows its block's animation, not the beat grid; no dense/chaotic layering; the cinematic mood stays controlled, not busy

## Storyboard

### Scene 1 — Grid Assembly (Hook) — 3s
Hard cut from black. Dozens of dark price-block cards (the grid's idle state: `#120A14` fill, `#3D2840` border) snap/assemble into the spatial grid formation against the `#0A0510` void, each showing a real-looking NIFTY price and small delta readout in JetBrains Mono. As the grid settles, "FORGET THE LADDER." slams in, in Manrope bold, then holds.
Sequential/interaction: yes — the grid blocks assemble in a quick staggered wave (not one-by-one readable text, just a motion wave of cards locking into place) rather than popping in all at once.
Audio intent: low, tense presence building — the promise of something about to move.
Audio-coupled idea: the card-assembly wave ticks softly in time with the beat grid; the hook line slam lands on/near a strong cue (~1.60s–3.70s window).
Music: cinematic bed, low presence, building.
Transition mood: dramatic wipe → Scene 2

### Scene 2 — Arm a Level — 4s
Tight shot on the grid. A cursor moves to one idle block and taps it. The block flips into the ARMED state: lime `#E0FF66` border and fill wash, the signature pulsing glow ring breathing outward, an "ARMED" micro-label ticking at the block's base. Label text "ARM A LEVEL." holds in the lower third.
Sequential/interaction: yes — simulate the single tap-to-arm interaction explicitly (cursor approach → tap → state flip → pulse begins).
Audio intent: anticipation snapping into confirmation — the tap should feel decisive.
Audio-coupled idea: a distinct tap/click SFX exactly on cursor contact, then the lime glow's breathing loop begins right after.
Music: bed presence rising into this beat; tap aligned near the ~6.34s strong cue if it doesn't cost the read on "ARM A LEVEL."
Transition mood: clean wipe → Scene 3

### Scene 3 — It Executes Itself — 4s
Same grid, price ticks toward the armed block (subtle price-readout movement in the header/chart area is fine as background motion). The armed block flips to EXECUTED: hard green glow (`shadow` per the app's real executed styling), live P&L number counting up inside the block in mono type. Label "IT EXECUTES ITSELF." holds alongside.
Sequential/interaction: yes — the P&L number counts up rather than snapping to its final value, reinforcing "live."
Audio intent: payoff — a satisfying, confident confirm.
Audio-coupled idea: a sharper confirm/chime SFX exactly on the flip to EXECUTED, count-up ticks softly underneath.
Music: fuller presence, the video's energetic peak; flip aligned near the ~8.96s–9.50s strong cues.
Transition mood: hard cut → Scene 4

### Scene 4 — Square Off, Instantly — 4s
Wide shot of the full grid, now dimmed slightly, as the Square Off confirmation dialog drops in center-frame — matching the real UI: "$ Square Off All Positions?" with the actual total P&L line rendered in lime (e.g. "+₹111.63"). The "Yes, Square Off All" button is tapped. Label "SQUARE OFF, INSTANTLY." appears with the dialog.
Sequential/interaction: yes — simulate the tap on "Yes, Square Off All" as the closing action of this scene.
Audio intent: a clean, final confirmation — the deal closing.
Audio-coupled idea: soft UI-drop SFX as the dialog appears; a lighter close/confirm tick on the button tap; music pulls back slightly right after, cueing the outro.
Music: peak presence at the dialog drop (near the ~12.65s strong cue), then beginning to pull back.
Transition mood: soft crossfade → Scene 5

### Scene 5 — Outro / Punchline — 4s
Cut to a clean dark card (`#0A0510`/`#120A14`). "pricegrid" in bold Manrope display type, with the tagline beneath: "An open trading UI experiment." held together, then the final line replaces/adds beneath: "Tap it. Break it. Fork it."
Sequential/interaction: none — two grouped text beats, not a list.
Audio intent: the music settles and fades, ending on the line rather than over it.
Audio-coupled idea: none required; a single soft closing tone on the final line is optional and should stay quiet.
Music: gentle fade out through the scene, ending near silence on the last frame.
Transition mood: soft crossfade → end

**Music mood for this video:** cinematic — controlled, driving, restrained until the execution/square-off beats, then a deliberate fade.
**Audio summary:** A low, tense cinematic bed builds through the grid assembly and arm beat, peaks across the execute and square-off moments with tight motion-matched SFX on every state change, then pulls back and fades under the outro card — never dense, always following the visual.
