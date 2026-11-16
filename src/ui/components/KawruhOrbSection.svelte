<script lang="ts">
  import type { Action } from 'svelte/action';
  import {
    DAFTAR_SUMBER,
    KAWRUH_FILOSOFI,
    ambilTeks,
    type BahasaAktif,
    type BendaPusaka,
    type KodeSumber,
  } from '../../content/pusaka.ts';
  import { DAFTAR_CARAKAN, type KartuCarakan } from '../../lib/aksara.ts';
  import type { HasilTanya } from '../../lib/tanya.ts';

  interface Props {
    bahasa: BahasaAktif;
    teksSesuaiBahasa: (teksId: string, teksJw?: string) => string;
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
  }

  let {
    bahasa,
    teksSesuaiBahasa,
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
  }: Props = $props();

  let aksaraTersalin = $state(false);
  let copyTimer: ReturnType<typeof setTimeout> | null = null;

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
    jawabanPamomong.statusGrounding === 'terbukti'
      ? 'TERBUKTI S1–S7 · BM25 RAG'
      : jawabanPamomong.statusGrounding === 'ringkasan-benda'
        ? 'RINGKASAN ARSIP S1–S7'
        : 'LUAR CAKUPAN KORPUS',
  );
</script>

<section id="pamomong" class="band-section" aria-label="Asisten Pamomong AI Orb & Lab Aksara">
  <div class="pamomong-grid">
    <div>
      <span class="eyebrow-mono">HALAMAN 05 · PAMOMONG RETRIEVAL ENGINE · GROUNDING S1–S7</span>
      <h1 class="display-h2">
        {teksSesuaiBahasa(
          'Tanya Pustaka Budaya Berbasis Rujukan',
          'Pitakonan Pustaka Budaya Mawa Rujukan',
        )}
      </h1>
      <p style="color: var(--text-secondary); margin: 14px 0 22px; line-height: 1.58;">
        Ajukan pertanyaan mengenai filosofi pusaka, struktur konstruksi, atau lakon pakeliran. Mesin temu-balik BM25 mengevaluasi relevansi dari basis pengetahuan <strong>S1–S7</strong> serta menolak halusinasi di luar arsip.
      </p>

      <div class="pamomong-prompt-chips">
        {#each bendaAktif.pertanyaanContoh as contohQ}
          <button
            type="button"
            class="util-pill is-wrap"
            onclick={() => onPilihContohPertanyaan(contohQ)}
          >
            {contohQ}
          </button>
        {/each}
        <button
          type="button"
          class="util-pill is-wrap"
          onclick={() => onPilihContohPertanyaan('Siapa penemu mesin uap modern?')}
          title="Uji mekanisme penolakan tegas untuk pertanyaan di luar pustaka S1–S7"
        >
          Uji Penolakan Luar-Korpus
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
          placeholder="Tanyakan soal {ambilTeks(bendaAktif.nama, 'id')} atau Ramayana..."
        />
        <button type="submit" class="pill-cta-white" disabled={sediaTanya}>
          {sediaTanya ? 'Menganalisis Korpus...' : 'Tanya Pamomong \u2192'}
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
          <span class="rag-metric">
            Keyakinan <strong>{jawabanPamomong.skorKeyakinan}%</strong> · {jawabanPamomong.latensiMs} ms
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
          <div class="rag-evidence-list" aria-label="Bukti Primer Terambil">
            <div class="eyebrow-mono" style="font-size: 0.66rem; margin-bottom: 6px;">
              Rujukan Terambil ({jawabanPamomong.butirBukti.length} fragmen terperingkat)
            </div>
            {#each jawabanPamomong.butirBukti as bukti}
              <div class="rag-evidence-row">
                <div class="rag-evidence-head">
                  <strong>{bukti.judul}</strong>
                  <span>Relevansi {bukti.skorRelatif}% · {bukti.sumber.join(', ')}</span>
                </div>
                <p class="rag-evidence-quote">{bukti.kutipan}</p>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <div class="pamomong-orb-stage">
      <div class="pamomong-orb-status">
        <span class="eyebrow-mono">
          <span class="live-dot" aria-hidden="true"></span>
          PAMOMONG ASTROLABE 3D
        </span>
        <span class="pamomong-status-sep" aria-hidden="true">·</span>
        <span class="rag-metric">
          {sediaTanya ? 'Memindai Korpus...' : 'Siap Menjawab'}
        </span>
      </div>
      <div class="pamomong-orb-host" use:mountOrbStage aria-hidden="true"></div>
      <p class="pamomong-orb-caption">
        SERET UNTUK ORBIT · KORPUS S1–S7 · NOL HALUSINASI
      </p>
    </div>
  </div>
</section>

<section id="aksara" class="band-section" style="padding-top: 20px;" aria-label="Lab Aksara Jawa Hanacaraka">
  <div class="band-header">
    <div>
      <span class="eyebrow-mono">HANACARAKA · UNICODE U+A980–U+A9DF (S7)</span>
      <h2 class="display-h2">
        {teksSesuaiBahasa('Lab Aksara & Filosofi Carakan', 'Lab Aksara saha Carakan Jawi')}
      </h2>
    </div>
    <div style="font-size: 0.9rem; color: var(--text-secondary);">
      Contoh dipilih: <strong>{kartuCarakanTerpilih.contohKata}</strong> =
      <span style="font-family: var(--font-jawa); font-size: 1.3rem;" lang="jv">
        {kartuCarakanTerpilih.contohAksara}
      </span>
      ({kartuCarakanTerpilih.artiContoh})
    </div>
  </div>

  <div style="display: grid; gap: 14px;">
    <label for="input-latin-aksara" class="sr-only">Ketik teks Latin untuk diubah ke Aksara Jawa</label>
    <input
      id="input-latin-aksara"
      type="text"
      bind:value={inputAksaraLatin}
      placeholder="Ketik kalimat Latin (misal: kelir pusaka jawa)"
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
        aria-label="Salin Aksara Jawa ke Papan Klip"
      >
        {aksaraTersalin ? 'Tersalin \u2713' : 'Salin Aksara'}
      </button>
    </div>
  </div>

  <div class="aksara-grid">
    {#each DAFTAR_CARAKAN as c}
      <button
        type="button"
        class="carakan-card"
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
    {#each KAWRUH_FILOSOFI as k}
      <div class="editorial-pillar-card">
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
    <span class="eyebrow-mono">DAFTAR PUSTAKA &amp; SUMBER PRIMER TERVERIFIKASI</span>
    <div class="sources-ledger">
      {#each Object.values(DAFTAR_SUMBER) as s}
        <a
          href={s.tautan}
          target="_blank"
          rel="noopener noreferrer"
          class="source-ledger-row"
        >
          <div class="source-ledger-code">
            <strong class="source-badge">{s.kode} · {s.tahun}</strong>
            <span>{s.lembaga}</span>
          </div>
          <div class="source-ledger-body">
            <div class="source-ledger-title">{s.judul}</div>
            <div class="source-ledger-desc">{s.ringkasan}</div>
          </div>
          <span class="source-ledger-arrow">Arsip &#8599;</span>
        </a>
      {/each}
    </div>
  </div>
</section>
