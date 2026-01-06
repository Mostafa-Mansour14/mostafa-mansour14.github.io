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

  // ✅ Premium Gallery: Auto-size based on each image ratio (perfect for Instagram portrait)
  function initGallery() {
    const scroller = $('[data-gallery-scroller]');
    if (!scroller) return;

    const items = $$('.gallery-item', scroller);
    if (!items.length) return;

    const prev = $('[data-gallery-prev]');
    const next = $('[data-gallery-next]');
    const dotsWrap = $('[data-gallery-dots]');

    // Dots
    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      items.forEach((_, i) => {
        const d = document.createElement('span');
        d.className = 'gallery-dot';
        d.addEventListener('click', () => scrollToIndex(i));
        dotsWrap.appendChild(d);
      });
    }

    // Auto size helper
    function desiredHeightPx() {
      const vh = window.innerHeight || 800;
      // height for portrait: between 420 and 720 approx
      return Math.max(420, Math.min(720, Math.round(vh * 0.62)));
    }

    function applyAutoSizes() {
      const H = desiredHeightPx();

      items.forEach((fig) => {
        const img = $('img', fig);
        if (!img) return;

        // If not loaded yet, wait
        const nw = img.naturalWidth || 0;
        const nh = img.naturalHeight || 0;

        // default portrait ratio if not ready
        const ratio = (nw > 0 && nh > 0) ? (nw / nh) : (9 / 16);

        // width based on height*ratio, clamp to keep it clean
        const W = Math.max(240, Math.min(520, Math.round(H * ratio)));

        fig.style.width = `${W}px`;
        fig.style.height = `${H}px`;
      });

      // refresh active state after resize
      setActiveByCenter();
    }

    // Active state by center
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

    prev?.addEventListener('click', () => {
      const idx = setActiveByCenter();
      scrollToIndex(idx - 1);
    });

    next?.addEventListener('click', () => {
      const idx = setActiveByCenter();
      scrollToIndex(idx + 1);
    });

    // click -> center
    items.forEach((fig) => fig.addEventListener('click', () => scrollToEl(fig)));

    // Scroll updates active
    let raf = 0;
    scroller.addEventListener('scroll', () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(setActiveByCenter);
    }, { passive: true });

    // wheel -> horizontal
    scroller.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      scroller.scrollLeft += e.deltaY;
    }, { passive: false });

    // Wait for images load to size perfectly
    const imgs = items.map(fig => $('img', fig)).filter(Boolean);

    let loadedCount = 0;
    function onOneLoaded() {
      loadedCount++;
      // apply after few loads to avoid jitter
      if (loadedCount >= Math.min(3, imgs.length)) applyAutoSizes();
    }

    imgs.forEach(img => {
      if (img.complete && img.naturalWidth) onOneLoaded();
      else img.addEventListener('load', onOneLoaded, { once: true });
    });

    // resize
    window.addEventListener('resize', () => applyAutoSizes());

    // initial
    applyAutoSizes();
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
