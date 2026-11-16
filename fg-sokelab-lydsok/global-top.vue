<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { disableMic, enableMic, micOn } from './lib/audio'
import { enableMidi, midiDevice, midiOn, midiThru } from './lib/midi'

async function toggleMic() {
  if (micOn.value) disableMic()
  else await enableMic()
}

// Slipp fokus etter klikk så piltaster/mellomrom fortsatt blar i slides
const release = (e: Event) => {
  const el = (e.target as HTMLElement | null)?.closest?.('button, select, input')
  if (el instanceof HTMLSelectElement && e.type === 'click') return
  if (el instanceof HTMLElement) requestAnimationFrame(() => el.blur())
}
onMounted(() => {
  document.addEventListener('click', release, true)
  document.addEventListener('change', release, true)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', release, true)
  document.removeEventListener('change', release, true)
})
</script>

<template>
  <div class="gt">
    <button :class="{ sel: micOn }" title="Mikrofon / lydkort (gitar)" @click="toggleMic">
      <span class="dot" />Mikrofon
    </button>
    <button :class="{ sel: midiOn }" :title="midiDevice || 'Koble til MIDI-keyboard'" @click="enableMidi">
      <span class="dot" />MIDI{{ midiOn ? '' : '' }}
    </button>
    <button v-if="midiOn" :class="{ sel: midiThru }" title="Spill MIDI-noter med synthen i nettleseren" @click="midiThru = !midiThru">
      Lyd fra MIDI
    </button>
  </div>
</template>

<style scoped>
.gt {
  position: fixed;
  top: 14px;
  right: 16px;
  z-index: 50;
  display: flex;
  gap: 6px;
  background: var(--sp-surface);
  border-radius: 999px;
  padding: 3px;
  font-size: 13px;
}
button {
  border: none;
  background: transparent;
  color: var(--sp-sub);
  font: inherit;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 999px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}
button.sel {
  background: var(--sp-green);
  color: #000;
}
.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.6;
}
button.sel .dot {
  background: #e3342f;
  opacity: 1;
}
</style>
