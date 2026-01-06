(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* -------------------------
     Cleanup: stuck modal artifacts
  ------------------------- */
  function cleanupModalArtifacts() {
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    $$('.modal-backdrop').forEach(b => b.remove());
  }

  /* -------------------------
     Reveal animation for [data-animate]
 ------------------------- */
  function initReveal() {
    const items = $$('[data-animate]');
    if (!items.length) return;

    items.forEach((el, i) => {
      el.style.setProperty('--d', `${Math.min(i * 55, 450)}ms`);
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-visible');

        // also underline section headings when visible
        if (e.target.matches('h2')) e.target.classList.add('is-visible');

        io.unobserve(e.target);
      });
    }, { threshold: 0.15 });

    items.forEach(el => io.observe(el));
  }

  /* -------------------------
     Mobile menu: auto close on click/outside/resizes
 ------------------------- */
  function initMobileMenu() {
    const navCollapseEl = $('#navbarResponsive');
    const navToggler = $('.navbar-toggler');
    if (!navCollapseEl || !navToggler || !window.bootstrap) return;

    const collapse =
      bootstrap.Collapse.getInstance(navCollapseEl) ||
      new bootstrap.Collapse(navCollapseEl, { toggle: false });

    // Ensure starts closed on load (mobile)
    collapse.hide();
    navCollapseEl.classList.remove('show');
    navToggler.setAttribute('aria-expanded', 'false');

    // Close on nav link click (mobile only)
    $$('#navbarResponsive .nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        const isMobile = window.getComputedStyle(navToggler).display !== 'none';
        if (isMobile) collapse.hide();
      });
    });

    // Close if click outside
    document.addEventListener('click', (e) => {
      const isMobile = window.getComputedStyle(navToggler).display !== 'none';
      if (!isMobile) return;

      const clickedInsideMenu = navCollapseEl.contains(e.target);
      const clickedToggler = navToggler.contains(e.target);
      if (!clickedInsideMenu && !clickedToggler) collapse.hide();
    });

    // Close when switching to desktop
    window.addEventListener('resize', () => {
      const isMobile = window.getComputedStyle(navToggler).display !== 'none';
      if (!isMobile) collapse.hide();
    });
  }

  /* -------------------------
     Portfolio filters
 ------------------------- */
  function initPortfolioFilters() {
    function applyFilter(group, kind) {
      $$(`.portfolio-item[data-group="${group}"]`).forEach((item) => {
        const show = (kind === 'all') || (item.dataset.kind === kind);
        item.classList.toggle('is-hidden', !show);
      });
    }

    $$('[data-filter-group]').forEach((wrap) => {
      const group = wrap.getAttribute('data-filter-group');
      const buttons = $$('.filter-btn', wrap);

      buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
          buttons.forEach((b) => b.classList.remove('is-active'));
          btn.classList.add('is-active');
          applyFilter(group, btn.getAttribute('data-filter') || 'all');
        });
      });

      applyFilter(group, 'all');
    });
  }

  /* -------------------------
     Video thumbs -> Modal player
 ------------------------- */
  function initVideoThumbsAndModal() {
    const modalEl = $('#videoModal');
    const modalPlayer = $('#modalPlayer');
    const modal = (modalEl && window.bootstrap) ? new bootstrap.Modal(modalEl) : null;

    // Build thumbnails
    $$('.video-thumb[data-video]').forEach((thumb) => {
      const id = thumb.getAttribute('data-video');
      if (!id) return;

      thumb.style.setProperty('--thumb', `url('https://i.ytimg.com/vi/${id}/hqdefault.jpg')`);
      thumb.classList.add('has-thumb');

      thumb.addEventListener('click', () => {
        if (!modal || !modalPlayer) return;
        cleanupModalArtifacts();
        modalPlayer.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
        modal.show();
      });
    });

    // On close: stop video + cleanup
    if (modalEl && modalPlayer) {
      modalEl.addEventListener('hidden.bs.modal', () => {
        modalPlayer.src = '';
        cleanupModalArtifacts();
      });
    }

    // ESC safety
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') cleanupModalArtifacts();
    });
  }

  /* -------------------------
     Gallery buttons (no blur, portrait-friendly)
 ------------------------- */
  function initGalleryButtons() {
    const scroller = $('[data-gallery-scroller]');
    if (!scroller) return;

    const prev = $('[data-gallery-prev]');
    const next = $('[data-gallery-next]');

    const getStep = () => {
      const item = scroller.querySelector('.gallery-item');
      if (!item) return 320;
      const w = item.getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(scroller).gap || '14') || 14;
      return Math.round(w + gap);
    };

    const move = (dir) => scroller.scrollBy({ left: dir * getStep(), behavior: 'smooth' });

    prev?.addEventListener('click', () => move(-1));
    next?.addEventListener('click', () => move(1));
  }

  document.addEventListener('DOMContentLoaded', () => {
    cleanupModalArtifacts();
    initReveal();
    initMobileMenu();
    initPortfolioFilters();
    initVideoThumbsAndModal();
    initGalleryButtons();
  });
})();
