(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  function cleanupModalArtifacts() {
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    $$('.modal-backdrop').forEach(b => b.remove());
  }

  function initReveal() {
    const items = $$('[data-animate]');
    if (!items.length) return;

    items.forEach((el, i) => el.style.setProperty('--d', `${Math.min(i * 55, 450)}ms`));

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-visible');

        // underline h2 titles
        if (e.target.matches('.resume-section-content > h2')) {
          e.target.classList.add('is-visible');
        }

        io.unobserve(e.target);
      });
    }, { threshold: 0.15 });

    items.forEach(el => io.observe(el));
  }

  function initMobileMenu() {
    const navCollapseEl = $('#navbarResponsive');
    const navToggler = $('.navbar-toggler');
    if (!navCollapseEl || !navToggler || !window.bootstrap) return;

    const collapse =
      bootstrap.Collapse.getInstance(navCollapseEl) ||
      new bootstrap.Collapse(navCollapseEl, { toggle: false });

    collapse.hide();
    navCollapseEl.classList.remove('show');
    navToggler.setAttribute('aria-expanded', 'false');

    $$('#navbarResponsive .nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        const isMobile = window.getComputedStyle(navToggler).display !== 'none';
        if (isMobile) collapse.hide();
      });
    });

    document.addEventListener('click', (e) => {
      const isMobile = window.getComputedStyle(navToggler).display !== 'none';
      if (!isMobile) return;

      const clickedInsideMenu = navCollapseEl.contains(e.target);
      const clickedToggler = navToggler.contains(e.target);
      if (!clickedInsideMenu && !clickedToggler) collapse.hide();
    });

    window.addEventListener('resize', () => {
      const isMobile = window.getComputedStyle(navToggler).display !== 'none';
      if (!isMobile) collapse.hide();
    });
  }

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

  function initVideoThumbsAndModal() {
    const modalEl = $('#videoModal');
    const modalPlayer = $('#modalPlayer');
    const modal = (modalEl && window.bootstrap) ? new bootstrap.Modal(modalEl) : null;

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

    if (modalEl && modalPlayer) {
      modalEl.addEventListener('hidden.bs.modal', () => {
        modalPlayer.src = '';
        cleanupModalArtifacts();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') cleanupModalArtifacts();
    });
  }

  function initGallery() {
    const scroller = $('[data-gallery-scroller]');
    if (!scroller) return;

    const items = $$('.gallery-item', scroller);
    if (!items.length) return;

    const prev = $('[data-gallery-prev]');
    const next = $('[data-gallery-next]');
    const dotsWrap = $('[data-gallery-dots]');

    // Build dots
    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      items.forEach((_, i) => {
        const d = document.createElement('span');
        d.className = 'gallery-dot';
        d.addEventListener('click', () => scrollToIndex(i));
        dotsWrap.appendChild(d);
      });
    }

    const imageModalEl = $('#imageModal');
    const imageModalImg = $('#imageModalImg');
    const imageModal = (imageModalEl && window.bootstrap) ? new bootstrap.Modal(imageModalEl) : null;

    function setActiveByCenter() {
      const rect = scroller.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;

      let bestIdx = 0;
      let bestDist = Infinity;

      items.forEach((el, idx) => {
        const r = el.getBoundingClientRect();
        const elCenter = r.left + r.width / 2;
        const dist = Math.abs(centerX - elCenter);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = idx;
        }
      });

      items.forEach((el, idx) => el.classList.toggle('is-active', idx === bestIdx));
      if (dotsWrap) {
        Array.from(dotsWrap.children).forEach((dot, idx) => dot.classList.toggle('is-active', idx === bestIdx));
      }

      return bestIdx;
    }

    function scrollToEl(el) {
      const left = el.offsetLeft - (scroller.clientWidth - el.clientWidth) / 2;
      scroller.scrollTo({ left, behavior: 'smooth' });
    }

    function scrollToIndex(i) {
      const idx = Math.max(0, Math.min(items.length - 1, i));
      scrollToEl(items[idx]);
    }

    // Buttons
    prev?.addEventListener('click', () => {
      const idx = setActiveByCenter();
      scrollToIndex(idx - 1);
    });
    next?.addEventListener('click', () => {
      const idx = setActiveByCenter();
      scrollToIndex(idx + 1);
    });

    // Drag scroll (desktop)
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

    // Wheel -> horizontal
    scroller.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      scroller.scrollLeft += e.deltaY;
    }, { passive: false });

    // Click item => center, double click => open
    items.forEach((fig) => {
      fig.addEventListener('click', () => scrollToEl(fig));
      fig.addEventListener('dblclick', () => {
        const img = $('img', fig);
        if (!img || !imageModal || !imageModalImg) return;
        imageModalImg.src = img.src;
        imageModal.show();
      });
    });

    // Scroll updates active
    let raf = 0;
    scroller.addEventListener('scroll', () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(setActiveByCenter);
    }, { passive: true });

    // Init
    setActiveByCenter();
    scrollToIndex(0);
  }

  document.addEventListener('DOMContentLoaded', () => {
    cleanupModalArtifacts();
    initReveal();
    initMobileMenu();
    initPortfolioFilters();
    initVideoThumbsAndModal();
    initGallery();

    window.addEventListener('hashchange', cleanupModalArtifacts);
  });
})();
