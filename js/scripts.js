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
  // =========================
// GALLERY (AUTO FROM JSON)
// =========================
async function initGalleryFromJson(){
  const wrap=document.querySelector('[data-gallery]');
  if(!wrap) return;

  const jsonPath=wrap.dataset.galleryJson;
  const scroller=document.getElementById('galleryScroller');
  const dots=document.getElementById('galleryDots');
  const prev=document.querySelector('[data-gprev]');
  const next=document.querySelector('[data-gnext]');

  let files=[];
  try{
    const res=await fetch(jsonPath,{cache:'no-store'});
    files=await res.json();
  }catch(e){ return; }

  files=files.filter(f=>/\.(png|jpg|jpeg|webp|gif)$/i.test(f));
  scroller.innerHTML='';
  dots.innerHTML='';

  files.forEach((file,i)=>{
    const fig=document.createElement('figure');
    fig.className='gallery-item'+(i===0?' is-active':'');

    const img=document.createElement('img');
    img.src=`assets/img/gallery/${file}`;
    img.loading='lazy';

    fig.appendChild(img);
    scroller.appendChild(fig);

    const dot=document.createElement('span');
    dot.className='gallery-dot'+(i===0?' is-active':'');
    dot.onclick=()=>fig.scrollIntoView({behavior:'smooth',inline:'center'});
    dots.appendChild(dot);
  });
}
initGalleryFromJson();

  // Lightbox
  const lb = document.getElementById('lightbox');
  const lbImg = lb ? lb.querySelector('.lightbox-img') : null;
  const lbClose = lb ? lb.querySelector('.lightbox-close') : null;
  const lbPrev = lb ? lb.querySelector('.lightbox-nav.prev') : null;
  const lbNext = lb ? lb.querySelector('.lightbox-nav.next') : null;

  let galleryItems = [];
  let activeIndex = 0;

  function openLightbox(index) {
    if (!lb || !lbImg || !galleryItems.length) return;
    activeIndex = Math.max(0, Math.min(galleryItems.length - 1, index));
    const img = galleryItems[activeIndex].querySelector('img');
    if (!img) return;

    lbImg.src = img.src;
    lbImg.alt = img.alt || '';
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lb || !lbImg) return;
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    lbImg.src = '';
    document.body.style.overflow = '';
  }

  function stepLightbox(dir) {
    if (!galleryItems.length) return;
    openLightbox(activeIndex + dir);
  }

  lbClose?.addEventListener('click', closeLightbox);
  lbPrev?.addEventListener('click', () => stepLightbox(-1));
  lbNext?.addEventListener('click', () => stepLightbox(1));
  lb?.addEventListener('click', (e) => {
    if (e.target === lb) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lb || !lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') stepLightbox(-1);
    if (e.key === 'ArrowRight') stepLightbox(1);
  });

  function buildDots(items) {
    if (!dotsWrap) return;
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

  function setActiveByCenter(items) {
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

  function scrollByOne(items, dir) {
    const active = scroller.querySelector('.gallery-item.is-active') || items[0];
    const index = Math.max(0, items.indexOf(active));
    const nextIndex = Math.min(items.length - 1, Math.max(0, index + dir));
    items[nextIndex].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }

  function wireGallery(items) {
    galleryItems = items;

    // click => lightbox
    items.forEach((fig, idx) => {
      fig.addEventListener('click', () => openLightbox(idx));
    });

    // first active
    items.forEach((it, idx) => it.classList.toggle('is-active', idx === 0));
    buildDots(items);
    setActiveByCenter(items);

    let t = null;
    scroller.addEventListener('scroll', () => {
      clearTimeout(t);
      t = setTimeout(() => setActiveByCenter(items), 80);
    });

    prevBtn?.addEventListener('click', () => scrollByOne(items, -1));
    nextBtn?.addEventListener('click', () => scrollByOne(items, 1));
    window.addEventListener('resize', () => setActiveByCenter(items));
  }

  async function initGalleryFromJson() {
    if (!scroller || !galleryZone) return;

    // avoid blur “sticking”
    galleryZone.classList.add('is-visible');

    const jsonPath = galleryZone.getAttribute('data-gallery-json');
    if (!jsonPath) return;

    try {
      const res = await fetch(jsonPath, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load gallery json');
      const files = await res.json();
      if (!Array.isArray(files) || files.length === 0) return;

      const frag = document.createDocumentFragment();
      files.forEach((file, i) => {
        const fig = document.createElement('figure');
        fig.className = 'gallery-item';

        const img = document.createElement('img');
        img.loading = 'lazy';
        img.alt = `Concept Product ${i + 1}`;
        img.src = `assets/img/gallery/${file}`;

        fig.appendChild(img);
        frag.appendChild(fig);
      });

      scroller.innerHTML = '';
      scroller.appendChild(frag);

      const items = Array.from(scroller.querySelectorAll('.gallery-item'));
      if (items.length) wireGallery(items);
    } catch (err) {
      // fallback (optional): do nothing silently
      // console.warn(err);
    }
  }

  initGalleryFromJson();
});
