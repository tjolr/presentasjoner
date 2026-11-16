# Hvordan søker man i lyd? (Søkelab, del 2)

Slidev-presentasjon om lydsøk for utviklere. All lyd lages i nettleseren (Web Audio), uten lydfiler.

```bash
pnpm install
pnpm dev        # åpner http://localhost:3030
```

## Live-oppsett
- **Bruk Chrome.** Web MIDI fungerer ikke i Safari.
- **Mikrofon** (oppe til høyre): gitar via lydkort eller mikrofon. Ekkokansellering og støyfilter er skrudd av.
- **MIDI** (oppe til høyre): kobler til alle keyboard. «Lyd fra MIDI» spiller notene i nettleseren. Skru den av hvis keyboardet også går gjennom Logic.
- **Åpning:** spill en sang, ta den opp på slide 2 («Et lydklipp»). Backup: ta opp i Logic og dra fila inn. Klippet kan spilles igjen med «▶ Opptaket» på analyseslidene (forsvinner ved reload).
- Pitch-sporing («Hvilken tone spilles?» og demoen) virker best med **én tone om gangen**. Demp strengene mellom tonene.
- Akkordgjenkjenning («Hvilken akkord spilles?») virker best med **bare gitar**, ikke full miks.

## Struktur
- `slides.md`: slidene, med talenotater i `<!-- -->`
- `lib/qbh.ts`: søket: kontur → vinduer → 64-dim vektorer → kNN → subsequence DTW
- `lib/pitch.ts`: YIN-pitchdeteksjon
- `lib/songs.ts`: korpus med 8 folkemelodier som MIDI-noter
- `lib/recording.ts`: delt lydklipp (opptak/fil, avspilling gjennom analysene)
- `lib/audio.ts`, `lib/midi.ts`: synth, gitar (Karplus-Strong), mikrofon, Web MIDI
- `components/`: interaktive slides (Recorder, ClipButton, Scope, Keys, MidiRoll, PitchTrace, Contours, DtwView, SearchDemo, ChromaView, Stems, Pipeline)

Under Playwright/webdriver er lyden ut skrudd av automatisk.
