import { describe, expect, it } from 'vitest';
import {
  bangunJsonLdGraph,
  META_HALAMAN_SEO,
  SITE_CANONICAL_FALLBACK,
} from '../../src/lib/seoGeo.ts';

const FAKE_ID_DOMAIN_REGEX =
  /(?:^|[^a-z0-9.])(?:besalen\.keris|slendro\.saron|kawung\.batik|tumpangsari\.joglo|srirama\.pakeliran|kidang\.pakeliran|kelir)\.id\b/i;

describe('Audit Metadata SEO & Grafik Pengetahuan GEO (Schema.org JSON-LD)', () => {
  it('menghasilkan metadata unik, canonical path, dan deskripsi optimal untuk kelima halaman tanpa domain .id palsu', () => {
    const halamanIds = ['beranda', 'twin', 'koleksi', 'pakeliran', 'kawruh'] as const;
    const titles = new Set<string>();
    const descriptions = new Set<string>();

    for (const hal of halamanIds) {
      const info = META_HALAMAN_SEO[hal];
      expect(info.title.length).toBeGreaterThanOrEqual(35);
      expect(info.title.length).toBeLessThanOrEqual(80);
      expect(info.description.length).toBeGreaterThanOrEqual(110);
      expect(info.description.length).toBeLessThanOrEqual(210);
      expect(info.keywords.length).toBeGreaterThan(20);
      expect(info.pathQuery).toContain(`?hal=${hal}`);
      titles.add(info.title);
      descriptions.add(info.description);

      const graph = bangunJsonLdGraph(hal, SITE_CANONICAL_FALLBACK);
      const serialized = JSON.stringify(graph);
      expect(serialized).not.toMatch(FAKE_ID_DOMAIN_REGEX);
      expect(serialized).toContain('UNESCO ICH');
      expect(serialized).toContain('Saron');
      expect(serialized).toContain('Keris Luk 5');

      const nodes = graph['@graph'] as Array<{ '@type': string }>;
      expect(nodes.map((n) => n['@type'])).toEqual([
        'WebSite',
        'WebApplication',
        'ItemList',
        'FAQPage',
        'Dataset',
      ]);
    }

    expect(titles.size).toBe(5);
    expect(descriptions.size).toBe(5);
  });
});
