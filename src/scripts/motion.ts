import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;
let triggers: ScrollTrigger[] = [];

function checkReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function initLenis() {
  lenis = new Lenis({
    duration: 0.9,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis?.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
}

function initAnimations() {
  // Hero headline initial stagger reveal
  const heroHeading = document.querySelector('h1');
  if (heroHeading && !heroHeading.closest('.project-gallery')) {
    gsap.fromTo(
      heroHeading,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        clearProps: 'transform',
      }
    );
  }

  // Scroll entrance for project cards and studio sections
  const cards = document.querySelectorAll<HTMLElement>('.project-card');
  cards.forEach((card) => {
    const trigger = ScrollTrigger.create({
      trigger: card,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            clearProps: 'transform',
          }
        );
      },
    });
    triggers.push(trigger);
  });

  // Section titles and studio blocks
  const sections = document.querySelectorAll<HTMLElement>('#studio, .next-project-section');
  sections.forEach((sec) => {
    const trigger = ScrollTrigger.create({
      trigger: sec,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.fromTo(
          sec,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            clearProps: 'transform',
          }
        );
      },
    });
    triggers.push(trigger);
  });
}

function destroy() {
  if (lenis) {
    lenis.destroy();
    lenis = null;
  }
  triggers.forEach((t) => t.kill());
  triggers = [];
  ScrollTrigger.getAll().forEach((t) => t.kill());
  gsap.set('h1, .project-card, #studio, .next-project-section', {
    clearProps: 'all',
  });
}

function init() {
  if (checkReducedMotion()) {
    return;
  }

  initLenis();
  initAnimations();

  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  mql.addEventListener('change', (e) => {
    if (e.matches) {
      destroy();
    } else {
      init();
    }
  });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
