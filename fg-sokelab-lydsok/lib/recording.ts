// To lydklipp: «intro» (sangen i starten) og «eksempel» (det analysene kjører på).
// Eksempelet lastes fra public/eksempel.wav hvis fila finnes; opptak/fil overstyrer.
import { reactive, ref } from 'vue'
import { getCtx, getMaster, getMicStream } from './audio'

export type SlotId = 'intro' | 'eksempel'
export const SLOT_LABEL: Record<SlotId, string> = { intro: 'Intro', eksempel: 'Eksempel' }

interface Slot {
  buf: AudioBuffer | null
  name: string
}
export const slots = reactive<Record<SlotId, Slot>>({
  intro: { buf: null, name: '' },
  eksempel: { buf: null, name: '' },
})

/** Hvilket klipp analyseslidene spiller av */
export const analysisSlot = ref<SlotId>('eksempel')
/** Hvilket klipp som tas opp nå (null = ingen) */
export const recordingSlot = ref<SlotId | null>(null)
/** Hvilket klipp som spilles nå (null = ingen) */
export const playingSlot = ref<SlotId | null>(null)
/** Sekunder inn i klippet under avspilling */
export const clipPos = ref(0)

let rec: MediaRecorder | null = null
let src: AudioBufferSourceNode | null = null
let startedAt = 0
let offset = 0
let raf = 0

const decode = async (data: ArrayBuffer) => new OfflineAudioContext(1, 1, 48000).decodeAudioData(data)

// Forhåndsinnspilt eksempel (valgfritt)
void (async () => {
  try {
    const r = await fetch(`${import.meta.env.BASE_URL}eksempel.wav`)
    if (!r.ok || !r.headers.get('content-type')?.startsWith('audio')) return
    const buf = await decode(await r.arrayBuffer())
    if (!slots.eksempel.buf) {
      slots.eksempel.buf = buf
      slots.eksempel.name = 'eksempel.wav'
    }
  } catch {}
})()

export async function startRecording(slot: SlotId) {
  stopClip()
  const stream = await getMicStream()
  const chunks: Blob[] = []
  rec = new MediaRecorder(stream)
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data)
  rec.onstop = async () => {
    recordingSlot.value = null
    const blob = new Blob(chunks, { type: rec?.mimeType })
    slots[slot].buf = await decode(await blob.arrayBuffer())
    slots[slot].name = 'Opptak'
  }
  rec.start()
  recordingSlot.value = slot
}

export function stopRecording() {
  if (rec && rec.state !== 'inactive') rec.stop()
}

export async function loadFile(slot: SlotId, file: File) {
  stopClip()
  slots[slot].buf = await decode(await file.arrayBuffer())
  slots[slot].name = file.name
}

/** Spill klippet gjennom master, så tap-en (og alle analysene) ser det */
export function playClip(slot: SlotId, from = 0) {
  const buf = slots[slot].buf
  if (!buf) return
  stopClip()
  const c = getCtx()
  const s = c.createBufferSource()
  src = s
  s.buffer = buf
  s.connect(getMaster())
  offset = Math.max(0, Math.min(from, buf.duration - 0.05))
  startedAt = c.currentTime
  s.start(c.currentTime, offset)
  s.onended = () => {
    if (src === s) stopClip()
  }
  playingSlot.value = slot
  const tick = () => {
    clipPos.value = offset + (c.currentTime - startedAt)
    if (playingSlot.value) raf = requestAnimationFrame(tick)
  }
  tick()
}

export function stopClip() {
  try {
    src?.stop()
  } catch {}
  src?.disconnect()
  src = null
  playingSlot.value = null
  cancelAnimationFrame(raf)
}
