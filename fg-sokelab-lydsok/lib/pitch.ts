// Enkel YIN-pitchdeteksjon (de Cheveigné & Kawahara 2002) på det som går gjennom tap-en.
import { ftom, getCtx, getTap } from './audio'

export function yin(buf: Float32Array, sr: number, fmin = 70, fmax = 1100, thr = 0.15, gate = 0.008): number | null {
  let rms = 0
  for (let i = 0; i < buf.length; i++) rms += buf[i] * buf[i]
  if (Math.sqrt(rms / buf.length) < gate) return null

  const W = Math.floor(buf.length / 2)
  const tauMin = Math.max(2, Math.floor(sr / fmax))
  const tauMax = Math.min(W - 1, Math.floor(sr / fmin))
  const d = new Float32Array(tauMax + 2)
  for (let tau = 1; tau <= tauMax + 1; tau++) {
    let s = 0
    for (let i = 0; i < W; i++) {
      const x = buf[i] - buf[i + tau]
      s += x * x
    }
    d[tau] = s
  }
  // Kumulativ middelverdi-normalisering
  let run = 0
  d[0] = 1
  for (let tau = 1; tau <= tauMax + 1; tau++) {
    run += d[tau]
    d[tau] = run ? (d[tau] * tau) / run : 1
  }
  let tau = -1
  for (let t = tauMin; t <= tauMax; t++) {
    if (d[t] < thr) {
      while (t + 1 <= tauMax && d[t + 1] < d[t]) t++
      tau = t
      break
    }
  }
  if (tau < 0) return null
  // Parabolsk interpolasjon
  const a = d[tau - 1]
  const b = d[tau]
  const c = d[tau + 1]
  const den = a + c - 2 * b
  const shift = den ? (a - c) / (2 * den) : 0
  return sr / (tau + shift)
}

/** Les pitch hvert `hopMs` ms. cb får MIDI-tall (desimal) eller null (stillhet/støy). */
export function startTracker(cb: (midi: number | null) => void, active: () => boolean = () => true, hopMs = 30) {
  const tap = getTap()
  const sr = getCtx().sampleRate
  const buf = new Float32Array(tap.fftSize)
  const id = setInterval(() => {
    if (!active()) return
    tap.getFloatTimeDomainData(buf)
    const f = yin(buf.subarray(buf.length - 2048), sr)
    cb(f ? ftom(f) : null)
  }, hopMs)
  return () => clearInterval(id)
}
