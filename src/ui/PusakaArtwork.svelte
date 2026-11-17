<script lang="ts">
  import type { BendaPusaka } from '../content/pusaka.ts';

  interface Props {
    bendaId: BendaPusaka['id'] | 'kidang' | 'hanacaraka';
    itemId?: string;
    accent?: string;
    compact?: boolean;
    variant?: 'paper' | 'dark';
  }

  let { bendaId, itemId = '', accent = '#d1491b', compact = false, variant = 'dark' }: Props = $props();

  let tipeEfektif = $derived(
    itemId === 'et-wayang-kidang'
      ? 'kidang'
      : itemId === 'et-keris-warangka'
        ? 'warangka'
        : itemId === 'et-joglo-umpak'
          ? 'umpak'
          : bendaId,
  );
  let uid = $derived(`${tipeEfektif}-${compact ? 'c' : 'f'}-${variant}`);
</script>

<svg
  class="pusaka-artwork"
  class:is-compact={compact}
  class:is-paper={variant === 'paper'}
  viewBox="0 0 320 220"
  preserveAspectRatio="xMidYMid slice"
  aria-hidden="true"
>
  <defs>
    <radialGradient id="studio-{uid}" cx="50%" cy="42%" r="65%">
      {#if variant === 'paper'}
        <stop offset="0%" stop-color="#fbf8f2" />
        <stop offset="68%" stop-color="#efe8da" />
        <stop offset="100%" stop-color="#e3d8c5" />
      {:else}
        <stop offset="0%" stop-color="#2a241d" />
        <stop offset="70%" stop-color="#191511" />
        <stop offset="100%" stop-color="#110e0b" />
      {/if}
    </radialGradient>
    <linearGradient id="brass-{uid}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff1c2" />
      <stop offset="45%" stop-color="#d8a84a" />
      <stop offset="100%" stop-color="#6b4b12" />
    </linearGradient>
    <linearGradient id="wood-{uid}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7c4724" />
      <stop offset="55%" stop-color="#4e2a13" />
      <stop offset="100%" stop-color="#2a1508" />
    </linearGradient>
    <linearGradient id="blade-{uid}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1e1e24" />
      <stop offset="38%" stop-color="#d4d4dc" />
      <stop offset="52%" stop-color="#45454d" />
      <stop offset="85%" stop-color="#ededf4" />
      <stop offset="100%" stop-color="#1a1a20" />
    </linearGradient>
  </defs>

  <rect width="320" height="220" fill="url(#studio-{uid})" />
  <ellipse cx="160" cy="184" rx="108" ry="18" fill={variant === 'paper' ? 'rgba(40,30,18,0.12)' : 'rgba(0,0,0,0.45)'} />

  {#if tipeEfektif === 'keris' || tipeEfektif === 'warangka'}
    <g>
      {#if tipeEfektif === 'warangka'}
        <path d="M128 74 Q166 56 226 68 Q210 92 178 96 L142 96 Q120 92 128 74 Z" fill="url(#wood-{uid})" stroke="#d8a84a" stroke-width="1.2" />
        <path d="M160 94 L182 94 L172 204 L162 204 Z" fill="url(#brass-{uid})" />
      {/if}
      <path d="M150 22 C164 50, 140 72, 160 98 C176 118, 138 140, 158 162 L130 169 L186 164 L152 175 L154 202 L144 202 L144 172 Z" fill="url(#blade-{uid})" />
      <path d="M126 168 L188 162 L182 170 L129 175 Z" fill="url(#wood-{uid})" stroke="#d8a84a" stroke-width="1" />
      <ellipse cx="152" cy="180" rx="10" ry="6" fill="url(#brass-{uid})" />
    </g>
  {:else if tipeEfektif === 'saron'}
    <g>
      <path d="M54 142 L266 142 L250 184 L70 184 Z" fill="url(#wood-{uid})" stroke="#d8a84a" stroke-width="1.4" />
      {#each [0, 1, 2, 3, 4, 5] as i}
        <rect x={76 + i * 29} y={118 - i * 2} width="22" height="24" rx="3" fill="url(#brass-{uid})" />
      {/each}
      <circle cx="160" cy="64" r="30" fill="#2a1f12" stroke="url(#brass-{uid})" stroke-width="3.2" />
      <circle cx="160" cy="64" r="10" fill="url(#brass-{uid})" />
    </g>
  {:else if tipeEfektif === 'batik'}
    <g>
      <rect x="64" y="42" width="192" height="132" rx="6" fill={variant === 'paper' ? '#3d2415' : '#2a180d'} stroke="url(#brass-{uid})" stroke-width="1.8" />
      {#each [0, 90, 180, 270] as deg}
        <ellipse cx="160" cy="70" rx="18" ry="38" transform="rotate({deg + 45} 160 108)" fill="rgba(229,180,108,0.28)" stroke="#f1d39a" stroke-width="2" />
      {/each}
      <circle cx="160" cy="108" r="10" fill="#fff6e0" stroke={accent} stroke-width="2.4" />
    </g>
  {:else if tipeEfektif === 'joglo' || tipeEfektif === 'umpak'}
    <g>
      {#if tipeEfektif === 'umpak'}
        <rect x="44" y="164" width="232" height="22" rx="4" fill="#4b5563" />
        {#each [96, 224] as px}
          <polygon points={`${px - 22},164 ${px + 22},164 ${px + 14},134 ${px - 14},134`} fill="#64748b" stroke="#94a3b8" stroke-width="1.2" />
          <rect x={px - 9} y="38" width="18" height="96" fill="url(#wood-{uid})" />
        {/each}
      {:else}
        <polygon points="160,28 228,96 92,96" fill="#9a3412" stroke="#d8a84a" stroke-width="1.4" />
        <polygon points="92,96 228,96 270,130 50,130" fill="#7c2d12" stroke="#d8a84a" stroke-width="1.2" />
        <rect x="98" y="130" width="12" height="54" fill="url(#wood-{uid})" />
        <rect x="210" y="130" width="12" height="54" fill="url(#wood-{uid})" />
        <rect x="64" y="182" width="192" height="10" rx="3" fill="#475569" />
      {/if}
    </g>
  {:else if tipeEfektif === 'kidang'}
    <g>
      <ellipse cx="160" cy="46" rx="18" ry="12" fill="url(#brass-{uid})" />
      <ellipse cx="160" cy="64" rx="7" ry="10" fill="#f59e0b" />
      <path d="M108 158 C132 132, 168 134, 194 114 L214 88 M132 154 L120 186 M178 140 L198 182" stroke="url(#brass-{uid})" stroke-width="5" stroke-linecap="round" fill="none" />
      <ellipse cx="156" cy="140" rx="38" ry="18" transform="rotate(-12 156 140)" fill="url(#brass-{uid})" />
    </g>
  {:else}
    <g>
      <path d="M160 28 C196 76, 224 134, 204 178 L116 178 C96 134, 124 76, 160 28 Z" fill={accent} stroke="url(#brass-{uid})" stroke-width="2" />
      <rect x="157" y="48" width="6" height="148" fill="url(#brass-{uid})" />
    </g>
  {/if}
</svg>

<style>
  .pusaka-artwork {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }
</style>
