<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { KEYS, chordTones, parseChord, splitTokens } from '../lib/theory'
import { globalKey, playMode } from '../lib/state'
import { getCtx, playBassNote, playChord } from '../lib/audio'

type Level = 1 | 2 | 3

const POOLS: Record<Level, string[]> = {
  1: ['1 4 5 1', '1 5 4 1', '1 4 1 5', '1 5 1 4', '4 1 5 1', '1 1 4 5'],
  2: ['1 5 6m 4', '1 4 6m 5', '6m 4 1 5', '1 6m 4 5', '1 6m 5 4', '4 5 6m 1'],
  3: ['1 5/7 6m 4', '1 1/3 4 5', '1 3m 4 5', '1 2m 5 1', '4 5 3m 6m', '6m 2m 5 1'],
}
const OPTIONS: Record<Level, string[]> = {
  1: ['1', '4', '5'],
  2: ['1', '4', '5', '6m'],
  3: ['1', '2m', '3m', '4', '5', '6m', '1/3', '5/7'],
}
const LEVEL_NAMES: Record<Level, string> = { 1: 'Enkel', 2: 'Middels', 3: 'Vanskelig' }

const level = ref<Level>(1)
const freshKey = ref(true)

const question = ref({ tokens: [] as string[], key: 'C' })
const answer = ref<string[]>([])
const checked = ref(false)
const playingIdx = ref(-1)
const score = ref({ right: 0, total: 0 })
const shake = ref(0)

const label = (t: string) => {
  const c = parseChord(t, 'C')
  return c.numMain + c.numSuffix
}
const options = computed(() => OPTIONS[level.value])
const n = computed(() => question.value.tokens.length)
const correct = computed(() => answer.value.map((a, i) => a === question.value.tokens[i]))

let timers: ReturnType<typeof setTimeout>[] = []
const clear = () => {
  timers.forEach(clearTimeout)
  timers = []
  playingIdx.value = -1
}

function newQuestion() {
  clear()
  const pool = POOLS[level.value]
  let tokens = splitTokens(pool[Math.floor(Math.random() * pool.length)])
  // unngå samme progresjon to ganger på rad
  if (tokens.join(' ') === question.value.tokens.join(' ') && pool.length > 1) {
    tokens = splitTokens(pool[(pool.indexOf(tokens.join(' ')) + 1) % pool.length])
  }
  question.value = {
    tokens,
    key: freshKey.value ? KEYS[Math.floor(Math.random() * KEYS.length)] : globalKey.value,
  }
  answer.value = []
  checked.value = false
}

function play() {
  clear()
  const c = getCtx()
  const k = question.value.key
  const step = 1.5
  // Først hjemmetonen (1), så progresjonen
  playChord(chordTones(parseChord('1', k)), c.currentTime, 1.3)
  const start = 1.7
  question.value.tokens.forEach((t, i) => {
    const tones = chordTones(parseChord(t, k))
    const at = c.currentTime + start + i * step
    if (playMode.value === 'bass') playBassNote(tones.bass, at, step * 0.95)
    else playChord(tones, at, step * 0.95)
    timers.push(setTimeout(() => (playingIdx.value = i), (start + i * step) * 1000))
  })
  timers.push(setTimeout(() => (playingIdx.value = -1), (start + n.value * step) * 1000))
}

function playHome() {
  clear()
  playChord(chordTones(parseChord('1', question.value.key)), undefined, 1.6)
}

function pick(t: string) {
  if (checked.value || answer.value.length >= n.value) return
  answer.value = [...answer.value, t]
}
function undo() {
  if (checked.value) return
  answer.value = answer.value.slice(0, -1)
}
function check() {
  if (answer.value.length < n.value) return
  checked.value = true
  score.value.total++
  if (correct.value.every(Boolean)) score.value.right++
  else shake.value++
}
function setLevel(l: Level) {
  level.value = l
  newQuestion()
}

newQuestion()
onBeforeUnmount(clear)
</script>

<template>
  <div class="quiz">
    <div class="top">
      <div class="seg">
        <button v-for="l in ([1, 2, 3] as Level[])" :key="l" :class="{ sel: level === l }" @click="setLevel(l)">
          {{ LEVEL_NAMES[l] }}
        </button>
      </div>
      <label class="chk"><input v-model="freshKey" type="checkbox" /> Ny toneart hver gang</label>
      <div class="score">{{ score.right }} / {{ score.total }} rett</div>
    </div>

    <div class="listen">
      <button class="play" aria-label="Spill progresjonen" @click="play">
        <svg viewBox="0 0 24 24" width="24" height="24"><path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14z" fill="currentColor" /></svg>
      </button>
      <button class="ghost" @click="playHome">Hjemmetonen (1)</button>
    </div>

    <div :key="shake" class="slots" :class="{ shaking: checked && !correct.every(Boolean) }">
      <div
        v-for="i in n"
        :key="i"
        class="slot"
        :class="{
          filled: answer[i - 1],
          next: !checked && answer.length === i - 1,
          playing: playingIdx === i - 1,
          ok: checked && correct[i - 1],
          bad: checked && !correct[i - 1],
        }"
      >
        <Transition name="pop" mode="out-in">
          <span v-if="answer[i - 1]" :key="answer[i - 1]" class="val">{{ label(answer[i - 1]) }}</span>
          <span v-else class="ph">?</span>
        </Transition>
      </div>
    </div>

    <div class="reveal">
      <Transition name="fade">
        <div v-if="checked" class="fasit">
          <Chord
            v-for="(t, i) in question.tokens"
            :key="t + i"
            :degree="t"
            :k="question.key"
            size="sm"
            :index="i"
          />
        </div>
      </Transition>
    </div>

    <div v-if="!checked" class="opts">
      <button v-for="t in options" :key="t" class="opt" @click="pick(t)">{{ label(t) }}</button>
      <button class="opt util" :disabled="!answer.length" @click="undo">⌫</button>
      <button class="opt check" :disabled="answer.length < n" @click="check">Sjekk</button>
    </div>
    <div v-else class="opts">
      <button class="opt check" @click="newQuestion">Neste</button>
      <button class="opt util wide" @click="play">Hør igjen</button>
    </div>
  </div>
</template>

<style scoped>
.quiz {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.top {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: var(--sp-sub);
}
.seg {
  display: inline-flex;
  background: var(--sp-surface);
  border-radius: 999px;
  padding: 3px;
}
.seg button {
  border: none;
  background: transparent;
  color: var(--sp-sub);
  font: inherit;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 999px;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;
}
.seg button.sel {
  background: var(--sp-elev2);
  color: var(--sp-text);
}
.chk {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}
.chk input {
  accent-color: var(--sp-green);
}
.score {
  font-weight: 700;
  color: var(--sp-green-bright);
}
.listen {
  display: flex;
  align-items: center;
  gap: 14px;
}
.play {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: var(--sp-green);
  color: #000;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition:
    transform 0.15s,
    background 0.2s;
}
.play:hover {
  transform: scale(1.07);
  background: var(--sp-green-bright);
}
.ghost {
  border: 1px solid var(--sp-elev2);
  background: transparent;
  color: var(--sp-text);
  font: inherit;
  font-weight: 600;
  padding: 10px 18px;
  border-radius: 999px;
  cursor: pointer;
  transition: border-color 0.2s;
}
.ghost:hover {
  border-color: var(--sp-text);
}

.slots {
  display: flex;
  gap: 14px;
}
.slots.shaking {
  animation: shake 0.45s;
}
@keyframes shake {
  20%,
  60% {
    transform: translateX(-6px);
  }
  40%,
  80% {
    transform: translateX(6px);
  }
}
.slot {
  width: 110px;
  height: 96px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: var(--sp-surface);
  border: 2px dashed var(--sp-elev2);
  font-size: 44px;
  font-weight: 800;
  transition:
    border-color 0.25s,
    background 0.25s,
    box-shadow 0.3s,
    transform 0.25s cubic-bezier(0.3, 1.4, 0.5, 1);
}
.slot.filled {
  border-style: solid;
  border-color: var(--sp-elev2);
}
.slot.next {
  border-color: var(--sp-green);
}
.slot.playing {
  transform: translateY(-5px) scale(1.06);
  box-shadow: 0 10px 30px -8px rgba(30, 215, 96, 0.6);
  background: var(--sp-elev);
}
.slot.ok {
  border-color: var(--sp-green);
  background: rgba(29, 185, 84, 0.15);
  color: var(--sp-green-bright);
}
.slot.bad {
  border-color: #e8115b;
  background: rgba(232, 17, 91, 0.14);
  color: #ff6b9a;
}
.ph {
  color: var(--sp-elev2);
}
.pop-enter-active {
  transition:
    transform 0.28s cubic-bezier(0.3, 1.6, 0.5, 1),
    opacity 0.2s;
}
.pop-leave-active {
  transition: opacity 0.12s;
}
.pop-enter-from {
  transform: scale(0.5);
  opacity: 0;
}
.pop-leave-to {
  opacity: 0;
}

.reveal {
  min-height: 82px;
}
.fasit {
  display: flex;
  gap: 14px;
}
.fade-enter-active {
  transition: opacity 0.4s;
}
.fade-enter-from {
  opacity: 0;
}

.opts {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 640px;
}
.opt {
  min-width: 64px;
  padding: 12px 18px;
  border: none;
  border-radius: 12px;
  background: var(--sp-surface);
  color: var(--sp-text);
  font: inherit;
  font-size: 22px;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.15s,
    background 0.2s,
    opacity 0.2s;
}
.opt:hover:not(:disabled) {
  background: var(--sp-elev);
  transform: translateY(-2px);
}
.opt:active:not(:disabled) {
  transform: scale(0.94);
}
.opt:disabled {
  opacity: 0.3;
  cursor: default;
}
.opt.util {
  color: var(--sp-sub);
  font-size: 18px;
}
.opt.wide {
  padding: 12px 24px;
}
.opt.check {
  background: var(--sp-green);
  color: #000;
  font-size: 18px;
  padding: 12px 26px;
}
.opt.check:hover:not(:disabled) {
  background: var(--sp-green-bright);
}
</style>
