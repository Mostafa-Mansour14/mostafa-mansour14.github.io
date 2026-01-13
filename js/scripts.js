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

  // =====================================================
  // ✅ TWO GALLERIES (Products + Cars) AFTER VIDEOS
  // =====================================================

  /**
   * PRODUCTS GALLERY (GitHub assets)
   * Put images in: assets/img/gallery/
   * Using your current naming:
   * mostafa-mansour_product_ (1).png
   */
  const PRODUCTS = {
    folder: 'assets/img/gallery/',
    prefix: 'mostafa-mansour_product_ (',
    suffix: ').png',
    count: 13,
    startIndex: 1
  };

  /**
   * CARS GALLERY (ImageKit links)
   * ✅ from your message
   */
  const CAR_IMAGES = [
    "https://ik.imagekit.io/ygv06l7eo/motoors/IMG_2720.JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(7).JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/motoors/IMG_5377.JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(12).JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/motoors/IMG_2297.JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(4).JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/motoors/IMG_5381.JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(19).JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/motoors/IMG_2521.JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(9).JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/motoors/IMG_5360.JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(1).JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/motoors/IMG_2674.JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(14).JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/motoors/IMG_2861.JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(11).JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/motoors/IMG_5373.JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(5).JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/motoors/IMG_2462.JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(10).JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/motoors/IMG_2299.JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(8).JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/motoors/IMG_5321.JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(13).JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/motoors/IMG_5376.JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(18).JPG?tr=q-auto,f-auto"
  ];

  function buildProductsUrls() {
    const arr = [];
    for (let i = PRODUCTS.startIndex; i < PRODUCTS.startIndex + PRODUCTS.count; i++) {
      arr.push(`${PRODUCTS.folder}${PRODUCTS.prefix}${i}${PRODUCTS.suffix}`);
    }
    return arr;
  }

  function initGallery({ key, scrollerId, dotsId }) {
    const scroller = document.getElementById(scrollerId);
    const dotsWrap = document.getElementById(dotsId);
    const prevBtn = document.querySelector(`[data-gprev="${key}"]`);
    const nextBtn = document.querySelector(`[data-gnext="${key}"]`);

    if (!scroller) return;

    // make sure gallery doesn't stay hidden
    const zone = scroller.closest('.gallery-zone');
    zone?.classList.add('is-visible');

    // Decide images source
    const images =
      key === 'cars' ? CAR_IMAGES :
      key === 'products' ? buildProductsUrls() : [];

    if (!images.length) return;

    // Build slides
    scroller.innerHTML = '';
    const frag = document.createDocumentFragment();

    images.forEach((src, idx) => {
      const fig = document.createElement('figure');
      fig.className = 'gallery-item' + (idx === 0 ? ' is-active' : '');

      const img = document.createElement('img');
      img.loading = 'lazy';
      img.alt = `${key} image ${idx + 1}`;
      img.src = src;

      fig.appendChild(img);
      frag.appendChild(fig);
    });

    scroller.appendChild(frag);

    const items = Array.from(scroller.querySelectorAll('.gallery-item'));

    // Build dots
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

    window.addEventListener('resize', () => setActiveByCenter());

    // initial set
    setActiveByCenter();
  }

  // ✅ init both galleries (AFTER VIDEOS)
  initGallery({ key: 'products', scrollerId: 'galleryScrollerProducts', dotsId: 'galleryDotsProducts' });
  initGallery({ key: 'cars', scrollerId: 'galleryScrollerCars', dotsId: 'galleryDotsCars' });
});
