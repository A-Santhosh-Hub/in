/*
  GTA VI Inspired Landing Page Interactions
  - Preloader exit
  - GSAP intro + scroll reveals
  - Parallax divider
  - Media lightbox (images + YouTube)
  - Trailer modal
  - Countdown timer
  - Dark mode toggle with persistence
*/

(() => {
  const select = (q, ctx = document) => ctx.querySelector(q);
  const selectAll = (q, ctx = document) => Array.from(ctx.querySelectorAll(q));

  // Preloader
  const preloader = select('#preloader');
  window.addEventListener('load', () => {
    setTimeout(() => preloader?.classList.add('hidden'), 350);
  });

  // Theme
  const themeToggle = select('#themeToggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const storedTheme = localStorage.getItem('theme');
  const initialTheme = storedTheme || (prefersDark ? 'theme-dark' : 'theme-light');
  document.body.classList.remove('theme-dark', 'theme-light');
  document.body.classList.add(initialTheme);
  themeToggle?.setAttribute('aria-pressed', String(initialTheme === 'theme-dark'));
  themeToggle?.addEventListener('click', () => {
    const isDark = document.body.classList.contains('theme-dark');
    document.body.classList.toggle('theme-dark', !isDark);
    document.body.classList.toggle('theme-light', isDark);
    localStorage.setItem('theme', !isDark ? 'theme-dark' : 'theme-light');
    themeToggle.setAttribute('aria-pressed', String(!isDark));
  });

  // GSAP
  if (window.gsap) {
    gsap.registerPlugin(ScrollTrigger);

    // Hero logo intro
    gsap.to('.gta-logo', { opacity: 1, y: 0, duration: 1, delay: .2, ease: 'power3.out' });

    // Split reveals
    selectAll('.reveal-left').forEach(el => {
      gsap.fromTo(el, { opacity: 0, x: -24 }, {
        opacity: 1, x: 0, duration: .9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 80%' }
      });
    });
    selectAll('.reveal-right').forEach(el => {
      gsap.fromTo(el, { opacity: 0, x: 24 }, {
        opacity: 1, x: 0, duration: .9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 80%' }
      });
    });

    // Parallax layers
    const divider = select('.scene-divider');
    if (divider) {
      const back = select('.layer-back', divider);
      const mid = select('.layer-mid', divider);
      const front = select('.layer-front', divider);
      const tl = gsap.timeline({
        scrollTrigger: { trigger: divider, start: 'top bottom', end: 'bottom top', scrub: true }
      });
      if (back) tl.to(back, { backgroundPositionX: '-20%', ease: 'none' }, 0);
      if (mid) tl.to(mid, { backgroundPositionX: '-35%', ease: 'none' }, 0);
      if (front) tl.to(front, { backgroundPositionX: '-50%', ease: 'none' }, 0);
    }
  }

  // Lightbox for media
  const lightbox = select('#lightbox');
  const lightboxContent = select('#lightboxContent');
  const lightboxClose = select('#lightboxClose');

  function openLightboxForImage(src, alt = '') {
    if (!lightboxContent) return;
    lightboxContent.innerHTML = '';
    const img = document.createElement('img');
    img.src = src; img.alt = alt;
    lightboxContent.appendChild(img);
    lightbox?.classList.add('open');
  }
  function openLightboxForVideo(url) {
    if (!lightboxContent) return;
    lightboxContent.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
    iframe.allowFullscreen = true;
    lightboxContent.appendChild(iframe);
    lightbox?.classList.add('open');
  }
  function closeLightbox() {
    if (!lightboxContent) return;
    lightbox?.classList.remove('open');
    lightboxContent.innerHTML = '';
  }

  selectAll('.media-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const type = item.getAttribute('data-type');
      if (type === 'image') openLightboxForImage(item.getAttribute('href') || '', item.querySelector('img')?.alt || '');
      if (type === 'video') openLightboxForVideo(item.getAttribute('data-video') || '');
    });
  });
  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  // Trailer modal
  const trailerOpen = select('#openTrailer');
  const trailerModal = select('#trailer');
  const trailerClose = select('#trailerClose');
  const trailerEmbed = select('.trailer-embed');
  const trailerSrc = 'https://www.youtube.com/embed/QdBZY2fkU-0?autoplay=1&rel=0';
  trailerOpen?.addEventListener('click', (e) => {
    e.preventDefault();
    if (!trailerEmbed) return;
    trailerEmbed.innerHTML = `<iframe src="${trailerSrc}" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    trailerModal?.classList.add('open');
  });
  function closeTrailer() {
    trailerModal?.classList.remove('open');
    if (trailerEmbed) trailerEmbed.innerHTML = '';
  }
  trailerClose?.addEventListener('click', closeTrailer);
  trailerModal?.addEventListener('click', (e) => { if (e.target === trailerModal) closeTrailer(); });

  // Countdown timer
  const dd = select('#dd');
  const hh = select('#hh');
  const mm = select('#mm');
  const ss = select('#ss');
  // Target date (customize): Dec 31, 2025 00:00:00
  const targetDate = new Date('2025-12-31T00:00:00Z').getTime();
  function pad(n) { return String(n).padStart(2, '0'); }
  function tick() {
    const now = Date.now();
    let diff = Math.max(0, targetDate - now);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24)); diff -= days * (1000 * 60 * 60 * 24);
    const hours = Math.floor(diff / (1000 * 60 * 60)); diff -= hours * (1000 * 60 * 60);
    const mins = Math.floor(diff / (1000 * 60)); diff -= mins * (1000 * 60);
    const secs = Math.floor(diff / 1000);
    if (dd) dd.textContent = pad(days);
    if (hh) hh.textContent = pad(hours);
    if (mm) mm.textContent = pad(mins);
    if (ss) ss.textContent = pad(secs);
  }
  tick();
  setInterval(tick, 1000);
})();

