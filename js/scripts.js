(() => {
  'use strict';

  document.documentElement.classList.add('js');

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  function isMobileNavVisible() {
    const toggler = $('.navbar-toggler');
    if (!toggler) return false;
    return window.getComputedStyle(toggler).display !== 'none';
  }

  function safeCollapseInstance(el) {
    if (!el || !window.bootstrap) return null;
    return bootstrap.Collapse.getInstance(el) || new bootstrap.Collapse(el, { toggle: false });
  }

  function cleanupModalArtifacts() {
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    $$('.modal-backdrop').forEach(b => b.remove());
  }

  function initReveal() {
    const nodes = $$('[data-animate]');
    if (!nodes.length) return;

    nodes.forEach((el, i) => el.style.setProperty('--d', `${Math.min(i * 55, 450)}ms`));

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      });
    }, { threshold: 0.15 });

    nodes.forEach(el => io.observe(el));
  }

  function initMobileMenu() {
    const collapseEl = $('#navbarResponsive');
    const toggler = $('.navbar-toggler');
    if (!collapseEl || !toggler) return;

    const collapse = safeCollapseInstance(collapseEl);

    // close when clicking a nav link (mobile)
    $$('#navbarResponsive .nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        if (isMobileNavVisible()) collapse?.hide();
      });
    });

    // close on outside click (mobile)
    document.addEventListener('click', (e) => {
      if (!isMobileNavVisible()) return;
      const clickedInside = collapseEl.contains(e.target) || toggler.contains(e.target);
      if (!clickedInside) collapse?.hide();
    });

    // close when switching to desktop
    window.addEventListener('resize', () => {
      if (!isMobileNavVisible()) collapse?.hide();
    });
  }

  function initPortfolioFilters() {
    function applyFilter(group, kind) {
      const items = $$(`.portfolio-item[data-group="${group}"]`);
      items.forEach((item) => {
        const itemKind = item.getAttribute('data-kind');
        const show = (kind === 'all') || (itemKind === kind);
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
          const kind = btn.getAttribute('data-filter') || 'all';
          applyFilter(group, kind);
        });
      });

      applyFilter(group, 'all');
    });
  }

  function initVideoModal() {
    const modalEl = $('#videoModal');
    const modalPlayer = $('#modalPlayer');
    if (!modalEl || !modalPlayer || !window.bootstrap) return;

    const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);

    function openVideo(id) {
      cleanupModalArtifacts();
      modalPlayer.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
      modal.show();
    }

    $$('.video-thumb[data-video]').forEach((thumb) => {
      const id = thumb.getAttribute('data-video');
      thumb.style.setProperty('--thumb', `url('https://i.ytimg.com/vi/${id}/hqdefault.jpg')`);
      thumb.classList.add('has-thumb');
      thumb.addEventListener('click', () => openVideo(id));
    });

    modalEl.addEventListener('hidden.bs.modal', () => {
      modalPlayer.src = '';
      cleanupModalArtifacts();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') cleanupModalArtifacts();
    });

    window.addEventListener('hashchange', cleanupModalArtifacts);
  }

  document.addEventListener('DOMContentLoaded', () => {
    cleanupModalArtifacts();
    initReveal();
    initMobileMenu();
    initPortfolioFilters();
    initVideoModal();
  });
})();
