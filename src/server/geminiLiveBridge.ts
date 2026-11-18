import fs from 'node:fs';
import path from 'node:path';
import { GoogleGenAI, Modality, type LiveConnectParameters } from '@google/genai/node';

export const MODEL_GEMINI_LIVE_UNLIMITED = 'gemini-3.8-live' as const;

export interface KonfigurasiGemini {
  apiKey: string;
  model: typeof MODEL_GEMINI_LIVE_UNLIMITED;
  liveDisabled: boolean;
}

export interface LiveSessionLike {
  sendRealtimeInput: (input: { text?: string }) => void;
  close: () => void;
}

export interface LiveClientLike {
  live: {
    connect: (params: LiveConnectParameters) => Promise<LiveSessionLike>;
  };
}

export interface OpsiPanggilLive {
  apiKey: string;
  systemInstruction: string;
  userPrompt: string;
  voiceName?: string;
  timeoutMs?: number;
  includeWavAudio?: boolean;
  liveClientFactory?: (apiKey: string) => LiveClientLike;
}

export interface HasilPanggilLive {
  transcript: string;
  wavBase64: string | null;
  mimeType: string | null;
}

function bacaVarDariEnvFile(filePath: string, key: string): string {
  try {
    if (!fs.existsSync(filePath)) return '';
    const raw = fs.readFileSync(filePath, 'utf8');
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = raw.match(new RegExp(`^\\s*${escaped}\\s*=\\s*(.*)\\s*$`, 'm'));
    if (!match) return '';
    return match[1].trim().replace(/^['"]|['"]$/g, '');
  } catch {
    return '';
  }
}

/**
 * Mengambil kunci API sisi server dengan mengunci model Unlimited Live API (`gemini-3.8-live`).
 */
export function bacaKonfigurasiGemini(
  extraEnv?: Record<string, string | undefined>,
  searchDirs: string[] = [process.cwd(), path.resolve(process.cwd(), '..')],
): KonfigurasiGemini {
  const procEnv =
    (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } })
      .process?.env ?? {};

  let apiKey = (extraEnv?.GEMINI_API_KEY || procEnv.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    for (const dir of searchDirs) {
      apiKey =
        bacaVarDariEnvFile(path.join(dir, '.env.local'), 'GEMINI_API_KEY') ||
        bacaVarDariEnvFile(path.join(dir, '.env'), 'GEMINI_API_KEY');
      if (apiKey) break;
    }
  }

  const liveDisabled =
    extraEnv?.KELIR_DISABLE_LIVE_GEMINI === '1' ||
    procEnv.KELIR_DISABLE_LIVE_GEMINI === '1';

  return {
    apiKey,
    model: MODEL_GEMINI_LIVE_UNLIMITED,
    liveDisabled,
  };
}

/**
 * Membungkus potret PCM 24kHz mono 16-bit little-endian dari Gemini Live API menjadi berkas RIFF WAV standar.
 */
export function pcm24kMonoKeWavBase64(chunks: Buffer[]): string | null {
  if (chunks.length === 0) return null;
  const pcm = Buffer.concat(chunks);
  if (pcm.length === 0) return null;

  const sampleRate = 24000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;

  const header = Buffer.alloc(44);
  header.write('RIFF', 0, 'ascii');
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8, 'ascii');
  header.write('fmt ', 12, 'ascii');
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36, 'ascii');
  header.writeUInt32LE(pcm.length, 40);

  return Buffer.concat([header, pcm]).toString('base64');
}

/**
 * Memanggil model Unlimited `gemini-3.8-live` via WebSocket v1alpha untuk audio PCM & transkrip teks sekaligus.
 */
export async function panggilGemini38Live(opts: OpsiPanggilLive): Promise<HasilPanggilLive> {
  const timeoutMs = Math.max(2500, opts.timeoutMs ?? 28000);
  const voiceName = opts.voiceName || 'Charon';
  const pcmChunks: Buffer[] = [];
  let transcript = '';
  let directText = '';
  let closed = false;
  let sessionRef: LiveSessionLike | null = null;

  const client: LiveClientLike = opts.liveClientFactory
    ? opts.liveClientFactory(opts.apiKey)
    : (new GoogleGenAI({
        apiKey: opts.apiKey,
        httpOptions: { apiVersion: 'v1alpha' },
      }) as unknown as LiveClientLike);

  return await new Promise<HasilPanggilLive>((resolve, reject) => {
    let settled = false;
    const finish = (err?: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (!closed && sessionRef) {
        closed = true;
        try {
          sessionRef.close();
        } catch {
          // Abaikan error saat menutup socket yang sudah berhenti
        }
      }
      if (err) {
        reject(err);
      } else {
        const wavBase64 = opts.includeWavAudio ? pcm24kMonoKeWavBase64(pcmChunks) : null;
        const rawText = transcript.trim() ? transcript : directText;
        resolve({
          transcript: rawText.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim(),
          wavBase64,
          mimeType: wavBase64 ? 'audio/wav' : null,
        });
      }
    };

    const timer = setTimeout(() => {
      const hasEnoughText = transcript.trim().length >= 45 || directText.trim().length >= 45;
      const hasEnoughAudio = opts.includeWavAudio && pcmChunks.length >= 4;
      if (hasEnoughText || hasEnoughAudio) {
        finish();
      } else {
        finish(new Error('Gemini 3.8 Live timeout'));
      }
    }, timeoutMs);

    void client.live
      .connect({
        model: MODEL_GEMINI_LIVE_UNLIMITED,
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
          systemInstruction: {
            parts: [{ text: opts.systemInstruction }],
          },
        },
        callbacks: {
          onmessage: (msg) => {
            if (msg.serverContent?.modelTurn?.parts) {
              for (const part of msg.serverContent.modelTurn.parts) {
                if (opts.includeWavAudio && part.inlineData?.data) {
                  pcmChunks.push(Buffer.from(part.inlineData.data, 'base64'));
                }
                const partAny = part as { text?: string; thought?: boolean };
                if (typeof partAny.text === 'string' && !partAny.thought) {
                  directText += partAny.text;
                }
              }
            }
            if (msg.serverContent?.outputTranscription?.text) {
              transcript += msg.serverContent.outputTranscription.text;
            }
            if (msg.serverContent?.turnComplete) {
              finish();
            }
          },
          onerror: (err) => {
            finish(err);
          },
          onclose: () => {
            closed = true;
            if (!settled) {
              if (transcript || directText || (opts.includeWavAudio && pcmChunks.length > 0)) {
                finish();
              } else {
                finish(new Error('Gemini 3.8 Live closed before completion'));
              }
            }
          },
        },
      })
      .then((session) => {
        if (settled) {
          try {
            session.close();
          } catch {
            // noop
          }
          return;
        }
        sessionRef = session;
        session.sendRealtimeInput({ text: opts.userPrompt });
      })
      .catch((err) => {
        finish(err);
      });
  });
}
