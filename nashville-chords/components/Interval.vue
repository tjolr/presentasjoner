<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { parseKey, scaleMidi } from '../lib/theory'
import { globalKey } from '../lib/state'
import { getCtx, playTone } from '../lib/audio'

const props = withDefaults(
  defineProps<{
    /** Trinn som spilles etter hverandre. 8 = oktaven over 1 */
    notes: number[]
    k?: string
    label?: string
    /** Sekunder mellom tonene */
    gap?: number
  }>(),
  { gap: 0.75 },
)

const key = computed(() => parseKey(props.k ?? globalKey.value))
const lit = ref(-1)
let timers: ReturnType<typeof setTimeout>[] = []

const midi = (d: number) => scaleMidi(key.value, ((d - 1) % 7) + 1) + 12 * Math.floor((d - 1) / 7)
const shown = (d: number) => (d > 7 ? d - 7 : d)

function play() {
  timers.forEach(clearTimeout)
  timers = []
  const c = getCtx()
  props.notes.forEach((d, i) => {
    playTone(midi(d), c.currentTime + i * props.gap, props.gap * 1.6, 0.34, 'keys')
    timers.push(setTimeout(() => (lit.value = i), i * props.gap * 1000))
  })
  timers.push(setTimeout(() => (lit.value = -1), props.notes.length * props.gap * 1000 + 200))
}

onBeforeUnmount(() => timers.forEach(clearTimeout))
</script>

<template>
  <button class="iv" :class="{ playing: lit >= 0 }" @click="play">
    <div class="notes">
      <template v-for="(d, i) in notes" :key="i">
        <span v-if="i > 0" class="arrow">→</span>
        <span class="n" :class="{ lit: lit === i }">{{ shown(d) }}<small v-if="d > 7">↑</small></span>
      </template>
    </div>
    <div v-if="label" class="lbl">{{ label }}</div>
  </button>
</template>

<style scoped>
.iv {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 22px;
  border: 1px solid transparent;
  border-radius: 14px;
  background: var(--sp-surface);
  color: var(--sp-text);
  font: inherit;
  cursor: pointer;
  transition:
    transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1),
    background 0.2s,
    border-color 0.2s;
}
.iv:hover {
  background: var(--sp-elev);
  transform: translateY(-3px);
}
.iv.playing {
  border-color: var(--sp-green);
}
.notes {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  font-size: 36px;
  line-height: 1;
}
.n {
  color: var(--sp-sub);
  transition:
    color 0.2s,
    transform 0.25s cubic-bezier(0.3, 1.5, 0.5, 1);
}
.n small {
  font-size: 0.45em;
}
.n.lit {
  color: var(--sp-green-bright);
  transform: scale(1.35);
}
.arrow {
  font-size: 22px;
  color: var(--sp-elev2);
}
.lbl {
  color: var(--sp-sub);
  font-size: 15px;
  font-weight: 600;
}
</style>
