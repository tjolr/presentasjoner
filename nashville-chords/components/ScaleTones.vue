<script setup lang="ts">
import { computed, ref } from 'vue'
import { degreeNote, parseKey, scaleMidi } from '../lib/theory'
import { globalKey } from '../lib/state'
import { playNote } from '../lib/audio'

const props = withDefaults(defineProps<{ k?: string; numbers?: boolean }>(), { numbers: false })
const key = computed(() => parseKey(props.k ?? globalKey.value))
const tones = computed(() =>
  [1, 2, 3, 4, 5, 6, 7].map(d => ({ d, name: degreeNote(key.value, d).name, midi: scaleMidi(key.value, d) })),
)
const lit = ref(-1)

function hit(i: number, midi: number) {
  playNote(midi)
  lit.value = i
  setTimeout(() => {
    if (lit.value === i) lit.value = -1
  }, 350)
}
</script>

<template>
  <div class="scale">
    <button v-for="(t, i) in tones" :key="t.d" class="tone" :class="{ lit: lit === i }" @click="hit(i, t.midi)">
      <span class="name">{{ t.name }}</span>
      <Transition name="num">
        <span v-if="numbers" class="n" :style="{ '--i': i }">{{ t.d }}</span>
      </Transition>
    </button>
  </div>
</template>

<style scoped>
.scale {
  display: flex;
  gap: 12px;
}
.tone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  min-width: 78px;
  padding: 18px 10px;
  border: none;
  border-radius: 14px;
  background: var(--sp-surface);
  color: var(--sp-text);
  font: inherit;
  cursor: pointer;
  transition:
    transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1),
    background 0.2s,
    box-shadow 0.3s;
}
.tone:hover {
  background: var(--sp-elev);
  transform: translateY(-3px);
}
.tone.lit {
  background: var(--sp-elev);
  box-shadow: 0 0 0 1px var(--sp-green), 0 8px 28px -6px rgba(30, 215, 96, 0.6);
  transform: translateY(-4px) scale(1.06);
}
.name {
  font-size: 32px;
  font-weight: 700;
}
.n {
  font-size: 44px;
  font-weight: 800;
  line-height: 1;
  color: var(--sp-green);
}
.num-enter-active {
  transition:
    transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 0.35s,
    max-height 0.4s;
  transition-delay: calc(var(--i) * 60ms);
  max-height: 60px;
}
.num-leave-active {
  transition:
    opacity 0.2s,
    max-height 0.3s;
}
.num-enter-from {
  opacity: 0;
  transform: translateY(14px);
  max-height: 0;
}
.num-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
