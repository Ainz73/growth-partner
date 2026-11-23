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

  function initReviewsCarousel(root) {
    const swiperEl = root.querySelector('.reviews__swiper');
    if (!window.Swiper || !swiperEl) return null;

    cloneSlidesForLoop(swiperEl.querySelector('.swiper-wrapper'));

    return new Swiper(swiperEl, {
      effect: 'coverflow',
      centeredSlides: true,
      slidesPerView: 'auto',
      loop: true,
      grabCursor: true,
      slideToClickedSlide: true,
      speed: 800,
      coverflowEffect: { rotate: 32, stretch: 0, depth: 220, modifier: 1, slideShadows: false },
      autoplay: { delay: AUTOPLAY_DELAY, pauseOnMouseEnter: true, disableOnInteraction: false },
      a11y: { enabled: true },
    });
  }

  window.initReviewsCarousel = initReviewsCarousel;
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.reviews__carousel').forEach(initReviewsCarousel);
  });
})();
