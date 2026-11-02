<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { chordTones, parseChord, splitTokens } from '../lib/theory'
import { globalKey } from '../lib/state'
import { getCtx, playByMode } from '../lib/audio'

const props = withDefaults(
  defineProps<{
    /** Tall skilt med mellomrom: «1 5 6m 4» */
    chords: string
    k?: string
    show?: 'both' | 'number' | 'letter'
    size?: 'sm' | 'md' | 'lg'
    bpm?: number
    /** Slag per akkord */
    beats?: number
    controls?: boolean
    /** Bare play-knapp, på samme linje som akkordene */
    compact?: boolean
  }>(),
  { show: 'both', size: 'lg', bpm: 72, beats: 4, controls: true, compact: false },
)

const tokens = computed(() => splitTokens(props.chords))
const key = computed(() => props.k ?? globalKey.value)

const playing = ref(false)
const activeIdx = ref(-1)
const bpm = ref(props.bpm)
const loop = true

let timer: ReturnType<typeof setInterval> | undefined
let raf = 0
let nextTime = 0
let step = 0
let queue: { time: number; idx: number }[] = []

function schedule() {
  const c = getCtx()
  while (nextTime < c.currentTime + 0.15) {
    const n = tokens.value.length
    if (!loop && step >= n) {
      queue.push({ time: nextTime, idx: -1 })
      clearInterval(timer)
      timer = undefined
      return
    }
    const idx = step % n
    const dur = (60 / bpm.value) * props.beats
    // Akkorden leses av ved planlegging, så toneartsbytte under avspilling slår inn med én gang
    const tones = chordTones(parseChord(tokens.value[idx], key.value))
    playByMode(tones, nextTime, dur * 0.95)
    queue.push({ time: nextTime, idx })
    nextTime += dur
    step++
  }
}

function tick() {
  const c = getCtx()
  while (queue.length && queue[0].time <= c.currentTime) {
    const item = queue.shift()!
    if (item.idx === -1) {
      stop()
      return
    }
    activeIdx.value = item.idx
  }
  raf = requestAnimationFrame(tick)
}

function start() {
  const c = getCtx()
  playing.value = true
  nextTime = c.currentTime + 0.08
  step = 0
  queue = []
  schedule()
  timer = setInterval(schedule, 25)
  raf = requestAnimationFrame(tick)
}

function stop() {
  playing.value = false
  activeIdx.value = -1
  clearInterval(timer)
  timer = undefined
  cancelAnimationFrame(raf)
  queue = []
}

function toggle() {
  if (playing.value) stop()
  else start()
}

onBeforeUnmount(stop)
</script>

<template>
  <div class="prog" :class="{ compact }">
    <button
      v-if="compact"
      class="play small"
      :class="{ on: playing }"
      :aria-label="playing ? 'Stopp' : 'Spill av'"
      @click="toggle"
    >
      <svg v-if="!playing" viewBox="0 0 24 24" width="18" height="18"><path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14z" fill="currentColor" /></svg>
      <svg v-else viewBox="0 0 24 24" width="18" height="18"><rect x="6" y="5" width="4.5" height="14" rx="1" fill="currentColor" /><rect x="13.5" y="5" width="4.5" height="14" rx="1" fill="currentColor" /></svg>
    </button>

    <div class="cards">
      <Chord
        v-for="(t, i) in tokens"
        :key="i"
        :degree="t"
        :k="k"
        :show="show"
        :size="size"
        :index="i"
        :active="activeIdx === i"
      />
    </div>

    <div v-if="controls && !compact" class="controls">
      <button class="play" :class="{ on: playing }" :aria-label="playing ? 'Stopp' : 'Spill av'" @click="toggle">
        <svg v-if="!playing" viewBox="0 0 24 24" width="22" height="22"><path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14z" fill="currentColor" /></svg>
        <svg v-else viewBox="0 0 24 24" width="22" height="22"><rect x="6" y="5" width="4.5" height="14" rx="1" fill="currentColor" /><rect x="13.5" y="5" width="4.5" height="14" rx="1" fill="currentColor" /></svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.prog {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
}
.prog.compact {
  flex-direction: row;
  gap: 14px;
}
.play.small {
  width: 38px;
  height: 38px;
  flex: none;
}
.cards {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: center;
}
.controls {
  display: flex;
  align-items: center;
  gap: 16px;
  color: var(--sp-sub);
  font-size: 14px;
}
.play {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: var(--sp-green);
  color: #000;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition:
    transform 0.15s,
    background 0.2s,
    box-shadow 0.3s;
}
.play:hover {
  transform: scale(1.07);
  background: var(--sp-green-bright);
}
.play:active {
  transform: scale(0.96);
}
.play.on {
  box-shadow: 0 0 0 6px rgba(30, 215, 96, 0.2);
}
</style>
