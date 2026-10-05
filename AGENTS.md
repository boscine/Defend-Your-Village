# Project: Defend Your Village

Angular 17 + Canvas 2D action-defense game. Player is an Enchantress defending a
village from waves of skeletons across three scrolling maps.

## Tech Stack

- Angular 17 (standalone components, esbuild builder), TypeScript 5.2 `strict: true`
- Canvas 2D API — **no game engine, no Phaser/Pixi**
- Web Audio API for procedurally generated SFX; one `<audio>` element for BGM
- Karma + Jasmine installed but **no spec files exist** (see Boundaries)
- Deployed to Netlify: build `npm run build`, publish `dist/dyv`

## Commands

| Task | Command |
| --- | --- |
| Dev server | `npm start` (http://localhost:4200) |
| Production build | `npm run build` |
| Type check only | `npx tsc --noEmit -p tsconfig.app.json` |
| Tests | `npm test` — **no specs exist, nothing runs** |

`npx tsc --noEmit -p tsconfig.app.json` is the fastest correctness gate available.
It is clean on `HEAD` plus the working-tree `game.renderer.ts` change. Run it before
claiming a change type-checks.

If `npm run build` fails with `EPERM: operation not permitted, unlink 'dist/dyv/...'`,
a previous build output is locked. Fix: `Remove-Item -Recurse -Force dist` then
rebuild. This is expected on Windows after a dev server or stale build.

## Architecture

Everything lives under `src/app/game/`. `GameComponent` owns the loop and all input;
everything else is a plain class, not injectable.

```
game.component.ts   ~463  Angular shell: rAF loop, asset preload, keyboard/mouse/touch input
game.logic.ts       ~475  All game state + simulation. No rendering, no DOM.
game.renderer.ts   ~1094  All drawing. Receives GameLogic as `state: any`, mutates nothing.
game.sound.ts       ~157  SoundManager: Web Audio tones + BGM element
game.types.ts        ~95  GameState enum, interfaces, COLORS palette
```

Line counts are approximate and drift as features land. Read the file; do not
trust these numbers.

Data flow is one-directional per frame:

```
input handler -> mutates flags on GameLogic
              -> logic.update(timestamp)
              -> renderer.draw(logic, images, attackImages)
```

`GameState` (in `game.types.ts`) is the screen router: `LOADING -> START_OVERLAY ->
MENU -> CONTROLS | SETTINGS -> PLAYING -> GAMEOVER`. Every screen draw call and every
input handler branches on it. Adding a screen means touching the enum, the `draw()`
if-chain in `game.renderer.ts`, and `processCanvasInteraction` in `game.component.ts`.

`GameLogic` is a god object with ~77 public fields. Read the field block at the top
of `game.logic.ts` before touching simulation code; it documents nearly everything.

### Conventions

- TypeScript, 2-space indent, semicolons, single quotes in imports, double quotes
  in string literals. No Prettier/ESLint config exists — match the surrounding file.
- `public` prefix on class fields is used consistently and deliberately. Keep it.
- Simulation methods in `game.logic.ts` are often single-line `if (x) doThing();`
  chains (see `movePlayerLeft`). This is existing style, not an accident.
- Palette comes from `COLORS` in `game.types.ts`. Do not inline new hex values
  without adding them there first. Note the renderer already carries ~16 hardcoded
  hex values outside `COLORS` (damage numbers, accents, loading screen), so this
  rule is aspirational in practice, not enforced. Match the surrounding drawing
  code rather than doing a cleanup mid-feature.
- Canvas is a fixed 1000x400 logical resolution, scaled by CSS (`pixelated`).
  All gameplay math assumes those coordinates.
- Menu/settings UI is drawn on canvas with hand-positioned `Button` objects
  (`{x, y, width, height, hover}`). The game-over overlay
  (`game.component.html:104`) uses Angular template markup. Follow whichever the
  surrounding screen already does; do not mix within one screen.
- Fonts: `Orbitron` (headings/HUD) and `Silkscreen` (small text), loaded from
  Google Fonts in `src/index.html`.
- Performance fixes are numbered in comments, currently through `(Fix #15)`.
  Continue that numbering when adding optimizations. `PERF.md` documents the
  measurement harness, the resolved bottlenecks, and the rejected hypotheses —
  read it before any perf work so you do not re-investigate per-entity `ctx.filter`.

### Input handling — three parallel paths

Keyboard (`handleKeyDown`/`handleKeyUp`), canvas mouse, and the mobile D-pad
(`onTouchBtn`) each set the same `GameLogic` boolean flags. **All three must stay
in sync.** A new action needs: a key case in both handlers, a case in
`onMobileBtnPress` and `onMobileBtnRelease`, a button in `game.component.html`
with `aria-label`, and a README row.

Touch coordinates are scaled from CSS pixels to canvas pixels in `handleTouchEnd`
(`scaleX`/`scaleY`). Menu buttons only respond correctly because of this.

The MENU screen additionally has a DOM accessibility overlay: `buildMenuA11yLayer()`
creates invisible `<button>` elements positioned in CSS percentages over the
canvas-drawn buttons and routes activation back through `processCanvasInteraction`.
It currently covers only Play / Controls / Settings. Adding a fourth MENU button
means adding an entry to that array too.

### Enemies are parallel arrays

`GameLogic.enemy` is an `EnemyState` of `number[]`/`boolean[]` indexed by
enemies, **not** an array of objects. `enemy.w` and `enemy.h` are scalars (both
20), not arrays. Adding an enemy property means adding an array and initializing
every slot in `spawnEnemies()`. `dummyMap[i]` tracks which of the 3 maps enemy
`i` is on (1 = at the village, 3 = furthest forest); it is separate from `this.map`
(where the player is) and must be checked on its own. `spawnEnemies()` always sets
`dummyMap[i] = 3`, so enemies start in the furthest forest and walk inward.

`clearEnemies()` iterates `Object.keys(this.enemy)` and splices every array-valued
key, so it does **not** need manual updating when you add an array — but
`spawnEnemies()` does, and a slot left uninitialized reads as `undefined`, which is
falsy and silently passes `if (enemy.enemydeath[i])`-style guards. `playerattack_death`,
`blinking`, and `flash` are currently never assigned in `spawnEnemies()` at all.

### Accessibility — reality check

`GameLogic.accessibility` has four boolean flags plus `screenReaderText` (a string
initialized to `''` and read nowhere). Of the four flags, only two are wired up:

| Flag | Read by rendering code? | Where |
| --- | --- | --- |
| `lowEndMode` | yes | 7 gates in `game.renderer.ts` — screen shake, shadows, hurt filter, FPS badge |
| `showFps` | yes | `drawFpsBadge`, gated at `game.renderer.ts:883` |
| `highContrast` | **no** | declared in `game.types.ts`, toggled at `game.component.ts:276`, drawn as a settings row, never read |
| `reducedMotion` | **no** | same: declared, toggled at `game.component.ts:277`, drawn as a settings row, never read |

The settings screen shows working toggles for two features that currently do
nothing. Floating text (`createFloatingText` / `updateFloatingTexts`) and title
bobbing run unconditionally. If you touch either, that is the gap to close — wire
the flag in rather than adding a third inert toggle.

Rules for new work:
- Any new visual effect must check `accessibility.lowEndMode` before running.
  There are 7 such gates; that is roughly the expected density.
- Any new on-screen control needs an `aria-label`.
- The FPS counter (`showFps`) exists to catch perf regressions. Check it on mobile
  viewport sizes before calling a change done.

## Boundaries

- **`src/assets/index.js`, `loader.js`, `mainmenu.js`, `index.html`, `index.css`
  are a dead vanilla-JS prototype.** They are not referenced by the Angular app
  (only `src/assets/index.html` links `loader.js`, and nothing links that file).
  The Angular asset glob still copies them into `dist/dyv/assets/`, so they ship
  to Netlify as dead weight. Do not edit them, do not port from them expecting a
  live code path, and do not count their bugs as real. Ask before deleting.
- **No test suite.** `npm test` runs zero specs. Do not claim test coverage, and
  do not add `it.skip` or delete a failing spec instead of fixing it. For a bug
  fix, verify by building and playing; if a regression test is genuinely needed,
  that means setting up the harness first — confirm with the user.
- `angular.json` production budgets are deliberately relaxed to 1mb/5mb (Netlify).
  Do not tighten them.
- Assets are binary PNG/MP3 in git. Do not rename `src/assets/Enchantress/*` or
  `Skeleton/*` — the filenames are hardcoded in `initAssets()` and `game.sound.ts`,
  and the `Attack_*.png`/`Walk.png` spritesheets are frame-indexed by position.
- `dist/`, `node_modules/`, and `.angular/` are untracked because `.gitignore` was
  deleted in commit `6701727`. They show up in `git status`; do not commit them.
  Restoring a `.gitignore` is a separate decision — raise it, don't assume it.
- Never touch `netlify.toml` publish dir or `angular.json` `outputPath` without
  checking both; they must stay `dist/dyv`.

## Gotchas

- `renderer.draw()` takes `state: any`, so renderer changes get **no** type
  checking against `GameLogic`. Rename a logic field and the renderer breaks at
  runtime, not at build time. Grep both sides when renaming.
- `game.component.html:104` compares `logic.gameState === 5` against the raw enum
  ordinal instead of importing `GameState`. Reordering the enum in `game.types.ts`
  silently breaks the game-over overlay. Use the named enum in new template code.
- Sound requires a user gesture. `soundManager.enable()` is called from every
  input entry point for that reason; keep it on any new input path or audio
  silently fails to a `.catch()` log.
- `checkLevel()` uses a 3000ms `setTimeout` to spawn the next wave and flips
  `canLevelUp` to guard re-entry. Timers outlive state changes — a reset during
  that window spawns into a stale `current_level`.
- Animation timing is frame-counter based (`counter % interval`), not
  delta-time based. Changing `fps`/`limit` changes animation speed, not just
  playback rate. Damage and i-frames are keyed to specific frame indices
  (`enemy_Frame === 6`, `frame >= 6`), so reordering frames breaks combat.
- Accessibility flags are read via optional chaining in the renderer
  (`state.accessibility?.lowEndMode`) because `draw()` is also called with partial
  state during loading. `drawSettings` uses non-optional access and would throw on
  partial state.
- Enemy scaling is `Math.floor(5 + (level - 1) * 2)` — two extra enemies per level.
  The README claims three; the README is wrong.
- README heading emoji are mojibake (`dY"\xEF\xBF\xBD` etc.) from a bad encode at
  some point. The bytes are valid UTF-8 but the glyphs are corrupted. Do not
  "fix" them by guessing new emoji — ask.