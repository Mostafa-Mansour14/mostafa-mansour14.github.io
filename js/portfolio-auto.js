(function () {
  function extractYouTubeId(input) {
    if (!input) return "";
    // already an id
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;

    try {
      const url = new URL(input);
      // youtu.be/<id>
      if (url.hostname.includes("youtu.be")) {
        return url.pathname.replace("/", "").trim();
      }
      // youtube.com/watch?v=<id>
      const v = url.searchParams.get("v");
      if (v) return v.trim();

      // youtube.com/shorts/<id>
      const shortsMatch = url.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
      if (shortsMatch) return shortsMatch[1];

      // /embed/<id>
      const embedMatch = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
      if (embedMatch) return embedMatch[1];
    } catch (e) {
      // not a URL
    }

    return "";
  }

  function joinTags(tags) {
    if (!tags) return "";
    if (Array.isArray(tags)) return tags.filter(Boolean).join(" • ");
    return String(tags);
  }

  function createShortCard(item, chipClass, chipLabel) {
    const videoId = extractYouTubeId(item.youtube);
    const tagsText = joinTags(item.tags) || "";

    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-4 portfolio-item";
    col.dataset.kind = "short";
    col.dataset.group = item.group;
    col.dataset.auto = "1";

    col.innerHTML = `
      <div class="video-card">
        <div class="video-head">
          <span class="chip ${chipClass}">${chipLabel}</span>
          <span class="chip chip-ghost">Short</span>
        </div>
        <div class="video-thumb" data-video="${videoId}"><span class="play">▶</span></div>
        <div class="video-meta">
          <div class="video-title">${item.title || "Short"}</div>
          <div class="video-tags">${tagsText}</div>
        </div>
      </div>
    `;

    return col;
  }

  function createYouTubeCard(item, chipClass, chipLabel) {
    const videoId = extractYouTubeId(item.youtube);
    const tagsText = joinTags(item.tags) || "";

    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-4 portfolio-item";
    col.dataset.kind = "youtube";
    col.dataset.group = item.group;
    col.dataset.auto = "1";

    // نفس iframe اللي عندك بالظبط
    col.innerHTML = `
      <div class="video-card">
        <div class="video-head">
          <span class="chip ${chipClass}">${chipLabel}</span>
          <span class="chip chip-ghost">YouTube</span>
        </div>
        <div class="ratio ratio-16x9 video-frame">
          <iframe
            src="https://www.youtube.com/embed/${videoId}"
            title="${item.title || "YouTube Project"}"
            loading="lazy"
            referrerpolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        </div>
        <div class="video-meta">
          <div class="video-title">${item.title || "YouTube Project"}</div>
          <div class="video-tags">${tagsText}</div>
        </div>
      </div>
    `;

    return col;
  }

  async function loadPortfolio() {
    const editRow = document.querySelector("#tab-edit .row.g-4");
    const createRow = document.querySelector("#tab-create .row.g-4");
    if (!editRow || !createRow) return;

    // امسح أي عناصر اتولدت قبل كده (عشان لو غيرتي الداتا وعملتي ريفريش)
    document.querySelectorAll('.portfolio-item[data-auto="1"]').forEach((el) => el.remove());

    const res = await fetch("./data/portfolio.json", { cache: "no-store" });
    const data = await res.json();
    const items = Array.isArray(data.videos) ? data.videos : [];

    items.forEach((item) => {
      const group = (item.group || "").toLowerCase().trim();
      const kind = (item.kind || "").toLowerCase().trim();

      const isEdit = group === "edit";
      const targetRow = isEdit ? editRow : createRow;
      const chipClass = isEdit ? "chip-edit" : "chip-create";
      const chipLabel = isEdit ? "Editing" : "Creator";

      let node = null;
      if (kind === "youtube") node = createYouTubeCard(item, chipClass, chipLabel);
      else node = createShortCard(item, chipClass, chipLabel);

      targetRow.appendChild(node);
    });
  }

  // شغّل بعد تحميل الصفحة
  document.addEventListener("DOMContentLoaded", loadPortfolio);
})();
