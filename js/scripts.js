/*!
* Enhanced scripts:
* - Fix mobile collapse stuck open
* - ScrollSpy
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
  // HARD FIX: mobile menu stuck open
  // =========================
  const navCollapseEl = document.getElementById('navbarResponsive');
  const navToggler = document.querySelector('.navbar-toggler');

  let navCollapse = null;
  if (navCollapseEl && window.bootstrap) {
    navCollapse = bootstrap.Collapse.getInstance(navCollapseEl) || new bootstrap.Collapse(navCollapseEl, { toggle: false });
    navCollapse.hide(); // force closed on load
  }

  // Close when clicking a nav link (mobile)
  const responsiveNavItems = [].slice.call(document.querySelectorAll('#navbarResponsive .nav-link'));
  responsiveNavItems.forEach((item) => {
    item.addEventListener('click', () => {
      if (!navCollapseEl) return;
      if (window.getComputedStyle(navToggler).display !== 'none') {
        navCollapse?.hide();
      }
    });
  });

  // Close when clicking outside the drawer
  document.addEventListener('click', (e) => {
    if (!navCollapseEl || !navToggler) return;

    const isMobile = window.getComputedStyle(navToggler).display !== 'none';
    if (!isMobile) return;

    const clickedInsideMenu = navCollapseEl.contains(e.target);
    const clickedToggler = navToggler.contains(e.target);

    if (!clickedInsideMenu && !clickedToggler) {
      navCollapse?.hide();
    }
  });

  // Close on resize to desktop
  window.addEventListener('resize', () => {
    if (!navToggler) return;
    const isMobile = window.getComputedStyle(navToggler).display !== 'none';
    if (!isMobile) navCollapse?.hide();
  });

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

  if (modalEl && modalPlayer) {
    modalEl.addEventListener('hidden.bs.modal', () => {
      modalPlayer.src = '';
    });
  }

  document.querySelectorAll('.video-thumb[data-video]').forEach((thumb) => {
    const id = thumb.getAttribute('data-video');
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
