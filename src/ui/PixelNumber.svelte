<script lang="ts">
  interface Props {
    value: string;
  }

  let { value = '01' }: Props = $props();

  // Matriks piksel 5x7 otentik bergaya angka bab townhouse.dev
  const GRID: Record<string, string[]> = {
    '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
    '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
    '2': ['01110', '10001', '00001', '00110', '01000', '10000', '11111'],
    '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
    '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
    '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  };

  let rects = $derived.by(() => {
    const out: Array<{ x: number; y: number }> = [];
    const digits = value.slice(0, 2).padStart(2, '0');
    [...digits].forEach((digit, dIdx) => {
      const mat = GRID[digit] ?? GRID['0'];
      const offsetX = dIdx * 6;
      mat.forEach((row, ry) => {
        [...row].forEach((cell, cx) => {
          if (cell === '1') {
            out.push({ x: offsetX + cx, y: ry });
          }
        });
      });
    });
    return out;
  });
</script>

<svg
  class="pixel-numeral"
  viewBox="0 0 11 7"
  aria-hidden="true"
  shape-rendering="crispEdges"
>
  {#each rects as r}
    <rect x={r.x} y={r.y} width="0.92" height="0.92" fill="currentColor" />
  {/each}
</svg>

<style>
  .pixel-numeral {
    width: 68px;
    height: auto;
    display: block;
    color: var(--text-primary);
    opacity: 0.95;
  }
</style>
