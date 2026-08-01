# Page Entrance Animation — Design

## Goal
Add a branded entrance sequence that plays once when `index.html` first loads: a brief preloader (logo fade + pulse on the page background) followed by a staggered reveal of the hero's title, subtitle, and action buttons, timed to finish just as the preloader has fully disappeared.

## Background
The hero currently reuses the site-wide `.reveal` mechanism (`style.css:55-63`, observer in `script.js:41-50`): each `.reveal` element starts at `opacity:0; transform:translateY(24px)` and transitions to visible when an `IntersectionObserver` (threshold `0.15`) sees it enter the viewport. Because the hero is already in the viewport on load, the observer fires for all three hero `.reveal` elements (`h1.hero__title`, `p.hero__subtitle`, `div.hero__actions`, `index.html:43-48`) almost simultaneously at `DOMContentLoaded` — there is no stagger, and no page-load moment to draw attention to. This design adds a preloader as the entrance's first beat, and re-times the hero's existing reveal so its stagger is visible to the user instead of completing invisibly before any preloader would fade.

## Scope
- `index.html` — add a preloader overlay element (logo image) right after `<body>`, before the header.
- `assets/css/style.css` — new preloader styles/keyframes; new per-element `transition-delay` rules scoped to the three hero `.reveal` elements.
- `assets/js/script.js` — new preloader-driven load sequence; hero `.reveal` elements are removed from the generic scroll-reveal observer and instead get `is-visible` added manually, in sync with the preloader's fade-out.
- No other pages are affected (service detail pages keep their current entrance, out of scope).

## Preloader
```html
<body>
<div class="preloader" id="preloader" aria-hidden="true">
  <img src="assets/img/logo-dark-trim.png" alt="" class="preloader__logo">
</div>
<header class="header" id="header">
```
- `position: fixed; inset: 0;` full-viewport overlay, `background: var(--bg-light)` (matches `body`'s own background, so there's no color flash when it lifts), high `z-index` above the sticky header, `display:flex; align-items:center; justify-content:center`.
- While visible it captures all interaction (default block-level fixed overlay already does this) and the page underneath should not scroll — set `overflow:hidden` on `html`/`body` while the preloader is active, removed once it's hidden.
- `.preloader__logo` animates in two beats, once, no loop:
  1. **Entrance** (0–0.5s): `opacity 0→1`, `transform: scale(.8)→scale(1)`.
  2. **Pulse** (0.5–1.1s): one soft breath, `scale(1)→scale(1.06)→scale(1)`.
- At ~1.1s after load, JS adds `.preloader.is-hidden`, which transitions `opacity:1→0` over `.5s` and then `visibility:hidden; pointer-events:none` (so it's removed from the a11y/interaction tree once invisible), and removes the `overflow:hidden` lock on `html`/`body`.

## Hero stagger, synced to the preloader
The three hero `.reveal` elements keep their existing `.reveal`/`.reveal.is-visible` CSS (`style.css:55-63`) but get their own `transition-delay`, scoped by their existing classes so no markup changes are needed:
```css
.hero__title.reveal    { transition-delay: 0s; }
.hero__subtitle.reveal { transition-delay: .15s; }
.hero__actions.reveal  { transition-delay: .3s; }
```
In `script.js`, the generic reveal observer setup (`script.js:50`) excludes hero elements:
```js
document.querySelectorAll('.reveal').forEach(el => {
  if (!el.closest('.hero')) revealObserver.observe(el);
});
```
Instead, the same moment the preloader starts fading (the `.is-hidden` class is added, ~1.1s after load), JS also adds `.is-visible` to the three hero `.reveal` elements directly. Because of the staggered `transition-delay` values above, the user sees: preloader fades away (0.5s) → title appears → subtitle follows (+0.15s) → buttons follow (+0.15s more), with the tail of the hero animation finishing shortly after the preloader has fully disappeared. The rest of the site (services, reviews, contact) keeps today's scroll-triggered reveal behavior unchanged.

## Accessibility
If `window.matchMedia('(prefers-reduced-motion: reduce)').matches` is true (already checked elsewhere in `script.js:75,116` for the same purpose):
- The preloader is hidden immediately with no fade/scale/pulse animation and no artificial delay.
- The three hero `.reveal` elements get `is-visible` immediately, with no transition delay — same end state, no motion.
This mirrors the existing reduced-motion handling for the typewriter and parallax effects already in the codebase.

## Out of scope
- Service detail pages (`servicios/*.html`) — no preloader or entrance changes there.
- Looping/idle-state preloader animation — the pulse plays once; this is a fixed-length entrance, not a real loading indicator (the site has no async load to wait on).
- Changing the scroll-reveal behavior for non-hero sections.
