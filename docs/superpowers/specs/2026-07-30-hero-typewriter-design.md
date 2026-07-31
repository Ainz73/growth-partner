# Hero Typewriter Effect — Design

## Goal
Add a typewriter effect to the hero (`#inicio`) headline on `index.html` to make the entry point feel more dynamic and to surface the range of services offered.

## Scope
- `index.html` — hero H1 markup only.
- `assets/css/style.css` — cursor blink animation + minor typewriter span styling.
- `assets/js/script.js` — new typewriter behavior inside the existing `DOMContentLoaded` handler.
- No other pages are affected in this pass.

## Behavior
The H1 keeps its fixed lead-in text ("Hacemos crecer tu marca con") and replaces the current static gradient `<span>` with a dynamic one that types, pauses, deletes, and types the next word — looping indefinitely — cycling through:

1. estrategia digital
2. redes sociales
3. publicidad
4. contenido que conecta
5. una marca sólida

Each word maps to one of the five existing service pages, tying the homepage hero back to the services grid.

## Markup
```html
<h1 class="hero__title reveal">Hacemos crecer tu marca con
  <span class="typewriter" data-words="estrategia digital,redes sociales,publicidad,contenido que conecta,una marca sólida"></span><span class="typewriter-cursor">|</span>
</h1>
```

## Styling
- The `.typewriter` span reuses the existing `.hero__title span` gradient (green → purple, `background-clip: text`) — no new colors introduced.
- `.typewriter-cursor` blinks via a `@keyframes blink` animation (opacity toggle, ~1s step interval).

## Script behavior
- New function added inside the existing `DOMContentLoaded` block in `script.js`, following the file's established pattern (e.g. the parallax block).
- Reads the word list from `data-words` on `.typewriter`.
- Types each word character-by-character, pauses, deletes character-by-character, advances to the next word, loops.
- Respects `prefers-reduced-motion`: if set, renders the first word statically with no animation and no blinking cursor (same convention already used for the parallax effect).
- No external dependencies.

## Out of scope
- Service detail page heroes (`servicios/*.html`) — explicitly deferred per user's answer to the location question.
- Configurable timing/speed via data attributes — hardcoded constants are sufficient for this single use case.
