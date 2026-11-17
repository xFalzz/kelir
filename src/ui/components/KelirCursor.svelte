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
  let ringEl: HTMLDivElement | undefined = $state();
  let auraEl: HTMLDivElement | undefined = $state();
  let rippleEl: HTMLDivElement | undefined = $state();
  let trail0: HTMLDivElement | undefined = $state();
  let trail1: HTMLDivElement | undefined = $state();
  let trail2: HTMLDivElement | undefined = $state();
  let trail3: HTMLDivElement | undefined = $state();

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
    const modal = document.querySelector<HTMLElement>('.modal-suluk-backdrop');
    if (modal && modal.scrollHeight > modal.clientHeight + 24) {
      return {
        target: modal,
        cur: modal.scrollTop,
        max: Math.max(0, modal.scrollHeight - modal.clientHeight),
        viewH: modal.clientHeight,
        totalH: modal.scrollHeight,
        isModal: true,
      };
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
    const trailPts = [
      { x: targetX, y: targetY },
      { x: targetX, y: targetY },
      { x: targetX, y: targetY },
      { x: targetX, y: targetY },
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
          '.coverflow-canvas-wrap, .twin-canvas-host, .diorama-webgl-host, .pakeliran-canvas-host, .pamomong-orb-host, .suluk-webgl-host',
        ) ||
        target.tagName === 'CANVAS'
      ) {
        cursorMode = 'canvas';
      } else if (target.closest('.etalase-card, .etalase-ribbon')) {
        cursorMode = 'drag';
      } else if (
        target.closest(
          'button, a, [role="button"], [role="option"], input[type="range"], .wall-plate, .source-ledger-row, .suluk-line-btn, .tab-chip',
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

      const ringFactor = 1 - Math.exp(-18 * dt);
      const auraFactor = 1 - Math.exp(-9.5 * dt);
      const stretchFactor = 1 - Math.exp(-15 * dt);
      const trailRates = [26, 20, 15, 11];

      const dxRing = targetX - ringX;
      const dyRing = targetY - ringY;
      ringX += dxRing * ringFactor;
      ringY += dyRing * ringFactor;
      auraX += (targetX - auraX) * auraFactor;
      auraY += (targetY - auraY) * auraFactor;

      let prevX = targetX;
      let prevY = targetY;
      for (let i = 0; i < 4; i++) {
        const f = 1 - Math.exp(-trailRates[i] * dt);
        trailPts[i].x += (prevX - trailPts[i].x) * f;
        trailPts[i].y += (prevY - trailPts[i].y) * f;
        prevX = trailPts[i].x;
        prevY = trailPts[i].y;
      }

      const vel = Math.hypot(dxRing, dyRing);
      if (vel > 1.2) {
        smoothVelAngle = (Math.atan2(dyRing, dxRing) * 180) / Math.PI;
      }
      const targetStretch = cursorMode === 'default' ? Math.min(vel * 0.0042, 0.22) : 0;
      smoothStretch += (targetStretch - smoothStretch) * stretchFactor;

      if (ringEl) {
        if (smoothStretch > 0.005) {
          const sx = (1 + smoothStretch).toFixed(3);
          const sy = (1 - smoothStretch * 0.42).toFixed(3);
          ringEl.style.transform = `translate3d(${ringX.toFixed(2)}px, ${ringY.toFixed(2)}px, 0) rotate(${smoothVelAngle.toFixed(1)}deg) scale(${sx}, ${sy})`;
        } else {
          ringEl.style.transform = `translate3d(${ringX.toFixed(2)}px, ${ringY.toFixed(2)}px, 0)`;
        }
      }
      if (auraEl) {
        auraEl.style.transform = `translate3d(${auraX.toFixed(2)}px, ${auraY.toFixed(2)}px, 0)`;
      }

      const tNodes = [trail0, trail1, trail2, trail3];
      for (let i = 0; i < 4; i++) {
        const node = tNodes[i];
        if (!node) continue;
        const dist = Math.hypot(trailPts[i].x - targetX, trailPts[i].y - targetY);
        const alpha =
          cursorMode === 'text' ? 0 : Math.min(0.46 - i * 0.07, Math.max(0, (dist - 3) * 0.024));
        node.style.transform = `translate3d(${trailPts[i].x.toFixed(2)}px, ${trailPts[i].y.toFixed(2)}px, 0) scale(${(1 - i * 0.16).toFixed(2)})`;
        node.style.opacity = alpha.toFixed(2);
      }

      const remaining = Math.hypot(targetX - trailPts[3].x, targetY - trailPts[3].y);
      if (remaining > 0.28 || smoothStretch > 0.006 || pressed) {
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
  <!-- svelte-ignore a11y_no_static_element_interactions -->
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

<!-- Kursor Tematik KELIR: Pahat Kaligrafi Halus, Lensa Orbital Adaptif & Denyar Harmonik -->
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

    <div class="kelir-cursor-ring" bind:this={ringEl}>
      <div class="kelir-ring-core">
        <span class="kelir-ring-lens"></span>
        <span class="kelir-ring-drag-chevrons">
          <svg viewBox="0 0 12 12" fill="none"><path d="M7.5 2.5L4 6l3.5 3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <svg viewBox="0 0 12 12" fill="none"><path d="M4.5 2.5L8 6l-3.5 3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
        <svg class="kelir-cakra-svg" viewBox="0 0 56 56" fill="none">
          <circle cx="28" cy="28" r="24" stroke="currentColor" stroke-width="1" stroke-dasharray="22 8 6 8" stroke-linecap="round" />
          <circle cx="28" cy="28" r="18" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.45" />
          <circle cx="28" cy="4" r="1.4" fill="currentColor" />
          <circle cx="28" cy="52" r="1.4" fill="currentColor" />
        </svg>
      </div>
    </div>

    <div class="kelir-cursor-nib" bind:this={nibEl}>
      <svg class="kelir-nib-svg" viewBox="0 0 22 22" fill="none">
        <path
          d="M2 2 L16.2 9.2 L10.2 11.4 L8 17.4 Z"
          class="kelir-nib-halo"
          stroke-width="2.6"
          stroke-linejoin="round"
        />
        <path
          d="M2 2 L16.2 9.2 L10.2 11.4 L8 17.4 Z"
          class="kelir-nib-body"
          stroke-width="1.15"
          stroke-linejoin="round"
        />
        <circle cx="7.8" cy="7.8" r="1.35" class="kelir-nib-jewel" />
      </svg>
      {#if cursorMode === 'drag'}
        <span class="kelir-cursor-glyph">GESER</span>
      {:else if cursorMode === 'canvas'}
        <span class="kelir-cursor-glyph">3D ORBIT</span>
      {/if}
    </div>

    <div class="kelir-cursor-ripple" class:is-active={rippleActive} bind:this={rippleEl}></div>
  </div>
{/if}
