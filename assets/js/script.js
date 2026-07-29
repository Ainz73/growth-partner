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

  // Reveal on scroll
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // Contact form (front-end only demo)
  const form = document.getElementById('contact-form');
  const success = document.getElementById('form-success');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    success.classList.add('show');
    form.reset();
    setTimeout(() => success.classList.remove('show'), 4000);
  });
});
