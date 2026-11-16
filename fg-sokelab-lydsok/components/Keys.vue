<script setup lang="ts">
// Musikk for utviklere: hver tangent er et tall. En melodi er en array. Transponere = legge til en konstant.
import { computed, ref } from 'vue'
import { getCtx, mtof, noteName, playTone } from '../lib/audio'
import { onMidi } from '../lib/midi'
import { onBeforeUnmount, onMounted } from 'vue'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 3 })

const LO = 55
const HI = 76
const BLACK = new Set([1, 3, 6, 8, 10])
const whites = computed(() => {
  const out: number[] = []
  for (let m = LO; m <= HI; m++) if (!BLACK.has(m % 12)) out.push(m)
  return out
})
const blacks = computed(() => {
  const out: { m: number; left: number }[] = []
  for (let m = LO; m <= HI; m++)
    if (BLACK.has(m % 12)) out.push({ m, left: whites.value.indexOf(m - 1) + 1 })
  return out
})

const KW = 38
const lit = ref(new Set<number>())
const last = ref<number | null>(null)
const shift = ref(0)
const melody = [60, 62, 64, 60]
const shown = computed(() => melody.map((m) => m + shift.value))

function hit(m: number, when = 0, dur = 0.5) {
  const c = getCtx()
  playTone(m, c.currentTime + when, dur, 0.32, 'keys')
  setTimeout(() => {
    last.value = m
    lit.value = new Set([...lit.value, m])
  }, when * 1000)
  setTimeout(() => {
    const s = new Set(lit.value)
    s.delete(m)
    lit.value = s
  }, (when + dur) * 1000)
}

function playMelody(sh: number) {
  shift.value = sh
  shown.value.forEach((m, i) => hit(m, i * 0.45, 0.42))
}

let off: (() => void) | undefined
onMounted(() => {
  off = onMidi((e) => {
    if (e.type !== 'on') return
    last.value = e.note
    lit.value = new Set([e.note])
  })
})
onBeforeUnmount(() => off?.())
</script>

<template>
  <div class="kb">
    <div class="piano" :style="{ width: whites.length * KW + 'px' }">
      <button
        v-for="m in whites"
        :key="m"
        class="wk"
        :class="{ on: lit.has(m) }"
        :style="{ width: KW + 'px' }"
        @click="hit(m)"
      >
        <span v-if="step >= 1" class="n">{{ m }}</span>
      </button>
      <button
        v-for="b in blacks"
        :key="b.m"
        class="bk"
        :class="{ on: lit.has(b.m) }"
        :style="{ left: b.left * KW - 12 + 'px' }"
        @click="hit(b.m)"
      >
        <span v-if="step >= 1" class="n">{{ b.m }}</span>
      </button>
    </div>

    <div class="info">
      <div class="readout">
        <template v-if="last !== null">
          <span class="big">{{ last }}</span>
          <span class="sub">= {{ noteName(last) }} = {{ mtof(last).toFixed(1) }} Hz</span>
        </template>
        <span v-else class="sub">Klikk en tangent</span>
      </div>

      <div v-if="step >= 2" class="mel">
        <button class="pill g" @click="playMelody(0)">▶ melodi</button>
        <button class="pill b" @click="playMelody(5)">▶ melodi + 5</button>
        <code>[{{ shown.join(', ') }}]</code>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kb {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}
.piano {
  position: relative;
  height: 150px;
  display: flex;
}
button {
  font: inherit;
  cursor: pointer;
}
.wk {
  height: 150px;
  background: #e9e9e9;
  border: 1px solid #121212;
  border-radius: 0 0 6px 6px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 8px;
  transition: background 0.1s;
}
.bk {
  position: absolute;
  top: 0;
  width: 24px;
  height: 92px;
  background: #222;
  border: 1px solid #000;
  border-radius: 0 0 4px 4px;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 4px;
}
.wk.on,
.bk.on {
  background: var(--sp-green-bright);
}
.n {
  font-size: 11px;
  font-weight: 700;
  color: #555;
}
.bk .n {
  color: #aaa;
  font-size: 9px;
}
.info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  height: 100px;
}
.readout {
  display: flex;
  align-items: baseline;
  gap: 12px;
  height: 46px;
}
.big {
  font-size: 40px;
  font-weight: 800;
  color: var(--sp-green-bright);
}
.mel {
  display: flex;
  gap: 10px;
  align-items: center;
}
code {
  font-size: 16px;
  color: var(--sp-text);
  background: var(--sp-surface);
  padding: 4px 12px;
  border-radius: 8px;
}
</style>
