export interface SmoothScrollController {
  scrollTo: (targetY: number, smooth?: boolean) => void;
  scrollToElement: (el: HTMLElement, offsetTop?: number) => void;
  sync: () => void;
  destroy: () => void;
}

const BATAS_DELTA_PIXEL = 360;
const STIFFNESS_DEFAULT = 10.5;
const AMBANG_HENTI_PX = 0.35;

/**
 * Mengonversi delta event roda tetikus (pixel, line, atau page) ke satuan piksel terukur.
 */
export function normalisasiDeltaWheel(
  deltaY: number,
  deltaMode: number,
  viewportHeight: number,
): number {
  let px = deltaY;
  if (deltaMode === 1) {
    px = deltaY * 36;
  } else if (deltaMode === 2) {
    px = deltaY * Math.max(viewportHeight * 0.85, 320);
  }
  return Math.max(-BATAS_DELTA_PIXEL, Math.min(BATAS_DELTA_PIXEL, px));
}

/**
 * Menghitung satu langkah interpolasi eksponensial independen-laju-penyegaran layar.
 */
export function langkahLerpEksponensial(
  current: number,
  target: number,
  stiffness: number,
  dtSec: number,
): number {
  const dt = Math.min(Math.max(dtSec, 0.001), 0.05);
  const faktor = 1 - Math.exp(-stiffness * dt);
  return current + (target - current) * faktor;
}

/** Mengembalikan true jika terdapat pop-up modal aktif sehingga halaman latar terkunci. */
export function apakahPopupModalAktif(): boolean {
  if (typeof document === 'undefined') return false;
  return (
    document.documentElement.classList.contains('has-modal-open') ||
    Boolean(document.querySelector('[aria-modal="true"]'))
  );
}

/**
 * Mengizinkan scroll atau drag native hanya untuk kanvas 3D atau kontainer gulir internal
 * yang masih memiliki sisa ruang gulir ke arah pergerakan wheel.
 */
export function apakahTargetGulirInternal(target: EventTarget | null, deltaY = 0): boolean {
  if (typeof HTMLElement === 'undefined' || typeof Element === 'undefined' || !target) {
    return false;
  }
  let node = target instanceof HTMLElement ? target : target instanceof Element ? target.parentElement : null;
  if (
    node &&
    (node.closest('[data-wheel-native="true"]') || node.closest('.suluk-webgl-host'))
  ) {
    return true;
  }
  while (node && node !== document.body && node !== document.documentElement) {
    if (node.scrollHeight > node.clientHeight + 1) {
      const overflowY = window.getComputedStyle(node).overflowY;
      if (overflowY === 'auto' || overflowY === 'scroll') {
        if (Math.abs(deltaY) < 0.01) return true;
        const keBawah = deltaY > 0;
        const masihAdaRuang = keBawah
          ? node.scrollTop + node.clientHeight < node.scrollHeight - 1
          : node.scrollTop > 1;
        if (masihAdaRuang) return true;
      }
    }
    node = node.parentElement;
  }
  return false;
}

function dapatDigulirInternal(target: EventTarget | null, deltaY: number): boolean {
  return apakahTargetGulirInternal(target, deltaY);
}

/**
 * Mengaktifkan inersia gulir halus berbasis RAF untuk seluruh halaman KELIR
 * tanpa mengganggu kontrol zoom 3D (`data-wheel-native="true"`), modal, atau navigasi sentuh.
 */
export function pasangSmoothScroll(): SmoothScrollController {
  if (typeof window === 'undefined') {
    return {
      scrollTo: () => undefined,
      scrollToElement: () => undefined,
      sync: () => undefined,
      destroy: () => undefined,
    };
  }

  let currentY = window.scrollY;
  let targetY = window.scrollY;
  let lastAppliedY = window.scrollY;
  let rafId: number | null = null;
  let lastFrameMs = 0;

  const getMaxScroll = (): number =>
    Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

  const clampTarget = (y: number): number => Math.max(0, Math.min(getMaxScroll(), y));

  const prefersReducedMotion = (): boolean =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const stopRaf = (): void => {
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  const step = (now: number): void => {
    const dtSec = lastFrameMs > 0 ? (now - lastFrameMs) / 1000 : 1 / 60;
    lastFrameMs = now;
    targetY = clampTarget(targetY);

    if (Math.abs(targetY - currentY) <= AMBANG_HENTI_PX) {
      currentY = targetY;
      lastAppliedY = Math.round(currentY);
      window.scrollTo({ top: currentY, behavior: 'instant' as ScrollBehavior });
      rafId = null;
      return;
    }

    currentY = langkahLerpEksponensial(currentY, targetY, STIFFNESS_DEFAULT, dtSec);
    lastAppliedY = Math.round(currentY);
    window.scrollTo({ top: currentY, behavior: 'instant' as ScrollBehavior });
    rafId = window.requestAnimationFrame(step);
  };

  const ensureRunning = (): void => {
    if (rafId !== null) return;
    lastFrameMs = 0;
    rafId = window.requestAnimationFrame(step);
  };

  const onWheel = (e: WheelEvent): void => {
    if (e.ctrlKey || e.metaKey || e.defaultPrevented || Math.abs(e.deltaY) < 0.01) return;
    const modalAktif = apakahPopupModalAktif();
    const diDalamPopover =
      e.target instanceof Element &&
      Boolean(e.target.closest('.karawitan-filosofi-card, .pwa-install-toast'));

    if (dapatDigulirInternal(e.target, e.deltaY)) return;

    if (modalAktif || diDalamPopover) {
      e.preventDefault();
      stopRaf();
      currentY = window.scrollY;
      targetY = window.scrollY;
      return;
    }

    if (prefersReducedMotion()) return;

    e.preventDefault();
    if (rafId === null) {
      currentY = window.scrollY;
      targetY = window.scrollY;
    }
    const deltaPx = normalisasiDeltaWheel(e.deltaY, e.deltaMode, window.innerHeight);
    targetY = clampTarget(targetY + deltaPx);
    ensureRunning();
  };

  const onNativeScroll = (): void => {
    if (rafId === null) {
      currentY = window.scrollY;
      targetY = window.scrollY;
      lastAppliedY = Math.round(currentY);
      return;
    }
    if (Math.abs(window.scrollY - lastAppliedY) > 4) {
      stopRaf();
      currentY = window.scrollY;
      targetY = window.scrollY;
      lastAppliedY = Math.round(currentY);
    }
  };

  const sync = (): void => {
    stopRaf();
    currentY = window.scrollY;
    targetY = window.scrollY;
    lastAppliedY = Math.round(currentY);
  };

  const scrollTo = (y: number, smooth = true): void => {
    const tujuan = clampTarget(y);
    if (!smooth || prefersReducedMotion()) {
      stopRaf();
      currentY = tujuan;
      targetY = tujuan;
      lastAppliedY = Math.round(tujuan);
      window.scrollTo({ top: tujuan, behavior: 'instant' as ScrollBehavior });
      return;
    }
    currentY = window.scrollY;
    targetY = tujuan;
    ensureRunning();
  };

  const scrollToElement = (el: HTMLElement, offsetTop = 88): void => {
    const rect = el.getBoundingClientRect();
    const tujuan = Math.max(0, window.scrollY + rect.top - offsetTop);
    scrollTo(tujuan, true);
  };

  const onResize = (): void => {
    targetY = clampTarget(targetY);
    currentY = clampTarget(currentY);
  };

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('scroll', onNativeScroll, { passive: true });
  window.addEventListener('resize', onResize);

  return {
    scrollTo,
    scrollToElement,
    sync,
    destroy: () => {
      stopRaf();
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onNativeScroll);
      window.removeEventListener('resize', onResize);
    },
  };
}
