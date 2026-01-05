window.addEventListener('DOMContentLoaded', () => {
  const navCollapseEl = document.getElementById('navbarResponsive');
  const navToggler = document.querySelector('.navbar-toggler');

  // create collapse instance and force it closed
  let collapse = null;
  if (navCollapseEl && window.bootstrap) {
    collapse = bootstrap.Collapse.getInstance(navCollapseEl) || new bootstrap.Collapse(navCollapseEl, { toggle: false });
    collapse.hide();
    navCollapseEl.classList.remove('show');
    navToggler?.setAttribute('aria-expanded', 'false');
  }

  // close menu when clicking a nav link (mobile)
  document.querySelectorAll('#navbarResponsive .nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      if (!navToggler) return;
      const isMobile = window.getComputedStyle(navToggler).display !== 'none';
      if (isMobile) collapse?.hide();
    });
  });

  // close when clicking outside
  document.addEventListener('click', (e) => {
    if (!navCollapseEl || !navToggler) return;
    const isMobile = window.getComputedStyle(navToggler).display !== 'none';
    if (!isMobile) return;

    const clickedInsideMenu = navCollapseEl.contains(e.target);
    const clickedToggler = navToggler.contains(e.target);

    if (!clickedInsideMenu && !clickedToggler) {
      collapse?.hide();
    }
  });

  // close on resize to desktop
  window.addEventListener('resize', () => {
    if (!navToggler) return;
    const isMobile = window.getComputedStyle(navToggler).display !== 'none';
    if (!isMobile) collapse?.hide();
  });

  // ---- keep your existing features below (filters + modal) ----
  // Portfolio filters
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

  // Shorts thumbnails => Modal
  const modalEl = document.getElementById('videoModal');
  const modalPlayer = document.getElementById('modalPlayer');
  const modal = (modalEl && window.bootstrap) ? new bootstrap.Modal(modalEl) : null;

  function openVideo(id) {
    if (!modal || !modalPlayer) return;
    modalPlayer.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    modal.show();
  }

  if (modalEl && modalPlayer) {
    modalEl.addEventListener('hidden.bs.modal', () => {
      modalPlayer.src = '';
    });
  }

  document.querySelectorAll('.video-thumb[data-video]').forEach((thumb) => {
    const id = thumb.getAttribute('data-video');
    thumb.style.setProperty('--thumb', `url('https://i.ytimg.com/vi/${id}/hqdefault.jpg')`);
    thumb.classList.add('has-thumb');
    thumb.addEventListener('click', () => openVideo(id));
  });
});
