<script lang="ts">
  import { onMount } from 'svelte';
  import type { BahasaAktif } from '../../content/pusaka.ts';
  import { tI18n } from '../../lib/i18n.ts';

  interface Props {
    bahasa: BahasaAktif;
    onRetry?: () => void;
  }

  let { bahasa, onRetry }: Props = $props();

  let rootEl: HTMLDivElement | undefined = $state();
  let webglState: 'ready' | 'unavailable' | 'lost' = $state('ready');

  function bacaStatusHost(parent: HTMLElement): 'ready' | 'unavailable' | 'lost' {
    const own = parent.dataset.webglState;
    if (own === 'unavailable' || own === 'lost' || own === 'ready') return own;
    const child = parent.querySelector<HTMLElement>('[data-webgl-state]');
    const nested = child?.dataset.webglState;
    if (nested === 'unavailable' || nested === 'lost' || nested === 'ready') return nested;
    return 'ready';
  }

  onMount(() => {
    const parent = rootEl?.parentElement;
    if (!parent) return;

    const sinkron = () => {
      webglState = bacaStatusHost(parent);
    };
    sinkron();
    const raf = requestAnimationFrame(sinkron);

    const onStatusEvent = (ev: Event) => {
      const detail = (ev as CustomEvent<{ state?: string }>).detail;
      if (
        detail?.state === 'ready' ||
        detail?.state === 'unavailable' ||
        detail?.state === 'lost'
      ) {
        webglState = detail.state;
        return;
      }
      sinkron();
    };

    parent.addEventListener('kelirwebglstatus', onStatusEvent);
    return () => {
      cancelAnimationFrame(raf);
      parent.removeEventListener('kelirwebglstatus', onStatusEvent);
    };
  });

  function tanganiRetry(): void {
    if (onRetry) {
      onRetry();
      return;
    }
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }
</script>

<div bind:this={rootEl} class="webgl-status-anchor" aria-live="polite">
  {#if webglState !== 'ready'}
    <div class="webgl-fallback-card" role="status" data-testid="webgl-fallback-banner">
      <div class="webgl-fallback-badge">WebGL · {webglState.toUpperCase()}</div>
      <strong class="webgl-fallback-title">{tI18n(bahasa, 'nav.webglFallbackTitle')}</strong>
      <p class="webgl-fallback-desc">{tI18n(bahasa, 'nav.webglFallbackDesc')}</p>
      <button
        type="button"
        class="util-pill is-accent"
        onclick={tanganiRetry}
        data-testid="webgl-retry-btn"
      >
        {tI18n(bahasa, 'nav.webglRetry')}
      </button>
    </div>
  {/if}
</div>
