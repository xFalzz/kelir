<script lang="ts">
  import {
    ambilAksenBenda,
    type BendaPusaka,
    type ItemEtalase,
    type MatrixItem,
  } from '../../content/pusaka.ts';
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
    halamanAktif: string;
    teksSesuaiBahasa: (teksId: string, teksJw?: string) => string;
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
    halamanAktif,
    teksSesuaiBahasa,
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
    ['semua', 'Semua'],
    ['tosan-aji', 'Tosan Aji'],
    ['karawitan', 'Karawitan'],
    ['wastra', 'Wastra'],
    ['arsitektur', 'Arsitektur'],
    ['pakeliran', 'Pakeliran'],
  ];

  let ribbonEl: HTMLDivElement | undefined = $state();

  function geserRibbon(arah: -1 | 1): void {
    ribbonEl?.scrollBy({ left: arah * 320, behavior: 'smooth' });
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
  aria-label="Matriks 12 Unsur Pusaka Jawa"
  onmousemove={onWallMouseMove}
  onmouseleave={onWallMouseLeave}
>
  <div class="band-header spatial-wall-header">
    <div>
      <span class="eyebrow-mono">MATRIKS WARISAN NUSANTARA · KELIR ꦏꦼꦭꦶꦂ</span>
      <h2 class="display-h2">
        {teksSesuaiBahasa('Indeks 12 Anatomi Pusaka', 'Indeks 12 Anatomi Pusaka Jawi')}
      </h2>
    </div>
    <p class="band-lead-copy">
      {teksSesuaiBahasa(
        'Arahkan kursor untuk memiringkan bidang perspektif 3D secara halus, lalu pilih pelat unsur untuk membedah lapisannya di Studio Digital Twin atau membuka ruang kurasinya.',
        'Arahake kursor kanggo miringake bidang perspektif 3D kanthi alus, banjur pilih pelat unsur kanggo nliti lapisane.',
      )}
    </p>
  </div>

  <div
    class="spatial-grid-3d"
    style="transform: rotateX({wallTiltX}deg) rotateY({wallTiltY}deg);"
  >
    {#each matrixItems as plat}
      <button
        type="button"
        class="wall-plate"
        data-benda={plat.bendaId ?? 'aksara'}
        data-testid="matrix-{plat.id}"
        onclick={() => bukaItemSpasial(plat)}
      >
        <div class="wall-plate-top">
          <span class="wall-plate-sub">
            {plat.kodeArsip} · {plat.sub}
          </span>
          <span class="wall-plate-dot"></span>
        </div>

        <div class="wall-plate-mid">
          <span class="wall-plate-aksara" lang="jv">{plat.aksara}</span>
          <span class="wall-plate-rule"></span>
        </div>

        <div class="wall-plate-bottom">
          <div class="wall-plate-title">{plat.label}</div>
          <div class="wall-plate-spec">{plat.spesifikasi}</div>
        </div>

        <span class="wall-hover-pill">{plat.ctaLabel ?? 'Bedah 3D \u2192'}</span>
      </button>
    {/each}
  </div>
</section>

<!-- ETALASE PITA HORIZONTAL -->
<section id="etalase" class="etalase-black-section" aria-label="Etalase Horizontal Pusaka Jawa">
  <div class="etalase-header">
    <div>
      <span class="eyebrow-mono">KATALOG SPESIMEN · ARSIP KURASI KELIR</span>
      <h2 class="display-h2" style="font-size: clamp(1.9rem, 3.6vw, 2.8rem);">
        {teksSesuaiBahasa('Etalase Lapisan Budaya', 'Etalase Lapisan Budaya Jawi')}
      </h2>
    </div>
    <div class="etalase-header-actions">
      <span class="etalase-count">
        {itemEtalaseTersaring.length} SPESIMEN ARSIP
      </span>
      <div class="etalase-arrows" aria-label="Geser Etalase">
        <button
          type="button"
          class="util-pill"
          onclick={() => geserRibbon(-1)}
          aria-label="Geser Etalase ke Kiri"
        >
          &#8592;
        </button>
        <button
          type="button"
          class="util-pill"
          onclick={() => geserRibbon(1)}
          aria-label="Geser Etalase ke Kanan"
        >
          &#8594;
        </button>
      </div>
    </div>
  </div>

  <div class="wordmark-colossal" aria-hidden="true">PUSAKA JAWA</div>

  <div class="etalase-ribbon" bind:this={ribbonEl}>
    {#each itemEtalaseTersaring as item}
      <button
        type="button"
        class="etalase-card"
        data-benda={item.bendaId}
        data-testid="etalase-{item.id}"
        onclick={() => bukaItemSpasial(item)}
      >
        <div class="etalase-card-art">
          <PusakaArtwork
            bendaId={item.ikonTipe}
            accent={ambilAksenBenda(item.bendaId, tema)}
            compact={true}
            variant={tema === 'terang' ? 'paper' : 'dark'}
          />
        </div>
        <div class="etalase-card-meta">
          <div class="etalase-card-head">
            <strong>{item.judul}</strong>
            <span class="etalase-card-aksara">{item.aksara}</span>
          </div>
          <div class="etalase-card-sub">{item.subjudul}</div>
          <div class="etalase-card-domain">{item.kodeArsip} · {item.spesifikasi}</div>
        </div>
      </button>
    {/each}
  </div>

  <div class="etalase-dock">
    <div class="etalase-tabs" role="tablist" aria-label="Filter Kategori Etalase">
      {#each FILTER_TABS as [kunci, label]}
        <button
          type="button"
          class="util-pill"
          class:is-active={filterEtalase === kunci}
          onclick={() => onFilterChange(kunci)}
          data-testid="filter-{kunci}"
        >
          {label}
        </button>
      {/each}
    </div>

    <button
      type="button"
      class="explore-arrow-link"
      onclick={() => onPindahHalaman('twin')}
    >
      BUKA STUDIO DIGITAL TWIN 3D &#8594;
    </button>
  </div>
</section>

<!-- DIREKTORI 5 HALAMAN EKOSISTEM KELIR -->
<section class="band-section" aria-label="Direktori Halaman Ekosistem Kelir">
  <div class="band-header">
    <div>
      <span class="eyebrow-mono">ARSITEKTUR 5 RUANG KURASI</span>
      <h2 class="display-h2">
        {teksSesuaiBahasa('Jelajahi 5 Ruang Ekshibisi', 'Nliti 5 Papan Eksibisi')}
      </h2>
    </div>
    <p class="band-lead-copy">
      {teksSesuaiBahasa(
        'Setiap ruang dirancang sebagai galeri tematik tersendiri sehingga eksplorasi 3D berjalan fokus, ringan, dan tertata rapi.',
        'Saben papan kagiyut minangka galeri tematik dhewe supaya eksplorasi 3D lumaku resik lan fokus.',
      )}
    </p>
  </div>

  <div class="page-portal-grid">
    {#each daftarHalaman as hal}
      <button
        type="button"
        class="page-portal-card"
        class:is-current={halamanAktif === hal.id}
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
          {halamanAktif === hal.id ? 'Ruang Aktif' : 'Masuk Ruang \u2192'}
        </span>
      </button>
    {/each}
  </div>
</section>
