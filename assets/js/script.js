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

  // Reveal on scroll (re-triggers every time an element enters/leaves the viewport)
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      entry.target.classList.toggle('is-visible', entry.isIntersecting);
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

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

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    success.classList.add('show');
    form.reset();
    setTimeout(() => success.classList.remove('show'), 4000);
  });

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
});
