# Page Entrance Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a branded entrance sequence to `index.html`: a brief preloader (logo fade + one-time pulse over the page background) that fades out into a staggered reveal of the hero's title, subtitle, and action buttons.

**Architecture:** A full-viewport preloader overlay (`<div class="preloader">`, new markup right after `<body>`) is shown by default via plain CSS (logo entrance + pulse keyframes) and hidden by JS ~1.1s after the page's `DOMContentLoaded`. Hiding the preloader and revealing the hero happen in the same JS callback so they're synchronized: the hero's three `.reveal` elements (title, subtitle, actions) are pulled out of the site's existing generic scroll-triggered `IntersectionObserver` and instead get their `is-visible` class added manually at that moment, with staggered `transition-delay` values (0s / .15s / .3s) so they animate in sequence rather than together. `prefers-reduced-motion` is honored via the same CSS-media-query-disables-animation pattern already used elsewhere in this file (e.g. `assets/css/style.css:517-519`, `:706-709`), plus a JS check that skips the preloader's artificial delay entirely.

**Tech Stack:** Vanilla JS (`assets/js/script.js`), plain CSS (`assets/css/style.css`), static HTML (`index.html`). No build tooling, no test runner (static site, confirmed via `git ls-files` / directory listing — no `package.json` or config files anywhere in the repo). All "testing" in this plan is manual verification in a real browser via the Playwright MCP tools, matching how this project has been validated throughout prior features (see `docs/superpowers/plans/2026-07-31-hero-typewriter-relocation.md`).

## Global Constraints

- No new dependencies, no build tooling — plain HTML/CSS/JS only.
- Scope is `index.html` and its hero only. Service detail pages (`servicios/*.html`) are untouched.
- Preloader background: `var(--bg-light)` (matches the page body's own background — no color flash). Logo: `assets/img/logo-dark-trim.png` (confirmed present in `assets/img/`).
- Preloader timing: logo entrance (fade+scale) 0–0.5s, one non-looping pulse 0.5–1.1s, then at 1.1s the whole overlay starts a 0.5s fade-out (finishes ~1.6s total). This is a fixed-length entrance, not a real loading indicator — no polling, no async wait.
- Hero stagger delays (only apply once `is-visible` is added, which now happens in sync with the preloader's fade-out, not on generic scroll-into-view): `.hero__title` 0s, `.hero__subtitle` .15s, `.hero__actions` .3s. Reuses the existing `.reveal` / `.reveal.is-visible` transition (`assets/css/style.css:55-63`, `opacity .7s ease, transform .7s ease`) — no new transition properties, only `transition-delay` overrides.
- The three hero `.reveal` elements (`index.html:43-48`) must be excluded from the existing generic scroll-reveal `IntersectionObserver` (`assets/js/script.js:41-50`) — they are now driven exclusively by the preloader sequence. All other `.reveal` elements sitewide (services, reviews, contact) keep today's scroll-triggered behavior, unchanged.
- `prefers-reduced-motion: reduce`: preloader shows with no animation and is dismissed with no artificial delay (no 1.1s wait, no fade transition); hero elements get `is-visible` immediately with no stagger. Mirrors the existing reduced-motion handling already in this codebase for the typewriter (`assets/js/script.js:116-120`) and decorative animations (`assets/css/style.css:517-519`, `:706-709`).
- While the preloader is visible, the page must not be scrollable (`body.is-loading { overflow: hidden; }`), and interaction is blocked by the overlay itself.

---

### Task 1: Preloader markup and CSS

**Files:**
- Modify: `index.html:11-13` (insert preloader div between `<body>` and `<header>`)
- Modify: `assets/css/style.css` (insert new "Preloader" section after the existing "Reveal animation" section, `style.css:52-64`)
- Modify: `assets/css/style.css:289-295` (insert hero stagger `transition-delay` rules immediately after `.hero__actions`)

**Interfaces:**
- Produces: `#preloader` element with class `.preloader` (default visible, animates via CSS only) and `.preloader.is-hidden` (fade-out state, no JS yet in this task — verified manually via `browser_evaluate` toggling the class). `body.is-loading` class (CSS only defined here; not yet toggled by JS). `.hero__title.reveal`, `.hero__subtitle.reveal`, `.hero__actions.reveal` now carry `transition-delay` — visible effect requires Task 2's JS (today, the generic observer still adds `is-visible` to these near-instantly on load, so this task's stagger will already be faintly visible on its own, just not yet synced to a preloader fade-out).
- Consumes: nothing new.

- [ ] **Step 1: Insert the preloader markup**

Current (`index.html:11-13`):
```html
<body>

<header class="header" id="header">
```

Replace with:
```html
<body>

<div class="preloader" id="preloader" aria-hidden="true">
  <img src="assets/img/logo-dark-trim.png" alt="" class="preloader__logo">
</div>

<header class="header" id="header">
```

- [ ] **Step 2: Add the Preloader CSS section**

Current (`assets/css/style.css:52-65`):
```css
/* ==========================================================================
   Reveal animation
   ========================================================================== */
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity .7s ease, transform .7s ease;
}
.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* ==========================================================================
   Buttons
   ========================================================================== */
```

Replace with (adds a new "Preloader" section between "Reveal animation" and "Buttons"):
```css
/* ==========================================================================
   Reveal animation
   ========================================================================== */
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity .7s ease, transform .7s ease;
}
.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* ==========================================================================
   Preloader
   ========================================================================== */
.preloader {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-light);
  transition: opacity .5s ease;
}
.preloader.is-hidden {
  opacity: 0;
  pointer-events: none;
}
.preloader__logo {
  height: 64px;
  width: auto;
  opacity: 0;
  transform: scale(.8);
  animation: preloaderIn .5s ease forwards, preloaderPulse .6s ease-in-out .5s 1;
}
@keyframes preloaderIn {
  to { opacity: 1; transform: scale(1); }
}
@keyframes preloaderPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
}
body.is-loading {
  overflow: hidden;
}

@media (prefers-reduced-motion: reduce) {
  .preloader__logo { animation: none; opacity: 1; transform: none; }
  .preloader.is-hidden { transition: none; }
}

/* ==========================================================================
   Buttons
   ========================================================================== */
```

- [ ] **Step 3: Add hero stagger delay rules**

Current (`assets/css/style.css:289-296`):
```css
.hero__actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 64px;
}

/* ==========================================================================
   Section titles (shared)
   ========================================================================== */
```

Replace with:
```css
.hero__actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 64px;
}

/* These three are excluded from the generic scroll-reveal observer
   (assets/js/script.js) and instead get `is-visible` added manually, in
   sync with the preloader's fade-out — the delays below make them animate
   in sequence instead of together. */
.hero__title.reveal { transition-delay: 0s; }
.hero__subtitle.reveal { transition-delay: .15s; }
.hero__actions.reveal { transition-delay: .3s; }

@media (prefers-reduced-motion: reduce) {
  .hero__title.reveal,
  .hero__subtitle.reveal,
  .hero__actions.reveal { transition-delay: 0s; }
}

/* ==========================================================================
   Section titles (shared)
   ========================================================================== */
```

- [ ] **Step 4: Verify the preloader renders and animates correctly**

Use the Playwright MCP browser tool (tool names starting with `mcp__plugin_playwright_playwright__`; if not in your active tool list, `ToolSearch` with query "select:mcp__plugin_playwright_playwright__browser_navigate,mcp__plugin_playwright_playwright__browser_snapshot,mcp__plugin_playwright_playwright__browser_take_screenshot,mcp__plugin_playwright_playwright__browser_evaluate,mcp__plugin_playwright_playwright__browser_console_messages,mcp__plugin_playwright_playwright__browser_resize"):

1. `browser_navigate` to `index.html`. `file://` has been blocked in prior sessions in this environment — if so, start a local server (`npx http-server -p 8000`) from `d:\ClaudePro` and use `http://localhost:8000/index.html`. If changes don't seem to apply, the Playwright browser profile has served stale cached files before — issue a CDP `Network.clearBrowserCache` before navigating.
2. `browser_resize` to 1440x900. Immediately `browser_take_screenshot` — confirm a full-viewport `--bg-light` overlay with the small dark logo centered, at or near its starting scaled-down/faded-in state.
3. `browser_evaluate` to read `document.querySelector('.preloader__logo').getBoundingClientRect()` a few times over ~1 second (e.g. at 100ms, 400ms, 900ms after navigation) — confirm the logo's size visibly grows from Step 2's initial small state up to full size (the `preloaderIn` animation), then holds with only a small size oscillation (the `preloaderPulse` breathing).
4. Since Task 2 hasn't wired up the JS hide yet, manually verify the fade-out CSS works: `browser_evaluate` to run `document.getElementById('preloader').classList.add('is-hidden')`, then `browser_take_screenshot` immediately and again after ~600ms — confirm the overlay fades from opaque to fully transparent, revealing the header/hero underneath. Then run `document.getElementById('preloader').classList.remove('is-hidden')` to restore the default state (don't leave the test page in a modified state, though this doesn't persist across reloads anyway).
5. `browser_console_messages` — confirm no errors (in particular, confirm the logo `<img>` loaded — no 404 for `assets/img/logo-dark-trim.png`).

- [ ] **Step 5: Verify reduced-motion CSS**

Note: the Playwright MCP tool surface may not expose direct `prefers-reduced-motion` emulation. If it does (check for a `browser_evaluate`-adjacent or navigation option for media emulation), use it to confirm `.preloader__logo` shows at full size/opacity immediately with no animation. If no such capability is available, verify by code review instead: confirm the `@media (prefers-reduced-motion: reduce)` block added in Step 2 correctly targets `.preloader__logo` (`animation: none; opacity: 1; transform: none;`) and `.preloader.is-hidden` (`transition: none;`), matching the exact pattern already used at `assets/css/style.css:517-519` and `:706-709`; and confirm Step 3's `@media (prefers-reduced-motion: reduce)` block resets all three hero `transition-delay` values to `0s`, so no stagger is perceptible even though the underlying `.reveal` opacity/transform transition itself still plays (matching this codebase's existing, unaddressed baseline — none of the other `@media (prefers-reduced-motion: reduce)` blocks in this file touch `.reveal`'s own transition either).

- [ ] **Step 6: Commit**

```bash
git add index.html assets/css/style.css
git commit -m "Add preloader markup and hero stagger CSS for page entrance animation"
```

---

### Task 2: JS — preloader sequence and hero reveal sync

**Files:**
- Modify: `assets/js/script.js:40-50` (exclude hero `.reveal` elements from the generic scroll-reveal observer)
- Modify: `assets/js/script.js` (insert new preloader sequence block immediately after the reveal-on-scroll block)

**Interfaces:**
- Consumes: `#preloader` / `.preloader.is-hidden`, `body.is-loading`, and `.hero__title/.hero__subtitle/.hero__actions.reveal` transition-delay rules from Task 1.
- Produces: on page load, after ~1.1s (or immediately under reduced motion), `#preloader` gets `.is-hidden`, `document.body` loses `.is-loading`, and every element matching `.hero .reveal` gets `.is-visible` added directly (bypassing the generic `revealObserver`).

- [ ] **Step 1: Exclude hero elements from the generic reveal observer**

Current (`assets/js/script.js:40-50`):
```js
  // Reveal on scroll
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
```

Replace with:
```js
  // Reveal on scroll (hero elements are excluded — they're driven by the
  // preloader entrance sequence below instead)
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(el => {
    if (!el.closest('.hero')) revealObserver.observe(el);
  });

  // Preloader entrance sequence
  const preloader = document.getElementById('preloader');
  const heroRevealEls = document.querySelectorAll('.hero .reveal');
  const prefersReducedMotionLoad = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.body.classList.add('is-loading');

  const finishPreload = () => {
    preloader.classList.add('is-hidden');
    document.body.classList.remove('is-loading');
    heroRevealEls.forEach(el => el.classList.add('is-visible'));
  };

  if (prefersReducedMotionLoad) {
    finishPreload();
  } else {
    setTimeout(finishPreload, 1100);
  }
```

- [ ] **Step 2: Verify the full sequence on a normal (non-reduced-motion) load**

Using the Playwright MCP browser tool:
1. `browser_navigate` to `index.html` (same setup notes as Task 1 Step 4 — local server + cache clear if needed). `browser_resize` to 1440x900.
2. `browser_evaluate`, polling every ~200ms from t=0 to t=2200ms, read: `document.getElementById('preloader').classList.contains('is-hidden')`, `document.body.classList.contains('is-loading')`, and `getComputedStyle(document.querySelector('.hero__title')).opacity` / `.hero__subtitle` / `.hero__actions`. Confirm: `is-loading` is present from t=0 until ~1100ms then gone; `is-hidden` is absent until ~1100ms then present; the three hero opacities go from `0` to `1` in sequence, title first (~1100ms onward), subtitle next (~1250ms onward), actions last (~1400ms onward), all reaching `1` by ~2100ms.
3. `browser_take_screenshot` at t≈300ms (preloader with logo mid-entrance, hero not yet visible), t≈1300ms (preloader fading, title visible, subtitle/actions still fading in), and t≈2200ms (preloader gone, full hero visible, matching the pre-existing design). Visually confirm the sequence reads as a single connected animation, not a jump-cut.
4. Confirm the page did not scroll and was not scrollable during the `is-loading` window (e.g. `browser_evaluate` checking `getComputedStyle(document.body).overflow === 'hidden'` at t≈300ms).
5. `browser_console_messages` — confirm no errors.

- [ ] **Step 3: Verify the reduced-motion path**

Per Task 1 Step 5's note on tool capability: if direct `prefers-reduced-motion` emulation is available via the Playwright MCP tools, use it here to confirm the preloader is hidden and the hero is fully visible (`is-visible` on all three elements) within the same test tick as page load, with no ~1.1s wait observed. If not available, verify by code review: `prefersReducedMotionLoad` is read once via `window.matchMedia(...).matches` and, when true, `finishPreload()` is called synchronously with no `setTimeout`, matching the exact same pattern already used and previously verified for the typewriter at `assets/js/script.js:116-120`.

- [ ] **Step 4: Confirm non-hero reveal sections still work**

Using the Playwright MCP browser tool, after the page has fully loaded (past t≈2200ms): scroll down to the "Servicios" section (e.g. `browser_evaluate` with `document.getElementById('servicios').scrollIntoView()`), wait briefly, then confirm via `browser_evaluate` that the service cards' `.reveal` elements have `is-visible` added (e.g. `document.querySelectorAll('.services .reveal.is-visible').length` matches the total number of `.reveal` elements in that section). This confirms Step 1's `el.closest('.hero')` filter didn't accidentally break scroll-reveal for sections outside the hero.

- [ ] **Step 5: Commit**

```bash
git add assets/js/script.js
git commit -m "Wire up preloader entrance sequence and sync hero reveal stagger"
```

---

### Task 3: Full-page manual verification

**Files:** none (verification only)

**Interfaces:**
- Consumes: the completed feature from Tasks 1-2.

- [ ] **Step 1: Repeat the full sequence at a mobile viewport**

Using the Playwright MCP browser tool, `browser_resize` to 390x844, `browser_navigate` (fresh load) to `index.html`. Repeat Task 2 Step 2's polling/screenshot checks at this viewport. Confirm the preloader logo is appropriately sized and centered (not clipped), and the hero stagger completes without any element overflowing the viewport width horizontally.

- [ ] **Step 2: Confirm header/nav interactions are unaffected**

After a fresh load and waiting past t≈2200ms, use the Playwright MCP browser tool to click a nav link (e.g. "Servicios") and confirm smooth-scroll navigation still works, and that the mobile burger menu (at the 390x844 viewport) still opens/closes correctly. This confirms the preloader's `z-index: 9999` and `pointer-events` handling don't leave any stray overlay blocking interaction after it's hidden.

- [ ] **Step 3: Confirm no regressions on repeated loads**

Reload the page 2-3 times in a row (fresh `browser_navigate` each time) and confirm the sequence is consistent each time (no leftover `is-hidden`/`is-visible` state persisting incorrectly, no console errors accumulating). Since none of this is stored in `localStorage`/cookies, each load should look identical.

- [ ] **Step 4: Final visual pass and console check**

`browser_console_messages` on a fully loaded page at both 1440x900 and 390x844 — confirm zero errors. `browser_take_screenshot` of the fully-revealed hero at both sizes and visually compare against the pre-existing hero design (from `docs/superpowers/plans/2026-07-31-hero-typewriter-relocation.md`'s prior verification) to confirm nothing about the hero's final resting layout changed — only how it animates in on load.

- [ ] **Step 5: Final commit (if any fixes were needed)**

If Steps 1-4 required any tweaks, stage and commit them individually with a descriptive message. If nothing needed fixing, this task requires no commit — just confirmation that Tasks 1-2's commits are sufficient.
