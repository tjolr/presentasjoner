// Ett delt lydklipp: tas opp på «Et lydklipp»-sliden, og kan spilles av igjen i alle analysene.
import { ref, shallowRef } from 'vue'
import { getCtx, getMaster, getMicStream } from './audio'

export const clip = shallowRef<AudioBuffer | null>(null)
export const clipName = ref('')
export const recordingClip = ref(false)
export const playing = ref(false)
/** Sekunder inn i klippet under avspilling (for spillehode) */
export const clipPos = ref(0)

let rec: MediaRecorder | null = null
let src: AudioBufferSourceNode | null = null
let startedAt = 0
let offset = 0
let raf = 0

export async function startRecording() {
  stopClip()
  const stream = await getMicStream()
  const chunks: Blob[] = []
  rec = new MediaRecorder(stream)
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data)
  rec.onstop = async () => {
    recordingClip.value = false
    const blob = new Blob(chunks, { type: rec?.mimeType })
    clip.value = await getCtx().decodeAudioData(await blob.arrayBuffer())
    clipName.value = 'Opptak'
  }
  rec.start()
  recordingClip.value = true
}

export function stopRecording() {
  if (rec && rec.state !== 'inactive') rec.stop()
}

export async function loadFile(file: File) {
  stopClip()
  clip.value = await getCtx().decodeAudioData(await file.arrayBuffer())
  clipName.value = file.name
}

/** Spill klippet gjennom master, så tap-en (og alle analysene) ser det */
export function playClip(from = 0) {
  if (!clip.value) return
  stopClip()
  const c = getCtx()
  src = c.createBufferSource()
  src.buffer = clip.value
  src.connect(getMaster())
  offset = Math.max(0, Math.min(from, clip.value.duration - 0.05))
  startedAt = c.currentTime
  src.start(c.currentTime, offset)
  src.onended = () => {
    if (src?.buffer === clip.value) stopClip()
  }
  playing.value = true
  const tick = () => {
    clipPos.value = offset + (c.currentTime - startedAt)
    if (playing.value) raf = requestAnimationFrame(tick)
  }
  tick()
}

export function stopClip() {
  try {
    src?.stop()
  } catch {}
  src?.disconnect()
  src = null
  playing.value = false
  cancelAnimationFrame(raf)
}

export const toggleClip = () => (playing.value ? stopClip() : playClip())
