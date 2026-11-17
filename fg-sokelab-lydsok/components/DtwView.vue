<script setup lang="ts">
// Subsequence DTW: query (rader) mot hele sangen (kolonner).
// step 0: bare de to kurvene · 1: kostmatrisen · 2: beste sti + hvor i sangen
import { computed, onMounted, ref, watch } from 'vue'
import { getCtx, playTone } from '../lib/audio'
import { DS, HOP, ds, fakeHum, fill, songContour, subseqDtw } from '../lib/qbh'
import { songById, timed } from '../lib/songs'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 2 })

const song = songById('fader')
// «E F G –, E F G –» (slag 8–16), transponert +3 og 40 % saktere
const hum = fakeHum('fader', 8, 8, 3, 1.4, 7)
const q = ds(fill(hum.contour), DS)
const s = ds(fill(songContour(song)), DS)
const r = subseqDtw(q, s, true)
const N = q.length
const M = s.length

const W = 860
const H = 290
const L = 70 // venstre marg (query)
const T = 56 // topp-marg (sang)
const cw = (W - L - 6) / M
const ch = (H - T - 6) / N

const cv = ref<HTMLCanvasElement>()

function draw() {
  const g = cv.value?.getContext('2d')
  if (!g) return
  g.clearRect(0, 0, W, H)

  // Sangen langs toppen
  const sMin = Math.min(...s)
  const sMax = Math.max(...s)
  g.strokeStyle = '#98a6ea'
  g.lineWidth = 2
  g.beginPath()
  s.forEach((v, j) => {
    const xx = L + j * cw
    const yy = T - 8 - ((v - sMin) / (sMax - sMin || 1)) * (T - 18)
    j ? g.lineTo(xx, yy) : g.moveTo(xx, yy)
  })
  g.stroke()

  // Queryen langs venstre side (tid nedover)
  const qMin = Math.min(...q)
  const qMax = Math.max(...q)
  g.strokeStyle = '#5cb8da'
  g.beginPath()
  q.forEach((v, i) => {
    const yy = T + i * ch
    const xx = L - 8 - ((v - qMin) / (qMax - qMin || 1)) * (L - 18)
    i ? g.lineTo(xx, yy) : g.moveTo(xx, yy)
  })
  g.stroke()

  if (props.step >= 1) {
    // Lokal kost |q[i] − s[j]| med beste transponering: lys = lik
    const qm = q.reduce((a, b) => a + b, 0) / N
    const sm = s.reduce((a, b) => a + b, 0) / M + r.shift
    for (let i = 0; i < N; i++)
      for (let j = 0; j < M; j++) {
        const c = Math.abs(q[i] - qm - (s[j] - sm))
        const v = Math.exp(-c / 1.2)
        g.fillStyle = `rgba(30,215,96,${0.06 + 0.8 * v})`
        g.fillRect(L + j * cw, T + i * ch, cw + 0.5, ch + 0.5)
      }
  }

  if (props.step >= 2) {
    // Område i sangen
    g.fillStyle = 'rgba(245,155,35,0.18)'
    g.fillRect(L + r.start * cw, 0, (r.end - r.start + 1) * cw, T - 2)
    g.strokeStyle = '#e08a52'
    g.lineWidth = 3
    g.beginPath()
    r.path.forEach(([i, j], k) => {
      const xx = L + (j + 0.5) * cw
      const yy = T + (i + 0.5) * ch
      k ? g.lineTo(xx, yy) : g.moveTo(xx, yy)
    })
    g.stroke()
  }
}

onMounted(draw)
watch(() => props.step, draw)

const from = (r.start * HOP * DS).toFixed(1)
const to = (r.end * HOP * DS).toFixed(1)

function playSong() {
  const t0 = getCtx().currentTime + 0.05
  for (const n of timed(song)) if (n.pitch) playTone(n.pitch, t0 + n.start, n.dur * 0.95, 0.3, 'keys')
}
function playHum() {
  const t0 = getCtx().currentTime + 0.05
  for (const n of hum.notes) if (n.pitch) playTone(n.pitch + 0.3, t0 + n.start, n.dur * 0.95, 0.3, 'hum')
}
const info = computed(() => props.step >= 2)
</script>

<template>
  <div class="dtw">
    <div class="btns">
      <button class="pill g" @click="playSong">▶ Fader Jakob (sangen)</button>
      <button class="pill b" @click="playHum">▶ Spilt: saktere og høyere</button>
      <span v-if="info" class="res">
        Treff <strong class="o">{{ from }}–{{ to }} s</strong> · kost <strong class="o">{{ r.cost.toFixed(2) }}</strong>
      </span>
    </div>
    <canvas ref="cv" :width="W" :height="H" />
  </div>
</template>

<style scoped>
.dtw {
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
}
.o {
  color: var(--sp-orange);
}
canvas {
  background: var(--sp-surface);
  border-radius: 14px;
}
</style>
