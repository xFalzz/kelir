<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { type BahasaAktif, ambilTeks } from '../../content/pusaka.ts';
  import { audioBudaya, type StatusGendingRealtime } from '../../lib/audioBudaya.ts';
  import {
    DAFTAR_SUASANA_BGM,
    REPERTOAR_GENDING_JAWA,
    ambilDeskripsiFilosofiGending,
    cariGendingById,
    saringGendingBySuasana,
    type GendingId,
    type SuasanaGending,
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
  let ringkasMinim = $state(false);
  let filterSuasana: SuasanaGending | 'semua' = $state('semua');
  let statusRt: StatusGendingRealtime = $state(audioBudaya.ambilStatusRealtime());

  let gendingAktif = $derived(cariGendingById(statusRt.gendingId));
  let infoAktif = $derived(ambilDeskripsiFilosofiGending(gendingAktif, bahasa));
  let daftarTersaring = $derived(saringGendingBySuasana(filterSuasana));

  function geserTrack(delta: number): void {
    const daftar = daftarTersaring.length > 0 ? daftarTersaring : REPERTOAR_GENDING_JAWA;
    const idx = daftar.findIndex((g) => g.id === gendingAktif.id);
    const nextIdx = (((idx >= 0 ? idx : 0) + delta) % daftar.length + daftar.length) % daftar.length;
    onPilihGending(daftar[nextIdx].id);
  }

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
    class:is-minimized={ringkasMinim}
    aria-label={tI18n(bahasa, 'karawitan.barAria')}
    data-testid="karawitan-bar"
  >
    {#if panelFilosofiBuka && !ringkasMinim}
      <div class="karawitan-filosofi-card" data-testid="karawitan-filosofi-panel">
        <div class="karawitan-card-head">
          <div>
            <span class="eyebrow-mono">{tI18n(bahasa, 'karawitan.eyebrow')}</span>
            <h3 class="karawitan-card-title">{infoAktif.judul}</h3>
            <div class="karawitan-card-sub">
              <span class="source-badge">{infoAktif.suasana}</span>
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

        <div class="karawitan-meta-ribbon">
          <span>
            {tI18n(bahasa, 'karawitan.creatorLabel')}: <strong>{infoAktif.pencipta}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {tI18n(bahasa, 'karawitan.moodLabel')}: <strong class="karawitan-mood-accent">{infoAktif.cocokUntuk}</strong>
          </span>
          <span class="source-badge">{gendingAktif.sumber.join(', ')}</span>
        </div>

        <div class="karawitan-philosophy-box">
          <div class="eyebrow-mono">{infoAktif.filosofiJudul}</div>
          <p>{infoAktif.filosofiMakna}</p>
        </div>

        <div class="karawitan-mood-tabs" role="tablist" aria-label={tI18n(bahasa, 'karawitan.moodLabel')}>
          <button
            type="button"
            role="tab"
            aria-selected={filterSuasana === 'semua'}
            class="util-pill"
            class:is-obsidian={filterSuasana === 'semua'}
            onclick={() => (filterSuasana = 'semua')}
            data-testid="karawitan-mood-semua"
          >
            {tI18n(bahasa, 'karawitan.moodAll')}
          </button>
          {#each DAFTAR_SUASANA_BGM as s}
            <button
              type="button"
              role="tab"
              aria-selected={filterSuasana === s.id}
              class="util-pill"
              class:is-obsidian={filterSuasana === s.id}
              onclick={() => (filterSuasana = s.id)}
              data-testid="karawitan-mood-{s.id}"
            >
              {ambilTeks(s.label, bahasa)}
            </button>
          {/each}
        </div>

        <div class="karawitan-track-list" role="tablist" aria-label={tI18n(bahasa, 'karawitan.chooseAria')}>
          {#each daftarTersaring as g}
            <button
              type="button"
              role="tab"
              aria-selected={statusRt.gendingId === g.id}
              class="util-pill karawitan-track-btn"
              class:is-obsidian={statusRt.gendingId === g.id}
              onclick={() => onPilihGending(g.id)}
              data-testid="karawitan-gending-{g.id}"
            >
              <span>{g.judul}</span>
              <span class="karawitan-track-mood">{ambilTeks(g.suasanaLabel, bahasa)}</span>
            </button>
          {/each}
        </div>
      </div>
    {/if}

    <div class="karawitan-mini-pill">
      <div class="karawitan-eq" class:is-playing={suasanaAktif} aria-hidden="true">
        <span></span><span></span><span></span><span></span>
      </div>

      {#if !ringkasMinim}
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
            class="util-pill karawitan-step-btn"
            onclick={() => geserTrack(-1)}
            aria-label="Gending Sebelumnya"
            data-testid="btn-karawitan-prev"
          >
            &#8249;
          </button>
          <button
            type="button"
            class="util-pill karawitan-step-btn"
            onclick={() => geserTrack(1)}
            aria-label="Gending Berikutnya"
            data-testid="btn-karawitan-next"
          >
            &#8250;
          </button>
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
          <button
            type="button"
            class="util-pill karawitan-collapse-btn"
            onclick={() => {
              panelFilosofiBuka = false;
              ringkasMinim = true;
            }}
            aria-label={tI18n(bahasa, 'karawitan.collapseAria')}
            data-testid="karawitan-collapse-btn"
          >
            ▾
          </button>
        </div>
      {:else}
        <button
          type="button"
          class="karawitan-meta-btn"
          onclick={() => (ringkasMinim = false)}
          aria-label={tI18n(bahasa, 'karawitan.expandAria')}
          data-testid="karawitan-collapse-btn"
        >
          <span class="karawitan-mini-title">{tI18n(bahasa, 'karawitan.collapsedPill')} ▴</span>
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
      {/if}
    </div>
  </aside>
{/if}
