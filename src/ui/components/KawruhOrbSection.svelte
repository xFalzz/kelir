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
    mintaPujanggaAI,
    susunPujanggaLokal,
    type KomparasiResult,
    type PujanggaResult,
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
  }: Props = $props();

  let aksaraTersalin = $state(false);
  let copyTimer: ReturnType<typeof setTimeout> | null = null;

  // Multi-Mode AI Studio State
  let modeStudio: 'tanya' | 'banding' | 'pujangga' | 'kuis' = $state('tanya');
  let studioBusy = $state(false);

  // Mode 2: Komparator Dua Pusaka AI
  let bandingIdA: SpesimenBedahId = $state('keris');
  let bandingIdB: SpesimenBedahId = $state('joglo');
  let hasilKomparasi: KomparasiResult = $state(bandingkanPusakaLokal('keris', 'joglo', 'id'));

  // Mode 3: Asisten Pujangga & Suara Jawa AI
  let temaPujangga = $state('Harmoni pendopo dan alam');
  let hasilPujangga: PujanggaResult = $state(susunPujanggaLokal('Harmoni pendopo dan alam', 'id'));
  let pujanggaSuaraAktif = $state(false);
  let pujanggaAudioEl: HTMLAudioElement | null = null;
  let pujanggaAudioUrl: string | null = null;

  // Mode 4: Kuis Kuratorial S1-S7
  let kuisIdx = $state(0);
  let kuisSkor = $state(0);
  let kuisPilihan: number | null = $state(null);
  let kuisSelesai = $state(false);

  $effect(() => {
    const b = bahasa;
    hasilKomparasi = bandingkanPusakaLokal(bandingIdA, bandingIdB, b);
    hasilPujangga = susunPujanggaLokal(temaPujangga, b);
  });

  function hentikanSuaraPujangga(): void {
    hentikanWebSpeech();
    audioBudaya.aturVolumeLatar(false);
    if (pujanggaAudioEl) {
      pujanggaAudioEl.pause();
      pujanggaAudioEl.src = '';
      pujanggaAudioEl = null;
    }
    if (pujanggaAudioUrl) {
      URL.revokeObjectURL(pujanggaAudioUrl);
      pujanggaAudioUrl = null;
    }
    pujanggaSuaraAktif = false;
  }

  onDestroy(() => {
    hentikanSuaraPujangga();
    if (copyTimer) clearTimeout(copyTimer);
  });

  async function jalankanKomparasiAI(): Promise<void> {
    studioBusy = true;
    hasilKomparasi = await mintaKomparasiAI(bandingIdA, bandingIdB, bahasa);
    studioBusy = false;
  }

  async function jalankanPujanggaAI(e?: SubmitEvent): Promise<void> {
    if (e) e.preventDefault();
    hentikanSuaraPujangga();
    studioBusy = true;
    const res = await mintaPujanggaAI(temaPujangga, bahasa);
    hasilPujangga = res;
    studioBusy = false;
    putarkanSuaraPujangga(res);
  }

  function putarkanSuaraPujangga(target: PujanggaResult = hasilPujangga): void {
    hentikanSuaraPujangga();
    if (target.audioBase64 && target.mimeType && typeof Audio !== 'undefined') {
      try {
        const blobUrl = base64AudioKeBlobUrl(target.audioBase64, target.mimeType);
        pujanggaAudioUrl = blobUrl;
        const audio = new Audio(blobUrl);
        pujanggaAudioEl = audio;
        pujanggaSuaraAktif = true;
        audioBudaya.aturVolumeLatar(true);
        audio.onended = () => hentikanSuaraPujangga();
        audio.onerror = () => hentikanSuaraPujangga();
        void audio.play().catch(() => {
          hentikanSuaraPujangga();
          putarkanWebSpeech(
            target.naskahSuara,
            target.kodeBcp47,
            () => {
              pujanggaSuaraAktif = true;
              audioBudaya.aturVolumeLatar(true);
            },
            () => {
              pujanggaSuaraAktif = false;
              audioBudaya.aturVolumeLatar(false);
            },
          );
        });
        return;
      } catch {
        // Lanjut ke Web Speech API
      }
    }
    putarkanWebSpeech(
      target.naskahSuara,
      target.kodeBcp47,
      () => {
        pujanggaSuaraAktif = true;
        audioBudaya.aturVolumeLatar(true);
      },
      () => {
        pujanggaSuaraAktif = false;
        audioBudaya.aturVolumeLatar(false);
      },
    );
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
            class="pamomong-query-input"
            bind:value={pertanyaanInput}
            placeholder={tI18n(bahasa, 'kawruh.placeholder', { nama: ambilTeks(bendaAktif.nama, bahasa) })}
          />
          <button type="submit" class="pill-cta-white" disabled={sediaTanya}>
            {sediaTanya ? tI18n(bahasa, 'kawruh.submitLoading') : tI18n(bahasa, 'kawruh.submitAsk')}
          </button>
        </form>

        <div class="pamomong-answer-box" data-testid="jawaban-pamomong">
          <div class="rag-telemetry-bar">
            <span
              class="rag-status-tag"
              class:is-abstain={jawabanPamomong.statusGrounding === 'luar-korpus'}
            >
              {statusLabel}
            </span>
            <span class="rag-model-pill" data-testid="pamomong-model-badge">
              {tI18n(bahasa, 'kawruh.modelBadge', { model: jawabanPamomong.modelNama })}
            </span>
            <span class="rag-metric">
              {tI18n(bahasa, 'kawruh.confidence')} <strong>{jawabanPamomong.skorKeyakinan}%</strong> · {jawabanPamomong.latensiMs} ms
            </span>
          </div>

          <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px;">
            {#each jawabanPamomong.sumber as ks}
              <span class="source-badge">{formatSumberLabel(ks)}</span>
            {/each}
            {#each jawabanPamomong.kataKunciCocok as kw}
              <span class="kw-chip">#{kw}</span>
            {/each}
          </div>

          <div class="pamomong-answer-prose">
            {#each jawabanPamomong.jawaban.split('\n\n') as paragraf}
              <p>{paragraf}</p>
            {/each}
          </div>

          {#if jawabanPamomong.butirBukti.length > 0}
            <div class="rag-evidence-list" aria-label={tI18n(bahasa, 'kawruh.retrievedEyebrow', { count: jawabanPamomong.butirBukti.length })}>
              <div class="eyebrow-mono" style="font-size: 0.66rem; margin-bottom: 6px;">
                {tI18n(bahasa, 'kawruh.retrievedEyebrow', { count: jawabanPamomong.butirBukti.length })}
              </div>
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

          <div class="pamomong-answer-box" data-testid="studio-comp-result">
            <div class="rag-telemetry-bar">
              <span class="rag-model-pill">
                {tI18n(bahasa, 'kawruh.modelBadge', { model: hasilKomparasi.modelNama })}
              </span>
              <span class="rag-metric">{hasilKomparasi.latensiMs} ms</span>
              {#each hasilKomparasi.sumber as ks}
                <span class="source-badge">{ks}</span>
              {/each}
            </div>

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

          <div class="pamomong-answer-box" data-testid="studio-poet-result">
            <div class="rag-telemetry-bar">
              <span class="rag-model-pill">
                {tI18n(bahasa, 'kawruh.modelBadge', { model: hasilPujangga.modelNama })}
              </span>
              {#each hasilPujangga.sumber as ks}
                <span class="source-badge">{ks}</span>
              {/each}
              <button
                type="button"
                class="util-pill"
                class:is-active={pujanggaSuaraAktif}
                onclick={() => (pujanggaSuaraAktif ? hentikanSuaraPujangga() : putarkanSuaraPujangga())}
                data-testid="studio-poet-play-voice"
              >
                {pujanggaSuaraAktif
                  ? tI18n(bahasa, 'aiStudio.poetStopVoice')
                  : tI18n(bahasa, 'aiStudio.poetPlayVoice')}
              </button>
            </div>

            <div class="studio-card-stack">
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
