import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;
let triggers: ScrollTrigger[] = [];
let anchorListenersBound = false;

const lenisEasing = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

function checkReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getHeaderHeight(): number {
  const header = document.querySelector<HTMLElement>('[data-site-header], header');
  const previewBanner = document.querySelector<HTMLElement>('.preview-banner');
  const headerH = header ? header.getBoundingClientRect().height : 0;
  const previewH = previewBanner ? previewBanner.getBoundingClientRect().height : 0;
  return Math.round(headerH + previewH);
}

function syncHeaderOffsetVar(): void {
  const totalHeight = getHeaderHeight();
  if (totalHeight > 0) {
    document.documentElement.style.setProperty('--header-offset', `${totalHeight}px`);
  }
}

function focusSectionTarget(section: HTMLElement): void {
  const focusTarget = section.querySelector<HTMLElement>('h1, h2') || section;
  if (!focusTarget.hasAttribute('tabindex')) {
    focusTarget.setAttribute('tabindex', '-1');
  }
  focusTarget.focus({ preventScroll: true });
}

function scrollToSection(
  target: HTMLElement,
  options: { duration?: number; immediate?: boolean } = {}
): void {
  syncHeaderOffsetVar();
  const offset = -getHeaderHeight();
  const reducedMotion = checkReducedMotion();
  const shouldBeImmediate = options.immediate || reducedMotion;

  if (lenis && !shouldBeImmediate) {
    lenis.scrollTo(target, {
      offset,
      duration: options.duration ?? 1.05,
      easing: lenisEasing,
      onComplete: () => {
        ScrollTrigger.refresh();
        focusSectionTarget(target);
      },
    });
  } else if (lenis && shouldBeImmediate) {
    lenis.scrollTo(target, {
      offset,
      immediate: true,
    });
    ScrollTrigger.refresh();
    focusSectionTarget(target);
  } else {
    const targetTop = target.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: 'auto',
    });
    focusSectionTarget(target);
  }
}

function scrollToTop(options: { duration?: number; immediate?: boolean } = {}): void {
  const reducedMotion = checkReducedMotion();
  const shouldBeImmediate = options.immediate || reducedMotion;

  if (lenis && !shouldBeImmediate) {
    lenis.scrollTo(0, {
      duration: options.duration ?? 1.05,
      easing: lenisEasing,
      onComplete: () => {
        ScrollTrigger.refresh();
        const topSection = document.querySelector<HTMLElement>('#om-mig, #main');
        if (topSection) focusSectionTarget(topSection);
      },
    });
  } else if (lenis && shouldBeImmediate) {
    lenis.scrollTo(0, { immediate: true });
    ScrollTrigger.refresh();
    const topSection = document.querySelector<HTMLElement>('#om-mig, #main');
    if (topSection) focusSectionTarget(topSection);
  } else {
    window.scrollTo({ top: 0, behavior: 'auto' });
    const topSection = document.querySelector<HTMLElement>('#om-mig, #main');
    if (topSection) focusSectionTarget(topSection);
  }
}

function normalizePathname(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/';
}

function setupAnchorNavigation(): void {
  syncHeaderOffsetVar();

  const header = document.querySelector<HTMLElement>('[data-site-header], header');
  if (header && 'ResizeObserver' in window) {
    const ro = new ResizeObserver(() => syncHeaderOffsetVar());
    ro.observe(header);
  }

  if (!anchorListenersBound) {
    anchorListenersBound = true;

    document.addEventListener('click', (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      const anchor = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href]');
      if (!anchor) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) {
        return;
      }

      const isSamePage =
        normalizePathname(url.pathname) === normalizePathname(window.location.pathname);
      if (!isSamePage) {
        return;
      }

      // Clicking the studio brand link (or "#") while on the home page scrolls smoothly to the very top
      if (!url.hash || url.hash === '#') {
        if (anchor.classList.contains('studio-brand') || url.hash === '#') {
          e.preventDefault();
          if (window.location.hash) {
            history.pushState(null, '', url.pathname + url.search);
          }
          scrollToTop({ duration: 1.05 });
        }
        return;
      }

      const id = decodeURIComponent(url.hash.slice(1));
      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();

      if (window.location.hash !== url.hash) {
        history.pushState(null, '', url.hash);
      }

      scrollToSection(target, { duration: 1.05 });
    });

    window.addEventListener('popstate', () => {
      if (window.location.hash && window.location.hash.length > 1) {
        const id = decodeURIComponent(window.location.hash.slice(1));
        const target = document.getElementById(id);
        if (target) {
          scrollToSection(target, { duration: 0.85 });
        }
      } else if (lenis && !checkReducedMotion()) {
        lenis.scrollTo(0, { duration: 0.85, easing: lenisEasing });
      } else {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    });
  }

  // Handle initial page load when arriving with a hash in the URL (e.g. from /projekt/[slug])
  if (window.location.hash && window.location.hash.length > 1) {
    const id = decodeURIComponent(window.location.hash.slice(1));
    const target = document.getElementById(id);
    if (target) {
      requestAnimationFrame(() => {
        scrollToSection(target, { duration: 0.85 });
      });
    }
  }
}

function initLenis() {
  lenis = new Lenis({
    duration: 0.9,
    easing: lenisEasing,
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis?.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
}

function initAnimations() {
  // Hero / About headline initial stagger reveal
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

  // About section elements initial stagger reveal
  const aboutElements = document.querySelectorAll<HTMLElement>('.about-reveal');
  if (aboutElements.length > 0) {
    gsap.fromTo(
      aboutElements,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        stagger: 0.1,
        delay: 0.1,
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

  // Section titles, studio blocks, project info/specs, and floor plans header
  const sections = document.querySelectorAll<HTMLElement>(
    '#studio, .next-project-section, .project-info-section, .project-specs-section, .plans-header'
  );
  sections.forEach((sec) => {
    const trigger = ScrollTrigger.create({
      trigger: sec,
      start: 'top 88%',
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
  gsap.set('h1, .about-reveal, .project-card, #studio, .next-project-section, .project-info-section, .project-specs-section, .plans-header', {
    clearProps: 'all',
  });
}

function init() {
  if (!checkReducedMotion()) {
    initLenis();
    initAnimations();
  }

  setupAnchorNavigation();

  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  mql.addEventListener('change', (e) => {
    if (e.matches) {
      destroy();
    } else {
      initLenis();
      initAnimations();
    }
  });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
