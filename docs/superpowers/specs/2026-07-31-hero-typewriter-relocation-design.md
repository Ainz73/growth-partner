# Hero Typewriter Relocation — Design

## Goal
Move the looping typewriter effect from the hero H1 to the hero subtitle on `index.html`, with new copy, restoring the H1 to its original static text.

## Background
The typewriter effect currently lives in the H1 (`index.html:40`): fixed lead-in "Hacemos crecer tu marca con" + a `<span class="typewriter" data-words="...">` cycling through five service phrases + a blinking `<span class="typewriter-cursor" aria-hidden="true">`. It uses gradient text (`.hero__title span`, `style.css:255-260`), a `min-height` on `.hero__title` to prevent reflow (`style.css:253`, plus a mobile override at `style.css:925`), and a JS loop in `assets/js/script.js` inside the existing `DOMContentLoaded` handler. This design relocates that mechanism to the subtitle and changes the copy on both elements.

## Scope
- `index.html` — hero H1 and hero subtitle markup only.
- `assets/css/style.css` — remove the H1-specific reflow/gradient additions tied to the typewriter; add subtitle-specific styling (color treatment, reflow protection) at both the base and the existing `max-width: 768px` breakpoint.
- `assets/js/script.js` — no logic changes. The existing typewriter loop already reads `.typewriter` / `.typewriter-cursor` generically via `document.querySelector`, so relocating which element carries those classes requires no JS edit.
- No other pages are affected.

## H1 — revert to static
```html
<h1 class="hero__title reveal">Hacemos crecer tu marca en el mundo digital</h1>
```
This is the exact original text (before the first typewriter pass), restoring `index.html:40` to a plain string with no spans.

The `.hero__title` CSS reverts too: remove the `min-height: 204px` added for the H1 typewriter (`style.css:253`, including its explanatory comment) and the mobile override `min-height: 210px` (`style.css:925`, including its comment) — the H1 is static again and needs no reflow protection. The gradient rule `.hero__title span` (`style.css:255-260`) is also removed, since no span remains inside `.hero__title`.

## Subtitle — new typewriter copy
```html
<p class="hero__subtitle reveal">Convertimos <span class="typewriter" data-words="redes sociales,publicidad,branding,contenido,presencia digital"></span><span class="typewriter-cursor" aria-hidden="true">|</span> en resultados reales para tu negocio.</p>
```
Fixed lead-in: "Convertimos ". Rotating word (from `data-words`, exact order): **redes sociales → publicidad → branding → contenido → presencia digital**. Fixed trailing text: " en resultados reales para tu negocio." Each word maps to one of the five existing service pages (redes sociales → Gestión de Redes Sociales, publicidad → Publicidad, branding → Estrategia de Marca, contenido → Producción de Contenido, presencia digital → Estrategia Digital).

## Styling
- The rotating span no longer uses the green→purple gradient (that treatment was designed for large H1 text on a light background). Instead, add a new rule so the rotating word stands out against the subtitle's smaller gray body text:
  ```css
  .hero__subtitle .typewriter {
    color: var(--purple);
    font-weight: 700;
  }
  ```
- `.typewriter-cursor` keeps its existing rule and `@keyframes typewriter-blink` (`style.css:262-269`) unchanged — cursor styling is generic, not H1-specific, so it applies equally to the subtitle instance.
- `.hero__subtitle` needs its own reflow protection, following the same pattern already proven for the H1: a `min-height` sized to the tallest wrapped state (fixed lead-in + longest rotating word + fixed trailing text, fully typed) measured empirically at both the base/desktop width and the existing `max-width: 768px` mobile breakpoint, the same two checkpoints used for the H1 fix. Exact pixel values are determined during implementation via browser measurement (per the H1 precedent, a flat two-point estimate was insufficient — measure across the 320–1920px range and pick values that cover the true worst case at each breakpoint's font-size, mirroring the reasoning already validated in this codebase).

## Script behavior
No changes. `assets/js/script.js`'s existing typewriter block already does `document.querySelector('.typewriter')` / `document.querySelector('.typewriter-cursor')` and reads the word list from `dataset.words` — it is element-agnostic and will pick up the subtitle's span/cursor once Task 1 moves the classes there. `prefers-reduced-motion` handling (render first word statically, hide cursor, no timers) is already implemented and requires no changes.

## Out of scope
- Service detail page heroes (`servicios/*.html`) — still not part of this feature.
- Any change to the JS timing constants or state machine — this is a relocation and re-copy, not a behavior change.
