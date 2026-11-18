<script setup lang="ts">
// Shazam steg for steg (illustrasjon, ikke ekte data).
// step 0: stjernekart fra klippet ditt
// step 1: ett ankerpunkt pares med naboer i en sone foran seg → hasher
// step 2: hashene slås opp i indeksen → (sang, tid i sangen)
// step 3: tell tidsforskyvning per sang → riktig sang gir én høy søyle
withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const W = 400
const H = 230
const TMAX = 4
const FMIN = 100
const FMAX = 4000
const x = (t: number) => 30 + (t / TMAX) * (W - 46)
const y = (f: number) => H - 22 - (Math.log(f / FMIN) / Math.log(FMAX / FMIN)) * (H - 40)

// Stjernene: sterkeste punkt i spektrogrammet (tid i s, frekvens i Hz)
const STARS: [number, number][] = [
  [0.2, 330], [0.4, 1320], [0.7, 220], [1.0, 440], [1.3, 660], [1.6, 330], [1.9, 880],
  [2.2, 1760], [2.4, 262], [2.7, 523], [3.0, 392], [3.2, 2100], [3.5, 196], [3.8, 784],
]
const ANCHOR = 3
const TARGETS = [4, 5, 6]
const HASH = ['a7f3', '1c9e', 'e42b']
const fmt = (v: number) => String(v).replace('.', ',')
const dt = (i: number) => fmt(+(STARS[i][0] - STARS[ANCHOR][0]).toFixed(1))

// Oppslag: hver hash finnes i flere sanger, på ulike tidspunkt
const LOOKUP: { hash: string; hits: [string, number][] }[] = [
  { hash: 'a7f3', hits: [['Blinke', 13.0], ['Fader Jakob', 4.2]] },
  { hash: '1c9e', hits: [['Blinke', 13.0], ['Let It Be', 8.7]] },
  { hash: 'e42b', hits: [['Blinke', 13.0], ['Wonderful World', 2.5], ['Fader Jakob', 21.0]] },
]
const T_CLIP = STARS[ANCHOR][0]

// Histogram over hele klippet (alle ankre): forskyvning = tid i sangen − tid i klippet
const BINS = 24
const right = Array.from({ length: BINS }, (_, i) => (i === 12 ? 23 : [1, 0, 2, 0, 1, 1, 0, 0, 1, 0, 2, 1, 0, 1, 0, 0, 2, 1, 0, 1, 0, 0, 1, 0][i]))
const wrong = [1, 2, 0, 1, 1, 0, 2, 1, 1, 0, 1, 2, 1, 0, 1, 1, 2, 0, 1, 1, 0, 2, 1, 0]
const HW = 300
const HH = 70
const bx = (i: number) => (i * HW) / BINS
const bh = (n: number) => (n / 23) * (HH - 6)
</script>

<template>
  <div class="sh">
    <div class="panel">
      <div class="head">Klippet ditt: stjernekart</div>
      <svg :width="W" :height="H" class="plot">
        <text x="6" y="14" class="ax">Hz</text>
        <text :x="W - 10" :y="H - 6" class="ax" text-anchor="end">tid →</text>
        <!-- Målsonen foran ankeret -->
        <rect
          v-if="step >= 1"
          :x="x(STARS[ANCHOR][0] + 0.15)"
          :y="y(1100)"
          :width="x(2.05) - x(1.15)"
          :height="y(250) - y(1100)"
          class="zone"
        />
        <g v-if="step >= 1">
          <line
            v-for="(t, k) in TARGETS"
            :key="t"
            :x1="x(STARS[ANCHOR][0])"
            :y1="y(STARS[ANCHOR][1])"
            :x2="x(STARS[t][0])"
            :y2="y(STARS[t][1])"
            class="pair"
            :style="{ '--d': k * 0.15 + 's' }"
          />
        </g>
        <circle
          v-for="(s, i) in STARS"
          :key="i"
          :cx="x(s[0])"
          :cy="y(s[1])"
          :r="step >= 1 && i === ANCHOR ? 7 : 4.5"
          class="star"
          :class="{ anchor: step >= 1 && i === ANCHOR, target: step >= 1 && TARGETS.includes(i) }"
        />
        <text v-if="step >= 1" :x="x(STARS[ANCHOR][0]) - 10" :y="y(STARS[ANCHOR][1]) + 20" class="lbl">anker</text>
      </svg>
    </div>

    <div class="panel right">
      <template v-if="step === 0">
        <div class="head">Hva er det?</div>
        <p class="txt">
          Hver prikk er et sted der lyden er <strong>sterkest</strong>: en tone på et tidspunkt.<br /><br />
          Støy, prat og dårlig mikrofon fjerner svake punkter, men de sterkeste overlever.
        </p>
      </template>

      <template v-else-if="step === 1">
        <div class="head">Par → hash (et «ord»)</div>
        <div v-for="(t, k) in TARGETS" :key="t" class="row" :style="{ '--d': k * 0.15 + 's' }">
          <code>({{ STARS[ANCHOR][1] }} Hz, {{ STARS[t][1] }} Hz, {{ dt(t) }} s)</code>
          <span class="arrow">→</span>
          <code class="hash">{{ HASH[k] }}</code>
        </div>
        <p class="txt small">To toner og avstanden mellom dem. Det samme for hver prikk som anker: hundrevis av hasher.</p>
      </template>

      <template v-else-if="step === 2">
        <div class="head">Slå opp i indeksen</div>
        <div v-for="l in LOOKUP" :key="l.hash" class="look">
          <code class="hash">{{ l.hash }}</code>
          <span class="arrow">→</span>
          <span class="hits">
            <span v-for="([s, t], k) in l.hits" :key="k" class="hit" :class="{ ok: s === 'Blinke' }">{{ s }} @ {{ fmt(t) }} s</span>
          </span>
        </div>
        <p class="txt small">Hashene finnes i mange sanger. Ett treff alene sier lite.</p>
      </template>

      <template v-else>
        <div class="head">Tell: tid i sangen − tid i klippet</div>
        <div class="hist">
          <div class="hl ok">Blinke</div>
          <svg :width="HW" :height="HH">
            <rect v-for="(n, i) in right" :key="i" :x="bx(i) + 1" :width="HW / BINS - 2" :y="HH - bh(n)" :height="bh(n)" class="bar ok" />
            <text :x="bx(12) + 14" y="14" class="lbl">{{ fmt(13 - T_CLIP) }} s: 23 treff</text>
          </svg>
        </div>
        <div class="hist">
          <div class="hl">Fader Jakob</div>
          <svg :width="HW" :height="HH">
            <rect v-for="(n, i) in wrong" :key="i" :x="bx(i) + 1" :width="HW / BINS - 2" :y="HH - bh(n)" :height="bh(n)" class="bar" />
          </svg>
        </div>
        <p class="txt small">Riktig sang: mange hasher med <strong>samme</strong> forskyvning (klippet starter 12 s inn). Feil sang: tilfeldige treff overalt.</p>
      </template>
    </div>
  </div>
</template>

<style scoped>
.sh {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  justify-content: center;
}
.panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.right {
  width: 360px;
  min-height: 250px;
}
.head {
  font-size: 13px;
  font-weight: 600;
  color: var(--sp-sub);
}
.plot {
  background: #000;
  border: 1px solid var(--border-panel);
  border-radius: 12px;
}
.ax {
  font-size: 10px;
  fill: rgba(255, 255, 255, 0.4);
}
.star {
  fill: #fff;
  transition: r 0.3s;
}
.star.anchor {
  fill: var(--sp-orange);
}
.star.target {
  fill: var(--sp-blue);
}
.zone {
  fill: rgba(92, 184, 218, 0.08);
  stroke: rgba(92, 184, 218, 0.5);
  stroke-dasharray: 4 3;
  rx: 6;
}
.pair {
  stroke: var(--sp-orange);
  stroke-width: 2;
  animation: pop 0.4s both;
  animation-delay: var(--d);
}
.lbl {
  font-size: 12px;
  font-weight: 600;
  fill: var(--sp-orange);
}
.row,
.look {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  animation: pop 0.4s both;
  animation-delay: var(--d, 0s);
}
.arrow {
  color: var(--sp-sub);
}
.hash {
  color: var(--sp-orange);
  font-weight: 700;
}
.hits {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 8px;
  font-size: 13px;
}
.hit {
  color: var(--sp-sub);
}
.hit.ok {
  color: var(--sp-green-bright);
  font-weight: 600;
}
.txt {
  font-size: 15px;
  color: var(--sp-sub);
  line-height: 1.4;
  margin: 0;
}
.txt.small {
  font-size: 13px;
  margin-top: 6px;
}
.txt strong {
  color: var(--sp-text);
}
.hist {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}
.hl {
  width: 92px;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 600;
  color: var(--sp-sub);
}
.hl.ok {
  color: var(--sp-green-bright);
}
.hist svg {
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  overflow: visible;
}
.bar {
  fill: var(--sp-sub);
  opacity: 0.6;
}
.bar.ok {
  fill: var(--sp-green-bright);
  opacity: 1;
}
.hist .lbl {
  fill: var(--sp-green-bright);
}
@keyframes pop {
  from {
    opacity: 0;
  }
}
</style>
