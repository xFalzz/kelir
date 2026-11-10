import { describe, it, expect } from 'vitest';
import { latinToAksara, CONTOH_TERUJI } from '../../src/lib/aksara';

describe('latinToAksara (transliterator berbasis aturan)', () => {
  it('mengubah 20 aksara dasar hanacaraka dengan tepat', () => {
    expect(latinToAksara('hanacaraka')).toBe('ꦲꦤꦕꦫꦏ');
    expect(latinToAksara('datasawala')).toBe('ꦢꦠꦱꦮꦭ');
    expect(latinToAksara('padhajayanya')).toBe('ꦥꦝꦗꦪꦚ');
    expect(latinToAksara('magabathanga')).toBe('ꦩꦒꦧꦛꦔ');
  });

  it('mengubah kosakata pusaka utama sesuai sandhangan dan panyigeg', () => {
    for (const item of CONTOH_TERUJI) {
      expect(latinToAksara(item.latin)).toBe(item.aksara);
    }
  });

  it('membedakan e pepet dan é taling', () => {
    expect(latinToAksara('kelir')).toBe('ꦏꦼꦭꦶꦂ');
    expect(latinToAksara('séla')).toBe('ꦱꦺꦭ');
  });

  it('menangani pasangan konsonan di tengah kata dan tanda baca', () => {
    expect(latinToAksara('blencong')).toBe('ꦧ꧀ꦭꦼꦚ꧀ꦕꦺꦴꦁ'.replace('ꦚ', 'ꦤ'));
    expect(latinToAksara('rama.')).toBe('ꦫꦩ꧉');
  });

  it('mengembalikan string kosong untuk input kosong', () => {
    expect(latinToAksara('')).toBe('');
    expect(latinToAksara('   ')).toBe('');
  });
});
