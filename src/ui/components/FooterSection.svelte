<script lang="ts">
  import { DAFTAR_BENDA, ambilTeks, type BendaPusaka } from '../../content/pusaka.ts';

  interface HalamanSummary {
    id: string;
    nomor: string;
    label: string;
  }

  interface Props {
    daftarHalaman: HalamanSummary[];
    onPindahHalaman: (id: string) => void;
    onPilihPusaka: (id: BendaPusaka['id'], bukaTwin?: boolean) => void;
  }

  let { daftarHalaman, onPindahHalaman, onPilihPusaka }: Props = $props();
</script>

<footer class="site-footer">
  <div class="footer-columns">
    <div>
      <div style="font-family: var(--font-display); font-size: 1.85rem; font-weight: 700; line-height: 1.08;">
        Pelestarian Budaya Jawa di Ruang Spasial 3D.
      </div>
      <p style="color: var(--text-secondary); font-size: 0.88rem; margin-top: 10px; line-height: 1.55;">
        Eksibisi lima ruang tematik yang memadukan diorama arsitektur Pendopo, bedah anatomi CAD berpresisi, audio karawitan prosedural, serta pelacakan tangan lokal di peramban.
      </p>
    </div>

    <div>
      <div class="eyebrow-mono" style="margin-bottom: 12px;">5 RUANG KURASI</div>
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
      <div class="eyebrow-mono" style="margin-bottom: 12px;">KOLEKSI PUSAKA 3D</div>
      <div style="display: grid; gap: 8px; font-size: 0.88rem; color: var(--text-secondary);">
        {#each DAFTAR_BENDA as b}
          <button
            type="button"
            class="footer-page-link"
            onclick={() => onPilihPusaka(b.id, true)}
          >
            {b.nomorUrut} · {ambilTeks(b.nama, 'id')}
          </button>
        {/each}
      </div>
    </div>

    <div>
      <div class="eyebrow-mono" style="margin-bottom: 12px;">KEPUSTAKAAN &amp; PRIVASI</div>
      <div style="font-size: 0.84rem; color: var(--text-secondary); line-height: 1.55;">
        Terhubung ke arsip UNESCO ICH, Museum Sonobudoyo, Kemdikbud RI, dan Perpusnas RI (S1–S7). Kamera dan audio berjalan 100% lokal di perangkat Anda.
      </div>
    </div>
  </div>

  <div class="footer-colophon-bar">
    <span>KELIR · ꦏꦼꦭꦶꦂ · ARSIP SPASIAL WARISAN NUSANTARA</span>
    <span>KODE ARSIP KLR-01 — KLR-12 · STANDAR HANACARAKA UNICODE U+A980</span>
  </div>

  <div class="footer-giant-logo" aria-hidden="true">KELIR</div>
</footer>
