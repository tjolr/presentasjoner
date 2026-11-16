<script setup lang="ts">
// MIDI som data: pianorull + hendelseslogg, og samme melodi som lyd (antall samples tikker).
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { getCtx, getTap, isShown, noteName, playTone } from '../lib/audio'
import { onMidi } from '../lib/midi'
import { songById, timed } from '../lib/songs'

const props = withDefaults(defineProps<{ song?: string; count?: number }>(), { song: 'fader', count: 14 })

const notes = computed(() => timed(songById(props.song)).slice(0, props.count).filter((n) => n.pitch !== null))
const total = computed(() => notes.value.at(-1)!.start + notes.value.at(-1)!.dur)
const lo = computed(() => Math.min(...notes.value.map((n) => n.pitch!)) - 2)
const hi = computed(() => Math.max(...notes.value.map((n) => n.pitch!)) + 2)

const RW = 420
const RH = 160
const x = (t: number) => (t / total.value) * RW
const y = (p: number) => RH - ((p - lo.value + 0.5) / (hi.value - lo.value + 1)) * RH
const rowH = computed(() => RH / (hi.value - lo.value + 1))

const playhead = ref(-1)
const samples = ref(0)
const live = ref<{ note: number; vel: number; t: number }[]>([])
let t0 = 0
let raf = 0
const root = ref<HTMLElement>()
const wave = ref<HTMLCanvasElement>()

const events = computed(() => {
  const ev: { t: number; on: boolean; p: number }[] = []
  for (const n of notes.value) {
    ev.push({ t: n.start, on: true, p: n.pitch! })
    ev.push({ t: n.start + n.dur * 0.95, on: false, p: n.pitch! })
  }
  return ev.sort((a, b) => a.t - b.t)
})

function play() {
  const c = getCtx()
  t0 = c.currentTime + 0.05
  for (const n of notes.value) playTone(n.pitch!, t0 + n.start, n.dur * 0.95, 0.32, 'keys')
}

function loop() {
  raf = requestAnimationFrame(loop)
  if (!isShown(root.value)) return
  const c = getCtx()
  const t = c.currentTime - t0
  playhead.value = t0 && t >= 0 && t <= total.value + 0.3 ? t : -1
  if (playhead.value >= 0) samples.value = Math.round(Math.min(t, total.value) * c.sampleRate)
  if (wave.value) {
    const g = wave.value.getContext('2d')!
    const buf = new Float32Array(2048)
    getTap().getFloatTimeDomainData(buf)
    g.fillStyle = 'rgba(24,24,24,0.35)'
    g.fillRect(0, 0, wave.value.width, wave.value.height)
    g.strokeStyle = '#509bf5'
    g.lineWidth = 1.5
    g.beginPath()
    for (let i = 0; i < buf.length; i++) {
      const xx = (i / buf.length) * wave.value.width
      const yy = wave.value.height / 2 - buf[i] * wave.value.height * 0.9
      i ? g.lineTo(xx, yy) : g.moveTo(xx, yy)
    }
    g.stroke()
  }
}

const shown = computed(() => {
  const ph = playhead.value
  const lim = ph < 0 ? 9 : events.value.filter((e) => e.t <= ph).length
  return events.value.slice(Math.max(0, lim - 6), Math.max(lim, 6))
})

let off: (() => void) | undefined
onMounted(() => {
  loop()
  off = onMidi((e) => {
    if (e.type === 'on') live.value = [{ note: e.note, vel: e.vel, t: e.t }, ...live.value].slice(0, 5)
  })
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  off?.()
})
</script>

<template>
  <div ref="root" class="mr">
    <div class="col">
      <div class="head">
        <span class="title"><span class="dot g" />MIDI</span>
        <button class="play" aria-label="Spill av" @click="play">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14z" fill="currentColor" /></svg>
        </button>
      </div>
      <svg :width="RW" :height="RH" class="roll">
        <rect
          v-for="(n, i) in notes"
          :key="i"
          :x="x(n.start) + 1"
          :y="y(n.pitch!) - rowH / 2 + 1"
          :width="x(n.dur) - 2"
          :height="rowH - 2"
          rx="3"
          :class="{ on: playhead >= n.start && playhead < n.start + n.dur }"
        />
        <line v-if="playhead >= 0" :x1="x(playhead)" :x2="x(playhead)" y1="0" :y2="RH" class="ph" />
      </svg>
      <div class="log">
        <div v-for="(l, i) in live" :key="'l' + l.t" class="ev live">
          keyboard · note_on {{ noteName(l.note) }} ({{ l.note }}) vel {{ l.vel }}
        </div>
        <div v-for="(e, i) in shown" :key="i" class="ev" :class="{ past: playhead >= 0 && e.t <= playhead }">
          t={{ e.t.toFixed(2) }}s · {{ e.on ? 'note_on ' : 'note_off' }} {{ noteName(e.p) }} ({{ e.p }})
        </div>
      </div>
      <div class="stat"><strong class="accent">{{ events.length }}</strong> hendelser</div>
    </div>

    <div class="col">
      <div class="head">
        <span class="title"><span class="dot b" />Lyd</span>
      </div>
      <canvas ref="wave" :width="RW" :height="RH" class="roll" />
      <div class="big">
        <div class="num">{{ samples.toLocaleString('nb-NO') }}</div>
        <div class="sub">samples (tall mellom −1 og 1)</div>
      </div>
      <div class="stat"><strong style="color: var(--sp-blue)">{{ getCtx().sampleRate.toLocaleString('nb-NO') }}</strong> tall per sekund</div>
    </div>
  </div>
</template>

<style scoped>
.mr {
  display: flex;
  gap: 28px;
  justify-content: center;
}
.col {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 420px;
}
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 36px;
}
.title {
  font-weight: 800;
  font-size: 22px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.dot.g {
  background: var(--sp-green);
}
.dot.b {
  background: var(--sp-blue);
}
.roll {
  background: var(--sp-surface);
  border-radius: 12px;
}
rect {
  fill: var(--sp-elev2);
  transition: fill 0.1s;
}
rect.on {
  fill: var(--sp-green-bright);
}
.ph {
  stroke: #fff;
  stroke-width: 1.5;
}
.log {
  font-family: ui-monospace, Menlo, monospace;
  font-size: 11.5px;
  height: 100px;
  overflow: hidden;
  color: var(--sp-sub);
}
.ev.past {
  color: var(--sp-green-bright);
}
.ev.live {
  color: var(--sp-orange);
}
.big {
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.big .num {
  font-size: 44px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: var(--sp-blue);
}
.stat {
  font-size: 15px;
  color: var(--sp-sub);
}
.play {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--sp-green);
  color: #000;
  display: grid;
  place-items: center;
  cursor: pointer;
}
</style>
