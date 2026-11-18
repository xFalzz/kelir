<script lang="ts">
  import { tick } from 'svelte';
  import { ambilTeks, type BahasaAktif } from '../../content/pusaka.ts';
  import { fokusModalTrap } from '../../lib/focusTrap.ts';
  import {
    KONTAK_META_TEKS,
    KONTAK_PENGELOLA,
    METADATA_LEGAL,
    PASAL_KEBIJAKAN_PRIVASI,
    PASAL_SYARAT_KETENTUAN,
    RINGKASAN_TAB_LEGAL,
    TOPIK_KORESPONDENSI,
    type TabLegalModal,
  } from '../../content/legalInfo.ts';

  interface Props {
    bahasa: BahasaAktif;
    tema: 'malam' | 'terang';
    terbuka: boolean;
    tabAktif: TabLegalModal;
    onPilihTab: (tab: TabLegalModal) => void;
    onClose: () => void;
    onResetDataLokal?: () => void;
  }

  let { bahasa, tema, terbuka, tabAktif, onPilihTab, onClose, onResetDataLokal }: Props = $props();

  let dataLokalDireset = $state(false);

  function tanganiResetDataLokal(): void {
    try {
      window.localStorage.removeItem('kelir_jejak_v1');
      window.localStorage.removeItem('kelir_ai_feedback_v1');
      window.localStorage.removeItem('kelir_onboarding_v1');
    } catch {
      // Abaikan jika storage diblokir peramban
    }
    dataLokalDireset = true;
    onResetDataLokal?.();
  }

  const DAFTAR_TAB: TabLegalModal[] = ['syarat', 'privasi', 'kontak'];

  let bodyEl: HTMLDivElement | undefined = $state();
  let closeBtnEl: HTMLButtonElement | undefined = $state();
  let idTersalin: string | null = $state(null);
  let salinTimer: number | null = null;

  let ringkasanAktif = $derived(RINGKASAN_TAB_LEGAL[tabAktif]);
  let pasalAktif = $derived(
    tabAktif === 'syarat'
      ? PASAL_SYARAT_KETENTUAN
      : tabAktif === 'privasi'
        ? PASAL_KEBIJAKAN_PRIVASI
        : [],
  );

  $effect(() => {
    if (terbuka) {
      void tick().then(() => {
        if (bodyEl) bodyEl.scrollTop = 0;
        closeBtnEl?.focus();
      });
    }
    return () => {
      if (salinTimer !== null) {
        window.clearTimeout(salinTimer);
        salinTimer = null;
      }
    };
  });

  $effect(() => {
    const _tab = tabAktif;
    void _tab;
    if (bodyEl) bodyEl.scrollTop = 0;
  });

  async function salinNilaiKontak(id: string, nilai: string): Promise<void> {
    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(nilai);
      idTersalin = id;
      if (salinTimer !== null) window.clearTimeout(salinTimer);
      salinTimer = window.setTimeout(() => {
        idTersalin = null;
      }, 2200);
    } catch {
      // Abaikan aman bila izin clipboard dibatasi browser
    }
  }
</script>

{#if terbuka}
  <div
    class="legal-modal-backdrop"
    data-theme={tema}
    role="dialog"
    aria-modal="true"
    aria-labelledby="legal-modal-title"
    data-testid="legal-info-modal"
  >
    <button
      type="button"
      class="search-backdrop-dismiss"
      onclick={onClose}
      aria-label={ambilTeks(KONTAK_META_TEKS.tutupModal, bahasa)}
    ></button>

    <section class="legal-modal-card" use:fokusModalTrap={terbuka}>
      <header class="legal-modal-head">
        <div class="legal-modal-head-top">
          <div style="min-width: 0;">
            <div class="eyebrow-mono">{ambilTeks(METADATA_LEGAL.eyebrow, bahasa)}</div>
            <h2 id="legal-modal-title" class="legal-modal-title">
              {ambilTeks(ringkasanAktif.judul, bahasa)}
            </h2>
          </div>

          <button
            bind:this={closeBtnEl}
            type="button"
            class="util-pill legal-close-btn"
            onclick={onClose}
            data-testid="legal-modal-close"
          >
            {ambilTeks(KONTAK_META_TEKS.tutupModal, bahasa)}
          </button>
        </div>

        <div class="legal-tabs-bar">
          <div class="legal-tabs-row" role="tablist" aria-label={ambilTeks(METADATA_LEGAL.eyebrow, bahasa)}>
            {#each DAFTAR_TAB as tab, i}
              <button
                type="button"
                role="tab"
                aria-selected={tabAktif === tab}
                class="legal-tab-btn"
                class:is-active={tabAktif === tab}
                onclick={() => onPilihTab(tab)}
                data-testid="legal-tab-{tab}"
              >
                <span class="legal-tab-num">0{i + 1}</span>
                <span>{ambilTeks(METADATA_LEGAL.tabLabel[tab], bahasa)}</span>
              </button>
            {/each}
          </div>
          <span class="eyebrow-mono legal-version-tag">{ambilTeks(METADATA_LEGAL.tanggalBerlaku, bahasa)}</span>
        </div>
      </header>

      <div class="legal-modal-body" bind:this={bodyEl} tabindex="-1">
        <p class="legal-lead-copy">{ambilTeks(ringkasanAktif.pengantar, bahasa)}</p>

        {#if tabAktif === 'kontak'}
          <div class="legal-maintainer-line">
            <span class="source-badge">{ambilTeks(KONTAK_META_TEKS.roleBadge, bahasa)}</span>
            <span class="eyebrow-mono">{ambilTeks(KONTAK_META_TEKS.slaCatatan, bahasa)}</span>
          </div>

          <div class="legal-contact-grid">
            {#each KONTAK_PENGELOLA as kanal}
              <article class="legal-contact-card" data-testid="legal-contact-{kanal.id}">
                <div class="legal-contact-card-top">
                  <span class="eyebrow-mono">{ambilTeks(kanal.label, bahasa)}</span>
                  <span class="legal-contact-ico" aria-hidden="true">
                    {#if kanal.id === 'email'}
                      <svg viewBox="0 0 20 20" fill="none">
                        <rect x="2.5" y="4.5" width="15" height="11" rx="2" stroke="currentColor" stroke-width="1.5" />
                        <path d="M3.5 5.5 10 10.75 16.5 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    {:else if kanal.id === 'website'}
                      <svg viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="7.2" stroke="currentColor" stroke-width="1.5" />
                        <ellipse cx="10" cy="10" rx="3.4" ry="7.2" stroke="currentColor" stroke-width="1.35" />
                        <path d="M3.2 8h13.6M3.2 12h13.6" stroke="currentColor" stroke-width="1.3" />
                      </svg>
                    {:else}
                      <svg viewBox="0 0 20 20" fill="none">
                        <rect x="3" y="3" width="14" height="14" rx="4" stroke="currentColor" stroke-width="1.5" />
                        <circle cx="10" cy="10" r="3.4" stroke="currentColor" stroke-width="1.5" />
                        <circle cx="14.2" cy="5.8" r="0.9" fill="currentColor" />
                      </svg>
                    {/if}
                  </span>
                </div>

                <a
                  href={kanal.tautan}
                  class="legal-contact-value"
                  target={kanal.eksternal ? '_blank' : undefined}
                  rel={kanal.eksternal ? 'noopener noreferrer' : undefined}
                  data-testid="legal-link-{kanal.id}"
                >
                  {kanal.nilai}
                </a>

                <p class="legal-contact-desc">{ambilTeks(kanal.keterangan, bahasa)}</p>

                <div class="legal-contact-actions">
                  <a
                    href={kanal.tautan}
                    class="util-pill legal-action-pill is-obsidian"
                    target={kanal.eksternal ? '_blank' : undefined}
                    rel={kanal.eksternal ? 'noopener noreferrer' : undefined}
                  >
                    {kanal.id === 'email'
                      ? ambilTeks(KONTAK_META_TEKS.kirimEmail, bahasa)
                      : ambilTeks(KONTAK_META_TEKS.bukaKanal, bahasa)}
                  </a>
                  {#if kanal.dapatDisalin}
                    <button
                      type="button"
                      class="util-pill legal-copy-btn"
                      class:is-copied={idTersalin === kanal.id}
                      onclick={() => void salinNilaiKontak(kanal.id, kanal.nilai)}
                      data-testid="legal-copy-{kanal.id}"
                    >
                      {idTersalin === kanal.id
                        ? ambilTeks(KONTAK_META_TEKS.tersalin, bahasa)
                        : ambilTeks(KONTAK_META_TEKS.salin, bahasa)}
                    </button>
                  {/if}
                </div>
              </article>
            {/each}
          </div>

          <div class="legal-topics-strip">
            {#each TOPIK_KORESPONDENSI as topik}
              <div class="legal-topic-item">
                <div class="legal-clause-head">
                  <span class="legal-clause-num">{topik.kode}</span>
                  <h3>{ambilTeks(topik.judul, bahasa)}</h3>
                </div>
                <p>{ambilTeks(topik.ringkas, bahasa)}</p>
              </div>
            {/each}
          </div>
        {:else}
          <div class="legal-clauses-list">
            {#each pasalAktif as pasal}
              <article class="legal-clause-card">
                <div class="legal-clause-head">
                  <span class="legal-clause-num">{pasal.kode}</span>
                  <h3>{ambilTeks(pasal.judul, bahasa)}</h3>
                </div>
                <p>{ambilTeks(pasal.isi, bahasa)}</p>
                {#if pasal.butir && pasal.butir.length > 0}
                  <ul class="legal-clause-bullets">
                    {#each pasal.butir as b}
                      <li>{ambilTeks(b, bahasa)}</li>
                    {/each}
                  </ul>
                {/if}
              </article>
            {/each}
          </div>

          {#if tabAktif === 'privasi'}
            <div class="legal-privacy-actions">
              <button
                type="button"
                class="util-pill"
                onclick={tanganiResetDataLokal}
                data-testid="btn-reset-local-data"
              >
                {ambilTeks(KONTAK_META_TEKS.hapusDataLokal, bahasa)}
              </button>
              {#if dataLokalDireset}
                <span class="source-badge" data-testid="reset-local-data-done">
                  {ambilTeks(KONTAK_META_TEKS.hapusDataSukses, bahasa)}
                </span>
              {/if}
            </div>
          {/if}
        {/if}
      </div>

      <footer class="legal-modal-foot">
        <span class="eyebrow-mono">{ambilTeks(KONTAK_META_TEKS.footerCredit, bahasa)}</span>
        <div class="legal-foot-quick">
          <span class="source-badge">{ambilTeks(ringkasanAktif.lencana, bahasa)}</span>
          {#if tabAktif !== 'kontak'}
            <button
              type="button"
              class="util-pill"
              onclick={() => onPilihTab('kontak')}
            >
              {ambilTeks(METADATA_LEGAL.tabLabel.kontak, bahasa)} →
            </button>
          {/if}
        </div>
      </footer>
    </section>
  </div>
{/if}
