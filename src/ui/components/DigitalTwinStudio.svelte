<script lang="ts">
  import { onMount } from 'svelte';
  import {
    DAFTAR_SUMBER,
    ambilAksenBenda,
    ambilTeks,
    type BahasaAktif,
    type BendaPusaka,
    type MultiTeks,
    type SpesimenBedahId,
    type SpesimenBedahTwin,
    type TitikInfoPusaka,
  } from '../../content/pusaka.ts';
  import { tI18n } from '../../lib/i18n.ts';
  import { NADA_SARON_SLENDRO } from '../../lib/audioBudaya.ts';
  import WebGLStatusBanner from './WebGLStatusBanner.svelte';
  import { tanyakanKeAsisten, type HasilTanya } from '../../lib/tanya.ts';
  import type { ModeVisualTwin, ProyeksiPinTwin } from '../../scenes/digitalTwinStage.ts';

  interface KeunggulanItem {
    nomor: string;
    judul: MultiTeks;
    teks: MultiTeks;
  }

  interface PilarItem {
    nomor: string;
    sorot: MultiTeks;
    judul: MultiTeks;
    teks: MultiTeks;
  }

  interface Props {
    specimens: SpesimenBedahTwin[];
    bendaAktifId: SpesimenBedahId;
    bendaAktif: SpesimenBedahTwin;
    titikAktifId: string;
    titikAktif: TitikInfoPusaka;
    modeVisualTwin: ModeVisualTwin;
    faktorLedak: number;
    aksiHidupTwin: boolean;
    twinPins: ProyeksiPinTwin[];
    tema: 'malam' | 'terang';
    bahasa: BahasaAktif;
    keunggulan: KeunggulanItem[];
    pilar: PilarItem[];
    mountStage: (node: HTMLDivElement) => { destroy?: () => void };
    onPilihPusaka: (id: SpesimenBedahId) => void;
    onResetKamera: () => void;
    onPilihTitik: (t: TitikInfoPusaka) => void;
    onModeVisual: (mode: ModeVisualTwin) => void;
    onUbahLedak: (nilai: number) => void;
    onPicuEfek: () => void;
    onToggleAksiHidup: () => void;
    onBunyikanWilah: (idx: number) => void;
    onBukaSulukSpesimen: (id: SpesimenBedahId) => void;
    isFavorit: boolean;
    onToggleFavorit: () => void;
    onTangkapPotret: () => string | null;
    onPindahHalaman: (halaman: 'koleksi' | 'pakeliran' | 'kawruh', anchor?: string) => void;
    onScrollProgres: (progres: number) => void;
    statusKamera?: 'nonaktif' | 'memuat' | 'aktif' | 'ditolak' | 'tidak-didukung';
    saronHoverIdx?: number | null;
    saronStruckIdx?: number | null;
    onToggleKamera?: () => void;
  }

  let {
    specimens,
    bendaAktifId,
    bendaAktif,
    titikAktifId,
    titikAktif,
    modeVisualTwin,
    faktorLedak,
    aksiHidupTwin,
    twinPins,
    tema,
    bahasa,
    keunggulan,
    pilar,
    mountStage,
    onPilihPusaka,
    onResetKamera,
    onPilihTitik,
    onModeVisual,
    onUbahLedak,
    onPicuEfek,
    onToggleAksiHidup,
    onBunyikanWilah,
    onBukaSulukSpesimen,
    isFavorit,
    onToggleFavorit,
    onTangkapPotret,
    onPindahHalaman,
    onScrollProgres,
    statusKamera = 'nonaktif',
    saronHoverIdx = null,
    saronStruckIdx = null,
    onToggleKamera,
  }: Props = $props();

  let sectionEl: HTMLElement | undefined = $state();
  let scrollProgress = $state(0);
  let stageRetrySeq = $state(0);
  let visibleBlocks: Record<string, boolean> = $state({
    workspace: true,
    engineering: false,
    pillars: false,
  });

  let aksenAktif = $derived(ambilAksenBenda(bendaAktif.id, tema));
  let titikAktifIdx = $derived(
    Math.max(
      0,
      bendaAktif.titikInfo.findIndex((t) => t.id === titikAktif.id),
    ),
  );

  onMount(() => {
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      visibleBlocks = { workspace: true, engineering: true, pillars: true };
    }

    let rafPending = false;
    const perbaruiScroll = () => {
      rafPending = false;
      if (!sectionEl) return;
      const rect = sectionEl.getBoundingClientRect();
      const vh = Math.max(window.innerHeight, 480);
      const maxTravel = Math.max(sectionEl.scrollHeight - vh * 0.55, 360);
      const p = Math.min(1, Math.max(0, -rect.top / maxTravel));
      if (Math.abs(p - scrollProgress) >= 0.001) {
        scrollProgress = p;
        onScrollProgres(p);
      }
    };

    const onScroll = () => {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(perbaruiScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    perbaruiScroll();

    let io: IntersectionObserver | null = null;
    if (!reduceMotion && sectionEl) {
      const blocks = sectionEl.querySelectorAll<HTMLElement>('[data-twin-reveal]');
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              const key = entry.target.getAttribute('data-twin-reveal');
              if (key) visibleBlocks = { ...visibleBlocks, [key]: true };
            }
          }
        },
        { threshold: 0.12, rootMargin: '0px 0px -24px 0px' },
      );
      blocks.forEach((b) => io?.observe(b));
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      io?.disconnect();
    };
  });

  let turOtomatisAktif = $state(false);
  let tautanTersalin = $state(false);
  let potretTersimpan = $state(false);
  let salinTimer: ReturnType<typeof setTimeout> | null = null;
  let potretTimer: ReturnType<typeof setTimeout> | null = null;
  let partAiQuery = $state('');
  let partAiBusy = $state(false);
  let partAiResult: HasilTanya | null = $state(null);

  $effect(() => {
    const _bId = bendaAktif.id;
    const _tId = titikAktif.id;
    const _lang = bahasa;
    partAiResult = null;
    partAiQuery = '';
    void _bId;
    void _tId;
    void _lang;
  });

  async function tanyaKuratorUnsur(e?: SubmitEvent): Promise<void> {
    if (e) e.preventDefault();
    const namaBenda = ambilTeks(bendaAktif.nama, bahasa);
    const judulPart = ambilTeks(titikAktif.judul, bahasa);
    const kueri = partAiQuery.trim() || `${namaBenda} ${judulPart}`;
    const targetBendaId: BendaPusaka['id'] =
      bendaAktif.id === 'kidang'
        ? 'wayang'
        : bendaAktif.id === 'saron' ||
            bendaAktif.id === 'batik' ||
            bendaAktif.id === 'joglo' ||
            bendaAktif.id === 'wayang'
          ? bendaAktif.id
          : 'keris';
    partAiBusy = true;
    partAiResult = await tanyakanKeAsisten(targetBendaId, kueri, bahasa, {
      judulUnsur: judulPart,
      material: titikAktif.material ? ambilTeks(titikAktif.material, bahasa) : undefined,
      fungsiTeknis: titikAktif.fungsiTeknis
        ? ambilTeks(titikAktif.fungsiTeknis, bahasa)
        : undefined,
      ringkasan: ambilTeks(titikAktif.ringkasan, bahasa),
    });
    partAiBusy = false;
  }

  function simpanPotret3D(): void {
    const dataUrl = onTangkapPotret();
    if (!dataUrl || typeof document === 'undefined') return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `kelir-3d-${bendaAktif.id}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    potretTersimpan = true;
    if (potretTimer) clearTimeout(potretTimer);
    potretTimer = setTimeout(() => {
      potretTersimpan = false;
    }, 1800);
  }

  $effect(() => {
    const _aktif = bendaAktif.id;
    if (!turOtomatisAktif || typeof window === 'undefined') return;
    const timer = window.setInterval(() => {
      geserTurAnatomi(1);
    }, 4200);
    return () => {
      window.clearInterval(timer);
      if (salinTimer) clearTimeout(salinTimer);
      void _aktif;
    };
  });

  function toggleTurOtomatis(): void {
    turOtomatisAktif = !turOtomatisAktif;
    if (turOtomatisAktif) geserTurAnatomi(1);
  }

  async function salinTautanSpesimen(): Promise<void> {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set('hal', 'twin');
    url.searchParams.set('benda', bendaAktif.id);
    url.searchParams.set('titik', titikAktif.id);
    try {
      await navigator.clipboard?.writeText(url.toString());
      tautanTersalin = true;
      if (salinTimer) clearTimeout(salinTimer);
      salinTimer = setTimeout(() => {
        tautanTersalin = false;
      }, 1800);
    } catch {
      tautanTersalin = false;
    }
  }

  function unduhDossierSpesimen(): void {
    if (typeof document === 'undefined') return;
    const payload = {
      kode: bendaAktif.nomorUrut,
      id: bendaAktif.id,
      nama: ambilTeks(bendaAktif.nama, bahasa),
      subjudul: ambilTeks(bendaAktif.subjudul, bahasa),
      kategori: ambilTeks(bendaAktif.kategori, bahasa),
      asal: ambilTeks(bendaAktif.asal, bahasa),
      filosofi: ambilTeks(bendaAktif.filosofi, bahasa),
      sejarahSingkat: ambilTeks(bendaAktif.sejarahSingkat, bahasa),
      parameterCad: (bendaAktif.parameterCad ?? []).map((p) => ({
        label: ambilTeks(p.label, bahasa),
        nilai: ambilTeks(p.nilai, bahasa),
      })),
      titikAnatomi: bendaAktif.titikInfo.map((t) => ({
        id: t.id,
        judul: ambilTeks(t.judul, bahasa),
        material: t.material ? ambilTeks(t.material, bahasa) : undefined,
        fungsiTeknis: t.fungsiTeknis ? ambilTeks(t.fungsiTeknis, bahasa) : undefined,
        ringkasan: ambilTeks(t.ringkasan, bahasa),
        sumber: t.sumber,
      })),
      sumber: bendaAktif.sumber,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = `kelir-dossier-${bendaAktif.id}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
  }

  function geserTurAnatomi(delta: number): void {
    const daftar = bendaAktif.titikInfo;
    if (!daftar.length) return;
    const nextIdx = ((titikAktifIdx + delta) % daftar.length + daftar.length) % daftar.length;
    onPilihTitik(daftar[nextIdx]);
  }
</script>

<section
  id="digital-twin"
  bind:this={sectionEl}
  class="band-section twin-band-section"
  aria-label={tI18n(bahasa, 'twin.h1')}
  style="--twin-scroll: {scrollProgress.toFixed(4)}; --twin-accent: {aksenAktif};"
>
  <div class="band-header twin-band-header">
    <div>
      <span class="eyebrow-mono">{tI18n(bahasa, 'twin.eyebrow', { count: specimens.length })}</span>
      <h1 class="display-h2">
        {tI18n(bahasa, 'twin.h1')}
      </h1>
    </div>

    <div class="artifact-tab-row" role="tablist" aria-label={tI18n(bahasa, 'twin.h1')}>
      {#each specimens as b}
        <button
          type="button"
          role="tab"
          aria-selected={bendaAktifId === b.id}
          class="tab-chip"
          class:is-active={bendaAktifId === b.id}
          onclick={() => onPilihPusaka(b.id)}
          data-testid="tab-{b.id}"
        >
          {b.nomorUrut} · {ambilTeks(b.nama, bahasa)}
        </button>
      {/each}
    </div>
  </div>

  <div class="twin-workspace">
    <!-- Kolom Kiri Sticky: Kanvas WebGL CAD + Pin Real-Time + Bilah Mode & Ledak -->
    <div class="twin-viewport-col">
      <div class="twin-viewport-card">
        <div class="twin-canvas-host" data-wheel-native="true">
        {#key stageRetrySeq}
          <div class="twin-webgl-inner" use:mountStage></div>
        {/key}
        <WebGLStatusBanner {bahasa} onRetry={() => (stageRetrySeq += 1)} />
          <div class="twin-viewport-hud">
            <div class="twin-hud-badges">
              <span class="twin-viewport-spec">
                {tI18n(bahasa, 'twin.hudMode', {
                  nomor: bendaAktif.nomorUrut,
                  total: specimens.length,
                  mode: modeVisualTwin.toUpperCase(),
                  explode: Math.round(faktorLedak * 100),
                })}
              </span>
              <span class="twin-viewport-spec">{tI18n(bahasa, 'twin.hudOrbit')}</span>
            </div>
            <div class="twin-hud-actions">
              <button
                type="button"
                class="util-pill"
                onclick={() => onUbahLedak(faktorLedak > 0.45 ? 0 : 0.78)}
                data-testid="twin-quick-explode"
              >
                {faktorLedak > 0.45
                  ? tI18n(bahasa, 'twin.quickAssemble')
                  : tI18n(bahasa, 'twin.quickExplode')}
              </button>
              <button
                type="button"
                class="util-pill"
                onclick={onResetKamera}
                aria-label={tI18n(bahasa, 'twin.resetView')}
              >
                {tI18n(bahasa, 'twin.resetView')}
              </button>
            </div>
          </div>

          <div class="twin-pins-overlay">
            {#each twinPins as pin, pIdx}
              {@const t = bendaAktif.titikInfo.find((item) => item.id === pin.id)}
              {#if t && pin.terlihat}
                <button
                  type="button"
                  class="twin-pin"
                  class:is-active={titikAktifId === t.id}
                  style="left: {pin.x}px; top: {pin.y}px;"
                  onclick={() => onPilihTitik(t)}
                  aria-label="{pIdx + 1} - Anatomi {ambilTeks(t.judul, bahasa)}"
                  title={ambilTeks(t.judul, bahasa)}
                >
                  {pIdx + 1}
                </button>
              {/if}
            {/each}
          </div>
        </div>

        <div class="twin-controls-bar">
          <div class="mode-switch-group" role="group" aria-label="Mode Render 3D">
            <button
              type="button"
              class="mode-btn"
              class:is-active={modeVisualTwin === 'pbr'}
              onclick={() => onModeVisual('pbr')}
            >
              {tI18n(bahasa, 'twin.modePbr')}
            </button>
            <button
              type="button"
              class="mode-btn"
              class:is-active={modeVisualTwin === 'hibrida'}
              onclick={() => onModeVisual('hibrida')}
            >
              {tI18n(bahasa, 'twin.modeHybrid')}
            </button>
            <button
              type="button"
              class="mode-btn"
              class:is-active={modeVisualTwin === 'kawat'}
              onclick={() => onModeVisual('kawat')}
              data-testid="toggle-xray"
            >
              {tI18n(bahasa, 'twin.modeWireframe')}
            </button>
          </div>

          <label class="explode-slider-wrap">
            <span>{tI18n(bahasa, 'twin.explodeSlider', { pct: Math.round(faktorLedak * 100) })}</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={faktorLedak}
              aria-valuetext={`${Math.round(faktorLedak * 100)}%`}
              oninput={(e) => onUbahLedak(Number((e.currentTarget as HTMLInputElement).value))}
              data-testid="slider-ledak"
            />
          </label>

          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button type="button" class="util-pill" onclick={onPicuEfek}>
              {tI18n(bahasa, 'twin.playEffect')}
            </button>
            <button
              type="button"
              class="util-pill"
              class:is-active={aksiHidupTwin}
              onclick={onToggleAksiHidup}
            >
              {aksiHidupTwin ? tI18n(bahasa, 'twin.autoRotateOn') : tI18n(bahasa, 'twin.autoRotateOff')}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Kolom Kanan: Inspektor Kurasi, Metrologi CAD, Bedah Komponen Aktif & Daftar Unsur -->
    <aside class="twin-inspector-panel">
      <div>
        <div class="twin-inspector-toprow">
          <span class="eyebrow-mono">{bendaAktif.zonaKode} · {ambilTeks(bendaAktif.asal, bahasa)}</span>
          {#if bendaAktif.aksara}
            <span class="twin-aksara-mark" lang="jv" aria-hidden="true">{bendaAktif.aksara}</span>
          {/if}
        </div>
        <h2 style="margin: 8px 0 6px; font-family: var(--font-display); font-size: clamp(1.55rem, 2.5vw, 1.92rem);">
          {ambilTeks(bendaAktif.nama, bahasa)}
        </h2>
        <p style="margin: 0; font-size: 0.9rem; color: var(--text-secondary); line-height: 1.56;">
          {ambilTeks(bendaAktif.sejarahSingkat, bahasa)}
        </p>
        <div class="twin-source-chips">
          {#each bendaAktif.sumber as sKode}
            <span class="source-pill" title={DAFTAR_SUMBER[sKode].judul}>
              {sKode} · {DAFTAR_SUMBER[sKode].lembaga}
            </span>
          {/each}
        </div>
      </div>

      <div class="twin-meta-strip" aria-label={tI18n(bahasa, 'twin.h1')}>
        {#each bendaAktif.spesifikasiKurasi as spek}
          <div class="twin-meta-cell">
            <span>{ambilTeks(spek.label, bahasa)}</span>
            <strong>{ambilTeks(spek.nilai, bahasa)}</strong>
          </div>
        {/each}
      </div>

      {#if bendaAktif.parameterCad && bendaAktif.parameterCad.length > 0}
        <div class="twin-cad-strip" aria-label={tI18n(bahasa, 'twin.engEyebrow')}>
          {#each bendaAktif.parameterCad as cad}
            <div class="twin-meta-cell">
              <span>{ambilTeks(cad.label, bahasa)}</span>
              <strong>{ambilTeks(cad.nilai, bahasa)}</strong>
            </div>
          {/each}
        </div>
      {/if}

      <!-- Kartu Fokus Komponen Aktif + Navigasi Tur Anatomi -->
      <div class="twin-active-part-card" data-testid="twin-active-part-card">
        <div class="twin-active-part-head">
          <div class="eyebrow-mono">
            {tI18n(bahasa, 'twin.partBadge', {
              idx: titikAktifIdx + 1,
              total: bendaAktif.titikInfo.length,
              src: titikAktif.sumber.join(', '),
            })}
          </div>
          <div class="twin-tour-btns">
            <button
              type="button"
              class="util-pill"
              class:is-active={turOtomatisAktif}
              onclick={toggleTurOtomatis}
              data-testid="twin-auto-tour-btn"
            >
              {turOtomatisAktif ? tI18n(bahasa, 'twin.autoTourStop') : tI18n(bahasa, 'twin.autoTourStart')}
            </button>
            <button
              type="button"
              class="util-pill"
              onclick={() => {
                turOtomatisAktif = false;
                geserTurAnatomi(-1);
              }}
              aria-label="Unsur Anatomi Sebelumnya"
            >
              &#8592;
            </button>
            <button
              type="button"
              class="util-pill"
              onclick={() => {
                turOtomatisAktif = false;
                geserTurAnatomi(1);
              }}
              aria-label="Unsur Anatomi Berikutnya"
            >
              &#8594;
            </button>
          </div>
        </div>
        <h3 class="twin-active-part-title">
          {ambilTeks(titikAktif.judul, bahasa)}
        </h3>
        <p class="twin-active-part-desc">
          {ambilTeks(titikAktif.ringkasan, bahasa)}
        </p>
        {#if titikAktif.material || titikAktif.fungsiTeknis}
          <div class="twin-active-part-specs">
            {#if titikAktif.material}
              <div class="twin-part-spec-row">
                <span>{tI18n(bahasa, 'twin.materialLabel')}</span>
                <strong>{ambilTeks(titikAktif.material, bahasa)}</strong>
              </div>
            {/if}
            {#if titikAktif.fungsiTeknis}
              <div class="twin-part-spec-row">
                <span>{tI18n(bahasa, 'twin.funcLabel')}</span>
                <strong>{ambilTeks(titikAktif.fungsiTeknis, bahasa)}</strong>
              </div>
            {/if}
          </div>
        {/if}

        <div class="twin-part-ai-box">
          <div class="twin-part-ai-head">
            <span class="eyebrow-mono">{tI18n(bahasa, 'twin.partAiTitle')}</span>
            <button
              type="button"
              class="util-pill"
              disabled={partAiBusy}
              onclick={() => void tanyaKuratorUnsur()}
              data-testid="twin-ask-part-ai-btn"
            >
              {partAiBusy ? tI18n(bahasa, 'twin.partAiLoading') : tI18n(bahasa, 'twin.partAiQuick')}
            </button>
          </div>
          <form onsubmit={(e) => void tanyaKuratorUnsur(e)} class="twin-part-ai-form">
            <input
              type="text"
              maxlength="240"
              class="pamomong-query-input twin-part-ai-input"
              bind:value={partAiQuery}
              placeholder={tI18n(bahasa, 'twin.partAiPlaceholder')}
              data-testid="twin-part-ai-input"
            />
            <button type="submit" class="util-pill" disabled={partAiBusy}>
              {tI18n(bahasa, 'twin.partAiSubmit')}
            </button>
          </form>
          {#if partAiResult}
            <div class="twin-part-ai-answer" data-testid="twin-part-ai-result">
              <div class="rag-telemetry-bar">
                <span
                  class="rag-status-tag"
                  class:is-abstain={partAiResult.statusGrounding === 'luar-korpus'}
                >
                  {partAiResult.statusGrounding === 'luar-korpus'
                    ? tI18n(bahasa, 'kawruh.statusAbstain')
                    : partAiResult.statusGrounding === 'eksplorasi-nusantara'
                      ? partAiResult.mode === 'pamomong-live'
                        ? tI18n(bahasa, 'kawruh.statusNusantaraGemini')
                        : tI18n(bahasa, 'kawruh.statusNusantaraOffline')
                      : partAiResult.mode === 'pamomong-live'
                        ? tI18n(bahasa, 'kawruh.statusGemini')
                        : tI18n(bahasa, 'kawruh.statusVerified')}
                </span>
                <span class="rag-model-pill">{partAiResult.modelNama}</span>
              </div>
              {#each partAiResult.jawaban.split('\n\n').filter(Boolean) as paragraf}
                <p class="twin-part-ai-copy">{paragraf}</p>
              {/each}
            </div>
          {/if}
        </div>
      </div>

      <!-- Daftar Seluruh Unsur Anatomi -->
      <div>
        <div class="eyebrow-mono" style="margin-bottom: 8px;">
          {tI18n(bahasa, 'twin.anatomyMap', { count: bendaAktif.titikInfo.length })}
        </div>
        <div class="titik-list">
          {#each bendaAktif.titikInfo as t, idx}
            <button
              type="button"
              class="titik-btn"
              class:is-active={titikAktifId === t.id}
              onclick={() => onPilihTitik(t)}
              data-testid="titik-{t.id}"
            >
              <div class="titik-btn-head">
                <span>0{idx + 1} · {ambilTeks(t.judul, bahasa)}</span>
                <span class="source-badge">{t.sumber.join(', ')}</span>
              </div>
              {#if t.material}
                <div class="titik-btn-mat">{ambilTeks(t.material, bahasa)}</div>
              {/if}
              <div style="font-size: 0.81rem; color: var(--text-secondary);">
                {ambilTeks(t.ringkasan, bahasa)}
              </div>
            </button>
          {/each}
        </div>
      </div>

      {#if bendaAktif.id === 'saron'}
        <div class="saron-play-deck" data-testid="saron-play-deck">
          <div class="saron-play-head">
            <span class="eyebrow-mono">{tI18n(bahasa, 'twin.saronKeys')}</span>
            {#if onToggleKamera}
              <button
                type="button"
                class="util-pill"
                class:is-active={statusKamera === 'aktif'}
                onclick={onToggleKamera}
                data-testid="twin-saron-gesture-btn"
                aria-pressed={statusKamera === 'aktif'}
              >
                {statusKamera === 'aktif'
                  ? tI18n(bahasa, 'twin.saronGestureStop')
                  : tI18n(bahasa, 'twin.saronGestureStart')}
              </button>
            {/if}
          </div>

          {#if statusKamera === 'aktif'}
            <div class="saron-gesture-status" data-testid="saron-gesture-status">
              <span>{tI18n(bahasa, 'twin.saronGestureHint')}</span>
              {#if saronHoverIdx !== null && NADA_SARON_SLENDRO[saronHoverIdx]}
                <strong class="saron-active-note">
                  {tI18n(bahasa, 'twin.saronActiveKey', {
                    key: NADA_SARON_SLENDRO[saronHoverIdx].angka,
                  })}
                  · {NADA_SARON_SLENDRO[saronHoverIdx].namaJawa}
                </strong>
              {/if}
            </div>
          {:else if statusKamera === 'ditolak' || statusKamera === 'tidak-didukung'}
            <p class="saron-gesture-warn">{tI18n(bahasa, 'twin.saronGestureDenied')}</p>
          {/if}

          <div class="saron-keys-bar">
            {#each NADA_SARON_SLENDRO as nada, nIdx}
              <button
                type="button"
                class="wilah-key"
                class:is-hovered={saronHoverIdx === nIdx}
                class:is-struck={saronStruckIdx === nIdx}
                onclick={() => onBunyikanWilah(nIdx)}
                data-testid="saron-wilah-{nIdx}"
                aria-label="Saron {nada.angka} {nada.namaJawa}"
              >
                {nada.angka}
              </button>
            {/each}
          </div>
        </div>
      {/if}

      <div style="padding-top: 12px; border-top: 1px solid var(--border-hairline); font-size: 0.85rem; color: var(--text-secondary); line-height: 1.56;">
        <strong style="color: var(--text-primary);">{tI18n(bahasa, 'twin.philosophyLabel')}</strong>
        {ambilTeks(bendaAktif.filosofi, bahasa)}
      </div>

      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button
          type="button"
          class="util-pill"
          onclick={() => onBukaSulukSpesimen(bendaAktif.id)}
        >
          {tI18n(bahasa, 'twin.listenSuluk', { nama: ambilTeks(bendaAktif.nama, bahasa) })}
        </button>
        <button
          type="button"
          class="util-pill"
          onclick={() => onPindahHalaman('koleksi')}
        >
          {tI18n(bahasa, 'twin.viewCoverflow')}
        </button>
        <button
          type="button"
          class="util-pill"
          class:is-active={isFavorit}
          onclick={onToggleFavorit}
          data-testid="twin-favorit-btn"
        >
          {isFavorit ? tI18n(bahasa, 'twin.savedFav') : tI18n(bahasa, 'twin.saveFav')}
        </button>
        <button
          type="button"
          class="util-pill"
          class:is-active={potretTersimpan}
          onclick={simpanPotret3D}
          data-testid="twin-snapshot-btn"
        >
          {potretTersimpan ? tI18n(bahasa, 'twin.snapshotSaved') : tI18n(bahasa, 'twin.snapshotBtn')}
        </button>
        <button
          type="button"
          class="util-pill"
          class:is-active={tautanTersalin}
          onclick={() => void salinTautanSpesimen()}
          data-testid="twin-copy-link-btn"
        >
          {tautanTersalin ? tI18n(bahasa, 'twin.copiedLink') : tI18n(bahasa, 'twin.copyLink')}
        </button>
        <button
          type="button"
          class="util-pill"
          onclick={unduhDossierSpesimen}
          data-testid="twin-export-dossier-btn"
        >
          {tI18n(bahasa, 'twin.exportDossier')}
        </button>
        {#if bendaAktif.halamanKelanjutan}
          <button
            type="button"
            class="nav-cta-white"
            onclick={() =>
              onPindahHalaman(
                bendaAktif.halamanKelanjutan!.id,
                bendaAktif.halamanKelanjutan!.anchor,
              )}
          >
            {ambilTeks(bendaAktif.halamanKelanjutan.label, bahasa)} &#8594;
          </button>
        {/if}
      </div>
    </aside>
  </div>

  <!-- Arsitektur Rekayasa 4-Baris di atas Grid Swiss dengan Scroll Reveal -->
  <div
    class="engineering-grid-panel twin-reveal-block"
    class:is-visible={visibleBlocks.engineering}
    data-twin-reveal="engineering"
  >
    <div class="engineering-sticky-col">
      <span class="eyebrow-mono">{tI18n(bahasa, 'twin.engEyebrow')}</span>
      <h3 class="display-h2" style="font-size: clamp(1.75rem, 3vw, 2.5rem);">
        {tI18n(bahasa, 'twin.engTitle')}
      </h3>
      <p style="color: var(--text-secondary); margin-top: 14px; line-height: 1.58;">
        {tI18n(bahasa, 'twin.engDesc')}
      </p>
    </div>

    <div class="engineering-list">
      {#each keunggulan as item}
        <div class="engineering-row">
          <div class="engineering-num">{item.nomor}</div>
          <div>
            <h4 style="margin: 0 0 6px; font-family: var(--font-display); font-size: 1.2rem;">
              {ambilTeks(item.judul, bahasa)}
            </h4>
            <p style="margin: 0; font-size: 0.92rem; color: var(--text-secondary); line-height: 1.56;">
              {ambilTeks(item.teks, bahasa)}
            </p>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- 3 Kolom Manifesto Arsitektural Sejajar -->
  <div
    class="editorial-pillars-grid twin-reveal-block"
    class:is-visible={visibleBlocks.pillars}
    data-twin-reveal="pillars"
  >
    {#each pilar as p}
      <div class="editorial-pillar-card">
        <div style="margin-bottom: 10px;">
          <span class="eyebrow-mono">{p.nomor} · {ambilTeks(p.sorot, bahasa)}</span>
        </div>
        <h4 style="margin: 0 0 8px; font-family: var(--font-display); font-size: 1.28rem;">
          {ambilTeks(p.judul, bahasa)}
        </h4>
        <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem; line-height: 1.55;">
          {ambilTeks(p.teks, bahasa)}
        </p>
      </div>
    {/each}
  </div>
</section>
