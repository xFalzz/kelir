# Aturan untuk Agen AI di Repo Kelir

Baca berurutan sebelum bekerja:

1. `DESIGN.md`: arah visual, palet teruji WCAG AA, tipografi OFL, dan dial `ENERGY 3 / RHYTHM 3 / MOTION 3`.
2. Aturan `antislop` (mode aktif: **DURING**). Jalankan Delivery Gate sebelum menyatakan pekerjaan selesai.
3. `docs/09-alur-kerja.md`: cara commit, debug, pembersihan kode, dan pengujian E2E.

## Larangan Mutlak

- Mengarang fakta budaya, sumber, statistik, nama narasumber, atau testimoni (R-17, R-18, R-36, R-38).
- Menggunakan karakter em dash di dalam teks UI maupun dokumentasi proyek (R-02).
- Menyalin tampilan, kode, atau gambar wayang dari proyek pihak lain (R-30).
- Menaruh kunci API di dalam kode sumber, riwayat git, atau log.
- Mengubah file sumber menggunakan skrip penambal string (R-33).
- Menyatakan selesai sebelum menjalankan build, unit test, dan uji klik E2E (R-35).

<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, read `antislop.md` (core) and then the skill for the task:
- UI / visual: `skills/antislop-ui/SKILL.md`
- Copy & text: `skills/antislop-copywriting/SKILL.md`
- People: `skills/antislop-human/SKILL.md`
- Mobile / responsive: `skills/antislop-layoutmobile/SKILL.md`
- Code comments: `skills/antislop-code/SKILL.md`
Before starting, follow the core's "Two Usage Modes" section in strict order: explicit session instruction first, then global preference, then ask. A session instruction always wins. For a resolved mode, say `antislop active: <mode> (session override).` or `antislop active: <mode> (global preference).` once before presenting findings or making edits, using the actual mode and source. Acknowledging the user's request without naming the source does not replace this notice.
Only an explicit choice of antislop during or after selects a session mode. A request to review, audit, or avoid file edits does not select a mode; read the global preference in that case. Another skill's mode does not select antislop's mode.
If the mode is unresolved, ask during/after and end the response; wait for the answer before any UI review, planning, or concept. For read-only tasks, put the active-mode notice only at the start of the final answer, never in progress messages. For editing tasks, announce before the first edit and omit it from the final answer.
To update antislop later: download `antislop.md` again, or run `npx antislop-ai --update` if it was installed as skill folders.
<!-- antislop:end -->
