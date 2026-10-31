// Quiet scroll motion (spec §5): reveals, count-ups, level meters.
// Hidden start states live behind html.js in CSS, so no-JS visitors see everything.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initReveal(root: ParentNode = document): void {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = [...root.querySelectorAll<HTMLElement>('[data-reveal]')];
  const counters = [...root.querySelectorAll<HTMLElement>('[data-count]')];
  const meters = [...root.querySelectorAll<HTMLElement>('.vu')];

  if (reduce) {
    gsap.set(reveals, { opacity: 1, y: 0 });
    meters.forEach((vu) => gsap.set(vu.querySelectorAll('i'), { scaleY: 0.7 }));
    return;
  }

  reveals.forEach((el) => gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));

  counters.forEach((el) => {
    const end = Number(el.dataset.count), suffix = el.dataset.suffix ?? '';
    const o = { v: 0 };
    gsap.to(o, {
      v: end, duration: 1.6, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      onStart: () => { el.textContent = `0${suffix}`; },
      onUpdate: () => { el.textContent = `${Math.round(o.v)}${suffix}`; },
    });
  });

  meters.forEach((vu) => {
    const tl = gsap.timeline({ repeat: -1, paused: true });
    tl.to(vu.querySelectorAll('i'), { scaleY: () => 0.15 + Math.random() * 0.85, duration: 0.2, stagger: 0.015, ease: 'power1.inOut', repeatRefresh: true });
    ScrollTrigger.create({ trigger: vu, start: 'top bottom', end: 'bottom top', onToggle: (s) => (s.isActive && !document.hidden ? tl.play() : tl.pause()) });
  });
}
