<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { type BahasaAktif } from '../../content/pusaka.ts';
  import { audioBudaya, type StatusGendingRealtime } from '../../lib/audioBudaya.ts';
  import {
    REPERTOAR_GENDING_JAWA,
    ambilDeskripsiFilosofiGending,
    cariGendingById,
    type GendingId,
  } from '../../lib/gendingJawa.ts';
  import { tI18n } from '../../lib/i18n.ts';

  interface Props {
    bahasa: BahasaAktif;
    audioAktif: boolean;
    suasanaAktif: boolean;
    onToggleSuasana: () => void;
    onPilihGending: (id: GendingId) => void;
  }

  let { bahasa, audioAktif, suasanaAktif, onToggleSuasana, onPilihGending }: Props = $props();

  let panelFilosofiBuka = $state(false);
  let statusRt: StatusGendingRealtime = $state(audioBudaya.ambilStatusRealtime());

  let gendingAktif = $derived(cariGendingById(statusRt.gendingId));
  let infoAktif = $derived(ambilDeskripsiFilosofiGending(gendingAktif, bahasa));

  let unsub: (() => void) | null = null;
  onMount(() => {
    unsub = audioBudaya.berlanggananStatus((st) => {
      statusRt = st;
    });
  });

  onDestroy(() => {
    unsub?.();
  });
</script>

{#if audioAktif || suasanaAktif}
  <aside
    class="karawitan-floating-wrap"
    aria-label={tI18n(bahasa, 'karawitan.barAria')}
    data-testid="karawitan-bar"
  >
    {#if panelFilosofiBuka}
      <div class="karawitan-filosofi-card" data-testid="karawitan-filosofi-panel">
        <div class="karawitan-card-head">
          <div>
            <span class="eyebrow-mono">{tI18n(bahasa, 'karawitan.eyebrow')}</span>
            <h3 class="karawitan-card-title">{infoAktif.judul}</h3>
            <div class="karawitan-card-sub">
              <span>{infoAktif.laras}</span>
              <span aria-hidden="true">·</span>
              <span class="karawitan-aksara" lang="jv">{gendingAktif.aksara}</span>
            </div>
          </div>
          <button
            type="button"
            class="util-pill"
            onclick={() => (panelFilosofiBuka = false)}
            data-testid="karawitan-close-filosofi"
          >
            {tI18n(bahasa, 'search.close')}
          </button>
        </div>

        <div class="karawitan-creator-chip">
          <span>{tI18n(bahasa, 'karawitan.creatorLabel')}:</span>
          <strong>{infoAktif.pencipta}</strong>
          <span class="source-badge">{gendingAktif.sumber.join(', ')}</span>
        </div>

        <div class="karawitan-philosophy-box">
          <div class="eyebrow-mono">{infoAktif.filosofiJudul}</div>
          <p>{infoAktif.filosofiMakna}</p>
        </div>

        <div class="karawitan-track-list" role="tablist" aria-label={tI18n(bahasa, 'karawitan.chooseAria')}>
          {#each REPERTOAR_GENDING_JAWA as g}
            <button
              type="button"
              role="tab"
              aria-selected={statusRt.gendingId === g.id}
              class="util-pill"
              class:is-active={statusRt.gendingId === g.id}
              onclick={() => onPilihGending(g.id)}
              data-testid="karawitan-gending-{g.id}"
            >
              {g.judul}
            </button>
          {/each}
        </div>
      </div>
    {/if}

    <div class="karawitan-mini-pill">
      <div class="karawitan-eq" class:is-playing={suasanaAktif} aria-hidden="true">
        <span></span><span></span><span></span><span></span>
      </div>

      <button
        type="button"
        class="karawitan-meta-btn"
        onclick={() => (panelFilosofiBuka = !panelFilosofiBuka)}
        data-testid="btn-karawitan-filosofi"
        aria-expanded={panelFilosofiBuka}
      >
        <span class="karawitan-mini-title">{gendingAktif.judul}</span>
        <span class="karawitan-mini-beat">
          {infoAktif.laras}
          {#if suasanaAktif}
            · {statusRt.isGong
              ? 'GONG'
              : statusRt.isKenong
                ? 'KENONG'
                : statusRt.nadanya !== '.'
                  ? `WILAH ${statusRt.nadanya}`
                  : 'SELA'}
          {/if}
        </span>
      </button>

      <div class="karawitan-pill-actions">
        <button
          type="button"
          class="util-pill"
          class:is-active={panelFilosofiBuka}
          onclick={() => (panelFilosofiBuka = !panelFilosofiBuka)}
        >
          {tI18n(bahasa, 'karawitan.philosophyBtn')}
        </button>
        <button
          type="button"
          class="util-pill"
          class:is-active={suasanaAktif}
          onclick={onToggleSuasana}
          data-testid="btn-karawitan-toggle"
        >
          {suasanaAktif ? tI18n(bahasa, 'karawitan.pauseBtn') : tI18n(bahasa, 'karawitan.playBtn')}
        </button>
      </div>
    </div>
  </aside>
{/if}
