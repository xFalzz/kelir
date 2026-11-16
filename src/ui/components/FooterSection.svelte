<script lang="ts">
  import { DAFTAR_BENDA, ambilTeks, type BahasaAktif, type BendaPusaka } from '../../content/pusaka.ts';
  import { tI18n } from '../../lib/i18n.ts';

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
  }

  let { bahasa, daftarHalaman, onPindahHalaman, onPilihPusaka }: Props = $props();
</script>

<footer class="site-footer">
  <div class="footer-columns">
    <div>
      <div style="font-family: var(--font-display); font-size: 1.85rem; font-weight: 700; line-height: 1.08;">
        {tI18n(bahasa, 'footer.headline')}
      </div>
      <p style="color: var(--text-secondary); font-size: 0.88rem; margin-top: 10px; line-height: 1.55;">
        {tI18n(bahasa, 'footer.lead')}
      </p>
    </div>

    <div>
      <div class="eyebrow-mono" style="margin-bottom: 12px;">{tI18n(bahasa, 'footer.colSpaces')}</div>
      <div style="display: grid; gap: 8px; font-size: 0.88rem; color: var(--text-secondary);">
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
      <div class="eyebrow-mono" style="margin-bottom: 12px;">{tI18n(bahasa, 'footer.colArtifacts')}</div>
      <div style="display: grid; gap: 8px; font-size: 0.88rem; color: var(--text-secondary);">
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
      <div class="eyebrow-mono" style="margin-bottom: 12px;">{tI18n(bahasa, 'footer.colPrivacy')}</div>
      <div style="font-size: 0.84rem; color: var(--text-secondary); line-height: 1.55;">
        {tI18n(bahasa, 'footer.privacyCopy')}
      </div>
    </div>
  </div>

  <div class="footer-colophon-bar">
    <span>{tI18n(bahasa, 'footer.colophon1')}</span>
    <span>{tI18n(bahasa, 'footer.colophon2')}</span>
  </div>

  <div class="footer-giant-logo" aria-hidden="true">KELIR</div>
</footer>
