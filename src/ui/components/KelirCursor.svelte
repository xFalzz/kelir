<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    tema: 'malam' | 'terang';
  }

  let { tema }: Props = $props();

  let enabled = $state(false);
  let visible = $state(false);
  let pressed = $state(false);
  let cursorMode: 'default' | 'interactive' | 'drag' | 'canvas' | 'text' = $state('default');
  let rippleActive = $state(false);

  let nibEl: HTMLDivElement | undefined = $state();
  let nibSvgEl: SVGSVGElement | undefined = $state();
  let ringEl: HTMLDivElement | undefined = $state();
  let auraEl: HTMLDivElement | undefined = $state();
  let rippleEl: HTMLDivElement | undefined = $state();
  let trail0: HTMLDivElement | undefined = $state();
  let trail1: HTMLDivElement | undefined = $state();
  let trail2: HTMLDivElement | undefined = $state();
  let trail3: HTMLDivElement | undefined = $state();
  let trail4: HTMLDivElement | undefined = $state();
  let trail5: HTMLDivElement | undefined = $state();

  let railTrackEl: HTMLDivElement | undefined = $state();
  let scrollRatio = $state(0);
  let thumbRatio = $state(0.24);
  let isScrolling = $state(false);
  let isDraggingRail = $state(false);
  let hasScrollableTarget = $state(false);
  let usingModalScroll = $state(false);

  function getActiveScrollMetrics(): {
    target: HTMLElement | null;
    cur: number;
    max: number;
    viewH: number;
    totalH: number;
    isModal: boolean;
  } {
    const modalSuluk = document.querySelector<HTMLElement>('.modal-suluk-backdrop');
    if (modalSuluk) {
      if (modalSuluk.scrollHeight > modalSuluk.clientHeight + 24) {
        return {
          target: modalSuluk,
          cur: modalSuluk.scrollTop,
          max: Math.max(0, modalSuluk.scrollHeight - modalSuluk.clientHeight),
          viewH: modalSuluk.clientHeight,
          totalH: modalSuluk.scrollHeight,
          isModal: true,
        };
      }
      return { target: null, cur: 0, max: 0, viewH: 1, totalH: 1, isModal: true };
    }
    const modalAktif =
      document.documentElement.classList.contains('has-modal-open') ||
      Boolean(document.querySelector('[aria-modal="true"]'));
    if (modalAktif) {
      const modalBody = document.querySelector<HTMLElement>(
        '.legal-modal-body, .search-results-list',
      );
      if (modalBody && modalBody.scrollHeight > modalBody.clientHeight + 24) {
        return {
          target: modalBody,
          cur: modalBody.scrollTop,
          max: Math.max(0, modalBody.scrollHeight - modalBody.clientHeight),
          viewH: modalBody.clientHeight,
          totalH: modalBody.scrollHeight,
          isModal: true,
        };
      }
      return { target: null, cur: 0, max: 0, viewH: 1, totalH: 1, isModal: true };
    }
    const doc = document.documentElement;
    return {
      target: null,
      cur: window.scrollY,
      max: Math.max(0, doc.scrollHeight - window.innerHeight),
      viewH: window.innerHeight,
      totalH: doc.scrollHeight,
      isModal: false,
    };
  }

  function jumpScrollByClientY(clientY: number, smoothBehavior: ScrollBehavior = 'auto'): void {
    if (!railTrackEl) return;
    const rect = railTrackEl.getBoundingClientRect();
    const m = getActiveScrollMetrics();
    if (m.max <= 0) return;
    if (
      !m.target &&
      (document.documentElement.classList.contains('has-modal-open') ||
        Boolean(document.querySelector('[aria-modal="true"]')))
    ) {
      return;
    }

    const thumbPx = rect.height * thumbRatio;
    const usablePx = Math.max(rect.height - thumbPx, 1);
    const localY = clientY - rect.top - thumbPx * 0.5;
    const norm = Math.max(0, Math.min(1, localY / usablePx));
    const dest = norm * m.max;

    if (m.target) {
      m.target.scrollTo({ top: dest, behavior: smoothBehavior });
    } else {
      window.scrollTo({ top: dest, behavior: smoothBehavior });
    }
  }

  onMount(() => {
    if (typeof window === 'undefined') return;

    const mqHover = window.matchMedia('(hover: hover) and (pointer: fine)');
    const mqCoarse = window.matchMedia('(pointer: coarse)');
    const mqNarrow = window.matchMedia('(max-width: 768px)');
    const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    let scrollTimer: ReturnType<typeof setTimeout> | null = null;
    let scrollSyncRaf: number | null = null;
    const jalankanSyncScroll = () => {
      scrollSyncRaf = null;
      const m = getActiveScrollMetrics();
      const nextHasScroll = m.max > 32;
      const nextRatio = m.max > 0 ? Math.max(0, Math.min(1, m.cur / m.max)) : 0;
      const nextThumb = Math.max(0.14, Math.min(0.64, m.viewH / Math.max(m.totalH, 1)));

      if (hasScrollableTarget !== nextHasScroll) hasScrollableTarget = nextHasScroll;
      if (usingModalScroll !== m.isModal) usingModalScroll = m.isModal;
      if (Math.abs(scrollRatio - nextRatio) >= 0.0015) scrollRatio = nextRatio;
      if (Math.abs(thumbRatio - nextThumb) >= 0.005) thumbRatio = nextThumb;

      if (!isScrolling) isScrolling = true;
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        isScrolling = false;
      }, 720);
    };

    const syncScroll = () => {
      if (scrollSyncRaf !== null) return;
      scrollSyncRaf = window.requestAnimationFrame(jalankanSyncScroll);
    };

    jalankanSyncScroll();
    window.addEventListener('scroll', syncScroll, { passive: true, capture: true });
    window.addEventListener('resize', syncScroll, { passive: true });

    const ro = new ResizeObserver(() => syncScroll());
    ro.observe(document.body);
    const moModal = new MutationObserver(() => syncScroll());
    moModal.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    const applyCursorClass = (active: boolean) => {
      document.documentElement.classList.toggle('has-kelir-cursor', active);
    };

    const evaluateCursorCap = () => {
      enabled = mqHover.matches && !mqCoarse.matches && !mqNarrow.matches && !mqReduced.matches;
      if (!enabled) visible = false;
      applyCursorClass(enabled && visible);
    };
    evaluateCursorCap();
    mqHover.addEventListener('change', evaluateCursorCap);
    mqCoarse.addEventListener('change', evaluateCursorCap);
    mqNarrow.addEventListener('change', evaluateCursorCap);
    mqReduced.addEventListener('change', evaluateCursorCap);

    let targetX = window.innerWidth * 0.5;
    let targetY = window.innerHeight * 0.5;
    let ringX = targetX;
    let ringY = targetY;
    let auraX = targetX;
    let auraY = targetY;
    let smoothVelAngle = 0;
    let smoothStretch = 0;
    let smoothNibLean = 0;
    const trailPts = [
      { x: targetX, y: targetY, angle: 0 },
      { x: targetX, y: targetY, angle: 0 },
      { x: targetX, y: targetY, angle: 0 },
      { x: targetX, y: targetY, angle: 0 },
      { x: targetX, y: targetY, angle: 0 },
      { x: targetX, y: targetY, angle: 0 },
    ];
    let rafId: number | null = null;
    let lastMs = 0;
    let lastHoverTarget: EventTarget | null = null;
    let rippleTimer: ReturnType<typeof setTimeout> | null = null;

    const updateMode = (target: EventTarget | null) => {
      if (isDraggingRail) {
        cursorMode = 'drag';
        return;
      }
      if (!(target instanceof Element)) {
        cursorMode = 'default';
        return;
      }
      if (
        target.closest(
          'input:not([type="range"]):not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]), textarea, [contenteditable="true"]',
        )
      ) {
        cursorMode = 'text';
      } else if (target.closest('.kelir-scroll-rail')) {
        cursorMode = 'drag';
      } else if (
        target.closest(
          '.coverflow-canvas-wrap, .coverflow-webgl-host, .twin-canvas-host, .twin-webgl-inner, .diorama-webgl-host, .pakeliran-canvas-host, .pamomong-orb-host, .suluk-webgl-host',
        ) ||
        target.tagName === 'CANVAS'
      ) {
        cursorMode = 'canvas';
      } else if (target.closest('.etalase-card, .etalase-ribbon')) {
        cursorMode = 'drag';
      } else if (
        target.closest(
          'button, a, summary, [role="button"], [role="tab"], [role="option"], input[type="range"], .wall-plate, .source-ledger-row, .suluk-line-btn, .tab-chip, .page-portal-card, .bridge-card, .carakan-card',
        )
      ) {
        cursorMode = 'interactive';
      } else {
        cursorMode = 'default';
      }
    };

    const tick = (now: number) => {
      const dt = lastMs > 0 ? Math.min(Math.max((now - lastMs) / 1000, 0.001), 0.05) : 1 / 60;
      lastMs = now;

      const ringFactor = 1 - Math.exp(-20 * dt);
      const auraFactor = 1 - Math.exp(-10.5 * dt);
      const stretchFactor = 1 - Math.exp(-16 * dt);
      const trailRates = [30, 24, 19, 15, 11.5, 8.5];

      const dxRing = targetX - ringX;
      const dyRing = targetY - ringY;
      ringX += dxRing * ringFactor;
      ringY += dyRing * ringFactor;
      auraX += (targetX - auraX) * auraFactor;
      auraY += (targetY - auraY) * auraFactor;

      let prevX = targetX;
      let prevY = targetY;
      for (let i = 0; i < 6; i++) {
        const f = 1 - Math.exp(-trailRates[i] * dt);
        const dxT = prevX - trailPts[i].x;
        const dyT = prevY - trailPts[i].y;
        trailPts[i].x += dxT * f;
        trailPts[i].y += dyT * f;
        if (Math.hypot(dxT, dyT) > 0.6) {
          trailPts[i].angle = (Math.atan2(dyT, dxT) * 180) / Math.PI;
        }
        prevX = trailPts[i].x;
        prevY = trailPts[i].y;
      }

      const vel = Math.hypot(dxRing, dyRing);
      if (vel > 1.2) {
        smoothVelAngle = (Math.atan2(dyRing, dxRing) * 180) / Math.PI;
      }
      const targetLean = Math.max(-12, Math.min(12, dxRing * 0.35));
      smoothNibLean += (targetLean - smoothNibLean) * stretchFactor;

      const targetStretch = cursorMode === 'default' ? Math.min(vel * 0.0046, 0.24) : 0;
      smoothStretch += (targetStretch - smoothStretch) * stretchFactor;

      if (nibSvgEl) {
        const pressTilt = pressed ? -10 : 0;
        const pressScale = pressed ? 0.84 : cursorMode === 'drag' ? 0.72 : 1;
        nibSvgEl.style.transform = `rotate(${(smoothNibLean + pressTilt).toFixed(2)}deg) scale(${pressScale})`;
      }

      if (ringEl) {
        if (smoothStretch > 0.005) {
          const sx = (1 + smoothStretch).toFixed(3);
          const sy = (1 - smoothStretch * 0.44).toFixed(3);
          ringEl.style.transform = `translate3d(${ringX.toFixed(2)}px, ${ringY.toFixed(2)}px, 0) rotate(${smoothVelAngle.toFixed(1)}deg) scale(${sx}, ${sy})`;
        } else {
          ringEl.style.transform = `translate3d(${ringX.toFixed(2)}px, ${ringY.toFixed(2)}px, 0)`;
        }
      }
      if (auraEl) {
        auraEl.style.transform = `translate3d(${auraX.toFixed(2)}px, ${auraY.toFixed(2)}px, 0)`;
      }

      const tNodes = [trail0, trail1, trail2, trail3, trail4, trail5];
      for (let i = 0; i < 6; i++) {
        const node = tNodes[i];
        if (!node) continue;
        const dist = Math.hypot(trailPts[i].x - targetX, trailPts[i].y - targetY);
        const alpha =
          cursorMode === 'text' ? 0 : Math.min(0.62 - i * 0.08, Math.max(0, (dist - 2.5) * 0.032));
        const baseScale = Math.max(0.36, 1.04 - i * 0.12);
        const speedStretch = Math.min(1.85, 1 + dist * 0.018);
        node.style.transform = `translate3d(${trailPts[i].x.toFixed(2)}px, ${trailPts[i].y.toFixed(2)}px, 0) rotate(${trailPts[i].angle.toFixed(1)}deg) scale(${(baseScale * speedStretch).toFixed(2)}, ${baseScale.toFixed(2)})`;
        node.style.opacity = alpha.toFixed(2);
      }

      const remaining = Math.hypot(targetX - trailPts[5].x, targetY - trailPts[5].y);
      if (remaining > 0.25 || smoothStretch > 0.005 || Math.abs(smoothNibLean) > 0.25 || pressed) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        rafId = null;
      }
    };

    const ensureLoop = () => {
      if (rafId !== null) return;
      lastMs = 0;
      rafId = window.requestAnimationFrame(tick);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (isDraggingRail) {
        jumpScrollByClientY(e.clientY, 'auto');
      }
      if (!enabled || e.pointerType !== 'mouse') return;
      if (!visible) {
        visible = true;
        applyCursorClass(true);
      }
      targetX = e.clientX;
      targetY = e.clientY;
      // Nib utama menempel 1:1 langsung tanpa jeda inersia agar presisi klik 100% akurat
      if (nibEl) {
        nibEl.style.transform = `translate3d(${targetX.toFixed(1)}px, ${targetY.toFixed(1)}px, 0)`;
      }
      if (e.target !== lastHoverTarget || isDraggingRail) {
        lastHoverTarget = e.target;
        updateMode(e.target);
      }
      ensureLoop();
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!enabled || e.pointerType !== 'mouse') return;
      updateMode(e.target);
      visible = true;
      pressed = true;
      targetX = e.clientX;
      targetY = e.clientY;
      if (nibEl) {
        nibEl.style.transform = `translate3d(${targetX.toFixed(1)}px, ${targetY.toFixed(1)}px, 0)`;
      }
      if (cursorMode !== 'text' && rippleEl) {
        rippleEl.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        rippleActive = false;
        void rippleEl.offsetWidth;
        rippleActive = true;
        if (rippleTimer) clearTimeout(rippleTimer);
        rippleTimer = setTimeout(() => {
          rippleActive = false;
        }, 560);
      }
      ensureLoop();
    };

    const onPointerUp = () => {
      pressed = false;
      isDraggingRail = false;
    };

    const onMouseLeave = () => {
      visible = false;
      pressed = false;
      isDraggingRail = false;
      applyCursorClass(false);
    };

    const onTouchStart = () => {
      visible = false;
      pressed = false;
      isDraggingRail = false;
      applyCursorClass(false);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerUp, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('blur', onMouseLeave);
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      if (scrollTimer) clearTimeout(scrollTimer);
      if (rippleTimer) clearTimeout(rippleTimer);
      applyCursorClass(false);
      ro.disconnect();
      moModal.disconnect();
      window.removeEventListener('scroll', syncScroll, { capture: true });
      window.removeEventListener('resize', syncScroll);
      mqHover.removeEventListener('change', evaluateCursorCap);
      mqCoarse.removeEventListener('change', evaluateCursorCap);
      mqNarrow.removeEventListener('change', evaluateCursorCap);
      mqReduced.removeEventListener('change', evaluateCursorCap);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('blur', onMouseLeave);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  });
</script>

<!-- Bilah Garis Cahaya Pembacaan di Puncak Layar -->
<div
  class="kelir-scroll-topline"
  class:is-scrolling={isScrolling || isDraggingRail}
  class:is-modal={usingModalScroll}
  style="--scroll-ratio: {scrollRatio};"
  aria-hidden="true"
></div>

<!-- Scrollbar Kanan Modern Mengambang (Bisa Diklik & Diseret Langsung) -->
{#if hasScrollableTarget}
  <div
    class="kelir-scroll-rail"
    class:is-scrolling={isScrolling || isDraggingRail}
    class:is-dragging={isDraggingRail}
    class:is-modal={usingModalScroll}
    data-theme={tema}
    style="--scroll-ratio: {scrollRatio}; --thumb-ratio: {thumbRatio};"
    onpointerdown={(e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      isDraggingRail = true;
      jumpScrollByClientY(e.clientY, 'auto');
    }}
    aria-hidden="true"
  >
    <div class="kelir-scroll-track" bind:this={railTrackEl}>
      <div class="kelir-scroll-thumb">
        <span class="kelir-scroll-diamond"></span>
        <span class="kelir-scroll-pct">{Math.round(scrollRatio * 100)}%</span>
      </div>
    </div>
  </div>
{/if}

<!-- Kursor Tematik KELIR: Cucuk Canting-Keris Ukiran, Bidik Cakra Viewfinder, Giroskop 3D & Spark Jejak Kawung -->
{#if enabled}
  <div
    class="kelir-cursor-layer"
    class:is-visible={visible}
    class:is-pressed={pressed}
    data-mode={cursorMode}
    data-theme={tema}
    aria-hidden="true"
  >
    <div class="kelir-cursor-aura" bind:this={auraEl}></div>

    <div class="kelir-cursor-trail" bind:this={trail0}></div>
    <div class="kelir-cursor-trail" bind:this={trail1}></div>
    <div class="kelir-cursor-trail" bind:this={trail2}></div>
    <div class="kelir-cursor-trail" bind:this={trail3}></div>
    <div class="kelir-cursor-trail" bind:this={trail4}></div>
    <div class="kelir-cursor-trail" bind:this={trail5}></div>

    <div class="kelir-cursor-ring" bind:this={ringEl}>
      <div class="kelir-ring-core">
        <span class="kelir-ring-lens"></span>
        <svg class="kelir-brackets-svg" viewBox="0 0 48 48" fill="none">
          <path d="M13 6H6v7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M35 6h7v7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M6 35v7h7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M42 35v7h-7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          <polygon points="24,1.8 25.8,3.6 24,5.4 22.2,3.6" fill="currentColor" />
          <polygon points="24,42.6 25.8,44.4 24,46.2 22.2,44.4" fill="currentColor" />
        </svg>
        <span class="kelir-ring-drag-chevrons">
          <svg viewBox="0 0 12 12" fill="none"><path d="M7.5 2.5L4 6l3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <svg viewBox="0 0 12 12" fill="none"><path d="M4.5 2.5L8 6l-3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
        <svg class="kelir-cakra-svg" viewBox="0 0 60 60" fill="none">
          <g class="kelir-cakra-outer">
            <circle cx="30" cy="30" r="25" stroke="currentColor" stroke-width="1.15" stroke-dasharray="18 7 4 7" stroke-linecap="round" />
            <polygon points="30,2.5 32.3,4.8 30,7.1 27.7,4.8" fill="currentColor" />
            <polygon points="30,52.9 32.3,55.2 30,57.5 27.7,55.2" fill="currentColor" />
          </g>
          <g class="kelir-cakra-inner">
            <circle cx="30" cy="30" r="19" stroke="currentColor" stroke-width="0.9" stroke-opacity="0.72" stroke-dasharray="5 6" />
            <circle cx="11" cy="30" r="1.4" fill="currentColor" />
            <circle cx="49" cy="30" r="1.4" fill="currentColor" />
          </g>
        </svg>
      </div>
    </div>

    <div class="kelir-cursor-nib" bind:this={nibEl}>
      <svg class="kelir-nib-svg" bind:this={nibSvgEl} viewBox="0 0 28 28" fill="none">
        <path
          d="M2 2 L20.2 9.4 L14.4 11.8 L17.6 15 L12 14.3 L9.4 20.8 L7.4 13.8 Z"
          class="kelir-nib-halo"
          stroke-width="2.9"
          stroke-linejoin="round"
        />
        <path
          d="M2 2 L20.2 9.4 L14.4 11.8 L17.6 15 L12 14.3 L9.4 20.8 L7.4 13.8 Z"
          class="kelir-nib-body"
          stroke-width="1.2"
          stroke-linejoin="round"
        />
        <path d="M3.2 3.2 L12.2 12.2" class="kelir-nib-spine" stroke-width="1.1" stroke-linecap="round" />
        <polygon points="9.2,6.4 11.5,8.7 9.2,11 6.9,8.7" class="kelir-nib-jewel" />
      </svg>
      {#if cursorMode === 'drag'}
        <span class="kelir-cursor-glyph">GESER &lt;&gt;</span>
      {:else if cursorMode === 'canvas'}
        <span class="kelir-cursor-glyph">ORBIT 3D</span>
      {/if}
    </div>

    <div class="kelir-cursor-ripple" class:is-active={rippleActive} bind:this={rippleEl}></div>
  </div>
{/if}
