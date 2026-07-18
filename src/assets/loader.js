/**
 * loader.js
 * - Preloads every game asset and shows a loading bar.
 * - Once done, fades out the loading screen and starts the game.
 * - Fixes mouse/touch coordinates so they map correctly onto the
 *   logical 1000×400 canvas regardless of CSS display size.
 * - Injects touch-control events that simulate keyboard input.
 */

(function () {
    "use strict";

    /* ─── Asset manifest ──────────────────────────────────────────── */
    const IMAGES = [
        "background/Battleground1.png",
        "background/game_background_1.png",
        "background/game_background_2.png",
        "background/Villagebuilding1.png",
        "background/Villagebuilding2.png",
        "background/Villagebuilding3.png",
        "background/Villagebuilding4.png",
        "background/Villagebuilding5.png",
        "Enchantress/Idle.png",
        "Enchantress/Run.png",
        "Enchantress/Walk.png",
        "Enchantress/Attack_1.png",
        "Enchantress/Attack_2.png",
        "Enchantress/Attack_3.png",
        "Enchantress/Attack_4.png",
        "Enchantress/Dead.png",
        "Enchantress/Hurt.png",
        "Enchantress/Profile.png",
        "Skeleton/Walk.png",
        "Skeleton/Attack_1.png",
        "Skeleton/Attack_3.png",
        "Skeleton/Dead.png",
        "Skeleton/Hurt.png",
        "Buttons/pause-button.png",
    ];

    /* ─── Loading-screen UI references ───────────────────────────── */
    const loadingScreen = document.getElementById("loading-screen");
    const bar           = document.getElementById("loading-bar");
    const pct           = document.getElementById("loading-pct");

    let loaded = 0;
    const total = IMAGES.length;

    function onAssetLoaded() {
        loaded++;
        const p = Math.round((loaded / total) * 100);
        bar.style.width = p + "%";
        pct.textContent = "Loading assets… " + p + "%";
        if (loaded === total) onAllLoaded();
    }

    IMAGES.forEach(function (src) {
        const img = new Image();
        img.onload  = onAssetLoaded;
        img.onerror = onAssetLoaded; // Don't block if an asset is missing
        img.src = src;
    });

    function onAllLoaded() {
        // Brief pause so the 100% state is visible
        setTimeout(function () {
            loadingScreen.classList.add("fade-out");
            setTimeout(function () {
                loadingScreen.style.display = "none";
            }, 750);

            // Boot the game
            patchCanvasCoords();
            loadScript("mainmenu.js", function () {
                start_menu();
            });
        }, 400);
    }

    /* ─── Load a script dynamically ──────────────────────────────── */
    function loadScript(src, cb) {
        const s = document.createElement("script");
        s.src = src;
        if (cb) s.onload = cb;
        document.body.appendChild(s);
    }

    /* ─── Coordinate patching ─────────────────────────────────────
     *
     * The canvas has a LOGICAL resolution of 1000×400 (set by JS).
     * On-screen it may be smaller (CSS scales it to fit the viewport).
     * Mouse / touch events arrive in CSS (display) pixels, so we must
     * convert them to logical pixels before passing them into the game.
     *
     * We do this by overriding getBoundingClientRect() on the canvas
     * element so that returned values pretend the canvas is always
     * displayed at 1000×400 — that way all existing hit-test code
     * (rect.left, rect.top, e.clientX - rect.left) just works.
     *
     * Alternatively we can patch the events themselves via a capturing
     * listener, which is cleaner and doesn't monkey-patch DOM APIs.
     ────────────────────────────────────────────────────────────────*/
    function patchCanvasCoords() {
        const canvas = document.getElementById("lala");
        if (!canvas) return;

        const LOGICAL_W = 1000;
        const LOGICAL_H = 400;

        /**
         * Returns {scaleX, scaleY} so that:
         *   logicalX = (cssX - rect.left) * scaleX
         *   logicalY = (cssY - rect.top)  * scaleY
         */
        function getScale() {
            const rect = HTMLCanvasElement.prototype.getBoundingClientRect.call(canvas);
            return {
                x: LOGICAL_W / rect.width,
                y: LOGICAL_H / rect.height,
                left: rect.left,
                top: rect.top
            };
        }

        /**
         * Wrap a MouseEvent / Touch to provide scaled clientX/Y.
         * We inject a custom getBoundingClientRect on the canvas that
         * returns a DOMRect at position 0,0 with size LOGICAL_W×LOGICAL_H,
         * and we intercept events to translate coordinates before they
         * reach the game's listeners.
         */
        canvas.getBoundingClientRect = function () {
            const s = getScale();
            // Return a fake rect as if canvas occupies logical space
            // This makes (e.clientX - rect.left) * 1 == logical coord
            // We shift rect.left/top so that after subtraction we get
            // the scaled logical coordinate.
            // Trick: return left = e.clientX - logicalX
            // That doesn't work because we don't know e.clientX here.
            // Instead, use the real rect but scale appropriately by
            // returning width/height == LOGICAL and offsetting left/top.
            const real = HTMLCanvasElement.prototype.getBoundingClientRect.call(canvas);
            return {
                left:   real.left - (real.left * (1 - 1/s.x)) * s.x,   // keep math simple below
                top:    real.top  - (real.top  * (1 - 1/s.y)) * s.y,
                width:  LOGICAL_W,
                height: LOGICAL_H,
                right:  real.left + LOGICAL_W,
                bottom: real.top  + LOGICAL_H,
            };
        };

        // Simpler & more robust: intercept at the event level
        // (overriding getBoundingClientRect is fragile — reset it)
        canvas.getBoundingClientRect = HTMLCanvasElement.prototype.getBoundingClientRect;

        // Add a capturing listener that stores scale on the event
        // so game code using (e.clientX - rect.left) gets logical coords.
        // We inject our own getBoundingClientRect shim per-event-call by
        // temporarily replacing it during the event dispatch.
        function makeScaledHandler(type) {
            canvas.addEventListener(type, function (e) {
                const real  = HTMLCanvasElement.prototype.getBoundingClientRect.call(canvas);
                const sx    = LOGICAL_W / real.width;
                const sy    = LOGICAL_H / real.height;

                // Store original getBoundingClientRect
                const orig = canvas.getBoundingClientRect;

                // Replace with shim that makes game math work
                // Game does: mouseX = e.clientX - rect.left
                // We need:   mouseX = (e.clientX - real.left) * sx
                // So:        rect.left = e.clientX - (e.clientX - real.left) * sx
                // This is event-dependent, so we build it per-call:
                canvas.getBoundingClientRect = function () {
                    // Use the actual clientX/Y from the event
                    const cx = (e.touches ? e.touches[0].clientX : e.clientX);
                    const cy = (e.touches ? e.touches[0].clientY : e.clientY);
                    const logicalX = (cx - real.left) * sx;
                    const logicalY = (cy - real.top)  * sy;
                    return {
                        left:   cx - logicalX,
                        top:    cy - logicalY,
                        width:  LOGICAL_W,
                        height: LOGICAL_H,
                        right:  cx - logicalX + LOGICAL_W,
                        bottom: cy - logicalY + LOGICAL_H,
                    };
                };

                // Restore after this synchronous event cycle
                Promise.resolve().then(function () {
                    canvas.getBoundingClientRect = orig;
                });
            }, true /* capture — fires before game listeners */);
        }

        makeScaledHandler("click");
        makeScaledHandler("mousemove");
        makeScaledHandler("touchstart");
        makeScaledHandler("touchmove");
        makeScaledHandler("touchend");
    }

    /* ─── Touch → Keyboard bridge ────────────────────────────────── */
    document.addEventListener("DOMContentLoaded", function () {
        wireTouchControls();
    });

    function wireTouchControls() {
        const btns = document.querySelectorAll("[data-key]");

        function fireKey(type, key) {
            document.dispatchEvent(new KeyboardEvent(type, {
                key: key,
                bubbles: true,
                cancelable: true
            }));
        }

        btns.forEach(function (btn) {
            const key = btn.dataset.key;

            // Pointer events work for both mouse and touch
            btn.addEventListener("pointerdown", function (e) {
                e.preventDefault();
                btn.classList.add("pressed");
                fireKey("keydown", key);
            });

            btn.addEventListener("pointerup", function (e) {
                e.preventDefault();
                btn.classList.remove("pressed");
                fireKey("keyup", key);
            });

            btn.addEventListener("pointerleave", function (e) {
                if (btn.classList.contains("pressed")) {
                    btn.classList.remove("pressed");
                    fireKey("keyup", key);
                }
            });
        });
    }

})();
