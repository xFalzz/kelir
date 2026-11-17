<script lang="ts">
  import { onDestroy, onMount, untrack } from 'svelte';
  import {
    DAFTAR_SUMBER,
    ambilAksenBenda,
    ambilTeks,
    type BahasaAktif,
    type ItemCoverflow,
    type SpesimenBedahId,
  } from '../../content/pusaka.ts';
  import { latinKeAksaraJawa } from '../../lib/aksara.ts';
  import { audioBudaya, NADA_SARON_SLENDRO } from '../../lib/audioBudaya.ts';
  import { DAFTAR_BAHASA, tI18n } from '../../lib/i18n.ts';
  import {
    ambilSuaraSuluk,
    base64AudioKeBlobUrl,
    hentikanWebSpeech,
    putarkanWebSpeech,
    susunNaskahNarasiSuluk,
    type ModeSuaraSuluk,
  } from '../../lib/sulukNarasi.ts';
  import type { SulukShowcaseStage } from '../../scenes/sulukShowcaseStage.ts';

  const BALUNGAN_LARIK_MAP = [0, 2, 3, 4, 5];

  interface Props {
    tracks: ItemCoverflow[];
    trackIdx: number;
    sulukLarikAktif: number;
    tema: 'malam' | 'terang';
    bahasa: BahasaAktif;
    audioAktif: boolean;
    suasanaPendopoAktif: boolean;
    onClose: () => void;
    onSelectTrack: (idx: number) => void;
    onSelectLarik: (idx: number) => void;
    onEnsureAudio: () => void;
    onToggleSuasanaGending: () => void;
    onSelectBahasa?: (lang: BahasaAktif) => void;
    onBukaBedah3D: (id: SpesimenBedahId) => void;
  }

  let {
    tracks,
    trackIdx,
    sulukLarikAktif,
    tema,
    bahasa,
    audioAktif,
    suasanaPendopoAktif,
    onClose,
    onSelectTrack,
    onSelectLarik,
    onEnsureAudio,
    onToggleSuasanaGending,
    onSelectBahasa,
    onBukaBedah3D,
  }: Props = $props();

  let track = $derived(tracks[trackIdx] ?? tracks[0]);
  let aksen = $derived(ambilAksenBenda(track.artefakId, tema));
  let larikAktif = $derived(track.sulukLarik[sulukLarikAktif] ?? track.sulukLarik[0]);
  let cuplikanLarikAktif = $derived(ambilTeks(larikAktif, bahasa));
  let progressPersen = $derived(
    Math.round(((sulukLarikAktif + 1) / Math.max(track.sulukLarik.length, 1)) * 100),
  );
  let draftNarasi = $derived(susunNaskahNarasiSuluk(track, bahasa));

  let autoPlayAktif = $state(false);
  let autoPlayTimer: number | null = null;
  let stage = $state.raw<SulukShowcaseStage | null>(null);

  let narasiAktif = $state(true);
  let statusSuara = $state<'siap' | 'memuat' | 'berbicara' | 'jeda'>('siap');
  let modeSuaraAktual = $state<ModeSuaraSuluk>('gemini-3.8-live');
  let narasiServerTeks = $state<string | null>(null);
  let teksNarasiTampil = $derived(narasiServerTeks ?? draftNarasi.tampilNaskah);
  let naratorAudioEl: HTMLAudioElement | undefined;
  let activeAudioUrl: string | null = null;
  let narasiAbort: AbortController | null = null;
  let narasiSeq = 0;
  let prevNarasiKey = '';

  let voiceStatusText = $derived.by(() => {
    const langTag = bahasa.toUpperCase();
    if (!narasiAktif) return tI18n(bahasa, 'sulukModal.voiceMuted');
    if (statusSuara === 'memuat') return tI18n(bahasa, 'sulukModal.voiceLoading', { lang: langTag });
    if (statusSuara === 'berbicara') {
      return modeSuaraAktual === 'web-speech-fallback'
        ? tI18n(bahasa, 'sulukModal.voiceFallback', { lang: langTag })
        : tI18n(bahasa, 'sulukModal.voiceSpeaking', { lang: langTag });
    }
    return tI18n(bahasa, 'sulukModal.voiceReady');
  });

  function mountSuluk3D(node: HTMLDivElement) {
    let destroyed = false;
    let ro: ResizeObserver | null = null;
    let rafId: number | null = null;

    void import('../../scenes/sulukShowcaseStage.ts').then(({ SulukShowcaseStage }) => {
      if (destroyed) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        if (destroyed) return;
        const inst = new SulukShowcaseStage(node, tema, track.artefakId);
        inst.aturLarikAktif(sulukLarikAktif, autoPlayAktif);
        stage = inst;
        ro = new ResizeObserver(() => inst.ubahUkuran());
        ro.observe(node);
      });
    });

    return {
      destroy() {
        destroyed = true;
        if (rafId !== null) window.cancelAnimationFrame(rafId);
        ro?.disconnect();
        stage?.destroy();
        stage = null;
      },
    };
  }

  $effect(() => {
    const id = track.artefakId;
    stage?.muatArtefak(id);
  });

  $effect(() => {
    const temaAktif = tema;
    stage?.setTheme(temaAktif);
  });

  $effect(() => {
    const larik = sulukLarikAktif;
    const playing = autoPlayAktif;
    stage?.aturLarikAktif(larik, playing);
  });

  function batalkanNarasiAktif(statusBerikut: 'siap' | 'memuat' | 'jeda' = 'siap'): void {
    audioBudaya.aturVolumeLatar(false);
    narasiSeq += 1;
    if (narasiAbort) {
      narasiAbort.abort();
      narasiAbort = null;
    }
    hentikanWebSpeech();
    if (naratorAudioEl) {
      naratorAudioEl.onplaying = null;
      naratorAudioEl.onended = null;
      naratorAudioEl.onerror = null;
      try {
        naratorAudioEl.pause();
        naratorAudioEl.removeAttribute('src');
      } catch {
        // Abaikan jika audio elemen sudah dilepas
      }
    }
    if (activeAudioUrl) {
      URL.revokeObjectURL(activeAudioUrl);
      activeAudioUrl = null;
    }
    statusSuara = statusBerikut;
  }

  function jalankanFallbackWebSpeech(
    seq: number,
    naskah: string,
    kodeBcp47: 'id-ID' | 'en-US' | 'jv-ID',
  ): void {
    if (seq !== narasiSeq || !autoPlayAktif || !narasiAktif) return;
    modeSuaraAktual = 'web-speech-fallback';
    const mulaiSpeech = putarkanWebSpeech(
      naskah,
      kodeBcp47,
      () => {
        if (seq === narasiSeq && autoPlayAktif && narasiAktif) {
          statusSuara = 'berbicara';
          audioBudaya.aturVolumeLatar(true);
        }
      },
      () => {
        audioBudaya.aturVolumeLatar(false);
        if (seq === narasiSeq) {
          statusSuara = autoPlayAktif ? 'siap' : 'jeda';
        }
      },
    );
    statusSuara = mulaiSpeech ? 'berbicara' : 'siap';
  }

  async function mulaiNarasiSuara(): Promise<void> {
    if (!autoPlayAktif || !narasiAktif) return;
    batalkanNarasiAktif('memuat');
    const seq = narasiSeq;
    const itemSaatIni = track;
    const bahasaSaatIni = bahasa;
    const ac = new AbortController();
    narasiAbort = ac;

    const draft = susunNaskahNarasiSuluk(itemSaatIni, bahasaSaatIni);
    narasiServerTeks = null;

    try {
      const hasil = await ambilSuaraSuluk(itemSaatIni, bahasaSaatIni, ac.signal);
      if (seq !== narasiSeq || !autoPlayAktif || !narasiAktif) return;

      narasiServerTeks = hasil.tampilNaskah;
      if (hasil.audioBase64 && naratorAudioEl) {
        modeSuaraAktual = 'gemini-3.8-live';
        const url = base64AudioKeBlobUrl(hasil.audioBase64, hasil.mimeType || 'audio/wav');
        activeAudioUrl = url;
        naratorAudioEl.src = url;
        naratorAudioEl.volume = 0.94;
        naratorAudioEl.onplaying = () => {
          if (seq === narasiSeq) {
            statusSuara = 'berbicara';
            audioBudaya.aturVolumeLatar(true);
          }
        };
        naratorAudioEl.onended = () => {
          audioBudaya.aturVolumeLatar(false);
          if (seq === narasiSeq) statusSuara = 'siap';
        };
        naratorAudioEl.onerror = () => {
          jalankanFallbackWebSpeech(seq, hasil.naskah, hasil.kodeBcp47);
        };
        try {
          await naratorAudioEl.play();
          if (seq === narasiSeq) statusSuara = 'berbicara';
          return;
        } catch {
          jalankanFallbackWebSpeech(seq, hasil.naskah, hasil.kodeBcp47);
          return;
        }
      }

      jalankanFallbackWebSpeech(seq, hasil.naskah, hasil.kodeBcp47);
    } catch (err) {
      if ((err as { name?: string })?.name === 'AbortError' || seq !== narasiSeq) return;
      jalankanFallbackWebSpeech(seq, draft.naskah, draft.kodeBcp47);
    }
  }

  $effect(() => {
    const kunci = `${track.artefakId}:${bahasa}`;
    if (kunci === prevNarasiKey) return;
    prevNarasiKey = kunci;
    untrack(() => {
      narasiServerTeks = null;
      if (autoPlayAktif && narasiAktif) {
        void mulaiNarasiSuara();
      } else {
        batalkanNarasiAktif('siap');
      }
    });
  });

  function bunyikanLarikSekarang(lIdx: number, strikeGong = false): void {
    const nadaIdx = BALUNGAN_LARIK_MAP[lIdx % BALUNGAN_LARIK_MAP.length] ?? 0;
    const amp = autoPlayAktif && narasiAktif ? 0.1 : 0.2;
    audioBudaya.bunyikanWilahSaron(nadaIdx, amp);
    if (strikeGong) {
      audioBudaya.bunyikanGongAgeng();
    }
  }

  function pilihLarikManual(lIdx: number): void {
    onSelectLarik(lIdx);
    if (audioAktif) {
      bunyikanLarikSekarang(lIdx, lIdx === 0);
    }
  }

  function hentikanAutoSuluk(): void {
    autoPlayAktif = false;
    if (autoPlayTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
    batalkanNarasiAktif('jeda');
  }

  function toggleAutoSuluk(): void {
    if (autoPlayAktif) {
      hentikanAutoSuluk();
      return;
    }

    onEnsureAudio();
    autoPlayAktif = true;
    bunyikanLarikSekarang(sulukLarikAktif, sulukLarikAktif === 0);
    if (narasiAktif) {
      void mulaiNarasiSuara();
    }

    if (typeof window !== 'undefined') {
      autoPlayTimer = window.setInterval(() => {
        const len = Math.max(track.sulukLarik.length, 1);
        const nextIdx = (sulukLarikAktif + 1) % len;
        onSelectLarik(nextIdx);
        bunyikanLarikSekarang(nextIdx, nextIdx === 0);
        if (nextIdx === len - 1) {
          audioBudaya.bunyikanCempalaKeprak();
        }
      }, 2800);
    }
  }

  function toggleNarasiSuara(): void {
    narasiAktif = !narasiAktif;
    if (!narasiAktif) {
      batalkanNarasiAktif('siap');
      return;
    }
    if (autoPlayAktif) {
      onEnsureAudio();
      void mulaiNarasiSuara();
    }
  }

  function ketukKeprakDalang(): void {
    onEnsureAudio();
    audioBudaya.bunyikanCempalaKeprak();
    stage?.aturLarikAktif(sulukLarikAktif, autoPlayAktif);
  }

  function handleArtMouseMove(e: MouseEvent): void {
    const el = e.currentTarget as HTMLElement | null;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
    const ny = ((e.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1;
    stage?.aturParalaks(nx, ny);
  }

  function pilihTrackModal(targetIdx: number): void {
    const len = tracks.length;
    const normIdx = ((targetIdx % len) + len) % len;
    const targetTrack = tracks[normIdx];
    onSelectTrack(normIdx);
    if (targetTrack && stage) {
      stage.muatArtefak(targetTrack.artefakId);
      stage.aturLarikAktif(0, autoPlayAktif);
    }
    if (autoPlayAktif) bunyikanLarikSekarang(0, true);
  }

  onMount(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        pilihLarikManual((sulukLarikAktif + 1) % track.sulukLarik.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        pilihLarikManual((sulukLarikAktif - 1 + track.sulukLarik.length) % track.sulukLarik.length);
      } else if (e.key === ' ' && (e.target as HTMLElement)?.tagName !== 'BUTTON') {
        e.preventDefault();
        toggleAutoSuluk();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      hentikanAutoSuluk();
    };
  });

  onDestroy(() => {
    hentikanAutoSuluk();
    stage?.destroy();
  });
</script>

<div
  class="modal-suluk-backdrop"
  role="dialog"
  aria-modal="true"
  aria-label="Modal Suluk & Bedah {ambilTeks(track.nama, bahasa)}"
  data-testid="modal-suluk"
  style="--suluk-accent: {aksen};"
>
  <audio bind:this={naratorAudioEl} preload="auto" style="display: none;" aria-hidden="true"></audio>

  <div class="suluk-modal-topright">
    {#if onSelectBahasa}
      <div class="suluk-lang-pills" role="group" aria-label={tI18n(bahasa, 'nav.langAria')}>
        {#each DAFTAR_BAHASA as b}
          <button
            type="button"
            class="suluk-lang-btn"
            class:is-active={bahasa === b.id}
            onclick={() => onSelectBahasa(b.id)}
            data-testid="modal-lang-{b.id}"
          >
            {b.kode}
          </button>
        {/each}
      </div>
    {/if}
    <button
      type="button"
      class="modal-close-btn"
      onclick={onClose}
      data-testid="close-modal-suluk"
    >
      {tI18n(bahasa, 'sulukModal.close')}
    </button>
  </div>

  <!-- Kolom Kiri: Panggung PBR 3D Real-Time Altar Pendopo + Pemilih Repertoar 01..07 -->
  <div class="modal-art-stage-col">
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="modal-art-panel"
      onmousemove={handleArtMouseMove}
      onmouseleave={() => stage?.aturParalaks(0, 0)}
    >
      <div class="suluk-webgl-host" use:mountSuluk3D></div>

      <div class="suluk-art-hud-top">
        <span class="suluk-stage-pill">
          <span class="suluk-live-dot" aria-hidden="true"></span>
          <span>{tI18n(bahasa, 'sulukModal.stageBadge', { kode: track.kodeArsip })}</span>
        </span>
        <span class="suluk-stage-pill is-aksara" lang="jv" aria-hidden="true">
          {track.aksara}
        </span>
      </div>

      <div class="suluk-art-hud-bottom">
        <div class="suluk-art-meta">
          <span class="suluk-art-kicker">{ambilTeks(track.jenisSuluk, bahasa)}</span>
          <strong>{track.larasPathet}</strong>
        </div>
        <button
          type="button"
          class="pill-cta-outline suluk-bedah-btn"
          onclick={() => {
            onClose();
            onBukaBedah3D(track.artefakId);
          }}
        >
          {tI18n(bahasa, 'sulukModal.bedahBtn')}
        </button>
      </div>
    </div>

    <div class="suluk-track-pills" role="tablist" aria-label={tI18n(bahasa, 'coverflow.repTitle', { count: tracks.length })}>
      {#each tracks as item, idx}
        <button
          type="button"
          role="tab"
          aria-selected={trackIdx === idx}
          class="suluk-track-chip"
          class:is-active={trackIdx === idx}
          onclick={() => pilihTrackModal(idx)}
          data-testid="suluk-track-chip-{idx + 1}"
        >
          {item.nomorUrut}
        </button>
      {/each}
    </div>
  </div>

  <!-- Kolom Kanan: Bait Suluk Sinkron Tri-Aksara, Catatan Karawitan & Konsol Pemutar Dalang -->
  <div class="modal-lyrics-col">
    <div class="suluk-head-block">
      <div class="eyebrow-mono">
        {tI18n(bahasa, 'sulukModal.headMeta', {
          nomor: track.nomorUrut,
          total: tracks.length,
          larik: sulukLarikAktif + 1,
          max: track.sulukLarik.length,
          src: track.sumber.join(', '),
        })}
      </div>
      <h2 class="suluk-modal-title">
        {ambilTeks(track.nama, bahasa)}
      </h2>
      <p class="suluk-modal-sub">
        {ambilTeks(track.subjudul, bahasa)}
      </p>

      <div class="suluk-karawitan-strip" aria-label={tI18n(bahasa, 'coverflow.karawitanHeading')}>
        <div class="suluk-karawitan-cell">
          <span>{tI18n(bahasa, 'coverflow.sulukType')}</span>
          <strong>{ambilTeks(track.jenisSuluk, bahasa)}</strong>
        </div>
        <div class="suluk-karawitan-cell">
          <span>{tI18n(bahasa, 'coverflow.larasPathet')}</span>
          <strong>{track.larasPathet}</strong>
        </div>
        <div class="suluk-karawitan-cell">
          <span>{tI18n(bahasa, 'coverflow.instruments')}</span>
          <strong>{ambilTeks(track.instrumenPengiring, bahasa)}</strong>
        </div>
        <div class="suluk-karawitan-cell">
          <span>{tI18n(bahasa, 'sulukModal.tempoLabel')}</span>
          <strong>{ambilTeks(track.tempoKeterangan, bahasa)}</strong>
        </div>
      </div>
    </div>

    <!-- Bait Suluk Interaktif Bernomor & Balungan Nada -->
    <div class="suluk-lines" aria-label={tI18n(bahasa, 'coverflow.sulukType')}>
      {#each track.sulukLarik as larik, lIdx}
        {@const nadaIdx = BALUNGAN_LARIK_MAP[lIdx % BALUNGAN_LARIK_MAP.length] ?? 0}
        {@const nadaObj = NADA_SARON_SLENDRO[nadaIdx]}
        <button
          type="button"
          class="suluk-line-btn"
          class:is-active={sulukLarikAktif === lIdx}
          onclick={() => pilihLarikManual(lIdx)}
          data-testid="suluk-line-{lIdx + 1}"
        >
          <div class="suluk-line-main">
            <span class="suluk-line-idx">
              0{lIdx + 1} · {nadaObj.angka}
            </span>
            <span class="suluk-line-text">
              {ambilTeks(larik, bahasa)}
            </span>
          </div>
          {#if sulukLarikAktif === lIdx}
            <div class="suluk-line-parallel">
              <span class="suluk-jw-line">{bahasa === 'jw' ? larik.en : larik.jw}</span>
              <span class="suluk-aks-line" lang="jv">{latinKeAksaraJawa(larik.jw)}</span>
            </div>
          {/if}
        </button>
      {/each}
    </div>

    <!-- Catatan Dalang & Filosofi -->
    <div class="suluk-notes-grid">
      <div class="suluk-note-card">
        <span class="eyebrow-mono">{tI18n(bahasa, 'sulukModal.noteDalang')}</span>
        <p>{ambilTeks(track.catatanDalang, bahasa)}</p>
      </div>
      <div class="suluk-note-card">
        <span class="eyebrow-mono">{tI18n(bahasa, 'sulukModal.notePhilosophy')}</span>
        <p>{ambilTeks(track.filosofi, bahasa)}</p>
        <div class="suluk-source-row">
          {#each track.sumber as sKode}
            <span class="source-pill" title={ambilTeks(DAFTAR_SUMBER[sKode].judul, bahasa)}>
              {sKode} · {ambilTeks(DAFTAR_SUMBER[sKode].lembaga, bahasa)}
            </span>
          {/each}
        </div>
      </div>
    </div>

    <!-- Konsol Pemutar Suluk, Narator Suara AI Gemini 3.8 Flash TTS & Gamelan Slendro -->
    <div class="crimson-player-bar">
      <div class="suluk-progress-track" aria-hidden="true">
        <div class="suluk-progress-fill" style="width: {progressPersen}%;"></div>
      </div>

      <div class="crimson-player-top">
        <div class="crimson-player-info">
          <div
            class="suluk-eq"
            class:is-playing={autoPlayAktif || suasanaPendopoAktif || statusSuara === 'berbicara'}
            aria-hidden="true"
          >
            <span></span><span></span><span></span><span></span>
          </div>
          <div style="min-width: 0;">
            <div class="crimson-track-name">{ambilTeks(track.nama, bahasa)}</div>
            <div class="crimson-track-meta">
              {track.larasPathet} · {tI18n(bahasa, 'sulukModal.lineLabel', { larik: sulukLarikAktif + 1, max: track.sulukLarik.length })}: “{cuplikanLarikAktif.slice(0, 42)}{cuplikanLarikAktif.length > 42 ? '…' : ''}”
            </div>
          </div>
        </div>

        <div class="crimson-controls">
          <button
            type="button"
            class="pill-cta-white crimson-btn"
            onclick={toggleAutoSuluk}
            data-testid="toggle-auto-suluk"
          >
            {autoPlayAktif ? tI18n(bahasa, 'sulukModal.pauseSuluk') : tI18n(bahasa, 'sulukModal.autoSuluk')}
          </button>
          <button
            type="button"
            class="suluk-sec-btn"
            class:is-active={narasiAktif}
            onclick={toggleNarasiSuara}
            data-testid="toggle-narator-suluk"
          >
            {narasiAktif ? tI18n(bahasa, 'sulukModal.voiceToggleOn') : tI18n(bahasa, 'sulukModal.voiceToggleOff')}
          </button>
          <button
            type="button"
            class="suluk-sec-btn"
            class:is-active={suasanaPendopoAktif}
            onclick={onToggleSuasanaGending}
            data-testid="toggle-gending-suluk"
          >
            {suasanaPendopoAktif ? tI18n(bahasa, 'sulukModal.pauseGending') : tI18n(bahasa, 'sulukModal.gending')}
          </button>
          <button
            type="button"
            class="suluk-sec-btn"
            onclick={ketukKeprakDalang}
            title={tI18n(bahasa, 'sulukModal.keprak')}
          >
            {tI18n(bahasa, 'sulukModal.keprak')}
          </button>
          <button
            type="button"
            class="circle-nav-btn crimson-nav-circle"
            onclick={() => pilihTrackModal(trackIdx - 1)}
            aria-label={tI18n(bahasa, 'bridge.prev', { nomor: String(trackIdx || tracks.length).padStart(2, '0') })}
          >
            &lt;
          </button>
          <button
            type="button"
            class="circle-nav-btn crimson-nav-circle"
            onclick={() => pilihTrackModal(trackIdx + 1)}
            aria-label={tI18n(bahasa, 'bridge.next', { nomor: String(((trackIdx + 1) % tracks.length) + 1).padStart(2, '0') })}
          >
            &gt;
          </button>
        </div>
      </div>

      <div
        class="suluk-voice-strip"
        data-testid="suluk-voice-bar"
        data-voice-status={statusSuara}
        data-voice-lang={draftNarasi.kodeBcp47}
      >
        <div class="suluk-voice-head">
          <span class="suluk-voice-status">
            <span
              class="suluk-voice-dot"
              class:is-speaking={statusSuara === 'berbicara'}
              class:is-loading={statusSuara === 'memuat'}
              aria-hidden="true"
            ></span>
            <span>{voiceStatusText}</span>
          </span>
          <span class="suluk-voice-model">{tI18n(bahasa, 'sulukModal.voiceLabel')}</span>
        </div>
        <p class="suluk-voice-transcript" lang={bahasa === 'aks' ? 'jv' : bahasa === 'jw' ? 'jv' : bahasa}>
          {teksNarasiTampil || draftNarasi.tampilNaskah}
        </p>
      </div>
    </div>
  </div>
</div>
