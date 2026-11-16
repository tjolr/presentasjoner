// Sangkorpus: folkemelodier uten opphavsrett, skrevet som MIDI-noter.
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
    id: 'lisa',
    title: 'Lisa gikk til skolen',
    bpm: 110,
    notes: n(`67 64 64:2 65 62 62:2 60 62 64 65 67 67 67:2
      67 64 64:2 65 62 62:2 60 64 67 67 60:4`),
  },
  {
    id: 'ode',
    title: 'Ode til gleden',
    bpm: 110,
    notes: n(`64 64 65 67 67 65 64 62 60 60 62 64 64:1.5 62:.5 62:2
      64 64 65 67 67 65 64 62 60 60 62 64 62:1.5 60:.5 60:2`),
  },
  {
    id: 'hurra',
    title: 'Hurra for deg (Happy Birthday)',
    bpm: 120,
    notes: n(`55:.75 55:.25 57 55 60 59:2 55:.75 55:.25 57 55 62 60:2
      55:.75 55:.25 67 64 60 59 57:2 65:.75 65:.25 64 60 62 60:2`),
  },
  {
    id: 'bjelle',
    title: 'Bjelleklang',
    bpm: 130,
    notes: n(`64 64 64:2 64 64 64:2 64 67 60:1.5 62:.5 64:4
      65 65 65:1.5 65:.5 65 64 64 64:.5 64:.5 64 62 62 64 62:2 67:2`),
  },
  {
    id: 'mary',
    title: 'Mary Had a Little Lamb',
    bpm: 120,
    notes: n(`64 62 60 62 64 64 64:2 62 62 62:2 64 67 67:2
      64 62 60 62 64 64 64 64 62 62 64 62 60:4`),
  },
  {
    id: 'saints',
    title: 'When the Saints',
    bpm: 140,
    notes: n(`r 60 64 65 67:4 r 60 64 65 67:4 r 60 64 65 67:2 64:2 60:2 64:2 62:4
      r 64 64 62 60:3 60 64:2 67:2 67 65:3 r 64 65 67:2 64:2 60:2 62:2 60:4`),
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
