<script setup lang="ts">
// Chroma: brett hele spekteret sammen til 12 tonetrinn → match mot akkordmaler → Nashville-tall.
import ClipButton from './ClipButton.vue'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { GUITAR, ftom, getCtx, getTap, isShown, pcName, strum } from '../lib/audio'

const KEYS: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9 }
const key = ref('G')
const chords = ['G', 'C', 'D', 'Em', 'Am', 'Bm']
const chroma = ref(new Array(12).fill(0))
const detected = ref<{ root: number; minor: boolean; score: number } | null>(null)
const root = ref<HTMLElement>()
let raf = 0
const smooth = new Float32Array(12)

const DEG: Record<number, string> = { 0: '1', 2: '2', 4: '3', 5: '4', 7: '5', 9: '6', 11: '7' }

function loop() {
  raf = requestAnimationFrame(loop)
  if (!isShown(root.value)) return
  const tap = getTap()
  const sr = getCtx().sampleRate
  const db = new Float32Array(tap.frequencyBinCount)
  tap.getFloatFrequencyData(db)
  const c = new Float32Array(12)
  for (let k = 1; k < db.length; k++) {
    const f = (k * sr) / tap.fftSize
    if (f < 75) continue
    if (f > 400) break // overtoner høyere opp «lyver» om hvilke toner som spilles
    const mag = 10 ** (db[k] / 20)
    const pc = ((Math.round(ftom(f)) % 12) + 12) % 12
    c[pc] += mag / Math.sqrt(f) // vekt ned lyse frekvenser (overtoner)
  }
  let max = 0
  for (let i = 0; i < 12; i++) {
    smooth[i] = 0.82 * smooth[i] + 0.18 * c[i]
    max = Math.max(max, smooth[i])
  }
  chroma.value = Array.from(smooth, (v) => (max ? v / max : 0))
  // Total energi som portvokter
  if (max < 1e-6) {
    detected.value = null
    return
  }
  let best = { root: 0, minor: false, score: -1 }
  for (let r = 0; r < 12; r++)
    for (const minor of [false, true]) {
      const tpl = [0, minor ? 3 : 4, 7].map((i) => (r + i) % 12)
      let dot = 0
      let norm = 0
      for (let i = 0; i < 12; i++) {
        const w = tpl.includes(i) ? (i === r ? 1.2 : 1) : 0
        dot += w * chroma.value[i]
        norm += chroma.value[i] ** 2
      }
      const score = dot / Math.sqrt(norm * 3.44)
      if (score > best.score) best = { root: r, minor, score }
    }
  detected.value = best.score > 0.7 ? best : null
}

const label = computed(() => (detected.value ? pcName(detected.value.root) + (detected.value.minor ? 'm' : '') : '–'))
const number = computed(() => {
  if (!detected.value) return '–'
  const d = (detected.value.root - KEYS[key.value] + 12) % 12
  return (DEG[d] ?? '♭' + DEG[(d + 1) % 12]) + (detected.value.minor ? 'm' : '')
})
const tones = computed(() => {
  if (!detected.value) return [] as number[]
  const r = detected.value.root
  return [r, (r + (detected.value.minor ? 3 : 4)) % 12, (r + 7) % 12]
})

onMounted(loop)
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<template>
  <div ref="root" class="cv">
    <div class="btns">
      <button v-for="c in chords" :key="c" class="pill" @click="strum(GUITAR[c])">{{ c }}</button>
      <ClipButton />
      <label class="k sub">Sangens grunntone
        <select v-model="key"><option v-for="(_, k) in KEYS" :key="k">{{ k }}</option></select>
      </label>
    </div>
    <div class="row">
      <div class="bars">
        <div v-for="(v, i) in chroma" :key="i" class="col">
          <div class="fill" :class="{ tone: tones.includes(i) }" :style="{ height: v * 100 + '%' }" />
          <span>{{ pcName(i) }}</span>
        </div>
      </div>
      <div class="out">
        <div class="lbl sub">Akkord</div>
        <div class="chord">{{ label }}</div>
        <div class="lbl sub">som tall, relativt til {{ key }}</div>
        <div class="num">{{ number }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cv {
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: center;
}
.btns {
  display: flex;
  gap: 8px;
  align-items: center;
}
.k {
  margin-left: 14px;
  display: flex;
  gap: 8px;
  align-items: center;
}
select {
  background: var(--sp-surface);
  color: var(--sp-text);
  border: 1px solid var(--sp-elev2);
  border-radius: 999px;
  padding: 4px 12px;
  font: inherit;
  font-weight: 700;
}
.row {
  display: flex;
  gap: 36px;
  align-items: center;
}
.bars {
  display: flex;
  gap: 8px;
  height: 250px;
  background: var(--sp-surface);
  padding: 16px 16px 30px;
  border-radius: 14px;
}
.col {
  width: 36px;
  position: relative;
  display: flex;
  align-items: flex-end;
}
.fill {
  width: 100%;
  background: var(--sp-elev2);
  border-radius: 6px 6px 2px 2px;
  transition: background 0.2s;
}
.fill.tone {
  background: var(--sp-green-bright);
}
.col span {
  position: absolute;
  bottom: -24px;
  width: 100%;
  text-align: center;
  font-size: 13px;
  color: var(--sp-sub);
  font-weight: 600;
}
.out {
  width: 200px;
  text-align: center;
}
.chord {
  font-size: 64px;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 14px;
}
.num {
  font-size: 80px;
  font-weight: 800;
  line-height: 1;
  color: var(--sp-green-bright);
}
.lbl {
  font-size: 14px;
}
</style>
