<script setup lang="ts">
// Hele søket: query (eksempel, lydklipp, mikrofon eller MIDI) → kNN topp 20 → DTW-rerank topp 3.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ftom, getCtx, isShown, playTone } from '../lib/audio'
import { onMidi } from '../lib/midi'
import { startTracker, yin } from '../lib/pitch'
import { HOP, type Ranked, fakeHum, fill, knn, queryVector, rerank } from '../lib/qbh'
import { songById, timed } from '../lib/songs'
import { playClip, selectedClip, source, stopClip } from '../lib/recording'

const REC_SEC = 5
/** Lydklipp: maks så mange sekunder melodi, regnet fra første tone */
const CLIP_SEC = 10
const root = ref<HTMLElement>()
const query = ref<Float32Array | null>(null)
const recording = ref(0)
const hits = ref<ReturnType<typeof knn>>([])
const ranked = ref<Ranked[]>([])
const stage = ref(0)
const ms = ref({ knn: 0, dtw: 0 })

const examples = [
  { label: 'Fader Jakob (midten, +5, surt)', id: 'fader', from: 6, beats: 8, tr: 5, st: 1.2 },
  { label: 'Let It Be (saktere, −3)', id: 'letitbe', from: 0, beats: 9, tr: -3, st: 1.3 },
  { label: 'Blinke (midten, +5)', id: 'blinke', from: 16, beats: 8, tr: 5, st: 1.1 },
]

function useExample(e: (typeof examples)[number]) {
  const h = fakeHum(e.id, e.from, e.beats, e.tr, e.st, 11)
  query.value = h.contour
  const t0 = getCtx().currentTime + 0.05
  for (const n of h.notes) if (n.pitch) playTone(n.pitch + 0.3, t0 + n.start, n.dur * 0.95, 0.3, 'hum')
  reset()
}

let buf: number[] = []
let midiNote: number | null = null
let stopTrack: (() => void) | undefined
let offMidi: (() => void) | undefined
let timer: ReturnType<typeof setInterval> | undefined

/** Lydklipp: kjør pitch-sporingen på hele klippet med en gang (ingen venting), trim stillhet, maks CLIP_SEC. */
let clipStop: ReturnType<typeof setTimeout> | undefined
function searchClip() {
  const b = selectedClip.value?.buf
  if (!b) return
  reset()
  const x = b.getChannelData(0)
  const sr = b.sampleRate
  const hop = Math.round(HOP * sr)
  const out: number[] = []
  let first = -1
  for (let i = 0; i + 2048 <= x.length; i += hop) {
    const f = yin(x.subarray(i, i + 2048), sr)
    if (first < 0) {
      if (f === null) continue
      first = i
    }
    out.push(f ? ftom(f) : NaN)
    if (out.length >= CLIP_SEC / HOP) break
  }
  // Stillhet på slutten kuttes av fill() i søket
  query.value = Float32Array.from(out)
  const from = first / sr
  playClip(from)
  clearTimeout(clipStop)
  clipStop = setTimeout(stopClip, out.length * HOP * 1000)
  search()
}

function record() {
  getCtx()
  if (source.value === 'clip' && selectedClip.value) return searchClip()
  buf = []
  reset()
  query.value = new Float32Array()
  recording.value = REC_SEC
  const t0 = performance.now()
  timer = setInterval(() => {
    const left = REC_SEC - (performance.now() - t0) / 1000
    recording.value = Math.max(0, Math.ceil(left))
    if (left <= 0) {
      clearInterval(timer)
      recording.value = 0
      query.value = Float32Array.from(buf)
      search()
    }
  }, 100)
}

function reset() {
  stage.value = 0
  hits.value = []
  ranked.value = []
}

function search() {
  if (!query.value || fill(query.value).length < 10) return
  const t0 = performance.now()
  hits.value = knn(queryVector(query.value), 20)
  const t1 = performance.now()
  ranked.value = rerank(query.value, hits.value).slice(0, 3)
  ms.value = { knn: t1 - t0, dtw: performance.now() - t1 }
  stage.value = 1
  setTimeout(() => (stage.value = 2), 900)
}

function playAt(r: Ranked) {
  const t0 = getCtx().currentTime + 0.05
  for (const n of timed(songById(r.song)))
    if (n.pitch && n.start >= r.from - 0.05 && n.start < r.to)
      playTone(n.pitch, t0 + n.start - r.from, n.dur * 0.95, 0.3, 'keys')
}

const W = 860
const H = 48
const qPath = computed(() => {
  const q = query.value
  if (!q || !q.length) return ''
  const f = fill(q)
  if (!f.length) return ''
  const lo = Math.min(...f) - 1
  const hi = Math.max(...f) + 1
  const n = Math.max(f.length, REC_SEC / HOP)
  let d = ''
  f.forEach((v, i) => (d += `${i ? 'L' : 'M'}${((i / n) * W).toFixed(1)},${(H - ((v - lo) / (hi - lo)) * H).toFixed(1)}`))
  return d
})

const title = (id: string) => songById(id).title

onMounted(() => {
  stopTrack = startTracker(
    (m) => {
      const v = midiNote ?? m
      buf.push(v ?? NaN)
      query.value = Float32Array.from(buf)
    },
    () => recording.value > 0 && isShown(root.value),
  )
  offMidi = onMidi((e) => {
    if (e.type === 'on') midiNote = e.note
    else if (e.note === midiNote) midiNote = null
  })
})
onBeforeUnmount(() => {
  stopTrack?.()
  offMidi?.()
  clearInterval(timer)
  clearTimeout(clipStop)
})
</script>

<template>
  <div ref="root" class="sd">
    <div class="btns">
      <button class="pill rec" :class="{ on: recording }" @click="record">
        {{ recording ? `● Tar opp … ${recording}` : source === 'clip' && selectedClip ? `▶ Søk med lydklipp (maks ${CLIP_SEC} s)` : '● Lytt 5 s (mikrofon / MIDI)' }}
      </button>
      <span class="sub">eller</span>
      <button v-for="e in examples" :key="e.label" class="pill b" @click="useExample(e)">▶ {{ e.label }}</button>
      <button class="pill g search" :disabled="!query || recording > 0" @click="search">Søk</button>
    </div>

    <svg :width="W" :height="H" class="q">
      <path :d="qPath" />
      <text v-if="!qPath" :x="W / 2" :y="H / 2 + 4" text-anchor="middle">query-kontur vises her</text>
    </svg>

    <div class="cols">
      <div class="col">
        <div class="h"><span class="n">1</span> kNN: topp 20 vinduer <span class="sub">({{ ms.knn.toFixed(1) }} ms)</span></div>
        <div class="grid">
          <div
            v-for="(h, i) in hits"
            :key="i"
            class="hit"
            :class="{ keep: stage >= 2 && ranked[0]?.song === h.song }"
            :style="{ '--d': i * 0.03 + 's' }"
          >
            <span class="t">{{ title(h.song) }}</span>
            <span class="m">{{ h.start.toFixed(0) }} s · d={{ h.dist.toFixed(1) }}</span>
          </div>
        </div>
      </div>
      <div class="arrow" :class="{ on: stage >= 2 }">→</div>
      <div class="col">
        <div class="h"><span class="n">2</span> DTW-rerank: topp 3 <span class="sub">({{ ms.dtw.toFixed(0) }} ms)</span></div>
        <div v-if="stage >= 2" class="list">
          <button v-for="(r, i) in ranked" :key="r.song" class="res" :class="{ first: i === 0 }" :style="{ '--d': i * 0.1 + 's' }" @click="playAt(r)">
            <span class="rank">{{ i + 1 }}</span>
            <span class="t">{{ title(r.song) }}</span>
            <span class="was">var #{{ r.knnRank + 1 }}</span>
            <span class="m">{{ r.from.toFixed(1) }}–{{ r.to.toFixed(1) }} s</span>
            <span class="c">kost {{ r.cost.toFixed(2) }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sd {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 880px;
}
.btns {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.search {
  margin-left: auto;
}
.rec.on {
  background: #e5484d;
  color: #fff;
}
.q {
  background: var(--sp-surface);
  border-radius: 12px;
}
.q path {
  fill: none;
  stroke: var(--sp-blue);
  stroke-width: 2.5;
}
.q text {
  fill: var(--sp-sub);
  font-size: 13px;
}
.cols {
  display: grid;
  grid-template-columns: 1fr 30px 1fr;
  gap: 10px;
}
.h {
  font-weight: 700;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.n {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--sp-green);
  color: #000;
  display: grid;
  place-items: center;
  font-size: 13px;
}
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px;
}
.hit {
  background: var(--sp-surface);
  border-radius: 8px;
  padding: 1px 8px;
  font-size: 11px;
  display: flex;
  justify-content: space-between;
  gap: 6px;
  animation: pop 0.3s both;
  animation-delay: var(--d);
  opacity: 0.85;
  transition: opacity 0.4s, box-shadow 0.4s;
}
.hit .t {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.hit .m {
  color: var(--sp-sub);
  white-space: nowrap;
}
.hit.keep {
  box-shadow: inset 0 0 0 1px var(--sp-green);
  opacity: 1;
}
.arrow {
  align-self: center;
  font-size: 28px;
  color: var(--sp-elev2);
  transition: color 0.4s;
}
.arrow.on {
  color: var(--sp-green-bright);
}
.list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.res {
  display: grid;
  grid-template-columns: 22px 1fr auto auto auto;
  align-items: center;
  column-gap: 10px;
  text-align: left;
  background: var(--sp-surface);
  border: none;
  border-radius: 10px;
  padding: 5px 12px;
  color: var(--sp-text);
  font: inherit;
  cursor: pointer;
  animation: pop 0.35s both;
  animation-delay: var(--d);
}
.res:hover {
  background: var(--sp-elev);
}
.res.first {
  box-shadow: 0 0 0 1px var(--sp-green), 0 8px 28px -10px rgba(127, 140, 213, 0.6);
}
.rank {
  font-weight: 800;
  font-size: 17px;
  color: var(--sp-green-bright);
}
.res .t {
  font-weight: 700;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.res .m,
.res .was {
  font-size: 12px;
  color: var(--sp-sub);
}
.res .c {
  font-size: 12px;
  color: var(--sp-orange);
  font-weight: 700;
}

@keyframes pop {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
}
</style>
