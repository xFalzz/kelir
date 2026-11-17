<script lang="ts">
  import type { SpesimenBedahId } from '../../content/pusaka.ts';
  import { tI18n, type BahasaAktif } from '../../lib/i18n.ts';
  import type { HalamanValidId, HasilEvaluasiRute, SaranRuteKelir } from '../../lib/routeGuard.ts';

  interface RingkasanHalaman {
    id: HalamanValidId;
    nomor: string;
    label: string;
    aksara: string;
  }

  interface Props {
    bahasa: BahasaAktif;
    infoRute: HasilEvaluasiRute;
    daftarHalaman: RingkasanHalaman[];
    onKembaliBeranda: () => void;
    onPindahHalaman: (id: HalamanValidId) => void;
    onPilihPusaka: (id: SpesimenBedahId, bukaTwin?: boolean) => void;
    onBukaSearch: () => void;
  }

  let {
    bahasa,
    infoRute,
    daftarHalaman,
    onKembaliBeranda,
    onPindahHalaman,
    onPilihPusaka,
    onBukaSearch,
  }: Props = $props();

  let offsetX = $state(0);
  let offsetY = $state(0);

  let leadKunci = $derived.by(() => {
    if (infoRute.alasan === 'hal') return 'notFound.leadHal';
    if (infoRute.alasan === 'benda') return 'notFound.leadBenda';
    if (infoRute.alasan === 'babak') return 'notFound.leadBabak';
    return 'notFound.leadPath';
  });

  function tanganiGerakPointer(ev: PointerEvent): void {
    if (ev.pointerType !== 'mouse') return;
    const target = ev.currentTarget as HTMLElement | null;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const nx = (ev.clientX - rect.left) / rect.width - 0.5;
    const ny = (ev.clientY - rect.top) / rect.height - 0.5;
    offsetX = Math.round(nx * 14 * 10) / 10;
    offsetY = Math.round(ny * 10 * 10) / 10;
  }

  function resetPointer(): void {
    offsetX = 0;
    offsetY = 0;
  }

  function jalankanSaran(saran: SaranRuteKelir): void {
    if (saran.bendaId) {
      onPilihPusaka(saran.bendaId, true);
      return;
    }
    onPindahHalaman(saran.halaman);
  }
</script>

<section
  class="kelir-404-section"
  aria-label={tI18n(bahasa, 'notFound.ariaLabel')}
  data-testid="notfound-page"
  onpointermove={tanganiGerakPointer}
  onpointerleave={resetPointer}
>
  <div
    class="kelir-404-stage"
    style="--nf-x: {offsetX}px; --nf-y: {offsetY}px;"
  >
    <span class="kelir-404-corner is-tl" aria-hidden="true"></span>
    <span class="kelir-404-corner is-tr" aria-hidden="true"></span>
    <span class="kelir-404-corner is-bl" aria-hidden="true"></span>
    <span class="kelir-404-corner is-br" aria-hidden="true"></span>

    <div class="kelir-404-meta">
      <div class="kelir-404-code-wrap">
        <span class="kelir-404-eyebrow">{tI18n(bahasa, 'notFound.codeBadge')}</span>
        <span class="kelir-404-jawa-num" lang="jv" aria-hidden="true">꧔꧐꧔</span>
      </div>
      <code class="kelir-404-url" data-testid="notfound-url-chip" title={infoRute.urlDiminta}>
        {infoRute.urlDiminta}
      </code>
    </div>

    <div class="kelir-404-emblem">
      <span class="kelir-404-digits" aria-hidden="true">404</span>

      <svg
        class="kelir-404-reticle"
        viewBox="0 0 132 132"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="10"
          y="16"
          width="112"
          height="100"
          rx="2"
          stroke="currentColor"
          stroke-opacity="0.26"
          stroke-width="1.25"
        />
        <path
          d="M66 24 L98 94 H34 Z"
          stroke="var(--accent-ember)"
          stroke-width="1.65"
          stroke-linejoin="round"
        />
        <path
          d="M66 24 V108 M20 66 H52 M80 66 H112"
          stroke="currentColor"
          stroke-opacity="0.34"
          stroke-width="1.2"
          stroke-dasharray="3 3"
        />
        <circle cx="66" cy="66" r="5" stroke="var(--accent-ember)" stroke-width="1.65" />
      </svg>
    </div>

    <div class="kelir-404-copy">
      <h1 class="kelir-404-title">{tI18n(bahasa, 'notFound.title')}</h1>
      <p class="kelir-404-lead">
        {tI18n(bahasa, leadKunci, { url: infoRute.urlDiminta })}
      </p>
    </div>

    {#if infoRute.saran}
      {@const saran = infoRute.saran}
      <button
        type="button"
        class="kelir-404-suggest"
        onclick={() => jalankanSaran(saran)}
        data-testid="notfound-suggest-btn"
      >
        <span class="kelir-404-suggest-prefix">{tI18n(bahasa, 'notFound.suggestPrefix')}</span>
        <strong>{tI18n(bahasa, saran.labelKey)}</strong>
      </button>
    {/if}

    <div class="kelir-404-actions">
      <button
        type="button"
        class="pill-cta-white"
        onclick={onKembaliBeranda}
        data-testid="notfound-home-btn"
      >
        {tI18n(bahasa, 'notFound.homeBtn')}
      </button>
      <button
        type="button"
        class="pill-cta-outline"
        onclick={onBukaSearch}
        data-testid="notfound-search-btn"
      >
        {tI18n(bahasa, 'notFound.searchBtn')}
      </button>
    </div>

    <nav class="kelir-404-rooms" aria-label={tI18n(bahasa, 'notFound.roomsLabel')}>
      <div class="kelir-404-rooms-label">{tI18n(bahasa, 'notFound.roomsLabel')}</div>
      <div class="kelir-404-rooms-grid">
        {#each daftarHalaman as hal}
          <button
            type="button"
            class="kelir-404-room-link"
            onclick={() => onPindahHalaman(hal.id)}
            data-testid="notfound-room-{hal.id}"
          >
            <span class="kelir-404-room-num">{hal.nomor}</span>
            <span class="kelir-404-room-name">{hal.label}</span>
            <span class="kelir-404-room-aksara" lang="jv" aria-hidden="true">{hal.aksara}</span>
          </button>
        {/each}
      </div>
    </nav>
  </div>
</section>
