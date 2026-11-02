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
clicks: 2
---

# Kan vi ta den en tone ned?

<div class="stack">

<div>
<div class="label">Vi spiller i G</div>
<Progression chords="1 4 6m 5" k="G" show="letter" size="md" :controls="false" />
</div>

<div v-click="1">
<div class="label">Så skal vi plutselig i D …</div>
<Progression chords="1 4 6m 5" k="D" show="letter" size="md" :controls="false" />
</div>

<div v-click="2">
<div class="label">… men det er <span class="accent">samme sang</span></div>
<Progression chords="1 4 6m 5" k="D" show="number" size="md" :controls="false" />
</div>

</div>

---

# Ideen

<div class="mt-8">

- Bokstaver sier **hvilke toner** vi spiller
- Tall sier **hvor i skalaen** vi er
- Tallet gjelder i **alle tonearter**
- Brukt av studiomusikere i Nashville for å spille inn raskt, uten å notere hver toneart

</div>

<v-click>

<div class="mt-10 sub">Kapo, sangleder som bytter toneart og nye sanger blir plutselig enkelt.</div>

</v-click>

---

# Du kommer til å se mange navn

<table class="names mt-6">
  <thead>
    <tr><th></th><th>Nashville-tall</th><th>Romertall</th></tr>
  </thead>
  <tbody>
    <tr><th>Dur på 4</th><td class="n">4</td><td class="r">IV</td></tr>
    <tr><th>Moll på 6</th><td class="n">6m</td><td class="r">vi</td></tr>
    <tr><th>Dim på 7</th><td class="n">7°</td><td class="r">vii°</td></tr>
  </tbody>
</table>

<v-click>

<div class="mt-8 sub">
Samme tanke: <strong>tallakkorder</strong>, <strong>trinnakkorder</strong> og <strong>scale degrees</strong>.
Romertall brukes mest til analyse, tall til å spille.
</div>

</v-click>

---
clicks: 1
---

# Skalaen i C-dur

<div class="stack mt-10">

<ScaleTones k="C" :numbers="$clicks >= 1" />

<div v-click="1" class="sub">Hver tone har et nummer: <strong class="accent">1 2 3 4 5 6 7</strong></div>

</div>

---
clicks: 4
---

# Akkordene i C-dur

<div class="stack mt-6">

<ScaleChords
  k="C"
  :show="$clicks >= 1 ? 'both' : 'letter'"
  :highlight="$clicks === 2 ? 'major' : $clicks >= 3 ? 'minor' : 'all'"
/>

<div class="h-16 text-center">
  <div v-click="1" v-if="$clicks < 2">Hver akkord får tallet til tonen den bygger på</div>
  <div v-if="$clicks === 2"><strong class="accent">1, 4 og 5</strong> er dur</div>
  <div v-if="$clicks >= 3"><strong style="color: var(--sp-blue)">2, 3 og 6</strong> er moll</div>
</div>

</div>

---
clicks: 1
---

# Over hverandre

<div class="stack mt-6">

<Progression chords="1 4 6m 5" k="C" :show="$clicks >= 1 ? 'both' : 'letter'" />

<div class="h-12 text-center sub">
  <div v-if="$clicks >= 1">C F Am G &nbsp;=&nbsp; <strong class="accent">1 4 6m 5</strong></div>
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

<div class="stack mt-2">

<KeyTable />

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

# De store progresjonene

<div class="grid2 mt-8">
  <div class="tool"><div class="name">1 – 5 – 6m – 4</div><Progression chords="1 5 6m 4" size="sm" compact /></div>
  <div class="tool"><div class="name">1 – 4 – 6m – 5</div><Progression chords="1 4 6m 5" size="sm" compact /></div>
  <div class="tool"><div class="name">6m – 4 – 1 – 5</div><Progression chords="6m 4 1 5" size="sm" compact /></div>
  <div class="tool"><div class="name">1 – 4 – 5</div><Progression chords="1 4 5" size="sm" compact /></div>
</div>

<v-click>

<div class="mt-8 sub">Dekker en stor del av lovsangrepertoaret. Bytt toneart under, så følger alle med.</div>

</v-click>

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
