<script setup lang="ts">
// Hvorfor l2 og ikke cosinus? To-toners melodier → normalisert vektor (2 tall) → pil i planet.
// step 0: melodiene, med tonene som tall
// step 1: trekk fra snittet → to tall = en pil
// step 2: cosinus: bare retningen teller → C→G og C→D blir like
// step 3: l2: avstanden mellom pilspissene → C→G vinner
import { computed } from 'vue'
import { getCtx, playTone } from '../lib/audio'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })

interface Mel {
  id: string
  name: string
  notes: [number, number]
  cls: string
  query?: boolean
}
const MELS: Mel[] = [
  { id: 'a', name: 'Sang A', notes: [60, 67], cls: 'a' },
  { id: 'b', name: 'Sang B', notes: [60, 62], cls: 'b' },
  { id: 'c', name: 'Sang C', notes: [67, 60], cls: 'c' },
  { id: 'q', name: 'Du spiller', notes: [60, 67.3], cls: 'q', query: true },
]
const NAMES: Record<number, string> = { 60: 'C', 62: 'D', 67: 'G' }
const noteName = (m: number) => NAMES[Math.round(m)] ?? '?'

const vec = (m: Mel): [number, number] => {
  const mu = (m.notes[0] + m.notes[1]) / 2
  return [m.notes[0] - mu, m.notes[1] - mu]
}
const q = vec(MELS[3])
const cos = (a: [number, number], b: [number, number]) =>
  (a[0] * b[0] + a[1] * b[1]) / (Math.hypot(...a) * Math.hypot(...b))
const l2 = (a: [number, number], b: [number, number]) => Math.hypot(a[0] - b[0], a[1] - b[1])

const fmt = (v: number, sign = true) => (sign && v > 0 ? '+' : '') + v.toFixed(1).replace('.', ',').replace('-', '−')
const fmt2 = (v: number) => v.toFixed(2).replace('.', ',').replace('-', '−')

const rows = computed(() =>
  MELS.map((m) => {
    const v = vec(m)
    return { ...m, v, cos: m.query ? null : cos(q, v), l2: m.query ? null : l2(q, v) }
  }),
)
const bestL2 = computed(() => Math.min(...rows.value.filter((r) => r.l2 !== null).map((r) => r.l2!)))

// Planet: x = tall 1, y = tall 2, origo i midten
const S = 280
const U = 30 // px per halvtone
const px = (v: [number, number]) => [S / 2 + v[0] * U, S / 2 - v[1] * U] as const
// Pilspiss-etiketter legges vinkelrett på diagonalen, annenhver side
const LBL: Record<string, [number, number]> = { a: [-10, 16], b: [-10, 16], c: [-10, 16], q: [-10, -8] }

// Hvor langt (px) til siden hver l2-strek tegnes
const OFF: Record<string, number> = { a: 12, b: 26 }

// Mini-trapp for hver melodi
const MW = 70
const MH = 30
const my = (m: number) => MH - 4 - ((m - 58) / 11) * (MH - 8)

function play(m: Mel) {
  const t0 = getCtx().currentTime + 0.05
  m.notes.forEach((n, i) => playTone(n, t0 + i * 0.45, 0.42, 0.3, m.query ? 'hum' : 'keys'))
}
</script>

<template>
  <div class="vc">
    <table>
      <thead>
        <tr>
          <th></th>
          <th>Toner</th>
          <th>Som tall</th>
          <th :class="{ hide: step < 1 }">Minus snittet</th>
          <th :class="{ hide: step < 2 }">Cosinus</th>
          <th :class="{ hide: step < 3 }">l2</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.id" :class="[r.cls, { query: r.query }]">
          <td>
            <button class="pill play" :class="r.query ? 'b' : 'g'" @click="play(r)">▶ {{ r.name }}</button>
          </td>
          <td class="mel">
            <svg :width="MW" :height="MH">
              <path
                :d="`M2,${my(r.notes[0])}H${MW / 2}V${my(r.notes[1])}H${MW - 2}`"
                class="stair"
                :class="r.cls"
              />
            </svg>
            <span>{{ noteName(r.notes[0]) }} → {{ noteName(r.notes[1]) }}</span>
          </td>
          <td class="num">[{{ r.notes.map((n) => String(n).replace('.', ',')).join(', ') }}]</td>
          <td class="num" :class="{ hide: step < 1 }">[{{ r.v.map((n) => fmt(n)).join(', ') }}]</td>
          <td class="num" :class="{ hide: step < 2, tie: r.cos !== null && r.cos > 0.99 }">
            {{ r.cos === null ? '' : fmt2(r.cos) }}
          </td>
          <td class="num" :class="{ hide: step < 3, win: r.l2 === bestL2 }">
            {{ r.l2 === null ? '' : fmt2(r.l2) }}
          </td>
        </tr>
      </tbody>
    </table>

    <svg :width="S" :height="S" class="plane" :class="{ hide: step < 1 }">
      <defs>
        <marker
          v-for="m in MELS"
          :id="'ah-' + m.cls"
          :key="m.cls"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerUnits="userSpaceOnUse"
          markerWidth="13"
          markerHeight="13"
          orient="auto-start-reverse"
        >
          <path d="M0,0L10,5L0,10z" :class="'fill-' + m.cls" />
        </marker>
      </defs>
      <line :x1="0" :x2="S" :y1="S / 2" :y2="S / 2" class="axis" />
      <line :y1="0" :y2="S" :x1="S / 2" :x2="S / 2" class="axis" />
      <text :x="S - 4" :y="S / 2 - 6" class="ax" text-anchor="end">tall 1 →</text>
      <text :x="S / 2 + 6" :y="12" class="ax">↑ tall 2</text>

      <!-- Cosinus: bare retningen. Hele diagonalen «opp» lyser. -->
      <line
        v-if="step === 2"
        :x1="px([0, 0])[0]"
        :y1="px([0, 0])[1]"
        :x2="px([-4.4, 4.4])[0]"
        :y2="px([-4.4, 4.4])[1]"
        class="ray"
      />

      <line
        v-for="r in rows"
        :key="'v' + r.id"
        :x1="S / 2"
        :y1="S / 2"
        :x2="px(r.v)[0]"
        :y2="px(r.v)[1]"
        class="arrow"
        :class="r.cls"
        :marker-end="`url(#ah-${r.cls})`"
      />

      <!-- l2: avstand fra pilspissen til queryen -->
      <g v-if="step >= 3">
        <g v-for="r in rows.filter((r) => r.id in OFF)" :key="'d' + r.id" :class="{ win: r.l2 === bestL2 }">
          <!-- Alle pilene ligger på samme linje, så avstandene tegnes parallelt ved siden av -->
          <line
            :x1="px(q)[0] + OFF[r.cls]"
            :y1="px(q)[1] - OFF[r.cls]"
            :x2="px(r.v)[0] + OFF[r.cls]"
            :y2="px(r.v)[1] - OFF[r.cls]"
            class="dist"
          />
          <text
            :x="(px(q)[0] + px(r.v)[0]) / 2 + OFF[r.cls] + 6"
            :y="(px(q)[1] + px(r.v)[1]) / 2 - OFF[r.cls] - 4"
            class="dlbl"
          >
            {{ fmt2(r.l2!) }}
          </text>
        </g>
      </g>

      <text
        v-for="r in rows"
        :key="'t' + r.id"
        :x="px(r.v)[0] + LBL[r.cls][0]"
        :y="px(r.v)[1] + LBL[r.cls][1]"
        class="tip"
        :class="'fill-' + r.cls"
        :text-anchor="LBL[r.cls][0] < 0 ? 'end' : 'start'"
      >
        {{ r.query ? 'du' : r.name.slice(-1) }}
      </text>
    </svg>
  </div>
</template>

<style scoped>
.vc {
  display: flex;
  gap: 28px;
  align-items: center;
  justify-content: center;
}
table {
  border-collapse: collapse;
  font-size: 14px;
}
th {
  font-weight: 600;
  color: var(--sp-sub);
  text-align: left;
  padding: 4px 10px;
  font-size: 12px;
}
td {
  padding: 5px 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
tr.query td {
  border-top: 1px solid rgba(255, 255, 255, 0.25);
}
.hide {
  opacity: 0;
}
th,
td,
.plane {
  transition: opacity 0.4s;
}
.play {
  font-size: 12px;
  padding: 3px 10px;
  white-space: nowrap;
}
.mel {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}
.num {
  font-family: var(--font-mono);
  white-space: nowrap;
}
.tie {
  color: var(--sp-orange);
  font-weight: 700;
}
.win {
  color: var(--sp-green-bright);
  font-weight: 700;
}
.stair {
  fill: none;
  stroke-width: 2.5;
}
.stair.a,
.arrow.a {
  stroke: var(--sp-green-bright);
}
.stair.b,
.arrow.b {
  stroke: var(--sp-orange);
}
.stair.c,
.arrow.c {
  stroke: var(--sp-sub);
}
.stair.q,
.arrow.q {
  stroke: var(--sp-blue);
}
.fill-a {
  fill: var(--sp-green-bright);
}
.fill-b {
  fill: var(--sp-orange);
}
.fill-c {
  fill: var(--sp-sub);
}
.fill-q {
  fill: var(--sp-blue);
}
.plane {
  background: var(--sp-surface);
  border-radius: 14px;
  overflow: visible;
  flex: none;
}
.axis {
  stroke: rgba(255, 255, 255, 0.15);
}
.ax {
  font-size: 11px;
  fill: var(--sp-sub);
}
.arrow {
  stroke-width: 3;
}
/* Pilene ligger oppå hverandre på diagonalen: tykkest under, tynnest øverst */
.arrow.a {
  stroke-width: 9;
  opacity: 0.55;
}
.arrow.b {
  stroke-width: 5;
}
.arrow.q {
  stroke-width: 2;
}
.ray {
  stroke: var(--sp-orange);
  stroke-width: 22;
  stroke-linecap: round;
  opacity: 0.18;
}
.dist {
  stroke: rgba(255, 255, 255, 0.5);
  stroke-width: 1.5;
  stroke-dasharray: 3 3;
}
.win .dist {
  stroke: var(--sp-green-bright);
  stroke-width: 3;
  stroke-dasharray: none;
}
.dlbl {
  font-size: 11px;
  font-family: var(--font-mono);
  fill: rgba(255, 255, 255, 0.6);
}
.win .dlbl {
  fill: var(--sp-green-bright);
  font-weight: 700;
}
.tip {
  font-size: 13px;
  font-weight: 700;
}
</style>
