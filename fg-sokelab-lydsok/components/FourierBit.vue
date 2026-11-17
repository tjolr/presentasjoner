<script setup lang="ts">
// Fourier visuelt: én rotete bit = sum av rene sinuser → én kolonne i spektrogrammet.
// Én gitarstreng (G): grunntone 196 Hz + overtoner 2×, 3×, 4×, 5×, svakere og svakere.
const parts = [1, 2, 3, 4, 5].map((n) => ({
  name: n === 1 ? 'grunntone' : `overtone ${n}×`,
  hz: 196 * n,
  cyc: 3 * n,
  amp: [1, 0.6, 0.45, 0.3, 0.2][n - 1],
  color: n === 1 ? 'var(--sp-green)' : 'var(--sp-blue)',
}))
const N = 240

function wave(fn: (t: number) => number, x0: number, w: number, yMid: number, h: number) {
  let d = ''
  for (let i = 0; i <= N; i++) {
    const t = i / N
    d += `${i ? 'L' : 'M'}${(x0 + t * w).toFixed(1)},${(yMid - fn(t) * h).toFixed(1)}`
  }
  return d
}
const sin = (p: (typeof parts)[number]) => (t: number) => p.amp * Math.sin(2 * Math.PI * p.cyc * t)
const sum = (t: number) => parts.reduce((s, p) => s + sin(p)(t), 0) / 2.2

const mix = wave(sum, 20, 220, 66, 44)
const comps = parts.map((p, i) => ({ ...p, d: wave(sin(p), 320, 200, 12 + i * 26, 9) }))

// Kolonne: 11 celler, lavest nederst. Grunntone og overtoner lyser med styrke = amplitude.
const cells = Array.from({ length: 11 }, (_, i) => i)
const lit: Record<number, (typeof parts)[number]> = Object.fromEntries(parts.map((p, i) => [1 + 2 * i, p]))
</script>

<template>
  <svg viewBox="0 0 860 146" class="w-full block">
    <path :d="mix" fill="none" stroke="var(--sp-text)" stroke-width="2" />
    <text x="130" y="142" text-anchor="middle" class="lbl">én bit av lyden (gitarstreng)</text>

    <text x="275" y="66" text-anchor="middle" class="op">=</text>

    <g v-for="(c, i) in comps" :key="c.hz">
      <path :d="c.d" fill="none" :stroke="c.color" :stroke-opacity="0.4 + 0.6 * c.amp" stroke-width="2" />
      <text x="532" :y="i * 26 + 16" class="lbl">{{ c.name }} · {{ c.hz }} Hz</text>
    </g>
    <text x="420" y="142" text-anchor="middle" class="lbl">sum av rene sinuser</text>

    <text x="690" y="66" text-anchor="middle" class="op">→</text>

    <g v-for="i in cells" :key="i">
      <rect
        x="740" :y="112 - i * 10" width="34" height="9" rx="1.5"
        :fill="lit[i] ? lit[i].color : 'var(--sp-surface)'"
        :fill-opacity="lit[i] ? 0.3 + 0.7 * lit[i].amp : 1"
      />
    </g>
    <text x="757" y="142" text-anchor="middle" class="lbl">én kolonne</text>
    <text x="782" y="10" class="lbl">frekvens ↑</text>
  </svg>
</template>

<style scoped>
.lbl { fill: var(--sp-sub); font-size: 13px; }
.op { fill: var(--sp-sub); font-size: 30px; dominant-baseline: middle; }
</style>
