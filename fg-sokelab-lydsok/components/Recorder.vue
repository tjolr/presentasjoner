<script setup lang="ts">
// Ta opp (eller last inn) et lydklipp og vis hele bølgen. Klippet gjenbrukes i analysene senere.
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { getTap, isShown } from '../lib/audio'
import {
  clip,
  clipName,
  clipPos,
  loadFile,
  playClip,
  playing,
  recordingClip,
  startRecording,
  stopClip,
  stopRecording,
} from '../lib/recording'

const W = 860
const H = 220
const cv = ref<HTMLCanvasElement>()
const root = ref<HTMLElement>()
const file = ref<HTMLInputElement>()
const drag = ref(false)
const err = ref('')
const recSec = ref(0)
let recStart = 0
let live: number[] = [] // topp per frame under opptak
let raf = 0
let peaks: Float32Array | null = null // [min, max] per piksel

const nf = new Intl.NumberFormat('nb-NO')
const info = computed(() => {
  const c = clip.value
  if (!c) return ''
  return `${c.duration.toFixed(1).replace('.', ',')} s × ${nf.format(c.sampleRate)} per sekund = ${nf.format(c.length)} tall`
})

function computePeaks(b: AudioBuffer) {
  const d = b.getChannelData(0)
  const out = new Float32Array(W * 2)
  const per = d.length / W
  for (let x = 0; x < W; x++) {
    let lo = 0
    let hi = 0
    const a = Math.floor(x * per)
    const e = Math.min(d.length, Math.floor((x + 1) * per))
    for (let i = a; i < e; i++) {
      const v = d[i]
      if (v < lo) lo = v
      if (v > hi) hi = v
    }
    out[2 * x] = lo
    out[2 * x + 1] = hi
  }
  // Normaliser så stille opptak også synes
  let m = 0
  for (const v of out) m = Math.max(m, Math.abs(v))
  if (m > 0) for (let i = 0; i < out.length; i++) out[i] /= m
  return out
}

watch(clip, (c) => (peaks = c ? computePeaks(c) : null), { immediate: true })

function draw() {
  raf = requestAnimationFrame(draw)
  if (!cv.value || !isShown(root.value)) return
  const g = cv.value.getContext('2d')!
  g.clearRect(0, 0, W, H)
  const mid = H / 2
  g.strokeStyle = 'rgba(255,255,255,0.08)'
  g.beginPath()
  g.moveTo(0, mid)
  g.lineTo(W, mid)
  g.stroke()

  if (recordingClip.value) {
    recSec.value = (performance.now() - recStart) / 1000
    const buf = new Float32Array(2048)
    getTap().getFloatTimeDomainData(buf)
    let m = 0
    for (const v of buf) m = Math.max(m, Math.abs(v))
    live.push(m)
    const n = live.length
    const step = Math.max(1, n / W)
    g.fillStyle = '#e3342f'
    for (let x = 0; x < Math.min(W, n); x++) {
      const v = Math.min(1, live[Math.floor(x * step)] * 2)
      g.fillRect(x, mid - v * (mid - 6), 1, Math.max(1, 2 * v * (mid - 6)))
    }
    return
  }

  if (!peaks || !clip.value) {
    g.fillStyle = 'rgba(255,255,255,0.4)'
    g.font = '15px Inter, sans-serif'
    g.textAlign = 'center'
    g.fillText('Ta opp, eller slipp en lydfil her', W / 2, mid + 5)
    g.textAlign = 'start'
    return
  }
  const px = playing.value ? (clipPos.value / clip.value.duration) * W : -1
  for (let x = 0; x < W; x++) {
    g.fillStyle = x < px ? '#1ed760' : '#535353'
    const lo = peaks[2 * x]
    const hi = peaks[2 * x + 1]
    const y1 = mid - hi * (mid - 6)
    const y2 = mid - lo * (mid - 6)
    g.fillRect(x, y1, 1, Math.max(1, y2 - y1))
  }
  if (px >= 0) {
    g.fillStyle = '#fff'
    g.fillRect(px, 0, 2, H)
  }
}

async function toggleRec() {
  err.value = ''
  if (recordingClip.value) return stopRecording()
  try {
    live = []
    recStart = performance.now()
    await startRecording()
  } catch (e) {
    err.value = 'Fikk ikke tilgang til mikrofonen'
  }
}

async function onFile(f?: File | null) {
  if (!f) return
  err.value = ''
  try {
    await loadFile(f)
  } catch {
    err.value = 'Klarte ikke å lese lydfila'
  }
}

function onDrop(e: DragEvent) {
  drag.value = false
  void onFile(e.dataTransfer?.files?.[0])
}

function seek(e: MouseEvent) {
  if (!clip.value || recordingClip.value) return
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
  playClip(((e.clientX - r.left) / r.width) * clip.value.duration)
}

onMounted(draw)
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<template>
  <div ref="root" class="rec">
    <div class="btns">
      <button class="pill rb" :class="{ on: recordingClip }" @click="toggleRec">
        {{ recordingClip ? `■ Stopp (${recSec.toFixed(0)} s)` : '● Ta opp' }}
      </button>
      <button class="pill" @click="file?.click()">Last inn fil</button>
      <input ref="file" type="file" accept="audio/*" hidden @change="onFile(($event.target as HTMLInputElement).files?.[0])" />
      <button v-if="clip && !recordingClip" class="pill g" @click="playing ? stopClip() : playClip()">
        {{ playing ? '■ Stopp' : '▶ Spill av' }}
      </button>
      <span class="sub name">{{ err || clipName }}</span>
    </div>
    <div
      class="box"
      :class="{ drag }"
      @dragover.prevent="drag = true"
      @dragleave="drag = false"
      @drop.prevent="onDrop"
      @click="seek"
    >
      <canvas ref="cv" :width="W" :height="H" />
    </div>
    <div class="info">{{ info }}</div>
  </div>
</template>

<style scoped>
.rec {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 860px;
}
.btns {
  display: flex;
  gap: 8px;
  align-items: center;
}
.name {
  margin-left: 8px;
  font-size: 14px;
}
.rb.on {
  background: #e3342f;
  color: #fff;
}
.box {
  background: var(--sp-surface);
  border-radius: 14px;
  cursor: pointer;
  outline: 2px dashed transparent;
  transition: outline-color 0.2s;
}
.box.drag {
  outline-color: var(--sp-green);
}
canvas {
  display: block;
}
.info {
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  color: var(--sp-green-bright);
  min-height: 1.5em;
  font-variant-numeric: tabular-nums;
}
</style>
