# KELIR (`ꦏꦼꦭꦶꦂ`) · Sistem Desain Spasial 3D

Panduan arah desain antarmuka dan ruang 3D **KELIR** dalam 5 halaman terpadu (`beranda`, `twin`, `koleksi`, `pakeliran`, `kawruh`).

## 1. Palet Warna & Mode Tampilan

| Token | Terang (Default) | Malam (`Smoked Obsidian`) | Fungsi |
| :--- | :--- | :--- | :--- |
| `--bg-void` | `#f6f4ef` | `#12100e` | Latar kanvas utama |
| `--bg-black` | `#eeebe2` | `#181512` | Kanvas etalase & indeks |
| `--bg-card` | `rgba(255, 255, 255, 0.9)` | `rgba(29, 25, 21, 0.92)` | Kartu, bilah kontrol, dan modal |
| `--text-primary` | `#141518` | `#f4efe6` | Tajuk utama dan teks primer |
| `--text-secondary` | `#434852` | `#c7bfb3` | Teks deskripsi dan metadata |
| `--accent-ember` | `#d1491b` | `#f06d3c` | Kawat X-Ray CAD & sorotan aktif |
| `--accent-crimson` | `#b33025` | `#db5647` | Aksen arsip dan peringatan |
| `--accent-gold` | `#9a6c1d` | `#e0b35a` | Prada wayang, kuningan & saron |
| `--pill-cta-bg` | `#141518` | `#efe9dc` | Tombol aksi utama obsidian/gading |

## 2. Tipografi Luring (`@fontsource`)
- **Display & Judul**: `'Space Grotesk Variable'`, `'Archivo Black'`, sans-serif
- **Teks Tubuh**: `'Inter'`, sans-serif
- **Kode & Metadata**: `'JetBrains Mono'`, monospace
- **Aksara Jawa**: `'Noto Sans Javanese'` (`U+A980-U+A9DF`)

## 3. Prinsip Antarmuka & Panggung 3D
1. Setiap halaman me-mount maksimal satu konteks WebGL aktif (`LivingPendopoStage`, `DigitalTwinStage`, `CoverflowStage`, `WayangStage`, `PamomongOrbStage`, dan `SulukShowcaseStage` di dalam modal).
2. Pop-up modal (`LegalInfoModal`, `SearchModal`, `SulukModal`) menjaga penguncian gulir halaman latar (`has-modal-open` + wheel/touch guard).
3. Pelacakan kamera `MediaPipe Hands` berjalan lokal dari `/public/mediapipe/` tanpa mengirim data gambar keluar perangkat.
4. Mendukung pengurangan gerak (`prefers-reduced-motion: reduce`), skala teks (`A / A+`), serta penonaktifan kursor kustom pada perangkat sentuh.
