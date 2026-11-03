---
theme: default
title: Akkorder som tall
colorSchema: dark
transition: slide-left
drawings:
  persist: false
fonts:
  sans: Inter
  provider: none
---

<div class="stack">

<div>
<div class="eyebrow">Nashville-systemet</div>

# Akkorder som <span class="accent">tall</span>

</div>

<Progression chords="1 4 6m 5" size="md" />

</div>

---

# Hvorfor lære tallsystemet/Nasville?

<div class="mt-6">

<div class="my-8 sub">Brukt av studiomusikere i Nashville for å spille inn raskt, uten å notere hver toneart.</div>

<v-clicks>

- **Enklere å bytte toneart**
- **Alle i band leser det samme**
- **Kjenne igjen mønster på tvers av tonearter**
- **Øving på sanger kan være mer effektivt**

</v-clicks>

</div>

<v-click>

</v-click>

---

<div class="stack mt-6">

<ScaleChords
  k="C"
  :show="$clicks >= 2 ? 'both' : 'letter'"
  :neutral="$clicks < 1"
  :tint="$clicks >= 1"
/>

<div :style="{ opacity: $clicks >= 3 ? 1 : 0, transition: 'opacity .3s' }">
<ScaleChords
  k="G"
  :show="$clicks >= 5 ? 'both' : 'letter'"
  :neutral="$clicks < 4"
  :tint="$clicks >= 4"
/>
</div>

</div>

---

# Noen dropper å skrive moll

<div class="stack mt-6">

<div>
<div class="label">Med moll</div>
<Progression chords="1 2m 3m 4 5 6m 7" show="number" size="md" :controls="false" />
</div>

<div>
<div class="label">Uten moll</div>
<Progression chords="1 2 3 4 5 6 7" show="number" size="md" :controls="false" />
</div>

</div>

---

# Samme tall, ny toneart

<div class="stack mt-4">

<Progression chords="1 4 6m 5" />

<div class="sub text-center">Bytt toneart mens den spiller. Tallene står stille, akkordene følger med.</div>

</div>

---

# Alle tonearter, samme tall

<div class="stack mt-2" style="gap: 12px">

<KeyTable :fade-rare="$clicks >= 1" />

<div class="h-8 text-center">
  <div v-if="$clicks >= 1"><strong class="accent">1, 4, 5 og 6m</strong> bærer det meste i pop, rock og lovsang. 2m kommer ofte, mens <span class="sub">3m og 7° er sjeldne</span></div>
</div>

</div>

---

# Oppgave: hva er 1 4 6m 5 i E?

<div class="stack mt-10">

<Progression chords="1 4 6m 5" k="E" :show="$clicks >= 1 ? 'both' : 'number'" />

<div class="sub text-center h-8">
  <div v-if="$clicks < 1">Tenk deg om … hvilke toner er 1, 4, 5 i E-dur?</div>
</div>

</div>

---

## layout: section

# Eksempler fra setlista

---

# I kraft av navnet Jesus

<div class="songs mt-6">
<SongCard
  expanded
  title="I kraft av navnet Jesus"
  part="Refreng"
  chords="1 2m 4 5"
  :lines="[
    { text: 'Navnet Jesus vender sorg til håp', chords: [{ at: 8, c: '1' }] },
    { text: 'Navnet Jesus leger alle sår', chords: [{ at: 8, c: '2m' }] },
    { text: 'Navnet Jesus, i kraft av navnet Jesus', chords: [{ at: 8, c: '4' }, { at: 33, c: '5' }] },
  ]"
/>
</div>

---

# Om verden ble min

<div class="songs mt-6">
<SongCard
  expanded
  title="Om verden ble min"
  part="Refreng"
  chords="1 2m 6m 4 5"
  :lines="[
    { text: 'Jesus, Du er min dypeste lengsel', chords: [{ at: 0, c: '1' }, { at: 25, c: '2m' }] },
    { text: 'Min sanne rikdom og frelser', chords: [{ at: 20, c: '6m' }] },
    { text: 'Mitt hjerte er ment for Deg', chords: [{ at: 24, c: '4' }] },
    { text: 'Bare Deg', chords: [{ at: 5, c: '5' }] },
  ]"
/>
</div>

---

# Kom, løft opp hans navn

<div class="songs mt-6">
<SongCard
  expanded
  title="Kom, løft opp hans navn"
  part="Refreng"
  chords="1 2m 6m 5"
  :lines="[
    { text: 'Kom, Løft opp hans navn', chords: [{ at: 0, c: '1' }, { at: 19, c: '2m' }] },
    { text: 'For hele jorden skal lovsynge ham', chords: [{ at: 9, c: '6m' }, { at: 31, c: '5' }] },
  ]"
/>
</div>

---

# All ære til deg

<div class="songs mt-6">
<SongCard
  expanded
  title="All ære til deg"
  part="Refreng"
  chords="4 5 1/3 6m7 2m7 5 1"
  :lines="[
    { text: 'All ære til deg', chords: [{ at: 12, c: '4' }, { at: 17, c: '5' }] },
    { text: 'All ære til deg', chords: [{ at: 12, c: '1/3' }, { at: 20, c: '6m7' }] },
    { text: 'All ære til deg', chords: [{ at: 12, c: '2m7' }, { at: 19, c: '5' }] },
    { text: 'All ære til deg', chords: [{ at: 12, c: '1' }] },
  ]"
/>
</div>

---

# Varianter

<div class="grid3 mt-6" style="gap: 22px">
  <div class="var">
    <Chord degree="1/3" size="md" />
    <div class="cap"><strong>1/3</strong><br>Myk, gående bevegelse.</div>
  </div>

  <div class="var">
    <Chord degree="4/6" size="md" />
    <div class="cap"><strong>4/6</strong><br>Varm og løftende.</div>
  </div>

  <div class="var">
    <Chord degree="5/7" size="md" />
    <div class="cap"><strong>5/7</strong><br>Uroligere, med en dragning videre.</div>
  </div>
  <div class="var">
    <Chord degree="1sus" size="md" />
    <div class="cap"><strong>sus4</strong><br>Svevende og spent. Vil løses opp.</div>
  </div>
  <div class="var">
    <Chord degree="1sus2" size="md" />
    <div class="cap"><strong>sus2</strong><br>Åpen og luftig. Verken glad eller trist.</div>
  </div>
  <div class="var">
    <Chord degree="1" size="md" />
    <div class="cap"><strong>1</strong><br>Ren, trygg og hjemme.</div>
  </div>
</div>

<div class="mt-6 text-center"><Hint /></div>

---

<div class="grid2" style="gap: 8px 14px">
  <div class="tool"><div class="name"><span class="star">★</span>Stigende bass</div><Progression chords="1 1/3 4" size="sm" compact :beats="2" /></div>
  <div class="tool"><div class="name"><span class="star">★</span>Bassen går videre opp</div><Progression chords="1 5/7 6m" size="sm" compact :beats="2" /></div>
  <div class="tool"><div class="name"><span class="star">★</span>Spenning før hjem</div><Progression chords="5sus 5 1" size="sm" compact :beats="2" /></div>
  <div class="tool"><div class="name">Kom hjem</div><Progression chords="4 5 1" size="sm" compact :beats="2" /></div>
  <div class="tool"><div class="name">Bassen glir ned</div><Progression chords="4 5/4 1" size="sm" compact :beats="2" /></div>
  <div class="tool"><div class="name">Turnaround</div><Progression chords="1 6m 4 5" size="sm" compact :beats="2" /></div>
</div>

---

# Lær det én gang, bruk det i alle tonearter

<div class="mt-8">

<div v-click="1">

- Vet vi at noe **høres bra ut**, kan vi bruke det i **alle sanger og tonearter**

</div>
<div v-click="2">

- Vi lærer ikke «G til G/B til C», men **«1 til 1/3 til 4»**

</div>
<div v-click="3">

- Over tid bygger vi et **felles verktøysett** av bevegelser alle kan

</div>

</div>

---

## layout: section

<div class="eyebrow">Del 5</div>

# Fra øyet til <span class="accent">øret</span>

---

# Tre steg

<div class="stack mt-12">

<StepFlow :active="$clicks" />

<div class="sub text-center h-8">
  <span v-if="$clicks === 0">Fra å lese tall til å høre dem og spille dem.</span>
  <span v-else-if="$clicks === 1">Det du kan synge, kan du høre.</span>
  <span v-else-if="$clicks === 2">Det du kan høre, kan du finne på instrumentet.</span>
  <span v-else>Ett steg om gangen. Ingen hastverk.</span>
</div>

</div>

---

# Bassen først

<div class="stack mt-4">

<Progression chords="1 4 5 1" size="md" />

<div class="text-center" style="max-width: 640px">

Å høre **grunntonen** er det som er mest verdt.
<span class="accent">1</span> er hjemme, <span class="accent">4</span> er bort, <span class="accent">5</span> er spenning.

</div>

</div>

---

# Ankre i kjente melodier

<div class="sub mb-6">Første intervall i en sang du kan fra før. Trykk for å høre.</div>

<div class="grid2" style="gap: 14px 18px">
  <Interval :notes="[1, 5]" label="1 → 5 · Twinkle twinkle" />
  <Interval :notes="[1, 4]" label="1 → 4 · Her kommer bruden" />
  <Interval :notes="[1, 6]" label="1 → 6 · My Bonnie" />
  <Interval :notes="[1, 8]" label="1 → 8 · Somewhere over the rainbow" />
</div>

---

# Tendenstoner

<div class="sub mb-6">Noen toner «vil» et sted. Syng dem og kjenn det.</div>

<div class="grid2" style="gap: 14px 18px">
  <Interval :notes="[7, 8]" label="7 vil opp til 1" />
  <Interval :notes="[4, 3]" label="4 vil ned til 3" />
  <Interval :notes="[2, 1]" label="2 vil ned til 1" />
  <Interval :notes="[5, 1]" label="5 vil hjem" />
</div>

---

# Syng bassen sammen

<div class="stack mt-2" style="gap: 20px">

<div class="tool"><div class="name">Syng 1 – 4 – 5 – 1</div><Progression chords="1 4 5 1" size="sm" compact /></div>
<div class="tool"><div class="name">Så 1 – 5 – 6m – 4</div><Progression chords="1 5 6m 4" size="sm" compact /></div>

<div class="sub text-center">Syng tallene eller tonenavnene på bassen mens den spiller.</div>

</div>

---

## layout: section

<div class="eyebrow">Del 6</div>

# Øv <span class="accent">sammen</span>

---

# Tre øvelser

<div class="mt-6">

1. **Spill sammen:** alle spiller 1 – 5 – 6m – 4 i en toneart du velger. Vi bytter toneart.
2. **Gjett tallene:** jeg spiller en progresjon, du sier tallene.
3. **Uten noter:** spill samme progresjon i en toneart du ikke har øvd i.

</div>

<div class="stack mt-6"><Progression chords="1 5 6m 4" size="sm" compact /></div>

---

<div class="eyebrow">Del 6 · Gjett tallene</div>

<GuessQuiz />

---

## layout: section

<div class="eyebrow">Del 7</div>

# Hjemmelekse

---

# Før neste gang

<div class="mt-6">

- Skriv **én sang du kan** i tall
- Finn **sanger som deler progresjon**
- Lytt etter **bassen** i musikk du hører på

</div>

<v-click>

<div class="mt-10 sub">Start med 1, 4 og 5. Resten kommer av seg selv.</div>

</v-click>

---

layout: center
class: text-center

---

<div class="stack">

<div>

# Takk!

<div class="sub">Samme tall. Alle tonearter.</div>

</div>

<Progression chords="1 5 6m 4" size="md" />

</div>
