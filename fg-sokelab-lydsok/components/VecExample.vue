<script setup lang="ts">
// Ett vindu → 64 tall.
// step 0: vinduet 4–9 s av Blinke, én måling per 30 ms (167 tall)
// step 1: krympet til 64 punkter, formen er den samme
// step 2: de 64 tallene som søyler og som liste
import { computed } from 'vue'
import { DIMS, HOP, WIN, center, fill, resample, songContour } from '../lib/qbh'
import { songById } from '../lib/songs'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const W = 820
const H = 180
const START = 4
const c = fill(songContour(songById('blinke')))
const a = Math.round(START / HOP)
const raw = center(c.slice(a, a + Math.round(WIN / HOP)))
const vec = center(resample(raw, DIMS))

const xr = (i: number) => 10 + (i / (raw.length - 1)) * (W - 20)
const xv = (i: number) => 10 + (i / (DIMS - 1)) * (W - 20)
const Y = 18
const y = (v: number) => H / 2 - v * Y

const rawD = Array.from(raw)
  .map((v, i) => `${i ? 'L' : 'M'}${xr(i).toFixed(1)},${y(v).toFixed(1)}`)
  .join('')
const fmt = (v: number) => v.toFixed(1).replace('.', ',').replace('-', '−')
const list = computed(() => Array.from(vec).map(fmt))
</script>

<template>
  <div class="ve">
    <svg :width="W" :height="H" class="plot">
      <line x1="0" :x2="W" :y1="H / 2" :y2="H / 2" class="zero" />
      <path :d="rawD" class="line" :class="{ faint: step >= 2 }" />
      <g :class="{ faint: step >= 1 }" class="rawdots">
        <circle v-for="(v, i) in raw" :key="i" :cx="xr(i)" :cy="y(v)" r="1.5" />
      </g>
      <g v-if="step === 1" class="vdots">
        <circle v-for="(v, i) in vec" :key="i" :cx="xv(i)" :cy="y(v)" r="4" :style="{ '--d': i * 0.012 + 's' }" />
      </g>
      <g v-if="step >= 2">
        <rect
          v-for="(v, i) in vec"
          :key="i"
          :x="xv(i) - 4"
          width="8"
          :y="v >= 0 ? y(v) : H / 2"
          :height="Math.max(1, Math.abs(v) * Y)"
          rx="2"
          class="bar"
          :style="{ '--d': i * 0.012 + 's' }"
        />
      </g>
      <text x="12" y="18" class="lbl">
        {{ step === 0 ? `5 s ÷ 30 ms = ${raw.length} målinger` : `${DIMS} punkter` }}
      </text>
    </svg>
    <code v-if="step >= 2" class="arr">[ {{ list.slice(0, 16).join(', ') }}, … ]  ← {{ DIMS }} tall</code>
  </div>
</template>

<style scoped>
.ve {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.plot {
  background: var(--sp-surface);
  border-radius: 14px;
  overflow: visible;
}
.zero {
  stroke: rgba(255, 255, 255, 0.12);
  stroke-dasharray: 4 4;
}
.line {
  fill: none;
  stroke: var(--sp-green-bright);
  stroke-width: 2;
  opacity: 0.35;
}
.rawdots circle {
  fill: var(--sp-text);
}
.rawdots,
.line {
  transition: opacity 0.4s;
}
.faint {
  opacity: 0.2;
}
.vdots circle {
  fill: var(--sp-orange);
  animation: pop 0.3s both;
  animation-delay: var(--d);
}
.bar {
  fill: var(--sp-orange);
  animation: pop 0.3s both;
  animation-delay: var(--d);
}
@keyframes pop {
  from {
    opacity: 0;
  }
}
.lbl {
  font-size: 13px;
  font-weight: 600;
  fill: var(--sp-sub);
}
.arr {
  font-size: 13px;
  color: var(--sp-sub);
}
</style>
