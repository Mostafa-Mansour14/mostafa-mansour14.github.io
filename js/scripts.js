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
  // LIGHTBOX (for galleries)
  // =========================
  function ensureLightbox() {
    let lb = document.querySelector('.lightbox');
    if (lb) return lb;

    lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = `
      <button class="lightbox-close" type="button" aria-label="Close">×</button>
      <button class="lightbox-nav prev" type="button" aria-label="Previous">‹</button>
      <img class="lightbox-img" alt="Preview" />
      <button class="lightbox-nav next" type="button" aria-label="Next">›</button>
    `;
    document.body.appendChild(lb);
    return lb;
  }

  const lightbox = ensureLightbox();
  const lbImg = lightbox.querySelector('.lightbox-img');
  const lbClose = lightbox.querySelector('.lightbox-close');
  const lbPrev = lightbox.querySelector('.lightbox-nav.prev');
  const lbNext = lightbox.querySelector('.lightbox-nav.next');

  let lbItems = [];
  let lbIndex = 0;

  function openLightbox(items, index) {
    if (!items?.length) return;
    lbItems = items;
    lbIndex = Math.max(0, Math.min(index, items.length - 1));
    lbImg.src = lbItems[lbIndex];
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lbImg.src = '';
    document.body.style.overflow = '';
  }
  function navLightbox(dir) {
    if (!lbItems?.length) return;
    lbIndex = (lbIndex + dir + lbItems.length) % lbItems.length;
    lbImg.src = lbItems[lbIndex];
  }

  lbClose?.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  lbPrev?.addEventListener('click', () => navLightbox(-1));
  lbNext?.addEventListener('click', () => navLightbox(1));

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navLightbox(-1);
    if (e.key === 'ArrowRight') navLightbox(1);
  });

  // =========================
  // GALLERY ENGINE (reusable)
  // =========================
  function buildGallery({ scrollerEl, dotsEl, prevEl, nextEl, wrapEl, urls, altPrefix = "Gallery Image" }) {
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

    // dots
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

    // click => lightbox
    const allUrls = urls.slice();
    items.forEach((fig, i) => {
      fig.addEventListener('click', () => openLightbox(allUrls, i));
    });

    setActiveByCenter();
    window.addEventListener('resize', setActiveByCenter);
  }

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

  async function initGallery1() {
    if (!scroller || !galleryWrap) return;

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

    const urls = files.map(f => `assets/img/gallery/${f}`);

    buildGallery({
      scrollerEl: scroller,
      dotsEl: dotsWrap,
      prevEl: prevBtn,
      nextEl: nextBtn,
      wrapEl: galleryWrap,
      urls,
      altPrefix: "Concept Product"
    });
  }

  initGallery1();

  // =========================
  // GALLERY 2 (Cars — ImageKit URLs)
  // =========================
  const carsScroller = document.getElementById('carsGalleryScroller');
  const carsDotsWrap = document.getElementById('carsGalleryDots');
  const carsPrevBtn = document.querySelector('[data-gprev-cars]');
  const carsNextBtn = document.querySelector('[data-gnext-cars]');
  const carsGalleryWrap = document.querySelector('[data-gallery-cars]');

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

  

  buildGallery({
    scrollerEl: carsScroller,
    dotsEl: carsDotsWrap,
    prevEl: carsPrevBtn,
    nextEl: carsNextBtn,
    wrapEl: carsGalleryWrap,
    urls: CAR_IMAGES,
    altPrefix: "Car Concept"
  });
});
(async function () {
  const DATA_URL = "data/portfolio.json";

  const editGrid = document.getElementById("editGrid");
  const createGrid = document.getElementById("createGrid");

  const galleryScroller = document.getElementById("galleryScroller");
  const carsGalleryScroller = document.getElementById("carsGalleryScroller");

  // Helpers
  const esc = (s = "") =>
    String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

  const ytThumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

  function makeVideoCard(item, group) {
    const kind = item.kind || "short";
    const title = item.title || "Untitled";
    const tags = Array.isArray(item.tags) ? item.tags.join(" • ") : "";
    const videoId = item.video || "";

    // نفس شكل كروتك الحالي (Thumb clickable)
    return `
      <div class="col-12 col-md-6 col-lg-4 portfolio-item" data-kind="${esc(kind)}" data-group="${esc(group)}">
        <div class="video-card">
          <div class="video-head">
            <span class="chip ${group === "edit" ? "chip-edit" : "chip-create"}">${group === "edit" ? "Editing" : "Creator"}</span>
            <span class="chip chip-ghost">${kind === "youtube" ? "YouTube" : "Short"}</span>
          </div>

          ${
            kind === "youtube"
              ? `
                <div class="ratio ratio-16x9 video-frame">
                  <iframe
                    src="https://www.youtube.com/embed/${esc(videoId)}"
                    title="${esc(title)}"
                    loading="lazy"
                    referrerpolicy="strict-origin-when-cross-origin"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen
                  ></iframe>
                </div>
              `
              : `
                <div class="video-thumb" data-video="${esc(videoId)}" style="background-image:url('${ytThumb(videoId)}')">
                  <span class="play">▶</span>
                </div>
              `
          }

          <div class="video-meta">
            <div class="video-title">${esc(title)}</div>
            <div class="video-tags">${esc(tags)}</div>
          </div>
        </div>
      </div>
    `;
  }

  function renderVideos(list, gridEl, group) {
    if (!gridEl) return;
    const safe = Array.isArray(list) ? list : [];
    gridEl.innerHTML = safe.map((it) => makeVideoCard(it, group)).join("");
  }

  function makeImageSlide(img) {
    const url = img.url || "";
    const title = img.title || "";
    // slide بسيط داخل scroller
    return `
      <div class="g-item">
        <a href="${esc(url)}" target="_blank" rel="noopener" class="g-link" aria-label="${esc(title || "image")}">
          <img class="g-img" src="${esc(url)}" alt="${esc(title)}" loading="lazy" />
        </a>
      </div>
    `;
  }

  function renderGallery(list, scrollerEl) {
    if (!scrollerEl) return;
    const safe = Array.isArray(list) ? list : [];
    scrollerEl.innerHTML = safe.map(makeImageSlide).join("");
  }

  // Load JSON
  async function loadData() {
    const res = await fetch(DATA_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load portfolio.json");
    return res.json();
  }

  try {
    const data = await loadData();

    // Videos
    renderVideos(data?.videos?.edit, editGrid, "edit");
    renderVideos(data?.videos?.create, createGrid, "create");

    // Galleries (images by URL)
    renderGallery(data?.galleries?.concept, galleryScroller);
    renderGallery(data?.galleries?.cars, carsGalleryScroller);

    // Re-bind your existing modal player logic (Shorts)
    // نفس فكرتك: أي .video-thumb يفتح modal
    document.addEventListener("click", (e) => {
      const t = e.target.closest(".video-thumb");
      if (!t) return;

      const id = t.getAttribute("data-video");
      if (!id) return;

      const iframe = document.getElementById("modalPlayer");
      if (iframe) iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1`;

      const modalEl = document.getElementById("videoModal");
      if (modalEl && window.bootstrap) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();

        modalEl.addEventListener(
          "hidden.bs.modal",
          () => {
            if (iframe) iframe.src = "";
          },
          { once: true }
        );
      }
    });
  } catch (err) {
    console.error(err);
  }
})();

