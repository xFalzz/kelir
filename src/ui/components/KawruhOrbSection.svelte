<script lang="ts">
  import type { Action } from 'svelte/action';
  import { onDestroy } from 'svelte';
  import {
    DAFTAR_BEDAH_TWIN,
    DAFTAR_SUMBER,
    KAWRUH_FILOSOFI,
    ambilTeks,
    type BahasaAktif,
    type BendaPusaka,
    type KodeSumber,
    type SpesimenBedahId,
  } from '../../content/pusaka.ts';
  import { DAFTAR_CARAKAN, type KartuCarakan } from '../../lib/aksara.ts';
  import { audioBudaya } from '../../lib/audioBudaya.ts';
  import {
    BANK_KUIS_S1_S7,
    bandingkanPusakaLokal,
    mintaKomparasiAI,
    mintaKramaAI,
    mintaPujanggaAI,
    mintaRuteTurAI,
    susunKramaLokal,
    susunPujanggaLokal,
    susunRuteTurLokal,
    type DurasiTurId,
    type KomparasiResult,
    type KramaAksaraResult,
    type LangkahRuteTur,
    type MinatTurId,
    type PujanggaResult,
    type RuteTurResult,
  } from '../../lib/aiStudio.ts';
  import { tI18n } from '../../lib/i18n.ts';
  import { pasangReveal } from '../../lib/revealAnim.ts';
  import {
    base64AudioKeBlobUrl,
    hentikanWebSpeech,
    putarkanWebSpeech,
  } from '../../lib/sulukNarasi.ts';
  import type { HasilTanya } from '../../lib/tanya.ts';

  interface Props {
    bahasa: BahasaAktif;
    bendaAktif: BendaPusaka;
    pertanyaanInput: string;
    sediaTanya: boolean;
    jawabanPamomong: HasilTanya;
    onKirimTanya: (e?: SubmitEvent) => Promise<void> | void;
    onPilihContohPertanyaan: (q: string) => void;
    mountOrbStage: Action<HTMLDivElement>;
    inputAksaraLatin: string;
    aksaraTerkonversi: string;
    kartuCarakanTerpilih: KartuCarakan;
    onPilihCarakan: (c: KartuCarakan) => void;
    formatSumberLabel: (s: KodeSumber) => string;
    onSimpanSkorKuis?: (skor: number) => void;
    onMasukLangkahTur?: (step: LangkahRuteTur) => void;
  }

  let {
    bahasa,
    bendaAktif,
    pertanyaanInput = $bindable(''),
    sediaTanya,
    jawabanPamomong,
    onKirimTanya,
    onPilihContohPertanyaan,
    mountOrbStage,
    inputAksaraLatin = $bindable(''),
    aksaraTerkonversi,
    kartuCarakanTerpilih,
    onPilihCarakan,
    formatSumberLabel,
    onSimpanSkorKuis,
    onMasukLangkahTur,
  }: Props = $props();

  let aksaraTersalin = $state(false);
  let copyTimer: ReturnType<typeof setTimeout> | null = null;
  let answerBoxEl: HTMLDivElement | undefined = $state();
  let justUpdated = $state(false);
  let wasBusy = false;
  let flashTimer: ReturnType<typeof setTimeout> | null = null;
  let jawabanTersalin = $state(false);
  let jawabanCopyTimer: ReturnType<typeof setTimeout> | null = null;

  // Multi-Mode AI Studio State
  let modeStudio: 'tanya' | 'banding' | 'pujangga' | 'krama' | 'tur' | 'kuis' = $state('tanya');
  let studioBusy = $state(false);

  $effect(() => {
    const busyNow = sediaTanya || studioBusy;
    if (wasBusy && !busyNow) {
      justUpdated = true;
      if (flashTimer) clearTimeout(flashTimer);
      flashTimer = setTimeout(() => {
        justUpdated = false;
      }, 1500);
      if (typeof window !== 'undefined' && answerBoxEl) {
        answerBoxEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
    wasBusy = busyNow;
  });

  async function salinTeksJawaban(teks: string): Promise<void> {
    if (!teks) return;
    try {
      await navigator.clipboard?.writeText(teks);
      jawabanTersalin = true;
      if (jawabanCopyTimer) clearTimeout(jawabanCopyTimer);
      jawabanCopyTimer = setTimeout(() => {
        jawabanTersalin = false;
      }, 1600);
    } catch {
      jawabanTersalin = false;
    }
  }

  // Mode 2: Komparator Dua Pusaka AI
  let bandingIdA: SpesimenBedahId = $state('keris');
  let bandingIdB: SpesimenBedahId = $state('joglo');
  let hasilKomparasi: KomparasiResult = $state(bandingkanPusakaLokal('keris', 'joglo', 'id'));

  // Mode 3: Asisten Pujangga & Suara Jawa AI
  let temaPujangga = $state('Harmoni pendopo dan alam');
  let hasilPujangga: PujanggaResult = $state(susunPujanggaLokal('Harmoni pendopo dan alam', 'id'));
  let suaraStudioAktif: 'pujangga' | 'krama' | null = $state(null);
  let studioAudioEl: HTMLAudioElement | null = null;
  let studioAudioUrl: string | null = null;

  // Mode 4: Pemandu Tata Krama & Aksara Jawa AI
  let frasaKrama = $state('Permisi, saya ingin belajar gamelan pendopo');
  let hasilKrama: KramaAksaraResult = $state(
    susunKramaLokal('Permisi, saya ingin belajar gamelan pendopo', 'id'),
  );

  // Mode 5: Perencana Rute Tur Spasial AI
  let minatTur: MinatTurId = $state('semua');
  let durasiTur: DurasiTurId = $state('mendalam');
  let catatanTur = $state('');
  let hasilTur: RuteTurResult = $state(susunRuteTurLokal('semua', 'mendalam', '', 'id'));

  // Mode 6: Kuis Kuratorial S1-S7
  let kuisIdx = $state(0);
  let kuisSkor = $state(0);
  let kuisPilihan: number | null = $state(null);
  let kuisSelesai = $state(false);

  $effect(() => {
    const b = bahasa;
    hasilKomparasi = bandingkanPusakaLokal(bandingIdA, bandingIdB, b);
    hasilPujangga = susunPujanggaLokal(temaPujangga, b);
    hasilKrama = susunKramaLokal(frasaKrama, b);
    hasilTur = susunRuteTurLokal(minatTur, durasiTur, catatanTur, b);
  });

  function hentikanSuaraStudio(): void {
    hentikanWebSpeech();
    audioBudaya.aturVolumeLatar(false);
    if (studioAudioEl) {
      studioAudioEl.pause();
      studioAudioEl.src = '';
      studioAudioEl = null;
    }
    if (studioAudioUrl) {
      URL.revokeObjectURL(studioAudioUrl);
      studioAudioUrl = null;
    }
    suaraStudioAktif = null;
  }

  onDestroy(() => {
    hentikanSuaraStudio();
    if (copyTimer) clearTimeout(copyTimer);
    if (flashTimer) clearTimeout(flashTimer);
    if (jawabanCopyTimer) clearTimeout(jawabanCopyTimer);
  });

  async function jalankanKomparasiAI(): Promise<void> {
    studioBusy = true;
    hasilKomparasi = await mintaKomparasiAI(bandingIdA, bandingIdB, bahasa);
    studioBusy = false;
  }

  async function jalankanPujanggaAI(e?: SubmitEvent): Promise<void> {
    if (e) e.preventDefault();
    hentikanSuaraStudio();
    studioBusy = true;
    const res = await mintaPujanggaAI(temaPujangga, bahasa);
    hasilPujangga = res;
    studioBusy = false;
    putarkanSuaraStudio(res, 'pujangga');
  }

  async function jalankanKramaAI(e?: SubmitEvent): Promise<void> {
    if (e) e.preventDefault();
    hentikanSuaraStudio();
    studioBusy = true;
    const res = await mintaKramaAI(frasaKrama, bahasa);
    hasilKrama = res;
    studioBusy = false;
    putarkanSuaraStudio(res, 'krama');
  }

  async function jalankanRuteTurAI(e?: SubmitEvent): Promise<void> {
    if (e) e.preventDefault();
    studioBusy = true;
    hasilTur = await mintaRuteTurAI(minatTur, durasiTur, catatanTur, bahasa);
    studioBusy = false;
  }

  function putarkanSuaraStudio(
    target: {
      naskahSuara: string;
      kodeBcp47: 'id-ID' | 'en-US' | 'jv-ID';
      audioBase64: string | null;
      mimeType: string | null;
    },
    sumberAktif: 'pujangga' | 'krama',
  ): void {
    hentikanSuaraStudio();
    const onMulai = () => {
      suaraStudioAktif = sumberAktif;
      audioBudaya.aturVolumeLatar(true);
    };
    const onSelesai = () => {
      suaraStudioAktif = null;
      audioBudaya.aturVolumeLatar(false);
    };
    if (target.audioBase64 && target.mimeType && typeof Audio !== 'undefined') {
      try {
        const blobUrl = base64AudioKeBlobUrl(target.audioBase64, target.mimeType);
        studioAudioUrl = blobUrl;
        const audio = new Audio(blobUrl);
        studioAudioEl = audio;
        onMulai();
        audio.onended = () => hentikanSuaraStudio();
        audio.onerror = () => hentikanSuaraStudio();
        void audio.play().catch(() => {
          hentikanSuaraStudio();
          putarkanWebSpeech(target.naskahSuara, target.kodeBcp47, onMulai, onSelesai);
        });
        return;
      } catch {
        // Lanjut ke Web Speech API
      }
    }
    putarkanWebSpeech(target.naskahSuara, target.kodeBcp47, onMulai, onSelesai);
  }

  function pilihJawabanKuis(optIdx: number): void {
    if (kuisPilihan !== null || kuisSelesai) return;
    kuisPilihan = optIdx;
    const soal = BANK_KUIS_S1_S7[kuisIdx];
    if (soal && optIdx === soal.indeksBenar) {
      kuisSkor += 1;
      onSimpanSkorKuis?.(kuisSkor);
    }
  }

  function lanjutSoalKuis(): void {
    if (kuisIdx + 1 >= BANK_KUIS_S1_S7.length) {
      kuisSelesai = true;
      onSimpanSkorKuis?.(kuisSkor);
      return;
    }
    kuisIdx += 1;
    kuisPilihan = null;
  }

  function ulangiKuis(): void {
    kuisIdx = 0;
    kuisSkor = 0;
    kuisPilihan = null;
    kuisSelesai = false;
  }

  async function salinAksara(): Promise<void> {
    const teks = aksaraTerkonversi || 'ꦏꦼꦭꦶꦂ';
    try {
      await navigator.clipboard?.writeText(teks);
      aksaraTersalin = true;
      if (copyTimer) clearTimeout(copyTimer);
      copyTimer = setTimeout(() => {
        aksaraTersalin = false;
      }, 1600);
    } catch {
      aksaraTersalin = false;
    }
  }

  let statusLabel = $derived(
    jawabanPamomong.statusGrounding === 'luar-korpus'
      ? tI18n(bahasa, 'kawruh.statusAbstain')
      : jawabanPamomong.mode === 'gemini-3.8-live'
        ? tI18n(bahasa, 'kawruh.statusGemini')
        : jawabanPamomong.statusGrounding === 'terbukti'
          ? tI18n(bahasa, 'kawruh.statusVerified')
          : tI18n(bahasa, 'kawruh.statusSummary'),
  );
</script>

<section id="pamomong" class="band-section" aria-label={tI18n(bahasa, 'pages.kawruh.label')}>
  <div class="pamomong-grid">
    <div>
      <span class="eyebrow-mono">{tI18n(bahasa, 'kawruh.eyebrow')}</span>
      <h1 class="display-h2">
        {tI18n(bahasa, 'kawruh.h1')}
      </h1>
      <p style="color: var(--text-secondary); margin: 14px 0 18px; line-height: 1.58;">
        {tI18n(bahasa, 'kawruh.lead')}
      </p>

      <!-- Tab Bar Multi-Fitur AI Studio Gemini 3.8 Live -->
      <div class="studio-tab-bar" role="tablist" aria-label={tI18n(bahasa, 'aiStudio.tabAria')}>
        <button
          type="button"
          role="tab"
          aria-selected={modeStudio === 'tanya'}
          class="util-pill"
          class:is-active={modeStudio === 'tanya'}
          onclick={() => (modeStudio = 'tanya')}
          data-testid="studio-tab-tanya"
        >
          {tI18n(bahasa, 'aiStudio.tabTanya')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={modeStudio === 'banding'}
          class="util-pill"
          class:is-active={modeStudio === 'banding'}
          onclick={() => (modeStudio = 'banding')}
          data-testid="studio-tab-banding"
        >
          {tI18n(bahasa, 'aiStudio.tabBanding')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={modeStudio === 'pujangga'}
          class="util-pill"
          class:is-active={modeStudio === 'pujangga'}
          onclick={() => (modeStudio = 'pujangga')}
          data-testid="studio-tab-pujangga"
        >
          {tI18n(bahasa, 'aiStudio.tabPujangga')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={modeStudio === 'krama'}
          class="util-pill"
          class:is-active={modeStudio === 'krama'}
          onclick={() => (modeStudio = 'krama')}
          data-testid="studio-tab-krama"
        >
          {tI18n(bahasa, 'aiStudio.tabKrama')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={modeStudio === 'tur'}
          class="util-pill"
          class:is-active={modeStudio === 'tur'}
          onclick={() => (modeStudio = 'tur')}
          data-testid="studio-tab-tur"
        >
          {tI18n(bahasa, 'aiStudio.tabTur')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={modeStudio === 'kuis'}
          class="util-pill"
          class:is-active={modeStudio === 'kuis'}
          onclick={() => (modeStudio = 'kuis')}
          data-testid="studio-tab-kuis"
        >
          {tI18n(bahasa, 'aiStudio.tabKuis')}
        </button>
      </div>

      {#if modeStudio === 'tanya'}
        <div class="pamomong-prompt-chips">
          {#each bendaAktif.pertanyaanContoh as contohQ}
            {@const teksContoh = ambilTeks(contohQ, bahasa)}
            <button
              type="button"
              class="util-pill is-wrap"
              onclick={() => onPilihContohPertanyaan(teksContoh)}
            >
              {teksContoh}
            </button>
          {/each}
          <button
            type="button"
            class="util-pill is-wrap"
            onclick={() => onPilihContohPertanyaan(tI18n(bahasa, 'kawruh.testOodQuery'))}
            title={tI18n(bahasa, 'kawruh.testOodLabel')}
          >
            {tI18n(bahasa, 'kawruh.testOodLabel')}
          </button>
        </div>

        <form
          onsubmit={onKirimTanya}
          class="pamomong-query-form"
          data-testid="form-tanya"
        >
          <input
            type="text"
            maxlength="280"
            class="pamomong-query-input"
            bind:value={pertanyaanInput}
            placeholder={tI18n(bahasa, 'kawruh.placeholder', { nama: ambilTeks(bendaAktif.nama, bahasa) })}
          />
          <button type="submit" class="pill-cta-white" disabled={sediaTanya}>
            {sediaTanya ? tI18n(bahasa, 'kawruh.submitLoading') : tI18n(bahasa, 'kawruh.submitAsk')}
          </button>
        </form>

        <div
          bind:this={answerBoxEl}
          class="pamomong-answer-box is-hero-answer"
          class:is-abstain-box={jawabanPamomong.statusGrounding === 'luar-korpus'}
          class:is-just-updated={justUpdated}
          data-testid="jawaban-pamomong"
        >
          <div class="ai-answer-hero-head">
            <span class="ai-answer-title">
              <span
                class="ai-answer-dot"
                class:is-abstain={jawabanPamomong.statusGrounding === 'luar-korpus'}
                aria-hidden="true"
              ></span>
              {tI18n(bahasa, 'kawruh.answerHeading')}
            </span>
            <div class="ai-answer-head-actions">
              <span class="rag-model-pill" data-testid="pamomong-model-badge">
                {tI18n(bahasa, 'kawruh.modelBadge', { model: jawabanPamomong.modelNama })}
              </span>
              <button
                type="button"
                class="util-pill"
                onclick={() => void salinTeksJawaban(jawabanPamomong.jawaban)}
                data-testid="pamomong-copy-answer"
              >
                {jawabanTersalin ? tI18n(bahasa, 'kawruh.copiedAnswer') : tI18n(bahasa, 'kawruh.copyAnswer')}
              </button>
            </div>
          </div>

          {#if sediaTanya}
            <div class="ai-answer-loading" role="status">
              <span class="ai-answer-spinner" aria-hidden="true"></span>
              <span>{tI18n(bahasa, 'kawruh.loadingBanner')}</span>
            </div>
          {/if}

          <div class="ai-answer-primary-surface">
            <div class="pamomong-answer-prose">
              {#each jawabanPamomong.jawaban.split('\n\n') as paragraf}
                <p>{paragraf}</p>
              {/each}
            </div>
          </div>

          <div class="rag-telemetry-bar is-footer">
            <span
              class="rag-status-tag"
              class:is-abstain={jawabanPamomong.statusGrounding === 'luar-korpus'}
            >
              {statusLabel}
            </span>
            <span class="rag-metric">
              {tI18n(bahasa, 'kawruh.confidence')} <strong>{jawabanPamomong.skorKeyakinan}%</strong> · {jawabanPamomong.latensiMs} ms
            </span>
          </div>

          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            {#each jawabanPamomong.sumber as ks}
              <span class="source-badge">{formatSumberLabel(ks)}</span>
            {/each}
            {#each jawabanPamomong.kataKunciCocok as kw}
              <span class="kw-chip">#{kw}</span>
            {/each}
          </div>

          {#if jawabanPamomong.butirBukti.length > 0}
            <details class="rag-evidence-details">
              <summary class="rag-evidence-summary">
                {tI18n(bahasa, 'kawruh.toggleEvidence', { count: jawabanPamomong.butirBukti.length })}
              </summary>
              <div class="rag-evidence-list" aria-label={tI18n(bahasa, 'kawruh.retrievedEyebrow', { count: jawabanPamomong.butirBukti.length })}>
                {#each jawabanPamomong.butirBukti as bukti}
                  <div class="rag-evidence-row">
                    <div class="rag-evidence-head">
                      <strong>{bukti.judul}</strong>
                      <span>{tI18n(bahasa, 'kawruh.relevance', { pct: bukti.skorRelatif, src: bukti.sumber.join(', ') })}</span>
                    </div>
                    <p class="rag-evidence-quote">{bukti.kutipan}</p>
                  </div>
                {/each}
              </div>
            </details>
          {/if}
        </div>
      {:else if modeStudio === 'banding'}
        <div class="studio-panel" data-testid="studio-panel-banding">
          <p class="studio-panel-lead">{tI18n(bahasa, 'aiStudio.compLead')}</p>
          <div class="studio-comp-controls">
            <label class="studio-select-wrap">
              <span>{tI18n(bahasa, 'aiStudio.compLabelA')}</span>
              <select bind:value={bandingIdA} class="studio-select" data-testid="studio-comp-a">
                {#each DAFTAR_BEDAH_TWIN as sp}
                  <option value={sp.id}>{sp.nomorUrut} · {ambilTeks(sp.nama, bahasa)}</option>
                {/each}
              </select>
            </label>
            <label class="studio-select-wrap">
              <span>{tI18n(bahasa, 'aiStudio.compLabelB')}</span>
              <select bind:value={bandingIdB} class="studio-select" data-testid="studio-comp-b">
                {#each DAFTAR_BEDAH_TWIN as sp}
                  <option value={sp.id}>{sp.nomorUrut} · {ambilTeks(sp.nama, bahasa)}</option>
                {/each}
              </select>
            </label>
            <button
              type="button"
              class="pill-cta-white"
              disabled={studioBusy}
              onclick={() => void jalankanKomparasiAI()}
              data-testid="studio-comp-submit"
            >
              {studioBusy ? tI18n(bahasa, 'aiStudio.compLoading') : tI18n(bahasa, 'aiStudio.compSubmit')}
            </button>
          </div>

          <div
            bind:this={answerBoxEl}
            class="pamomong-answer-box is-hero-answer"
            class:is-just-updated={justUpdated}
            data-testid="studio-comp-result"
          >
            <div class="ai-answer-hero-head">
              <span class="ai-answer-title">
                <span class="ai-answer-dot" aria-hidden="true"></span>
                {tI18n(bahasa, 'kawruh.compHeading')}
              </span>
              <div class="ai-answer-head-actions">
                <span class="rag-model-pill">
                  {tI18n(bahasa, 'kawruh.modelBadge', { model: hasilKomparasi.modelNama })}
                </span>
                <span class="rag-metric">{hasilKomparasi.latensiMs} ms</span>
              </div>
            </div>
            {#if studioBusy}
              <div class="ai-answer-loading" role="status">
                <span class="ai-answer-spinner" aria-hidden="true"></span>
                <span>{tI18n(bahasa, 'kawruh.loadingBanner')}</span>
              </div>
            {/if}
            <div class="studio-card-stack">
              <div class="studio-info-card">
                <div class="eyebrow-mono">{tI18n(bahasa, 'aiStudio.compSim')}</div>
                <p>{hasilKomparasi.persamaan}</p>
              </div>
              <div class="studio-info-card">
                <div class="eyebrow-mono">{tI18n(bahasa, 'aiStudio.compDiff')}</div>
                <p>{hasilKomparasi.perbedaanMaterial}</p>
              </div>
              <div class="studio-info-card">
                <div class="eyebrow-mono">{tI18n(bahasa, 'aiStudio.compPhil')}</div>
                <p>{hasilKomparasi.titikTemuFilosofi}</p>
              </div>
            </div>

            <div class="rag-telemetry-bar is-footer">
              <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                {#each hasilKomparasi.sumber as ks}
                  <span class="source-badge">{ks}</span>
                {/each}
              </div>
              <span class="rag-metric">{hasilKomparasi.latensiMs} ms</span>
            </div>
          </div>
        </div>
      {:else if modeStudio === 'pujangga'}
        <div class="studio-panel" data-testid="studio-panel-pujangga">
          <p class="studio-panel-lead">{tI18n(bahasa, 'aiStudio.poetLead')}</p>
          <form
            onsubmit={(e) => void jalankanPujanggaAI(e)}
            class="pamomong-query-form"
          >
            <input
              type="text"
              maxlength="120"
              class="pamomong-query-input"
              bind:value={temaPujangga}
              placeholder={tI18n(bahasa, 'aiStudio.poetPlaceholder')}
              data-testid="studio-poet-input"
            />
            <button
              type="submit"
              class="pill-cta-white"
              disabled={studioBusy}
              data-testid="studio-poet-submit"
            >
              {studioBusy ? tI18n(bahasa, 'aiStudio.poetLoading') : tI18n(bahasa, 'aiStudio.poetSubmit')}
            </button>
          </form>

          <div
            bind:this={answerBoxEl}
            class="pamomong-answer-box is-hero-answer"
            class:is-abstain-box={hasilPujangga.statusAman === false}
            class:is-just-updated={justUpdated}
            data-testid="studio-poet-result"
          >
            <div class="ai-answer-hero-head">
              <span class="ai-answer-title">
                <span
                  class="ai-answer-dot"
                  class:is-abstain={hasilPujangga.statusAman === false}
                  aria-hidden="true"
                ></span>
                {tI18n(bahasa, 'kawruh.poetHeading')}
              </span>
              <div class="ai-answer-head-actions">
                <span class="rag-model-pill">
                  {tI18n(bahasa, 'kawruh.modelBadge', { model: hasilPujangga.modelNama })}
                </span>
                <button
                  type="button"
                  class="util-pill"
                  class:is-active={suaraStudioAktif === 'pujangga'}
                  onclick={() =>
                    suaraStudioAktif === 'pujangga'
                      ? hentikanSuaraStudio()
                      : putarkanSuaraStudio(hasilPujangga, 'pujangga')}
                  data-testid="studio-poet-play-voice"
                >
                  {suaraStudioAktif === 'pujangga'
                    ? tI18n(bahasa, 'aiStudio.poetStopVoice')
                    : tI18n(bahasa, 'aiStudio.poetPlayVoice')}
                </button>
              </div>
            </div>
            {#if studioBusy}
              <div class="ai-answer-loading" role="status">
                <span class="ai-answer-spinner" aria-hidden="true"></span>
                <span>{tI18n(bahasa, 'kawruh.loadingBanner')}</span>
              </div>
            {/if}
            <div class="studio-card-stack">
              {#if hasilPujangga.statusAman === false && hasilPujangga.pesanKeamanan}
                <div class="studio-info-card" data-testid="studio-poet-guardrail-note">
                  <p class="studio-poet-note">{hasilPujangga.pesanKeamanan}</p>
                </div>
              {/if}
              <div class="studio-info-card">
                <div class="eyebrow-mono">{tI18n(bahasa, 'aiStudio.poetVerseLabel')}</div>
                <p class="studio-poet-verse">{hasilPujangga.guritJawa}</p>
              </div>
              <div class="studio-info-card">
                <div class="eyebrow-mono">{tI18n(bahasa, 'aiStudio.poetScriptLabel')}</div>
                <p class="studio-poet-aksara" lang="jv">{hasilPujangga.aksaraJawa}</p>
              </div>
              <div class="studio-info-card">
                <div class="eyebrow-mono">{tI18n(bahasa, 'aiStudio.poetMeaningLabel')}</div>
                <p>{hasilPujangga.terjemahan}</p>
                <p class="studio-poet-note">{hasilPujangga.catatanMakna}</p>
              </div>
            </div>

            <div class="rag-telemetry-bar is-footer">
              {#if hasilPujangga.statusAman === false}
                <span class="rag-status-tag is-abstain" data-testid="studio-poet-guardrail-badge">
                  {tI18n(bahasa, 'kawruh.statusAbstain')}
                </span>
              {/if}
              <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                {#each hasilPujangga.sumber as ks}
                  <span class="source-badge">{ks}</span>
                {/each}
              </div>
            </div>
          </div>
        </div>
      {:else if modeStudio === 'krama'}
        <div class="studio-panel" data-testid="studio-panel-krama">
          <p class="studio-panel-lead">{tI18n(bahasa, 'aiStudio.kramaLead')}</p>
          <form onsubmit={(e) => void jalankanKramaAI(e)} class="pamomong-query-form">
            <input
              type="text"
              maxlength="140"
              class="pamomong-query-input"
              bind:value={frasaKrama}
              placeholder={tI18n(bahasa, 'aiStudio.kramaPlaceholder')}
              data-testid="studio-krama-input"
            />
            <button
              type="submit"
              class="pill-cta-white"
              disabled={studioBusy}
              data-testid="studio-krama-submit"
            >
              {studioBusy ? tI18n(bahasa, 'aiStudio.kramaLoading') : tI18n(bahasa, 'aiStudio.kramaSubmit')}
            </button>
          </form>

          <div
            bind:this={answerBoxEl}
            class="pamomong-answer-box is-hero-answer"
            class:is-abstain-box={hasilKrama.statusAman === false}
            class:is-just-updated={justUpdated}
            data-testid="studio-krama-result"
          >
            <div class="ai-answer-hero-head">
              <span class="ai-answer-title">
                <span
                  class="ai-answer-dot"
                  class:is-abstain={hasilKrama.statusAman === false}
                  aria-hidden="true"
                ></span>
                {tI18n(bahasa, 'kawruh.kramaHeading')}
              </span>
              <div class="ai-answer-head-actions">
                <span class="rag-model-pill">
                  {tI18n(bahasa, 'kawruh.modelBadge', { model: hasilKrama.modelNama })}
                </span>
                <button
                  type="button"
                  class="util-pill"
                  class:is-active={suaraStudioAktif === 'krama'}
                  onclick={() =>
                    suaraStudioAktif === 'krama'
                      ? hentikanSuaraStudio()
                      : putarkanSuaraStudio(hasilKrama, 'krama')}
                  data-testid="studio-krama-play-voice"
                >
                  {suaraStudioAktif === 'krama'
                    ? tI18n(bahasa, 'aiStudio.kramaStopVoice')
                    : tI18n(bahasa, 'aiStudio.kramaPlayVoice')}
                </button>
              </div>
            </div>
            {#if studioBusy}
              <div class="ai-answer-loading" role="status">
                <span class="ai-answer-spinner" aria-hidden="true"></span>
                <span>{tI18n(bahasa, 'kawruh.loadingBanner')}</span>
              </div>
            {/if}
            <div class="studio-card-stack">
              {#if hasilKrama.statusAman === false && hasilKrama.pesanKeamanan}
                <div class="studio-info-card" data-testid="studio-krama-guardrail-note">
                  <p class="studio-poet-note">{hasilKrama.pesanKeamanan}</p>
                </div>
              {/if}
              <div class="studio-info-card">
                <div class="eyebrow-mono">{tI18n(bahasa, 'aiStudio.kramaKramaLabel')}</div>
                <p class="studio-poet-verse">{hasilKrama.kramaInggil}</p>
              </div>
              <div class="studio-info-card">
                <div class="eyebrow-mono">{tI18n(bahasa, 'aiStudio.kramaNgokoLabel')}</div>
                <p>{hasilKrama.ngoko}</p>
              </div>
              <div class="studio-info-card">
                <div class="eyebrow-mono">{tI18n(bahasa, 'aiStudio.kramaScriptLabel')}</div>
                <p class="studio-poet-aksara" lang="jv">{hasilKrama.aksaraJawa}</p>
              </div>
              <div class="studio-info-card">
                <div class="eyebrow-mono">{tI18n(bahasa, 'aiStudio.kramaEtikaLabel')}</div>
                <p class="studio-poet-note">{hasilKrama.catatanEtika}</p>
              </div>
            </div>

            <div class="rag-telemetry-bar is-footer">
              {#if hasilKrama.statusAman === false}
                <span class="rag-status-tag is-abstain" data-testid="studio-krama-guardrail-badge">
                  {tI18n(bahasa, 'kawruh.statusAbstain')}
                </span>
              {/if}
              <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                {#each hasilKrama.sumber as ks}
                  <span class="source-badge">{ks}</span>
                {/each}
              </div>
            </div>
          </div>
        </div>
      {:else if modeStudio === 'tur'}
        <div class="studio-panel" data-testid="studio-panel-tur">
          <p class="studio-panel-lead">{tI18n(bahasa, 'aiStudio.turLead')}</p>
          <form onsubmit={(e) => void jalankanRuteTurAI(e)} class="studio-comp-controls">
            <label class="studio-select-wrap">
              <span>{tI18n(bahasa, 'aiStudio.turInterestLabel')}</span>
              <select bind:value={minatTur} class="studio-select" data-testid="studio-tur-minat">
                <option value="semua">{tI18n(bahasa, 'aiStudio.turMinat.semua')}</option>
                <option value="tosan">{tI18n(bahasa, 'aiStudio.turMinat.tosan')}</option>
                <option value="arsitektur">{tI18n(bahasa, 'aiStudio.turMinat.arsitektur')}</option>
                <option value="karawitan">{tI18n(bahasa, 'aiStudio.turMinat.karawitan')}</option>
                <option value="pakeliran">{tI18n(bahasa, 'aiStudio.turMinat.pakeliran')}</option>
              </select>
            </label>
            <label class="studio-select-wrap">
              <span>{tI18n(bahasa, 'aiStudio.turDurationLabel')}</span>
              <select bind:value={durasiTur} class="studio-select" data-testid="studio-tur-durasi">
                <option value="mendalam">{tI18n(bahasa, 'aiStudio.turDurasi.mendalam')}</option>
                <option value="kilat">{tI18n(bahasa, 'aiStudio.turDurasi.kilat')}</option>
              </select>
            </label>
            <button
              type="submit"
              class="pill-cta-white"
              disabled={studioBusy}
              data-testid="studio-tur-submit"
            >
              {studioBusy ? tI18n(bahasa, 'aiStudio.turLoading') : tI18n(bahasa, 'aiStudio.turSubmit')}
            </button>
          </form>

          <input
            type="text"
            maxlength="100"
            class="pamomong-query-input"
            style="width: 100%; margin-bottom: 12px;"
            bind:value={catatanTur}
            placeholder={tI18n(bahasa, 'aiStudio.turNotePlaceholder')}
            data-testid="studio-tur-note"
          />

          <div
            bind:this={answerBoxEl}
            class="pamomong-answer-box is-hero-answer"
            class:is-abstain-box={hasilTur.statusAman === false}
            class:is-just-updated={justUpdated}
            data-testid="studio-tur-result"
          >
            <div class="ai-answer-hero-head">
              <span class="ai-answer-title">
                <span
                  class="ai-answer-dot"
                  class:is-abstain={hasilTur.statusAman === false}
                  aria-hidden="true"
                ></span>
                {tI18n(bahasa, 'kawruh.turHeading')}
              </span>
              <div class="ai-answer-head-actions">
                <span class="rag-model-pill">
                  {tI18n(bahasa, 'kawruh.modelBadge', { model: hasilTur.modelNama })}
                </span>
              </div>
            </div>
            {#if studioBusy}
              <div class="ai-answer-loading" role="status">
                <span class="ai-answer-spinner" aria-hidden="true"></span>
                <span>{tI18n(bahasa, 'kawruh.loadingBanner')}</span>
              </div>
            {/if}
            {#if hasilTur.statusAman === false && hasilTur.pesanKeamanan}
              <div class="studio-info-card" data-testid="studio-tur-guardrail-note" style="margin-bottom: 10px;">
                <p class="studio-poet-note">{hasilTur.pesanKeamanan}</p>
              </div>
            {/if}

            <p style="margin: 0 0 12px; font-weight: 500;">{hasilTur.ringkasanRute}</p>

            <div class="studio-card-stack">
              {#each hasilTur.langkah as step, sIdx}
                <div class="studio-info-card studio-tur-step-card">
                  <div class="studio-tur-step-head">
                    <strong>0{sIdx + 1} · {step.judul}</strong>
                    <div style="display: flex; gap: 6px; align-items: center;">
                      {#each step.sumber as ks}
                        <span class="source-badge">{ks}</span>
                      {/each}
                      <button
                        type="button"
                        class="util-pill"
                        onclick={() => onMasukLangkahTur?.(step)}
                        data-testid="studio-tur-step-go-{sIdx}"
                      >
                        {tI18n(bahasa, 'aiStudio.turOpenRoom')}
                      </button>
                    </div>
                  </div>
                  <p class="studio-poet-note" style="margin-top: 6px;">{step.alasan}</p>
                </div>
              {/each}
            </div>

            <div class="rag-telemetry-bar is-footer">
              {#if hasilTur.statusAman === false}
                <span class="rag-status-tag is-abstain" data-testid="studio-tur-guardrail-badge">
                  {tI18n(bahasa, 'kawruh.statusAbstain')}
                </span>
              {/if}
              <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                {#each hasilTur.sumber as ks}
                  <span class="source-badge">{ks}</span>
                {/each}
              </div>
            </div>
          </div>
        </div>
      {:else}
        {@const soal = BANK_KUIS_S1_S7[kuisIdx]}
        <div class="studio-panel" data-testid="studio-panel-kuis">
          <div class="studio-quiz-head">
            <span class="eyebrow-mono">
              {tI18n(bahasa, 'aiStudio.quizProgress', {
                idx: kuisIdx + 1,
                total: BANK_KUIS_S1_S7.length,
                score: kuisSkor,
              })}
            </span>
            <button type="button" class="util-pill" onclick={ulangiKuis} data-testid="studio-quiz-reset">
              {tI18n(bahasa, 'aiStudio.quizReset')}
            </button>
          </div>
          <p class="studio-panel-lead">{tI18n(bahasa, 'aiStudio.quizLead')}</p>

          {#if kuisSelesai}
            <div class="pamomong-answer-box" data-testid="studio-quiz-done">
              <h3 style="margin: 0 0 8px; font-family: var(--font-display);">
                {tI18n(bahasa, 'aiStudio.quizDone', {
                  score: kuisSkor,
                  total: BANK_KUIS_S1_S7.length,
                })}
              </h3>
              <button type="button" class="pill-cta-white" onclick={ulangiKuis}>
                {tI18n(bahasa, 'aiStudio.quizReset')}
              </button>
            </div>
          {:else if soal}
            <div class="pamomong-answer-box" data-testid="studio-quiz-card">
              <div style="display: flex; gap: 6px; margin-bottom: 8px;">
                {#each soal.sumber as ks}
                  <span class="source-badge">{ks}</span>
                {/each}
              </div>
              <h3 class="studio-quiz-question">{ambilTeks(soal.pertanyaan, bahasa)}</h3>

              <div class="studio-quiz-options">
                {#each soal.pilihan as pil, optIdx}
                  <button
                    type="button"
                    class="studio-quiz-opt"
                    class:is-correct={kuisPilihan !== null && optIdx === soal.indeksBenar}
                    class:is-wrong={kuisPilihan === optIdx && optIdx !== soal.indeksBenar}
                    disabled={kuisPilihan !== null}
                    onclick={() => pilihJawabanKuis(optIdx)}
                    data-testid="studio-quiz-opt-{optIdx}"
                  >
                    <span>0{optIdx + 1}</span>
                    <span>{ambilTeks(pil, bahasa)}</span>
                  </button>
                {/each}
              </div>

              {#if kuisPilihan !== null}
                <div class="studio-quiz-feedback" data-testid="studio-quiz-feedback">
                  <strong>
                    {kuisPilihan === soal.indeksBenar
                      ? tI18n(bahasa, 'aiStudio.quizCorrect')
                      : tI18n(bahasa, 'aiStudio.quizWrong')}
                  </strong>
                  <p>{ambilTeks(soal.penjelasan, bahasa)}</p>
                  <button
                    type="button"
                    class="pill-cta-white"
                    onclick={lanjutSoalKuis}
                    data-testid="studio-quiz-next"
                  >
                    {tI18n(bahasa, 'aiStudio.quizNext')}
                  </button>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      {/if}
    </div>

    <div class="pamomong-orb-stage">
      <div class="pamomong-orb-status">
        <span class="eyebrow-mono">
          <span class="live-dot" aria-hidden="true"></span>
          {tI18n(bahasa, 'kawruh.orbName')}
        </span>
        <span class="pamomong-status-sep" aria-hidden="true">·</span>
        <span class="rag-metric">
          {sediaTanya || studioBusy ? tI18n(bahasa, 'kawruh.orbScanning') : tI18n(bahasa, 'kawruh.orbReady')}
        </span>
      </div>
      <div class="pamomong-orb-host" use:mountOrbStage aria-hidden="true"></div>
      <p class="pamomong-orb-caption">
        {tI18n(bahasa, 'kawruh.orbCaption')}
      </p>
    </div>
  </div>
</section>

<section id="aksara" class="band-section" style="padding-top: 20px;" aria-label={tI18n(bahasa, 'kawruh.aksaraH2')}>
  <div class="band-header">
    <div>
      <span class="eyebrow-mono">{tI18n(bahasa, 'kawruh.aksaraEyebrow')}</span>
      <h2 class="display-h2">
        {tI18n(bahasa, 'kawruh.aksaraH2')}
      </h2>
    </div>
    <div style="font-size: 0.9rem; color: var(--text-secondary);">
      {tI18n(bahasa, 'kawruh.selectedSample')} <strong>{kartuCarakanTerpilih.contohKata}</strong> =
      <span style="font-family: var(--font-jawa); font-size: 1.3rem;" lang="jv">
        {kartuCarakanTerpilih.contohAksara}
      </span>
      ({ambilTeks(kartuCarakanTerpilih.artiContoh, bahasa)})
    </div>
  </div>

  <div style="display: grid; gap: 14px;">
    <label for="input-latin-aksara" class="sr-only">{tI18n(bahasa, 'kawruh.aksaraPlaceholder')}</label>
    <input
      id="input-latin-aksara"
      type="text"
      bind:value={inputAksaraLatin}
      placeholder={tI18n(bahasa, 'kawruh.aksaraPlaceholder')}
      style="width: 100%; padding: 15px 18px; border-radius: 14px; border: 1px solid var(--border-strong); background: var(--bg-card); color: var(--text-primary); font-size: 1rem;"
      data-testid="input-aksara"
    />
    <div class="aksara-preview-shell">
      <div class="aksara-preview-output" lang="jv" data-testid="output-aksara">
        {aksaraTerkonversi || 'ꦏꦼꦭꦶꦂ'}
      </div>
      <button
        type="button"
        class="util-pill aksara-copy-btn"
        onclick={salinAksara}
        aria-label={tI18n(bahasa, 'kawruh.copyBtn')}
      >
        {aksaraTersalin ? tI18n(bahasa, 'kawruh.copiedBtn') : tI18n(bahasa, 'kawruh.copyBtn')}
      </button>
    </div>
  </div>

  <div class="aksara-grid">
    {#each DAFTAR_CARAKAN as c, i}
      <button
        type="button"
        class="carakan-card"
        use:pasangReveal={i}
        onclick={() => onPilihCarakan(c)}
      >
        <span class="carakan-glyph" lang="jv">{c.aksara}</span>
        <strong style="font-size: 0.9rem;">{c.latin}</strong>
        <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">{c.contohKata}</div>
      </button>
    {/each}
  </div>

  <!-- Duet Kawruh Filosofi -->
  <div class="two-col-editorial" style="margin-top: 36px;">
    {#each KAWRUH_FILOSOFI as k, i}
      <div class="editorial-pillar-card" use:pasangReveal={i}>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="eyebrow-mono">{k.istilah}</span>
          <span class="source-badge">{k.sumber.join(', ')}</span>
        </div>
        <div style="font-family: var(--font-jawa); font-size: 1.45rem; margin: 10px 0 4px;" lang="jv">
          {k.aksara}
        </div>
        <h3 style="margin: 0 0 8px; font-family: var(--font-display); font-size: 1.25rem;">
          {ambilTeks(k.judul, bahasa)}
        </h3>
        <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">
          {ambilTeks(k.makna, bahasa)}
        </p>
      </div>
    {/each}
  </div>

  <!-- Daftar Rujukan Pustaka Resmi S1-S7 -->
  <div id="sumber" class="sources-ledger-wrap">
    <span class="eyebrow-mono">{tI18n(bahasa, 'kawruh.bibEyebrow')}</span>
    <div class="sources-ledger">
      {#each Object.values(DAFTAR_SUMBER) as s, i}
        <a
          href={s.tautan}
          target="_blank"
          rel="noopener noreferrer"
          class="source-ledger-row"
          use:pasangReveal={i}
        >
          <div class="source-ledger-code">
            <strong class="source-badge">{s.kode} · {s.tahun}</strong>
            <span>{ambilTeks(s.lembaga, bahasa)}</span>
          </div>
          <div class="source-ledger-body">
            <div class="source-ledger-title">{ambilTeks(s.judul, bahasa)}</div>
            <div class="source-ledger-desc">{ambilTeks(s.ringkasan, bahasa)}</div>
          </div>
          <span class="source-ledger-arrow">{tI18n(bahasa, 'kawruh.archiveLink')}</span>
        </a>
      {/each}
    </div>
  </div>
</section>
