(() => {
  // ===== Helpers =====
  const qs = (s, el = document) => el.querySelector(s);
  const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));

  const toYouTubeId = (value) => {
    if (!value) return "";
    const v = String(value).trim();

    // If it's already an ID
    if (/^[a-zA-Z0-9_-]{8,}$/.test(v) && !v.includes("http")) return v;

    // Try parse URL
    try {
      const url = new URL(v);
      if (url.hostname.includes("youtu.be")) {
        return url.pathname.replace("/", "");
      }
      if (url.searchParams.get("v")) return url.searchParams.get("v");
      // handle /shorts/ID
      const parts = url.pathname.split("/").filter(Boolean);
      const shortsIndex = parts.indexOf("shorts");
      if (shortsIndex !== -1 && parts[shortsIndex + 1]) return parts[shortsIndex + 1];
    } catch (e) {
      // not a URL, return raw
    }

    return v;
  };

  const ytThumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

  const escapeHtml = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  // ===== Video Modal (Bootstrap) =====
  const modalEl = qs("#videoModal");
  const player = qs("#modalPlayer");
  let bsModal = null;

  const openVideo = (youtubeId) => {
    if (!modalEl || !player) return;
    const id = toYouTubeId(youtubeId);
    if (!id) return;

    // autoplay
    player.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;

    // Bootstrap modal
    if (window.bootstrap?.Modal) {
      bsModal = bsModal || new window.bootstrap.Modal(modalEl);
      bsModal.show();
    } else {
      // fallback
      modalEl.classList.add("show");
      modalEl.style.display = "block";
    }
  };

  const stopVideo = () => {
    if (player) player.src = "";
  };

  if (modalEl) {
    modalEl.addEventListener("hidden.bs.modal", stopVideo);
    // fallback close
    modalEl.addEventListener("click", (e) => {
      if (e.target === modalEl) stopVideo();
    });
  }

  // ===== Render Video Cards =====
  const renderVideoCard = (item, group) => {
    const title = escapeHtml(item.title || "Untitled");
    const kind = (item.kind || "short").toLowerCase(); // short | youtube
    const id = toYouTubeId(item.video || "");
    const tags = Array.isArray(item.tags) ? item.tags : [];
    const tagText = escapeHtml(tags.join(" • "));

    const chipLabel = group === "edit" ? "Editing" : "Creator";
    const chipClass = group === "edit" ? "chip-edit" : "chip-create";

    // Thumb: prefer provided thumb URL, else YouTube thumb
    const thumbUrl = (item.thumb && item.thumb.trim()) ? item.thumb.trim() : (id ? ytThumb(id) : "");

    // For long YouTube in your old HTML you embedded iframe.
    // Here we keep one consistent UX: thumbnail opens popup player.
    return `
      <div class="col-12 col-md-6 col-lg-4 portfolio-item" data-kind="${escapeHtml(kind)}" data-group="${escapeHtml(group)}">
        <div class="video-card">
          <div class="video-head">
            <span class="chip ${chipClass}">${chipLabel}</span>
            <span class="chip chip-ghost">${kind === "youtube" ? "YouTube" : "Short"}</span>
          </div>

          <div class="video-thumb" data-video="${escapeHtml(id)}" style="${thumbUrl ? `background-image:url('${escapeHtml(thumbUrl)}')` : ""}">
            <span class="play">▶</span>
          </div>

          <div class="video-meta">
            <div class="video-title">${title}</div>
            <div class="video-tags">${tagText || "&nbsp;"}</div>
          </div>
        </div>
      </div>
    `;
  };

  const wireVideoThumbs = (root = document) => {
    qsa(".video-thumb[data-video]", root).forEach((el) => {
      // prevent double binding
      if (el.dataset.bound === "1") return;
      el.dataset.bound = "1";

      el.addEventListener("click", () => {
        const id = el.getAttribute("data-video");
        openVideo(id);
      });
    });
  };

  // ===== Filters (reuse your existing buttons) =====
  const setupFilters = () => {
    qsa(".portfolio-filters").forEach((wrap) => {
      const group = wrap.getAttribute("data-filter-group"); // edit | create
      const buttons = qsa(".filter-btn", wrap);

      const apply = (filter) => {
        // toggle active
        buttons.forEach((b) => b.classList.toggle("is-active", b.getAttribute("data-filter") === filter));

        // filter items
        qsa(`.portfolio-item[data-group="${group}"]`).forEach((item) => {
          const kind = item.getAttribute("data-kind");
          const show = filter === "all" ? true : (kind === filter);
          item.style.display = show ? "" : "none";
        });
      };

      buttons.forEach((btn) => {
        btn.addEventListener("click", () => apply(btn.getAttribute("data-filter")));
      });

      // default
      apply("all");
    });
  };

  // ===== Galleries =====
  const renderGallery = (items, scrollerId, dotsId) => {
    const scroller = qs(`#${scrollerId}`);
    const dots = qs(`#${dotsId}`);
    if (!scroller || !dots) return;

    scroller.innerHTML = "";
    dots.innerHTML = "";

    const safe = Array.isArray(items) ? items : [];
    if (!safe.length) return;

    safe.forEach((it, idx) => {
      const url = (it.url || "").trim();
      if (!url) return;

      const alt = escapeHtml(it.alt || it.title || "image");
      const title = escapeHtml(it.title || "");

      const slide = document.createElement("div");
      slide.className = "gallery-item";
      slide.innerHTML = `
        <div class="gallery-card">
          <img src="${escapeHtml(url)}" alt="${alt}" loading="lazy" />
          ${title ? `<div class="gallery-caption">${title}</div>` : ""}
        </div>
      `;
      scroller.appendChild(slide);

      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "gallery-dot" + (idx === 0 ? " is-active" : "");
      dot.setAttribute("aria-label", `Go to slide ${idx + 1}`);
      dot.addEventListener("click", () => {
        const itemWidth = scroller.firstElementChild?.getBoundingClientRect().width || 0;
        scroller.scrollTo({ left: idx * itemWidth, behavior: "smooth" });
      });
      dots.appendChild(dot);
    });

    // Update dots on scroll
    const updateDots = () => {
      const itemWidth = scroller.firstElementChild?.getBoundingClientRect().width || 1;
      const idx = Math.round(scroller.scrollLeft / itemWidth);
      qsa(".gallery-dot", dots).forEach((d, i) => d.classList.toggle("is-active", i === idx));
    };
    scroller.addEventListener("scroll", () => requestAnimationFrame(updateDots));
    updateDots();
  };

  const setupGalleryNav = () => {
    // Gallery 1
    const gPrev = qs("[data-gprev]");
    const gNext = qs("[data-gnext]");
    const gScroller = qs("#galleryScroller");

    const scrollByOne = (scroller, dir) => {
      if (!scroller) return;
      const w = scroller.firstElementChild?.getBoundingClientRect().width || 300;
      scroller.scrollBy({ left: dir * w, behavior: "smooth" });
    };

    if (gPrev) gPrev.addEventListener("click", () => scrollByOne(gScroller, -1));
    if (gNext) gNext.addEventListener("click", () => scrollByOne(gScroller, 1));

    // Gallery 2
    const cPrev = qs("[data-gprev-cars]");
    const cNext = qs("[data-gnext-cars]");
    const cScroller = qs("#carsGalleryScroller");

    if (cPrev) cPrev.addEventListener("click", () => scrollByOne(cScroller, -1));
    if (cNext) cNext.addEventListener("click", () => scrollByOne(cScroller, 1));
  };

  // ===== Load JSON and Render =====
  const loadPortfolio = async () => {
    const res = await fetch("data/portfolio.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load data/portfolio.json");
    return await res.json();
  };

  const mount = async () => {
    const editGrid = qs("#editGrid");
    const createGrid = qs("#createGrid");

    // If you didn't modify index.html to include these IDs, do nothing
    if (!editGrid || !createGrid) {
      // Still wire old thumbs so site keeps working
      wireVideoThumbs(document);
      return;
    }

    try {
      const data = await loadPortfolio();

      const edit = data?.videos?.edit ?? [];
      const create = data?.videos?.create ?? [];

      editGrid.innerHTML = (Array.isArray(edit) ? edit : []).map((it) => renderVideoCard(it, "edit")).join("");
      createGrid.innerHTML = (Array.isArray(create) ? create : []).map((it) => renderVideoCard(it, "create")).join("");

      wireVideoThumbs(document);
      setupFilters();

      // Galleries
      renderGallery(data?.galleries?.concept ?? [], "galleryScroller", "galleryDots");
      renderGallery(data?.galleries?.cars ?? [], "carsGalleryScroller", "carsGalleryDots");
      setupGalleryNav();
    } catch (err) {
      console.error(err);
      // fallback: keep site usable even if JSON failed
      wireVideoThumbs(document);
      setupFilters();
      setupGalleryNav();
    }
  };

  document.addEventListener("DOMContentLoaded", mount);
})();
