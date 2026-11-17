// Sangkorpus: fire melodier skrevet som MIDI-noter (bare til demoen).
// Hver note er [MIDI-tall eller null for pause, varighet i slag].
export type Note = [number | null, number]
export interface Song {
  id: string
  title: string
  bpm: number
  notes: Note[]
}

const n = (s: string): Note[] =>
  s
    .trim()
    .split(/\s+/)
    .map((tok) => {
      const [p, b] = tok.split(':')
      return [p === 'r' ? null : Number(p), b ? Number(b) : 1]
    })

export const SONGS: Song[] = [
  {
    id: 'fader',
    title: 'Fader Jakob',
    bpm: 110,
    notes: n(`60 62 64 60 60 62 64 60 64 65 67:2 64 65 67:2
      67:.5 69:.5 67:.5 65:.5 64 60 67:.5 69:.5 67:.5 65:.5 64 60 60 55 60:2 60 55 60:2`),
  },
  {
    id: 'blinke',
    title: 'Blinke, blinke, lille stjerne',
    bpm: 100,
    notes: n(`60 60 67 67 69 69 67:2 65 65 64 64 62 62 60:2
      67 67 65 65 64 64 62:2 67 67 65 65 64 64 62:2`),
  },
  {
    // Beste forsøk, sjekkes på gehør. C-dur (originalen går i F).
    id: 'wonderful',
    title: 'What a Wonderful World',
    bpm: 72,
    notes: n(`60:.5 64:.5 67 67:.5 69:2.5 69:.5 69:.5 67 65:2.5
      62:.5 64:.5 65 65:.5 67:2.5 67:.5 67:.5 65 64:2.5
      60:.5 62:.5 64 64:.5 65 65:.5 64 62:.5 64:.5 65 64:.5 62 60:3`),
  },
  {
    // Beste forsøk, sjekkes på gehør. Refrenget, C-dur.
    id: 'letitbe',
    title: 'Let It Be',
    bpm: 72,
    notes: n(`64:.5 67:.5 69:2 69:.5 67:.5 67:2 64:.5 67:.5 69:1.5 72:.5 67:.5 67 64:1.5
      67:.5 67:.5 69:.5 67:.5 67 64:.5 62:.5 64:.5 64:.5 62 62:.5 60:2`),
  },
]

export const songById = (id: string) => SONGS.find((s) => s.id === id)!
export const beatSec = (s: Song) => 60 / s.bpm
export const songLength = (s: Song) => s.notes.reduce((a, [, b]) => a + b, 0) * beatSec(s)

/** Notene med starttid og varighet i sekunder */
export function timed(s: Song, stretch = 1, transpose = 0) {
  const bs = beatSec(s) * stretch
  let t = 0
  return s.notes.map(([p, b]) => {
    const r = { pitch: p === null ? null : p + transpose, start: t, dur: b * bs }
    t += b * bs
    return r
  })
}
