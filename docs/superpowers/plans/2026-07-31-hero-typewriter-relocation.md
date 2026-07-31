# Hero Typewriter Relocation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the looping typewriter effect from the hero H1 to the hero subtitle on `index.html`, with new copy, and restore the H1 to its original static text.

**Architecture:** Pure HTML/CSS edit plus CSS-only relocation of reflow protection. No JS changes — the existing typewriter loop in `assets/js/script.js` already finds its target via `document.querySelector('.typewriter')` / `.typewriter-cursor'`, so moving those classes from the H1 to the subtitle in the markup is sufficient; the script picks up the new location automatically.

**Tech Stack:** Vanilla JS (already written, `assets/js/script.js`, unchanged), plain CSS (`assets/css/style.css`), static HTML (`index.html`). No build tooling, no test runner (static site, confirmed via `git ls-files`). All "testing" in this plan is manual verification in a real browser via the Playwright MCP tools, matching how this project has been validated throughout this feature's development.

## Global Constraints

- No new dependencies, no build tooling — plain HTML/CSS/JS only.
- No changes to `assets/js/script.js` — the typewriter loop is element-agnostic (queries `.typewriter` / `.typewriter-cursor` generically) and requires no edits to work on the subtitle instead of the H1.
- H1 text, restored exactly: `Hacemos crecer tu marca en el mundo digital` — no spans, no cursor.
- Subtitle word list (exact strings, in this order): `redes sociales`, `publicidad`, `branding`, `contenido`, `presencia digital`.
- Subtitle fixed lead-in: `Convertimos ` (note trailing space before the span). Subtitle fixed trailing text: ` en resultados reales para tu negocio.` (note leading space after the span's closing tag, before "en").
- The rotating span in the subtitle uses solid `var(--purple)` text at `font-weight: 700` — not the green→purple gradient used previously in the H1 (that treatment doesn't read well at the subtitle's smaller, gray body-text size).
- `.typewriter-cursor` and `@keyframes typewriter-blink` (`assets/css/style.css:262-269`) are unchanged and generic — do not duplicate or modify them, they already apply correctly wherever `.typewriter-cursor` is used.
- The subtitle needs its own reflow protection (`min-height`) so the CTA buttons and stats row below it don't shift while the typewriter types/deletes, following the same precedent already validated in this codebase for the H1: measure the element's height at its emptiest and fullest (longest word, fully typed) states across the viewport range this site's CSS actually treats differently (desktop ≥769px and the existing `@media (max-width: 768px)` mobile breakpoint down to ~320px), then set values that cover the true worst case at each breakpoint — a naive two-point estimate was insufficient last time (see `assets/css/style.css:922-925`'s comment for the precedent), so measure across a range, not just two fixed widths.
- Scope is `index.html` hero only — do not touch `servicios/*.html` heroes.

---

### Task 1: Hero markup — revert H1, relocate typewriter to subtitle

**Files:**
- Modify: `index.html:40-41`

**Interfaces:**
- Consumes: nothing new (the `.typewriter` / `.typewriter-cursor` classes and `data-words` attribute pattern already exist and are read by `assets/js/script.js`'s existing, unchanged typewriter loop).
- Produces: the H1 with plain static text (no spans). The subtitle now carries `span.typewriter[data-words]` and `span.typewriter-cursor[aria-hidden]` — Task 2's CSS targets these via `.hero__subtitle .typewriter` and the existing generic `.typewriter-cursor` rule.

- [ ] **Step 1: Replace the H1 and subtitle lines**

Current lines (`index.html:40-41`):
```html
      <h1 class="hero__title reveal">Hacemos crecer tu marca con <span class="typewriter" data-words="estrategia digital,redes sociales,publicidad,contenido que conecta,una marca sólida"></span><span class="typewriter-cursor" aria-hidden="true">|</span></h1>
      <p class="hero__subtitle reveal">Estrategias de redes sociales, publicidad y branding diseñadas para atraer clientes reales y aumentar tus ventas.</p>
```

Replace with:
```html
      <h1 class="hero__title reveal">Hacemos crecer tu marca en el mundo digital</h1>
      <p class="hero__subtitle reveal">Convertimos <span class="typewriter" data-words="redes sociales,publicidad,branding,contenido,presencia digital"></span><span class="typewriter-cursor" aria-hidden="true">|</span> en resultados reales para tu negocio.</p>
```

- [ ] **Step 2: Verify markup renders without the old copy**

Use the Playwright MCP browser tool (tool names starting with `mcp__plugin_playwright_playwright__`; if not in your active tool list, `ToolSearch` with query "select:mcp__plugin_playwright_playwright__browser_navigate,mcp__plugin_playwright_playwright__browser_snapshot,mcp__plugin_playwright_playwright__browser_console_messages"):
1. `browser_navigate` to `index.html`. `file://` has been blocked in prior sessions in this environment — if so, start a local server (`npx http-server -p 8000`) from `d:\ClaudePro` and use `http://localhost:8000/index.html`. If the typewriter doesn't seem to reflect this change, the Playwright browser profile has served stale cached `script.js`/HTML before — issue a CDP `Network.clearBrowserCache` before navigating.
2. `browser_snapshot` and confirm: the H1 reads exactly "Hacemos crecer tu marca en el mundo digital" (no trailing cursor character). The subtitle paragraph starts with "Convertimos" followed by an empty/typing word and ends with "en resultados reales para tu negocio." (empty typewriter span at this exact instant is fine — Task 1 doesn't touch JS, and the loop is already running from the previously-committed script).
3. Confirm no console errors via `browser_console_messages`.
4. Clean up any local server process and `.playwright-mcp/` scratch artifacts when done.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Relocate hero typewriter markup from H1 to subtitle"
```

---

### Task 2: CSS — remove H1 typewriter styling, add subtitle styling

**Files:**
- Modify: `assets/css/style.css:242-260` (H1 rules — remove typewriter-specific additions)
- Modify: `assets/css/style.css:272-277` (`.hero__subtitle` rule — add reflow protection)
- Modify: `assets/css/style.css` (add new `.hero__subtitle .typewriter` color rule, placed immediately after the `.hero__subtitle` rule)
- Modify: `assets/css/style.css:920-925` (existing `@media (max-width: 768px)` block — remove the H1 mobile override, add the subtitle mobile override)

**Interfaces:**
- Consumes: `span.typewriter` and `span.typewriter-cursor` now inside `.hero__subtitle` (from Task 1).
- Produces: final visual styling — no later task depends on new interfaces from this one (Task 3 is verification only).

- [ ] **Step 1: Revert the H1 rules**

Current (`assets/css/style.css:242-260`):
```css
.hero__title {
  font-size: clamp(2.2rem, 5vw, 3.6rem);
  font-weight: 800;
  line-height: 1.15;
  color: var(--blue);
  margin-bottom: 22px;
  /* Reserves room for the tallest state the looping typewriter can reach
     (longest word, fully typed) so typing/deleting never reflows the
     CTAs/stats below. Measured empirically at 1440x900: max 199px
     (plateaus for all widths >= ~1152px). Mobile value is set separately
     below 768px, where narrow widths need more wrapped lines. */
  min-height: 204px;
}
.hero__title span {
  background: linear-gradient(135deg, var(--green), var(--purple));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
```

Replace with (drop the `min-height` line + its comment, since the H1 is static again; drop the now-unused `.hero__title span` gradient rule entirely, since no span remains inside `.hero__title` after Task 1):
```css
.hero__title {
  font-size: clamp(2.2rem, 5vw, 3.6rem);
  font-weight: 800;
  line-height: 1.15;
  color: var(--blue);
  margin-bottom: 22px;
}
```

- [ ] **Step 2: Add the subtitle's rotating-word color treatment**

Immediately after the existing `.hero__subtitle` rule (`assets/css/style.css:272-277`):
```css
.hero__subtitle {
  font-size: 1.1rem;
  color: var(--text-light);
  max-width: 560px;
  margin: 0 auto 36px;
}
```

Insert this new rule right after it:
```css
.hero__subtitle .typewriter {
  color: var(--purple);
  font-weight: 700;
}
```

- [ ] **Step 3: Measure the subtitle's reflow range and add `min-height`**

Using the Playwright MCP browser tool, with the page loaded (same navigation approach as Task 1 Step 2 — watch for stale cache):

1. Resize to 1440x900. Poll `document.querySelector('.hero__subtitle').offsetHeight` via `browser_evaluate` repeatedly over at least one full type+delete cycle (≥8 seconds, matching the timing constants already in `script.js`: `TYPE_SPEED=80ms`, `DELETE_SPEED=45ms`, `PAUSE_AFTER_TYPE=1800ms`, `PAUSE_AFTER_DELETE=300ms` — a full cycle through the longest word is comfortably covered by 8-10s of polling). Record the max height observed. Also check a couple of representative desktop widths down to where the layout still behaves like "desktop" per this file's existing breakpoints (this site's only relevant breakpoint below full-width is `768px`; sample at least 1440px and ~800px) to make sure the max doesn't shift between them.
2. Resize to 390x844 (inside the existing `@media (max-width: 768px)` block's range) and repeat the same polling. Record the max height.
3. Resize to 320x568 (the narrowest width already measured for the H1 per the existing code comment precedent) and repeat. Record the max height — this is likely the true worst case for mobile, since narrower width means more wrapped lines for the same text.
4. Set `.hero__subtitle`'s `min-height` to the measured desktop max (from step 1) at the base rule, and add a `min-height` override for `.hero__subtitle` inside the existing `@media (max-width: 768px)` block sized to the measured mobile max (from steps 2-3, whichever is larger) — mirror the exact pattern and commenting style already used for the H1 fix (`assets/css/style.css:242-253` for the base rule's comment style, and `assets/css/style.css:922-925` for the mobile block's comment style), but write comments accurate to the subtitle's actual measured values, not copied verbatim from the H1's numbers.

Base rule becomes (fill in `<DESKTOP_MAX>` with your measured value):
```css
.hero__subtitle {
  font-size: 1.1rem;
  color: var(--text-light);
  max-width: 560px;
  margin: 0 auto 36px;
  /* Reserves room for the tallest state the looping typewriter can reach
     (longest word, fully typed) so typing/deleting never reflows the
     CTAs/stats below. Measured empirically at <viewport(s) you sampled>:
     max <DESKTOP_MAX>px. Mobile value is set separately below 768px. */
  min-height: <DESKTOP_MAX>px;
}
```

- [ ] **Step 4: Add the mobile override**

Current (`assets/css/style.css:920-925`, inside the existing `@media (max-width: 768px)` block):
```css
  .hero__stats { gap: 28px; }

  /* Narrow phones (measured down to 320px) need more wrapped lines than
     desktop for the typewriter's longest word, so the tallest reserved
     state is larger here. Measured max at 320-330px: 202px. */
  .hero__title { min-height: 210px; }
```

Replace with (drop the H1 override entirely since the H1 is static; add the subtitle override with your Step 3 measured value, `<MOBILE_MAX>`):
```css
  .hero__stats { gap: 28px; }

  /* Narrow phones need more wrapped lines than desktop for the typewriter's
     longest word, so the tallest reserved state is larger here. Measured
     max at 320-390px: <MOBILE_MAX>px. */
  .hero__subtitle { min-height: <MOBILE_MAX>px; }
```

- [ ] **Step 5: Verify no layout shift and correct color**

Using the Playwright MCP browser tool:
1. At 1440x900 and at 390x844, poll `document.querySelector('.hero__actions').getBoundingClientRect().top` via `browser_evaluate` every ~500ms for at least 9 seconds (covers a full type+delete+pause cycle). Confirm the value doesn't change (no CTA shift).
2. `browser_take_screenshot` of the hero at both viewports mid-typing (e.g. after ~1-2s) and confirm the rotating word renders in solid purple, bold, distinct from the surrounding gray subtitle text — not the green/purple gradient (that's the H1's old look, not this one).
3. `browser_console_messages` — confirm no errors.

- [ ] **Step 6: Commit**

```bash
git add assets/css/style.css
git commit -m "Move typewriter reflow protection and styling from hero H1 to subtitle"
```

---

### Task 3: Full-page manual verification

**Files:** none (verification only)

**Interfaces:**
- Consumes: the completed relocation from Tasks 1-2.

- [ ] **Step 1: Confirm the full word cycle on the subtitle**

Using the Playwright MCP browser tool, `browser_evaluate` polling `document.querySelector('.typewriter').textContent` over time (similar to how the original H1 typewriter was verified): confirm it cycles through all five words in order — `redes sociales` → `publicidad` → `branding` → `contenido` → `presencia digital` → loops back to `redes sociales`.

- [ ] **Step 2: Confirm `prefers-reduced-motion` still works at the new location**

Since `assets/js/script.js` is unchanged, this should still work identically, but verify it wasn't accidentally broken by the markup move: use the Playwright MCP browser tool's reduced-motion emulation (`browser_evaluate` cannot set `prefers-reduced-motion` directly; if the tool exposes an `emulateMedia`-style option use it, otherwise verify by code review that `assets/js/script.js`'s existing `prefersReducedMotionType` check — unchanged by this plan — still applies to whichever element `document.querySelector('.typewriter')` currently resolves to, which is now the subtitle's span). Confirm: first word renders statically, cursor is hidden, no console errors.

- [ ] **Step 3: Visual pass on desktop and mobile viewports**

`browser_resize` to 1440x900, `browser_take_screenshot` of the hero. Confirm the H1 reads the static original text, the subtitle's rotating word is legible and doesn't overlap or clip anything, nothing overflows horizontally, and the CTA buttons/stats row sit in their normal position (no residual shift from Task 2). Repeat at 390x844.

- [ ] **Step 4: Confirm no regressions elsewhere**

`browser_console_messages` on the fully loaded page — confirm no new errors. Scroll past the hero (or `browser_snapshot`) and confirm the services, reviews, and contact sections are visually unaffected.

- [ ] **Step 5: Final commit (if any fixes were needed)**

If Steps 1-4 required any tweaks, stage and commit them individually with a descriptive message. If nothing needed fixing, this task requires no commit — just confirmation that Tasks 1-2's commits are sufficient.
