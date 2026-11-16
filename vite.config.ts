import path from 'node:path';
import { defineConfig, loadEnv, type Connect, type Plugin } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import {
  DAFTAR_BEDAH_TWIN,
  DAFTAR_BENDA,
  KOLEKSI_COVERFLOW,
  type BahasaAktif,
  type BendaPusaka,
  type SpesimenBedahId,
} from './src/content/pusaka.ts';
import {
  hasilkanKomparasiGemini,
  hasilkanPujanggaGemini,
  hasilkanSuaraDalangBabak,
} from './src/server/aiStudioGemini.ts';
import {
  MODEL_GEMINI_TETAP,
  bacaKonfigurasiGemini,
  jawabDenganGemini38Flash,
} from './src/server/pamomongGemini.ts';
import { hasilkanSuaraSulukGemini } from './src/server/sulukVoiceGemini.ts';

const BAHASA_VALID = new Set<BahasaAktif>(['id', 'en', 'jw', 'aks']);

function apiTanyaLocalPlugin(serverEnv: Record<string, string | undefined>): Plugin {
  const konf = bacaKonfigurasiGemini(serverEnv, [
    process.cwd(),
    path.resolve(process.cwd(), '..'),
  ]);
  const apiKeyServer = konf.liveDisabled ? '' : konf.apiKey;
  const timeoutMs = Number(serverEnv.KELIR_GEMINI_TIMEOUT_MS || 28000);

  const middleware: Connect.NextHandleFunction = (req, res, next) => {
    const httpReq = req as unknown as {
      url?: string;
      method?: string;
      on: (ev: string, cb: (chunk?: Uint8Array | string) => void) => void;
    };
    const httpRes = res as unknown as {
      statusCode: number;
      setHeader: (k: string, v: string) => void;
      end: (body: string) => void;
    };

    const isTanya = httpReq.url?.startsWith('/api/tanya');
    const isSulukSuara = httpReq.url?.startsWith('/api/suluk-suara');
    const isAiStudio = httpReq.url?.startsWith('/api/ai-studio');
    if (!isTanya && !isSulukSuara && !isAiStudio) {
      next();
      return;
    }
    if (httpReq.method !== 'POST') {
      httpRes.statusCode = 405;
      httpRes.setHeader('Content-Type', 'application/json');
      httpRes.end(JSON.stringify({ error: 'Gunakan metode POST.' }));
      return;
    }

    let rawBody = '';
    const decoder = new TextDecoder();

    httpReq.on('data', (chunk?: Uint8Array | string) => {
      if (typeof chunk === 'string') {
        rawBody += chunk;
      } else if (chunk) {
        rawBody += decoder.decode(chunk, { stream: true });
      }
    });
    httpReq.on('end', () => {
      void (async () => {
        try {
          if (isSulukSuara) {
            const body = JSON.parse(rawBody || '{}') as {
              artefakId?: SpesimenBedahId;
              bahasa?: BahasaAktif;
            };
            const item =
              KOLEKSI_COVERFLOW.find((c) => c.artefakId === body.artefakId) ??
              KOLEKSI_COVERFLOW[0];
            const bahasa: BahasaAktif =
              body.bahasa && BAHASA_VALID.has(body.bahasa) ? body.bahasa : 'id';
            const ttsTimeoutMs = Number(serverEnv.KELIR_TTS_TIMEOUT_MS || 28000);
            const hasilSuara = await hasilkanSuaraSulukGemini({
              artefakId: item.artefakId,
              bahasa,
              apiKey: apiKeyServer,
              timeoutMs: ttsTimeoutMs,
            });
            httpRes.statusCode = 200;
            httpRes.setHeader('Content-Type', 'application/json');
            httpRes.end(JSON.stringify(hasilSuara));
            return;
          }

          if (isAiStudio) {
            const body = JSON.parse(rawBody || '{}') as {
              tugas?: 'banding' | 'pujangga' | 'dalang-suara';
              idA?: string;
              idB?: string;
              tema?: string;
              babakIdx?: number;
              bahasa?: BahasaAktif;
            };
            const bahasa: BahasaAktif =
              body.bahasa && BAHASA_VALID.has(body.bahasa) ? body.bahasa : 'id';
            const validId = (raw: unknown, fallback: SpesimenBedahId): SpesimenBedahId =>
              typeof raw === 'string' && DAFTAR_BEDAH_TWIN.some((b) => b.id === raw)
                ? (raw as SpesimenBedahId)
                : fallback;

            let hasilStudio: unknown;
            if (body.tugas === 'pujangga') {
              hasilStudio = await hasilkanPujanggaGemini({
                tema: typeof body.tema === 'string' ? body.tema : '',
                bahasa,
                apiKey: apiKeyServer,
                timeoutMs,
              });
            } else if (body.tugas === 'dalang-suara') {
              const babakIdx =
                typeof body.babakIdx === 'number' && Number.isFinite(body.babakIdx)
                  ? Math.max(0, Math.floor(body.babakIdx))
                  : 0;
              hasilStudio = await hasilkanSuaraDalangBabak({
                babakIdx,
                bahasa,
                apiKey: apiKeyServer,
                timeoutMs,
              });
            } else {
              hasilStudio = await hasilkanKomparasiGemini({
                idA: validId(body.idA, 'keris'),
                idB: validId(body.idB, 'joglo'),
                bahasa,
                apiKey: apiKeyServer,
                timeoutMs,
              });
            }
            httpRes.statusCode = 200;
            httpRes.setHeader('Content-Type', 'application/json');
            httpRes.end(JSON.stringify(hasilStudio));
            return;
          }

          const body = JSON.parse(rawBody || '{}') as {
            bendaId?: BendaPusaka['id'];
            pertanyaan?: string;
            bahasa?: BahasaAktif;
          };
          const bendaId: BendaPusaka['id'] = DAFTAR_BENDA.some((b) => b.id === body.bendaId)
            ? (body.bendaId as BendaPusaka['id'])
            : 'keris';
          const bahasa: BahasaAktif =
            body.bahasa && BAHASA_VALID.has(body.bahasa) ? body.bahasa : 'id';

          const hasil = await jawabDenganGemini38Flash({
            bendaId,
            pertanyaan: typeof body.pertanyaan === 'string' ? body.pertanyaan : '',
            bahasa,
            apiKey: apiKeyServer,
            timeoutMs,
          });
          httpRes.statusCode = 200;
          httpRes.setHeader('Content-Type', 'application/json');
          httpRes.end(
            JSON.stringify({
              ...hasil,
              modelNama: MODEL_GEMINI_TETAP,
            }),
          );
        } catch {
          httpRes.statusCode = 400;
          httpRes.setHeader('Content-Type', 'application/json');
          httpRes.end(JSON.stringify({ error: 'Format JSON tidak valid.' }));
        }
      })();
    });
  };

  return {
    name: 'kelir-api-tanya-local',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

export default defineConfig(({ mode }) => {
  const parentEnv = loadEnv(mode, path.resolve(process.cwd(), '..'), '');
  const localEnv = loadEnv(mode, process.cwd(), '');
  const serverEnv: Record<string, string | undefined> = {
    ...parentEnv,
    ...localEnv,
    ...process.env,
  };

  return {
    plugins: [svelte(), apiTanyaLocalPlugin(serverEnv)],
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'vendor-three-core',
                test: /[\\/]node_modules[\\/]three[\\/](?!examples)/,
                priority: 30,
                maxSize: 380000,
              },
              {
                name: 'vendor-three-addons',
                test: /[\\/]node_modules[\\/]three[\\/]examples[\\/]/,
                priority: 25,
              },
              {
                name: 'vendor-gsap',
                test: /[\\/]node_modules[\\/]gsap[\\/]/,
                priority: 20,
              },
              {
                name: 'vendor-mediapipe',
                test: /[\\/]node_modules[\\/]@mediapipe[\\/]/,
                priority: 20,
              },
            ],
          },
        },
      },
    },
    server: {
      port: 5173,
      strictPort: false,
    },
    preview: {
      host: '127.0.0.1',
      port: 4173,
      strictPort: false,
    },
  };
});
