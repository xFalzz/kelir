<script lang="ts">
  import { onMount } from 'svelte';
  import {
    DAFTAR_SUMBER,
    ambilAksenBenda,
    ambilTeks,
    type BahasaAktif,
    type ItemCoverflow,
    type SpesimenBedahId,
  } from '../../content/pusaka.ts';
  import { latinKeAksaraJawa } from '../../lib/aksara.ts';
  import { tI18n } from '../../lib/i18n.ts';
  import { canUseHoverPointer } from '../../lib/revealAnim.ts';
  import WebGLStatusBanner from './WebGLStatusBanner.svelte';

  interface Props {
    items: ItemCoverflow[];
    coverflowIdx: number;
    tema: 'malam' | 'terang';
    bahasa: BahasaAktif;
    suasanaPendopoAktif: boolean;
    favoritIds: SpesimenBedahId[];
    mountStage: (node: HTMLDivElement) => { destroy?: () => void };
    onSelectIndex: (idx: number) => void;
    onGeser: (delta: number) => void;
    onBukaModalSuluk: (idx: number) => void;
    onToggleSuasanaGending: () => void;
    onToggleFavorit: (id: SpesimenBedahId) => void;
    onBukaItem: (item: ItemCoverflow) => void;
    onFokusAnatomi?: (item: ItemCoverflow, titikId?: string) => void;
    onParalaks: (nx: number, ny: number) => void;
    onScrollProgres: (progres: number) => void;
  }

  let {
    items,
    coverflowIdx,
    tema,
    bahasa,
    suasanaPendopoAktif,
    favoritIds,
    mountStage,
    onSelectIndex,
    onGeser,
    onBukaModalSuluk,
    onToggleSuasanaGending,
    onToggleFavorit,
    onBukaItem,
    onFokusAnatomi,
    onParalaks,
    onScrollProgres,
  }: Props = $props();

  let sectionEl: HTMLElement | undefined = $state();
  let scrollProgress = $state(0);
  let stageRetrySeq = $state(0);
  let visibleBlocks: Record<string, boolean> = $state({
    dossier: true,
    anatomy: true,
    repertoire: true,
  });

  let aktif = $derived(items[coverflowIdx] ?? items[0]);
  let aksenAktif = $derived(ambilAksenBenda(aktif.artefakId, tema));

  onMount(() => {
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let rafPending = false;
    const perbaruiProgresGulir = () => {
      rafPending = false;
      if (!sectionEl) return;
      const rect = sectionEl.getBoundingClientRect();
      const vh = Math.max(window.innerHeight, 480);
      const totalTravel = Math.max(sectionEl.scrollHeight - vh * 0.55, 340);
      const p = Math.min(1, Math.max(0, -rect.top / totalTravel));
      if (Math.abs(p - scrollProgress) >= 0.001) {
        scrollProgress = p;
        onScrollProgres(p);
      }
    };

    const onScroll = () => {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(perbaruiProgresGulir);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    perbaruiProgresGulir();

    let io: IntersectionObserver | null = null;
    if (!reduceMotion && sectionEl) {
      const blocks = sectionEl.querySelectorAll<HTMLElement>('[data-cf-reveal]');
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              const key = entry.target.getAttribute('data-cf-reveal');
              if (key) visibleBlocks = { ...visibleBlocks, [key]: true };
            }
          }
        },
        { threshold: 0.08, rootMargin: '0px 0px -24px 0px' },
      );
      blocks.forEach((b) => io?.observe(b));
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      io?.disconnect();
    };
  });

  function handleViewportMouseMove(e: MouseEvent): void {
    if (!canUseHoverPointer()) return;
    const el = e.currentTarget as HTMLElement | null;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
    const ny = ((e.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1;
    onParalaks(nx, ny);
  }

  function handleViewportKeyDown(e: KeyboardEvent): void {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onGeser(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      onGeser(1);
    }
  }
</script>

<section
  id="coverflow"
  bind:this={sectionEl}
  class="archive-showcase-section"
  aria-label={tI18n(bahasa, 'coverflow.h1')}
  style="--cf-scroll: {scrollProgress.toFixed(4)}; --cf-accent: {aksenAktif};"
>
  <!-- 1. Tajuk Editorial Terbuka di Atas Panggung 3D -->
  <header class="cf-masthead cf-scroll-header">
    <div class="cf-masthead-copy">
      <div class="cf-masthead-kicker">
        <span class="live-dot is-crimson" aria-hidden="true"></span>
        <span>{tI18n(bahasa, 'coverflow.eyebrow', { count: items.length })}</span>
      </div>
      <h1 class="cf-masthead-title">{tI18n(bahasa, 'coverflow.h1')}</h1>
      <p class="cf-masthead-sub">{tI18n(bahasa, 'coverflow.lead')}</p>
    </div>

    <div class="cf-masthead-telemetry">
      <div class="cf-telemetry-code">{aktif.nomorUrut} / 0{items.length} · {aktif.kodeArsip}</div>
      <div class="cf-telemetry-meta">
        <span class="cf-telemetry-aksara" lang="jv" aria-hidden="true">{aktif.aksara}</span>
        <span class="cf-telemetry-status">{ambilTeks(aktif.badgeStatus, bahasa)}</span>
      </div>
    </div>
  </header>

  <!-- 2. Panggung Panorama WebGL 3D Terbuka -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="coverflow-viewport"
    role="region"
    aria-label={tI18n(bahasa, 'coverflow.h1')}
    onmousemove={handleViewportMouseMove}
    onmouseleave={() => onParalaks(0, 0)}
    onkeydown={handleViewportKeyDown}
  >
    <div class="coverflow-stage-aura" aria-hidden="true"></div>
    {#key stageRetrySeq}
      <div class="coverflow-webgl-host" use:mountStage></div>
    {/key}
    <WebGLStatusBanner {bahasa} onRetry={() => (stageRetrySeq += 1)} />
    <div class="coverflow-edge-fade" aria-hidden="true"></div>

    <div class="coverflow-hud-top">
      <span class="cf-micro-hint">{tI18n(bahasa, 'coverflow.stageHint')}</span>
      <span class="cf-micro-hint is-right">{aktif.larasPathet}</span>
    </div>
  </div>

  <!-- 3. Konsol Panggung & Rel Koleksi 01-07 Tepat Di Bawah Horison Pedestal -->
  <div class="cf-stage-console">
    <div class="cf-console-main">
      <div class="cf-console-caption">
        <div class="cf-console-kicker">
          <span>{ambilTeks(aktif.kategori, bahasa)}</span>
          <span aria-hidden="true">·</span>
          <span class="cf-console-aksara" lang="jv" aria-hidden="true">{aktif.aksara}</span>
        </div>
        <h2 class="coverflow-stage-title">{ambilTeks(aktif.nama, bahasa)}</h2>
        <p class="coverflow-stage-sub">{ambilTeks(aktif.subjudul, bahasa)}</p>
      </div>

      <div class="cf-console-controls">
        <div class="coverflow-nav-bar">
          <button
            type="button"
            class="circle-nav-btn"
            onclick={() => onGeser(-1)}
            aria-label="Previous Specimen"
            data-testid="coverflow-prev"
          >
            &lt;
          </button>
          <span class="cf-nav-counter">0{coverflowIdx + 1} / 0{items.length}</span>
          <button
            type="button"
            class="circle-nav-btn"
            onclick={() => onGeser(1)}
            aria-label="Next Specimen"
            data-testid="coverflow-next"
          >
            &gt;
          </button>
        </div>

        <div class="coverflow-hud-actions">
          <button
            type="button"
            class="pill-cta-crimson"
            onclick={() => onBukaModalSuluk(coverflowIdx)}
            data-testid="buka-modal-suluk"
          >
            {tI18n(bahasa, 'coverflow.ctaSuluk')}
          </button>
          <button
            type="button"
            class="util-pill"
            class:is-active={favoritIds.includes(aktif.artefakId)}
            onclick={() => onToggleFavorit(aktif.artefakId)}
            data-testid="coverflow-favorit-btn"
          >
            {favoritIds.includes(aktif.artefakId)
              ? tI18n(bahasa, 'coverflow.savedFav')
              : tI18n(bahasa, 'coverflow.saveFav')}
          </button>
          <button
            type="button"
            class="pill-cta-outline"
            onclick={() => onBukaItem(aktif)}
            data-testid="coverflow-cta-ruang"
          >
            {ambilTeks(aktif.ctaLabel, bahasa)} &#8594;
          </button>
        </div>
      </div>
    </div>

    <div class="coverflow-pill-strip" role="tablist" aria-label={tI18n(bahasa, 'coverflow.repTitle', { count: items.length })}>
      {#each items as item, idx}
        <button
          type="button"
          role="tab"
          aria-selected={coverflowIdx === idx}
          class="cf-selector-pill"
          class:is-active={coverflowIdx === idx}
          onclick={() => onSelectIndex(idx)}
          data-testid="coverflow-pill-{idx + 1}"
        >
          <span class="cf-pill-num">{item.nomorUrut}</span>
          <span>{ambilTeks(item.nama, bahasa)}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- 4. Monograf Kurasi & Bedah Anatomi Seimbang Kiri-Kanan -->
  <div class="coverflow-inspector-grid">
    <article
      class="cf-dossier-panel cf-reveal-block"
      class:is-visible={visibleBlocks.dossier}
      data-cf-reveal="dossier"
    >
      <div class="cf-panel-head">
        <div>
          <div class="eyebrow-mono">{tI18n(bahasa, 'coverflow.dossierEyebrow', { kode: aktif.kodeArsip })}</div>
          <h3 class="display-h2 cf-dossier-title">{ambilTeks(aktif.nama, bahasa)}</h3>
          <p class="cf-dossier-sub">{ambilTeks(aktif.subjudul, bahasa)}</p>
        </div>
        <span class="cf-aksara-stamp" lang="jv" aria-hidden="true">{aktif.aksara}</span>
      </div>

      <div class="cf-origin-row">
        <span class="cf-origin-label">
          {tI18n(bahasa, 'coverflow.originLabel')} <strong>{ambilTeks(aktif.asal, bahasa)}</strong>
        </span>
        <div class="cf-source-pills">
          {#each aktif.sumber as sKode}
            <span class="source-pill" title={DAFTAR_SUMBER[sKode].judul}>
              {sKode} · {DAFTAR_SUMBER[sKode].lembaga}
            </span>
          {/each}
        </div>
      </div>

      <div class="cf-spec-table">
        {#each aktif.metrikKurasi as m}
          <div class="cf-spec-col">
            <span class="cf-spec-label">{ambilTeks(m.label, bahasa)}</span>
            <strong class="cf-spec-val">{ambilTeks(m.nilai, bahasa)}</strong>
          </div>
        {/each}
      </div>

      <div class="cf-narrative-section">
        <h4 class="cf-subhead">{tI18n(bahasa, 'coverflow.historyHeading')}</h4>
        <p class="cf-body-copy">{ambilTeks(aktif.penjelasanLengkap, bahasa)}</p>
      </div>

      <blockquote class="cf-filosofi-quote">
        <span class="cf-quote-kicker">{tI18n(bahasa, 'coverflow.philosophyHeading')}</span>
        <p>{ambilTeks(aktif.filosofi, bahasa)}</p>
      </blockquote>

      <div class="cf-karawitan-ledger">
        <div class="cf-karawitan-top">
          <span class="eyebrow-mono">{tI18n(bahasa, 'coverflow.karawitanHeading')}</span>
          <span class="cf-karawitan-mode">{ambilTeks(aktif.tempoKeterangan, bahasa)}</span>
        </div>

        <div class="cf-karawitan-meta-grid">
          <div>
            <span class="cf-spec-label">{tI18n(bahasa, 'coverflow.sulukType')}</span>
            <strong>{ambilTeks(aktif.jenisSuluk, bahasa)}</strong>
          </div>
          <div>
            <span class="cf-spec-label">{tI18n(bahasa, 'coverflow.larasPathet')}</span>
            <strong>{aktif.larasPathet}</strong>
          </div>
          <div>
            <span class="cf-spec-label">{tI18n(bahasa, 'coverflow.instruments')}</span>
            <strong>{ambilTeks(aktif.instrumenPengiring, bahasa)}</strong>
          </div>
          <div>
            <span class="cf-spec-label">{tI18n(bahasa, 'coverflow.dalangContext')}</span>
            <strong>{ambilTeks(aktif.catatanDalang, bahasa)}</strong>
          </div>
        </div>

        <div class="cf-suluk-excerpt">
          <p class="cf-suluk-quote">“{ambilTeks(aktif.sulukLarik[0], bahasa)}”</p>
          <p class="cf-suluk-aksara" lang="jv" aria-hidden="true">
            {latinKeAksaraJawa(aktif.sulukLarik[0]?.jw ?? '')}
          </p>
        </div>

        <div class="cf-dossier-actions">
          <button type="button" class="pill-cta-crimson" onclick={onToggleSuasanaGending}>
            {suasanaPendopoAktif
              ? tI18n(bahasa, 'coverflow.gendingPause')
              : tI18n(bahasa, 'coverflow.gendingPlay')}
          </button>
          <button
            type="button"
            class="pill-cta-outline"
            onclick={() => onBukaModalSuluk(coverflowIdx)}
          >
            {tI18n(bahasa, 'coverflow.fullSulukBtn')}
          </button>
          <button type="button" class="pill-cta-outline" onclick={() => onBukaItem(aktif)}>
            {ambilTeks(aktif.ctaLabel, bahasa)} &#8594;
          </button>
        </div>
      </div>
    </article>

    <div
      class="cf-anatomy-panel cf-reveal-block"
      class:is-visible={visibleBlocks.anatomy}
      data-cf-reveal="anatomy"
    >
      <div class="cf-panel-top">
        <div>
          <div class="eyebrow-mono">{tI18n(bahasa, 'coverflow.anatomyEyebrow', { nomor: aktif.nomorUrut })}</div>
          <h4 class="cf-panel-title">{tI18n(bahasa, 'coverflow.anatomyTitle')}</h4>
        </div>
        <span class="cf-badge-count">{tI18n(bahasa, 'coverflow.elementCount', { count: aktif.anatomiKritis.length })}</span>
      </div>

      <div class="cf-anatomy-ledger">
        {#each aktif.anatomiKritis as part, pIdx}
          <div class="cf-anatomy-row">
            <div class="cf-anatomy-idx">0{pIdx + 1}</div>
            <div class="cf-anatomy-copy">
              <div class="cf-anatomy-head">
                <strong>{ambilTeks(part.judul, bahasa)}</strong>
                <span class="cf-anatomy-src">{part.sumber.join(', ')}</span>
              </div>
              <p class="cf-anatomy-desc">{ambilTeks(part.ringkas, bahasa)}</p>
              {#if part.material || part.fungsiTeknis || (onFokusAnatomi && part.titikId)}
                <div class="cf-anatomy-specs">
                  {#if part.material}
                    <span class="cf-anatomy-tag">
                      {tI18n(bahasa, 'coverflow.matPrefix')} {ambilTeks(part.material, bahasa)}
                    </span>
                  {/if}
                  {#if part.fungsiTeknis}
                    <span class="cf-anatomy-tag is-fn">
                      {tI18n(bahasa, 'coverflow.fnPrefix')} {ambilTeks(part.fungsiTeknis, bahasa)}
                    </span>
                  {/if}
                  {#if onFokusAnatomi && part.titikId}
                    <button
                      type="button"
                      class="cf-anatomy-pin-btn"
                      onclick={() => onFokusAnatomi(aktif, part.titikId)}
                    >
                      {tI18n(bahasa, 'coverflow.pinInspect')}
                    </button>
                  {/if}
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- 5. Indeks Repertoar Penuh Selebar Halaman -->
  <div
    class="cf-repertoire-band cf-reveal-block"
    class:is-visible={visibleBlocks.repertoire}
    data-cf-reveal="repertoire"
  >
    <div class="cf-repertoire-header">
      <div>
        <div class="eyebrow-mono">{tI18n(bahasa, 'coverflow.repEyebrow')}</div>
        <h3 class="cf-panel-title">{tI18n(bahasa, 'coverflow.repTitle', { count: items.length })}</h3>
      </div>
      <div class="cf-repertoire-note">
        {tI18n(bahasa, 'coverflow.repNote')}
      </div>
    </div>

    <div class="archive-repertoire-table">
      {#each items as b, bIdx}
        <div class="track-row-wrap" class:is-active={coverflowIdx === bIdx}>
          <button
            type="button"
            class="track-row"
            onclick={() => onSelectIndex(bIdx)}
            data-testid="repertoire-select-{bIdx + 1}"
          >
            <span class="track-num">{b.nomorUrut}</span>
            <span class="track-aksara" lang="jv" aria-hidden="true">{b.aksara}</span>
            <span class="track-main">
              <span class="track-title-wrap">
                <strong>{ambilTeks(b.nama, bahasa)}</strong>
                {#if b.kuratorPilihan}
                  <span class="single-badge">{tI18n(bahasa, 'coverflow.curatorBadge')}</span>
                {/if}
              </span>
              <span class="track-subcopy">{ambilTeks(b.subjudul, bahasa)}</span>
            </span>
            <span class="track-meta-cols">
              <span class="track-meta-chip">{b.kodeArsip}</span>
              <span class="track-laras-chip">{b.larasPathet}</span>
            </span>
          </button>

          <div class="track-row-actions">
            <button
              type="button"
              class="track-suluk-btn"
              onclick={() => onBukaModalSuluk(bIdx)}
              aria-label="Suluk {ambilTeks(b.nama, bahasa)}"
            >
              {tI18n(bahasa, 'coverflow.sulukRowBtn')}
            </button>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>
