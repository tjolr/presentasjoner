// Syntetisert lyd med Web Audio: varmt elektrisk piano + bass. Ingen lydfiler.
import type { ChordTones } from './theory'

let ctx: AudioContext | null = null
let master: GainNode | null = null

export function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext()
    const comp = ctx.createDynamicsCompressor()
    master = ctx.createGain()
    master.gain.value = 0.8
    master.connect(comp)
    comp.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

const mtof = (m: number) => 440 * 2 ** ((m - 69) / 12)

type Kind = 'keys' | 'bass'

export function playTone(midi: number, when: number, dur: number, vel = 0.3, kind: Kind = 'keys') {
  const c = getCtx()
  const t = Math.max(when, c.currentTime)
  const f = mtof(midi)

  const out = c.createGain()
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = kind === 'bass' ? 520 : Math.min(4200, f * 5)
  lp.Q.value = 0.4
  const mix = c.createGain()
  mix.connect(lp)
  lp.connect(out)
  out.connect(master!)

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
    return g
  }

  add('sine', f, 1)
  add('triangle', f, kind === 'bass' ? 0.6 : 0.35, 4)
  if (kind === 'keys') {
    // «tine» – kort, lys overtone som gir elektrisk-piano-følelse
    const tine = add('sine', f * 2, 0.22)
    tine.gain.setValueAtTime(0.22, t)
    tine.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
  }

  const sustain = kind === 'bass' ? 0.7 : 0.45
  out.gain.setValueAtTime(0.0001, t)
  out.gain.linearRampToValueAtTime(vel, t + 0.012)
  out.gain.setTargetAtTime(vel * sustain, t + 0.02, kind === 'bass' ? 1.2 : 0.7)
  out.gain.setTargetAtTime(0, t + dur, 0.12)

  const end = t + dur + 1
  for (const o of oscs) {
    o.start(t)
    o.stop(end)
  }
}

/** Én tone, f.eks. fra skalaen */
export function playNote(midi: number, dur = 1.1) {
  playTone(midi, getCtx().currentTime, dur, 0.34, 'keys')
}

/** Bare bass-tonen (grunntonen). Det som skjer ved vanlig klikk. */
export function playBassNote(midi: number, when?: number, dur = 1.6) {
  const c = getCtx()
  playTone(midi, when ?? c.currentTime, dur, 0.5, 'bass')
}

/** Hele akkorden med bass. */
export function playChord(t: ChordTones, when?: number, dur = 2.2, withBass = true) {
  const c = getCtx()
  const at = when ?? c.currentTime
  if (withBass) playTone(t.bass, at, dur, 0.42, 'bass')
  t.tones.forEach((m, i) => playTone(m, at + i * 0.012, dur, 0.17, 'keys'))
}
