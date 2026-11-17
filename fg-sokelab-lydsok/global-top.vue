<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { disableMic, micDeviceId, micInputs, micOn, setMicDevice } from './lib/audio'
import { enableMidi, midiDevice, midiOn, midiThru } from './lib/midi'
import { clips, playing, selectedId, source, togglePlay, useClip, useMic } from './lib/recording'

async function clickMic() {
  if (source.value === 'mic' && micOn.value) disableMic()
  else await useMic()
}
const dur = (s: number) => s.toFixed(0) + ' s'

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
    <button :class="{ sel: source === 'mic' && micOn }" title="Live fra mikrofon / lydkort (gitar)" @click="clickMic">
      <span class="dot" />Mikrofon
    </button>
    <button
      :class="{ sel: source === 'clip' }"
      :disabled="!clips.length"
      :title="clips.length ? 'Spill av et lydklipp gjennom analysene' : 'Ta opp et klipp først'"
      @click="useClip()"
    >
      Lydklipp
    </button>
    <template v-if="source === 'clip' && clips.length">
      <select :value="selectedId" title="Lydklipp" @change="useClip(($event.target as HTMLSelectElement).value)">
        <option v-for="c in clips" :key="c.id" :value="c.id">{{ c.name }} · {{ dur(c.buf.duration) }}</option>
      </select>
      <button class="play" :class="{ on: playing }" @click="togglePlay">{{ playing ? '■' : '▶' }}</button>
    </template>
    <select
      v-if="source === 'mic' && micOn && micInputs.length > 1"
      :value="micDeviceId"
      title="Lydinngang"
      @change="setMicDevice(($event.target as HTMLSelectElement).value)"
    >
      <option v-for="d in micInputs" :key="d.id" :value="d.id">{{ d.label }}</option>
    </select>
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
select {
  background: transparent;
  color: var(--sp-text);
  border: none;
  font: inherit;
  font-weight: 600;
  max-width: 180px;
  padding: 0 6px;
  cursor: pointer;
}
button:disabled {
  opacity: 0.35;
  cursor: default;
}
button.play {
  min-width: 30px;
  justify-content: center;
  color: var(--sp-text);
}
button.play.on {
  color: var(--sp-green-bright);
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
