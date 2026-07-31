# Hero Typewriter Effect Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a looping typewriter effect to the hero H1 on `index.html` that cycles through five service-related phrases.

**Architecture:** Pure HTML/CSS/JS, no build step, no dependencies. This is a static site (`git ls-files`: `index.html`, `servicios/*.html`, `assets/css/style.css`, `assets/js/script.js`, images — no `package.json`, no test runner). All "testing" in this plan is manual verification in a real browser via the Playwright MCP tools, matching how this project is validated elsewhere.

**Tech Stack:** Vanilla JS (`assets/js/script.js`, single `DOMContentLoaded` handler), plain CSS (`assets/css/style.css`), static HTML (`index.html`).

## Global Constraints

- No new dependencies, no build tooling — plain HTML/CSS/JS only, per existing project conventions.
- Reuse the existing `.hero__title span` gradient rule (style.css:249-254) instead of duplicating gradient CSS — confirmed the selector is generic (`span`, not a specific class) so it already applies to any new span placed inside `.hero__title`.
- Must respect `prefers-reduced-motion`, following the exact convention already used for the parallax effect in `script.js:75` (`window.matchMedia('(prefers-reduced-motion: reduce)').matches`, checked once, effect skipped/simplified if true).
- Word list (exact strings, in this order): `estrategia digital`, `redes sociales`, `publicidad`, `contenido que conecta`, `una marca sólida`.
- Fixed lead-in text stays: `Hacemos crecer tu marca con`.
- Scope is `index.html` hero only — do not touch `servicios/*.html` heroes.

---

### Task 1: Hero markup — add typewriter spans

**Files:**
- Modify: `index.html:40`

**Interfaces:**
- Produces: a `span.typewriter` element with a `data-words` attribute (comma-separated phrase list, no spaces around commas) that Task 3's JS reads via `dataset.words`. Produces a sibling `span.typewriter-cursor` element that Task 2's CSS animates and Task 3's JS may hide.

- [ ] **Step 1: Replace the static span in the H1**

Current line (`index.html:40`):
```html
      <h1 class="hero__title reveal">Hacemos crecer tu marca <span>en el mundo digital</span></h1>
```

Replace with:
```html
      <h1 class="hero__title reveal">Hacemos crecer tu marca con <span class="typewriter" data-words="estrategia digital,redes sociales,publicidad,contenido que conecta,una marca sólida"></span><span class="typewriter-cursor">|</span></h1>
```

- [ ] **Step 2: Verify markup renders without the old copy**

Use the Playwright MCP browser tool:
1. `browser_navigate` to the local `index.html` (open the file directly, e.g. `file:///d:/ClaudePro/index.html`, or via a local static server if one is already running for this project).
2. `browser_snapshot` and confirm the H1 reads "Hacemos crecer tu marca con |" (empty typewriter span, visible `|` cursor, no JS behavior yet — that's expected, Task 3 adds it).
3. Confirm no console errors from `browser_console_messages`.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Add typewriter markup to hero H1"
```

---

### Task 2: Cursor blink CSS

**Files:**
- Modify: `assets/css/style.css` (insert after the `.hero__title span` rule, i.e. after line 254)

**Interfaces:**
- Consumes: `span.typewriter-cursor` element produced by Task 1.
- Produces: a blinking cursor via the `.typewriter-cursor` class + `typewriter-blink` keyframes. Task 3's JS may set `cursorEl.style.display = 'none'` to suppress it (relies on this class existing, no other coupling).

- [ ] **Step 1: Add the cursor blink rules**

Insert immediately after the existing block at `style.css:249-254`:
```css
.hero__title span {
  background: linear-gradient(135deg, var(--green), var(--purple));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.typewriter-cursor {
  display: inline-block;
  animation: typewriter-blink 1s step-end infinite;
}

@keyframes typewriter-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
```
(Only the `.typewriter-cursor` rule and the `@keyframes typewriter-blink` block are new — the `.hero__title span` rule shown above is existing context to locate the insertion point.)

- [ ] **Step 2: Verify the cursor blinks and matches the gradient**

Using the Playwright MCP browser tool on the already-open `index.html`:
1. `browser_take_screenshot` of the hero section.
2. Wait ~1s (`browser_wait_for`) and take a second screenshot.
3. Confirm the `|` cursor's opacity visibly differs between the two screenshots (blinking), and that it renders in the green→purple gradient (inherited from `.hero__title span`, since `.typewriter-cursor` is itself a `span` inside `.hero__title`).

- [ ] **Step 3: Commit**

```bash
git add assets/css/style.css
git commit -m "Add blinking cursor animation for hero typewriter"
```

---

### Task 3: Typewriter JS behavior

**Files:**
- Modify: `assets/js/script.js` (insert new block inside the existing `DOMContentLoaded` handler, after the contact form block at lines 99-108, before the handler's closing `});` on line 109)

**Interfaces:**
- Consumes: `span.typewriter[data-words]` and `span.typewriter-cursor` from Task 1; `.typewriter-cursor` CSS class from Task 2.
- Produces: the finished, user-visible feature. No later task depends on this.

- [ ] **Step 1: Add the typewriter loop**

Insert after the contact form block (`script.js:99-108`), still inside the `DOMContentLoaded` callback, before its closing `});`:

```javascript
  // Hero typewriter
  const typewriterEl = document.querySelector('.typewriter');
  const typewriterCursor = document.querySelector('.typewriter-cursor');

  if (typewriterEl) {
    const words = typewriterEl.dataset.words.split(',');
    const prefersReducedMotionType = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotionType) {
      typewriterEl.textContent = words[0];
      if (typewriterCursor) typewriterCursor.style.display = 'none';
    } else {
      const TYPE_SPEED = 80;
      const DELETE_SPEED = 45;
      const PAUSE_AFTER_TYPE = 1800;
      const PAUSE_AFTER_DELETE = 300;

      let wordIndex = 0;
      let charIndex = 0;
      let deleting = false;

      const tick = () => {
        const currentWord = words[wordIndex];

        if (!deleting) {
          charIndex++;
          typewriterEl.textContent = currentWord.slice(0, charIndex);

          if (charIndex === currentWord.length) {
            deleting = true;
            setTimeout(tick, PAUSE_AFTER_TYPE);
            return;
          }
          setTimeout(tick, TYPE_SPEED);
        } else {
          charIndex--;
          typewriterEl.textContent = currentWord.slice(0, charIndex);

          if (charIndex === 0) {
            deleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            setTimeout(tick, PAUSE_AFTER_DELETE);
            return;
          }
          setTimeout(tick, DELETE_SPEED);
        }
      };

      tick();
    }
  }
```

- [ ] **Step 2: Verify the loop cycles through all five words**

Using the Playwright MCP browser tool, reload `index.html` and:
1. `browser_evaluate` running `() => document.querySelector('.typewriter').textContent` immediately after load — expect a short/empty string (still typing the first word).
2. `browser_wait_for` ~3s, then re-run the same `browser_evaluate` — expect `"estrategia digital"` fully typed (verifies typing completes and matches the exact first word from `data-words`).
3. `browser_wait_for` an additional ~3s (past the delete + retype cycle), then re-run `browser_evaluate` — expect the text to now be mid- or fully-typing `"redes sociales"` (verifies the loop advances to the second word).
4. `browser_console_messages` — confirm no errors (e.g. no `undefined` from a bad `dataset.words` split).

- [ ] **Step 3: Verify `prefers-reduced-motion` is respected**

Using the Playwright MCP browser tool:
1. `browser_evaluate` to emulate reduced motion is not directly available; instead use `browser_navigate` with the browser's reduced-motion emulation if the tool exposes it, or manually confirm via code review that `window.matchMedia('(prefers-reduced-motion: reduce)').matches` gates the branch (Step 1 code above) exactly like the existing parallax check at `script.js:75`.
2. Confirm by reading the code: when `prefersReducedMotionType` is `true`, `typewriterEl.textContent` is set once to `words[0]` (`"estrategia digital"`) and `typewriterCursor.style.display` is set to `'none'` — no `setTimeout`/loop runs.

- [ ] **Step 4: Commit**

```bash
git add assets/js/script.js
git commit -m "Add hero typewriter cycling behavior"
```

---

### Task 4: Full-page manual verification

**Files:** none (verification only)

**Interfaces:**
- Consumes: the completed feature from Tasks 1-3.

- [ ] **Step 1: Visual pass on desktop viewport**

Using the Playwright MCP browser tool: `browser_navigate` to `index.html`, `browser_resize` to a desktop width (e.g. 1440x900), `browser_take_screenshot` of the hero section. Confirm the gradient text, cursor, and layout look correct and nothing overflows or wraps awkwardly.

- [ ] **Step 2: Visual pass on mobile viewport**

`browser_resize` to a mobile width (e.g. 390x844), `browser_take_screenshot` of the hero section. Confirm the H1 with the typewriter span still wraps cleanly and doesn't overflow horizontally (per this project's existing mobile-first convention of checking responsiveness continuously).

- [ ] **Step 3: Confirm no regressions elsewhere on the page**

`browser_console_messages` on the fully loaded page — confirm no new errors. Manually scroll (or `browser_snapshot`) past the hero to confirm the rest of `index.html` (services, reviews, contact) is unaffected.

- [ ] **Step 4: Final commit (if any fixes were needed)**

If Steps 1-3 required any tweaks, stage and commit them individually with a descriptive message. If no fixes were needed, this task requires no commit — just confirmation that Tasks 1-3's commits are sufficient.
