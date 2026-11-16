// Web MIDI: lytt på alle tilkoblede keyboard. Fungerer i Chrome/Edge.
import { ref } from 'vue'
import { startVoice } from './audio'

export const midiOn = ref(false)
export const midiDevice = ref('')
/** Spill av innkommende noter med synthen. Skru av hvis keyboardet går via Logic. */
export const midiThru = ref(true)

export interface MidiEvt {
  type: 'on' | 'off'
  note: number
  vel: number
  t: number
}
type Listener = (e: MidiEvt) => void

const listeners = new Set<Listener>()
const held = new Map<number, (at?: number) => void>()

export function onMidi(l: Listener) {
  listeners.add(l)
  return () => listeners.delete(l)
}

function handle(e: MIDIMessageEvent) {
  if (!e.data) return
  const [s, note, vel] = e.data
  const cmd = s & 0xf0
  const t = performance.now()
  if (cmd === 0x90 && vel > 0) {
    held.get(note)?.()
    if (midiThru.value) held.set(note, startVoice(note, 'keys', 0.12 + (vel / 127) * 0.3))
    listeners.forEach((l) => l({ type: 'on', note, vel, t }))
  } else if (cmd === 0x80 || (cmd === 0x90 && vel === 0)) {
    held.get(note)?.()
    held.delete(note)
    listeners.forEach((l) => l({ type: 'off', note, vel, t }))
  }
}

export async function enableMidi() {
  if (!('requestMIDIAccess' in navigator)) {
    midiDevice.value = 'Nettleseren støtter ikke Web MIDI'
    return
  }
  const acc = await navigator.requestMIDIAccess()
  const hook = () => {
    const names: string[] = []
    acc.inputs.forEach((inp) => {
      inp.onmidimessage = handle
      names.push(inp.name ?? '?')
    })
    midiDevice.value = names.join(', ') || 'ingen enheter'
  }
  hook()
  acc.onstatechange = hook
  midiOn.value = true
}
