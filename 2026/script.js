/* ============================================================
   CINEMATIC PORTFOLIO — NEO-NOIR SCRIPT
   GSAP + ScrollTrigger + Lenis + SplitType
   Slow, elegant, cinematic. Every animation feels expensive.
   ============================================================ */

(function () {
  'use strict';

  /* -------------------------------------------------------
     Wait for all libraries
     ------------------------------------------------------- */
  function boot() {
    if (
      typeof gsap === 'undefined' ||
      typeof ScrollTrigger === 'undefined' ||
      typeof Lenis === 'undefined' ||
      typeof SplitType === 'undefined'
    ) {
      setTimeout(boot, 50);
      return;
    }
    init();
  }

  /* -------------------------------------------------------
     Initialize
     ------------------------------------------------------- */
  function init() {
    gsap.registerPlugin(ScrollTrigger);

    // Lock scroll during intro
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    initLenis();
    ensureVideoPlayback();
    setupCursorGlow();
    runOpeningSequence();

    setupMobileMenu();
    setupHeroMenu();
  }

  /* -------------------------------------------------------
     Lenis Smooth Scroll
     ------------------------------------------------------- */
  function initLenis() {
    const lenis = new Lenis({
      duration: 1.6,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.6,
      touchMultiplier: 1.2,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    window.__lenis = lenis;
  }

  /* -------------------------------------------------------
     Custom Cursor Glow
     ------------------------------------------------------- */
  function setupCursorGlow() {
    const glow = document.getElementById('cursorGlow');
    if (!glow) return;

    // Only on desktop
    if (window.matchMedia('(hover: hover)').matches) {
      let mouseX = 0, mouseY = 0;
      let glowX = 0, glowY = 0;

      document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      });

      // Smooth follow with lerp
      function updateGlow() {
        glowX += (mouseX - glowX) * 0.08;
        glowY += (mouseY - glowY) * 0.08;
        glow.style.left = glowX + 'px';
        glow.style.top = glowY + 'px';
        requestAnimationFrame(updateGlow);
      }
      updateGlow();
    } else {
      glow.style.display = 'none';
    }
  }

  /* -------------------------------------------------------
     Opening Sequence — Cinematic Splash Intro (GTA 6 Zoom)
     ------------------------------------------------------- */
  function runOpeningSequence() {
    const splashScreen = document.getElementById('splashScreen');
    const splashName = document.getElementById('splashName');
    
    const pageWrapper = document.getElementById('pageWrapper');
    const heroName = document.getElementById('heroName');
    const heroRoleLabel = document.getElementById('heroRoleLabel');
    const heroTagline = document.getElementById('heroTagline');
    const heroStats = document.getElementById('heroStats');
    const heroSectionNav = document.getElementById('heroSectionNav');
    const heroSocial = document.getElementById('heroSocial');
    const heroScroll = document.getElementById('heroScroll');
    const heroMonogram = document.getElementById('heroMonogram');
    const heroMenuBtn = document.getElementById('heroMenuBtn');

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
    });

    // 1. Fade in the name image on the splash screen after 2s total black
    if (splashScreen && splashName) {
      tl.to(splashName, {
        opacity: 1,
        scale: 1,
        duration: 1.2,
        ease: 'power2.out',
        delay: 2.0 // Exactly 2s black screen
      })
      // GTA 6 Style Massive Zoom-in
      .to(splashName, {
        scale: 30, // Massive zoom into the camera
        opacity: 0,
        duration: 1.5,
        ease: 'power4.in', // Accelerates into the zoom
        delay: 0.5 // Hold the logo for a moment before zooming
      })
      // Fade out splash screen background as it zooms
      .to(splashScreen, {
        opacity: 0,
        duration: 0.8,
        onComplete: () => {
          splashScreen.style.display = 'none';
        }
      }, '-=1.0'); // Overlap with the end of the zoom
    }

    // 2. FAST reveal of the hero section underneath
    tl.to(pageWrapper, {
      opacity: 1,
      duration: 0.1, // Almost instant since splash screen covers it
    }, '-=1.5'); // Start revealing before zoom finishes

    // Fade in the hero name text
    tl.fromTo(
      heroName,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' },
      '-=0.5' // Sync with the end of the zoom
    );

    // Reveal role label & tagline quickly
    tl.fromTo(
      [heroRoleLabel, heroTagline],
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out' },
      '-=0.8'
    );

    // Stats panel slides in quickly
    if (heroStats) {
      gsap.set(heroStats, { x: 20 });
      tl.to(
        heroStats,
        { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.8'
      );

      const stats = heroStats.querySelectorAll('.hero__stat');
      tl.fromTo(
        stats,
        { opacity: 0, x: 10 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power3.out' },
        '-=0.7'
      );
    }

    // Fast reveal for peripherals (nav, social, scroll, etc.)
    const peripherals = [heroSectionNav, heroSocial, heroScroll, heroMonogram, heroMenuBtn].filter(Boolean);
    peripherals.forEach((el) => {
      tl.to(
        el,
        { opacity: 1, duration: 0.6, ease: 'power2.out' },
        '-=0.6'
      );
    });

    // Unlock scroll and initialize scroll animations
    tl.call(() => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      
      // Initialize ScrollTriggers AFTER intro finishes so they record the correct start states (opacity: 1)
      setupHeroParallax();
      setupVideoOverlay();
      setupSectionReveals();
      setupNavScroll();
      setupActiveNavLinks();
      
      ScrollTrigger.refresh();
    });
  }

  /* -------------------------------------------------------
     Hero Parallax — Elements fade on scroll
     ------------------------------------------------------- */
  function setupHeroParallax() {
    const heroNameBlock = document.getElementById('heroNameBlock');
    const heroStats = document.getElementById('heroStats');
    const heroSectionNav = document.getElementById('heroSectionNav');
    const heroSocial = document.getElementById('heroSocial');
    const heroScroll = document.getElementById('heroScroll');
    const heroMonogram = document.getElementById('heroMonogram');
    const heroMenuBtn = document.getElementById('heroMenuBtn');

    const fadeElements = [heroNameBlock, heroStats, heroSectionNav, heroSocial, heroScroll, heroMonogram, heroMenuBtn].filter(Boolean);

    // All hero elements fade out as you scroll
    fadeElements.forEach((el) => {
      gsap.to(el, {
        opacity: 0,
        y: -40,
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: '60% top',
          scrub: 1.5,
        },
      });
    });

    // Scroll indicator fades first
    if (heroScroll) {
      gsap.to(heroScroll, {
        opacity: 0,
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: '15% top',
          scrub: true,
        },
      });
    }
  }

  /* -------------------------------------------------------
     Video Overlay — Darken on scroll
     ------------------------------------------------------- */
  function setupVideoOverlay() {
    const overlay = document.getElementById('videoOverlay');
    if (!overlay) return;

    gsap.to(overlay, {
      background: 'linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.98) 100%)',
      scrollTrigger: {
        trigger: '#about',
        start: 'top 100%',
        end: 'top 30%',
        scrub: 1.5,
      },
    });
  }

  /* -------------------------------------------------------
     Section Reveals — Slow, cinematic
     ------------------------------------------------------- */
  function setupSectionReveals() {
    // General reveals
    const revealElements = document.querySelectorAll('[data-reveal]');
    revealElements.forEach((el) => {
      gsap.from(el, {
        y: 50,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    });

    // Skill cards — stagger
    const skillCards = document.querySelectorAll('.skill-card');
    if (skillCards.length) {
      gsap.from(skillCards, {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.skills__grid',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    }

    // Project posters — stagger
    const projectPosters = document.querySelectorAll('.project-poster');
    if (projectPosters.length) {
      gsap.from(projectPosters, {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.projects__grid',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    }

    // Experience items — slide in
    const expItems = document.querySelectorAll('.exp-item');
    if (expItems.length) {
      gsap.from(expItems, {
        x: -40,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.exp-timeline',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    }

    // Education cards
    const eduCards = document.querySelectorAll('.edu-card');
    if (eduCards.length) {
      gsap.from(eduCards, {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.edu__grid',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    }

    // Contact cards
    const contactCards = document.querySelectorAll('.contact-card');
    if (contactCards.length) {
      gsap.from(contactCards, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.contact__grid',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    }

    // Social row
    const socialLinks = document.querySelectorAll('.social-row a');
    if (socialLinks.length) {
      gsap.from(socialLinks, {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.social-row',
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      });
    }

    // Counter animations for about stats
    const statNums = document.querySelectorAll('.about__stat-num');
    statNums.forEach((el) => {
      const targetNum = parseInt(el.getAttribute('data-count') || '0');
      if (targetNum > 0) {
        el.textContent = '0+';

        ScrollTrigger.create({
          trigger: el,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            gsap.to(
              { val: 0 },
              {
                val: targetNum,
                duration: 2.5,
                ease: 'power2.out',
                onUpdate: function () {
                  el.textContent = Math.round(this.targets()[0].val) + '+';
                },
              }
            );
          },
        });
      }
    });
  }

  /* -------------------------------------------------------
     Nav Scroll Behavior
     ------------------------------------------------------- */
  function setupNavScroll() {
    const nav = document.getElementById('mainNav');
    if (!nav) return;

    ScrollTrigger.create({
      start: 'top -80vh',
      onUpdate: (self) => {
        const scroll = self.scroll();
        if (scroll > window.innerHeight * 0.8) {
          nav.classList.add('visible');
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('visible');
          nav.classList.remove('scrolled');
        }
      },
    });
  }

  /* -------------------------------------------------------
     Active Nav Links
     ------------------------------------------------------- */
  function setupActiveNavLinks() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const heroSectionLinks = document.querySelectorAll('.hero__section-link');

    sections.forEach((section) => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 40%',
        end: 'bottom 40%',
        onToggle: ({ isActive }) => {
          if (isActive) {
            const id = section.getAttribute('id');

            // Update nav links
            navLinks.forEach((link) => {
              link.classList.remove('active');
              if (link.getAttribute('href') === '#' + id) {
                link.classList.add('active');
              }
            });

            // Update hero section nav
            heroSectionLinks.forEach((link) => {
              link.classList.remove('active');
              if (link.getAttribute('href') === '#' + id) {
                link.classList.add('active');
              }
            });
          }
        },
      });
    });
  }

  /* -------------------------------------------------------
     Hero Menu Button → Opens mobile overlay
     ------------------------------------------------------- */
  function setupHeroMenu() {
    const heroMenuBtn = document.getElementById('heroMenuBtn');
    const overlay = document.getElementById('mobileOverlay');

    if (heroMenuBtn && overlay) {
      heroMenuBtn.addEventListener('click', () => {
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    }
  }

  /* -------------------------------------------------------
     Mobile Menu
     ------------------------------------------------------- */
  function setupMobileMenu() {
    const hamburger = document.getElementById('hamburgerBtn');
    const overlay = document.getElementById('mobileOverlay');
    const closeBtn = document.getElementById('mobileClose');
    const mobileLinks = overlay ? overlay.querySelectorAll('a') : [];

    if (!hamburger || !overlay) return;

    function openMenu() {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);

    mobileLinks.forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) {
        closeMenu();
      }
    });
  }

  /* -------------------------------------------------------
     Video Playback
     ------------------------------------------------------- */
  function ensureVideoPlayback() {
    const video = document.getElementById('heroVideo');
    if (!video) return;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        document.addEventListener('click', () => video.play(), { once: true });
      });
    }
  }

  /* -------------------------------------------------------
     Boot
     ------------------------------------------------------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
