<script setup lang="ts">
// Overfetching: hent 20 vinduer, slå sammen til sanger.
// Ekte kNN mot demo-indeksen, med samme «spilte» utdrag som på steg 2.
// step 0: de 20 nærmeste vinduene
// step 1: slått sammen per sang (beste vindu teller)
import { fakeHum, knn, queryVector } from '../lib/qbh'
import { songById } from '../lib/songs'

withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const hum = fakeHum('blinke', 16, 8, 5, 1, 3)
const hits = knn(queryVector(hum.contour), 20)

const COLORS = ['var(--sp-green-bright)', 'var(--sp-orange)', 'var(--sp-blue)', 'var(--sp-sub)']
const order = [...new Set(hits.map((h) => h.song))]
const color = (id: string) => COLORS[order.indexOf(id) % COLORS.length]

const songs = order.map((id) => {
  const mine = hits.filter((h) => h.song === id)
  return { id, title: songById(id).title, n: mine.length, best: mine[0].dist }
})

const SHORT: Record<string, string> = { blinke: 'Blinke', fader: 'Fader Jakob', wonderful: 'Wonderful World', letitbe: 'Let It Be' }
const short = (id: string) => SHORT[id] ?? songById(id).title

const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',')
</script>

<template>
  <div class="of">
    <div class="col">
      <div class="head">k: 20 vinduer</div>
      <div class="hits">
        <div v-for="(h, i) in hits" :key="i" class="hit" :style="{ '--c': color(h.song) }">
          <span class="r">{{ i + 1 }}</span>
          <span class="dot" />
          <span class="t">{{ short(h.song) }}</span>
          <span class="s">{{ fmt(h.start, 0) }} s</span>
          <span class="d">{{ fmt(h.dist) }}</span>
        </div>
      </div>
    </div>
    <div class="arrow" :class="{ hide: step < 1 }">↓</div>
    <div class="col" :class="{ hide: step < 1 }">
      <div class="head">Slått sammen i appen: {{ hits.length }} vinduer, bare {{ songs.length }} ulike sanger</div>
      <div class="songs">
      <div v-for="(s, i) in songs.slice(0, 3)" :key="s.id" class="song" :style="{ '--c': color(s.id) }">
        <span class="rank">{{ i + 1 }}</span>
        <span class="t">{{ short(s.id) }}</span>
        <span class="n">{{ s.n }} treff · beste {{ fmt(s.best) }}</span>
      </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.of {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
}
.col {
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: opacity 0.4s;
}
.head {
  font-size: 12px;
  font-weight: 600;
  color: var(--sp-sub);
}
.hits {
  display: grid;
  grid-template-rows: repeat(10, auto);
  grid-auto-flow: column;
  gap: 3px 18px;
}
.hit {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  white-space: nowrap;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--c);
  flex: none;
}
.hit .t {
  min-width: 104px;
}
.songs {
  display: flex;
  gap: 10px;
}
.r {
  width: 16px;
  text-align: right;
  font-family: var(--font-mono);
  color: var(--sp-sub);
}
.song .t {
  white-space: nowrap;
}
.s,
.d,
.n {
  font-family: var(--font-mono);
  color: var(--sp-sub);
}
.d {
  margin-left: auto;
}
.arrow {
  font-size: 28px;
  color: var(--sp-sub);
  transition: opacity 0.4s;
}
.song {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  border-left: 3px solid var(--c);
  background: var(--sp-surface);
  border-radius: 6px;
  font-size: 14px;
}
.rank {
  font-weight: 700;
  color: var(--c);
}
.n {
  font-size: 12px;
  margin-left: auto;
  white-space: nowrap;
}
.hide {
  opacity: 0;
}
</style>
