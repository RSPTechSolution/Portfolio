// Draws the pipeline schematic's wires as it scrolls into view (spec §5 row 8).
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initPipeline(svg: SVGSVGElement): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  svg.querySelectorAll<SVGPathElement>('.draw').forEach((p) => {
    const len = p.getTotalLength();
    const dashed = p.classList.contains('dash');
    gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, {
      strokeDashoffset: 0, ease: 'none',
      scrollTrigger: { trigger: svg, start: 'top 85%', end: 'top 40%', scrub: true },
      onComplete: () => { if (dashed) p.style.strokeDasharray = '4 5'; },
    });
  });
  gsap.from(svg.querySelectorAll('.node, .store'), {
    y: 18, opacity: 0, stagger: 0.08, duration: 0.8, ease: 'back.out(2)',
    scrollTrigger: { trigger: svg, start: 'top 75%', once: true },
  });
}
