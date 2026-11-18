<script setup lang="ts">
// Rerank: rekkefølgen etter kNN (grov) vs etter DTW (presis). Ekte data fra demo-indeksen.
// step 0: bare kNN-lista · 1: DTW-lista + linjer som viser hvem som bytter plass
import { getCtx, playTone } from '../lib/audio'
import { fakeHum, knn, queryVector, rerank } from '../lib/qbh'
import { songById } from '../lib/songs'

withDefaults(defineProps<{ step?: number }>(), { step: 0 })

// Blinke fra slag 4, 3 halvtoner opp: et vindu i Wonderful World ligner nok til å vinne kNN
const hum = fakeHum('blinke', 4, 8, 3, 1, 7)
const hits = knn(queryVector(hum.contour), 20)
const ranked = rerank(hum.contour, hits)
const best = new Map<string, number>()
for (const h of hits) if (!best.has(h.song)) best.set(h.song, h.dist)
const knnList = ranked.slice().sort((a, b) => a.knnRank - b.knnRank)
const dtwList = ranked

const SHORT: Record<string, string> = { blinke: 'Blinke', fader: 'Fader Jakob', wonderful: 'Wonderful World', letitbe: 'Let It Be' }
const name = (id: string) => SHORT[id] ?? songById(id).title
const COLORS: Record<string, string> = {
  blinke: 'var(--sp-green-bright)',
  wonderful: 'var(--sp-orange)',
  fader: 'var(--sp-blue)',
  letitbe: 'var(--sp-sub)',
}
const fmt = (v: number, d = 2) => v.toFixed(d).replace('.', ',')

const ROW = 58
const TOP = 34
const yRow = (i: number) => TOP + i * ROW + ROW / 2 - 6

function playHum() {
  const t0 = getCtx().currentTime + 0.05
  for (const n of hum.notes) if (n.pitch) playTone(n.pitch + 0.3, t0 + n.start, n.dur * 0.95, 0.3, 'hum')
}
</script>

<template>
  <div class="rr">
    <div class="btns">
      <button class="pill b" @click="playHum">▶ Du spiller (Blinke, annen toneart)</button>
    </div>
    <div class="cols">
      <div class="col">
        <div class="head"><span class="os">kNN</span> i OpenSearch · grovt</div>
        <div v-for="(r, i) in knnList" :key="r.song" class="card" :style="{ '--c': COLORS[r.song] }">
          <span class="rank">{{ i + 1 }}</span>
          <span class="t">{{ name(r.song) }}</span>
          <span class="m">avstand {{ fmt(best.get(r.song)!, 1) }}</span>
        </div>
        <div class="foot">Sammenligner faste vinduer, punkt for punkt</div>
      </div>

      <svg class="links" width="120" :height="TOP + knnList.length * ROW" :class="{ hide: step < 1 }">
        <path
          v-for="(r, i) in knnList"
          :key="r.song"
          :d="`M0,${yRow(i)} C60,${yRow(i)} 60,${yRow(dtwList.indexOf(r))} 120,${yRow(dtwList.indexOf(r))}`"
          :style="{ stroke: COLORS[r.song] }"
        />
      </svg>

      <div class="col" :class="{ hide: step < 1 }">
        <div class="head"><span class="app">DTW</span> i appen · presist</div>
        <div
          v-for="(r, i) in dtwList"
          :key="r.song"
          class="card"
          :class="{ win: i === 0 }"
          :style="{ '--c': COLORS[r.song] }"
        >
          <span class="rank">{{ i + 1 }}</span>
          <span class="t">{{ name(r.song) }}</span>
          <span class="m">kost {{ fmt(r.cost) }} · {{ fmt(r.from, 1) }}–{{ fmt(r.to, 1) }} s</span>
        </div>
        <div class="foot">Hele melodien, tiden får bøye seg</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rr {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
.cols {
  display: flex;
  align-items: flex-start;
}
.col {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 330px;
  transition: opacity 0.4s;
}
.head {
  height: 24px;
  font-size: 13px;
  font-weight: 600;
  color: var(--sp-sub);
}
.head .os {
  color: var(--sp-blue);
}
.head .app {
  color: var(--sp-green-bright);
}
.card {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 48px;
  padding: 0 14px;
  border-left: 4px solid var(--c);
  background: var(--sp-surface);
  border-radius: 8px;
}
.card.win {
  outline: 2px solid var(--c);
}
.rank {
  font-weight: 700;
  font-size: 18px;
  color: var(--c);
  width: 14px;
}
.t {
  font-weight: 600;
  white-space: nowrap;
}
.m {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--sp-sub);
  white-space: nowrap;
}
.foot {
  font-size: 12px;
  color: var(--sp-sub);
}
.links {
  flex: none;
  transition: opacity 0.4s;
}
.links path {
  fill: none;
  stroke-width: 3;
  opacity: 0.8;
}
.hide {
  opacity: 0;
}
</style>
