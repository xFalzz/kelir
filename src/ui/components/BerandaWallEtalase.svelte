<script lang="ts">
  import {
    ambilAksenBenda,
    ambilTeks,
    type BahasaAktif,
    type BendaPusaka,
    type ItemEtalase,
    type MatrixItem,
  } from '../../content/pusaka.ts';
  import { tI18n } from '../../lib/i18n.ts';
  import { pasangReveal } from '../../lib/revealAnim.ts';
  import PusakaArtwork from '../PusakaArtwork.svelte';

  export type FilterEtalase = 'semua' | 'tosan-aji' | 'karawitan' | 'wastra' | 'arsitektur' | 'pakeliran';

  interface HalamanItem {
    id: string;
    nomor: string;
    label: string;
    aksara: string;
    deskripsi: string;
  }

  interface Props {
    tema: 'malam' | 'terang';
    bahasa: BahasaAktif;
    halamanAktif: string;
    matrixItems: MatrixItem[];
    wallTiltX: number;
    wallTiltY: number;
    onWallMouseMove: (e: MouseEvent) => void;
    onWallMouseLeave: () => void;
    filterEtalase: FilterEtalase;
    onFilterChange: (kunci: FilterEtalase) => void;
    itemEtalaseTersaring: ItemEtalase[];
    daftarHalaman: HalamanItem[];
    onPilihPusaka: (id: BendaPusaka['id'], bukaTwin?: boolean, targetTitikId?: string) => void;
    onPindahHalaman: (id: string, anchorId?: string) => void;
  }

  let {
    tema,
    bahasa,
    halamanAktif,
    matrixItems,
    wallTiltX,
    wallTiltY,
    onWallMouseMove,
    onWallMouseLeave,
    filterEtalase,
    onFilterChange,
    itemEtalaseTersaring,
    daftarHalaman,
    onPilihPusaka,
    onPindahHalaman,
  }: Props = $props();

  const FILTER_TABS: Array<[FilterEtalase, string]> = [
    ['semua', 'beranda.filterAll'],
    ['tosan-aji', 'beranda.filterTosan'],
    ['karawitan', 'beranda.filterKarawitan'],
    ['wastra', 'beranda.filterWastra'],
    ['arsitektur', 'beranda.filterArsitektur'],
    ['pakeliran', 'beranda.filterPakeliran'],
  ];

  let ribbonEl: HTMLDivElement | undefined = $state();
  let etalaseSectionEl: HTMLElement | undefined = $state();
  let etalaseDekatViewport = $state(false);
  let etalaseSnapshots: Record<string, string> = $state({});
  let draggingUi = $state(false);
  let lastDragEndMs = 0;

  $effect(() => {
    const node = etalaseSectionEl;
    if (!node || typeof IntersectionObserver === 'undefined') {
      etalaseDekatViewport = true;
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            etalaseDekatViewport = true;
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: '180px 0px' },
    );
    io.observe(node);
    return () => io.disconnect();
  });

  $effect(() => {
    const temaAktif = tema;
    if (!etalaseDekatViewport || typeof window === 'undefined') return;
    let dibatalkan = false;

    void import('../../scenes/etalaseSnapshotRenderer.ts').then(({ renderEtalaseSnapshots }) =>
      renderEtalaseSnapshots(temaAktif).then((map) => {
        if (!dibatalkan && Object.keys(map).length > 0) {
          etalaseSnapshots = map;
        }
      }),
    );

    return () => {
      dibatalkan = true;
    };
  });

  function geserRibbon(arah: -1 | 1): void {
    if (!ribbonEl) return;
    ribbonEl.style.scrollSnapType = 'x proximity';
    ribbonEl.style.scrollBehavior = 'smooth';
    ribbonEl.scrollBy({ left: arah * 320, behavior: 'smooth' });
  }

  function pasangInteraksiRibbon(node: HTMLElement) {
    let rafId: number | null = null;
    let currentX = node.scrollLeft;
    let targetX = node.scrollLeft;
    let lastMs = 0;

    let isPointerDown = false;
    let dragStartX = 0;
    let dragStartScroll = 0;
    let movedPx = 0;

    const stopRaf = () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const tickHoriz = (now: number) => {
      const dt = lastMs > 0 ? Math.min(Math.max((now - lastMs) / 1000, 0.001), 0.05) : 1 / 60;
      lastMs = now;
      const maxScroll = Math.max(0, node.scrollWidth - node.clientWidth);
      targetX = Math.max(0, Math.min(maxScroll, targetX));

      if (Math.abs(targetX - currentX) <= 0.4) {
        currentX = targetX;
        node.scrollLeft = currentX;
        rafId = null;
        return;
      }

      const alpha = 1 - Math.exp(-12.5 * dt);
      currentX += (targetX - currentX) * alpha;
      node.scrollLeft = currentX;
      rafId = window.requestAnimationFrame(tickHoriz);
    };

    const ensureRaf = () => {
      if (rafId !== null) return;
      lastMs = 0;
      rafId = window.requestAnimationFrame(tickHoriz);
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) return;
      const maxScroll = node.scrollWidth - node.clientWidth;
      if (maxScroll <= 2) return;

      const raw = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(raw) < 0.1) return;

      let px = raw;
      if (e.deltaMode === 1) px = raw * 36;
      else if (e.deltaMode === 2) px = raw * Math.max(node.clientWidth * 0.75, 280);
      px = Math.max(-360, Math.min(360, px));

      const keKanan = px > 0;
      const masihBisa = keKanan ? node.scrollLeft < maxScroll - 2 : node.scrollLeft > 2;
      const sedangInersia = rafId !== null && Math.abs(targetX - currentX) > 2;

      if (!masihBisa && Math.abs(e.deltaX) <= 2 && !sedangInersia) {
        return;
      }

      e.preventDefault();
      node.style.scrollBehavior = 'auto';
      node.style.scrollSnapType = 'none';
      if (rafId === null) {
        currentX = node.scrollLeft;
        targetX = node.scrollLeft;
      }
      targetX = Math.max(0, Math.min(maxScroll, targetX + px * 1.15));
      ensureRaf();
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      stopRaf();
      isPointerDown = true;
      dragStartX = e.clientX;
      dragStartScroll = node.scrollLeft;
      movedPx = 0;
      node.style.scrollBehavior = 'auto';
      node.style.scrollSnapType = 'none';
    };

    const onWindowPointerMove = (e: PointerEvent) => {
      if (!isPointerDown) return;
      const dx = e.clientX - dragStartX;
      movedPx = Math.max(movedPx, Math.abs(dx));
      if (movedPx > 4) {
        draggingUi = true;
        node.scrollLeft = dragStartScroll - dx;
        currentX = node.scrollLeft;
        targetX = node.scrollLeft;
      }
    };

    const finishDrag = () => {
      if (!isPointerDown) return;
      isPointerDown = false;
      draggingUi = false;
      if (movedPx > 6) {
        lastDragEndMs = performance.now();
      }
    };

    node.addEventListener('wheel', onWheel, { passive: false });
    node.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onWindowPointerMove);
    window.addEventListener('pointerup', finishDrag);
    window.addEventListener('pointercancel', finishDrag);

    return {
      destroy() {
        stopRaf();
        node.removeEventListener('wheel', onWheel);
        node.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointermove', onWindowPointerMove);
        window.removeEventListener('pointerup', finishDrag);
        window.removeEventListener('pointercancel', finishDrag);
      },
    };
  }

  /** Mengarahkan pelat indeks atau spesimen etalase ke pin Bedah 3D atau ruang kurasi terkait. */
  function bukaItemSpasial(target: {
    bendaId?: BendaPusaka['id'];
    titikId?: string;
    halamanTarget?: 'twin' | 'pakeliran' | 'kawruh';
    anchorTarget?: string;
  }): void {
    if (target.halamanTarget && target.halamanTarget !== 'twin') {
      onPindahHalaman(target.halamanTarget, target.anchorTarget);
      return;
    }
    if (target.bendaId) {
      onPilihPusaka(target.bendaId, true, target.titikId);
    }
  }
</script>

<!-- MATRIKS ARSIP 12 UNSUR SPASIAL -->
<section
  id="dinding-ruang"
  class="spatial-wall-section"
  aria-label={tI18n(bahasa, 'beranda.matrixTitle')}
  onmousemove={onWallMouseMove}
  onmouseleave={onWallMouseLeave}
>
  <div class="band-header spatial-wall-header">
    <div>
      <span class="eyebrow-mono">{tI18n(bahasa, 'beranda.matrixEyebrow')}</span>
      <h2 class="display-h2">
        {tI18n(bahasa, 'beranda.matrixTitle')}
      </h2>
    </div>
    <p class="band-lead-copy">
      {tI18n(bahasa, 'beranda.matrixLead')}
    </p>
  </div>

  <div
    class="spatial-grid-3d"
    style="transform: rotateX({wallTiltX}deg) rotateY({wallTiltY}deg);"
  >
    {#each matrixItems as plat, i}
      <button
        type="button"
        class="wall-plate"
        data-benda={plat.bendaId ?? 'aksara'}
        data-testid="matrix-{plat.id}"
        use:pasangReveal={i}
        onclick={() => bukaItemSpasial(plat)}
      >
        <div class="wall-plate-top">
          <span class="wall-plate-sub">
            {plat.kodeArsip} · {ambilTeks(plat.sub, bahasa)}
          </span>
          <span class="wall-plate-dot"></span>
        </div>

        <div class="wall-plate-mid">
          <span class="wall-plate-aksara" lang="jv">{plat.aksara}</span>
          <span class="wall-plate-rule"></span>
        </div>

        <div class="wall-plate-bottom">
          <div class="wall-plate-title">{ambilTeks(plat.label, bahasa)}</div>
          <div class="wall-plate-spec">{ambilTeks(plat.spesifikasi, bahasa)}</div>
        </div>

        <span class="wall-hover-pill">
          {plat.ctaLabel ? ambilTeks(plat.ctaLabel, bahasa) : 'Bedah 3D →'}
        </span>
      </button>
    {/each}
  </div>
</section>

<!-- ETALASE PITA HORIZONTAL -->
<section
  id="etalase"
  class="etalase-black-section"
  bind:this={etalaseSectionEl}
  aria-label={tI18n(bahasa, 'beranda.etalaseTitle')}
>
  <div class="etalase-header">
    <div>
      <span class="eyebrow-mono">{tI18n(bahasa, 'beranda.etalaseEyebrow')}</span>
      <h2 class="display-h2" style="font-size: clamp(1.9rem, 3.6vw, 2.8rem);">
        {tI18n(bahasa, 'beranda.etalaseTitle')}
      </h2>
    </div>
    <div class="etalase-header-actions">
      <span class="etalase-count">
        {tI18n(bahasa, 'beranda.etalaseCount', { count: itemEtalaseTersaring.length })}
      </span>
      <div class="etalase-arrows" aria-label="Geser Etalase">
        <button
          type="button"
          class="util-pill"
          onclick={() => geserRibbon(-1)}
          aria-label="Scroll Left"
        >
          &#8592;
        </button>
        <button
          type="button"
          class="util-pill"
          onclick={() => geserRibbon(1)}
          aria-label="Scroll Right"
        >
          &#8594;
        </button>
      </div>
    </div>
  </div>

  <div class="wordmark-colossal" aria-hidden="true">{tI18n(bahasa, 'beranda.etalaseWatermark')}</div>

  <div
    class="etalase-ribbon"
    class:is-dragging={draggingUi}
    bind:this={ribbonEl}
    use:pasangInteraksiRibbon
  >
    {#each itemEtalaseTersaring as item, i}
      <button
        type="button"
        class="etalase-card"
        data-benda={item.bendaId}
        data-testid="etalase-{item.id}"
        use:pasangReveal={i}
        onclick={() => {
          if (performance.now() - lastDragEndMs < 160) return;
          bukaItemSpasial(item);
        }}
      >
        <div class="etalase-card-art">
          <PusakaArtwork
            bendaId={item.ikonTipe}
            itemId={item.id}
            accent={ambilAksenBenda(item.bendaId, tema)}
            compact={true}
            variant={tema === 'terang' ? 'paper' : 'dark'}
          />
          {#if etalaseSnapshots[item.id]}
            <img
              class="etalase-snapshot-img"
              src={etalaseSnapshots[item.id]}
              alt={ambilTeks(item.judul, bahasa)}
              draggable="false"
            />
          {/if}
        </div>
        <div class="etalase-card-meta">
          <div class="etalase-card-head">
            <strong>{ambilTeks(item.judul, bahasa)}</strong>
            <span class="etalase-card-aksara">{item.aksara}</span>
          </div>
          <div class="etalase-card-sub">{ambilTeks(item.subjudul, bahasa)}</div>
          <div class="etalase-card-domain">{item.kodeArsip} · {ambilTeks(item.spesifikasi, bahasa)}</div>
        </div>
      </button>
    {/each}
  </div>

  <div class="etalase-dock">
    <div class="etalase-tabs" role="tablist" aria-label={tI18n(bahasa, 'beranda.etalaseTitle')}>
      {#each FILTER_TABS as [kunci, labelKey]}
        <button
          type="button"
          class="util-pill"
          class:is-active={filterEtalase === kunci}
          onclick={() => onFilterChange(kunci)}
          data-testid="filter-{kunci}"
        >
          {tI18n(bahasa, labelKey)}
        </button>
      {/each}
    </div>

    <button
      type="button"
      class="explore-arrow-link"
      onclick={() => onPindahHalaman('twin')}
    >
      {tI18n(bahasa, 'beranda.etalaseCta')}
    </button>
  </div>
</section>

<!-- DIREKTORI 5 HALAMAN EKOSISTEM KELIR -->
<section class="band-section" aria-label={tI18n(bahasa, 'beranda.dirTitle')}>
  <div class="band-header">
    <div>
      <span class="eyebrow-mono">{tI18n(bahasa, 'beranda.dirEyebrow')}</span>
      <h2 class="display-h2">
        {tI18n(bahasa, 'beranda.dirTitle')}
      </h2>
    </div>
    <p class="band-lead-copy">
      {tI18n(bahasa, 'beranda.dirLead')}
    </p>
  </div>

  <div class="page-portal-grid">
    {#each daftarHalaman as hal, i}
      <button
        type="button"
        class="page-portal-card"
        class:is-current={halamanAktif === hal.id}
        use:pasangReveal={i}
        onclick={() => onPindahHalaman(hal.id)}
      >
        <div>
          <div class="page-portal-top">
            <span class="eyebrow-mono">HAL {hal.nomor}</span>
            <span class="portal-aksara" lang="jv">{hal.aksara}</span>
          </div>
          <h3 class="portal-title">{hal.label}</h3>
          <p class="portal-desc">{hal.deskripsi}</p>
        </div>
        <span class="page-portal-cta">
          {halamanAktif === hal.id ? tI18n(bahasa, 'beranda.roomActive') : tI18n(bahasa, 'beranda.roomEnter')}
        </span>
      </button>
    {/each}
  </div>
</section>
