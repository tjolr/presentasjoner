---
theme: default
title: Hvordan søker man i lyd?
colorSchema: dark
transition: slide-left
drawings:
  persist: false
fonts:
  sans: Geist
  mono: JetBrains Mono
  weights: '400,500,600,700'
  provider: google
layout: default
---

<div class="text-center mt-4">
<div class="eyebrow">Søkelab · multimodalt søk · del 2</div>

# Hvordan søker man i <span class="accent">lyd?</span>

<div class="sub text-lg">Fra lydbølger til noe vi kan søke i</div>
</div>

<Scope view="wave" bleed :height="290" class="mt-6" />

<!--
Start: spill en sang på gitaren. Neste slide: ta den opp.
Skru på «Mikrofon» oppe til høyre.
-->

---

# Et <span class="accent">lydklipp</span>

<Recorder class="mt-4" />

<div class="sub text-center mt-3">Dette er alt datamaskinen har: en lang rekke tall. Ikke «G-dur», ikke «Fader Jakob».</div>

<!--
Spill introsangen. Ta opp her («Ta opp»), eller ta opp i Logic og dra fila inn.
Klikk i bølgen for å spille fra et punkt.
De 3 siste klippene huskes (også etter omlasting). På analyseslidene: velg «Lydklipp» oppe til høyre og ▶ for å spille det gjennom analysen, eller «Mikrofon» for live.
Ta gjerne også opp et enklere klipp: noen få akkorder (G – C – D – Em), så Fader Jakob med enkelttoner.
-->
---

# Lyd: 48 000 tall i <span class="accent">sekundet</span>

<div class="sub text-center -mt-2">Hvert tall: hvor langt høyttaleren er dyttet ut akkurat da.<br/>Raske svingninger = lys tone, store utslag = høy lyd.</div>

<v-click>
<div class="text-center mt-3 text-xl">Kan vi gjøre disse tallene om til noe <strong class="accent">nyttig</strong>?</div>
</v-click>

<Scope view="wave" bleed :height="250" class="mt-4" />

<!--
Sinus: én frekvens, helt ren bølge.
Gitarstreng: samme tone, men mange frekvenser oppå hverandre (overtoner). Det er derfor en gitar og et piano høres forskjellige ut.
Akkord: flere toner samtidig, bølgen blir rotete.
Gitar via mikrofon/lydkort: skru på «Mikrofon». Eller «Lydklipp» + ▶ oppe til høyre: spiller klippet fra forrige slide.
Poeng: bølgen sier ingenting direkte om hvilke toner eller akkorder det er. Det må vi regne ut.
-->

---

# Hvilken <span class="accent">akkord</span> spilles?

<ChromaView class="mt-4" />

<div class="sub text-center mt-4">Det finnes bare 12 ulike toner. De gjentar seg, lysere og lysere. En akkord er 3 av dem samtidig.<br/>Tell opp hvor sterk hver av de 12 er i lyden (et histogram med 12 bøtter), og se hvilke 3 som stikker ut.</div>

<!--
Teknisk navn: chroma. Bøtte = MIDI-tall % 12.
Vi sammenligner histogrammet med maler: «dur» = bøttene 0, 4, 7 fra grunntonen; «moll» = 0, 3, 7.
Tallet under er akkorden relativt til sangens grunntone (Nashville-systemet): en relativ indeks i stedet for en absolutt.
SI: «Husk dette trikset: relativt i stedet for absolutt. Vi gjør det samme med melodien i steg 2.»
Spill akkorder på gitaren med mikrofonen på, eller velg «Lydklipp» oppe til høyre og ▶.
Fungerer på gitar alene. På en ferdig miks (sang, bass, trommer) blir histogrammet grøtete: da må man dele opp sporene først (Demucs, se backup).
-->

---

# Hvilken <span class="accent">tone</span> spilles?

<PitchTrace class="mt-2" />

<!--
YIN-algoritmen: sammenlign lydbølgen med seg selv, forskjøvet litt. Når den ligner mest, har vi funnet lengden på én svingning, og dermed frekvensen.
Frekvens → MIDI-tall: 69 + 12·log2(f / 440).
Live: skru på mikrofon og spill én tone om gangen. Flere toner samtidig (akkorder) forvirrer den. Da trenger vi akkord-histogrammet fra forrige slide.
MIDI-keyboard: oransje, eksakt. Ingen gjetting.
I Python: librosa.pyin eller CREPE. Basic Pitch (Spotify) gjør lyd → MIDI-fil direkte.
-->

---

# Alle tonene på én gang: <span class="accent">spektrogram</span>

<Scope view="spec" :height="270" class="mt-2" />

<div class="sub text-center mt-3">Del lyden i biter på noen millisekunder. For hver bit: hvilke frekvenser er med? (Fourier-transform.)</div>

<!--
X: tid. Y: frekvens. Lys = sterk.
Sinus = én strek. Gitar = én tone + flere svakere streker over (overtoner). Akkord = mange streker.
Dette «bildet» er det nesten alle lydmodeller jobber med.
-->

---

# Fra analyse til <span class="accent">søk</span>

<div class="text-center text-xl mt-4">Mål: nynn en bit av en sang, og finn hvilken sang det er</div>

<div class="grid grid-cols-3 gap-4 mt-8">
<v-click>
<div class="card"><div class="k">Høyde</div><h3>Alle tall +5</h3><p class="sub">Du nynner i den høyden som passer stemmen din, ikke den på plata.</p></div>
</v-click>
<v-click>
<div class="card"><div class="k">Tempo</div><h3>Feil fart</h3><p class="sub">For sakte, for fort, og ujevnt underveis.</p></div>
</v-click>
<v-click>
<div class="card"><div class="k">Start</div><h3>Midt i sangen</h3><p class="sub">Du begynner på refrenget, ikke på første tone.</p></div>
</v-click>
</div>

<v-click>
<div class="text-center mt-8 text-xl">Så vi kan ikke bare sammenligne lydfiler. Vi må lage <strong class="accent">noe søkbart</strong> av dem.</div>
</v-click>
---
clicks: 8
---

# Oppskriften

<div class="stack mt-10">
<Pipeline :active="$clicks" :os="$clicks >= 8" />
<div class="h-10 text-center">
<div v-if="$clicks >= 8" class="os">Under: hva det tilsvarer i OpenSearch, slik vi har brukt det før</div>
</div>
</div>

---
clicks: 2
---

# Steg 1: lyd → <span class="accent">tall</span>

<div class="grid grid-cols-[500px_1fr] gap-8 mt-4 items-start">

<Keys :step="$clicks + 1" />

<div class="small">

- En **tone** er en frekvens: svingninger per sekund (Hz)
- Hver tangent har et **nummer** (MIDI). 60 er midt på pianoet
- **+1** = neste tangent. **+12** = samme tone, dobbel frekvens

<div v-if="$clicks >= 1">

- En **melodi** er bare en **liste med tall**

</div>
<div v-if="$clicks >= 2">

- Synger du **høyere eller lysere**, legger du til en **konstant** på alle tallene. Det er fortsatt samme melodi

</div>

</div>
</div>

<!--
Tonen vi fant på «Hvilken tone spilles?» blir et tall, hvert 30. ms.
Dette er all musikkteorien vi trenger i dag.
Poenget: MIDI-tall er en lineær skala. Frekvens er eksponentiell (×2 per 12 steg), men det trenger vi ikke tenke på.
«+5 på alle» = det som skjer når to personer nynner samme sang i ulik høyde.
-->

---

# Snarvei: <span class="accent">MIDI</span>

<MidiRoll class="mt-2" />

<div class="sub text-center mt-1">Lyd: 48 000 tall i sekundet, ingen sier «60». MIDI: «tangent 60 ned». Steg 1 er gjort for oss.</div>

<!--
Husk lydbølgen fra starten: der måtte vi regne oss fram til tonen.
MIDI er ikke lyd, det er noter som data: «trykk ned tangent 60, slipp tangent 60». Som forskjellen på et bilde av tekst og selve teksten.
Skru på MIDI oppe til høyre og spill på keyboardet: hendelsene dukker opp i oransje.
Sangkorpuset vårt er også i praksis MIDI: lister med tall.
-->
---
clicks: 1
---

# Steg 2: høyden spiller ingen <span class="accent">rolle</span>

<Contours :step="$clicks" class="mt-2" />

<div class="text-center mt-4 h-14">
<div v-if="$clicks === 0" class="sub">Samme melodi, men nynnet høyere: alle tallene er +5.</div>
<div v-else>Trekk fra gjennomsnittet: <strong class="accent">bare formen er igjen</strong>. Som en <span class="os">analyzer</span> som gjør «Applikasjonene» og «applikasjon» til samme token.</div>
</div>

<!--
Koble tilbake til akkord-sliden: der regnet vi akkorden relativt til grunntonen. Her trekker vi fra snittet. Samme idé: relativt, ikke absolutt.
-->

---
clicks: 1
---

# Steg 3: vinduer = <span class="accent">passages</span>

<Contours :step="2 + $clicks" class="mt-2" />

<div class="text-center mt-2">
<div v-if="$clicks === 0" class="sub">5 s vinduer med 2 s hopp. Starter du å nynne midt i sangen, treffer du fortsatt et vindu.</div>
<div v-else class="sub">Hvert vindu er en <span class="os">passage</span> med referanse til sangen sin. Vi søker i vinduer, men returnerer sanger. Som avsnitt → Wikipedia-artikkel.</div>
</div>

<!--
Bygg på Joakim: dette er passage retrieval. Sangen er forelder-dokumentet, vinduene er passages.
Søk treffer vinduer, men resultatet er sanger (pluss hvor i sangen).
-->

---

# Steg 4: <span class="accent">vektorsøk</span>, som før

<div class="grid grid-cols-2 gap-8 mt-6">
<div>

```json
PUT melodier
{
  "settings": { "index.knn": true },
  "mappings": { "properties": {
    "sang":  { "type": "keyword" },
    "start": { "type": "float" },
    "kontur": {
      "type": "knn_vector",
      "dimension": 64,
      "space_type": "l2"
    }
  }}
}
```

</div>
<div class="small">
<v-clicks>

- Én **passage per vindu**, med `sang` som forelder
- **`l2`**, ikke `cosinesimil`: et hopp på +2 og et hopp på +7 peker i samme *retning*, men er ulike melodier
- **Overfetching:** vi skal vise 5, men henter `k: 20`
- Hvorfor? kNN er rask, men grov. Tempo og start stemmer sjelden helt.

</v-clicks>
</div>
</div>

<!--
Vi brukte cosinesimil på Wikipedia-embeddings fordi lengden på vektoren ikke betyr noe der.
Her betyr størrelsen på hoppene alt.
Demoen kjører alt i nettleseren med eksakt kNN. Den bruker hopp på 1 s og fem vinduslengder (3,5–7 s), så rask og treg nynning finner et vindu som passer.
I produksjon: OpenSearch eller FAISS med HNSW.
-->

---
clicks: 2
---

# Steg 5: <span class="accent">DTW</span> fikser tempoet

<DtwView :step="$clicks" class="mt-2" />

<div class="text-center sub mt-2 h-8">
<span v-if="$clicks === 0">Sangen langs toppen, nynningen nedover. Nynningen er 40 % saktere og startet høyere.</span>
<span v-else-if="$clicks === 1">Lys rute = like tall. Hver rute sammenligner ett punkt i nynningen med ett punkt i sangen.</span>
<span v-else>Billigste vei gjennom matrisen. Den kan starte hvor som helst i sangen (<em>subsequence</em> DTW).</span>
</div>

<!--
Dynamic time warping: strekk og klem tiden så kurvene passer best mulig. Samme type algoritme som edit distance (Levenshtein), bare med tall i stedet for bokstaver.
Vi får to ting: HVOR GODT det passer (kost) og HVOR i sangen (start/slutt).
librosa.sequence.dtw(..., subseq=True) gjør dette i én linje.
-->

---

# Rerank i <span class="accent">appen</span>, ikke i søkemotoren

<div class="flow mt-16">
<div class="box2"><div class="t">Query</div><div class="s">64 tall</div></div>
<div class="arrow">→</div>
<div class="box2 os"><div class="t">OpenSearch</div><div class="s">kNN · k: 20<br/>rask og grov</div></div>
<div class="arrow">→</div>
<div class="box2 app"><div class="t">Appen</div><div class="s">DTW på 20 treff<br/>treg og presis</div></div>
<div class="arrow">→</div>
<div class="box2"><div class="t">Topp 5</div><div class="s">+ hvor i sangen</div></div>
</div>

<v-clicks>

<div class="text-center mt-12 text-lg">Billig søk på <strong>alt</strong>, dyr sammenligning på <strong>litt</strong>.</div>
<div class="text-center sub mt-2">Jo mer avansert søket blir, desto mer flytter vi ut av søkemotoren og inn i appen. DTW finnes ikke i OpenSearch, så vi gjør det selv.</div>

</v-clicks>

<!--
Joakims poeng fra del 1: søkemotoren gjør grunnleggende indeksering og kNN, resten bygger vi utenpå.
-->

---

# Demo: <span class="accent">spill</span> en sang

<SearchDemo class="mt-1" />

<!--
Korpus: 8 folkemelodier (Fader Jakob, Lisa, Ode til gleden, Hurra for deg, Bjelleklang …).
1. Trykk «Lisa» og «Søk». kNN gir feil sang på #1, DTW flytter riktig sang opp.
2. Live: velg lydkortet oppe til høyre, trykk «Ta opp» og spill melodien på gitaren. Én tone om gangen, demp strengen før neste tone. 5 s.
3. Backup: spill melodien på MIDI-keyboardet mens den tar opp. Da er tallene eksakte.
Klikk et treff for å høre utdraget den mener du nynnet.
-->

---

# Slik gjør <span class="accent">produktene</span> det

<div class="cards mt-6">
<v-click>
<div class="card">
<div class="k">Shazam</div>
<h3>Fingerprinting</h3>
<p>«Hvilket <strong>opptak</strong> er dette?»</p>
<p class="sub">Du holder telefonen mot høyttaleren. Samme lydfil, bare med støy rundt.</p>
<div class="os">≈ invertert indeks + term-søk</div>
</div>
</v-click>
<v-click>
<div class="card hot">
<div class="k">SoundHound</div>
<h3>Query-by-humming</h3>
<p>«Hvilken <strong>sang</strong> går sånn her?»</p>
<p class="sub">Du nynner selv. Ingen lydfil å sammenligne med.</p>
<div class="os">≈ knn_vector + rescore</div>
</div>
</v-click>
<v-click>
<div class="card">
<div class="k">CLAP o.l.</div>
<h3>Semantisk</h3>
<p>«Rolig gitar med regn i bakgrunnen»</p>
<p class="sub">Tekst og lyd i samme vektorrom.</p>
<div class="os">≈ CLIP fra del 1, bare med lyd</div>
</div>
</v-click>
</div>

<v-click>
<div class="sub text-center mt-8">Det vi nettopp bygde er <strong class="accent">query-by-humming</strong>: en liten SoundHound-klone.</div>
</v-click>

---

# Kobling til det vi kan fra før

<table class="ez mt-6"><tbody>
<tr><th>OpenSearch</th><th>Lydsøk</th></tr>
<tr><td class="os">Analyzer (lowercase, stemming)</td><td>Trekk fra snitt: samme melodi uansett høyde</td></tr>
<tr><td class="os">Invertert indeks + term</td><td>Shazam-hasher</td></tr>
<tr><td class="os">Ingest pipeline (text_embedding)</td><td>Lyd → tall → vinduer → vektor</td></tr>
<tr><td class="os">Passage retrieval (avsnitt → artikkel)</td><td>Overlappende vinduer → sang</td></tr>
<tr><td class="os">knn_vector + HNSW</td><td>64 tall per vindu, l2</td></tr>
<tr><td class="os">rescore / rerank</td><td>Subsequence DTW i appen</td></tr>
<tr><td class="os">CLIP (tekst ↔ bilde)</td><td>CLAP (tekst ↔ lyd)</td></tr>
</tbody></table>

---
layout: center
---

<div class="text-center">

# Backup

<div class="sub">Ekstra slides hvis det kommer spørsmål</div>
</div>
---

# Stem separation: fra miks til <span class="accent">spor</span>

<div class="grid grid-cols-[560px_1fr] gap-6 mt-4 items-center">

<Stems />

<div class="small">
<v-clicks>

- En miks er bare **summen** av sporene
- **Demucs** (Meta) går motsatt vei: miks → vokal, bass, trommer, resten
- Melodi fra **vokalsporet**, akkorder fra **bass + gitar**
- Tregt på CPU: kjør det én gang ved indeksering, ikke ved søk

</v-clicks>
</div>

</div>

<!--
Skru av og på sporene mens miksen spiller. Miks-bølgen er summen av de fire over.
Poeng: akkord- og tone-analysen virker fint på gitar alene. På en ferdig miks må vi dele den opp først.
Demucs: pip install demucs; demucs sang.mp3. Ca. et halvt minutt per låt på en Mac.
-->

---

# Shazam: et <span class="accent">stjernekart</span>

<div class="grid grid-cols-[560px_1fr] gap-8 mt-2 items-center">

<Scope view="spec" peaks :height="290" :width="560" />

<div class="small">
<v-clicks>

1. Finn de **sterkeste punktene** i spektrogrammet
2. Lag **par** av punkter: <code>(f1, f2, Δt)</code> → hash
3. Hashene er **tokens** i en invertert indeks
4. Treff = mange hasher fra **samme sang** med **samme tidsforskyvning**

</v-clicks>
<v-click>
<div class="os mt-4">Samme som <code>term</code>-søk på <code>keyword</code>-felt, bare med hasher i stedet for ord.</div>
</v-click>
</div>

</div>

<!--
Wang 2003. Tåler støy, fordi bare de sterkeste punktene teller.
Men nynner du, matcher ingenting: frekvensene er helt andre enn i originalopptaket.
-->

---

# Enkelt, middels og <span class="accent">vanskelig</span>

<table class="ez"><tbody>
<tr><th></th><th></th><th>Verktøy</th></tr>
<tr><td>Lyd → tall når det er én tone om gangen (nynning, plystring)</td><td class="lvl e">Enkelt</td><td>librosa.pyin, CREPE</td></tr>
<tr><td>MIDI som input eller som sangkorpus</td><td class="lvl e">Enkelt</td><td>mido, pretty_midi</td></tr>
<tr><td>Vinduer, vektorer og kNN</td><td class="lvl e">Enkelt</td><td>numpy, FAISS, OpenSearch</td></tr>
<tr><td>Rerank med subsequence DTW</td><td class="lvl e">Enkelt</td><td>librosa.sequence.dtw</td></tr>
<tr><td>Akkorder fra gitar alene</td><td class="lvl e">Enkelt</td><td>librosa.feature.chroma_cqt</td></tr>
<tr><td>Dele en miks i spor</td><td class="lvl m">Middels</td><td>Demucs</td></tr>
<tr><td>Lyd → MIDI med flere toner samtidig</td><td class="lvl m">Middels</td><td>Basic Pitch (Spotify)</td></tr>
<tr><td>Melodi fra ferdig miks, falsk sang, avanserte akkorder</td><td class="lvl h">Vanskelig</td><td>forskning</td></tr>
</tbody></table>

---

# Les mer

<div class="grid grid-cols-2 gap-6 mt-8">
<div class="card">
<div class="k">Bok</div>
<h3>Fundamentals of Music Processing</h3>
<p class="sub">Meinard Müller. Chroma, DTW, subsequence DTW. Gratis Python-notebooks: <strong>FMP Notebooks</strong>.</p>
</div>
<div class="card">
<div class="k">Artikkel</div>
<h3>An Industrial-Strength Audio Search Algorithm</h3>
<p class="sub">Avery Wang, 2003. Slik fungerer Shazam.</p>
</div>
<div class="card">
<div class="k">Artikkel</div>
<h3>Query by Humming</h3>
<p class="sub">Ghias m.fl., 1995. Den første artikkelen om query-by-humming.</p>
</div>
<div class="card">
<div class="k">Verktøy</div>
<h3>librosa · Basic Pitch · Demucs</h3>
<p class="sub">Alt du trenger for å prøve selv i Python.</p>
</div>
</div>
