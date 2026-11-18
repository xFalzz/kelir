import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, loadEnv, type Connect, type Plugin } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import {
  DAFTAR_BENDA,
  KOLEKSI_COVERFLOW,
  type BahasaAktif,
  type BendaPusaka,
  type SpesimenBedahId,
} from './src/content/pusaka.ts';
import { periksaBatasLajuAI, sanitasiKonteksUnsurAman } from './src/lib/aiGuardrail.ts';
import { eksekusiPermintaanAiStudio } from './src/server/aiStudioGemini.ts';
import {
  BAHASA_API_VALID,
  BATAS_BODY_BYTES,
  cekOriginPermintaanApi,
  ekstrakIpKlienTerpercaya,
  pasangHeaderKeamananApi,
  validasiDanParseBodyJson,
} from './src/server/httpRequestGuard.ts';
import {
  MODEL_GEMINI_TETAP,
  bacaKonfigurasiGemini,
  jawabDenganGemini38Flash,
} from './src/server/pamomongGemini.ts';
import { hasilkanSuaraSulukGemini } from './src/server/sulukVoiceGemini.ts';

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
      headers?: Record<string, string | string[] | undefined>;
      socket?: { remoteAddress?: string };
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
    pasangHeaderKeamananApi((k, v) => httpRes.setHeader(k, v));

    if (httpReq.method !== 'POST') {
      httpRes.statusCode = 405;
      httpRes.setHeader('Content-Type', 'application/json');
      httpRes.end(JSON.stringify({ error: 'Gunakan metode POST.' }));
      return;
    }

    const cekOrigin = cekOriginPermintaanApi(httpReq.headers);
    if (!cekOrigin.diizinkan) {
      httpRes.statusCode = 403;
      httpRes.setHeader('Content-Type', 'application/json');
      httpRes.end(JSON.stringify({ error: cekOrigin.alasan ?? 'Origin tidak diizinkan.' }));
      return;
    }

    const clientIp = ekstrakIpKlienTerpercaya(httpReq.headers, httpReq.socket?.remoteAddress, 'local');
    const clientKey = `${httpReq.url?.split('?')[0] ?? 'api'}:${clientIp}`;
    const limit = periksaBatasLajuAI(clientKey, 120);
    if (!limit.diizinkan) {
      httpRes.statusCode = 429;
      httpRes.setHeader('Retry-After', '60');
      httpRes.setHeader('Content-Type', 'application/json');
      httpRes.end(JSON.stringify({ error: 'Terlalu banyak permintaan. Coba kembali sesaat lagi.' }));
      return;
    }

    const rawChunks: Buffer[] = [];
    let totalBytes = 0;
    let terlaluBesar = false;

    httpReq.on('data', (chunk?: Uint8Array | string) => {
      if (terlaluBesar || !chunk) return;
      const buf = typeof chunk === 'string' ? Buffer.from(chunk, 'utf8') : Buffer.from(chunk);
      totalBytes += buf.byteLength;
      if (totalBytes > BATAS_BODY_BYTES) {
        terlaluBesar = true;
        rawChunks.length = 0;
        return;
      }
      rawChunks.push(buf);
    });
    httpReq.on('end', () => {
      if (terlaluBesar) {
        httpRes.statusCode = 413;
        httpRes.setHeader('Content-Type', 'application/json');
        httpRes.end(JSON.stringify({ error: 'Ukuran payload melebihi batas aman 16 KB.' }));
        return;
      }
      const contentLength =
        typeof httpReq.headers?.['content-length'] === 'string'
          ? httpReq.headers['content-length']
          : undefined;
      const checkBody = validasiDanParseBodyJson(Buffer.concat(rawChunks), contentLength);
      if (!checkBody.ok) {
        httpRes.statusCode = checkBody.status;
        httpRes.setHeader('Content-Type', 'application/json');
        httpRes.end(JSON.stringify({ error: checkBody.error }));
        return;
      }
      const parsedRaw = checkBody.body;
      void (async () => {
        try {
          if (isSulukSuara) {
            const body = parsedRaw as {
              artefakId?: SpesimenBedahId;
              bahasa?: BahasaAktif;
            };
            const item =
              KOLEKSI_COVERFLOW.find((c) => c.artefakId === body.artefakId) ??
              KOLEKSI_COVERFLOW[0];
            const bahasa: BahasaAktif =
              body.bahasa && BAHASA_API_VALID.has(body.bahasa) ? body.bahasa : 'id';
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
            const bodyObj = parsedRaw;
            const rawLang = bodyObj.bahasa as BahasaAktif | undefined;
            const bahasa: BahasaAktif = rawLang && BAHASA_API_VALID.has(rawLang) ? rawLang : 'id';
            const hasilStudio = await eksekusiPermintaanAiStudio({
              body: bodyObj,
              bahasa,
              apiKey: apiKeyServer,
              timeoutMs,
            });
            httpRes.statusCode = 200;
            httpRes.setHeader('Content-Type', 'application/json');
            httpRes.end(JSON.stringify(hasilStudio));
            return;
          }

          const body = parsedRaw as {
            bendaId?: BendaPusaka['id'];
            pertanyaan?: string;
            bahasa?: BahasaAktif;
            konteksUnsur?: unknown;
            riwayatSingkat?: unknown;
          };
          const bendaId: BendaPusaka['id'] = DAFTAR_BENDA.some((b) => b.id === body.bendaId)
            ? (body.bendaId as BendaPusaka['id'])
            : 'keris';
          const bahasa: BahasaAktif =
            body.bahasa && BAHASA_API_VALID.has(body.bahasa) ? body.bahasa : 'id';
          const konteksUnsur = sanitasiKonteksUnsurAman(body.konteksUnsur);

          const hasil = await jawabDenganGemini38Flash({
            bendaId,
            pertanyaan: typeof body.pertanyaan === 'string' ? body.pertanyaan.slice(0, 640) : '',
            bahasa,
            konteksUnsur,
            riwayatSingkat: body.riwayatSingkat,
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

function kelirPwaPrecachePlugin(): Plugin {
  let outDir = 'dist';

  return {
    name: 'kelir-pwa-precache',
    apply: 'build',
    configResolved(resolved) {
      outDir = path.resolve(resolved.root, resolved.build.outDir);
    },
    closeBundle() {
      const swPath = path.join(outDir, 'sw.js');
      const assetsDir = path.join(outDir, 'assets');
      if (!fs.existsSync(swPath) || !fs.existsSync(assetsDir)) return;

      const coreUrls = [
        '/',
        '/index.html',
        '/manifest.webmanifest',
        '/favicon.svg',
        '/icons/icon-192.png',
        '/icons/icon-512.png',
        '/icons/icon-maskable-512.png',
        '/icons/apple-touch-icon-180.png',
        '/og-kelir.png',
      ];

      // Hapus file font .woff lawas & hapus url(...woff) pada CSS produksi agar hemat ~418 KB aset
      const rawAssets = fs.readdirSync(assetsDir);
      for (const f of rawAssets) {
        if (/\.woff$/i.test(f)) {
          fs.unlinkSync(path.join(assetsDir, f));
        } else if (/\.css$/i.test(f)) {
          const cssPath = path.join(assetsDir, f);
          const cssRaw = fs.readFileSync(cssPath, 'utf8');
          const cssModern = cssRaw.replace(/,\s*url\([^)]+\.woff\)\s*format\(["']woff["']\)/gi, '');
          if (cssModern !== cssRaw) {
            fs.writeFileSync(cssPath, cssModern, 'utf8');
          }
        }
      }

      // Salin index.html ke dist/404.html agar rute invalid di Vercel mengembalikan status HTTP 404 dengan UI NotFoundPage
      const distIndex = path.join(outDir, 'index.html');
      if (fs.existsSync(distIndex)) {
        fs.copyFileSync(distIndex, path.join(outDir, '404.html'));
      }

      const assetFiles = fs
        .readdirSync(assetsDir)
        .filter((f) => /\.(js|css|woff2)$/i.test(f))
        .sort();

      const hasher = createHash('sha256');
      for (const f of assetFiles) {
        const st = fs.statSync(path.join(assetsDir, f));
        hasher.update(`${f}:${st.size};`);
      }
      const buildHash = hasher.digest('hex').slice(0, 8);
      const precacheList = [...coreUrls, ...assetFiles.map((f) => `/assets/${f}`)];

      const rawSw = fs.readFileSync(swPath, 'utf8');
      const updatedSw = rawSw
        .replace(/const CACHE_VERSION = ['"][^'"]+['"];/, `const CACHE_VERSION = 'kelir-pwa-${buildHash}';`)
        .replace(
          /const APP_SHELL_URLS = \[[\s\S]*?\];/,
          `const APP_SHELL_URLS = ${JSON.stringify(precacheList, null, 2)};`,
        );

      fs.writeFileSync(swPath, updatedSw, 'utf8');
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
    plugins: [svelte(), apiTanyaLocalPlugin(serverEnv), kelirPwaPrecachePlugin()],
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
                name: 'vendor-svelte',
                test: /[\\/]node_modules[\\/]svelte[\\/]/,
                priority: 24,
              },
              {
                name: 'vendor-i18n',
                test: /[\\/]node_modules[\\/]i18next[\\/]/,
                priority: 22,
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
              {
                name: 'data-pusaka',
                test: /[\\/]src[\\/]content[\\/]pusaka\.ts/,
                priority: 15,
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
