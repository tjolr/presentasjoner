<script setup lang="ts">
// Live pitch-kontur: fra synth, mikrofon (gitar/nynning) eller MIDI-keyboard.
import ClipButton from './ClipButton.vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { getCtx, isShown, noteName, playTone, pluck } from '../lib/audio'
import { onMidi } from '../lib/midi'
import { startTracker } from '../lib/pitch'
import { songById, timed } from '../lib/songs'

const W = 860
const H = 260
const LO = 40 // E2
const HI = 84 // C6
const PX = 3 // piksler per 30 ms
const cv = ref<HTMLCanvasElement>()
const root = ref<HTMLElement>()
const current = ref<number | null>(null)
const hz = ref(0)

const pts: { v: number | null; midi: boolean }[] = []
let midiNote: number | null = null
let stop: (() => void) | undefined
let offMidi: (() => void) | undefined
let raf = 0

const y = (m: number) => H - ((m - LO) / (HI - LO)) * H

function playSong(id: string, kind: 'pluck' | 'hum', n = 14) {
  const t0 = getCtx().currentTime + 0.05
  for (const nt of timed(songById(id)).slice(0, n)) {
    if (!nt.pitch) continue
    if (kind === 'pluck') pluck(nt.pitch - 12, t0 + nt.start, 0.55, nt.dur + 0.04)
    else playTone(nt.pitch, t0 + nt.start, nt.dur * 0.95, 0.3, 'hum')
  }
}

function draw() {
  raf = requestAnimationFrame(draw)
  if (!cv.value || !isShown(root.value)) return
  const g = cv.value.getContext('2d')!
  g.clearRect(0, 0, W, H)
  // Notelinjer: C og G uthevet
  for (let m = LO; m <= HI; m++) {
    const pc = m % 12
    if (pc !== 0 && pc !== 7 && pc !== 4) continue
    g.strokeStyle = pc === 0 ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.05)'
    g.beginPath()
    g.moveTo(34, y(m))
    g.lineTo(W, y(m))
    g.stroke()
    g.fillStyle = 'rgba(255,255,255,0.4)'
    g.font = '10px Geist, sans-serif'
    g.fillText(noteName(m), 4, y(m) + 3)
  }
  const n = Math.floor((W - 40) / PX)
  const start = Math.max(0, pts.length - n)
  for (let i = start; i < pts.length; i++) {
    const p = pts[i]
    if (p.v === null) continue
    g.fillStyle = p.midi ? '#e08a52' : '#98a6ea'
    g.fillRect(40 + (i - start) * PX, y(p.v) - 2, PX, 4)
  }
}

onMounted(() => {
  stop = startTracker((m) => {
    const fromMidi = midiNote !== null
    const v = fromMidi ? midiNote : m !== null && m >= LO && m <= HI ? m : null
    pts.push({ v, midi: fromMidi })
    if (pts.length > 4000) pts.splice(0, 1000)
    current.value = v
    if (v !== null) hz.value = 440 * 2 ** ((v - 69) / 12)
  }, () => isShown(root.value))
  offMidi = onMidi((e) => {
    if (e.type === 'on') midiNote = e.note
    else if (e.note === midiNote) midiNote = null
  })
  draw()
})
onBeforeUnmount(() => {
  stop?.()
  offMidi?.()
  cancelAnimationFrame(raf)
})
</script>

<template>
  <div ref="root" class="pt">
    <div class="top">
      <div class="src">
        <button class="pill" @click="playSong('fader', 'pluck')">Gitar: Fader Jakob</button>
        <button class="pill" @click="playSong('lisa', 'hum')">Nynning: Lisa gikk til skolen</button>
        <ClipButton />
        <button class="pill" @click="pts.length = 0">Tøm</button>
      </div>
      <div class="now">
        <span class="note">{{ current !== null ? noteName(current) : '–' }}</span>
        <span class="sub">{{ current !== null ? hz.toFixed(1) + ' Hz' : 'stille' }}</span>
      </div>
    </div>
    <canvas ref="cv" :width="W" :height="H" />
    <div class="legend sub"><span class="sw g" /> tone funnet i lyden: hvor ofte gjentar bølgen seg? (hvert 30. ms) <span class="sw o" /> MIDI-keyboard</div>
  </div>
</template>

<style scoped>
.pt {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 860px;
}
.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.src {
  display: flex;
  gap: 8px;
}
.now {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.note {
  font-size: 34px;
  font-weight: 800;
  color: var(--sp-green-bright);
  min-width: 70px;
  text-align: right;
}
canvas {
  background: var(--sp-surface);
  border-radius: 14px;
}
.legend {
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.sw {
  width: 14px;
  height: 4px;
  display: inline-block;
  border-radius: 2px;
  margin-left: 10px;
}
.sw.g {
  background: #98a6ea;
}
.sw.o {
  background: #e08a52;
}
</style>
