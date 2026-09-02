/* ===========================
   SpeedWatch – JavaScript
   =========================== */

(function () {
  'use strict';

  // ── Navbar scroll effect ──
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // ── Mobile hamburger menu ──
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  hamburger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
    mobileMenu.setAttribute('aria-hidden', !open);
  });
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
      mobileMenu.setAttribute('aria-hidden', true);
    });
  });

  // ── Intersection Observer: reveal on scroll ──
  const revealTargets = [
    '.feature-card',
    '.lab-card',
    '.pricing-card',
    '.step',
    '.section-header',
    '.privacy-card',
    '.lab-audit-note',
  ];

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  revealTargets.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${i * 60}ms`;
      observer.observe(el);
    });
  });

  // ── Speedometer arc + live readout animation ──
  const arc = document.querySelector('.speed-arc');
  const needle = document.querySelector('.needle');
  const speedValue = document.querySelector('.speed-value');

  // M3 Emphasized easing (EmphasizedDecelerate)
  const M3_EASE = 'cubic-bezier(0.05, 0.7, 0.1, 1.0)';
  const FULL_DASH = 240;

  const phases = [
    { offset: 240, speed: 0,  ms: 400,  hold: 600  },
    { offset: 160, speed: 33, ms: 1200, hold: 300  },
    { offset: 90,  speed: 62, ms: 1800, hold: 300  },
    { offset: 60,  speed: 87, ms: 1200, hold: 1400 },
    { offset: 50,  speed: 94, ms: 800,  hold: 800  },
    { offset: 60,  speed: 87, ms: 600,  hold: 400  },
    { offset: 240, speed: 0,  ms: 400,  hold: 600  },
  ];

  let phaseIdx = 0;
  let animRAF = null;
  let prevSpeed = 0;

  function animateReadout(fromSpeed, toSpeed, durationMs) {
    const start = performance.now();
    if (animRAF) cancelAnimationFrame(animRAF);
    function tick(now) {
      const t = Math.min((now - start) / durationMs, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      const val = fromSpeed + (toSpeed - fromSpeed) * ease;
      if (speedValue) speedValue.textContent = val.toFixed(1);
      if (t < 1) animRAF = requestAnimationFrame(tick);
    }
    animRAF = requestAnimationFrame(tick);
  }

  function runPhase() {
    const phase = phases[phaseIdx];
    if (arc) {
      arc.style.transition = `stroke-dashoffset ${phase.ms}ms ${M3_EASE}`;
      arc.style.strokeDashoffset = phase.offset;
    }
    if (needle) {
      const progress = 1 - phase.offset / FULL_DASH;
      const angle = 135 + progress * 270;
      const rad = angle * Math.PI / 180;
      const ex = 100 + Math.cos(rad) * 60;
      const ey = 100 + Math.sin(rad) * 60;
      needle.style.transition = `all ${phase.ms}ms ${M3_EASE}`;
      needle.setAttribute('x2', ex.toFixed(1));
      needle.setAttribute('y2', ey.toFixed(1));
    }
    animateReadout(prevSpeed, phase.speed, phase.ms);
    prevSpeed = phase.speed;
    phaseIdx = (phaseIdx + 1) % phases.length;
    setTimeout(runPhase, phase.ms + phase.hold);
  }

  const heroEl = document.getElementById('hero');
  const heroObs = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        runPhase();
        heroObs.disconnect();
      }
    },
    { threshold: 0.3 }
  );
  if (heroEl) heroObs.observe(heroEl);



  // ── Smooth active nav link highlighting ──
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');

  const sectionObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            link.style.color = link.getAttribute('href') === `#${id}`
              ? 'var(--cyan)'
              : '';
          });
        }
      });
    },
    { threshold: 0.4 }
  );
  sections.forEach((s) => sectionObs.observe(s));

})();
