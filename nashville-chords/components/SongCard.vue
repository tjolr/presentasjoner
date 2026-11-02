<script setup lang="ts">
import { computed } from 'vue'
import { chordTones, parseChord } from '../lib/theory'
import { globalKey, openSong } from '../lib/state'
import { playByMode } from '../lib/audio'

export interface SongLine {
  /** Tekst under akkordene (kan være tom) */
  text: string
  /** Akkorder og hvilken tegnposisjon i teksten de står over */
  chords: { at: number; c: string }[]
}

const props = defineProps<{
  title: string
  /** Del av sangen, f.eks. «Refreng» */
  part?: string
  /** Progresjonen som tall, skilt med mellomrom */
  chords: string
  /** Teksten med akkorder over, vist med «Vis sang» */
  lines?: SongLine[]
}>()

const open = computed(() => openSong.value === props.title)
// Når en annen sang er åpen, skjules denne helt så det er plass til teksten
const folded = computed(() => openSong.value !== '' && !open.value)
const toggle = () => (openSong.value = open.value ? '' : props.title)
const parts = (c: string) => {
  const p = parseChord(c, globalKey.value)
  return { main: p.numMain, sfx: p.numSuffix, q: p.quality }
}
const hasLines = computed(() => !!props.lines?.length)

function play(c: string) {
  playByMode(chordTones(parseChord(c, globalKey.value)))
}
</script>

<template>
  <div v-show="!folded" class="song" :class="{ open }">
    <div class="head">
      <div class="name">
        {{ title }}<span v-if="part" class="part"> · {{ part }}</span>
      </div>
      <button v-if="hasLines" class="show" :class="{ on: open }" @click="toggle">
        {{ open ? 'Skjul sang' : 'Vis sang' }}
      </button>
    </div>

    <Progression :chords="chords" size="xs" compact :beats="2" class="pr" />

    <Transition name="lyr">
      <div v-if="open && hasLines" class="lyrics">
        <div v-for="(l, i) in lines" :key="i" class="ln">
          <div class="chords">
            <button
              v-for="(c, j) in l.chords"
              :key="j"
              class="c"
              :class="parts(c.c).q"
              :style="{ left: c.at + 'ch' }"
              @click="play(c.c)"
            >
              {{ parts(c.c).main }}<sup>{{ parts(c.c).sfx }}</sup>
            </button>
          </div>
          <div class="text">{{ l.text || ' ' }}</div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.song {
  background: var(--sp-surface);
  border-radius: 14px;
  padding: 12px 18px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.song.open {
  grid-column: 1 / -1;
}
.pr :deep(.cards) {
  gap: 4px;
  flex-wrap: nowrap;
}
.pr {
  gap: 8px !important;
}
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.name {
  font-size: 1rem;
  font-weight: 800;
}
.part {
  color: var(--sp-sub);
  font-weight: 600;
}
.show {
  white-space: nowrap;
  flex: none;
  border: 1px solid var(--sp-elev2);
  background: transparent;
  color: var(--sp-text);
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  padding: 6px 16px;
  border-radius: 999px;
  cursor: pointer;
  transition:
    background 0.2s,
    border-color 0.2s,
    color 0.2s;
}
.show:hover {
  border-color: var(--sp-text);
}
.show.on {
  background: var(--sp-green);
  border-color: var(--sp-green);
  color: #000;
}
.lyrics {
  border-top: 1px solid var(--sp-elev);
  padding-top: 10px;
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: 19px;
  line-height: 1.2;
  overflow: hidden;
}
.ln {
  margin-bottom: 4px;
}
.chords {
  position: relative;
  height: 1.25em;
}
.c {
  position: absolute;
  top: 0;
  border: none;
  background: transparent;
  padding: 0 2px;
  font: inherit;
  font-weight: 800;
  color: var(--sp-green);
  cursor: pointer;
  transition: transform 0.15s;
}
.c.minor {
  color: var(--sp-blue);
}
.c.dim {
  color: var(--sp-orange);
}
.c:hover {
  transform: translateY(-2px);
}
.c sup {
  font-size: 0.65em;
  font-weight: 700;
}
.text {
  white-space: pre;
  color: #e6e6e6;
}

.lyr-enter-active,
.lyr-leave-active {
  transition:
    max-height 0.4s cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 0.3s;
  max-height: 260px;
}
.lyr-enter-from,
.lyr-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
