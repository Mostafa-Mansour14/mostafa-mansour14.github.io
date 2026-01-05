/*!
* Start Bootstrap - Resume v7.0.6
* Enhanced animations + auto-reveal
*/

window.addEventListener('DOMContentLoaded', () => {
  // =========================
  // Bootstrap ScrollSpy
  // =========================
  const sideNav = document.body.querySelector('#sideNav');
  if (sideNav && window.bootstrap) {
    new bootstrap.ScrollSpy(document.body, {
      target: '#sideNav',
      rootMargin: '0px 0px -40%',
    });
  }

  // =========================
  // Collapse navbar on mobile after clicking a link
  // =========================
  const navbarToggler = document.body.querySelector('.navbar-toggler');
  const responsiveNavItems = [].slice.call(document.querySelectorAll('#navbarResponsive .nav-link'));

  if (navbarToggler) {
    responsiveNavItems.forEach((item) => {
      item.addEventListener('click', () => {
        if (window.getComputedStyle(navbarToggler).display !== 'none') {
          navbarToggler.click();
        }
      });
    });
  }

  // =========================
  // Respect reduced motion
  // =========================
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.querySelectorAll('[data-animate]').forEach((el) => el.classList.add('is-visible'));
    return;
  }

  // =========================
  // Auto-tag elements for animation (so you don't need to edit HTML a lot)
  // =========================
  const sections = document.querySelectorAll('.resume-section');

  sections.forEach((section) => {
    const targets = section.querySelectorAll(`
      .resume-section-content > h1,
      .resume-section-content > h2,
      .resume-section-content > h3,
      .resume-section-content > p,
      .resume-section-content > .subheading,
      .resume-section-content > .hero-badges,
      .resume-section-content > .track-grid,
      .resume-section-content > .social-icons,
      .resume-section-content .row > div,
      .resume-section-content .smart-card,
      .resume-section-content .border,
      .resume-section-content ul,
      .resume-section-content li,
      .resume-section-content .ratio,
      .resume-section-content .nav
    `);

    let delay = 0;
    targets.forEach((el) => {
      // keep any explicit data-animate in HTML
      if (!el.hasAttribute('data-animate')) el.setAttribute('data-animate', 'lift');

      // stagger delays
      el.style.setProperty('--d', `${Math.min(delay, 540)}ms`);
      delay += 55;
    });
  });

  // =========================
  // Reveal on scroll
  // =========================
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14 }
  );

  document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));

  // =========================
  // Bonus: animate tab switches (Portfolio)
  // =========================
  const tabButtons = document.querySelectorAll('[data-bs-toggle="tab"]');
  tabButtons.forEach((btn) => {
    btn.addEventListener('shown.bs.tab', (e) => {
      const targetSelector = e.target.getAttribute('data-bs-target');
      if (!targetSelector) return;

      const pane = document.querySelector(targetSelector);
      if (!pane) return;

      // Re-animate elements inside the newly shown tab
      const items = pane.querySelectorAll('[data-animate]');
      let delay = 0;
      items.forEach((el) => {
        el.classList.remove('is-visible');
        el.style.setProperty('--d', `${Math.min(delay, 420)}ms`);
        delay += 45;
        // small timeout to trigger transition
        setTimeout(() => el.classList.add('is-visible'), 50);
      });
    });
  });
});
/*!
* Start Bootstrap - Resume v7.0.6
* Enhanced animations + auto-reveal
*/

window.addEventListener('DOMContentLoaded', () => {
  // =========================
  // Bootstrap ScrollSpy
  // =========================
  const sideNav = document.body.querySelector('#sideNav');
  if (sideNav && window.bootstrap) {
    new bootstrap.ScrollSpy(document.body, {
      target: '#sideNav',
      rootMargin: '0px 0px -40%',
    });
  }

  // =========================
  // Collapse navbar on mobile after clicking a link
  // =========================
  const navbarToggler = document.body.querySelector('.navbar-toggler');
  const responsiveNavItems = [].slice.call(document.querySelectorAll('#navbarResponsive .nav-link'));

  if (navbarToggler) {
    responsiveNavItems.forEach((item) => {
      item.addEventListener('click', () => {
        if (window.getComputedStyle(navbarToggler).display !== 'none') {
          navbarToggler.click();
        }
      });
    });
  }

  // =========================
  // Respect reduced motion
  // =========================
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.querySelectorAll('[data-animate]').forEach((el) => el.classList.add('is-visible'));
    return;
  }

  // =========================
  // Auto-tag elements for animation (so you don't need to edit HTML a lot)
  // =========================
  const sections = document.querySelectorAll('.resume-section');

  sections.forEach((section) => {
    const targets = section.querySelectorAll(`
      .resume-section-content > h1,
      .resume-section-content > h2,
      .resume-section-content > h3,
      .resume-section-content > p,
      .resume-section-content > .subheading,
      .resume-section-content > .hero-badges,
      .resume-section-content > .track-grid,
      .resume-section-content > .social-icons,
      .resume-section-content .row > div,
      .resume-section-content .smart-card,
      .resume-section-content .border,
      .resume-section-content ul,
      .resume-section-content li,
      .resume-section-content .ratio,
      .resume-section-content .nav
    `);

    let delay = 0;
    targets.forEach((el) => {
      // keep any explicit data-animate in HTML
      if (!el.hasAttribute('data-animate')) el.setAttribute('data-animate', 'lift');

      // stagger delays
      el.style.setProperty('--d', `${Math.min(delay, 540)}ms`);
      delay += 55;
    });
  });

  // =========================
  // Reveal on scroll
  // =========================
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14 }
  );

  document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));

  // =========================
  // Bonus: animate tab switches (Portfolio)
  // =========================
  const tabButtons = document.querySelectorAll('[data-bs-toggle="tab"]');
  tabButtons.forEach((btn) => {
    btn.addEventListener('shown.bs.tab', (e) => {
      const targetSelector = e.target.getAttribute('data-bs-target');
      if (!targetSelector) return;

      const pane = document.querySelector(targetSelector);
      if (!pane) return;

      // Re-animate elements inside the newly shown tab
      const items = pane.querySelectorAll('[data-animate]');
      let delay = 0;
      items.forEach((el) => {
        el.classList.remove('is-visible');
        el.style.setProperty('--d', `${Math.min(delay, 420)}ms`);
        delay += 45;
        // small timeout to trigger transition
        setTimeout(() => el.classList.add('is-visible'), 50);
      });
    });
  });
});
