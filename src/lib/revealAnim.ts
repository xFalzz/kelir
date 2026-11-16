export function canUseHoverPointer(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

/**
 * Svelte action ringan untuk animasi kemunculan vertikal berbasis viewport
 * yang aman terhadap aksesibilitas, pengurangan gerak, dan layar sentuh.
 */
export function pasangReveal(node: HTMLElement, index = 0) {
  node.style.setProperty('--kelir-stagger', `${Math.min(index, 6) * 45}ms`);
  node.classList.add('kelir-reveal-item');

  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
    node.classList.add('is-inview');
    return { destroy: () => undefined };
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    node.classList.add('is-inview');
    return { destroy: () => undefined };
  }

  const rect = node.getBoundingClientRect();
  if (rect.top < window.innerHeight * 0.96) {
    node.classList.add('is-inview');
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          node.classList.add('is-inview');
          io.disconnect();
          break;
        }
      }
    },
    { rootMargin: '60px 0px -12px 0px', threshold: 0.04 },
  );
  io.observe(node);

  return {
    destroy() {
      io.disconnect();
    },
  };
}
