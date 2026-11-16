// All lyd syntetiseres med Web Audio. Ingen lydfiler.
// Alt som spilles, og mikrofonen, går gjennom én felles «tap» (AnalyserNode) som komponentene leser fra.
import { ref } from 'vue'

let ctx: AudioContext | null = null
let master: GainNode
let tap: AnalyserNode
let micSource: MediaStreamAudioSourceNode | null = null
let micStream: MediaStream | null = null

export const micOn = ref(false)

export function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext()
    const comp = ctx.createDynamicsCompressor()
    master = ctx.createGain()
    master.gain.value = 0.8
    tap = ctx.createAnalyser()
    tap.fftSize = 8192
    tap.smoothingTimeConstant = 0.15
    master.connect(comp)
    // Automatisert nettleser (Playwright o.l.): ingen lyd ut, men analysen virker fortsatt
    if (!navigator.webdriver) comp.connect(ctx.destination)
    comp.connect(tap)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

export const getMaster = () => (getCtx(), master)
export const getTap = () => (getCtx(), tap)
export const now = () => getCtx().currentTime

export const mtof = (m: number) => 440 * 2 ** ((m - 69) / 12)
export const ftom = (f: number) => 69 + 12 * Math.log2(f / 440)

const NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B']
export const noteName = (m: number) => NAMES[((Math.round(m) % 12) + 12) % 12] + (Math.floor(Math.round(m) / 12) - 1)
export const pcName = (pc: number) => NAMES[((pc % 12) + 12) % 12]

export type Kind = 'keys' | 'bass' | 'sine' | 'hum'

/** Start en tone. Returnerer en funksjon som slipper den (release). */
export function startVoice(midi: number, kind: Kind = 'keys', vel = 0.3, when?: number, dest?: AudioNode) {
  const c = getCtx()
  const t = Math.max(when ?? c.currentTime, c.currentTime)
  const f = mtof(midi)
  const out = c.createGain()
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = kind === 'bass' ? 520 : kind === 'hum' ? 900 : kind === 'sine' ? 12000 : Math.min(4200, f * 5)
  lp.Q.value = kind === 'hum' ? 2 : 0.4
  const mix = c.createGain()
  mix.connect(lp)
  lp.connect(out)
  out.connect(dest ?? master)

  const oscs: OscillatorNode[] = []
  const add = (type: OscillatorType, freq: number, gain: number, detune = 0) => {
    const o = c.createOscillator()
    const g = c.createGain()
    o.type = type
    o.frequency.value = freq
    o.detune.value = detune
    g.gain.value = gain
    o.connect(g)
    g.connect(mix)
    oscs.push(o)
    return { o, g }
  }

  if (kind === 'sine') {
    add('sine', f, 1)
  } else if (kind === 'hum') {
    // «Nynning»: sagtann gjennom lavpass, litt vibrato og en liten gli inn i tonen
    const { o } = add('sawtooth', f, 0.5)
    add('sine', f, 0.6)
    o.detune.setValueAtTime(-60, t)
    o.detune.linearRampToValueAtTime(0, t + 0.08)
    const lfo = c.createOscillator()
    const depth = c.createGain()
    lfo.frequency.value = 5.5
    depth.gain.value = 14
    lfo.connect(depth)
    for (const x of oscs) depth.connect(x.detune)
    oscs.push(lfo)
  } else {
    add('sine', f, 1)
    add('triangle', f, kind === 'bass' ? 0.6 : 0.35, 4)
    if (kind === 'keys') {
      const { g } = add('sine', f * 2, 0.22)
      g.gain.setValueAtTime(0.22, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
    }
  }

  const sustain = kind === 'bass' ? 0.7 : kind === 'keys' ? 0.45 : 0.9
  out.gain.setValueAtTime(0.0001, t)
  out.gain.linearRampToValueAtTime(vel, t + (kind === 'hum' ? 0.04 : 0.012))
  out.gain.setTargetAtTime(vel * sustain, t + 0.02, kind === 'bass' ? 1.2 : 0.7)
  for (const o of oscs) o.start(t)

  let released = false
  return (at?: number) => {
    if (released) return
    released = true
    const r = Math.max(at ?? c.currentTime, t + 0.02)
    out.gain.cancelScheduledValues(r)
    out.gain.setTargetAtTime(0, r, 0.08)
    for (const o of oscs) o.stop(r + 0.6)
  }
}

export function playTone(midi: number, when: number, dur: number, vel = 0.3, kind: Kind = 'keys', dest?: AudioNode) {
  startVoice(midi, kind, vel, when, dest)(when + dur)
}

/** Gitarstreng med Karplus-Strong: støy inn i en forsinkelseslinje med middelverdi-filter. */
export function pluck(midi: number, when?: number, vel = 0.5, dur = 2.6, dest?: AudioNode) {
  const c = getCtx()
  const t = Math.max(when ?? c.currentTime, c.currentTime)
  const sr = c.sampleRate
  const len = Math.floor(sr * dur)
  const buf = c.createBuffer(1, len, sr)
  const d = buf.getChannelData(0)
  const N = Math.max(2, Math.round(sr / mtof(midi)))
  let prev = 0
  for (let i = 0; i < N; i++) {
    prev = 0.6 * prev + 0.4 * (Math.random() * 2 - 1) // litt mykere anslag
    d[i] = prev
  }
  for (let i = N; i < len; i++) d[i] = 0.4985 * (d[i - N] + d[i - N - 1 >= 0 ? i - N - 1 : 0])
  const src = c.createBufferSource()
  src.buffer = buf
  const g = c.createGain()
  g.gain.setValueAtTime(vel * 2.2, t)
  // Demp strengen mot slutten (som når gitaristen løfter fingeren)
  g.gain.setTargetAtTime(0, t + Math.max(0.05, dur - 0.1), 0.025)
  src.connect(g)
  g.connect(dest ?? master)
  src.start(t)
}

/** Slå an en akkord nedover strengene */
export function strum(midis: number[], when?: number, vel = 0.4, gap = 0.028, dest?: AudioNode) {
  const t = when ?? getCtx().currentTime
  midis.forEach((m, i) => pluck(m, t + i * gap, vel, 2.8, dest))
}

export const GUITAR: Record<string, number[]> = {
  G: [43, 47, 50, 55, 59, 67],
  C: [48, 52, 55, 60, 64],
  D: [50, 57, 62, 66],
  Em: [40, 47, 52, 55, 59, 64],
  Am: [45, 52, 57, 60, 64],
  Bm: [47, 54, 59, 62, 66],
  F: [41, 48, 53, 57, 60, 65],
  A: [45, 52, 57, 61, 64],
  E: [40, 47, 52, 56, 59, 64],
  Dm: [50, 57, 62, 65],
}

let noiseBuf: AudioBuffer | null = null
function noise() {
  const c = getCtx()
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  return noiseBuf
}

export function kick(when: number, dest?: AudioNode) {
  const c = getCtx()
  const o = c.createOscillator()
  const g = c.createGain()
  o.frequency.setValueAtTime(130, when)
  o.frequency.exponentialRampToValueAtTime(42, when + 0.12)
  g.gain.setValueAtTime(0.9, when)
  g.gain.exponentialRampToValueAtTime(0.001, when + 0.35)
  o.connect(g)
  g.connect(dest ?? master)
  o.start(when)
  o.stop(when + 0.4)
}

export function hat(when: number, vel = 0.25, dest?: AudioNode, len = 0.05, hp = 7000) {
  const c = getCtx()
  const s = c.createBufferSource()
  s.buffer = noise()
  const f = c.createBiquadFilter()
  f.type = 'highpass'
  f.frequency.value = hp
  const g = c.createGain()
  g.gain.setValueAtTime(vel, when)
  g.gain.exponentialRampToValueAtTime(0.001, when + len)
  s.connect(f)
  f.connect(g)
  g.connect(dest ?? master)
  s.start(when, Math.random() * 0.5)
  s.stop(when + len + 0.02)
}

export const snare = (when: number, dest?: AudioNode) => hat(when, 0.45, dest, 0.16, 1500)

export async function enableMic() {
  const c = getCtx()
  micStream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
  })
  micSource = c.createMediaStreamSource(micStream)
  micSource.connect(tap)
  micOn.value = true
}

/** Mikrofonstrømmen (slår på mikrofonen hvis den er av) */
export async function getMicStream() {
  if (!micStream) await enableMic()
  return micStream!
}

export function disableMic() {
  micSource?.disconnect()
  micStream?.getTracks().forEach((t) => t.stop())
  micSource = null
  micStream = null
  micOn.value = false
}

/** Sant hvis elementet faktisk vises (Slidev holder naboslides montert, men skjult) */
export const isShown = (el?: Element | null) => !!el && el.getClientRects().length > 0
