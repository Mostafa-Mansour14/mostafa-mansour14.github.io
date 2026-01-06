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

  document.querySelectorAll('#navbarResponsive .nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      if (!navToggler) return;
      const isMobile = window.getComputedStyle(navToggler).display !== 'none';
      if (isMobile) collapse?.hide();
    });
  });

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
  // Reveal animation (IntersectionObserver) + FAIL-SAFE
  // -------------------------
  const animated = document.querySelectorAll('[data-animate]');

  function showAllNow() {
    animated.forEach(el => el.classList.add('is-visible'));
  }

  try {
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

      // fail-safe: لو لأي سبب الـIO ما اشتغلش/اتعطل، نشيل البلور بعد ثانية
      setTimeout(showAllNow, 1200);
    } else {
      showAllNow();
    }
  } catch (e) {
    showAllNow();
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
  // GALLERY (AUTO FROM gallery.json)
 async function initGalleryFromJson() {
  const wrap = document.querySelector('[data-gallery]');
  const scroller = document.getElementById('galleryScroller');
  const dotsWrap = document.getElementById('galleryDots');
  const prevBtn = document.querySelector('[data-gprev]');
  const nextBtn = document.querySelector('[data-gnext]');

  console.log('[GALLERY] wrap:', !!wrap, 'scroller:', !!scroller);

  if (!wrap || !scroller) return;

  const jsonPath = wrap.getAttribute('data-gallery-json') || 'assets/img/gallery/gallery.json';
  console.log('[GALLERY] jsonPath:', jsonPath);

  let files = [];
  try {
    const res = await fetch(jsonPath, { cache: 'no-store' });
    console.log('[GALLERY] fetch status:', res.status);
    files = await res.json();
    console.log('[GALLERY] files raw:', files);
  } catch (e) {
    console.error('[GALLERY] failed to load json:', e);
    return;
  }

  files = (files || []).map(String).filter(name => {
    const low = name.toLowerCase();
    return low && low !== 'gallery.json' && /\.(png|jpg|jpeg|webp|gif)$/.test(low);
  });

  console.log('[GALLERY] files filtered:', files);

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
  console.log('[GALLERY] items created:', items.length);

  if (items.length === 0) return;

  if (dotsWrap) {
    items.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'gallery-dot' + (i === 0 ? ' is-active' : '');
      dot.addEventListener('click', () => {
        items[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      });
      dotsWrap.appendChild(dot);
    });
  }

  function setActiveByCenter() {
    const center = scroller.scrollLeft + scroller.clientWidth / 2;
    let bestIndex = 0, bestDist = Infinity;
    items.forEach((item, i) => {
      const itemCenter = item.offsetLeft + item.offsetWidth / 2;
      const d = Math.abs(itemCenter - center);
      if (d < bestDist) { bestDist = d; bestIndex = i; }
    });

    items.forEach((it, i) => it.classList.toggle('is-active', i === bestIndex));
    if (dotsWrap) Array.from(dotsWrap.children).forEach((dot, i) => dot.classList.toggle('is-active', i === bestIndex));
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

  setActiveByCenter();
  window.addEventListener('resize', setActiveByCenter);
}

initGalleryFromJson();

    });
    scroller.appendChild(frag);

    const items = Array.from(scroller.querySelectorAll('.gallery-item'));
    if (items.length === 0) return;

    // dots
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

    setActiveByCenter();
    window.addEventListener('resize', setActiveByCenter);
  }

  initGalleryFromJson();
// =========================
// GALLERY (from gallery.json) — Works on GitHub Pages
// =========================
(function initGalleryFromJson(){
  const wrap = document.querySelector('[data-gallery]');
  const scroller = document.getElementById('galleryScroller');
  const dotsWrap = document.getElementById('galleryDots');
  const prevBtn = document.querySelector('[data-gprev]');
  const nextBtn = document.querySelector('[data-gnext]');

  if (!wrap || !scroller) return;

  const jsonPath = wrap.getAttribute('data-gallery-json') || 'assets/img/gallery/gallery.json';

  fetch(jsonPath, { cache: 'no-store' })
    .then(r => r.json())
    .then(files => {
      // Support either: ["a.png","b.jpg"] OR { "images": [...] }
      if (files && !Array.isArray(files) && Array.isArray(files.images)) files = files.images;
      if (!Array.isArray(files)) files = [];

      // Keep only image files
      files = files
        .map(String)
        .map(s => s.trim())
        .filter(Boolean)
        .filter(name => /\.(png|jpg|jpeg|webp|gif)$/i.test(name));

      // Build slides
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

      // Build dots
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
        let bestIndex = 0, bestDist = Infinity;

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

      setActiveByCenter();
      window.addEventListener('resize', setActiveByCenter);
    })
    .catch(() => {
      // لو JSON اتكسر لأي سبب: خليه صامت عشان ما يبوظش الصفحة
    });
})();

});
