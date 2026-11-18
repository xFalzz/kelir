import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { konversiTeksKeAksaraAman } from '../../src/lib/aksara.ts';
import { audioBudaya } from '../../src/lib/audioBudaya.ts';
import { mintaSuaraDalangBabak, susunNaskahDalangBabak } from '../../src/lib/dalangVoice.ts';
import { fokusModalTrap } from '../../src/lib/focusTrap.ts';
import { klasifikasiTangan } from '../../src/lib/handTracker.ts';
import {
  bacaJejakKurasi,
  jejakKurasiKosong,
} from '../../src/lib/pencarianArsip.ts';
import { buatDataUrlPiagamKurator } from '../../src/lib/piagamKurator.ts';

const STORAGE_JEJAK = 'kelir_jejak_v1';

function buatLandmarksDasar(): NormalizedLandmark[] {
  const pts: NormalizedLandmark[] = Array.from({ length: 21 }, () => ({
    x: 0.5,
    y: 0.5,
    z: 0,
    visibility: 1,
  }));
  pts[0] = { x: 0.5, y: 0.9, z: 0, visibility: 1 };
  pts[4] = { x: 0.25, y: 0.65, z: 0, visibility: 1 };
  // PIP sendi semua jari pada y = 0.6, TIP awalnya tertekuk di bawah sendi (y = 0.72)
  pts[6] = { x: 0.42, y: 0.6, z: 0, visibility: 1 };
  pts[8] = { x: 0.42, y: 0.72, z: 0, visibility: 1 };
  pts[10] = { x: 0.5, y: 0.6, z: 0, visibility: 1 };
  pts[12] = { x: 0.5, y: 0.72, z: 0, visibility: 1 };
  pts[14] = { x: 0.58, y: 0.6, z: 0, visibility: 1 };
  pts[16] = { x: 0.58, y: 0.72, z: 0, visibility: 1 };
  pts[18] = { x: 0.66, y: 0.6, z: 0, visibility: 1 };
  pts[20] = { x: 0.66, y: 0.72, z: 0, visibility: 1 };
  return pts;
}

describe('Utilitas UI, Kurasi, Audio Budaya, Dalang Voice, Fokus Trap & Gestur Tangan', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    audioBudaya.hentikanSuasanaPendopo();
    audioBudaya.aturAktif(false);
  });

  it('bacaJejakKurasi menyanitasi localStorage yang korup, menolak ID tidak valid, & menjepit skor kuis 0..6', () => {
    let storedRaw: string | null = null;
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => (key === STORAGE_JEJAK ? storedRaw : null),
      },
    });

    storedRaw = '{invalid json!!!';
    expect(bacaJejakKurasi()).toEqual(jejakKurasiKosong());

    storedRaw = JSON.stringify({
      spesimenDiteliti: ['keris', '<script>alert(1)</script>', 'keris', 'saron'],
      babakPakeliran: [-2, 0, 2, 2, 99, 'bad'],
      sulukDidengar: ['batik', 'unknown-id'],
      favoritIds: ['joglo', 'joglo', 'x'],
      skorKuisTertinggi: 999,
    });

    const res = bacaJejakKurasi();
    expect(res.spesimenDiteliti).toEqual(['keris', 'saron']);
    expect(res.babakPakeliran).toEqual([0, 2]);
    expect(res.sulukDidengar).toEqual(['batik']);
    expect(res.favoritIds).toEqual(['joglo']);
    expect(res.skorKuisTertinggi).toBe(6);

    storedRaw = JSON.stringify({ skorKuisTertinggi: -7 });
    expect(bacaJejakKurasi().skorKuisTertinggi).toBe(0);
  });

  it('buatDataUrlPiagamKurator mengembalikan null tanpa DOM dan menghasilkan PNG ter-sanitasi dengan mock Canvas 2D', () => {
    expect(
      buatDataUrlPiagamKurator({
        namaPengunjung: 'Surya',
        bahasa: 'id',
        tema: 'terang',
        jejak: jejakKurasiKosong(),
        totalKuis: 6,
      }),
    ).toBeNull();

    const fillTexts: string[] = [];
    const ctxMock = {
      createLinearGradient: () => ({ addColorStop: vi.fn() }),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fillText: (txt: string) => {
        fillTexts.push(txt);
      },
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      textAlign: 'left',
      font: '',
    };

    vi.stubGlobal('document', {
      createElement: () => ({
        width: 0,
        height: 0,
        getContext: () => ctxMock,
        toDataURL: () => 'data:image/png;base64,iVBORw0KGgo=',
      }),
    });

    const out = buatDataUrlPiagamKurator({
      namaPengunjung: '<script>Rendra</script> Wijaya',
      bahasa: 'id',
      tema: 'malam',
      jejak: {
        ...jejakKurasiKosong(),
        spesimenDiteliti: ['keris', 'saron'],
        skorKuisTertinggi: 5,
      },
      totalKuis: 6,
    });

    expect(out?.filename).toBe('piagam-kurator-kelir.png');
    expect(out?.dataUrl.startsWith('data:image/png;base64,')).toBe(true);
    expect(fillTexts.some((t) => t.includes('<script>'))).toBe(false);
    expect(fillTexts.some((t) => t.includes('Rendra') && t.includes('Wijaya'))).toBe(true);
    expect(fillTexts.some((t) => t === '5 / 6')).toBe(true);
  });

  it('dalangVoice menyusun naskah 4 bahasa dan fallback ke Web Speech saat endpoint tidak tersedia', async () => {
    const idAct = susunNaskahDalangBabak(0, 'id');
    const enAct = susunNaskahDalangBabak(2, 'en');
    const aksAct = susunNaskahDalangBabak(99, 'aks');

    expect(idAct.kodeBcp47).toBe('id-ID');
    expect(idAct.naskah).toContain('Babak 1');
    expect(enAct.kodeBcp47).toBe('en-US');
    expect(enAct.naskah).toContain('Act 3');
    expect(aksAct.kodeBcp47).toBe('jv-ID');
    expect(aksAct.naskah).toContain('Babak 4');

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const fallback = await mintaSuaraDalangBabak(1, 'en');
    expect(fallback.modePenyedia).toBe('web-speech-fallback');
    expect(fallback.audioBase64).toBeNull();
    expect(fallback.kodeBcp47).toBe('en-US');
    expect(fallback.naskah).toContain('Act 2');
  });

  it('audioBudaya aman saat window/AudioContext absen dan memperbarui status listener dengan benar', () => {
    expect(audioBudaya.izinkanEfekSuara()).toBe(false);
    audioBudaya.aturAktif(true);
    const repertoar = audioBudaya.ambilDaftarRepertoar();
    expect(repertoar.length).toBeGreaterThan(1);
    audioBudaya.pilihGending(repertoar[1].id, false);
    audioBudaya.aturVolumeLatar(true);

    const statusSnapshots: Array<{ redupNarasi: boolean; gendingId: string }> = [];
    const unsub = audioBudaya.berlanggananStatus((st) => {
      statusSnapshots.push({ redupNarasi: st.redupNarasi, gendingId: st.gendingId });
    });

    expect(statusSnapshots.length).toBeGreaterThan(0);
    expect(statusSnapshots[0].redupNarasi).toBe(true);
    expect(statusSnapshots[0].gendingId).toBe(repertoar[1].id);
    unsub();
  });

  it('klasifikasiTangan membedakan kepal, tunjuk, dua-jari, tiga-jari, terbuka, dan cubit secara akurat', () => {
    const kepal = buatLandmarksDasar();
    expect(klasifikasiTangan(kepal).gestur).toBe('kepal');

    const tunjuk = buatLandmarksDasar();
    tunjuk[8] = { x: 0.42, y: 0.35, z: 0, visibility: 1 };
    expect(klasifikasiTangan(tunjuk).gestur).toBe('tunjuk');

    const duaJari = buatLandmarksDasar();
    duaJari[8] = { x: 0.42, y: 0.35, z: 0, visibility: 1 };
    duaJari[12] = { x: 0.5, y: 0.35, z: 0, visibility: 1 };
    expect(klasifikasiTangan(duaJari).gestur).toBe('dua-jari');

    const tigaJari = buatLandmarksDasar();
    tigaJari[8] = { x: 0.42, y: 0.35, z: 0, visibility: 1 };
    tigaJari[12] = { x: 0.5, y: 0.35, z: 0, visibility: 1 };
    tigaJari[16] = { x: 0.58, y: 0.35, z: 0, visibility: 1 };
    expect(klasifikasiTangan(tigaJari).gestur).toBe('tiga-jari');

    const terbuka = buatLandmarksDasar();
    terbuka[8] = { x: 0.42, y: 0.35, z: 0, visibility: 1 };
    terbuka[12] = { x: 0.5, y: 0.35, z: 0, visibility: 1 };
    terbuka[16] = { x: 0.58, y: 0.35, z: 0, visibility: 1 };
    terbuka[20] = { x: 0.66, y: 0.35, z: 0, visibility: 1 };
    expect(klasifikasiTangan(terbuka).gestur).toBe('terbuka');

    const cubit = buatLandmarksDasar();
    cubit[8] = { x: 0.27, y: 0.64, z: 0, visibility: 1 };
    expect(klasifikasiTangan(cubit).gestur).toBe('cubit');
  });

  it('fokusModalTrap memerangkap Tab / Shift+Tab di dalam modal dan memulihkan fokus saat destroy', () => {
    class MockHTMLElement {
      isConnected = true;
      offsetParent = {};
      listeners: Record<string, Array<(e: KeyboardEvent) => void>> = {};
      focus = vi.fn();
      hasAttribute = () => false;
      contains = (_el: unknown) => true;
      querySelectorAll = () => [] as MockHTMLElement[];
      addEventListener = (evt: string, fn: (e: KeyboardEvent) => void) => {
        (this.listeners[evt] ??= []).push(fn);
      };
      removeEventListener = (evt: string, fn: (e: KeyboardEvent) => void) => {
        this.listeners[evt] = (this.listeners[evt] ?? []).filter((f) => f !== fn);
      };
    }

    vi.stubGlobal('HTMLElement', MockHTMLElement);
    const triggerBtn = new MockHTMLElement();
    const firstEl = new MockHTMLElement();
    const lastEl = new MockHTMLElement();
    const docMock = { activeElement: triggerBtn as unknown as MockHTMLElement };
    vi.stubGlobal('document', docMock);

    const modalNode = new MockHTMLElement();
    modalNode.querySelectorAll = () => [firstEl, lastEl];

    const action = fokusModalTrap(modalNode as unknown as HTMLElement, true);
    const keyHandlers = modalNode.listeners.keydown;
    expect(keyHandlers).toHaveLength(1);

    // Fokus di tombol terakhir + tekan Tab -> melompat ke firstEl
    docMock.activeElement = lastEl;
    const prevTab = vi.fn();
    keyHandlers[0]({ key: 'Tab', shiftKey: false, preventDefault: prevTab } as unknown as KeyboardEvent);
    expect(prevTab).toHaveBeenCalledTimes(1);
    expect(firstEl.focus).toHaveBeenCalledTimes(1);

    // Fokus di tombol pertama + Shift+Tab -> melompat ke lastEl
    docMock.activeElement = firstEl;
    const prevShift = vi.fn();
    keyHandlers[0]({ key: 'Tab', shiftKey: true, preventDefault: prevShift } as unknown as KeyboardEvent);
    expect(prevShift).toHaveBeenCalledTimes(1);
    expect(lastEl.focus).toHaveBeenCalledTimes(1);

    // Nonaktifkan trap lalu destroy -> harus memulihkan fokus ke triggerBtn
    action?.update?.(false);
    const prevDisabled = vi.fn();
    keyHandlers[0]({ key: 'Tab', shiftKey: false, preventDefault: prevDisabled } as unknown as KeyboardEvent);
    expect(prevDisabled).not.toHaveBeenCalled();

    action?.destroy?.();
    expect(triggerBtn.focus).toHaveBeenCalledTimes(1);
  });

  it('konversiTeksKeAksaraAman mempertahankan shortcut Ctrl/Alt dan token UI teknis Offline/Auto-Demo/GPU/PNG', () => {
    const out = konversiTeksKeAksaraAman(
      'Gunakan Ctrl+K dan Alt+T atau mode Offline Auto-Demo GPU PNG',
    );
    expect(out).toContain('Ctrl+K');
    expect(out).toContain('Alt+T');
    expect(out).toContain('Offline');
    expect(out).toContain('Auto-Demo');
    expect(out).toContain('GPU');
    expect(out).toContain('PNG');
    expect(out).toMatch(/[\uA980-\uA9DF]/);
  });
});
