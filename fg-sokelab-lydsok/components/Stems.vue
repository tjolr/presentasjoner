<script setup lang="ts">
// Fire stems summeres til én miks. Stem separation (Demucs) prøver å gå motsatt vei.
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { getCtx, getMaster, getTap, hat, isShown, kick, playTone, pluck, snare } from '../lib/audio'

const BPM = 96
const beat = 60 / BPM
// 1 5 6m 4 i G
const BASS = [43, 38, 40, 36]
const KEYS = [
  [55, 59, 62],
  [54, 57, 62],
  [55, 59, 64],
  [55, 60, 64],
]
const MEL = [
  [71, 74, 71, 67],
  [69, 66, 69, 74],
  [71, 67, 71, 76],
  [72, 67, 64, 67],
]

const stems = reactive([
  { id: 'drums', name: 'Trommer', color: '#e08a52', on: true },
  { id: 'bass', name: 'Bass', color: '#5cb8da', on: true },
  { id: 'keys', name: 'Akkorder', color: '#b47ab7', on: true },
  { id: 'mel', name: 'Gitar', color: '#98a6ea', on: true },
])
const nodes: Record<string, { g: GainNode; a: AnalyserNode }> = {}
const canvases = ref<HTMLCanvasElement[]>([])
const mixCv = ref<HTMLCanvasElement>()
const root = ref<HTMLElement>()
const playing = ref(false)
let timer: ReturnType<typeof setInterval> | undefined
let raf = 0
let next = 0
let step = 0 // åttendedeler

function setup() {
  const c = getCtx()
  for (const s of stems) {
    if (nodes[s.id]) continue
    const g = c.createGain()
    const a = c.createAnalyser()
    a.fftSize = 2048
    g.connect(a)
    a.connect(getMaster())
    nodes[s.id] = { g, a }
  }
}

function toggleStem(s: (typeof stems)[number]) {
  s.on = !s.on
  nodes[s.id]?.g.gain.setTargetAtTime(s.on ? 1 : 0, getCtx().currentTime, 0.02)
}

function schedule() {
  const c = getCtx()
  while (next < c.currentTime + 0.15) {
    const bar = Math.floor(step / 8) % 4
    const e = step % 8
    const t = next
    const d = nodes.drums.g
    if (e === 0 || e === 4) kick(t, d)
    if (e === 2 || e === 6) snare(t, d)
    hat(t, e % 2 ? 0.12 : 0.22, d)
    if (e === 0 || e === 4 || e === 7) playTone(BASS[bar], t, beat * (e === 7 ? 0.45 : 1.8), 0.5, 'bass', nodes.bass.g)
    if (e === 0) KEYS[bar].forEach((m) => playTone(m, t, beat * 3.9, 0.13, 'keys', nodes.keys.g))
    if (e % 2 === 0) pluck(MEL[bar][e / 2], t, 0.45, beat + 0.04, nodes.mel.g)
    next += beat / 2
    step++
  }
}

function toggle() {
  if (playing.value) {
    clearInterval(timer)
    playing.value = false
    return
  }
  setup()
  next = getCtx().currentTime + 0.08
  step = 0
  schedule()
  timer = setInterval(schedule, 25)
  playing.value = true
}

function drawWave(cv: HTMLCanvasElement | undefined, a: AnalyserNode, color: string) {
  if (!cv) return
  const g = cv.getContext('2d')!
  const buf = new Float32Array(a.fftSize)
  a.getFloatTimeDomainData(buf)
  g.clearRect(0, 0, cv.width, cv.height)
  g.strokeStyle = color
  g.lineWidth = 1.6
  g.beginPath()
  for (let i = 0; i < buf.length; i += 2) {
    const x = (i / buf.length) * cv.width
    const y = cv.height / 2 - buf[i] * cv.height * 0.9
    i ? g.lineTo(x, y) : g.moveTo(x, y)
  }
  g.stroke()
}

function loop() {
  raf = requestAnimationFrame(loop)
  if (!isShown(root.value)) {
    if (playing.value) toggle()
    return
  }
  stems.forEach((s, i) => nodes[s.id] && drawWave(canvases.value[i], nodes[s.id].a, s.color))
  drawWave(mixCv.value, getTap(), '#ffffff')
}

onMounted(loop)
onBeforeUnmount(() => {
  clearInterval(timer)
  cancelAnimationFrame(raf)
})
</script>

<template>
  <div ref="root" class="st">
    <div class="lanes">
      <div v-for="(s, i) in stems" :key="s.id" class="lane" :class="{ off: !s.on }">
        <button class="tg" :style="{ '--c': s.color }" @click="toggleStem(s)">{{ s.name }}</button>
        <canvas :ref="(el) => (canvases[i] = el as HTMLCanvasElement)" width="400" height="44" />
      </div>
      <div class="sum">＋</div>
      <div class="lane mix">
        <button class="play" :class="{ on: playing }" @click="toggle">{{ playing ? '■ Stopp' : '▶ Spill miks' }}</button>
        <canvas ref="mixCv" width="400" height="64" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.st {
  display: flex;
  justify-content: center;
}
.lanes {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.lane {
  display: flex;
  align-items: center;
  gap: 14px;
  transition: opacity 0.3s;
}
.lane.off {
  opacity: 0.3;
}
.tg {
  width: 140px;
  text-align: left;
  border: none;
  border-left: 4px solid var(--c);
  background: var(--sp-surface);
  color: var(--sp-text);
  font: inherit;
  font-weight: 700;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
}
canvas {
  background: var(--sp-surface);
  border-radius: 8px;
}
.sum {
  text-align: center;
  color: var(--sp-sub);
  font-size: 20px;
  padding-left: 154px;
  line-height: 1;
}
.play {
  width: 140px;
  border: none;
  background: var(--sp-green);
  color: #000;
  font: inherit;
  font-weight: 800;
  padding: 18px 14px;
  border-radius: 8px;
  cursor: pointer;
}
.play.on {
  background: var(--sp-elev2);
  color: #fff;
}
</style>
