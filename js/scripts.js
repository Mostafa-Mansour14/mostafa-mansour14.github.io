window.addEventListener("DOMContentLoaded", () => {

  // =========================
  // Helpers
  // =========================
  const qs = (s, el = document) => el.querySelector(s);
  const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));

  const toYouTubeId = (value) => {
    if (!value) return "";
    const v = String(value).trim();

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

  // =========================
  // Data (UPDATED 🔥)
  // =========================

  const NEW_SHORTS = [
    // OLD
    "https://youtube.com/shorts/nJZVmrPypEg",
    "https://youtube.com/shorts/TjLQyM1boSA",
    "https://youtube.com/shorts/5rJbLmcfBSE",
    "https://youtube.com/shorts/5129Esy6WhI",

    // NEW
    "https://youtube.com/shorts/jYHD190iaXQ?feature=share",
    "https://youtube.com/shorts/ZdUIPkAE0Sg",
    "https://youtube.com/shorts/fYDDOGB-FNE?feature=share",
    "https://youtu.be/C3nqcKiuewQ",
    "https://youtube.com/shorts/FKbncc6ydII",
    "https://youtube.com/shorts/QrnVzjlZmOY?feature=share",
  ].map(toYouTubeId);

  const EDIT_SHORTS = [
    "GEFvzpgGZmU",
    "0shWVNJMoVo",
    "mYQBfzR22TQ",
    "Juso-cC3Xd4",
    ...NEW_SHORTS,
  ];

  const CREATE_SHORTS = [
    "hwqzvZyO-54",
    "qcDr3tEWJzE",
    "5IXdCBKqc-k",
    "BznO4vpu6oA",
    ...NEW_SHORTS,
  ];

  const YT_LONGFORM = [
    "XD0AC8IM47E",
    "0ZDJulsMbpY",
    "9UsZ7roRvlk",
    "Mw-XSyH3xNQ",
    "SnYlYmBOFgk",
  ];

  // =========================
  // Build Cards
  // =========================
  function makeShortCard({ group, label, id, tags }) {
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

  function makeYouTubeCard({ id, tags }) {
    return `
      <div class="col-12 col-md-6 col-lg-4">
        <div class="video-card">
          <div class="video-head">
            <span class="chip chip-ghost">YouTube</span>
          </div>

          <div class="ratio ratio-16x9 video-frame">
            <iframe
              src="https://www.youtube.com/embed/${id}"
              loading="lazy"
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

    editGrid.innerHTML = EDIT_SHORTS.map((id) =>
      makeShortCard({
        group: "edit",
        label: "Editing",
        id,
        tags: "Pacing • Transitions • Retention",
      })
    ).join("");

    createGrid.innerHTML = CREATE_SHORTS.map((id) =>
      makeShortCard({
        group: "create",
        label: "Creator",
        id,
        tags: "Hook • Delivery • Story",
      })
    ).join("");
  }

  function renderYouTube() {
    const ytGrid = qs("#youtubeGrid");
    if (!ytGrid) return;

    ytGrid.innerHTML = YT_LONGFORM.map((id) =>
      makeYouTubeCard({
        id,
        tags: "Storytelling • Widescreen • Delivery",
      })
    ).join("");
  }

  renderPortfolio();
  renderYouTube();

  // =========================
  // Modal
  // =========================
  const modalEl = qs("#videoModal");
  const modalPlayer = qs("#modalPlayer");
  const modal = modalEl && window.bootstrap ? new bootstrap.Modal(modalEl) : null;

  function openVideo(id) {
    if (!modal || !modalPlayer) return;
    modalPlayer.src = `https://www.youtube.com/embed/${id}?autoplay=1`;
    modal.show();
  }

  if (modalEl && modalPlayer) {
    modalEl.addEventListener("hidden.bs.modal", () => {
      modalPlayer.src = "";
    });
  }

  function initShortThumbs() {
    qsa('.video-thumb[data-video]').forEach((thumb) => {
      const id = thumb.getAttribute("data-video");
      if (!id) return;
      thumb.style.setProperty("--thumb", `url('https://i.ytimg.com/vi/${id}/hqdefault.jpg')`);
      thumb.addEventListener("click", () => openVideo(id));
    });
  }

  initShortThumbs();

});
