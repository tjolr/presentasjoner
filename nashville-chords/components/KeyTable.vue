<script setup lang="ts">
import { DIATONIC, parseChord, parseKey, chordTones } from '../lib/theory'
import { globalKey } from '../lib/state'
import { playByMode } from '../lib/audio'

withDefaults(defineProps<{ keys?: string[]; /** Dim de sjeldneste trinnene (3m og 7°) */ fadeRare?: boolean }>(), {})
const RARE = ['3m', '7°']
const defaults = ['C', 'G', 'D', 'A', 'E', 'F']

function play(token: string, k: string, e: MouseEvent) {
  const t = chordTones(parseChord(token, k))
  playByMode(t)
}
</script>

<template>
  <table class="tbl">
    <thead>
      <tr>
        <th class="corner">Toneart</th>
        <th v-for="d in DIATONIC" :key="d" :class="[parseChord(d, 'C').quality, { rare: fadeRare && RARE.includes(d) }]">{{ parseChord(d, 'C').number }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="k in keys ?? defaults" :key="k" :class="{ sel: k === globalKey }">
        <th class="key" @click="globalKey = k">{{ parseKey(k).display }}</th>
        <td v-for="d in DIATONIC" :key="d" :class="{ rare: fadeRare && RARE.includes(d) }" @click="play(d, k, $event)">
          {{ parseChord(d, k).letter }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.tbl {
  border-collapse: separate;
  border-spacing: 5px;
  font-size: 21px;
  /* Like brede akkordkolonner: dur og moll tar like mye plass */
  table-layout: fixed;
  width: 100%;
  max-width: 860px;
}
th,
td {
  padding: 5px 8px;
  border-radius: 10px;
  text-align: center;
  background: var(--sp-surface);
  transition:
    background 0.25s,
    color 0.25s,
    transform 0.2s;
}
thead th {
  background: transparent;
  font-size: 26px;
  font-weight: 800;
}
thead th.major {
  color: var(--sp-green);
}
thead th.minor {
  color: var(--sp-blue);
}
thead th.dim {
  color: var(--sp-orange);
}
.corner {
  width: 110px;
  color: var(--sp-sub);
  font-size: 14px !important;
  font-weight: 600 !important;
  text-align: left;
}
.key {
  font-weight: 800;
  cursor: pointer;
  color: var(--sp-sub);
}
td {
  cursor: pointer;
  font-weight: 600;
}
td:hover {
  background: var(--sp-elev);
  transform: translateY(-2px);
}
tr.sel td {
  background: var(--sp-elev);
  color: var(--sp-green);
}
tr.sel .key {
  background: var(--sp-green);
  color: #000;
}
.rare {
  opacity: 0.4;
}
th,
td {
  transition:
    background 0.25s,
    color 0.25s,
    transform 0.2s,
    opacity 0.5s;
}
</style>
