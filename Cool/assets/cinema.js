/* Native-scroll choreography: opening, pinned camera zoom, chapters and project reel. */
(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const clamp = value => Math.min(1, Math.max(0, value));
  const paused = () => document.body.classList.contains('motion-paused');
  const hero = $('#home');
  const intro = $('#intro');
  const world = $('.world-break');
  const header = $('#main-header');
  const menu = $('.nav-menu');
  let lastHeaderY = scrollY;
  let motionFrame = 0;
  let lastFrameTime = 0;
  let renderedY = scrollY;
  let targetY = scrollY;
  let measureFrame = 0;
  let geometry = null;
  let openingTimer;

  function finishOpening() {
    clearTimeout(openingTimer);
    if (document.body.classList.contains('opening-active')) document.body.classList.remove('opening-active');
    if (!document.body.classList.contains('opening-finished')) document.body.classList.add('opening-finished');
  }
  if (!paused() && !location.hash && scrollY < 30) {
    document.body.classList.add('opening-active');
    openingTimer = setTimeout(finishOpening, 2250);
  } else finishOpening();
  $('.skip-opening').addEventListener('click', finishOpening);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') finishOpening(); });

  // Cache layout on resize/content changes. Animation frames only write transforms.
  const landscape = $('.hero-landscape');
  const title = $('.hero-title-stage');
  const heroBottom = $('.hero-bottom');
  const person = $('.hero-person');
  const introInner = $('.manifesto-inner');
  const introPerson = $('.intro-portrait');
  const worldArt = $('.world-break-art');
  const worldCopy = $('.world-break-copy');
  const chapterLinks = $$('.chapter-nav a');
  const navLinks = $$('.nav-link');
  const styleCache = new WeakMap();
  function write(element, property, value) {
    let cache = styleCache.get(element);
    if (!cache) { cache = {}; styleCache.set(element, cache); }
    if (cache[property] === value) return;
    cache[property] = value;
    element.style[property] = value;
  }
  function prepare(scene) {
    if (scene.prepared) return;
    scene.prepared = true;
    const decode = () => scene.section.querySelectorAll('img').forEach(img => {
      img.loading = 'eager';
      img.decode?.().catch(() => {});
    });
    if ('requestIdleCallback' in window) requestIdleCallback(decode, { timeout: 600 });
    else setTimeout(decode, 0);
  }
  const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
  // Each chapter keeps its natural reading height. Only its final viewport pins.
  // The next camera overlaps that viewport, so a faded scene never leaves a gap.
  const scenes = $$('#main-content > section').map((section, index) => {
    const track = document.createElement('div');
    track.className = 'chapter-track';
    track.dataset.chapter = section.id || `scene-${index}`;
    const camera = document.createElement('div');
    camera.className = 'chapter-camera';
    section.before(track); track.append(camera); camera.append(section);
    section.classList.add('chapter-surface');
    track.style.zIndex = String(index + 1);
    return { section, track, camera };
  });
  document.body.classList.add('chapter-transitions');
  function measure() {
    const top = element => element.getBoundingClientRect().top + scrollY;
    const stopped = paused();
    const viewport = innerHeight;
    const hold = viewport * .18;
    const duration = viewport * .62;
    // Read natural sizes first, then write track sizes; no layout reads in draw().
    const heights = scenes.map(scene => scene.camera.offsetHeight);
    scenes.forEach((scene, index) => {
      scene.height = heights[index];
      scene.track.style.height = stopped ? '' : `${scene.height + (index < scenes.length - 1 ? hold + duration : 0)}px`;
      scene.track.style.marginTop = stopped || index === 0 ? '0px' : `${-viewport}px`;
      scene.camera.style.top = stopped ? '' : `${Math.min(0, viewport - scene.height)}px`;
    });
    scenes.forEach((scene, index) => {
      scene.top = top(scene.track);
      scene.exitStart = scene.top + Math.max(0, scene.height - viewport) + hold;
      scene.exitEnd = scene.exitStart + duration;
      scene.next = index < scenes.length - 1;
    });
    geometry = {
      viewport,
      heroTop: scenes[0].top, heroHeight: scenes[0].height,
      introTop: scenes[1].top, introHeight: scenes[1].height,
      worldTop: scenes.find(scene => scene.section === world).top, worldHeight: world.offsetHeight,
      chapters: chapterLinks.map(link => ({ link, top: scenes.find(scene => scene.section === $(link.hash)).top })),
      navigation: navLinks.map(link => ({ link, top: scenes.find(scene => scene.section === $(link.hash))?.top ?? 0 }))
    };
    targetY = scrollY;
    measureFrame = 0;
    startMotion();
  }
  function queueMeasure() { if (!measureFrame) measureFrame = requestAnimationFrame(measure); }
  function draw(y) {
    if (!geometry) return;
    const g = geometry;
    const stopped = paused();
    scenes.forEach((scene, index) => {
      const previous = scenes[index - 1];
      const warm = !stopped && targetY >= (previous ? previous.exitStart : 0) && (!scene.next || targetY < scene.exitEnd);
      if (scene.warm !== warm) {
        scene.warm = warm;
        scene.camera.classList.toggle('camera-warm', warm);
        if (warm) prepare(scene);
      }
      const enter = stopped || !previous || targetY >= previous.exitEnd - .75 ? 1 : smooth(((targetY - previous.exitStart) / (previous.exitEnd - previous.exitStart) - .78) / .22);
      const exit = stopped || !scene.next ? 0 : clamp((y - scene.exitStart) / (scene.exitEnd - scene.exitStart));
      const finished = !stopped && scene.next && targetY >= scene.exitEnd - .75;
      const entering = !stopped && previous && targetY < scene.top;
      // Match native scroll position exactly; ease only the camera's zoom.
      const lift = entering && enter > 0 ? Math.max(0, scene.top - targetY) : 0;
      write(scene.camera, 'transform', `translate3d(0,${(-lift).toFixed(2)}px,0)`);
      write(scene.camera, 'opacity', finished ? '0' : enter.toFixed(4));
      write(scene.camera, 'pointerEvents', enter < .8 || finished ? 'none' : '');
      if (warm || stopped) {
        write(scene.section, 'transformOrigin', `50% ${entering ? g.viewport / 2 : scene.height - g.viewport / 2}px`);
        write(scene.section, 'transform', `scale(${(1 - (1 - enter) * .035 + smooth(exit) * .16).toFixed(4)})`);
      }
      if (!scene.prepared && targetY + g.viewport >= scene.top) prepare(scene);
    });
    if (scenes[0].warm || stopped) {
    const progress = stopped ? 0 : clamp((y - scenes[0].exitStart) / (scenes[0].exitEnd - scenes[0].exitStart));
    // Keep the person, name and environment together until the incoming scene covers them.
    const camera = 1.02 + progress * .26;
    const titleScale = 1 + progress * .4;
    const opacity = 1;
    write(landscape, 'transform', `translate3d(0,${(progress * -22).toFixed(2)}px,0) scale(${camera.toFixed(4)})`);
    write(title, 'transform', `translate3d(-50%,-50%,0) scale(${titleScale.toFixed(4)})`);
    write(title, 'opacity', String(opacity));
    write(heroBottom, 'transform', `translate3d(0,${(progress * 25).toFixed(2)}px,0)`);
    write(heroBottom, 'opacity', String(opacity));
    if (person) {
      write(person, 'transform', `translate3d(0,${(progress * 38).toFixed(2)}px,0) scale(${(1 + progress * .08).toFixed(4)})`);
      write(person, 'opacity', '1');
    }
    }
    if (scenes[1].warm || stopped) {
    const introProgress = stopped ? 0 : smooth((y - scenes[1].exitStart) / (scenes[1].exitEnd - scenes[1].exitStart));
    write(introInner, 'transform', `scale(${(1 + introProgress * .045).toFixed(4)})`);
    write(introInner, 'opacity', '1');
    if (introPerson) write(introPerson, 'transform', `scale(${(1 + introProgress * .075).toFixed(4)})`);
    }
    if (scenes[3].warm || stopped) {
    const worldProgress = stopped ? .5 : clamp((g.viewport - (g.worldTop - y)) / (g.viewport + g.worldHeight));
    write(worldArt, 'transform', `translate3d(0,0,0) scale(${(1.13 - worldProgress * .13).toFixed(4)})`);
    write(worldCopy, 'transform', `translate3d(0,calc(-50% + ${((worldProgress - .5) * -48).toFixed(2)}px),0)`);
    }
  }
  function animate(time) {
    const dt = Math.min(50,lastFrameTime ? time - lastFrameTime : 16.67);
    lastFrameTime = time;
    // Frame-rate-independent damping. Native scrolling itself remains untouched.
    renderedY = paused() ? targetY : renderedY + (targetY - renderedY) * (1 - Math.exp(-dt / 42));
    if (Math.abs(targetY - renderedY) < .15) renderedY = targetY;
    draw(renderedY);
    motionFrame = renderedY !== targetY && !document.hidden ? requestAnimationFrame(animate) : 0;
    if (!motionFrame) lastFrameTime = 0;
  }
  function startMotion() { if (!motionFrame && !document.hidden) motionFrame = requestAnimationFrame(animate); }
  function onScroll() {
    targetY = scrollY;
    if (geometry) {
      header.classList.toggle('scrolled', targetY > 50);
      if (Math.abs(targetY - lastHeaderY) > 18) {
        header.classList.toggle('header-away', !paused() && targetY > geometry.viewport * .5 && targetY > lastHeaderY && !menu.classList.contains('active'));
        lastHeaderY = targetY;
      }
      if (targetY < 60) header.classList.remove('header-away');
      let active = geometry.chapters[0]?.link;
      for (const entry of geometry.chapters) if (entry.top - targetY <= geometry.viewport * .45) active = entry.link;
      geometry.chapters.forEach(({ link }) => {
        link.classList.toggle('active', link === active);
        if (link === active && !link.hasAttribute('aria-current')) link.setAttribute('aria-current', 'location');
        else if (link !== active && link.hasAttribute('aria-current')) link.removeAttribute('aria-current');
      });
      let navActive = geometry.navigation[0]?.link;
      for (const entry of geometry.navigation) if (entry.top - targetY <= geometry.viewport * .35) navActive = entry.link;
      geometry.navigation.forEach(({link}) => {
        link.classList.toggle('active', link === navActive);
        if (link === navActive && !link.hasAttribute('aria-current')) link.setAttribute('aria-current', 'location');
        else if (link !== navActive && link.hasAttribute('aria-current')) link.removeAttribute('aria-current');
      });
    }
    startMotion();
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', queueMeasure);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(queueMeasure);
    scenes.forEach(scene => observer.observe(scene.camera));
  }
  document.fonts?.ready.then(queueMeasure);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && motionFrame) { cancelAnimationFrame(motionFrame); motionFrame = 0; lastFrameTime = 0; }
    else { renderedY = targetY = scrollY; queueMeasure(); }
  });
  document.addEventListener('portfolio:motionchange', () => {
    if (paused()) { finishOpening(); header.classList.remove('header-away'); }
    renderedY = targetY = scrollY;
    queueMeasure();
  });
  measure();

  // Anchors target the stable track, not the temporarily transformed surface.
  function goToChapter(hash, behavior = 'smooth') {
    const scene = scenes.find(item => `#${item.section.id}` === hash);
    if (!scene || paused()) return false;
    scrollTo({ top: scene.top, behavior });
    return true;
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (goToChapter(link.hash)) {
      event.preventDefault();
      if (location.hash !== link.hash) history.pushState(null, '', link.hash);
    }
  });
  addEventListener('hashchange', () => goToChapter(location.hash, 'instant'));
  if (location.hash) requestAnimationFrame(() => goToChapter(location.hash, 'instant'));
  document.addEventListener('focusin', event => {
    if (paused() || document.body.classList.contains('modal-active')) return;
    const scene = scenes.find(item => item.section.contains(event.target));
    if (!scene || Number(scene.camera.style.opacity) >= .8) return;
    const rect = scene.section.getBoundingClientRect();
    const scale = rect.height / scene.section.offsetHeight;
    const localY = (event.target.getBoundingClientRect().top - rect.top) / scale;
    const readingOffset = Math.max(0, Math.min(scene.height - innerHeight, localY - innerHeight * .4));
    scrollTo({ top: scene.top + readingOffset, behavior: 'instant' });
    renderedY = targetY = scrollY;
    draw(renderedY);
  });

  new MutationObserver(() => {
    const open = menu.classList.contains('active');
    document.body.classList.toggle('menu-open', open);
    $('#hamburg').setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    if (open) {
      header.classList.remove('header-away');
      menu.querySelector('a').focus({ preventScroll: true });
    }
  }).observe(menu, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Tab' || !menu.classList.contains('active')) return;
    const focusables = [...menu.querySelectorAll('a,button,[tabindex="0"]'), $('#hamburg')];
    const first = focusables[0], last = focusables.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  const reel = $('#project-reel');
  const previous = $('.slide-prev');
  const next = $('.slide-next');
  let reelFrame = null;
  function visibleCards() { return $$('.project-card').filter(card => !card.hidden); }
  function renderReel() {
    const cards = visibleCards();
    const reelBox = reel.getBoundingClientRect();
    const distances = cards.map(card => ({ card, box: card.getBoundingClientRect() }));
    let nearest = 0, distance = Infinity;
    distances.forEach(({ card, box }, index) => {
      const delta = Math.abs(box.left - reelBox.left);
      if (delta < distance) { nearest = index; distance = delta; }
      const factor = paused() ? 1 : 1 - Math.min(.045, Math.abs(box.left - reelBox.left) / Math.max(1,reelBox.width) * .045);
      card.style.setProperty('--cover-scale', factor.toFixed(4));
    });
    $('.slide-count').textContent = `${String(nearest + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
    previous.disabled = reel.scrollLeft < 5;
    next.disabled = reel.scrollLeft >= reel.scrollWidth - reel.clientWidth - 5;
    reelFrame = null;
  }
  function queueReel() { if (!reelFrame) reelFrame = requestAnimationFrame(renderReel); }
  function slide(direction) {
    const cards = visibleCards();
    const reelBox = reel.getBoundingClientRect();
    let nearest = 0, distance = Infinity;
    cards.forEach((card, index) => {
      const delta = Math.abs(card.getBoundingClientRect().left - reelBox.left);
      if (delta < distance) { nearest = index; distance = delta; }
    });
    const target = cards[Math.max(0, Math.min(cards.length - 1, nearest + direction))];
    if (target) reel.scrollTo({ left: reel.scrollLeft + target.getBoundingClientRect().left - reelBox.left, behavior: paused() ? 'instant' : 'smooth' });
  }
  previous.addEventListener('click', () => slide(-1));
  next.addEventListener('click', () => slide(1));
  reel.addEventListener('keydown', event => {
    if (event.target === reel && ['ArrowLeft','ArrowRight'].includes(event.key)) { event.preventDefault(); slide(event.key === 'ArrowLeft' ? -1 : 1); }
  });
  reel.addEventListener('scroll', queueReel, { passive: true });
  addEventListener('resize', queueReel);
  $$('.filter-btn').forEach(button => button.addEventListener('click', () => {
    reel.scrollTo({ left:0, behavior:'instant' }); queueReel();
  }));
  renderReel();
})();
