/*!
* Enhanced scripts:
* - ScrollSpy
* - Mobile nav auto-close + force-close on load
* - Reveal animations
* - Portfolio filters
* - Shorts thumbnails => Modal player
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
  // Fix: hamburger menu "always open" on mobile
  // =========================
  const navCollapse = document.getElementById('navbarResponsive');
  const navToggler = document.querySelector('.navbar-toggler');

  if (navCollapse?.classList.contains('show')) navCollapse.classList.remove('show');
  if (navToggler) navToggler.setAttribute('aria-expanded', 'false');

  // Close menu after clicking a link (mobile)
  const responsiveNavItems = [].slice.call(document.querySelectorAll('#navbarResponsive .nav-link'));
  if (navToggler) {
    responsiveNavItems.forEach((item) => {
      item.addEventListener('click', () => {
        if (window.getComputedStyle(navToggler).display !== 'none') {
          navToggler.click();
        }
      });
    });
  }

  // =========================
  // Reduced motion support
  // =========================
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.querySelectorAll('[data-animate]').forEach((el) => el.classList.add('is-visible'));
  } else {
    // Auto-tag elements for animation
    document.querySelectorAll('.resume-section').forEach((section) => {
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
        .resume-section-content ul,
        .resume-section-content li,
        .resume-section-content .nav
      `);

      let delay = 0;
      targets.forEach((el) => {
        if (!el.hasAttribute('data-animate')) el.setAttribute('data-animate', 'lift');
        el.style.setProperty('--d', `${Math.min(delay, 540)}ms`);
        delay += 55;
      });
    });

    // Reveal on scroll
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
  }

  // =========================
  // Portfolio Filters
  // =========================
  function applyFilter(group, kind) {
    const items = document.querySelectorAll(`.portfolio-item[data-group="${group}"]`);
    items.forEach((item) => {
      const itemKind = item.getAttribute('data-kind');
      const show = (kind === 'all') || (itemKind === kind);
      item.classList.toggle('is-hidden', !show);
    });
  }

  document.querySelectorAll('[data-filter-group]').forEach((wrap) => {
    const group = wrap.getAttribute('data-filter-group');
    const buttons = wrap.querySelectorAll('.filter-btn');

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const kind = btn.getAttribute('data-filter') || 'all';
        applyFilter(group, kind);
      });
    });

    applyFilter(group, 'all');
  });

  // =========================
  // Shorts thumbnails => Modal player
  // =========================
  const modalEl = document.getElementById('videoModal');
  const modalPlayer = document.getElementById('modalPlayer');
  const modal = (modalEl && window.bootstrap) ? new bootstrap.Modal(modalEl) : null;

  function openVideo(id) {
    if (!modal || !modalPlayer) return;
    modalPlayer.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    modal.show();
  }

  // stop video on close
  if (modalEl && modalPlayer) {
    modalEl.addEventListener('hidden.bs.modal', () => {
      modalPlayer.src = '';
    });
  }

  // thumbnail backgrounds + click
  document.querySelectorAll('.video-thumb[data-video]').forEach((thumb) => {
    const id = thumb.getAttribute('data-video');
    // set CSS variable for pseudo element background (styles.css should use --thumb on ::before)
    thumb.style.setProperty('--thumb', `url('https://i.ytimg.com/vi/${id}/hqdefault.jpg')`);
    thumb.classList.add('has-thumb');

    thumb.addEventListener('click', () => openVideo(id));
    thumb.setAttribute('role', 'button');
    thumb.setAttribute('tabindex', '0');

    thumb.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openVideo(id);
      }
    });
  });
});
