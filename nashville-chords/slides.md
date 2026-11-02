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

<KeyPicker />

<Hint />

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

<Hint />

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

<Hint />

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

<KeyPicker />

<Progression chords="1 4 6m 5" />

<div class="sub text-center">Bytt toneart mens den spiller. Tallene står stille, akkordene følger med.</div>

</div>

---

# Alle tonearter, samme tall

<div class="stack mt-2">

<KeyTable />

<Hint />

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
