/*!
* Start Bootstrap - Resume v7.0.6
*/
window.addEventListener('DOMContentLoaded', () => {

  // ScrollSpy
  const sideNav = document.body.querySelector('#sideNav');
  if (sideNav) {
    new bootstrap.ScrollSpy(document.body, {
      target: '#sideNav',
      rootMargin: '0px 0px -40%',
    });
  }

  // Collapse navbar on mobile when a link is clicked
  const navbarToggler = document.body.querySelector('.navbar-toggler');
  const responsiveNavItems = [].slice.call(
    document.querySelectorAll('#navbarResponsive .nav-link')
  );

  if (navbarToggler) {
    responsiveNavItems.forEach(item => {
      item.addEventListener('click', () => {
        if (window.getComputedStyle(navbarToggler).display !== 'none') {
          navbarToggler.click();
        }
      });
    });
  }

  // Respect reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.querySelectorAll('[data-animate], .js-auto-animate').forEach(el => el.classList.add('is-visible'));
    return;
  }

  // AUTO-ADD animations to common elements (no HTML editing needed)
  const sections = document.querySelectorAll('.resume-section');

  sections.forEach(section => {
    const targets = section.querySelectorAll(`
      .resume-section-content > h1,
      .resume-section-content > h2,
      .resume-section-content > h3,
      .resume-section-content > p,
      .resume-section-content > .subheading,
      .resume-section-content > ul,
      .resume-section-content li,
      .resume-section-content .row > div,
      .resume-section-content .border,
      .resume-section-content .ratio,
      .resume-section-content .track-card,
      .resume-section-content .hero-badge,
      .resume-section-content .social-icons
    `);

    let delay = 0;
    targets.forEach(el => {
      // Don't override elements you already tagged
      if (!el.hasAttribute('data-animate')) {
        el.setAttribute('data-animate', 'lift');
        el.classList.add('js-auto-animate');
      }
      // Stagger delays for nicer flow
      el.style.setProperty('--d', `${Math.min(delay, 520)}ms`);
      delay += 60;
    });
  });

  // Intersection Observer: reveal on view
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.14 });

  document.querySelectorAll('[data-animate], .js-auto-animate').forEach(el => io.observe(el));
});
