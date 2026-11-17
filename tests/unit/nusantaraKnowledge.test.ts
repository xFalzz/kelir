import { describe, expect, it, vi } from 'vitest';
import { ENSIKLOPEDIA_NUSANTARA, cariKonteksNusantara } from '../../src/content/nusantaraKB.ts';
import { auditDanBersihkanOutputAI, hilangkanEmDashAI } from '../../src/lib/aiGuardrail.ts';
import {
  bandingkanPusakaLokal,
  susunKramaLokal,
  susunPujanggaLokal,
  susunRuteTurLokal,
} from '../../src/lib/aiStudio.ts';
import { MODEL_AI_PAMOMONG, jawabDariKurasiLokal } from '../../src/lib/tanya.ts';
import {
  MODEL_GEMINI_TETAP,
  jawabDenganGemini38Flash,
  type LiveClientLike,
} from '../../src/server/pamomongGemini.ts';

function buatMockLiveClientDenganCapture(onCapture: (params: {
  model: string;
  sys: string;
  prompt: string;
}) => void): LiveClientLike {
  return {
    live: {
      connect: vi.fn(async (params) => {
        const handleInput = (textPrompt: string) => {
          onCapture({
            model: String(params.model),
            sys: JSON.stringify(params.config?.systemInstruction ?? ''),
            prompt: textPrompt,
          });
          setTimeout(() => {
            params.callbacks.onmessage?.({
              serverContent: {
                outputTranscription: {
                  text:
                    'Tari Saman dari dataran tinggi Gayo, Aceh memadukan syair religius dan tepukan ritmis tanpa alat musik oleh barisan penari.\n\n' +
                    'Kekompakan yang dipimpin Syech mencerminkan silaturahmi, amanah, dan musyawarah masyarakat Gayo dalam tradisi Nusantara.',
                },
                turnComplete: true,
              },
            });
          }, 0);
        };
        queueMicrotask(() => params.callbacks.onopen?.());
        return {
          sendClientContent: vi.fn((input) => handleInput(JSON.stringify(input?.turns ?? ''))),
          sendRealtimeInput: vi.fn((input) => handleInput(String(input?.text ?? ''))),
          close: vi.fn(),
        };
      }),
    },
  };
}

describe('Ensiklopedia Budaya Nusantara & Identitas Pamomong Nusantara', () => {
  it('menyediakan ensiklopedia lintas Nusantara lengkap dalam ID, EN, dan JW', () => {
    expect(ENSIKLOPEDIA_NUSANTARA.length).toBeGreaterThanOrEqual(11);
    for (const entri of ENSIKLOPEDIA_NUSANTARA) {
      expect(entri.intiSejarah.id.length).toBeGreaterThan(30);
      expect(entri.intiSejarah.en.length).toBeGreaterThan(30);
      expect(entri.intiSejarah.jw.length).toBeGreaterThan(20);
      expect(entri.unsurTeknis.id.length).toBeGreaterThan(30);
      expect(entri.maknaFilosofis.id.length).toBeGreaterThan(30);
    }

    expect(cariKonteksNusantara('Apa sejarah Tari Saman Aceh?')[0]?.id).toBe('idn-saman');
    expect(cariKonteksNusantara('Jelaskan filosofi perahu Pinisi Bugis Makassar')[0]?.id).toContain(
      'sulawesi',
    );
    expect(cariKonteksNusantara('Bagaimana sistem irigasi Subak Bali bekerja?')[0]?.id).toContain(
      'bali',
    );
    expect(cariKonteksNusantara('Apa makna Noken dan rumah Honai Papua?')[0]?.id).toContain(
      'maluku-papua',
    );
  });

  it('menjawab pertanyaan Nusantara secara mendalam multi-paragraf saat luring memakai identitas Pamomong Nusantara', () => {
    const resId = jawabDariKurasiLokal(
      'keris',
      'Jelaskan filosofi Subak Bali dan Tari Kecak dalam budaya Indonesia',
      'id',
    );
    expect(resId.modelNama).toBe(MODEL_AI_PAMOMONG);
    expect(resId.modelNama).toBe('Pamomong Nusantara');
    expect(resId.statusGrounding).toBe('eksplorasi-nusantara');
    expect(resId.jawaban).toContain('\n\n');
    expect(resId.jawaban.toLowerCase()).not.toContain('gemini');

    const resEn = jawabDariKurasiLokal('saron', 'Tell me about Noken Papua and Pinisi boat', 'en');
    expect(resEn.statusGrounding).toBe('eksplorasi-nusantara');
    expect(resEn.jawaban).toContain('\n\n');
    expect(resEn.jawaban.toLowerCase()).not.toContain('gemini');
  });

  it('menyuntikkan <referensi_nusantara> dan <unsur_anatomi_3d> ke prompt internal sambil menjaga label publik Pamomong Nusantara', async () => {
    let capturedModel = '';
    let capturedSys = '';
    let capturedPrompt = '';

    const res = await jawabDenganGemini38Flash({
      bendaId: 'keris',
      pertanyaan: 'Apa keterkaitan Tari Saman Aceh dengan nilai musyawarah Nusantara?',
      bahasa: 'id',
      konteksUnsur: {
        judulUnsur: 'Pamor Meteorit Lipatan Besi',
        material: 'Besi-nikel meteorit',
        fungsiTeknis: 'Distribusi tegangan lentur bilah',
        ringkasan: 'Pamor terbentuk dari lipatan besi dan nikel oleh empu.',
      },
      apiKey: 'dummy-pamomong-test-key',
      bypassCache: true,
      liveClientFactory: () =>
        buatMockLiveClientDenganCapture(({ model, sys, prompt }) => {
          capturedModel = model;
          capturedSys = sys;
          capturedPrompt = prompt;
        }),
    });

    expect(MODEL_GEMINI_TETAP).toBe('Pamomong Nusantara');
    expect(capturedModel).toBe('gemini-3.8-live');
    expect(capturedSys).toContain('Pamomong Nusantara');
    expect(capturedPrompt).toContain('<referensi_nusantara>');
    expect(capturedPrompt).toContain('<unsur_anatomi_3d>');
    expect(res.mode).toBe('pamomong-live');
    expect(res.modelNama).toBe('Pamomong Nusantara');
    expect(res.jawaban).toContain('\n\n');
  });

  it('memblokir kebocoran nama vendor/model AI atau tag XML internal di auditDanBersihkanOutputAI', () => {
    expect(
      auditDanBersihkanOutputAI('Saya berjalan di atas model gemini-3.8-live milik Google.', {
        wajibJangkarBudaya: false,
      }),
    ).toBeNull();
    expect(
      auditDanBersihkanOutputAI('Ditenagai oleh Gemini 3.8 Live dari Google AI Studio.', {
        wajibJangkarBudaya: false,
      }),
    ).toBeNull();
    expect(
      auditDanBersihkanOutputAI('Konteks <referensi_nusantara> bocor pada budaya Keris.', {
        wajibJangkarBudaya: true,
      }),
    ).toBeNull();
    expect(
      auditDanBersihkanOutputAI('Tag <unsur_anatomi_3d> tampak pada keris S1.', {
        wajibJangkarBudaya: true,
      }),
    ).toBeNull();

    const aman = auditDanBersihkanOutputAI(
      'Rumah Gadang Minangkabau memiliki atap gonjong yang melambangkan tanduk kerbau serta garis matrilineal masyarakat Sumatra Barat.',
      { wajibJangkarBudaya: true },
    );
    expect(aman).toContain('Rumah Gadang');
  });

  it('tidak pernah mengembalikan tanda em-dash (—) pada respons AI maupun sanitasi keluaran', () => {
    const cleaned = hilangkanEmDashAI('Keris Luk 5 — pusaka Jawa — memadukan besi dan nikel.');
    expect(cleaned).not.toContain('—');
    expect(cleaned).toBe('Keris Luk 5, pusaka Jawa, memadukan besi dan nikel.');

    const dariModel = auditDanBersihkanOutputAI(
      'Tari Saman — warisan Gayo Aceh — memadukan kekompakan syair.\n\nSubak Bali — sistem irigasi tradisional — menjaga harmoni Tri Hita Karana.',
      { wajibJangkarBudaya: true },
    );
    expect(dariModel).not.toBeNull();
    expect(dariModel).not.toContain('—');
    expect(dariModel).toContain('\n\n');

    const ragS1 = jawabDariKurasiLokal('keris', 'Jelaskan ganja keris dan filosofinya', 'en');
    expect(ragS1.jawaban).not.toContain('—');

    const comp = bandingkanPusakaLokal('keris', 'batik', 'id');
    expect(comp.persamaan).not.toContain('—');
    expect(comp.perbedaanMaterial).not.toContain('—');
    expect(comp.titikTemuFilosofi).not.toContain('—');

    const puj = susunPujanggaLokal('persatuan nusantara', 'id');
    expect(puj.catatanMakna).not.toContain('—');

    const krama = susunKramaLokal('Saya ingin belajar gamelan dan keris', 'en');
    expect(krama.catatanEtika).not.toContain('—');

    const tur = susunRuteTurLokal('semua', 'kilat', '', 'id');
    expect(tur.ringkasanRute).not.toContain('—');
  });
});
