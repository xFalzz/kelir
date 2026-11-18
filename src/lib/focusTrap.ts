import type { Action } from 'svelte/action';

const FOKUS_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Svelte Action: Memerangkap fokus papan ketik (Tab / Shift+Tab) di dalam dialog modal
 * dan mengembalikan fokus ke pemicu sebelumnya saat dialog ditutup (WCAG 2.1 AA).
 */
export const fokusModalTrap: Action<HTMLElement, boolean | undefined> = (node, aktif = true) => {
  let sedangAktif = aktif;
  const pemicuSebelumnya =
    typeof document !== 'undefined' && document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

  const ambilElemenFokus = (): HTMLElement[] =>
    Array.from(node.querySelectorAll<HTMLElement>(FOKUS_SELECTOR)).filter(
      (el) => !el.hasAttribute('aria-hidden') && el.offsetParent !== null,
    );

  const onKeyDown = (e: KeyboardEvent): void => {
    if (!sedangAktif || e.key !== 'Tab') return;
    const daftar = ambilElemenFokus();
    if (daftar.length === 0) return;

    const first = daftar[0];
    const last = daftar[daftar.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (e.shiftKey) {
      if (!active || active === first || !node.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else if (!active || active === last || !node.contains(active)) {
      e.preventDefault();
      first.focus();
    }
  };

  node.addEventListener('keydown', onKeyDown);

  return {
    update(nextAktif = true) {
      sedangAktif = nextAktif;
    },
    destroy() {
      node.removeEventListener('keydown', onKeyDown);
      if (pemicuSebelumnya && pemicuSebelumnya.isConnected) {
        pemicuSebelumnya.focus();
      }
    },
  };
};
