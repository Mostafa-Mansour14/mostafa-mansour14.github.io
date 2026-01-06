(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* =========================================
     SAFETY: remove stuck modal artifacts
     ========================================= */
  function cleanupModalArtifacts() {
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    $$('.modal-backdrop').forEach(b => b.remove());
  }

  /* =========================================
     REVEAL animation for [data-animate]
     ========================================= */
  function initReveal() {
    const items = $$('[data-animate]');
    if (!items.length) return;

    items.forEach((el, i) => el.style.setProperty('--d', `${Math.min(i * 55, 450)}ms`));

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-visible');
        if (e.target.matches('.resume-section-content > h2')) e.target.classList.add('is-visible');
        io.unobserve(e.target);
      });
    }, { threshold: 0.15 });

    items.forEach(el => io.observe(el));
  }

  /* =========================================
     MOBILE MENU: auto close (click / outside / resize)
     ========================================= */
  function initMobileMenu() {
    const navCollapseEl = $('#navbarResponsive');
    const navToggler = $('.navbar-toggler');
    if (!navCollapseEl || !navToggler || !window.bootstrap) return;

    const collapse =
      bootstrap.Collapse.getInstance(navCollapseEl) ||
      new bootstrap.Collapse(navCollapseEl, { toggle: false });

    // Start closed (mobile)
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

  /* =========================================
     PORTFOLIO FILTERS
     ========================================= */
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

  /* =========================================
     VIDEO THUMBS => MODAL (YouTube)
     ========================================= */
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

  /* =========================================
     PREMIUM GALLERY (Center-focus + dots + drag + modal)
     REQUIREMENTS in HTML:
       - [data-gallery-scroller]
       - .gallery-item img inside .gallery-media
       - buttons: [data-gallery-prev], [data-gallery-next]
       - dots container: [data-gallery-dots]
       - image modal: #imageModal + #imageModalImg
     ========================================= */
  function initPremiumGallery() {
    const scroller = $('[data-gallery-scroller]');
    if (!scroller) return; // gallery not added yet

    const items = Array.from(scroller.querySelectorAll('.gallery-item'));
    if (!items.length) return;

    const prev = $('[data-gallery-prev]');
    const next = $('[data-gallery-next]');
    const dotsWrap = $('[data-gallery-dots]');

    const modalEl = $('#imageModal');
    const modalImg = $('#imageModalImg');
    const imageModal = (modalEl && window.bootstrap) ? new bootstrap.Modal(modalEl) : null;

    // set blurred background from image src
    items.forEach((fig) => {
      const img = $('img', fig);
      const media = $('.gallery-media', fig);
      if (img && media) media.style.setProperty('--bg', `url("${img.src}")`);
    });

    // dots
    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      items.forEach((_, i) => {
        const d = document.createElement('span');
        d.className = 'gallery-dot';
        d.addEventListener('click', () => scrollToIndex(i));
        dotsWrap.appendChild(d);
      });
    }

    const setActiveByCenter = () => {
      const rect = scroller.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;

      let best = null;
      let bestDist = Infinity;

      items.forEach((el) => {
        const r = el.getBoundingClientRect();
        const elCenter = r.left + r.width / 2;
        const d = Math.abs(centerX - elCenter);
        if (d < bestDist) { bestDist = d; best = el; }
      });

      items.forEach((el, idx) => {
        const active = (el === best);
        el.classList.toggle('is-active', active);
        const dot = dotsWrap?.children?.[idx];
        if (dot) dot.classList.toggle('is-active', active);
      });

      return best;
    };

    const scrollToEl = (el) => {
      if (!el) return;
      const left = el.offsetLeft - (scroller.clientWidth - el.clientWidth) / 2;
      scroller.scrollTo({ left, behavior: 'smooth' });
    };

    function scrollToIndex(i) {
      const idx = Math.max(0, Math.min(items.length - 1, i));
      scrollToEl(items[idx]);
    }

    function getActiveIndex() {
      const idx = items.findIndex(i => i.classList.contains('is-active'));
      return idx >= 0 ? idx : 0;
    }

    // buttons
    prev?.addEventListener('click', () => scrollToIndex(getActiveIndex() - 1));
    next?.addEventListener('click', () => scrollToIndex(getActiveIndex() + 1));

    // drag scroll (desktop)
    let isDown = false;
    let startX = 0;
    let startScroll = 0;

    scroller.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX;
      startScroll = scroller.scrollLeft;
    });

    window.addEventListener('mouseup', () => { isDown = false; });

    window.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const dx = (e.pageX - startX);
      scroller.scrollLeft = startScroll - dx;
    });

    // wheel -> horizontal (premium)
    scroller.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      scroller.scrollLeft += e.deltaY;
    }, { passive: false });

    // click to center / view
    items.forEach((fig) => {
      fig.addEventListener('click', (e) => {
        const viewBtn = e.target.closest('[data-gallery-view]');
        const img = $('img', fig);

        if (viewBtn && img && imageModal && modalImg) {
          modalImg.src = img.src;
          imageModal.show();
          return;
        }
        scrollToEl(fig);
      });
    });

    // update active on scroll
    let raf = 0;
    scroller.addEventListener('scroll', () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(setActiveByCenter);
    }, { passive: true });

    // init
    setActiveByCenter();
    scrollToIndex(0);
  }

  /* =========================================
     START
     ========================================= */
  document.addEventListener('DOMContentLoaded', () => {
    cleanupModalArtifacts();
    initReveal();
    initMobileMenu();
    initPortfolioFilters();
    initVideoThumbsAndModal();
    initPremiumGallery();

    // extra safety
    window.addEventListener('hashchange', cleanupModalArtifacts);
  });
})();
