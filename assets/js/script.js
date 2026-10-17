document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('header');
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const navLinks = document.querySelectorAll('.nav__link');
  const sections = document.querySelectorAll('main section[id]');

  // Header shadow on scroll
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  });

  // Replay the logo reveal on hover (the entrance animation finishes at 1.5s)
  const logo = document.querySelector('.header .logo');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (logo && logo.animate) {
    const start = performance.now();
    const halves = [
      [logo.querySelector('.logo-reveal__half--left'), 'inset(0 100% 0 0)', 'inset(0 50% 0 0)'],
      [logo.querySelector('.logo-reveal__half--right'), 'inset(0 0 0 100%)', 'inset(0 0 0 50%)'],
    ];
    let playing = false;
    logo.addEventListener('mouseenter', () => {
      if (playing || reducedMotion.matches || performance.now() - start < 1500) return;
      playing = true;
      const anims = halves.map(([el, from, to]) =>
        el.animate([{ clipPath: from }, { clipPath: to }], { duration: 900, easing: 'ease' }));
      anims[0].finished.then(() => { playing = false; }, () => { playing = false; });
    });
  }

  // Mobile menu toggle
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    nav.classList.toggle('open');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('open');
      nav.classList.remove('open');
    });
  });

  // Active link highlighting (scroll-spy)
  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(section => spyObserver.observe(section));

  // Reveal on scroll. Shows at 15% visible and only resets once the element is
  // fully below the viewport, so it replays when scrolled back in from below.
  // Resetting at the same 15% line made elements flicker at the top edge: the
  // hidden state's translateY pushed them back across the threshold, forever.
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.intersectionRatio >= 0.15) {
        entry.target.classList.add('is-visible');
      } else if (!entry.isIntersecting && entry.boundingClientRect.top > 0) {
        entry.target.classList.remove('is-visible');
      }
    });
  }, { threshold: [0, 0.15] });

  // Start observing only after the page has really painted. Elements already on
  // screen at load would otherwise get is-visible before their hidden state was
  // ever rendered, so the browser skips the transition and they just pop in
  // (most noticeable on pages opened from the nav). requestAnimationFrame alone
  // isn't enough: Chrome runs frames before the first paint of a navigation.
  let revealStarted = false;
  const startReveal = () => {
    if (revealStarted) return;
    revealStarted = true;
    requestAnimationFrame(() => {
      document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
    });
  };
  if (window.PerformanceObserver && PerformanceObserver.supportedEntryTypes?.includes('paint')) {
    new PerformanceObserver((list, observer) => {
      observer.disconnect();
      startReveal();
    }).observe({ type: 'paint', buffered: true });
    setTimeout(startReveal, 1000); // in case no paint entry is ever reported
  } else {
    requestAnimationFrame(() => requestAnimationFrame(startReveal));
  }

  // Scrollytelling (service detail pages)
  document.querySelectorAll('.scrolly').forEach(scrolly => {
    const steps = scrolly.querySelectorAll('.scrolly__step');
    const visualItems = scrolly.querySelectorAll('.scrolly__visual-item');

    const setActive = (stepEl) => {
      const key = stepEl.dataset.step;
      steps.forEach(s => s.classList.toggle('is-active', s === stepEl));
      visualItems.forEach(v => v.classList.toggle('is-active', v.dataset.visual === key));
    };

    const scrollyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActive(entry.target);
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

    steps.forEach(step => scrollyObserver.observe(step));
    if (steps[0]) setActive(steps[0]);
  });

  // Parallax on service-hero decorative art
  const heroArts = document.querySelectorAll('.service-hero__art-svg');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (heroArts.length && !prefersReducedMotion) {
    let ticking = false;

    const updateParallax = () => {
      heroArts.forEach(art => {
        const section = art.closest('.service-hero');
        const offset = section.getBoundingClientRect().top * 0.12;
        art.style.transform = `translateY(${offset}px)`;
      });
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });

    updateParallax();
  }

  // Contact form (front-end only demo)
  const form = document.getElementById('contact-form');
  const success = document.getElementById('form-success');

  // Only the home page has the form.
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      success.classList.add('show');
      form.reset();
      setTimeout(() => success.classList.remove('show'), 4000);
    });
  }

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

      // Reserve the tallest height the subtitle reaches across every typed
      // state, so a word wrapping onto a new line never pushes the page down.
      // Measured instead of hard-coded: the wrap points depend on the font,
      // the copy and the viewport width.
      const subtitle = typewriterEl.closest('.hero__subtitle');
      const reserveHeight = () => {
        if (!subtitle) return;
        const current = typewriterEl.textContent;
        subtitle.style.minHeight = '';
        let tallest = 0;
        words.forEach(word => {
          for (let i = 0; i <= word.length; i++) {
            typewriterEl.textContent = word.slice(0, i);
            tallest = Math.max(tallest, subtitle.getBoundingClientRect().height);
          }
        });
        typewriterEl.textContent = current;
        subtitle.style.minHeight = `${Math.ceil(tallest)}px`;
      };

      reserveHeight();
      if (document.fonts) document.fonts.ready.then(reserveHeight);
      let lastWidth = window.innerWidth;
      window.addEventListener('resize', () => {
        if (window.innerWidth === lastWidth) return;
        lastWidth = window.innerWidth;
        reserveHeight();
      });

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
});
