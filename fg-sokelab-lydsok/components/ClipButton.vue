<script setup lang="ts">
// Spill av et av klippene (intro/eksempel) gjennom analysen. Velgeren vises bare når begge finnes.
import { computed } from 'vue'
import { SLOT_LABEL, type SlotId, analysisSlot, playClip, playingSlot, slots, stopClip } from '../lib/recording'

const ids = computed(() => (Object.keys(slots) as SlotId[]).filter((id) => slots[id].buf))
const current = computed<SlotId | undefined>(() =>
  ids.value.includes(analysisSlot.value) ? analysisSlot.value : ids.value[0],
)
function toggle() {
  if (playingSlot.value) return stopClip()
  if (current.value) playClip(current.value)
}
function pick(id: SlotId) {
  analysisSlot.value = id
  if (playingSlot.value) playClip(id)
}
</script>

<template>
  <span v-if="current" class="cb">
    <button class="pill g" @click="toggle">{{ playingSlot ? '■ Stopp' : `▶ ${SLOT_LABEL[current]}` }}</button>
    <span v-if="ids.length > 1" class="seg">
      <button v-for="id in ids" :key="id" :class="{ on: id === current }" @click="pick(id)">{{ SLOT_LABEL[id] }}</button>
    </span>
  </span>
</template>

<style scoped>
.cb {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}
.seg {
  display: inline-flex;
  background: var(--sp-surface);
  border: 1px solid var(--sp-elev2);
  border-radius: 999px;
  padding: 2px;
}
.seg button {
  border: none;
  background: transparent;
  color: var(--sp-sub);
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  cursor: pointer;
}
.seg button.on {
  background: var(--sp-elev2);
  color: var(--sp-text);
}
</style>
