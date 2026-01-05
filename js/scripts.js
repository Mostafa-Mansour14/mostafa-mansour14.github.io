(() => {
  'use strict';

  document.documentElement.classList.add('js');

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  function isMobileNavVisible() {
    const toggler = $('#navToggler') || $('.navbar-toggler');
    if (!toggler) return false;
    return window.getComputedStyle(toggler).display !== 'none';
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

  // ✅ NAV: manual toggle (no bootstrap data attributes)
  function initMobileMenu() {
    const collapseEl = $('#navbarResponsive');
    const toggler = $('#navToggler') || $('.navbar-toggler');

    if (!collapseEl || !toggler || !window.bootstrap) return;

    const collapse = bootstrap.Collapse.getInstance(collapseEl) || new bootstrap.Collapse(collapseEl, { toggle: false });

    // Create backdrop once
    let backdrop = $('.nav-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'nav-backdrop';
      document.body.appendChild(backdrop);
    }

    function setNavHeightVar() {
      const nav = $('#sideNav');
      const h = nav ? Math.ceil(nav.getBoundingClientRect().height) : 64;
      document.documentElement.style.setProperty('--nav-h', `${h}px`);
    }

    function openMenu() {
      setNavHeightVar();
      collapse.show();
    }

    function closeMenu() {
      collapse.hide();
    }

    function toggleMenu() {
      const isOpen = collapseEl.classList.contains('show');
      if (isOpen) closeMenu();
      else openMenu();
    }

    function showBackdrop() {
      if (!isMobileNavVisible()) return;
      backdrop.classList.add('is-active');
      toggler.setAttribute('aria-expanded', 'true');
    }

    function hideBackdrop() {
      backdrop.classList.remove('is-active');
      toggler.setAttribute('aria-expanded', 'false');
    }

    // ✅ Use pointerdown + touchstart to avoid mobile click bugs
    const closeOnPointer = (e) => {
      e.preventDefault();
      closeMenu();
    };

    backdrop.addEventListener('pointerdown', closeOnPointer, { passive: false });
    backdrop.addEventListener('touchstart', closeOnPointer, { passive: false });

    // ✅ Toggler manual control
    toggler.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      toggleMenu();
    }, { passive: false });

    toggler.addEventListener('click', (e) => {
      e.preventDefault();
      toggleMenu();
    });

    // Bootstrap events
    collapseEl.addEventListener('shown.bs.collapse', showBackdrop);
    collapseEl.addEventListener('hidden.bs.collapse', hideBackdrop);

    // Close on nav-link click (mobile)
    $$('#navbarResponsive .nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        if (isMobileNavVisible()) closeMenu();
      });
    });

    // Extra safety: close on resize leaving mobile
    window.addEventListener('resize', () => {
      setNavHeightVar();
      if (!isMobileNavVisible()) {
        closeMenu();
        hideBackdrop();
      }
    });

    // Extra safety: hashchange
    window.addEventListener('hashchange', () => {
      if (isMobileNavVisible()) closeMenu();
    });

    // Init vars
    setNavHeightVar();
    hideBackdrop();
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
  }

  document.addEventListener('DOMContentLoaded', () => {
    cleanupModalArtifacts();
    initReveal();
    initMobileMenu();
    initPortfolioFilters();
    initVideoModal();
  });
})();
