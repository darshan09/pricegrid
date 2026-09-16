# Hyperframes Composition Brief: pricegrid

## Objective
Create a short launch-style brag video for pricegrid, a spatial-grid reinvention of the trading ladder.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 19 seconds

## Source Material
- Project root: `/home/user/pricegrid`
- Primary files read: `README.md`, `frontend/src/App.js`, `frontend/src/components/PriceGrid.jsx`, `frontend/src/components/PriceBlock.jsx`, `frontend/src/components/ControlPanel.jsx`, `frontend/src/components/TradeLog.jsx`, `frontend/src/index.css`, `docs/screenshot-grid.png`, `docs/screenshot-squareoff.png`
- Product name: pricegrid
- Tagline / strongest claim: "instead of a scrolling list of price levels, pricegrid displays prices as a spatial grid of tappable blocks"
- Key UI or visual moment to recreate: the PriceBlock's three real states — idle (dark card), ARMED (lime pulsing glow ring), EXECUTED (green/red glow with live P&L) — and the "Square Off All Positions?" confirmation dialog with a real total P&L line.
- Copy that must appear verbatim:
  - "FORGET THE LADDER."
  - "ARM A LEVEL."
  - "IT EXECUTES ITSELF."
  - "SQUARE OFF, INSTANTLY."
  - "Square Off All Positions?"
  - "pricegrid"
  - "An open trading UI experiment."
  - "Tap it. Break it. Fork it."

## Creative Direction
- Tone preset: cinematic
- Creative direction: a trading terminal built for a cyberpunk heist film — dark, glowing, high-stakes, but never silly.
- Interpretation: wide, confident holds on the grid; big slammed-in type that then settles; dramatic glow/light as the emotional driver; deliberate wipes/crossfades over chaotic cuts.
- Angle: The order book has looked the same for thirty years — a scrolling column of numbers. pricegrid turns it into a grid you tap like a board game: arm a square, watch the market walk into it, get filled automatically. Let the neon-on-void visual identity and the pulsing ARMED/EXECUTED states do the selling.
- Hook: hard cut from black into the grid of price blocks assembling in a staggered wave, then "FORGET THE LADDER." slams in.
- Outro / punchline: "pricegrid" title card, "An open trading UI experiment.", then "Tap it. Break it. Fork it."
- Avoid:
  - Generic SaaS language
  - Abstract filler visuals
  - Unrelated visual redesign — match the real app's palette, type, and block states exactly

## Visual Identity
- Background: `#0A0510` (void), card surfaces `#120A14`, grid borders `#3D2840`
- Text: `#FFFFFF` primary; functional color per state (lime/pink/green/red)
- Accent: `#E0FF66` (neon lime — armed/positive), `#F555A2` (neon pink — labels/secondary/negative)
- Display font: Manrope (bold, tight tracking) — fall back to a shipped local equivalent if Manrope isn't available as a local font file (see font-face rule in hyperframes-core)
- Body/numeric font: JetBrains Mono — used for all price/P&L/numeric readouts
- Visual references from the project: `PriceBlock.jsx` state styles (idle/armed/executed glow classes), `ControlPanel.jsx` header layout (NIFTY price, ARMED/OPEN/P&L/MODE stats, BUY/SELL toggle, Cancel All/Exit All buttons), the "Square Off All Positions?" `ConfirmDialog`, `docs/screenshot-grid.png` and `docs/screenshot-squareoff.png` as ground truth for layout and color.

## Storyboard
Use the storyboard in `brag-output/brag-plan.md` as the creative contract.

Scene summary:
1. Grid Assembly (Hook) — 3s — dozens of idle price blocks assemble in a staggered wave against the void; "FORGET THE LADDER." slams in and holds.
2. Arm a Level — 4s — cursor taps one block; it flips to the ARMED lime pulsing-glow state; "ARM A LEVEL." holds in the lower third.
3. It Executes Itself — 4s — price ticks toward the armed block; it flips to EXECUTED (green glow) with P&L counting up in mono type; "IT EXECUTES ITSELF." holds.
4. Square Off, Instantly — 4s — grid dims, the real "Square Off All Positions?" dialog drops in with a live total P&L line in lime; "Yes, Square Off All" is tapped; "SQUARE OFF, INSTANTLY." holds.
5. Outro / Punchline — 4s — clean dark card: "pricegrid" title, "An open trading UI experiment." tagline, then "Tap it. Break it. Fork it." closing line.

## Audio
- Audio role: cinematic support — driving-but-restrained bed, swells under the two execution beats
- Audio arc: low presence under the hook → building through the arm beat → peak presence across execute + square-off → gentle fade under the outro card
- Music: `happy-beats-business-moves-vol-11-by-ende-dot-app.mp3` (114.84 BPM, bundled)
- Music treatment: start low, build into scene 2, hold fuller through scenes 3-4, fade out across scene 5, ending near silence on the last frame
- Music cue guidance: bundled preset (`skills/brag/assets/music/cues/happy-beats-business-moves-vol-11-by-ende-dot-app.music-cues.md`). Strong cues in the 0-19s window: 1.60s, 3.70s, 5.80s, 6.34s, 8.96s, 9.50s, 12.65s, 17.91s. Suggested locks (optional, only if they don't hurt readability): hook slam near 1.60-3.70s, arm-tap glow near 6.34s, execute flip near 8.96-9.50s, square-off dialog drop near 12.65s. No dense sequential text reveal in this storyboard, so no beat-grid list-timing is required — single-item accents only.
- Audio-reactive treatment: subtle — ARMED pulse glow and EXECUTED flash may breathe slightly with RMS/beat energy, but each block's own state-driven glow stays the primary motion source
- Audio-coupled moments:
  - Scene 2 (arm tap) — tap/click SFX exactly on cursor contact, glow-breathing loop begins right after
  - Scene 3 (execute flip) — sharper confirm/chime SFX exactly on the flip to EXECUTED, quiet count-up ticks under the P&L number
  - Scene 4 (dialog drop / confirm tap) — soft UI-drop SFX on dialog entrance, lighter confirm tick on the "Yes, Square Off All" tap
- SFX selection guidance: one distinct, motion-matched sound per state change; never layered/dense; choose exact files from the bundled SFX set after the animation exists
- SFX analysis guidance: use `skills/brag/assets/sfx/sfx-analysis.md` (or the hyperframes-installed equivalent) for selection; prefer lower high-frequency-risk sounds since several cues repeat/are polished moments
- Exact SFX choice: Hyperframes chooses filenames, timestamps, density, and volume based on the implemented animation
- Audio files: copy `happy-beats-business-moves-vol-11-by-ende-dot-app.mp3` and any selected SFX into `brag-output/composition/assets/`

## Hyperframes Instructions
Load `hyperframes-core`, `hyperframes-animation`, `hyperframes-creative`, `hyperframes-keyframes`, `hyperframes-cli` and build the composition per their current conventions — this brief is source material and creative direction, not implementation instructions.

Requirements:
- Show the real PriceBlock states and the real Square Off confirmation copy/layout — this is the product's signature visual, not an abstraction of it.
- Keep all text readable in the final render (respect the reading-time floors from `brag-plan.md`).
- Keep total duration within 15-25 seconds (target ~19s).
- Include the planned music/SFX layer.
- Treat cue metadata as optional hints; ignore any that hurt readability or pacing.
- Wire at least one visual element to audio-reactive data (subtle), or document why extraction was skipped.
- Run `npx hyperframes check` before render — the single gate.
