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
  // GALLERY 1 (AUTO: GitHub folder / fallback JSON)
  // =========================
  const scroller = document.getElementById('galleryScroller');
  const dotsWrap = document.getElementById('galleryDots');
  const prevBtn = document.querySelector('[data-gprev]');
  const nextBtn = document.querySelector('[data-gnext]');
  const galleryWrap = document.querySelector('[data-gallery]');

  const GITHUB = {
    owner: 'mostafa-mansour14',
    repo: 'mostafa-mansour14.github.io',
    branch: 'main',
    folderPath: 'assets/img/gallery'
  };

  const JSON_FALLBACK = 'assets/img/gallery/gallery.json';

  function onlyImages(list) {
    return (list || [])
      .map(String)
      .map(s => s.trim())
      .filter(Boolean)
      .filter(name => /\.(png|jpg|jpeg|webp|gif)$/i.test(name))
      .filter(name => name.toLowerCase() !== 'gallery.json');
  }

  async function listFromGithubAPI() {
    const url = `https://api.github.com/repos/${GITHUB.owner}/${GITHUB.repo}/contents/${GITHUB.folderPath}?ref=${GITHUB.branch}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('GitHub API failed');
    const data = await res.json();
    const files = Array.isArray(data)
      ? data.filter(x => x && x.type === 'file').map(x => x.name)
      : [];
    return onlyImages(files);
  }

  async function listFromJson() {
    const res = await fetch(JSON_FALLBACK, { cache: 'no-store' });
    if (!res.ok) throw new Error('gallery.json missing');
    const data = await res.json();
    const files = Array.isArray(data) ? data : (Array.isArray(data?.images) ? data.images : []);
    return onlyImages(files);
  }

  function buildGalleryFromFiles(files) {
    if (!scroller) return;
    scroller.innerHTML = '';
    if (dotsWrap) dotsWrap.innerHTML = '';

    const frag = document.createDocumentFragment();
    files.forEach((file, idx) => {
      const fig = document.createElement('figure');
      fig.className = 'gallery-item' + (idx === 0 ? ' is-active' : '');

      const img = document.createElement('img');
      img.loading = 'lazy';
      img.alt = `Concept Product ${idx + 1}`;
      img.src = `assets/img/gallery/${file}`;

      fig.appendChild(img);
      frag.appendChild(fig);
    });

    scroller.appendChild(frag);

    const items = Array.from(scroller.querySelectorAll('.gallery-item'));
    if (items.length === 0) return;

    if (dotsWrap) {
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
      t = setTimeout(setActiveByCenter, 90);
    });

    function scrollByOne(dir) {
      const active = scroller.querySelector('.gallery-item.is-active') || items[0];
      const index = Math.max(0, items.indexOf(active));
      const nextIndex = Math.min(items.length - 1, Math.max(0, index + dir));
      items[nextIndex].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }

    prevBtn?.addEventListener('click', () => scrollByOne(-1));
    nextBtn?.addEventListener('click', () => scrollByOne(1));

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') scrollByOne(-1);
      if (e.key === 'ArrowRight') scrollByOne(1);
    });

    setActiveByCenter();
    window.addEventListener('resize', setActiveByCenter);
  }

  async function initGallery() {
    if (!scroller || !galleryWrap) return;

    galleryWrap.classList.add('is-visible');

    let files = [];
    try {
      files = await listFromGithubAPI();
    } catch (e) {
      try {
        files = await listFromJson();
      } catch (_) {
        files = [];
      }
    }

    buildGalleryFromFiles(files);
  }

  initGallery();

  // =========================
  // GALLERY 2 (Cars — ImageKit URLs)
  // =========================
  const carsScroller = document.getElementById('carsGalleryScroller');
  const carsDotsWrap = document.getElementById('carsGalleryDots');
  const carsPrevBtn = document.querySelector('[data-gprev-cars]');
  const carsNextBtn = document.querySelector('[data-gnext-cars]');
  const carsGalleryWrap = document.querySelector('[data-gallery-cars]');

  // ✅ ImageKit URLs (clean + optimized)
  const CAR_IMAGES = [
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(1).JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(4).JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(5).JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(7).JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(8).JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(9).JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(10).JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(11).JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(12).JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(13).JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(14).JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(18).JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(19).JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(21).JPG?tr=q-auto,f-auto"
  ];

  function buildGalleryFromUrls({ scrollerEl, dotsEl, prevEl, nextEl, wrapEl, urls, altPrefix = "Gallery Image" }) {
    if (!scrollerEl || !wrapEl) return;

    wrapEl.classList.add('is-visible');

    scrollerEl.innerHTML = '';
    if (dotsEl) dotsEl.innerHTML = '';

    const frag = document.createDocumentFragment();

    urls.forEach((url, idx) => {
      const fig = document.createElement('figure');
      fig.className = 'gallery-item' + (idx === 0 ? ' is-active' : '');

      const img = document.createElement('img');
      img.loading = 'lazy';
      img.alt = `${altPrefix} ${idx + 1}`;
      img.src = url;

      fig.appendChild(img);
      frag.appendChild(fig);
    });

    scrollerEl.appendChild(frag);

    const items = Array.from(scrollerEl.querySelectorAll('.gallery-item'));
    if (items.length === 0) return;

    if (dotsEl) {
      items.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'gallery-dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', `Go to image ${i + 1}`);
        dot.addEventListener('click', () => {
          items[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        });
        dotsEl.appendChild(dot);
      });
    }

    function setActiveByCenter() {
      const center = scrollerEl.scrollLeft + scrollerEl.clientWidth / 2;
      let bestIndex = 0;
      let bestDist = Infinity;

      items.forEach((item, i) => {
        const itemCenter = item.offsetLeft + item.offsetWidth / 2;
        const d = Math.abs(itemCenter - center);
        if (d < bestDist) { bestDist = d; bestIndex = i; }
      });

      items.forEach((it, i) => it.classList.toggle('is-active', i === bestIndex));
      if (dotsEl) {
        Array.from(dotsEl.children).forEach((dot, i) => dot.classList.toggle('is-active', i === bestIndex));
      }
    }

    let t = null;
    scrollerEl.addEventListener('scroll', () => {
      clearTimeout(t);
      t = setTimeout(setActiveByCenter, 90);
    });

    function scrollByOne(dir) {
      const active = scrollerEl.querySelector('.gallery-item.is-active') || items[0];
      const index = Math.max(0, items.indexOf(active));
      const nextIndex = Math.min(items.length - 1, Math.max(0, index + dir));
      items[nextIndex].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }

    prevEl?.addEventListener('click', () => scrollByOne(-1));
    nextEl?.addEventListener('click', () => scrollByOne(1));

    setActiveByCenter();
    window.addEventListener('resize', setActiveByCenter);
  }

  buildGalleryFromUrls({
    scrollerEl: carsScroller,
    dotsEl: carsDotsWrap,
    prevEl: carsPrevBtn,
    nextEl: carsNextBtn,
    wrapEl: carsGalleryWrap,
    urls: CAR_IMAGES,
    altPrefix: "Car Concept"
  });
    // =========================
  // CARS GALLERY (ImageKit)
  // =========================
  const carsScroller = document.getElementById('carsGalleryScroller');
  const carsDotsWrap = document.getElementById('carsGalleryDots');
  const carsPrevBtn = document.querySelector('[data-gprev-cars]');
  const carsNextBtn = document.querySelector('[data-gnext-cars]');
  const carsGalleryWrap = document.querySelector('[data-gallery-cars]');

  const CAR_IMAGES = [
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(1).JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(4).JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(5).JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(7).JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(8).JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(9).JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(10).JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(11).JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(12).JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(13).JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(14).JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(18).JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(19).JPG?tr=q-auto,f-auto",
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(21).JPG?tr=q-auto,f-auto"
  ];

  function buildCarsGallery(urls) {
    if (!carsScroller || !carsGalleryWrap) return;

    carsGalleryWrap.classList.add('is-visible');
    carsScroller.innerHTML = '';
    if (carsDotsWrap) carsDotsWrap.innerHTML = '';

    const frag = document.createDocumentFragment();

    urls.forEach((url, idx) => {
      const fig = document.createElement('figure');
      fig.className = 'gallery-item' + (idx === 0 ? ' is-active' : '');

      const img = document.createElement('img');
      img.loading = 'lazy';
      img.alt = `Car Concept ${idx + 1}`;
      img.src = url;

      fig.appendChild(img);
      frag.appendChild(fig);
    });

    carsScroller.appendChild(frag);

    const items = Array.from(carsScroller.querySelectorAll('.gallery-item'));
    if (items.length === 0) return;

    // dots
    if (carsDotsWrap) {
      items.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'gallery-dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', `Go to image ${i + 1}`);
        dot.addEventListener('click', () => {
          items[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        });
        carsDotsWrap.appendChild(dot);
      });
    }

    function setActiveByCenter() {
      const center = carsScroller.scrollLeft + carsScroller.clientWidth / 2;
      let bestIndex = 0;
      let bestDist = Infinity;

      items.forEach((item, i) => {
        const itemCenter = item.offsetLeft + item.offsetWidth / 2;
        const d = Math.abs(itemCenter - center);
        if (d < bestDist) { bestDist = d; bestIndex = i; }
      });

      items.forEach((it, i) => it.classList.toggle('is-active', i === bestIndex));
      if (carsDotsWrap) {
        Array.from(carsDotsWrap.children).forEach((dot, i) => dot.classList.toggle('is-active', i === bestIndex));
      }
    }

    let t = null;
    carsScroller.addEventListener('scroll', () => {
      clearTimeout(t);
      t = setTimeout(setActiveByCenter, 90);
    });

    function scrollByOne(dir) {
      const active = carsScroller.querySelector('.gallery-item.is-active') || items[0];
      const index = Math.max(0, items.indexOf(active));
      const nextIndex = Math.min(items.length - 1, Math.max(0, index + dir));
      items[nextIndex].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }

    carsPrevBtn?.addEventListener('click', () => scrollByOne(-1));
    carsNextBtn?.addEventListener('click', () => scrollByOne(1));

    setActiveByCenter();
    window.addEventListener('resize', setActiveByCenter);
  }

  buildCarsGallery(CAR_IMAGES);

});
