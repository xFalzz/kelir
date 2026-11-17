<script lang="ts">
  import { onMount } from 'svelte';
  import { DAFTAR_BENDA, ambilTeks, type BahasaAktif, type BendaPusaka } from '../../content/pusaka.ts';
  import { tI18n } from '../../lib/i18n.ts';
  import { ambilTahunHakCipta } from '../../lib/seoGeo.ts';

  interface HalamanSummary {
    id: string;
    nomor: string;
    label: string;
  }

  interface Props {
    bahasa: BahasaAktif;
    daftarHalaman: HalamanSummary[];
    onPindahHalaman: (id: string) => void;
    onPilihPusaka: (id: BendaPusaka['id'], bukaTwin?: boolean) => void;
    onBukaLegal?: (tab: 'syarat' | 'privasi' | 'kontak') => void;
    onPreloadLegal?: () => void;
    pwaTerpasang?: boolean;
    pwaPromptTersedia?: boolean;
    pwaIosSafari?: boolean;
    pwaPanduanTerbuka?: boolean;
    onPasangPwa?: () => void;
  }

  let {
    bahasa,
    daftarHalaman,
    onPindahHalaman,
    onPilihPusaka,
    onBukaLegal,
    onPreloadLegal,
    pwaTerpasang = false,
    pwaPromptTersedia = false,
    pwaIosSafari = false,
    pwaPanduanTerbuka = false,
    onPasangPwa,
  }: Props = $props();

  // Tahun hak cipta diperbarui otomatis setiap mount, jeda pergantian hari/tahun, maupun focus ulang tab
  let tahunHakCipta = $state(ambilTahunHakCipta());

  onMount(() => {
    const segarkanTahun = () => {
      const thBaru = ambilTahunHakCipta();
      if (thBaru !== tahunHakCipta) {
        tahunHakCipta = thBaru;
      }
    };
    segarkanTahun();
    const timer = window.setInterval(segarkanTahun, 60_000);
    document.addEventListener('visibilitychange', segarkanTahun);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', segarkanTahun);
    };
  });
</script>

<footer class="site-footer">
  <div class="footer-columns">
    <div class="footer-brand-col">
      <div class="footer-headline">
        {tI18n(bahasa, 'footer.headline')}
      </div>
      <p class="footer-lead-copy">
        {tI18n(bahasa, 'footer.lead')}
      </p>
    </div>

    <div>
      <div class="eyebrow-mono footer-col-title">{tI18n(bahasa, 'footer.colSpaces')}</div>
      <div class="footer-link-stack">
        {#each daftarHalaman as hal}
          <button
            type="button"
            class="footer-page-link"
            onclick={() => onPindahHalaman(hal.id)}
          >
            {hal.nomor} · {hal.label}
          </button>
        {/each}
      </div>
    </div>

    <div>
      <div class="eyebrow-mono footer-col-title">{tI18n(bahasa, 'footer.colArtifacts')}</div>
      <div class="footer-link-stack">
        {#each DAFTAR_BENDA as b}
          <button
            type="button"
            class="footer-page-link"
            onclick={() => onPilihPusaka(b.id, true)}
          >
            {b.nomorUrut} · {ambilTeks(b.nama, bahasa)}
          </button>
        {/each}
      </div>
    </div>

    <div>
      <div class="eyebrow-mono footer-col-title">{tI18n(bahasa, 'footer.colPrivacy')}</div>
      <div class="footer-privacy-copy">
        {tI18n(bahasa, 'footer.privacyCopy')}
      </div>
      {#if onBukaLegal}
        <nav class="footer-legal-links" aria-label={tI18n(bahasa, 'footer.legalBarAria')}>
          <button
            type="button"
            class="footer-legal-btn"
            onpointerenter={() => onPreloadLegal?.()}
            onclick={() => onBukaLegal('syarat')}
            data-testid="footer-link-syarat"
          >
            {tI18n(bahasa, 'footer.termsBtn')}
          </button>
          <button
            type="button"
            class="footer-legal-btn"
            onpointerenter={() => onPreloadLegal?.()}
            onclick={() => onBukaLegal('privasi')}
            data-testid="footer-link-privasi"
          >
            {tI18n(bahasa, 'footer.privacyBtn')}
          </button>
          <button
            type="button"
            class="footer-legal-btn is-accent"
            onpointerenter={() => onPreloadLegal?.()}
            onclick={() => onBukaLegal('kontak')}
            data-testid="footer-link-kontak"
          >
            {tI18n(bahasa, 'footer.contactBtn')}
          </button>
        </nav>
      {/if}
    </div>
  </div>

  <div class="footer-colophon-bar">
    <span>{tI18n(bahasa, 'footer.colophon1')}</span>
    <span>{tI18n(bahasa, 'footer.colophon2')}</span>
  </div>

  <div class="footer-copyright-row">
    <span class="footer-copyright-text" data-testid="footer-copyright">
      {tI18n(bahasa, 'footer.copyright', { year: tahunHakCipta })}
    </span>

    <div class="footer-pwa-wrap">
      {#if onPasangPwa}
        <button
          type="button"
          class="footer-pwa-btn"
          class:is-installed={pwaTerpasang}
          class:is-ready={pwaPromptTersedia && !pwaTerpasang}
          onclick={onPasangPwa}
          disabled={pwaTerpasang}
          aria-expanded={pwaPanduanTerbuka}
          data-testid="btn-install-pwa"
        >
          <svg class="footer-pwa-ico" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M8 2.2v7.3m0 0L5.3 6.8M8 9.5l2.7-2.7M3 12.2v.6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-.6"
              stroke="currentColor"
              stroke-width="1.45"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>
            {pwaTerpasang ? tI18n(bahasa, 'footer.installedApp') : tI18n(bahasa, 'footer.installApp')}
          </span>
        </button>
      {/if}
    </div>
  </div>

  {#if pwaPanduanTerbuka && !pwaTerpasang}
    <div class="footer-pwa-guide" role="status" data-testid="pwa-install-guide">
      {pwaIosSafari
        ? tI18n(bahasa, 'footer.installGuideIos')
        : tI18n(bahasa, 'footer.installGuideChrome')}
    </div>
  {/if}

  <div class="footer-giant-logo" aria-hidden="true">KELIR</div>
</footer>
