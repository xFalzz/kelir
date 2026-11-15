# Panduan Pengembangan & Kustomisasi Pusaka

## 1. Menambah atau Memperbarui Benda Pusaka

Buka `src/content/pusaka.ts`. Setiap entri di `DAFTAR_BENDA` memuat struktur:
- `id`: Pengenal unik (`keris`, `saron`, `batik`, `joglo`, `wayang`).
- `nama`, `subjudul`, `kategori`, `asal`: Tersedia dalam `id` dan `jw` (*MultiTeks*).
- `badgeStatus`: Tag status visual untuk Coverflow dan Daftar Indeks.
- `sulukLarik`: Array larik kawruh/puisi budaya (5–6 baris) untuk **Modal Pemutar Layar Penuh** agar dapat disorot baris demi baris.
- `titikInfo`: Daftar titik koordinat 3D (`[x, y, z]`) beserta judul, ringkasan, dan daftar kode sumber (`S1..S7`).
- `pertanyaanContoh`: Tombol cepat untuk asisten Pamomong AI.

Saat menambah pusaka baru, tambahkan pula pembangun objek geometrisnya pada `DigitalTwinStage.ts` di `src/scenes/digitalTwinStage.ts` beserta properti `userData.explodeOffset` pada tiap sub-grup agar fitur **Ledak Anatomi** bekerja otomatis.

## 2. Mengubah Gaya & Mode Warna

Semua variabel desain dikelola di `:root` pada `src/app.css`. Pastikan perubahan pada mode gelap (`[data-theme='malam']`) diselaraskan pula pada `[data-theme='terang']` agar rasio kontras teks tetap nyaman dibaca.

## 3. Pengujian & Inspeksi Visual

Pengujian Playwright di `tests/e2e/kelir.spec.ts` memverifikasi:
- Preloader selesai mulus tanpa menghalangi interaksi.
- Transisi antar panggung (Coverflow, Modal Suluk, Filter Etalase, Digital Twin X-Ray, Panggung Pakeliran, Lab Aksara, Mode Terang/Malam, dan Pengalihan Bahasa).
- Responsivitas tata letak di viewport Desktop (`1440×900`) dan Ponsel (`390×844`) tanpa guliran horizontal (`scrollWidth <= innerWidth`).
