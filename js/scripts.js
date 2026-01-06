window.addEventListener('DOMContentLoaded', () => {
  const navCollapseEl = document.getElementById('navbarResponsive');
  const navToggler = document.querySelector('.navbar-toggler');

  // -------------------------
  // HARD CLEANUP: stuck modal/backdrop
  // -------------------------
  function forceCloseAnyModalArtifacts() {
    document.body.classList.remove('modal-open');
    document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    document.body.style.filter = '';
  }

  forceCloseAnyModalArtifacts();

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') forceCloseAnyModalArtifacts();
  });

  // -------------------------
  // Mobile menu: close properly
  // -------------------------
  let collapse = null;
  if (navCollapseEl && window.bootstrap) {
    collapse = bootstrap.Collapse.getInstance(navCollapseEl) || new bootstrap.Collapse(navCollapseEl, { toggle: false });
    collapse.hide();
    navCollapseEl.classList.remove('show');
    navToggler?.setAttribute('aria-expanded', 'false');
  }

  // close on nav click
  document.querySelectorAll('#navbarResponsive .nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      if (!navToggler) return;
      const isMobile = window.getComputedStyle(navToggler).display !== 'none';
      if (isMobile) collapse?.hide();
    });
  });

  // close on outside click
  document.addEventListener('click', (e) => {
    if (!navCollapseEl || !navToggler) return;
    const isMobile = window.getComputedStyle(navToggler).display !== 'none';
    if (!isMobile) return;

    const clickedInsideMenu = navCollapseEl.contains(e.target);
    const clickedToggler = navToggler.contains(e.target);

    if (!clickedInsideMenu && !clickedToggler) collapse?.hide();
  });

  window.addEventListener('resize', () => {
    if (!navToggler) return;
    const isMobile = window.getComputedStyle(navToggler).display !== 'none';
    if (!isMobile) collapse?.hide();
  });

  // -------------------------
  // Reveal animation (IntersectionObserver)
  // -------------------------
  const animated = document.querySelectorAll('[data-animate]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
      });
    }, { threshold: 0.12 });

    animated.forEach((el, i) => {
      el.style.setProperty('--d', `${Math.min(i * 60, 600)}ms`);
      io.observe(el);
    });
  } else {
    animated.forEach((el) => el.classList.add('is-visible'));
  }

  // -------------------------
  // Portfolio filters
  // -------------------------
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

  // -------------------------
  // Shorts thumbnails => Modal
  // -------------------------
  const modalEl = document.getElementById('videoModal');
  const modalPlayer = document.getElementById('modalPlayer');
  const modal = (modalEl && window.bootstrap) ? new bootstrap.Modal(modalEl) : null;

  function openVideo(id) {
    if (!modal || !modalPlayer) return;
    forceCloseAnyModalArtifacts();
    modalPlayer.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    modal.show();
  }

  if (modalEl && modalPlayer) {
    modalEl.addEventListener('hidden.bs.modal', () => {
      modalPlayer.src = '';
      forceCloseAnyModalArtifacts();
    });
  }

  document.querySelectorAll('.video-thumb[data-video]').forEach((thumb) => {
    const id = thumb.getAttribute('data-video');
    if (!id) return;
    thumb.style.setProperty('--thumb', `url('https://i.ytimg.com/vi/${id}/hqdefault.jpg')`);
    thumb.classList.add('has-thumb');
    thumb.addEventListener('click', () => openVideo(id));
  });

  window.addEventListener('hashchange', () => forceCloseAnyModalArtifacts());

  // =========================
  // GALLERY (Auto-build + easy add images)
  // =========================

  /**
   * ✅ EASY ADD IMAGES:
   * Just put images in: assets/img/gallery/
   * and set COUNT below.
   *
   * Important: your file names have a space before (1)
   * Example: "mostafa-mansour_product_ (1).png"
   */
  const GALLERY = {
    folder: 'assets/img/gallery/',
    prefix: 'mostafa-mansour_product_ (',
    suffix: ').png',
    count: 13, // <-- change this if you add more images
    startIndex: 1
  };

  const galleryRoot = document.querySelector('[data-gallery]');
  // لو مش حاطط root، هنحاول نلاقي عناصر افتراضية بالـ IDs
  const scroller = document.getElementById('galleryScroller');
  const dotsWrap = document.getElementById('galleryDots');
  const prevBtn = document.querySelector('[data-gprev]');
  const nextBtn = document.querySelector('[data-gnext]');

  // Helper: create gallery slides automatically if scroller exists and empty OR you want auto
  function ensureGallerySlides() {
    if (!scroller) return [];

    const existing = Array.from(scroller.querySelectorAll('.gallery-item img'));
    if (existing.length > 0) {
      // already has images in HTML
      return Array.from(scroller.querySelectorAll('.gallery-item'));
    }

    // build from config
    const frag = document.createDocumentFragment();
    for (let i = GALLERY.startIndex; i < GALLERY.startIndex + GALLERY.count; i++) {
      const fig = document.createElement('figure');
      fig.className = 'gallery-item';

      const img = document.createElement('img');
      img.loading = 'lazy';
      img.alt = `Concept Product ${i}`;
      img.src = `${GALLERY.folder}${GALLERY.prefix}${i}${GALLERY.suffix}`;

      fig.appendChild(img);
      frag.appendChild(fig);
    }

    scroller.appendChild(frag);
    return Array.from(scroller.querySelectorAll('.gallery-item'));
  }

  function initGallery() {
    if (!scroller) return;

    // IMPORTANT: remove any blur on gallery area immediately
    const zone = scroller.closest('.gallery-zone') || scroller.parentElement;
    zone?.classList.add('is-visible'); // avoids staying hidden/blur if it had data-animate

    const items = ensureGallerySlides();
    if (items.length === 0) return;

    // first active
    items.forEach((it, idx) => it.classList.toggle('is-active', idx === 0));

    // build dots
    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      items.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'gallery-dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', `Go to image ${i + 1}`);
        dot.addEventListener('click', () => {
          items[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        });
        dotsWrap.appendChild(dot);
      });
    }

    function setActiveByCenter() {
      const center = scroller.scrollLeft + scroller.clientWidth / 2;
      let bestIndex = 0;
      let bestDist = Infinity;

      items.forEach((item, i) => {
        const itemCenter = item.offsetLeft + item.offsetWidth / 2;
        const d = Math.abs(itemCenter - center);
        if (d < bestDist) { bestDist = d; bestIndex = i; }
      });

      items.forEach((it, i) => it.classList.toggle('is-active', i === bestIndex));
      if (dotsWrap) {
        Array.from(dotsWrap.children).forEach((dot, i) => dot.classList.toggle('is-active', i === bestIndex));
      }
    }

    let t = null;
    scroller.addEventListener('scroll', () => {
      clearTimeout(t);
      t = setTimeout(setActiveByCenter, 80);
    });

    function scrollByOne(dir) {
      const active = scroller.querySelector('.gallery-item.is-active') || items[0];
      const index = Math.max(0, items.indexOf(active));
      const nextIndex = Math.min(items.length - 1, Math.max(0, index + dir));
      items[nextIndex].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }

    prevBtn?.addEventListener('click', () => scrollByOne(-1));
    nextBtn?.addEventListener('click', () => scrollByOne(1));

    // keyboard support
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') scrollByOne(-1);
      if (e.key === 'ArrowRight') scrollByOne(1);
    });

    // initial
    setActiveByCenter();
    window.addEventListener('resize', () => setActiveByCenter());
  }

  initGallery();
});
