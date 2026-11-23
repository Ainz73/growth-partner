// Reviews coverflow carousel (Inicio and Nosotros). Needs Swiper, loaded just
// before this file; without it the reviews stay a plain scrollable row.
(() => {
  const AUTOPLAY_DELAY = 6000;
  // Swiper's loop needs more slides than fit on screen; below this many real
  // reviews each one is cloned once.
  const MIN_LOOP_SLIDES = 6;

  function cloneSlidesForLoop(wrapper) {
    const slides = [...wrapper.children];
    if (slides.length >= MIN_LOOP_SLIDES) return;
    for (const slide of slides) {
      const clone = slide.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.inert = true;
      clone.querySelector('.review-card').classList.add('review-card--clone');
      wrapper.appendChild(clone);
    }
  }

  // One button per real review; returns a function that marks the active one.
  function buildDots(container, names, onPick) {
    const dots = names.map((name, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Ver reseña de ${name}`);
      dot.addEventListener('click', () => onPick(i));
      container.appendChild(dot);
      return dot;
    });
    return active => dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === active)));
  }

  function initReviewsCarousel(root) {
    const swiperEl = root.querySelector('.reviews__swiper');
    if (!window.Swiper || !swiperEl) return null;

    const wrapper = swiperEl.querySelector('.swiper-wrapper');
    const names = [...wrapper.querySelectorAll('.review-card__name')].map(el => el.textContent.trim());
    cloneSlidesForLoop(wrapper);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const swiper = new Swiper(swiperEl, {
      effect: 'coverflow',
      centeredSlides: true,
      slidesPerView: 'auto',
      loop: true,
      grabCursor: true,
      slideToClickedSlide: true,
      speed: reduceMotion ? 0 : 800,
      coverflowEffect: reduceMotion
        ? { rotate: 0, stretch: 0, depth: 0, modifier: 1, slideShadows: false }
        : { rotate: 32, stretch: 0, depth: 220, modifier: 1, slideShadows: false },
      autoplay: reduceMotion
        ? false
        : { delay: AUTOPLAY_DELAY, pauseOnMouseEnter: true, disableOnInteraction: false },
      a11y: { enabled: true },
    });

    const dotsEl = root.querySelector('.reviews__dots');
    if (dotsEl) {
      const setActive = buildDots(dotsEl, names, i => swiper.slideToLoop(i));
      setActive(0);
      swiper.on('slideChange', () => setActive(swiper.realIndex % names.length));
    }
    return swiper;
  }

  window.initReviewsCarousel = initReviewsCarousel;
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.reviews__carousel').forEach(initReviewsCarousel);
  });
})();
