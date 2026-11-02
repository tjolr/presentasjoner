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

# Hvorfor lære Nashville-systemet?

<div class="mt-6">

<v-clicks>

- **Bytt toneart på sekunder.** Passer sangen ikke stemmen din, flytter vi alle akkordene med de samme tallene
- **Alle leser det samme.** Sangleder, gitar, piano og bass, uansett toneart og kapo
- **Du ser mønstrene.** 1 4 5 og 1 5 6m 4 går igjen i mange sanger. Lær dem én gang, bruk dem i alle tonearter
- **Lettere å huske.** Én sang er ett tallmønster, ikke tolv ulike sett med bokstaver
- **Du møter også romertall.** Samme akkorder kan skrives IV og vi, men vi ser på dem som tall: 4 og 6m

</v-clicks>

</div>

<v-click>

<div class="mt-8 sub">Brukt av studiomusikere i Nashville for å spille inn raskt, uten å notere hver toneart.</div>

</v-click>

---
clicks: 2
---

# Akkordene i C-dur

<div class="stack mt-6">

<ScaleChords
  k="C"
  :show="$clicks >= 2 ? 'both' : 'letter'"
  :neutral="$clicks < 1"
  :tint="$clicks >= 1"
/>

<div class="h-20 text-center">
  <div v-if="$clicks === 0">Akkordene i skalaen, ett trinn av gangen: C D E F G A B</div>
  <div v-if="$clicks === 1"><strong class="accent">Dur</strong> er grønn, <strong style="color: var(--sp-blue)">moll</strong> er blå og <strong style="color: var(--sp-orange)">dim</strong> er oransje</div>
  <div v-if="$clicks >= 2">Hver akkord får <strong class="accent">tallet</strong> til tonen den bygger på</div>
</div>

</div>

---
clicks: 2
---

# Det samme i G-dur

<div class="stack mt-6">

<ScaleChords
  k="G"
  :show="$clicks >= 2 ? 'both' : 'letter'"
  :neutral="$clicks < 1"
  :tint="$clicks >= 1"
/>

<div class="h-20 text-center">
  <div v-if="$clicks === 0">Samme oppskrift, nå fra G: G A B C D E F♯</div>
  <div v-if="$clicks === 1"><strong class="accent">Dur</strong> er grønn, <strong style="color: var(--sp-blue)">moll</strong> er blå og <strong style="color: var(--sp-orange)">dim</strong> er oransje</div>
  <div v-if="$clicks >= 2">Hver akkord får <strong class="accent">tallet</strong> til tonen den bygger på</div>
</div>

</div>

---
clicks: 1
---

# Samme progresjon, to tonearter

<div class="stack mt-6">

<div>
<div class="label">C-dur</div>
<Progression chords="1 4 6m 5" k="C" :show="$clicks >= 1 ? 'both' : 'letter'" size="md" :controls="false" />
</div>

<div>
<div class="label">G-dur</div>
<Progression chords="1 4 6m 5" k="G" :show="$clicks >= 1 ? 'both' : 'letter'" size="md" :controls="false" />
</div>

<div class="h-12 text-center sub">
  <div v-if="$clicks >= 1">Bokstavene er ulike, men <strong class="accent">tallene er de samme</strong>: 1 4 6m 5</div>
</div>

</div>

---

# Samme tall, ny toneart

<div class="stack mt-4">

<Progression chords="1 4 6m 5" />

<div class="sub text-center">Bytt toneart mens den spiller. Tallene står stille, akkordene følger med.</div>

</div>

---
clicks: 1
---

# Alle tonearter, samme tall

<div class="stack mt-2" style="gap: 12px">

<KeyTable :fade-rare="$clicks >= 1" />

<div class="h-8 text-center">
  <div v-if="$clicks >= 1"><strong class="accent">1, 4, 5 og 6m</strong> bærer det meste i pop, rock og lovsang. 2m kommer ofte, mens <span class="sub">3m og 7° er sjeldne</span></div>
</div>

</div>

---
clicks: 1
---

# Oppgave: hva er 1 4 6m 5 i E?

<div class="stack mt-10">

<Progression chords="1 4 6m 5" k="E" :show="$clicks >= 1 ? 'both' : 'number'" />

<div class="sub text-center h-8">
  <div v-if="$clicks < 1">Tenk deg om … hvilke toner er 1, 4, 5 i E-dur?</div>
</div>

</div>

---
layout: section
---

<div class="eyebrow">Del 4</div>

# Forenkling og <span class="accent">gjenbruk</span>

---

# Progresjoner fra sanger teamet kan

<div class="songs mt-6">
  <SongCard
    title="I kraft av navnet Jesus"
    part="Refreng"
    chords="1 2m 4 5"
    :lines="[
      { text: 'Navnet Jesus vender sorg til håp', chords: [{ at: 8, c: '1' }] },
      { text: 'Navnet Jesus leger alle sår', chords: [{ at: 8, c: '2m' }] },
      { text: 'Navnet Jesus, i kraft av navnet Jesus', chords: [{ at: 8, c: '4' }, { at: 33, c: '5' }] },
    ]"
  />
  <SongCard
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
  <SongCard
    title="Kom, løft opp hans navn"
    part="Refreng"
    chords="1 2m 6m 5"
    :lines="[
      { text: 'Kom, Løft opp hans navn', chords: [{ at: 0, c: '1' }, { at: 19, c: '2m' }] },
      { text: 'For hele jorden skal lovsynge ham', chords: [{ at: 9, c: '6m' }, { at: 31, c: '5' }] },
    ]"
  />
  <SongCard
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

# Mønstre i stedet for sanger

<div class="mt-8">

- «Denne sangen er bare **1 – 5 – 6m – 4**»
- Lærer du mønsteret, kan du **mange sanger** uten å lese en eneste akkord
- Du ser fort hva som er **likt** og hva som er **annerledes**
- Nye sanger går raskere å lære, og du kan **spille uten noter**

</div>

<v-click>

<div class="mt-10 sub">Det er forskjellen på å huske sanger og å forstå dem.</div>

</v-click>

---
clicks: 1
---

# Akkordkart i tall

<div class="stack mt-4" style="gap: 14px">

<div class="tool" style="width: 560px"><div class="name">Vers</div><Progression chords="1 5 6m 4" size="sm" compact /></div>
<div class="tool" style="width: 560px"><div class="name">Refreng</div><Progression chords="4 1 5 6m" size="sm" compact /></div>

<div v-click="1" class="sub text-center">Samme kart i alle tonearter. Velg toneart øverst til høyre.</div>

</div>

---

# Små varianter

<div class="grid3 mt-6" style="gap: 22px">
  <div class="var">
    <Chord degree="1/3" size="md" />
    <div class="cap"><strong>1/3</strong><br>Bassen på tersen. Stigende bass.</div>
  </div>
  <div class="var">
    <Chord degree="4/1" size="md" />
    <div class="cap"><strong>4/1</strong><br>Akkord 4 med 1 i bassen.</div>
  </div>
  <div class="var">
    <Chord degree="5/7" size="md" />
    <div class="cap"><strong>5/7</strong><br>Tallet etter skråstreken er bassen.</div>
  </div>
  <div class="var">
    <Chord degree="1sus" size="md" />
    <div class="cap"><strong>sus</strong><br>Tersen byttes ut med kvarten.</div>
  </div>
  <div class="var">
    <Chord degree="1add9" size="md" />
    <div class="cap"><strong>add9</strong><br>En ekstra tone på toppen.</div>
  </div>
  <div class="var">
    <Chord degree="1" size="md" />
    <div class="cap"><strong>1</strong><br>Grunnakkorden. Prøv ⌥-klikk på dem alle.</div>
  </div>
</div>

<div class="mt-6 text-center"><Hint /></div>

---

# Varianter i ekte sanger

<div class="songs mt-6">
  <SongCard
    title="Frihet"
    part="Intro · 1/3"
    chords="1 1/3 4 5"
  />
  <SongCard
    title="Frihet"
    part="Refreng · 5/7"
    chords="2m7 1 1/5 5 4 6m 1 5/7"
    :lines="[
      { text: 'Frihet, frihet', chords: [{ at: 0, c: '2m7' }, { at: 8, c: '1' }] },
      { text: 'Ren og rettferdig i evighet', chords: [{ at: 0, c: '1/5' }, { at: 10, c: '5' }] },
      { text: 'Nåde bare nåde', chords: [{ at: 0, c: '4' }, { at: 6, c: '6m' }] },
      { text: 'Din død ble min frihet', chords: [{ at: 0, c: '1' }, { at: 14, c: '5/7' }] },
    ]"
  />
  <SongCard
    title="Frihet"
    part="Bro · sus"
    chords="6m 2m7 4 5 6m 2m7 5sus 5"
  />
  <SongCard
    title="All ære til deg"
    part="Refreng · 1/3"
    chords="4 5 1/3 6m7 2m7 5 1"
  />
</div>

---
clicks: 1
---

# Opp en tone i siste refreng

<div class="stack mt-6" style="gap: 14px">

<div class="tool"><div class="name">Refreng i G</div><Progression chords="1 5 6m 4" k="G" size="sm" compact /></div>

<div v-click="1" class="tool"><div class="name">Siste refreng: opp en hel tone, i A</div><Progression chords="1 5 6m 4" k="A" size="sm" compact /></div>

<div v-click="1" class="sub text-center">Tallene er de samme. Bare grunntonen flytter seg.</div>

</div>

---
clicks: 3
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

<h1 style="margin-bottom: 0.25em">Verktøykassen</h1>

<div class="grid2" style="gap: 8px 14px">
  <div class="tool"><div class="name"><span class="star">★</span>Stigende bass</div><Progression chords="1 1/3 4" size="sm" compact :beats="2" /></div>
  <div class="tool"><div class="name"><span class="star">★</span>Bassen går videre opp</div><Progression chords="1 5/7 6m" size="sm" compact :beats="2" /></div>
  <div class="tool"><div class="name"><span class="star">★</span>Spenning før hjem</div><Progression chords="5sus 5 1" size="sm" compact :beats="2" /></div>
  <div class="tool"><div class="name">Kom hjem</div><Progression chords="4 5 1" size="sm" compact :beats="2" /></div>
  <div class="tool"><div class="name">Bassen glir ned</div><Progression chords="4 5/4 1" size="sm" compact :beats="2" /></div>
  <div class="tool"><div class="name">Turnaround</div><Progression chords="1 6m 4 5" size="sm" compact :beats="2" /></div>
</div>

---
clicks: 1
---

# Øvelse: 1 – 1/3 – 4 – 5

<div class="stack mt-4">

<Progression chords="1 1/3 4 5" size="md" />

<div v-click="1" class="sub text-center">Alle spiller den i G, så D, så A, så en toneart du selv velger.<br>Nybegynnere velger tonearter de kan grepene i, de erfarne tar E, B eller F♯.</div>

</div>

---

# For deg som vil mer: ♭7

<div class="stack mt-6">

<Progression chords="1 b7 4 1" size="md" />

<div class="sub text-center" style="max-width: 640px">
♭7 er akkorden en hel tone under 1. I G er det F. Vanlig i moderne lovsang, og den skrives <strong>♭7</strong> uten at du trenger noe mer teori.
</div>

</div>

---
layout: section
---

<div class="eyebrow">Del 5</div>

# Fra øyet til <span class="accent">øret</span>

---
clicks: 3
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
layout: section
---

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
layout: section
---

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
