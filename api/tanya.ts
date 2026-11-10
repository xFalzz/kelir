// Fungsi serverless Vercel untuk menjawab pertanyaan terikat konteks kurasi.
// Urutan penyedia: Google Gemini API (utama) -> Meta Llama API (cadangan) -> Pencocokan Kurasi Lokal.

import { DAFTAR_BENDA, LAKON_KIJANG_KENCANA, type BendaPusaka } from '../src/content/pusaka';
import { jawabDariKurasiLokal } from '../src/lib/tanya';

interface ReqBody {
  bendaId?: BendaPusaka['id'];
  pertanyaan?: string;
}

function susunKonteksKurasi(bendaId: BendaPusaka['id']): string {
  const benda = DAFTAR_BENDA.find((b) => b.id === bendaId) ?? DAFTAR_BENDA[0];
  const titik = benda.titikInfo
    .map((t) => `- ${t.label.id}: ${t.uraian.id} (Sumber: ${t.sumber.join(', ')})`)
    .join('\n');
  const babak = LAKON_KIJANG_KENCANA.babak
    .map((b) => `- ${b.judul.id}: ${b.narasi.id}`)
    .join('\n');

  return [
    `Benda: ${benda.nama.id} (UNESCO ${benda.tahunUnesco}, berkas ${benda.berkasUnesco})`,
    `Ringkasan: ${benda.ringkasan.id}`,
    `Bagian benda:\n${titik}`,
    `Lakon terkait (${LAKON_KIJANG_KENCANA.judul.id}):\n${babak}`,
  ].join('\n\n');
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Gunakan metode POST.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: ReqBody = {};
  try {
    body = (await req.json()) as ReqBody;
  } catch {
    return new Response(JSON.stringify({ error: 'Format JSON tidak valid.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const bendaId: BendaPusaka['id'] =
    body.bendaId === 'keris' || body.bendaId === 'saron' || body.bendaId === 'wayang'
      ? body.bendaId
      : 'keris';
  const pertanyaan = (body.pertanyaan ?? '').trim().slice(0, 280);

  if (!pertanyaan) {
    return new Response(JSON.stringify({ error: 'Pertanyaan kosong.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const benda = DAFTAR_BENDA.find((b) => b.id === bendaId) ?? DAFTAR_BENDA[0];
  const konteks = susunKonteksKurasi(bendaId);
  const instruksiSistem =
    'Anda adalah asisten kurasi museum Kelir. Jawab dalam Bahasa Indonesia yang ringkas (maksimal 3 kalimat) HANYA menggunakan fakta dari KONTEKS KURASI di bawah. Jangan gunakan karakter em dash. Jika jawaban tidak ada di dalam konteks, katakan secara jujur bahwa informasi tersebut belum tersedia di dalam teks kurasi Kelir.';

  const env = (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } })
    .process?.env ?? {};

  // 1. Jalur utama: Google Gemini API
  const geminiKey = env.GEMINI_API_KEY;
  const geminiModel = env.GEMINI_MODEL || 'gemini-2.5-flash';
  if (geminiKey) {
    try {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent?key=${encodeURIComponent(geminiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: instruksiSistem }] },
            contents: [
              {
                role: 'user',
                parts: [{ text: `KONTEKS KURASI:\n${konteks}\n\nPERTANYAAN:\n${pertanyaan}` }],
              },
            ],
            generationConfig: { temperature: 0.1, maxOutputTokens: 220 },
          }),
        },
      );
      if (resp.ok) {
        const json = (await resp.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const teks = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (teks) {
          return new Response(
            JSON.stringify({
              jawaban: teks.replace(/\u2014/g, ', '),
              sumberKode: benda.sumber,
              modePenyedia: 'gemini',
              ditemukanDiKurasi: true,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          );
        }
      }
    } catch {
      // Lanjut ke penyedia cadangan bila panggilan Gemini gagal.
    }
  }

  // 2. Jalur cadangan: Meta Llama API (kompatibel dengan OpenAI chat completions)
  const metaKey = env.META_API_KEY;
  const metaModel = env.META_MODEL || 'Llama-4-Maverick-17B-128E-Instruct-FP8';
  const metaEndpoint = env.META_BASE_URL || 'https://api.llama.com/compat/v1/chat/completions';
  if (metaKey) {
    try {
      const resp = await fetch(metaEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${metaKey}`,
        },
        body: JSON.stringify({
          model: metaModel,
          messages: [
            { role: 'system', content: instruksiSistem },
            { role: 'user', content: `KONTEKS KURASI:\n${konteks}\n\nPERTANYAAN:\n${pertanyaan}` },
          ],
          temperature: 0.1,
          max_tokens: 220,
        }),
      });
      if (resp.ok) {
        const json = (await resp.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const teks = json.choices?.[0]?.message?.content?.trim();
        if (teks) {
          return new Response(
            JSON.stringify({
              jawaban: teks.replace(/\u2014/g, ', '),
              sumberKode: benda.sumber,
              modePenyedia: 'meta',
              ditemukanDiKurasi: true,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          );
        }
      }
    } catch {
      // Lanjut ke pencocokan kurasi lokal bila Meta gagal.
    }
  }

  // 3. Cadangan deterministik dari kurasi lokal
  const lokal = jawabDariKurasiLokal(bendaId, pertanyaan);
  return new Response(JSON.stringify(lokal), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
