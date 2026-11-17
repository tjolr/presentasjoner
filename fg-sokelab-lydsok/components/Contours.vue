<script setup lang="ts">
// Steg for steg: kontur → normaliser (trekk fra snitt) → overlappende vinduer → vektor (64 tall).
// step 0: sang og nynnet query i hver sin toneart
// step 1: begge sentrert, de ligger oppå hverandre
// step 2: overlappende vinduer
// step 3: ett vindu som vektor
import { computed } from 'vue'
import { getCtx, playTone } from '../lib/audio'
import { DIMS, HOP, WIN, center, fakeHum, fill, mean, resample, songContour } from '../lib/qbh'
import { songById, songLength, timed } from '../lib/songs'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const W = 860
const H = 170
const song = songById('blinke')
const len = songLength(song)
const sc = songContour(song)
// Utdraget «G G F F E E D» starter på slag 16
const qStart = 16 * (60 / song.bpm)
const hum = fakeHum('blinke', 16, 8, 5, 1, 3)
const q = hum.contour

const x = (t: number) => (t / len) * W
const LO = 48
const HI = 80
const yAbs = (m: number) => H - 14 - ((m - LO) / (HI - LO)) * (H - 28)
const yRel = (v: number) => H / 2 - v * 9

const songMean = mean(fill(sc))
const qMean = mean(fill(q))
// Snittet av akkurat det området queryen dekker i sangen
const regionMean = mean(fill(sc.subarray(Math.round(qStart / HOP), Math.round((qStart + q.length * HOP) / HOP))))

function path(arr: Float32Array, t0: number, yf: (v: number) => number, off = 0) {
  let d = ''
  let pen = false
  arr.forEach((v, i) => {
    if (Number.isNaN(v)) {
      pen = false
      return
    }
    d += `${pen ? 'L' : 'M'}${x(t0 + i * HOP).toFixed(1)},${yf(v - off).toFixed(1)}`
    pen = true
  })
  return d
}

const normalized = computed(() => props.step >= 1)
const songD = computed(() => (normalized.value ? path(sc, 0, yRel, regionMean) : path(sc, 0, yAbs)))
const qD = computed(() => (normalized.value ? path(q, qStart, yRel, qMean) : path(q, qStart, yAbs)))

const wins = computed(() => {
  const out: { s: number; e: number }[] = []
  for (let s = 0; s + WIN <= len + 0.01; s += WIN_HOP) out.push({ s, e: s + WIN })
  return out
})
const WIN_HOP = 2 // som i forklaringen; demoen bruker 1 s og flere vindusstørrelser
const pick = 2 // vinduet 4–9 s
const vec = computed(() => {
  const c = fill(sc)
  const a = Math.round(wins.value[pick].s / HOP)
  return center(resample(c.subarray(a, a + Math.round(WIN / HOP)), DIMS))
})

function playSong() {
  const t0 = getCtx().currentTime + 0.05
  for (const n of timed(song)) if (n.pitch) playTone(n.pitch, t0 + n.start, n.dur * 0.95, 0.3, 'keys')
}
function playHum() {
  const t0 = getCtx().currentTime + 0.05
  for (const n of hum.notes) if (n.pitch) playTone(n.pitch + 0.3, t0 + n.start, n.dur * 0.95, 0.3, 'hum')
}
</script>

<template>
  <div class="ct">
    <div class="btns">
      <button class="pill g" @click="playSong">▶ Sangen (MIDI)</button>
      <button v-if="step < 2" class="pill b" @click="playHum">▶ Spilt query (+5, litt surt)</button>
    </div>
    <svg :width="W" :height="H" class="plot">
      <line v-if="normalized" x1="0" :x2="W" :y1="H / 2" :y2="H / 2" class="zero" />
      <g v-if="step >= 2">
        <rect
          v-for="(w, i) in wins"
          :key="i"
          :x="x(w.s)"
          :width="x(WIN)"
          y="0"
          :height="H"
          class="win"
          :class="{ pick: step >= 3 && i === pick, dim: step >= 3 && i !== pick }"
          :style="{ '--d': i * 0.12 + 's' }"
        />
      </g>
      <path :d="songD" class="song" />
      <path v-if="step < 2" :d="qD" class="q" />
      <text v-if="step === 0" :x="x(qStart) + 4" :y="yAbs(72) - 6" class="lbl b">query: alle tall +5</text>
      <text v-if="step === 1" :x="x(qStart) + 4" :y="yRel(5)" class="lbl b">etter normalisering: samme form</text>
    </svg>
    <div v-if="step >= 2 && step < 3" class="winlist">
      <span v-for="(w, i) in wins" :key="i" class="chip">{{ w.s }}–{{ w.e }} s</span>
    </div>
    <div v-if="step >= 3" class="vec">
      <svg :width="W" height="70">
        <rect
          v-for="(v, i) in vec"
          :key="i"
          :x="i * (W / DIMS) + 1"
          :width="W / DIMS - 2"
          :y="v >= 0 ? 35 - v * 5 : 35"
          :height="Math.max(1, Math.abs(v) * 5)"
          rx="2"
          class="bar"
        />
      </svg>
      <code>[ {{ Array.from(vec.slice(0, 6)).map((v) => v.toFixed(1)).join(', ') }}, … ]  ← 64 tall</code>
    </div>
  </div>
</template>

<style scoped>
.ct {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}
.btns {
  display: flex;
  gap: 8px;
}
.plot {
  background: var(--sp-surface);
  border-radius: 14px;
  overflow: visible;
}
path {
  fill: none;
  stroke-width: 3;
  stroke-linejoin: round;
  transition: d 0.8s cubic-bezier(0.3, 0.9, 0.3, 1);
}
.song {
  stroke: var(--sp-green-bright);
}
.q {
  stroke: var(--sp-blue);
  stroke-dasharray: 0;
  opacity: 0.9;
}
.zero {
  stroke: rgba(255, 255, 255, 0.12);
  stroke-dasharray: 4 4;
}
.win {
  fill: rgba(245, 155, 35, 0.035);
  stroke: rgba(245, 155, 35, 0.45);
  stroke-width: 1.5;
  animation: pop 0.5s both;
  animation-delay: var(--d);
}
.win.dim {
  opacity: 0.12;
}
.win.pick {
  fill: rgba(245, 155, 35, 0.28);
  stroke: var(--sp-orange);
  stroke-width: 3;
}
@keyframes pop {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}
.lbl {
  font-size: 13px;
  font-weight: 600;
}
.lbl.b {
  fill: var(--sp-blue);
}
.winlist {
  display: flex;
  gap: 8px;
}
.chip {
  background: var(--sp-surface);
  border: 1px solid rgba(245, 155, 35, 0.5);
  color: var(--sp-orange);
  border-radius: 999px;
  padding: 3px 12px;
  font-size: 13px;
  font-weight: 600;
}
.vec {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.bar {
  fill: var(--sp-orange);
  animation: pop 0.4s both;
}
code {
  font-size: 13px;
  color: var(--sp-sub);
}
</style>
