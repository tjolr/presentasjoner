// Musikkteori for Nashville-tall. Ingen avhengigheter til Vue eller Slidev.

export const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const NATURAL_PC = [0, 2, 4, 5, 7, 9, 11]
const MAJOR = [0, 2, 4, 5, 7, 9, 11]

/** De 12 tonearter, med vanlig stavemåte (kors/b) */
export const KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']

/** Trinnakkordene i dur, slik de skrives med Nashville-tall */
export const DIATONIC = ['1', '2m', '3m', '4', '5', '6m', '7°']

const mod = (n: number, m: number) => ((n % m) + m) % m

export function accToStr(n: number): string {
  if (n === 0) return ''
  return n > 0 ? '♯'.repeat(n) : '♭'.repeat(-n)
}

function normAcc(d: number): number {
  const x = mod(d, 12)
  return x > 6 ? x - 12 : x
}

function noteName(letterIdx: number, pc: number): string {
  return LETTERS[letterIdx] + accToStr(normAcc(pc - NATURAL_PC[letterIdx]))
}

export interface ParsedKey {
  name: string
  letterIdx: number
  pc: number
  display: string
}

export function parseKey(name: string): ParsedKey {
  const m = /^([A-G])([#b♯♭]?)$/.exec(name)
  if (!m) throw new Error(`Ugyldig toneart: ${name}`)
  const letterIdx = LETTERS.indexOf(m[1])
  const acc = m[2] === '' ? 0 : m[2] === '#' || m[2] === '♯' ? 1 : -1
  return { name, letterIdx, pc: mod(NATURAL_PC[letterIdx] + acc, 12), display: m[1] + accToStr(acc) }
}

/** Tonen på et gitt trinn (1-7), evt. hevet/senket med `alt` halvtoner */
export function degreeNote(key: ParsedKey, degree: number, alt = 0) {
  const letterIdx = (key.letterIdx + degree - 1) % 7
  const pc = mod(key.pc + MAJOR[degree - 1] + alt, 12)
  return { pc, letterIdx, name: noteName(letterIdx, pc) }
}

/** MIDI-nummer for tonen på trinn `degree`, lagt i et behagelig register */
export function scaleMidi(key: ParsedKey, degree: number): number {
  const tonic = 55 + mod(key.pc - 7, 12) // G3..F#4
  return tonic + MAJOR[degree - 1]
}

export type Quality = 'major' | 'minor' | 'dim'

export interface ParsedChord {
  token: string
  quality: Quality
  rootPc: number
  bassPc: number
  intervals: number[]
  /** «6» og «m» for 6m, «♭7» og «» for b7 */
  numMain: string
  numSuffix: string
  /** «E» og «m» for Em */
  letterRoot: string
  letterSuffix: string
  letter: string
  number: string
}

const RE = /^([b♭#♯]?)([1-7])(m|°|dim)?(sus2|sus4|sus|add9|maj7|7)?(?:\/([b♭#♯]?)([1-7]))?$/

const accOf = (s: string) => (s === '' ? 0 : s === '#' || s === '♯' ? 1 : -1)

export function parseChord(token: string, keyName: string): ParsedChord {
  const m = RE.exec(token.trim())
  if (!m) throw new Error(`Ugyldig akkord: ${token}`)
  const key = parseKey(keyName)
  const alt = accOf(m[1])
  const degree = Number(m[2])
  const quality: Quality = m[3] === 'm' ? 'minor' : m[3] ? 'dim' : 'major'
  const ext = m[4] ?? ''
  const root = degreeNote(key, degree, alt)

  let intervals = quality === 'minor' ? [0, 3, 7] : quality === 'dim' ? [0, 3, 6] : [0, 4, 7]
  if (ext === 'sus' || ext === 'sus4') intervals = [0, 5, 7]
  if (ext === 'sus2') intervals = [0, 2, 7]
  if (ext === 'add9') intervals = [...intervals, 14]
  if (ext === '7') intervals = [...intervals, 10]
  if (ext === 'maj7') intervals = [...intervals, 11]

  let bassPc = root.pc
  let bassName = root.name
  let bassNum = ''
  if (m[6]) {
    const bAlt = accOf(m[5] ?? '')
    const b = degreeNote(key, Number(m[6]), bAlt)
    bassPc = b.pc
    bassName = b.name
    bassNum = accToStr(bAlt) + m[6]
  }

  const extLabel = ext === 'sus' ? 'sus4' : ext
  const qLetter = quality === 'minor' ? 'm' : quality === 'dim' ? 'dim' : ''
  const qNumber = quality === 'minor' ? 'm' : quality === 'dim' ? '°' : ''
  const numMain = accToStr(alt) + degree
  const numSuffix = qNumber + extLabel + (bassNum ? `/${bassNum}` : '')
  const letterSuffix = qLetter + extLabel + (bassNum ? `/${bassName}` : '')

  return {
    token,
    quality,
    rootPc: root.pc,
    bassPc,
    intervals,
    numMain,
    numSuffix,
    letterRoot: root.name,
    letterSuffix,
    letter: root.name + letterSuffix,
    number: numMain + numSuffix,
  }
}

export interface ChordTones {
  /** Bass-tonen (lavt register) */
  bass: number
  /** Resten av akkorden (midt-register) */
  tones: number[]
}

export function chordTones(c: ParsedChord): ChordTones {
  const rootMid = 55 + mod(c.rootPc - 7, 12) // G3..F#4
  return {
    bass: 40 + mod(c.bassPc - 4, 12), // E2..D#3
    tones: c.intervals.map(i => rootMid + i),
  }
}

export function splitTokens(chords: string): string[] {
  return chords.split(/[\s,]+/).filter(Boolean)
}
