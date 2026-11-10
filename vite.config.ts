import { defineConfig, type Connect, type Plugin } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { jawabDariKurasiLokal } from './src/lib/tanya.ts';
import type { BendaPusaka } from './src/content/pusaka.ts';

function apiTanyaLocalPlugin(): Plugin {
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

    if (!httpReq.url?.startsWith('/api/tanya')) {
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
      try {
        const body = JSON.parse(rawBody || '{}') as {
          bendaId?: BendaPusaka['id'];
          pertanyaan?: string;
        };
        const bendaId: BendaPusaka['id'] =
          body.bendaId === 'keris' ||
          body.bendaId === 'saron' ||
          body.bendaId === 'batik' ||
          body.bendaId === 'joglo' ||
          body.bendaId === 'wayang'
            ? body.bendaId
            : 'keris';
        const hasil = jawabDariKurasiLokal(bendaId, body.pertanyaan ?? '');
        httpRes.statusCode = 200;
        httpRes.setHeader('Content-Type', 'application/json');
        httpRes.end(JSON.stringify(hasil));
      } catch {
        httpRes.statusCode = 400;
        httpRes.setHeader('Content-Type', 'application/json');
        httpRes.end(JSON.stringify({ error: 'Format JSON tidak valid.' }));
      }
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

export default defineConfig({
  plugins: [svelte(), apiTanyaLocalPlugin()],
  server: {
    port: 5173,
    strictPort: false,
  },
  preview: {
    port: 4173,
    strictPort: false,
  },
});
