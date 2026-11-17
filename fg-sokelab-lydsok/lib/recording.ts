// Lydklipp: de 3 siste opptakene/filene huskes (IndexedDB). Velgeren oppe til høyre
// bestemmer om analysene får lyd fra mikrofonen (live) eller fra et klipp.
import { computed, ref, shallowRef } from 'vue'
import { disableMic, enableMic, getCtx, getMaster, getMicStream, micOn } from './audio'

const MAX = 3

export interface Clip {
  id: string
  name: string
  created: number
  buf: AudioBuffer
}
interface Stored {
  id: string
  name: string
  created: number
  type: string
  data: ArrayBuffer
}

/** Nyeste først */
export const clips = shallowRef<Clip[]>([])
export const selectedId = ref('')
export const selectedClip = computed(() => clips.value.find((c) => c.id === selectedId.value) ?? null)

/** Hvor analysene henter lyd fra */
export const source = ref<'mic' | 'clip'>('mic')
export const recording = ref(false)
export const playing = ref(false)
/** Sekunder inn i klippet under avspilling */
export const clipPos = ref(0)

let rec: MediaRecorder | null = null
let src: AudioBufferSourceNode | null = null
let startedAt = 0
let offset = 0
let raf = 0

const decode = async (data: ArrayBuffer) => new OfflineAudioContext(1, 1, 48000).decodeAudioData(data.slice(0))

// --- IndexedDB ---
const DB = 'lydsok'
const STORE = 'clips'
function db(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1)
    r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: 'id' })
    r.onsuccess = () => res(r.result)
    r.onerror = () => rej(r.error)
  })
}
async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T> | void): Promise<T | undefined> {
  const d = await db()
  return new Promise((res, rej) => {
    const t = d.transaction(STORE, mode)
    const r = fn(t.objectStore(STORE))
    t.oncomplete = () => res(r ? r.result : undefined)
    t.onerror = () => rej(t.error)
  })
}

void (async () => {
  try {
    const all = ((await tx('readonly', (s) => s.getAll())) ?? []) as Stored[]
    all.sort((a, b) => b.created - a.created)
    const out: Clip[] = []
    for (const s of all.slice(0, MAX)) {
      try {
        out.push({ id: s.id, name: s.name, created: s.created, buf: await decode(s.data) })
      } catch {}
    }
    // Klipp lagt til mens vi lastet går foran
    clips.value = [...clips.value, ...out].slice(0, MAX)
    if (!selectedId.value && clips.value[0]) selectedId.value = clips.value[0].id
  } catch {}
})()

async function addClip(name: string, data: ArrayBuffer, type: string) {
  const buf = await decode(data)
  const clip: Clip = { id: crypto.randomUUID(), name, created: Date.now(), buf }
  const dropped = clips.value.slice(MAX - 1)
  clips.value = [clip, ...clips.value].slice(0, MAX)
  selectedId.value = clip.id
  source.value = 'clip'
  try {
    await tx('readwrite', (s) => {
      s.put({ id: clip.id, name, created: clip.created, type, data } satisfies Stored)
      for (const c of dropped) s.delete(c.id)
    })
  } catch {}
  return clip
}

const hhmm = () => new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })

// --- Kilde ---
export async function useMic() {
  stopClip()
  source.value = 'mic'
  if (!micOn.value) await enableMic()
}

export function useClip(id?: string) {
  if (id) selectedId.value = id
  if (source.value !== 'clip') {
    source.value = 'clip'
    if (!recording.value) disableMic()
  } else if (playing.value) playClip()
}

// --- Opptak / fil ---
export async function startRecording() {
  stopClip()
  const stream = await getMicStream()
  const chunks: Blob[] = []
  rec = new MediaRecorder(stream)
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data)
  rec.onstop = async () => {
    recording.value = false
    const blob = new Blob(chunks, { type: rec?.mimeType })
    // Lytter vi på klipp, skal ikke mikrofonen stå på etterpå
    disableMic()
    await addClip(`Opptak ${hhmm()}`, await blob.arrayBuffer(), blob.type)
  }
  rec.start()
  recording.value = true
}

export function stopRecording() {
  if (rec && rec.state !== 'inactive') rec.stop()
}

export async function loadFile(file: File) {
  stopClip()
  return addClip(file.name, await file.arrayBuffer(), file.type)
}

// --- Avspilling ---
/** Spill valgt klipp gjennom master, så tap-en (og alle analysene) ser det */
export function playClip(from = 0) {
  const buf = selectedClip.value?.buf
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

export const togglePlay = () => (playing.value ? stopClip() : playClip())
