<script lang="ts">
  import type { BendaPusaka } from '../content/pusaka.ts';

  interface Props {
    bendaId: BendaPusaka['id'];
    accent?: string;
    compact?: boolean;
    variant?: 'paper' | 'dark';
  }

  let { bendaId, accent = '#d1491b', compact = false, variant = 'dark' }: Props = $props();

  let uid = $derived(`${bendaId}-${compact ? 'c' : 'f'}-${variant}`);
</script>

<svg
  class="pusaka-artwork"
  class:is-compact={compact}
  class:is-paper={variant === 'paper'}
  viewBox="0 0 320 420"
  preserveAspectRatio={compact ? 'xMidYMid slice' : 'xMidYMid meet'}
  aria-hidden="true"
>
  <defs>
    <linearGradient id="bg-{uid}" x1="0%" y1="0%" x2="100%" y2="100%">
      {#if variant === 'paper'}
        <stop offset="0%" stop-color="#f7f4ed" />
        <stop offset="100%" stop-color="#eae4d7" />
      {:else}
        <stop offset="0%" stop-color="#191b22" />
        <stop offset="100%" stop-color="#101217" />
      {/if}
    </linearGradient>
    <linearGradient id="metal-{uid}" x1="0%" y1="0%" x2="100%" y2="100%">
      {#if variant === 'paper'}
        <stop offset="0%" stop-color="#9a6c1d" />
        <stop offset="52%" stop-color={accent} />
        <stop offset="100%" stop-color="#2c2a27" />
      {:else}
        <stop offset="0%" stop-color="#f6e3b4" />
        <stop offset="52%" stop-color="#d4a148" />
        <stop offset="100%" stop-color={accent} />
      {/if}
    </linearGradient>
    <pattern id="grid-{uid}" width="32" height="32" patternUnits="userSpaceOnUse">
      <path
        d="M 32 0 L 0 0 0 32"
        fill="none"
        stroke={variant === 'paper' ? 'rgba(20,21,24,0.065)' : 'rgba(255,255,255,0.045)'}
        stroke-width="0.7"
      />
    </pattern>
  </defs>

  <rect width="320" height="420" fill="url(#bg-{uid})" />
  <rect width="320" height="420" fill="url(#grid-{uid})" />

  <!-- Retikel kalibrasi arsitektural (drafting crosshair & corner ticks) -->
  <line
    x1="160"
    y1="26"
    x2="160"
    y2="348"
    stroke={variant === 'paper' ? 'rgba(20,21,24,0.1)' : 'rgba(255,255,255,0.08)'}
    stroke-width="0.75"
    stroke-dasharray="2 4"
  />
  <line
    x1="34"
    y1="185"
    x2="286"
    y2="185"
    stroke={variant === 'paper' ? 'rgba(20,21,24,0.1)' : 'rgba(255,255,255,0.08)'}
    stroke-width="0.75"
    stroke-dasharray="2 4"
  />
  <circle
    cx="160"
    cy="185"
    r="106"
    fill="none"
    stroke={variant === 'paper' ? 'rgba(20,21,24,0.14)' : 'rgba(255,255,255,0.1)'}
    stroke-width="0.85"
    stroke-dasharray="3 6"
  />
  <circle cx="160" cy="185" r="76" fill="none" stroke={accent} stroke-opacity="0.32" stroke-width="1" />

  <!-- Corner registration ticks -->
  <g stroke={variant === 'paper' ? 'rgba(20,21,24,0.28)' : 'rgba(255,255,255,0.22)'} stroke-width="1" fill="none">
    <path d="M18 32 L18 18 L32 18" />
    <path d="M288 18 L302 18 L302 32" />
    <path d="M18 388 L18 402 L32 402" />
    <path d="M288 402 L302 402 L302 388" />
  </g>

  {#if bendaId === 'keris'}
    <path
      d="M160 44 C172 78, 146 105, 168 140 C184 166, 142 195, 166 226 C178 244, 149 266, 160 288 L126 298 L196 290 L166 306 L160 356"
      fill="none"
      stroke="url(#metal-{uid})"
      stroke-width="9"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M160 52 C170 82, 148 106, 166 138 C180 164, 146 196, 164 226"
      fill="none"
      stroke={variant === 'paper' ? '#faf7f0' : '#fffbeb'}
      stroke-width="1.4"
      stroke-dasharray="3 4"
    />
    <rect
      x="148"
      y="302"
      width="24"
      height="48"
      rx="6"
      fill={variant === 'paper' ? '#3a2315' : '#451a03'}
      stroke={accent}
      stroke-width="1.4"
    />
  {:else if bendaId === 'saron'}
    <path
      d="M52 246 L268 246 L252 290 L68 290 Z"
      fill={variant === 'paper' ? '#352216' : '#27160b'}
      stroke={accent}
      stroke-width="1.8"
    />
    {#each [0, 1, 2, 3, 4, 5] as i}
      <rect
        x={72 + i * 31}
        y={214 - i * 4}
        width="23"
        height={32 + i * 2}
        rx="3"
        fill="url(#metal-{uid})"
      />
    {/each}
    <circle
      cx="160"
      cy="135"
      r="44"
      fill={variant === 'paper' ? '#2c2214' : '#2a1c08'}
      stroke="url(#metal-{uid})"
      stroke-width="4.5"
    />
    <circle cx="160" cy="135" r="13" fill="url(#metal-{uid})" />
  {:else if bendaId === 'batik'}
    {#each [0, 90, 180, 270] as deg}
      <ellipse
        cx="160"
        cy="126"
        rx="28"
        ry="56"
        transform="rotate({deg + 45} 160 185)"
        fill={variant === 'paper' ? 'rgba(184,93,40,0.18)' : 'rgba(232,93,42,0.22)'}
        stroke="url(#metal-{uid})"
        stroke-width="2.6"
      />
    {/each}
    <circle cx="160" cy="185" r="15" fill={variant === 'paper' ? '#f7f4ed' : '#fef3c7'} stroke={accent} stroke-width="2.8" />
    <circle cx="160" cy="185" r="4" fill="#1c1917" />
  {:else if bendaId === 'joglo'}
    <polygon
      points="160,64 234,158 86,158"
      fill={variant === 'paper' ? 'rgba(81,103,120,0.16)' : 'rgba(124,146,163,0.18)'}
      stroke="url(#metal-{uid})"
      stroke-width="2.6"
    />
    <polygon
      points="86,158 234,158 274,198 46,198"
      fill={variant === 'paper' ? 'rgba(81,103,120,0.08)' : 'rgba(124,146,163,0.09)'}
      stroke={accent}
      stroke-width="1.8"
    />
    <line x1="104" y1="198" x2="104" y2="296" stroke={variant === 'paper' ? '#272a30' : '#f1f5f9'} stroke-width="5" />
    <line x1="216" y1="198" x2="216" y2="296" stroke={variant === 'paper' ? '#272a30' : '#f1f5f9'} stroke-width="5" />
    <line x1="70" y1="298" x2="250" y2="298" stroke={accent} stroke-width="3.5" />
  {:else}
    <path
      d="M160 52 C198 118, 232 204, 214 282 L106 282 C88 204, 122 118, 160 52 Z"
      fill={variant === 'paper' ? 'rgba(179,48,37,0.16)' : 'rgba(200,62,49,0.22)'}
      stroke="url(#metal-{uid})"
      stroke-width="3"
    />
    <line x1="160" y1="78" x2="160" y2="338" stroke={variant === 'paper' ? '#7a5414' : '#fef08a'} stroke-width="3.2" />
    <path
      d="M160 190 Q125 160 132 135 M160 190 Q195 160 188 135 M160 230 Q116 205 120 175 M160 230 Q204 205 200 175"
      fill="none"
      stroke={variant === 'paper' ? accent : '#fde047'}
      stroke-width="2.2"
    />
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
