# Changelog

## v03.0

### Changed
- **Colors:** base `#333` → `#555`; hover `#888` → `#ddd`.
  `styles.css` → `#dot` (`background`), `#dot.hovered` (`background`).
- **Pulse:** now runs from the moment the dot appears (starts together with the fade-in),
  not on hover. Period 2s, `ease-in-out`, infinite, no delay; amplitude ±12%
  (scale 1 → 1.12 → 0.88 → 1, was ±8%).
  `styles.css` → `#dot.pulsing`, `@keyframes pulse`. `script.js` → `showDot()` adds `.pulsing`.
- **Hover:** stops the pulse immediately (removes `.pulsing`), then runs the existing grow
  (15px → 40px, 1s `ease-in-out`). On leave the dot shrinks back over 1s, then the pulse
  resumes (`SHRINK_MS = 1000`). Re-entering during the shrink cancels the resume.
  `script.js` → `onEnter()`, `onLeave()`, `state.resumeTimer`.

### Added
- **Click to move:** clicking the dot moves its center to a random point inside the viewport
  with a 10% margin on every side (`MOVE_MARGIN = 0.1`). The new point is at least 30% of the
  viewport's shorter side from the current center (`MIN_MOVE = 0.3`). The move animates
  `left` / `top` over 1.2s, `cubic-bezier(0.65, 0, 0.35, 1)`. Clicks during a move are ignored
  (`state.moving`, cleared on the `left` / `top` `transitionend`). The hover area is the
  dot's `::before`, so it moves with it; the dot stays centered on its position through
  `translate: -50% -50%` (v02.2).
  `script.js` → `onClick()`, `moveDot()`, `randomTarget()`, `onTransitionEnd()`.
  `styles.css` → `#dot` `transition` (`left`, `top`).
- **3rd click fades out:** the 3rd accepted click doesn't move the dot; it fades out in
  place over 1.5s `ease-out` and stops taking pointer input, leaving a black screen.
  No reset; refreshing the page restarts. `FADE_OUT_CLICK = 3`.
  `script.js` → `onClick()`, `fadeOut()`, `state.clicks`, `state.gone`.
  `styles.css` → `#dot.gone`.
- **Reduced motion:** move and fade-out are 0.01s like the other transitions; the pulse is
  disabled. `styles.css` → `@media (prefers-reduced-motion: reduce)` (`#dot`, `#dot.gone`,
  `#dot.pulsing`).

### Removed
- **Hover-only pulse** (`animation` on `#dot.hovered`, with its 1s delay): replaced by the
  always-on pulse in `#dot.pulsing`.
- **Smooth stop of the pulse on leave** (the `onLeave()` code that held the current scale,
  plus the `scale 0.4s ease-out` transition): the pulse no longer runs while hovered, so
  there is nothing to ease back on leave.

### TODO
- On hover, the pulse should decelerate to a stop instead of stopping instantly.

## v02.2

### Fixed
- **Pulse drifted off center.** The centering offset used `transform: translate(-50%, -50%)`,
  and the pulse animates the separate `scale` property. CSS applies `scale` *after* `transform`,
  so the scale also scaled the centering offset. At 40px the dot moved up to 1.6px diagonally
  off center at each end of the pulse. Grow on hover was unaffected (it changes `width` / `height`).
  Centering now uses the individual `translate: -50% -50%` property, which is applied before
  `scale`, so the dot scales around its own center. Measured in headless Chrome: 0.00px offset
  at scale 1, 1.08 and 0.92.
  `styles.css` → `#dot` (`translate`).

## v02.1

### Changed
- **Dot size:** base 6px → 15px; hover 16px → 40px (same ≈2.67× ratio).
  `styles.css` → `#dot` and `#dot.hovered` (`width` / `height`).
- **Hover hit area:** extends 10px → 25px past the dot on every side (scaled ×2.5 with the dot).
  `styles.css` → `#dot::before` (`inset: -25px`).
- **Pulse:** one beat every 1.2s → 2s. Amplitude unchanged (scale 0.92–1.08).
  `styles.css` → `#dot.hovered` (`animation: pulse 2s ease-in-out 1s infinite`).

## v02.0

### Added
- **Hover grow + brighten:** over 1s, `ease-in-out`, the dot grows 6px → 16px and its color
  goes `#333` → `#888`.
  `styles.css` → `#dot.hovered` (state), `#dot` `transition` (`width`, `height`,
  `background-color` 1s ease-in-out).
  `script.js` → `onEnter()` on `pointerenter`; sets `state.hovered = true` and adds `.hovered`.
- **Pulse while hovered:** after a 1s delay (once grown), scale 1 → 1.08 → 0.92 → 1,
  1.2s loop, `ease-in-out`, infinite.
  `styles.css` → `@keyframes pulse`, `#dot.hovered` `animation`.
- **Smooth leave:** size and color ease back over 1s. The pulse's current scale is held,
  then eases back to 1 over 0.4s `ease-out` (no snap mid-pulse).
  `script.js` → `onLeave()` on `pointerleave`; sets `state.hovered = false`.
  `styles.css` → `#dot` `transition` (`scale 0.4s ease-out`).
- **Invisible hit area:** 10px beyond the dot on every side.
  `styles.css` → `#dot::before` (`inset: -10px`).
- **Reduced motion:** pulse disabled; all transitions 0.01s.
  `styles.css` → `@media (prefers-reduced-motion: reduce)`.

### Removed
- Nothing. The v02 brief asked to remove an existing hover brightening, but v01 had no
  hover effect, so there was nothing to remove.

## v01

### Added
- **Page:** full-viewport black (`#000`) page, no scroll, no other content.
  `styles.css` → `html, body`.
- **Dot:** 6px circle, `#333`, fixed at the exact center, starts at `opacity: 0`.
  `index.html` → `<div id="dot">`; `styles.css` → `#dot`.
- **Fade-in on first pointer move:** opacity 0 → 1 over 2s, `ease-out`. Fires once;
  the dot stays visible.
  `script.js` → `showDot()` on `pointermove` (`{ once: true }`); sets `state.visible = true`
  and adds `.visible`. `styles.css` → `#dot.visible`, `#dot` `transition` (`opacity 2s ease-out`).
- **Reduced motion:** fade shortened to 0.01s.
  `styles.css` → `@media (prefers-reduced-motion: reduce)`.
- **State:** `script.js` → `state` object (`visible`).
