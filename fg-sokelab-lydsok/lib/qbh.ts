// Melodisøk (query-by-humming, her med gitar/MIDI): kontur → vinduer → vektorer → kNN → subsequence DTW.
// Ren TypeScript, ingen avhengigheter. Samme idé som i Python med librosa + FAISS/OpenSearch.
import { SONGS, type Song, songById, timed } from './songs'

/** Én verdi per 30 ms, som i forslaget til Joachim */
export const HOP = 0.03
export const WIN = 5
export const WIN_HOP = 1
/** Vi indekserer også kortere og lengre vinduer, så rask eller treg spilling (og lydklipp på opptil 10 s) treffer et vindu med omtrent like mange toner */
export const WIN_SCALES = [3.5, 4.25, 5, 6, 7, 8.5, 10]
/** Ekstra kost for å strekke/klemme tiden (ikke-diagonale steg i DTW) */
export const STEP_PENALTY = 0.25
export const DIMS = 64

/** MIDI-noter → pitch-kontur (NaN i pauser) */
export function songContour(s: Song, stretch = 1, transpose = 0): Float32Array {
  const notes = timed(s, stretch, transpose)
  const last = notes[notes.length - 1]
  const out = new Float32Array(Math.ceil((last.start + last.dur) / HOP)).fill(NaN)
  for (const nt of notes) {
    if (nt.pitch === null) continue
    const a = Math.round(nt.start / HOP)
    const b = Math.round((nt.start + nt.dur) / HOP)
    for (let i = a; i < b && i < out.length; i++) out[i] = nt.pitch
  }
  return out
}

/** «Nynnet» versjon av et utdrag: transponert, saktere, med vibrato, gli og litt støy */
export function fakeHum(id: string, fromBeat: number, beats: number, transpose: number, stretch: number, seed = 1) {
  const s = songById(id)
  let b = 0
  const notes: Song['notes'] = []
  for (const [p, d] of s.notes) {
    if (b >= fromBeat && b < fromBeat + beats) notes.push([p, d])
    b += d
  }
  const part: Song = { ...s, notes }
  const c = songContour(part, stretch, transpose)
  let x = seed
  const rnd = () => ((x = (x * 16807) % 2147483647) / 2147483647) - 0.5
  let prev = NaN
  let since = 0
  for (let i = 0; i < c.length; i++) {
    if (c[i] !== prev) since = 0
    prev = c[i]
    const glide = since < 3 ? -0.5 * (1 - since / 3) : 0
    c[i] += 0.25 * Math.sin(i * HOP * 2 * Math.PI * 5.5) + 0.15 * rnd() + glide + 0.3 // litt surt
    since++
  }
  return { contour: c, notes: timed(part, stretch, transpose) }
}

/** Fyll hull (NaN) med forrige/neste kjente verdi og kutt stillhet i endene */
export function fill(a: Float32Array): Float32Array {
  let i0 = a.findIndex((v) => !Number.isNaN(v))
  if (i0 < 0) return new Float32Array()
  let i1 = a.length - 1
  while (Number.isNaN(a[i1])) i1--
  const out = a.slice(i0, i1 + 1)
  for (let i = 1; i < out.length; i++) if (Number.isNaN(out[i])) out[i] = out[i - 1]
  return out
}

export const mean = (a: ArrayLike<number>) => {
  let s = 0
  for (let i = 0; i < a.length; i++) s += a[i]
  return s / a.length
}

export function resample(a: ArrayLike<number>, n: number): Float32Array {
  const out = new Float32Array(n)
  if (a.length === 1) return out.fill(a[0])
  for (let i = 0; i < n; i++) {
    const x = (i * (a.length - 1)) / (n - 1)
    const j = Math.floor(x)
    const f = x - j
    out[i] = a[j] * (1 - f) + (a[Math.min(j + 1, a.length - 1)] ?? a[j]) * f
  }
  return out
}

/** Trekk fra gjennomsnittet: da forsvinner tonearten, bare formen på melodien er igjen */
export const center = (a: Float32Array) => {
  const m = mean(a)
  return a.map((v) => v - m)
}

export interface Win {
  song: string
  start: number
  vec: Float32Array
}

export function windows(song: string, contour: Float32Array, win = WIN): Win[] {
  const c = fill(contour)
  const wf = Math.round(win / HOP)
  const hf = Math.round(WIN_HOP / HOP)
  const out: Win[] = []
  for (let s = 0; s === 0 || s + wf <= c.length; s += hf) {
    const slice = c.subarray(s, Math.min(s + wf, c.length))
    out.push({ song, start: s * HOP, vec: center(resample(slice, DIMS)) })
    if (s + wf >= c.length) break
  }
  return out
}

export const queryVector = (contour: Float32Array) => center(resample(fill(contour), DIMS))

export const contours = Object.fromEntries(SONGS.map((s) => [s.id, songContour(s)])) as Record<string, Float32Array>
export const INDEX: Win[] = SONGS.flatMap((s) => WIN_SCALES.flatMap((w) => windows(s.id, contours[s.id], w)))

const l2 = (a: Float32Array, b: Float32Array) => {
  let s = 0
  for (let i = 0; i < a.length; i++) s += (a[i] - b[i]) ** 2
  return Math.sqrt(s)
}

/** Eksakt k-NN (bruteforce). OpenSearch/FAISS ville brukt HNSW her. */
export function knn(q: Float32Array, k = 20) {
  return INDEX.map((w) => ({ ...w, dist: l2(q, w.vec) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, k)
}

const ds = (a: Float32Array, f = 3) => {
  const out = new Float32Array(Math.floor(a.length / f))
  for (let i = 0; i < out.length; i++) out[i] = a[i * f]
  return out
}

export interface DtwResult {
  cost: number
  start: number
  end: number
  shift: number
  path: [number, number][]
  D?: Float32Array
}

/**
 * Subsequence DTW: queryen (rader) kan starte og slutte hvor som helst i sangen (kolonner).
 * Prøver alle transponeringer -12..12 og beholder den beste.
 */
export function subseqDtw(qRaw: Float32Array, sRaw: Float32Array, keepMatrix = false): DtwResult {
  const q = center(qRaw)
  const sMed = mean(sRaw)
  const N = q.length
  const M = sRaw.length
  let best: DtwResult | null = null
  const D = new Float32Array(N * M)
  for (let shift = -12; shift <= 12; shift++) {
    const off = sMed + shift
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < M; j++) {
        const c = Math.abs(q[i] - (sRaw[j] - off))
        let m: number
        if (i === 0) m = 0 // fri start
        else if (j === 0) m = D[(i - 1) * M] + STEP_PENALTY
        else m = Math.min(D[(i - 1) * M + j] + STEP_PENALTY, D[i * M + j - 1] + STEP_PENALTY, D[(i - 1) * M + j - 1])
        D[i * M + j] = c + m
      }
    }
    let end = 0
    for (let j = 1; j < M; j++) if (D[(N - 1) * M + j] < D[(N - 1) * M + end]) end = j
    const cost = D[(N - 1) * M + end] / N
    if (!best || cost < best.cost) {
      // Backtrack
      const path: [number, number][] = []
      let i = N - 1
      let j = end
      path.push([i, j])
      while (i > 0) {
        if (j === 0) i--
        else {
          const a = D[(i - 1) * M + j - 1]
          const b = D[(i - 1) * M + j] + STEP_PENALTY
          const c = D[i * M + j - 1] + STEP_PENALTY
          if (a <= b && a <= c) {
            i--
            j--
          } else if (b <= c) i--
          else j--
        }
        path.push([i, j])
      }
      path.reverse()
      best = { cost, start: path[0][1], end, shift, path, D: keepMatrix ? D.slice() : undefined }
    }
  }
  return best!
}

export const DS = 3 // DTW på 90 ms-oppløsning

export interface Ranked {
  song: string
  cost: number
  from: number
  to: number
  knnRank: number
}

/** Rerank: kjør DTW på hver unike sang blant kNN-treffene */
export function rerank(qContour: Float32Array, hits: ReturnType<typeof knn>): Ranked[] {
  const q = ds(fill(qContour), DS)
  const seen = new Map<string, number>()
  hits.forEach((h, i) => !seen.has(h.song) && seen.set(h.song, i))
  return [...seen.entries()]
    .map(([song, knnRank]) => {
      const s = ds(fill(contours[song]), DS)
      const r = subseqDtw(q, s)
      return { song, cost: r.cost, from: r.start * HOP * DS, to: r.end * HOP * DS, knnRank }
    })
    .sort((a, b) => a.cost - b.cost)
}

export { ds }
