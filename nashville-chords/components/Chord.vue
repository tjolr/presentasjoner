<script setup lang="ts">
import { computed, ref } from 'vue'
import { chordTones, parseChord } from '../lib/theory'
import { globalKey } from '../lib/state'
import { playByMode } from '../lib/audio'

const props = withDefaults(
  defineProps<{
    /** Nashville-tall, f.eks. «1», «6m», «4/1», «b7» */
    degree: string
    /** Toneart. Utelatt = global toneart */
    k?: string
    show?: 'both' | 'number' | 'letter'
    size?: 'xs' | 'sm' | 'md' | 'lg'
    active?: boolean
    dim?: boolean
    /** Brukes til å forskyve animasjonen når toneart byttes */
    index?: number
    silent?: boolean
    /** Uten dur/moll-farger: alt i grått og hvitt */
    neutral?: boolean
    /** Farg akkordnavnet og bakgrunnen etter dur/moll (nyttig når tallet skjules) */
    tint?: boolean
    /** Hvit tekst på tall og akkorder, men behold bakgrunn og kantfarge */
    white?: boolean
  }>(),
  { show: 'both', size: 'md', index: 0 },
)

const key = computed(() => props.k ?? globalKey.value)
const chord = computed(() => parseChord(props.degree, key.value))
const burst = ref(0)

function onClick(e: MouseEvent) {
  burst.value++
  if (props.silent) return
  const t = chordTones(chord.value)
  playByMode(t)
}
</script>

<template>
  <button
    class="chord"
    :class="[chord.quality, `size-${size}`, { active, faded: dim, neutral, tint, white }]"
    :style="{ '--i': index }"
    :title="`${chord.number} i ${key} = ${chord.letter}`"
    @click="onClick"
  >
    <span v-if="burst" :key="burst" class="burst" />

    <Transition name="fold">
      <div v-if="show !== 'letter'" class="num">
        <span class="main">{{ chord.numMain }}</span
        ><span class="sfx">{{ chord.numSuffix }}</span>
      </div>
    </Transition>

    <Transition name="fold">
      <div v-if="show !== 'number'" class="let-wrap">
        <Transition name="roll" mode="out-in">
          <div :key="chord.letter" class="let">
            <span class="main">{{ chord.letterRoot }}</span
            ><span class="sfx">{{ chord.letterSuffix }}</span>
          </div>
        </Transition>
      </div>
    </Transition>
  </button>
</template>

<style scoped>
.chord {
  --accent: var(--sp-green);
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.15em;
  min-width: var(--w);
  padding: var(--pad);
  border: 1px solid transparent;
  border-radius: 14px;
  background: var(--sp-surface);
  color: var(--sp-text);
  font: inherit;
  cursor: pointer;
  overflow: hidden;
  transition:
    transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1),
    background 0.2s,
    border-color 0.2s,
    box-shadow 0.3s,
    opacity 0.3s,
    filter 0.3s;
  user-select: none;
}
.chord.minor {
  --accent: var(--sp-blue);
}
.chord.dim {
  --accent: var(--sp-orange);
}
.chord.neutral {
  --accent: var(--sp-sub);
}
.chord.tint {
  background: color-mix(in srgb, var(--accent) 16%, var(--sp-surface));
  border-color: color-mix(in srgb, var(--accent) 45%, transparent);
}
.chord.tint .let {
  color: var(--accent);
}
.chord.white .num,
.chord.white .let {
  color: #fff;
}
.size-xs {
  --w: 46px;
  --pad: 8px 5px;
  --fs-num: 20px;
  --fs-let: 14px;
}
.size-sm {
  --w: 64px;
  --pad: 10px 12px;
  --fs-num: 26px;
  --fs-let: 18px;
}
.size-md {
  --w: 96px;
  --pad: 16px 14px;
  --fs-num: 40px;
  --fs-let: 26px;
}
.size-lg {
  --w: 140px;
  --pad: 22px 18px;
  --fs-num: 64px;
  --fs-let: 38px;
}
.chord:hover {
  background: var(--sp-elev);
  transform: translateY(-3px);
}
.chord:active {
  transform: scale(0.95);
}
.chord.active {
  background: var(--sp-elev);
  border-color: var(--accent);
  box-shadow:
    0 0 0 1px var(--accent),
    0 8px 32px -6px color-mix(in srgb, var(--accent) 60%, transparent);
  transform: translateY(-4px) scale(1.06);
}
.chord.faded {
  opacity: 0.28;
  filter: saturate(0.4);
}

.num {
  font-size: var(--fs-num);
  font-weight: 800;
  line-height: 1;
  color: var(--accent);
  letter-spacing: -0.03em;
}
.let {
  font-size: var(--fs-let);
  font-weight: 600;
  line-height: 1.15;
  color: var(--sp-text);
}
.num .sfx,
.let .sfx {
  font-size: 0.6em;
  font-weight: 700;
  opacity: 0.85;
}

/* Ring som sprer seg ved klikk */
.burst {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 2px solid var(--accent);
  pointer-events: none;
  animation: burst 0.6s ease-out forwards;
}
@keyframes burst {
  from {
    opacity: 0.9;
    transform: scale(0.7);
  }
  to {
    opacity: 0;
    transform: scale(1.25);
  }
}

/* Tall / bokstav foldes inn og ut */
.fold-enter-active,
.fold-leave-active {
  transition:
    max-height 0.35s cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 0.3s,
    transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
  overflow: hidden;
  max-height: 100px;
}
.fold-enter-from,
.fold-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-8px);
}

/* Bokstaven ruller opp når toneart byttes, forskjøvet per akkord */
.let-wrap {
  overflow: hidden;
}
.roll-enter-active,
.roll-leave-active {
  transition:
    transform 0.26s cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 0.26s;
}
.roll-leave-active {
  transition-delay: calc(var(--i, 0) * 45ms);
}
.roll-enter-from {
  transform: translateY(70%);
  opacity: 0;
}
.roll-leave-to {
  transform: translateY(-70%);
  opacity: 0;
}
</style>
