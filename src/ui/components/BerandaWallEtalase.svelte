<script lang="ts">
  import type { BendaPusaka, ItemEtalase } from '../../content/pusaka.ts';
  import PusakaArtwork from '../PusakaArtwork.svelte';

  export type FilterEtalase = 'semua' | 'tosan-aji' | 'karawitan' | 'wastra' | 'arsitektur' | 'pakeliran';

  interface MatrixItem {
    id: string;
    label: string;
    sub: string;
    aksara: string;
    kodeArsip: string;
    spesifikasi: string;
    bendaId: BendaPusaka['id'];
    warna: string;
    pola: 'grid' | 'gelombang' | 'cakra' | 'bilah' | 'gunungan';
  }

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
    onPilihPusaka: (id: BendaPusaka['id'], bukaTwin?: boolean) => void;
    onPindahHalaman: (id: string) => void;
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
        'Arahkan kursor untuk memiringkan bidang perspektif 3D secara halus, lalu pilih pelat unsur untuk menelaah lapisannya di Studio Digital Twin.',
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
        onclick={() => onPilihPusaka(plat.bendaId, true)}
      >
        <div class="wall-plate-top">
          <span class="wall-plate-sub" style="color: {plat.warna};">
            {plat.kodeArsip} · {plat.sub}
          </span>
          <span class="wall-plate-dot" style="background: {plat.warna};"></span>
        </div>

        <div class="wall-plate-mid">
          <span class="wall-plate-aksara" lang="jv">{plat.aksara}</span>
          <span
            class="wall-plate-rule"
            style="background: linear-gradient(90deg, {plat.warna}, transparent);"
          ></span>
        </div>

        <div class="wall-plate-bottom">
          <div class="wall-plate-title">{plat.label}</div>
          <div class="wall-plate-spec">{plat.spesifikasi}</div>
        </div>

        <span class="wall-hover-pill">Bedah 3D &#8594;</span>
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
    <span class="etalase-count">
      {itemEtalaseTersaring.length} SPESIMEN ARSIP
    </span>
  </div>

  <div class="wordmark-colossal" aria-hidden="true">PUSAKA JAWA</div>

  <div class="etalase-ribbon">
    {#each itemEtalaseTersaring as item}
      <button
        type="button"
        class="etalase-card"
        onclick={() => onPilihPusaka(item.bendaId, true)}
      >
        <div class="etalase-card-art">
          <PusakaArtwork
            bendaId={item.ikonTipe}
            accent={item.aksen}
            compact={true}
            variant={tema === 'terang' ? 'paper' : 'dark'}
          />
        </div>
        <div class="etalase-card-meta">
          <div class="etalase-card-head">
            <strong>{item.judul}</strong>
            <span style="font-family: var(--font-jawa); color: {item.aksen};">{item.aksara}</span>
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
