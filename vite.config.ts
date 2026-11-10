import { defineConfig, type Plugin } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { jawabDariKurasiLokal } from './src/lib/tanya';
import type { BendaPusaka } from './src/content/pusaka';

function apiTanyaLocalPlugin(): Plugin {
  const middleware = (
    req: { url?: string; method?: string; on: (ev: string, cb: (chunk?: Buffer) => void) => void },
    res: { statusCode: number; setHeader: (k: string, v: string) => void; end: (body: string) => void },
    next: () => void,
  ): void => {
    if (!req.url?.startsWith('/api/tanya')) {
      next();
      return;
    }
    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Gunakan metode POST.' }));
      return;
    }

    const chunks: Buffer[] = [];
    req.on('data', (chunk?: Buffer) => {
      if (chunk) chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const body = JSON.parse(Buffer.concat(chunks).toString('utf8')) as {
          bendaId?: BendaPusaka['id'];
          pertanyaan?: string;
        };
        const bendaId: BendaPusaka['id'] =
          body.bendaId === 'keris' || body.bendaId === 'saron' || body.bendaId === 'wayang'
            ? body.bendaId
            : 'keris';
        const hasil = jawabDariKurasiLokal(bendaId, body.pertanyaan ?? '');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(hasil));
      } catch {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Format JSON tidak valid.' }));
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
