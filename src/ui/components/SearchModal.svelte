<script lang="ts">
  import { tick } from 'svelte';
  import { type BahasaAktif, type SpesimenBedahId } from '../../content/pusaka.ts';
  import { BANK_KUIS_S1_S7 } from '../../lib/aiStudio.ts';
  import { tI18n } from '../../lib/i18n.ts';
  import {
    bangunIndeksPencarian,
    cariDalamArsip,
    type AksiNavigasiPencarian,
    type ItemPencarianArsip,
    type JejakKurasi,
    type KategoriPencarian,
  } from '../../lib/pencarianArsip.ts';

  interface Props {
    bahasa: BahasaAktif;
    tema: 'malam' | 'terang';
    terbuka: boolean;
    jejak: JejakKurasi;
    skalaTeks: 'normal' | 'besar';
    onUbahSkalaTeks: (skala: 'normal' | 'besar') => void;
    onClose: () => void;
    onEksekusiAksi: (aksi: AksiNavigasiPencarian) => void;
  }

  let {
    bahasa,
    tema,
    terbuka,
    jejak,
    skalaTeks,
    onUbahSkalaTeks,
    onClose,
    onEksekusiAksi,
  }: Props = $props();

  let kueri = $state('');
  let kategoriAktif: KategoriPencarian = $state('semua');
  let indeksSorot = $state(0);
  let inputEl: HTMLInputElement | undefined = $state();
  let namaPiagam = $state('');

  async function unduhPiagam(): Promise<void> {
    if (typeof document === 'undefined') return;
    const { buatDataUrlPiagamKurator } = await import('../../lib/piagamKurator.ts');
    const hasil = buatDataUrlPiagamKurator({
      namaPengunjung: namaPiagam,
      bahasa,
      tema,
      jejak,
      totalKuis: BANK_KUIS_S1_S7.length,
    });
    if (!hasil) return;
    const a = document.createElement('a');
    a.href = hasil.dataUrl;
    a.download = hasil.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  let indeksLengkap = $derived(bangunIndeksPencarian(bahasa));
  let hasilCari = $derived(cariDalamArsip(indeksLengkap, kueri, kategoriAktif, 20));

  $effect(() => {
    if (terbuka) {
      indeksSorot = 0;
      void tick().then(() => inputEl?.focus());
    }
  });

  function pilihHasil(item: ItemPencarianArsip): void {
    onEksekusiAksi(item.aksi);
    onClose();
  }

  function handleKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (hasilCari.length > 0) {
        indeksSorot = (indeksSorot + 1) % hasilCari.length;
      }
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (hasilCari.length > 0) {
        indeksSorot = (indeksSorot - 1 + hasilCari.length) % hasilCari.length;
      }
      return;
    }
    if (e.key === 'Enter' && hasilCari[indeksSorot]) {
      e.preventDefault();
      pilihHasil(hasilCari[indeksSorot]);
    }
  }

  const KATEGORI_LIST: KategoriPencarian[] = [
    'semua',
    'pusaka',
    'anatomi',
    'pakeliran',
    'aksara',
    'pustaka',
  ];

  function labelKategori(kat: KategoriPencarian): string {
    return tI18n(bahasa, `search.cat.${kat}`);
  }
</script>

{#if terbuka}
  <div
    class="search-modal-backdrop"
    role="dialog"
    aria-modal="true"
    aria-label={tI18n(bahasa, 'search.modalAria')}
    data-testid="search-modal"
  >
    <button
      type="button"
      class="search-backdrop-dismiss"
      aria-label={tI18n(bahasa, 'search.close')}
      onclick={onClose}
    ></button>

    <div class="search-modal-card">
      <div class="search-modal-head">
        <div class="search-input-wrap">
          <svg class="search-ico-svg" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="5.6" stroke="currentColor" stroke-width="1.5" />
            <path d="M12.2 12.2L16 16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
          <input
            bind:this={inputEl}
            type="search"
            class="search-modal-input"
            bind:value={kueri}
            onkeydown={handleKeyDown}
            placeholder={tI18n(bahasa, 'search.placeholder')}
            data-testid="search-modal-input"
          />
        </div>
        <button
          type="button"
          class="util-pill"
          onclick={onClose}
          data-testid="search-modal-close"
        >
          {tI18n(bahasa, 'search.close')}
        </button>
      </div>

      <!-- Paspor Jejak Kurasi -->
      <div class="jejak-passport-bar" data-testid="jejak-kurasi-bar">
        <span class="eyebrow-mono">{tI18n(bahasa, 'search.passportLabel')}</span>
        <div class="jejak-metrics">
          <span>
            {tI18n(bahasa, 'search.exploredSpec', {
              done: jejak.spesimenDiteliti.length,
              total: 7,
            })}
          </span>
          <span>·</span>
          <span>
            {tI18n(bahasa, 'search.heardSuluk', {
              done: jejak.sulukDidengar.length,
              total: 7,
            })}
          </span>
          <span>·</span>
          <span>
            {tI18n(bahasa, 'search.favoritesMetric', {
              done: (jejak.favoritIds ?? []).length,
              total: 7,
            })}
          </span>
          <span>·</span>
          <span>
            {tI18n(bahasa, 'search.quizBest', {
              done: jejak.skorKuisTertinggi,
              total: BANK_KUIS_S1_S7.length,
            })}
          </span>
        </div>
      </div>

      <!-- Cetak Piagam Kurator Lokal & Kontrol Keterbacaan -->
      <div class="cert-export-bar">
        <div class="cert-input-group">
          <input
            type="text"
            maxlength="42"
            class="cert-name-input"
            bind:value={namaPiagam}
            placeholder={tI18n(bahasa, 'search.certNamePlaceholder')}
            data-testid="cert-name-input"
          />
          <button
            type="button"
            class="util-pill"
            onclick={() => void unduhPiagam()}
            data-testid="btn-download-cert"
          >
            {tI18n(bahasa, 'search.certDownload')}
          </button>
        </div>

        <div class="search-a11y-group">
          <span class="eyebrow-mono">{tI18n(bahasa, 'search.fontScaleLabel')}</span>
          <button
            type="button"
            class="util-pill"
            class:is-active={skalaTeks === 'normal'}
            onclick={() => onUbahSkalaTeks('normal')}
            data-testid="btn-scale-normal"
          >
            A
          </button>
          <button
            type="button"
            class="util-pill"
            class:is-active={skalaTeks === 'besar'}
            onclick={() => onUbahSkalaTeks('besar')}
            data-testid="btn-scale-large"
          >
            A+
          </button>
        </div>
      </div>

      <!-- Filter Kategori Arsip -->
      <div class="search-cat-pills" role="tablist" aria-label={tI18n(bahasa, 'search.filterAria')}>
        {#each KATEGORI_LIST as kat}
          <button
            type="button"
            role="tab"
            aria-selected={kategoriAktif === kat}
            class="util-pill"
            class:is-active={kategoriAktif === kat}
            onclick={() => {
              kategoriAktif = kat;
              indeksSorot = 0;
            }}
            data-testid="search-cat-{kat}"
          >
            {labelKategori(kat)}
          </button>
        {/each}
      </div>

      <!-- Daftar Hasil Pencarian -->
      <div class="search-results-list" data-testid="search-results-list">
        {#if hasilCari.length === 0}
          <div class="search-empty-state">
            <p>{tI18n(bahasa, 'search.empty', { query: kueri })}</p>
          </div>
        {:else}
          {#each hasilCari as item, idx}
            <button
              type="button"
              class="search-result-row"
              class:is-highlighted={indeksSorot === idx}
              onmouseenter={() => (indeksSorot = idx)}
              onclick={() => pilihHasil(item)}
              data-testid="search-result-{item.id}"
            >
              <div class="search-result-main">
                <div class="search-result-title-line">
                  <strong>{item.judul}</strong>
                  {#if item.aksara}
                    <span class="search-result-aksara" lang="jv">{item.aksara}</span>
                  {/if}
                </div>
                <p class="search-result-sub">{item.subjudul}</p>
              </div>
              <div class="search-result-meta">
                {#if item.aksi.jenis === 'twin' && (jejak.favoritIds ?? []).includes(item.aksi.bendaId)}
                  <span class="source-badge is-fav-mark">★</span>
                {/if}
                <span class="source-badge">{labelKategori(item.kategori)}</span>
                <span class="search-result-code">{item.meta}</span>
              </div>
            </button>
          {/each}
        {/if}
      </div>

      <div class="search-footer-bar">
        <span class="eyebrow-mono">{tI18n(bahasa, 'search.shortcutsHint')}</span>
      </div>
    </div>
  </div>
{/if}
