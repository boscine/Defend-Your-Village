# Performance Notes

Measured on the dev build via Chrome DevTools Protocol against Edge, with
`Emulation.setCPUThrottlingRate` to emulate slower devices. Absolute numbers are
machine-specific; the ratios and the bottleneck identity are the durable part.

## Harness

The app has no automated browser tooling. Profiling was done by launching Edge with
`--remote-debugging-port` and driving it over CDP from Node (Node 22+ has a global
`WebSocket`). `window.ng.getComponent()` is available in the dev build, which gives
direct access to the `GameComponent` instance so `renderer.draw` and `logic.update`
can be timed individually and driven into specific game states.

Reproduce with the scripts in the repo temp dir pattern:
- launch Edge with `--disable-backgrounding-occluded-windows`,
  `--disable-renderer-backgrounding`, `--disable-features=CalculateNativeWinOcclusion`

**Without those flags the numbers are garbage.** An occluded window throttles
`requestAnimationFrame` and produced a phantom 3.6s stall and a phantom 10fps that
were pure measurement artifact.

## Baseline (no changes)

Locked 60fps in every phase. `draw` p50 was 0.3-0.4ms against a 16.7ms budget, and
scaling from 5 to 399 enemies barely moved it. At 1x CPU speed there is no
reproducible performance problem, so a fast desktop cannot surface this bug.

## The bottleneck: per-enemy ctx.filter

`drawEnemy` set `ctx.filter = "brightness(2) contrast(1.5)"` for every hurt enemy,
inside a `save()`/`restore()`. Setting `ctx.filter` makes the browser build a new
compositing layer per call. `hurt` is set on every hit (`hurtTimer` of 25 frames for
melee, 5 for the beam), so during combat many enemies are hurt at once and the cost
scales with enemy count.

Measured at 6x CPU throttle, all enemies hurt, Low-End Mode off (the default):

| enemies | draw p50 before | after | frame p50 before | after |
| --- | --- | --- | --- | --- |
| 149 | 37.7ms | 7.6ms | 64ms (15.6fps) | 16.4ms (61fps) |
| 299 | 70.5ms | 8.7ms | 120ms (8.3fps) | 17.8ms (56fps) |

Control cases in the same run: no enemy hurt was 5.8ms draw, and Low-End Mode
(filter skipped) was 5.7ms. So the filter alone accounted for the entire regression.

**Fix #14 (kept):** `getHurtSheet()` bakes the filtered sheet once into an offscreen
canvas, cached in `_hurtSheetCache` and cleared by `invalidateGradients()`. Verified
pixel-identical to the old per-draw filter: maxAbsDiff 0 over all 131,072 pixels.

## Ideas tested and rejected

| Idea | Result | Verdict |
| --- | --- | --- |
| 3840x2160 backgrounds causing the stall via decode/GPU upload | drew all three cold in 0.3ms total | rejected, hypothesis was wrong |
| Enemy count alone (no other change) | draw flat 0.4ms at 5 and at 123 enemies | invalid test, see below |
| Hoisting `save()`/`restore()` out of the per-enemy draw | unmeasured after the filter fix removed the regression | not needed, filter was the whole cost |
| Pre-baking the player's hurt filter (`drawPlayer`) | ~0.2ms/frame at 6x throttle, ~1% of budget | not worth it, left alone |

### Two measurement traps hit while investigating

1. **Map culling.** `drawEnemy` is guarded by `dummyMap[i] === state.map`, and
   `spawnEnemies()` puts every enemy on map 3 while the player starts on map 1. A
   naive stress test therefore drew zero enemies and reported a flat 0.4ms. Enemies
   must be explicitly moved onto the player's map to stress the renderer at all.
2. **Unpopulated parallel arrays.** Overriding `logic.enemies` directly leaves the
   parallel `enemy.*` arrays undefined past the spawned count, so `dummyMap[i]` is
   never set and the culling guard still excludes them. Size the arrays via the
   level formula (`enemies = floor(5 + (level-1)*2)`) and let `spawnEnemies()` fill them.

## Known remaining cost, not yet addressed

`drawPlayer` still sets `ctx.filter` once per frame for the player's hurt tint. It is
one filter per frame rather than one per enemy, so it is ~1% of budget and was
measured as insignificant. Worth baking the same way if a future change makes the
player hurt state more expensive.

## Load-time cost (measured, not addressed)

Independent of frame rate. The loading screen gates on 3.85MB across 25 requests;
three 3840x2160 backgrounds are 92.5% of the bytes and ~95MB decoded RGBA for a
1000x400 canvas. Decoding is not the frame-rate bottleneck (see rejected ideas) but
it is real memory pressure on low-end devices. Not changed.
