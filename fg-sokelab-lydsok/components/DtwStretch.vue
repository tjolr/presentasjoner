<script setup lang="ts">
// DTW uten matrise: sangen øverst, det du spilte under, på samme tidsakse.
// step 0: de to kurvene. Du er tregere og kommer etter.
// step 1: punkt-for-punkt (samme tidspunkt) → mange feil par
// step 2: DTW-par → linjene skrår, men krysser aldri, og nesten alle treffer
import { computed } from 'vue'
import { getCtx, playTone } from '../lib/audio'
import { HOP, fakeHum, mean, songContour } from '../lib/qbh'
import { type Song, songById, timed } from '../lib/songs'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })

// Utdraget «E F G –, E F G –» (slag 8–16), samme som på matrise-sliden
const FROM = 8
const BEATS = 8
const STRETCH = 1.4
const fader = songById('fader')
function excerpt(s: Song): Song {
  let b = 0
  const notes: Song['notes'] = []
  for (const nt of s.notes) {
    if (b >= FROM && b < FROM + BEATS) notes.push(nt)
    b += nt[1]
  }
  return { ...s, notes }
}
const part = excerpt(fader)
const songC = songContour(part)
const hum = fakeHum('fader', FROM, BEATS, 3, STRETCH, 7)

// Ett punkt per halve slag i sangens tempo, midt i hvert intervall
const DT = 60 / fader.bpm / 2
const sample = (c: Float32Array, n: number) =>
  Array.from({ length: n }, (_, k) => c[Math.min(c.length - 1, Math.round(((k + 0.5) * DT) / HOP))])
const sRaw = sample(songC, Math.round((songC.length * HOP) / DT))
const qRaw = sample(hum.contour, Math.round((hum.contour.length * HOP) / DT))
// Trekk fra snittet (steg 2), så tonearten ikke teller
const sm = mean(sRaw)
const qm = mean(qRaw)
const S = sRaw.map((v) => v - sm)
const Q = qRaw.map((v) => v - qm)

// Vanlig DTW (hele mot hele), samme straff for å strekke som i appen
const PEN = 0.25
function dtw(a: number[], b: number[]) {
  const N = a.length
  const M = b.length
  const D = Array.from({ length: N }, () => new Array<number>(M).fill(Infinity))
  for (let i = 0; i < N; i++)
    for (let j = 0; j < M; j++) {
      const c = Math.abs(a[i] - b[j])
      if (i === 0 && j === 0) D[i][j] = c
      else
        D[i][j] =
          c +
          Math.min(
            i > 0 && j > 0 ? D[i - 1][j - 1] : Infinity,
            i > 0 ? D[i - 1][j] + PEN : Infinity,
            j > 0 ? D[i][j - 1] + PEN : Infinity,
          )
    }
  const path: [number, number][] = [[N - 1, M - 1]]
  let i = N - 1
  let j = M - 1
  while (i > 0 || j > 0) {
    const d = i > 0 && j > 0 ? D[i - 1][j - 1] : Infinity
    const u = i > 0 ? D[i - 1][j] + PEN : Infinity
    const l = j > 0 ? D[i][j - 1] + PEN : Infinity
    if (d <= u && d <= l) {
      i--
      j--
    } else if (u <= l) i--
    else j--
    path.push([i, j])
  }
  return path.reverse()
}
const dtwPairs = dtw(Q, S)
// Punkt-for-punkt: dine punkt nr. i mot sangens nr. i. Resten av dine har ingen partner.
const naivePairs: [number, number][] = Q.map((_, i) => [i, i] as [number, number]).filter(([, j]) => j < S.length)

const W = 860
const H = 290
const L = 96
const R = 16
const TMAX = Q.length * DT
const x = (k: number) => L + ((k + 0.5) * DT * (W - L - R)) / TMAX
const SY = 62
const QY = 226
const yS = (v: number) => SY - v * 14
const yQ = (v: number) => QY - v * 14
const BAD = 1

const pairs = computed(() => (props.step === 1 ? naivePairs : props.step >= 2 ? dtwPairs : []))
const bad = computed(() => pairs.value.filter(([i, j]) => Math.abs(Q[i] - S[j]) > BAD).length)
const lonely = computed(() => (props.step === 1 ? Q.length - naivePairs.length : 0))

const stair = (arr: number[], yf: (v: number) => number) =>
  arr.map((v, k) => `${k ? 'L' : 'M'}${(x(k) - (k ? 0 : 6)).toFixed(1)},${yf(v).toFixed(1)}`).join('')

function playSong() {
  const t0 = getCtx().currentTime + 0.05
  for (const n of timed(part)) if (n.pitch) playTone(n.pitch, t0 + n.start, n.dur * 0.95, 0.3, 'keys')
}
function playHum() {
  const t0 = getCtx().currentTime + 0.05
  for (const n of hum.notes) if (n.pitch) playTone(n.pitch + 0.3, t0 + n.start, n.dur * 0.95, 0.3, 'hum')
}
</script>

<template>
  <div class="ds">
    <div class="btns">
      <button class="pill g" @click="playSong">▶ Sangen</button>
      <button class="pill b" @click="playHum">▶ Du spiller (40 % saktere)</button>
      <span v-if="step >= 1" class="res">
        <strong :class="bad ? 'r' : 'ok'">{{ bad }}</strong> av {{ pairs.length }} par er ulike toner<template
          v-if="lonely"
          >, {{ lonely }} punkter uten partner</template
        >
      </span>
    </div>
    <svg :width="W" :height="H" class="plot">
      <text x="12" :y="SY + 4" class="lbl s">Sangen</text>
      <text x="12" :y="QY + 4" class="lbl q">Du spiller</text>

      <line
        v-for="([i, j], k) in pairs"
        :key="step + '-' + k"
        :x1="x(j)"
        :y1="yS(S[j])"
        :x2="x(i)"
        :y2="yQ(Q[i])"
        class="pair"
        :class="{ bad: Math.abs(Q[i] - S[j]) > BAD }"
        :style="{ '--d': k * 0.02 + 's' }"
      />

      <path :d="stair(S, yS)" class="curve s" />
      <path :d="stair(Q, yQ)" class="curve q" />
      <circle v-for="(v, k) in S" :key="'s' + k" :cx="x(k)" :cy="yS(v)" r="4" class="dot s" />
      <circle
        v-for="(v, k) in Q"
        :key="'q' + k"
        :cx="x(k)"
        :cy="yQ(v)"
        r="4"
        class="dot q"
        :class="{ lonely: step === 1 && k >= S.length }"
      />
      <line
        v-if="step === 1"
        :x1="x(S.length - 0.5)"
        :x2="x(S.length - 0.5)"
        :y1="SY - 40"
        :y2="SY + 30"
        class="end"
      />
      <text v-if="step === 1" :x="x(S.length - 0.5) + 6" :y="SY - 26" class="lbl">sangen er ferdig</text>
    </svg>
  </div>
</template>

<style scoped>
.ds {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}
.btns {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 860px;
}
.res {
  margin-left: auto;
  color: var(--sp-sub);
  font-size: 14px;
}
.r {
  color: #ef6b6b;
}
.ok {
  color: var(--sp-green-bright);
}
.plot {
  background: var(--sp-surface);
  border-radius: 14px;
  overflow: visible;
}
.lbl {
  font-size: 13px;
  font-weight: 600;
  fill: var(--sp-sub);
}
.lbl.s {
  fill: var(--sp-green-bright);
}
.lbl.q {
  fill: var(--sp-blue);
}
.curve {
  fill: none;
  stroke-width: 2;
  opacity: 0.45;
}
.curve.s {
  stroke: var(--sp-green-bright);
}
.curve.q {
  stroke: var(--sp-blue);
}
.dot.s {
  fill: var(--sp-green-bright);
}
.dot.q {
  fill: var(--sp-blue);
  transition: opacity 0.3s;
}
.dot.lonely {
  opacity: 0.25;
}
.pair {
  stroke: var(--sp-green-bright);
  stroke-width: 1.5;
  opacity: 0.55;
  animation: pop 0.3s both;
  animation-delay: var(--d);
}
.pair.bad {
  stroke: #ef6b6b;
  stroke-width: 2;
  opacity: 0.9;
}
.end {
  stroke: rgba(255, 255, 255, 0.35);
  stroke-dasharray: 3 3;
}
@keyframes pop {
  from {
    opacity: 0;
  }
}
</style>
