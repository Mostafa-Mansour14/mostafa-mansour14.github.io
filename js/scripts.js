window.addEventListener("DOMContentLoaded", () => {
  // =========================
  // Helper
  // =========================
  const qs = (s, el = document) => el.querySelector(s);
  const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));

  const toYouTubeId = (value) => {
    if (!value) return "";
    const v = String(value).trim();

    // already an ID?
    if (/^[a-zA-Z0-9_-]{8,}$/.test(v) && !v.includes("http")) return v;

    try {
      const url = new URL(v);
      if (url.hostname.includes("youtu.be")) return url.pathname.replace("/", "");
      if (url.searchParams.get("v")) return url.searchParams.get("v");

      const parts = url.pathname.split("/").filter(Boolean);
      const shortsIndex = parts.indexOf("shorts");
      if (shortsIndex !== -1 && parts[shortsIndex + 1]) return parts[shortsIndex + 1];
    } catch (e) {}
    return v;
  };

  // year
  const y = qs("#year");
  if (y) y.textContent = String(new Date().getFullYear());

  // =========================
  // Videos Data (EDIT / CREATE)
  // =========================

  // ✅ New shorts you sent
  const NEW_SHORTS = [
    "https://youtube.com/shorts/nJZVmrPypEg",
    "https://youtube.com/shorts/TjLQyM1boSA",
    "https://youtube.com/shorts/5rJbLmcfBSE",
    "https://youtube.com/shorts/5129Esy6WhI",
  ].map(toYouTubeId);

  // Existing shorts (from your old code)
  const EDIT_SHORTS = [
    "GEFvzpgGZmU",
    "0shWVNJMoVo",
    "mYQBfzR22TQ",
    "Juso-cC3Xd4",
    // + new ones
    ...NEW_SHORTS,
  ];

  const CREATE_SHORTS = [
    "hwqzvZyO-54",
    "qcDr3tEWJzE",
    "5IXdCBKqc-k",
    "BznO4vpu6oA",
    // + new ones (لو تحب يكونوا كمان في الكونتنت كرييشن)
    ...NEW_SHORTS,
  ];

  // ✅ YouTube 16:9 (horizontal) — will appear in BOTH tabs (as you requested)
  const YT_HORIZONTAL = [
    "XD0AC8IM47E",
    "0ZDJulsMbpY",
    "9UsZ7roRvlk",
    "Mw-XSyH3xNQ",
    "SnYlYmBOFgk",
  ];

  // =========================
  // Build Portfolio Cards
  // =========================

  function makeShortCard({ group, label, id, tags = "Shorts • Editing" }) {
    return `
      <div class="col-12 col-md-6 col-lg-4 portfolio-item" data-kind="short" data-group="${group}">
        <div class="video-card">
          <div class="video-head">
            <span class="chip ${group === "edit" ? "chip-edit" : "chip-create"}">${label}</span>
            <span class="chip chip-ghost">Short</span>
          </div>
          <div class="video-thumb" data-video="${id}">
            <span class="play">▶</span>
          </div>
          <div class="video-meta">
            <div class="video-title">${group === "edit" ? "Short Edit" : "On-camera Short"}</div>
            <div class="video-tags">${tags}</div>
          </div>
        </div>
      </div>
    `;
  }

  function makeYouTubeCard({ group, label, id, tags = "YouTube • Project" }) {
    return `
      <div class="col-12 col-md-6 col-lg-4 portfolio-item" data-kind="youtube" data-group="${group}">
        <div class="video-card">
          <div class="video-head">
            <span class="chip ${group === "edit" ? "chip-edit" : "chip-create"}">${label}</span>
            <span class="chip chip-ghost">YouTube</span>
          </div>

          <div class="ratio ratio-16x9 video-frame">
            <iframe
              src="https://www.youtube.com/embed/${id}"
              title="YouTube Project"
              loading="lazy"
              referrerpolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen></iframe>
          </div>

          <div class="video-meta">
            <div class="video-title">YouTube Project</div>
            <div class="video-tags">${tags}</div>
          </div>
        </div>
      </div>
    `;
  }

  function renderPortfolio() {
    const editGrid = qs("#editGrid");
    const createGrid = qs("#createGrid");
    if (!editGrid || !createGrid) return;

    // EDIT: Shorts + YouTube Horizontal
    const editHTML = [
      ...EDIT_SHORTS.map((id) =>
        makeShortCard({
          group: "edit",
          label: "Editing",
          id,
          tags: "Pacing • Transitions • Retention",
        })
      ),
      ...YT_HORIZONTAL.map((id) =>
        makeYouTubeCard({
          group: "edit",
          label: "Editing",
          id,
          tags: "Edit • Delivery • Platform ready",
        })
      ),
    ].join("");

    // CREATE: Shorts + YouTube Horizontal
    const createHTML = [
      ...CREATE_SHORTS.map((id) =>
        makeShortCard({
          group: "create",
          label: "Creator",
          id,
          tags: "Hook • Delivery • Story",
        })
      ),
      ...YT_HORIZONTAL.map((id) =>
        makeYouTubeCard({
          group: "create",
          label: "Creator",
          id,
          tags: "Concept • Production • Edit",
        })
      ),
    ].join("");

    editGrid.innerHTML = editHTML;
    createGrid.innerHTML = createHTML;
  }

  renderPortfolio();

  // =========================
  // Smooth Scroll + close mobile menu
  // =========================
  const navCollapseEl = qs("#navbarResponsive");
  const navToggler = qs(".navbar-toggler");
  let collapse = null;

  if (navCollapseEl && window.bootstrap) {
    collapse = bootstrap.Collapse.getInstance(navCollapseEl) || new bootstrap.Collapse(navCollapseEl, { toggle: false });
  }

  qsa(".js-scroll").forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("#")) return;

      e.preventDefault();
      const target = qs(href);
      if (!target) return;

      target.scrollIntoView({ behavior: "smooth", block: "start" });

      const isMobile = navToggler && window.getComputedStyle(navToggler).display !== "none";
      if (isMobile) collapse?.hide();
    });
  });

  document.addEventListener("click", (e) => {
    if (!navCollapseEl || !navToggler) return;
    const isMobile = window.getComputedStyle(navToggler).display !== "none";
    if (!isMobile) return;

    const clickedInsideMenu = navCollapseEl.contains(e.target);
    const clickedToggler = navToggler.contains(e.target);
    if (!clickedInsideMenu && !clickedToggler) collapse?.hide();
  });

  // =========================
  // Reveal animation
  // =========================
  const animated = qsa("[data-animate]");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")),
      { threshold: 0.12 }
    );
    animated.forEach((el, i) => {
      el.style.setProperty("--d", `${Math.min(i * 60, 600)}ms`);
      io.observe(el);
    });
  } else {
    animated.forEach((el) => el.classList.add("is-visible"));
  }

  // =========================
  // Filters
  // =========================
  function applyFilter(group, kind) {
    const items = qsa(`.portfolio-item[data-group="${group}"]`);
    items.forEach((item) => {
      const itemKind = item.getAttribute("data-kind");
      const show = kind === "all" || itemKind === kind;
      item.classList.toggle("is-hidden", !show);
    });
  }

  qsa("[data-filter-group]").forEach((wrap) => {
    const group = wrap.getAttribute("data-filter-group");
    const buttons = qsa(".filter-btn", wrap);

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        const kind = btn.getAttribute("data-filter") || "all";
        applyFilter(group, kind);
      });
    });

    applyFilter(group, "all");
  });

  // =========================
  // Shorts Modal Player
  // =========================
  const modalEl = qs("#videoModal");
  const modalPlayer = qs("#modalPlayer");
  const modal = modalEl && window.bootstrap ? new bootstrap.Modal(modalEl) : null;

  function forceCloseAnyModalArtifacts() {
    document.body.classList.remove("modal-open");
    qsa(".modal-backdrop").forEach((b) => b.remove());
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
    document.body.style.filter = "";
  }

  function openVideo(id) {
    if (!modal || !modalPlayer) return;
    forceCloseAnyModalArtifacts();
    modalPlayer.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    modal.show();
  }

  if (modalEl && modalPlayer) {
    modalEl.addEventListener("hidden.bs.modal", () => {
      modalPlayer.src = "";
      forceCloseAnyModalArtifacts();
    });
  }

  // thumbs
  function initShortThumbs() {
    qsa('.video-thumb[data-video]').forEach((thumb) => {
      const id = thumb.getAttribute("data-video");
      if (!id) return;
      thumb.style.setProperty("--thumb", `url('https://i.ytimg.com/vi/${id}/hqdefault.jpg')`);
      thumb.addEventListener("click", () => openVideo(id));
    });
  }
  initShortThumbs();

  // =========================
  // ✅ TWO GALLERIES
  // 1) Products (local folder, easy add by count)
  // 2) Cars (ImageKit URLs you provided)
  // =========================

  // 1) PRODUCTS: local images (easy add)
  const PRODUCTS = {
    folder: "assets/img/gallery/",
    prefix: "mostafa-mansour_product_ (",
    suffix: ").png",
    startIndex: 1,
    count: 13, // <-- زوّد الرقم ده لما تزود صور
  };

  function buildProductsList() {
    const arr = [];
    for (let i = PRODUCTS.startIndex; i < PRODUCTS.startIndex + PRODUCTS.count; i++) {
      arr.push(`${PRODUCTS.folder}${PRODUCTS.prefix}${i}${PRODUCTS.suffix}`);
    }
    return arr;
  }

  // 2) CARS: URLs from you (as-is)
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
    "https://ik.imagekit.io/ygv06l7eo/Cars/My%20event%20(18).JPG?tr=q-auto,f-auto",
  ];

  function createGallerySlides(scroller, images, label) {
    if (!scroller) return [];
    scroller.innerHTML = "";

    const frag = document.createDocumentFragment();
    images.forEach((src, i) => {
      const fig = document.createElement("figure");
      fig.className = "gallery-item";

      const img = document.createElement("img");
      img.loading = "lazy";
      img.alt = `${label} ${i + 1}`;
      img.src = src;

      fig.appendChild(img);
      frag.appendChild(fig);
    });

    scroller.appendChild(frag);
    return qsa(".gallery-item", scroller);
  }

  function initGallery({ scrollerId, dotsId, prevKey, nextKey, images, label }) {
    const scroller = qs(`#${scrollerId}`);
    const dotsWrap = qs(`#${dotsId}`);
    const prevBtn = qs(`[data-gprev="${prevKey}"]`);
    const nextBtn = qs(`[data-gnext="${nextKey}"]`);

    if (!scroller) return;

    const items = createGallerySlides(scroller, images, label);
    if (!items.length) return;

    // dots
    if (dotsWrap) {
      dotsWrap.innerHTML = "";
      items.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "gallery-dot" + (i === 0 ? " is-active" : "");
        dot.setAttribute("aria-label", `Go to image ${i + 1}`);
        dot.addEventListener("click", () => {
          items[i].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
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

      items.forEach((it, i) => it.classList.toggle("is-active", i === bestIndex));
      if (dotsWrap) qsa(".gallery-dot", dotsWrap).forEach((dot, i) => dot.classList.toggle("is-active", i === bestIndex));
    }

    let t = null;
    scroller.addEventListener("scroll", () => {
      clearTimeout(t);
      t = setTimeout(setActiveByCenter, 80);
    });

    function scrollByOne(dir) {
      const active = qs(".gallery-item.is-active", scroller) || items[0];
      const index = Math.max(0, items.indexOf(active));
      const nextIndex = Math.min(items.length - 1, Math.max(0, index + dir));
      items[nextIndex].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }

    prevBtn?.addEventListener("click", () => scrollByOne(-1));
    nextBtn?.addEventListener("click", () => scrollByOne(1));

    setActiveByCenter();
    window.addEventListener("resize", setActiveByCenter);
  }

  // Init both galleries
  initGallery({
    scrollerId: "productsScroller",
    dotsId: "productsDots",
    prevKey: "products",
    nextKey: "products",
    images: buildProductsList(),
    label: "Product",
  });

  initGallery({
    scrollerId: "carsScroller",
    dotsId: "carsDots",
    prevKey: "cars",
    nextKey: "cars",
    images: CAR_IMAGES,
    label: "Car",
  });
});
