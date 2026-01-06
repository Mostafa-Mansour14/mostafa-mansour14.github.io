(() => {
  'use strict';

  /* enable JS flag for animations */
  document.documentElement.classList.add('js');

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* -------------------------
     Safety cleanup (modals)
  ------------------------- */
  function cleanupModalArtifacts() {
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    $$('.modal-backdrop').forEach(b => b.remove());
  }

  /* -------------------------
     Reveal animation
  ------------------------- */
  function initReveal() {
    const items = $$('[data-animate]');
    if (!items.length) return;

    items.forEach((el, i) =>
      el.style.setProperty('--d', `${Math.min(i * 55, 450)}ms`)
    );

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      });
    }, { threshold: 0.15 });

    items.forEach(el => io.observe(el));
  }

  /* -------------------------
     Mobile menu (stable)
  ------------------------- */
  function initMobileMenu() {
    const collapseEl = $('#navbarResponsive');
    const toggler = $('#navToggler') || $('.navbar-toggler');
    if (!collapseEl || !toggler || !window.bootstrap) return;

    const collapse =
      bootstrap.Collapse.getInstance(collapseEl) ||
      new bootstrap.Collapse(collapseEl, { toggle: false });

    let backdrop = $('.nav-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'nav-backdrop';
      document.body.appendChild(backdrop);
    }

    function isMobile() {
      return window.getComputedStyle(toggler).display !== 'none';
    }

    function setNavHeight() {
      const nav = $('#sideNav');
      const h = nav ? nav.getBoundingClientRect().height : 64;
      document.documentElement.style.setProperty('--nav-h', `${Math.ceil(h)}px`);
    }

    function openMenu() {
      setNavHeight();
      collapse.show();
      backdrop.classList.add('is-active');
      toggler.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
      collapse.hide();
      backdrop.classList.remove('is-active');
      toggler.setAttribute('aria-expanded', 'false');
    }

    toggler.addEventListener('click', (e) => {
      e.preventDefault();
      collapseEl.classList.contains('show') ? closeMenu() : openMenu();
    });

    backdrop.addEventListener('click', closeMenu);

    $$('#navbarResponsive .nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (isMobile()) closeMenu();
      });
    });

    window.addEventListener('resize', () => {
      setNavHeight();
      if (!isMobile()) closeMenu();
    });

    setNavHeight();
  }

  /* -------------------------
     Portfolio filters
  ------------------------- */
  function initPortfolioFilters() {
    function apply(group, kind) {
      $$(`.portfolio-item[data-group="${group}"]`).forEach(item => {
        const show = kind === 'all' || item.dataset.kind === kind;
        item.classList.toggle('is-hidden', !show);
      });
    }

    $$('[data-filter-group]').forEach(wrap => {
      const group = wrap.dataset.filterGroup;
      const buttons = $$('.filter-btn', wrap);

      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          buttons.forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');
          apply(group, btn.dataset.filter || 'all');
        });
      });

      apply(group, 'all');
    });
  }

  /* -------------------------
     Video modal
  ------------------------- */
  function initVideoModal() {
    const modalEl = $('#videoModal');
    const player = $('#modalPlayer');
    if (!modalEl || !player || !window.bootstrap) return;

    const modal =
      bootstrap.Modal.getInstance(modalEl) ||
      new bootstrap.Modal(modalEl);

    $$('.video-thumb[data-video]').forEach(thumb => {
      const id = thumb.dataset.video;
      thumb.style.setProperty(
        '--thumb',
        `url('https://i.ytimg.com/vi/${id}/hqdefault.jpg')`
      );
      thumb.classList.add('has-thumb');
      thumb.addEventListener('click', () => {
        cleanupModalArtifacts();
        player.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
        modal.show();
      });
    });

    modalEl.addEventListener('hidden.bs.modal', () => {
      player.src = '';
      cleanupModalArtifacts();
    });
  }

  /* -------------------------
     Gallery (horizontal RTL)
  ------------------------- */
  function initGallery() {
    const scroller = $('[data-gallery-scroller]');
    if (!scroller) return;

    const prev = $('[data-gallery-prev]');
    const next = $('[data-gallery-next]');

    const step = () => {
      const item = scroller.querySelector('.gallery-item');
      if (!item) return 320;
      const gap = parseFloat(getComputedStyle(scroller).gap || '14');
      return item.getBoundingClientRect().width + gap;
    };

    const move = dir => {
      scroller.scrollBy({ left: dir * step(), behavior: 'smooth' });
    };

    prev?.addEventListener('click', () => move(-1));
    next?.addEventListener('click', () => move(1));
  }

  /* -------------------------
     Init
  ------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    cleanupModalArtifacts();
    initReveal();
    initMobileMenu();
    initPortfolioFilters();
    initVideoModal();
    initGallery();
  });
})();
