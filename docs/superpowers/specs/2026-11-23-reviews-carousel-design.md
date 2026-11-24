# Reviews Carousel — Design

## Goal
Replace the static 3-column reviews panel with an auto-advancing coverflow carousel: one review is the protagonist in the centre, the others sit behind it in 3D perspective, and every few seconds the next one moves to the centre. Hovering a side review makes it slightly bigger and more visible. Dots below let the visitor jump to any review.

## Why
The owner wants the section to feel alive and closer to the reference (a recipe coverflow), with one review clearly featured at a time instead of three equal columns.

## Approaches
- **Swiper 11, coverflow effect (chosen).** The owner compared four working demos (Swiper coverflow, Swiper cards, Splide, hand-made coverflow) and picked this one for its 3D look and drag support. Costs ~40 KB and an external library.
- Hand-made coverflow: no dependency, but no drag and a flatter feel. Not chosen.
- Splide / Swiper cards: rejected on look (too flat / hides the other reviews).

## Scope
- `index.html` (`#resenias`) and `nosotros.html` (`.reviews`): same markup change in both.
- `assets/css/style.css`: replace the `.reviews__grid` / `.review-card` grid and staggered-reveal rules with carousel styles. The card's look (Georgia italic quote, square avatar, name + "CLIENTE") stays; each card becomes a white tile with its own shadow.
- `assets/js/script.js`: carousel setup.
- Swiper vendored locally under `assets/vendor/swiper/` (pinned 11.x `swiper-bundle.min.js` + `.css`), loaded only on the two pages that have reviews. *Builder's call:* local, like the site's fonts, so the site and Playwright runs don't depend on a CDN.
- Playwright tests and visual baselines for both pages.

## Behaviour
- Effect: `coverflow`, `centeredSlides`, `slidesPerView: 'auto'`, `loop`, `grabCursor`, `slideToClickedSlide`, speed ~800 ms, `rotate ≈ 32, depth ≈ 220, slideShadows: false`. Card width `min(420px, 78vw)`.
- Autoplay every **6 s**; pauses while the mouse is over the carousel (`pauseOnMouseEnter`), keeps going after a drag/click (`disableOnInteraction: false`).
- Non-active slides at ~50 % opacity; on hover a side slide goes to ~95 % opacity, `scale(1.06)` and the stronger shadow. The active slide gets the stronger shadow.
- **Dots:** one per real review (3 today), custom-built so they ignore loop duplicates; active dot in `--magenta`, slightly larger. Click → `slideToLoop(i)`. Dots are `<button>`s with `aria-label="Ver reseña de <name>"` and `aria-current`.
- **Loop with few reviews:** Swiper's loop needs more slides than are visible, so when there are fewer than 6 reviews the JS clones them once. Clones get `aria-hidden="true"`, `inert`, and a `review-card--clone` class; the HTML keeps exactly one `<figure>` per real review.
- **Mobile:** same carousel; the centre card nearly fills the width with the edges of the neighbours peeking; swipe to change.
- **Reduced motion:** no autoplay, no 3D rotation (`rotate: 0, depth: 0`), instant transitions; dots and swipe still work.
- **Entrance:** the whole carousel fades in with the existing `.reveal` (no per-card stagger, which would fight Swiper's transforms).
- Swiper's `a11y` module on (slide roles, live region).

## Tests to update
- `home-sections.spec.ts`, `nosotros.spec.ts`: count/check real reviews only (`.review-card:not(.review-card--clone)`); add checks for the dots (3, clicking one makes its review active).
- `reveal.spec.ts`: drop the nested `.review-card` reveal assumptions.
- Visual specs: pause autoplay before screenshots; regenerate win32 baselines locally and Linux baselines via CI.

## Non-goals
- Real testimonials (the three placeholder reviews and their TODO stay).
- Arrows, star ratings, review pages.
