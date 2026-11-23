# Reviews Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static 3-column reviews panel on Inicio and Nosotros with an auto-advancing Swiper coverflow carousel with dots.

**Architecture:** Same markup in both pages (Swiper container + empty dots group inside one `.reviews__carousel` reveal wrapper). A new page-specific script, `assets/js/reviews-carousel.js`, clones slides when there are too few for looping, builds the dots and starts Swiper. Swiper 11 is vendored locally. Without JS/Swiper the cards fall back to a horizontally scrollable row.

**Tech Stack:** Static HTML/CSS, vanilla JS, Swiper 11.1.14 (`swiper-bundle`), Playwright 1.62 tests (`playwright-tests/`, run from that folder with `npx playwright test`).

**Spec:** `docs/superpowers/specs/2026-11-23-reviews-carousel-design.md`

## Global Constraints

- Swiper `11.1.14`, files at `assets/vendor/swiper/swiper-bundle.min.js` and `assets/vendor/swiper/swiper-bundle.min.css`, loaded only by `index.html` and `nosotros.html`.
- Autoplay delay `6000` ms; `pauseOnMouseEnter: true`; `disableOnInteraction: false`; speed `800`.
- Coverflow: `rotate: 32, stretch: 0, depth: 220, modifier: 1, slideShadows: false`; `centeredSlides`, `slidesPerView: 'auto'`, `loop`, `grabCursor`, `slideToClickedSlide`, `a11y` on.
- Slide width `min(420px, 78vw)`.
- Clone when real reviews < `6`; clones = one extra copy of each real slide; clone slide gets `aria-hidden="true"` and `inert`, its figure gets class `review-card--clone`.
- Non-active card opacity `.5`; hovered non-active card opacity `.95`, `transform: scale(1.06)`, `box-shadow: var(--shadow-strong)`; active card `box-shadow: var(--shadow-strong)`.
- Dots: one `<button type="button">` per real review, `aria-label="Ver reseña de <name>"`, `aria-current="true"` only on the active one; active colour `var(--green)` (the site's magenta `#982649`), `scale(1.35)`.
- Reduced motion (`prefers-reduced-motion: reduce` at init): no autoplay, `rotate: 0, depth: 0`, `speed: 0`.
- Card look unchanged (Georgia italic quote, square avatar, name + "Cliente"), now a white tile with `box-shadow: var(--shadow)`.
- Placeholder reviews and their `TODO` comment stay as they are.
- Note: `playwright.config.ts`'s `reducedMotion: 'reduce'` does **not** reach the page; tests run with full motion unless they call `page.emulateMedia({ reducedMotion: 'reduce' })`.

## Review Focus

1. **Swiper fails to load** (blocked/404 vendor file): the three reviews must still be readable as a scrollable row, not stacked invisibly at opacity .5. → Task 1 test `reviews stay readable without Swiper`.
2. **More reviews added later** (≥ 6): no clones, one dot per review. → Task 2 test `six real reviews: no clones, six dots`.
3. **Keyboard users**: Tab to a dot and press Enter must bring that review to the centre. → Task 2 test `dots work from the keyboard`.
4. **Reader hovering to read**: carousel must not advance while the mouse is over it. → Task 2 test `pauses while hovered`.
5. **Clicking a side card**: it becomes the protagonist and its dot lights up. → Task 2 test `clicking a side review brings it to the centre`.

---

### Task 1: Carousel markup, Swiper, styles and init

**Files:**
- Create: `assets/vendor/swiper/swiper-bundle.min.js`, `assets/vendor/swiper/swiper-bundle.min.css` (download from `https://cdnjs.cloudflare.com/ajax/libs/Swiper/11.1.14/`)
- Create: `assets/js/reviews-carousel.js`
- Modify: `index.html:201-232` and `nosotros.html:157-188` (the `.reviews__grid` block), plus `<head>` stylesheet link and the scripts before `</body>`
- Modify: `assets/css/style.css:718-768` (Reviews block)
- Modify: `playwright-tests/pages/BasePage.ts`, `pages/HomePage.ts:9`, `pages/NosotrosPage.ts:9`
- Test: `playwright-tests/tests/behavior/reviews-carousel.spec.ts` (new), `tests/structure/home-sections.spec.ts`, `tests/structure/nosotros.spec.ts`

**Interfaces:**
- Produces markup (both pages, same inner cards as today):
  ```html
  <div class="reviews__carousel reveal">
    <div class="swiper reviews__swiper">
      <div class="swiper-wrapper">
        <div class="swiper-slide"><figure class="review-card">…unchanged…</figure></div>  <!-- ×3 -->
      </div>
    </div>
    <div class="reviews__dots" role="group" aria-label="Elegir reseña"></div>
  </div>
  ```
  The `reveal` class moves from the individual cards to `.reviews__carousel` only.
- Produces `window.initReviewsCarousel(root: HTMLElement): Swiper | null` in `reviews-carousel.js` (returns `null` if `window.Swiper` is missing); the file calls it on `DOMContentLoaded` for every `.reviews__carousel`. Swiper instance reachable as `root.querySelector('.reviews__swiper').swiper`.
- Produces in `BasePage`: `reviewsCarousel = page.locator('.reviews__carousel')`, `reviewDots = this.reviewsCarousel.locator('.reviews__dots button')`, `activeReviewName = this.reviewsCarousel.locator('.swiper-slide-active .review-card__name')`.
- Changes `reviewCards` in `HomePage` / `NosotrosPage` to `'#resenias .review-card:not(.review-card--clone)'` / `'.reviews .review-card:not(.review-card--clone)'`.

- [ ] **Step 1: Write the failing tests** in `tests/behavior/reviews-carousel.spec.ts`, looping over `[homePageData, nosotrosPageData]`:
  - `starts Swiper with the first review in the centre`: `.reviews__swiper` has class `/swiper-initialized/`; `activeReviewName` has text `reviewAuthors[0]`.
  - `clones are hidden from assistive tech`: `.review-card--clone` count is `3`; every `.swiper-slide:has(.review-card--clone)` has `aria-hidden="true"` and attribute `inert`.
  - `reviews stay readable without Swiper`: `page.route('**/swiper-bundle.min.js', r => r.abort())` before goto; scroll `.reviews__carousel` into view; each of the 3 `.review-card` is visible and has computed opacity `'1'`.
  - In `home-sections.spec.ts` and `nosotros.spec.ts` keep the existing assertions (`toHaveCount(3)` on the updated `reviewCards`).
- [ ] **Step 2: Run** `npx playwright test reviews-carousel home-sections nosotros` → new tests FAIL (no `.reviews__swiper`).
- [ ] **Step 3: Vendor Swiper, change markup in both pages, write `reviews-carousel.js` and replace the Reviews CSS.** CSS: drop the `.reviews__grid` grid, the per-card `.review-card.reveal` stagger rules and their reduced-motion block; keep `.clients__quote.reveal` delay rule; `.reviews__carousel.reveal { transform: none; }`; `.reviews__swiper .swiper-slide { width: min(420px, 78vw); }`; values from Global Constraints. Fallback for `.reviews__swiper:not(.swiper-initialized) .swiper-wrapper`: `display: flex; gap: 24px; overflow-x: auto; scroll-snap-type: x mandatory;` with full-opacity cards. Init: clone first (per Global Constraints), then `new Swiper(...)`. Dots come in Task 2; autoplay can already be on.
- [ ] **Step 4: Run** the same command → PASS. Open both pages at 1400px and 390px wide (CDP `setDeviceMetricsOverride`, see memory) and check: three cards visible on desktop, centre card with neighbours peeking on mobile, no horizontal page scroll.
- [ ] **Step 5: Commit** `git add assets/vendor assets/js/reviews-carousel.js assets/css/style.css index.html nosotros.html playwright-tests/pages playwright-tests/tests` → `git commit -m "Turn the reviews into a Swiper coverflow carousel"`.

### Task 2: Dots, autoplay, hover pause and reduced motion

**Files:**
- Modify: `assets/js/reviews-carousel.js`, `assets/css/style.css` (dots)
- Test: `playwright-tests/tests/behavior/reviews-carousel.spec.ts`

**Interfaces:**
- Consumes: `initReviewsCarousel`, markup and `BasePage` locators from Task 1.
- Produces: dots inside `.reviews__dots`, kept in sync on Swiper `slideChange` using `realIndex % realCount`; click → `swiper.slideToLoop(i)`.

- [ ] **Step 1: Write the failing tests** (same spec file, both pages, Inicio only where marked):
  - `shows one dot per review`: `reviewDots` count `3`; labels `Ver reseña de ${author}` for each of `reviewAuthors`; dot 0 has `aria-current="true"`, others `"false"`.
  - `a dot brings its review to the centre`: click dot 2 → `activeReviewName` = `reviewAuthors[2]`, dot 2 `aria-current="true"`.
  - `dots work from the keyboard`: `reviewDots.nth(1).focus()`, `keyboard.press('Enter')` → `activeReviewName` = `reviewAuthors[1]`.
  - `clicking a side review brings it to the centre`: click `.swiper-slide-next` → its name becomes `activeReviewName`; matching dot `aria-current="true"`.
  - `advances on its own every 6 seconds`: `activeReviewName` = `reviewAuthors[0]` after 4 s; = `reviewAuthors[1]` within 8 s of load (`{ timeout: 8000 }`). Move the mouse to `(0, 0)` first.
  - `pauses while hovered`: hover `.swiper-slide-active`, `page.waitForTimeout(7000)` → still `reviewAuthors[0]`.
  - `reduced motion: no autoplay, flat`: `page.emulateMedia({ reducedMotion: 'reduce' })` before goto; after 7 s still `reviewAuthors[0]`; `swiper.params.coverflowEffect.rotate` is `0`; clicking dot 1 still works.
  - Inicio only, `six real reviews: no clones, six dots`: `page.route('**/', …)` fulfil the fetched HTML with the three `.swiper-slide` blocks duplicated and names suffixed ` B`; expect `reviewDots` count `6` and `.review-card--clone` count `0`.
- [ ] **Step 2: Run** `npx playwright test reviews-carousel` → the new tests FAIL.
- [ ] **Step 3: Implement** dots and the reduced-motion branch (read `matchMedia('(prefers-reduced-motion: reduce)')` once at init). Dots CSS: `10px` circles, `rgba(84,35,68,.25)`, `12px` gap, `28px` above, centred; active per Global Constraints; visible `:focus-visible` outline.
- [ ] **Step 4: Run** `npx playwright test reviews-carousel` → PASS on both projects.
- [ ] **Step 5: Commit** `git commit -am "Add dots, autoplay pause and reduced motion to the reviews carousel"`.

### Task 3: Reveal, visual baselines and full suite

**Files:**
- Modify: `playwright-tests/tests/behavior/reveal.spec.ts:5-45` (`.reviews__grid` → `.reviews__carousel`, update the comment)
- Modify: `playwright-tests/pages/BasePage.ts` (`prepareForVisualSnapshot`)
- Modify: win32 baselines in `tests/visual/home.visual.spec.ts-snapshots/` and `nosotros.visual.spec.ts-snapshots/`

**Interfaces:**
- Consumes: Swiper instance at `.reviews__swiper`'s `.swiper` property.

- [ ] **Step 1: Update `reveal.spec.ts`** locators; run `npx playwright test reveal reduced-motion` → PASS (the reduced-motion "not staggered" test must still pass on both pages).
- [ ] **Step 2: Extend `prepareForVisualSnapshot`**: for each `.reviews__swiper`, if `.swiper` exists, `autoplay.stop()` then `slideToLoop(0, 0)`; then wait two animation frames.
- [ ] **Step 3: Regenerate** `npx playwright test home.visual nosotros.visual --update-snapshots`; open the four new PNGs and check the carousel shows Puerto Azul in the centre with the other two at the sides, mobile included.
- [ ] **Step 4: Run the full suite** `npx playwright test` → all pass (3 skipped as today).
- [ ] **Step 5: Commit** `git add -A playwright-tests` → `git commit -m "Update reveal tests and visual baselines for the reviews carousel"`. Linux baselines are regenerated in CI when the PR is opened (`--update-snapshots=all`, see memory).
