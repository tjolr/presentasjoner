<script setup lang="ts">
// Live lydbølge og/eller rullende spektrogram av alt som spilles + mikrofonen.
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { GUITAR, getCtx, getTap, isShown, mtof, playTone, pluck, strum } from '../lib/audio'
import { songById, timed } from '../lib/songs'

const props = withDefaults(
  defineProps<{
    view?: 'wave' | 'spec' | 'both'
    /** Marker topper i spektrogrammet (Shazam-stjernebilde) */
    peaks?: boolean
    height?: number
    width?: number
    /** Bølgen går helt ut til kantene og ned til bunnen av sliden */
    bleed?: boolean
  }>(),
  { view: 'both', peaks: false, height: 230, width: 860, bleed: false },
)

const wave = ref<HTMLCanvasElement>()
const spec = ref<HTMLCanvasElement>()
const root = ref<HTMLElement>()
const W = props.bleed ? 980 : props.width
let frame = 0
const FMIN = 60
const FMAX = 5000
let raf = 0

const sources = [
  { label: 'Sinus 440 Hz', play: () => playTone(69, getCtx().currentTime, 1.6, 0.35, 'sine') },
  { label: 'Gitarstreng', play: () => pluck(52) },
  { label: 'Akkord (G)', play: () => strum(GUITAR.G) },
  {
    label: 'Melodi',
    play: () => {
      const t0 = getCtx().currentTime + 0.05
      for (const nt of timed(songById('fader')).slice(0, 14))
        if (nt.pitch) pluck(nt.pitch, t0 + nt.start, 0.45, nt.dur + 0.04)
    },
  },
]

function yFor(f: number, h: number) {
  return h - (Math.log(f / FMIN) / Math.log(FMAX / FMIN)) * h
}

function draw() {
  raf = requestAnimationFrame(draw)
  if (!isShown(root.value)) return
  const tap = getTap()
  const sr = getCtx().sampleRate

  if (wave.value) {
    const g = wave.value.getContext('2d')!
    const h = wave.value.height
    const buf = new Float32Array(tap.fftSize)
    tap.getFloatTimeDomainData(buf)
    // Finn en nullgjennomgang så bølgen står stille
    let z = 0
    for (let i = 1; i < 2000; i++)
      if (buf[i - 1] < 0 && buf[i] >= 0) {
        z = i
        break
      }
    g.clearRect(0, 0, W, h)
    const mid = props.bleed ? h * 0.42 : h / 2
    g.strokeStyle = 'rgba(255,255,255,0.06)'
    g.lineWidth = 1
    g.beginPath()
    g.moveTo(0, mid)
    g.lineTo(W, mid)
    g.stroke()
    const n = 1200
    const amp = props.bleed ? h * 0.8 : h * 0.9
    g.beginPath()
    for (let i = 0; i < n; i++) {
      const x = (i / n) * W
      const y = mid - buf[z + i] * amp
      i ? g.lineTo(x, y) : g.moveTo(x, y)
    }
    // Myk lavendel-flate under kurven som tones ut mot bunnen
    g.lineTo(W, h)
    g.lineTo(0, h)
    g.closePath()
    const grad = g.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, 'rgba(127,140,213,0.16)')
    grad.addColorStop(0.55, 'rgba(127,140,213,0.06)')
    grad.addColorStop(1, 'rgba(127,140,213,0)')
    g.fillStyle = grad
    g.fill()
    g.strokeStyle = '#98a6ea'
    g.lineWidth = 2
    g.beginPath()
    for (let i = 0; i < n; i++) {
      const x = (i / n) * W
      const y = mid - buf[z + i] * amp
      i ? g.lineTo(x, y) : g.moveTo(x, y)
    }
    g.stroke()
  }

  if (spec.value) {
    const g = spec.value.getContext('2d')!
    const h = spec.value.height
    const db = new Float32Array(tap.frequencyBinCount)
    tap.getFloatFrequencyData(db)
    const step = 3
    g.drawImage(spec.value, -step, 0)
    const col = new Float32Array(h)
    for (let y = 0; y < h; y++) {
      const f = FMIN * (FMAX / FMIN) ** (1 - y / h)
      const bin = Math.round((f / sr) * tap.fftSize)
      const v = Math.max(0, Math.min(1, (db[bin] + 95) / 70))
      col[y] = v
      // Svart → lavendel (--pad) → hvitt
      const a = Math.min(1, v * 1.35)
      const w = v ** 4
      g.fillStyle = `rgb(${Math.round(127 * a + 128 * w)},${Math.round(140 * a + 115 * w)},${Math.round(213 * a + 42 * w)})`
      g.fillRect(W - step, y, step, 1)
    }
    frame++
    // Bare hver 8. kolonne, og maks 3 topper: da blir det et «stjernekart» av prikker
    if (props.peaks && frame % 8 === 0) {
      const found: [number, number][] = []
      for (let y = 2; y < h - 2; y++) {
        const v = col[y]
        if (v > 0.62 && v >= col[y - 1] && v >= col[y + 1] && v >= col[y - 2] && v >= col[y + 2]) found.push([y, v])
      }
      found.sort((a, b) => b[1] - a[1])
      g.fillStyle = '#fff'
      for (const [y] of found.slice(0, 3)) {
        g.beginPath()
        g.arc(W - step / 2, y, 3.2, 0, Math.PI * 2)
        g.fill()
      }
    }
  }
}

const ticks = [100, 250, 500, 1000, 2000, 4000]

onMounted(() => {
  getCtx()
  if (spec.value) {
    const g = spec.value.getContext('2d')!
    g.fillStyle = '#000'
    g.fillRect(0, 0, W, spec.value.height)
  }
  draw()
})
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<template>
  <div ref="root" class="scope">
    <div class="src">
      <button v-for="s in sources" :key="s.label" class="pill" @click="s.play">{{ s.label }}</button>
    </div>
    <div v-if="view !== 'spec'" class="box" :class="{ bleed }">
      <span v-if="!bleed" class="tag">Lydbølge · amplitude over tid</span>
      <canvas ref="wave" :width="W" :height="view === 'wave' ? height : 110" />
    </div>
    <div v-if="view !== 'wave'" class="box">
      <span class="tag">Spektrogram · frekvens over tid</span>
      <canvas ref="spec" :width="W" :height="view === 'spec' ? height : height - 60" />
      <div class="axis">
        <span
          v-for="f in ticks"
          :key="f"
          :style="{ top: (yFor(f, view === 'spec' ? height : height - 60) - 8) + 'px' }"
        >{{ f >= 1000 ? f / 1000 + ' kHz' : f + ' Hz' }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scope {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}
.src {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}
.box {
  position: relative;
  background: var(--surface-card);
  border: 1px solid var(--border-panel);
  border-radius: var(--radius-2xl);
  overflow: hidden;
}
.box.bleed {
  background: transparent;
  border: none;
  border-radius: 0;
}
.box.bleed canvas {
  width: 100%;
}
canvas {
  display: block;
}
.tag {
  position: absolute;
  left: 14px;
  top: 10px;
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.25em;
  color: var(--text-low);
  z-index: 1;
}
.axis span {
  position: absolute;
  right: 8px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.45);
}
</style>
