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
  weights: "400,500,600,700"
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
Start: spill en sang fra korpuset på gitaren (f.eks. What a Wonderful World). Neste slide: ta den opp, så kan samme klipp brukes som query i demoen til slutt.
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
Ta gjerne også opp et enklere klipp: noen få akkorder (G – C – D – Em), så melodien til en korpussang med enkelttoner (Fader Jakob, Blinke, What a Wonderful World, Let It Be).
-->

---

# Lyd: 48 000 tall i <span class="accent">sekundet</span>

<div class="sub text-center -mt-2">Hvert tall: hvor langt høyttaleren er dyttet ut (+) eller trukket inn (−) akkurat da.<br/>Raske svingninger = lys tone, store utslag = høy lyd.</div>

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

# Hvilken <span class="accent">tone</span> spilles?

<PitchTrace class="mt-2" />

<!--
YIN-algoritmen: sammenlign lydbølgen med seg selv, forskjøvet litt. Når den ligner mest, har vi funnet lengden på én svingning, og dermed frekvensen.
Frekvens → MIDI-tall: 69 + 12·log2(f / 440).
Live: skru på mikrofon og spill én tone om gangen. Flere toner samtidig (akkorder) forvirrer den. Da trenger vi akkord-histogrammet på neste slide.
MIDI-keyboard: oransje, eksakt. Ingen gjetting.
I Python: librosa.pyin eller CREPE. Basic Pitch (Spotify) gjør lyd → MIDI-fil direkte.
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

# Alle tonene på én gang: <span class="accent">spektrogram</span>

<Scope view="spec" :height="160" class="mt-1" />

<div class="sub text-center mt-3">Del lyden i biter på noen millisekunder. For hver bit: hvilke frekvenser er med? (Fourier-transform.)</div>

<v-click>
<FourierBit class="mt-2" />
</v-click>

<!--
Figuren: én gitarstreng (G) = grunntone 196 Hz + overtoner 392, 588, 784, 980 Hz (2×, 3×, 4×, 5×). Fourier plukker dem fra hverandre, og hver blir en strek i spektrogrammet. Derfor ser gitar ut som én tone + svakere streker over. En akkord = flere slike sett oppå hverandre.
Fourier: hver bit (8192 tall ≈ 0,17 s ved 48 kHz) skrives som en sum av sinuser. |X_k| = hvor mye av frekvens k·48000/8192 ≈ k·5,9 Hz. FFT gjør det raskt: N log N.
Mange biter etter hverandre = korttids-Fourier (STFT). Hver bit glattes i kantene med et vindu (Blackman i nettleseren), ellers lekker energi til nabofrekvenser.
Avveining: lengre bit = skarpere frekvens, men utydeligere tid (usikkerhetsprinsippet).
X: tid. Y: frekvens. Lys = sterk.
Sinus = én strek. Gitar = én tone + flere svakere streker over (overtoner). Akkord = mange streker.
Dette «bildet» er det nesten alle lydmodeller jobber med.
-->

---

# Fra lydbølger til <span class="accent">søk</span>

<div class="text-center text-xl mt-4">Mål: spill en bit av en sang, og finn hvilken sang det er</div>

<div class="grid grid-cols-3 gap-4 mt-8">
<v-click>
<div class="card"><div class="k">Høyde</div><h3>Alle tall +5</h3><p class="sub">Du spiller i en annen toneart enn plata.</p></div>
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

- Spiller du **høyere eller lysere**, legger du til en **konstant** på alle tallene. Det er fortsatt samme melodi

</div>

</div>
</div>

<OsNote term="ingest pipeline">Som <code>text_embedding</code> gjør tekst til tall før indeksering. Her gjør pitch-sporingen lyd til tall, likt for alt vi indekserer og for queryen.</OsNote>

<!--
Tonen vi fant på «Hvilken tone spilles?» blir et tall, hvert 30. ms.
Dette er all musikkteorien vi trenger i dag.
Poenget: MIDI-tall er en lineær skala. Frekvens er eksponentiell (×2 per 12 steg), men det trenger vi ikke tenke på.
«+5 på alle» = det som skjer når to personer spiller samme sang i ulik toneart.
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

# Steg 2: tonearten spiller ingen <span class="accent">rolle</span>

<Contours :step="$clicks" class="mt-2" />

<div class="text-center mt-4 h-14">
<div v-if="$clicks === 0" class="sub">Samme melodi i en annen toneart: hver tone er 5 halvtoner opp. Sprangene mellom tonene er like.</div>
<div v-else>Trekk fra gjennomsnittet: <strong class="accent">bare formen er igjen</strong>. Som en <span class="os">analyzer</span> som gjør «Applikasjonene» og «applikasjon» til samme token.</div>
</div>

<OsNote term="analyzer">Kjøres likt ved indeksering og søk, ellers matcher ingenting. Det samme gjelder normaliseringen av melodien.</OsNote>

<!--
Koble tilbake til akkord-sliden: der regnet vi akkorden relativt til grunntonen. Her trekker vi fra snittet. Samme idé: relativt, ikke absolutt.
-->

---
clicks: 1
---

# Steg 3: del opp i overlappende <span class="accent">vinduer</span>

<Contours :step="2 + $clicks" class="mt-2" />

<div class="text-center mt-2">
<div v-if="$clicks === 0" class="sub">5 s vinduer med 2 s hopp. Starter du å spille midt i sangen, treffer du fortsatt et vindu.</div>
<div v-else class="sub">Hvert vindu er en <span class="os">passage</span> med referanse til sangen sin. Vi søker i vinduer, men returnerer sanger. Som å dele et stort bilde i ruter: treffet er en rute, men du får hele bildet.</div>
</div>

<OsNote v-if="$clicks === 0" term="chunking">Som å dele lange dokumenter i overlappende biter før embedding. Overlappen gjør at en frase ikke blir kuttet i to.</OsNote>

<!--
Bygg på Joachims bildesøk: for å finne en liten ting i et stort bilde deler man det i overlappende ruter, én embedding per rute. Her er det samme langs tid: sangen er forelder-dokumentet, vinduene er rutene (i OpenSearch: passages).
Søk treffer vinduer, men resultatet er sanger (pluss hvor i sangen).
-->

---

# Steg 4: finn de <span class="accent">nærmeste</span> vinduene

<div class="sub text-center mt-2">Vi har formen på melodien, delt i vinduer. Nå skal vi søke i dem, akkurat som med embeddings.</div>

<div class="flow mt-12">
<div class="box2"><div class="t">Hvert vindu</div><div class="s">fra steg 3</div></div>
<div class="arrow">→</div>
<div class="box2"><div class="t">64 tall</div><div class="s">en vektor</div></div>
<div class="arrow">→</div>
<div class="box2 os"><div class="t">OpenSearch</div><div class="s">knn_vector</div></div>
<div class="arrow">←</div>
<div class="box2"><div class="t">Du spiller</div><div class="s">også 64 tall</div></div>
</div>

<v-clicks>

<div class="text-center mt-12 text-lg">Lik melodi = tallene ligger <strong>nær hverandre</strong>.</div>
<div class="text-center sub mt-2">Fire spørsmål: hvorfor 64 tall? Hvordan ser indeksen ut? Hva betyr «nær»? Og hvordan blir vinduer til sanger?</div>

</v-clicks>

<!--
Veikart for de neste fire slidene: vektoren, indeksen, avstand (l2) vs cosinus, overfetching.
Ingen modell her: vektoren lager vi selv fra konturen.
-->

---
clicks: 2
---

# Steg 4: ett vindu = <span class="accent">64 tall</span>

<VecExample :step="$clicks" class="mt-4" />

<div class="grid grid-cols-3 gap-6 mt-6 small">
<div v-click="1">

**Alle må ha like mange tall.** Vinduene er 3,5–10 s, altså 117–333 målinger. Vi krymper eller strekker alle til 64.

</div>
<div v-click="2">

**64 er et valg, ikke en regel.** Hver tone får 5–8 punkter. Færre tall mister korte toner, flere gir tregere søk uten mer informasjon.

</div>
<div v-click="2">

**64 er lite.** Tekst-embeddings har 384–1536 tall. Færre tall = mindre indeks og raskere søk.

</div>
</div>

<!--
Bonus med å strekke alt til 64: spiller du dobbelt så sakte, ligner ditt 10 s-vindu på sangens 5 s-vindu etter krymping. Derfor indekserer vi flere vinduslengder.
Vektoren lager vi selv, ingen modell. Det er hele embeddingen.
64 er en innstilling man prøver seg fram med, som vindusstørrelse og hopp. Med embeddings bestemmer modellen antallet (384, 1536 …); her bestemmer vi selv. Toerpotens er bare vane.
-->

---

# Steg 4: <span class="accent">indeksen</span>

<div class="grid grid-cols-2 gap-8 mt-6">
<div>

```json
PUT melodier
{
  "settings": { "index.knn": true },
  "mappings": { "properties": {
    "sang":   { "type": "keyword" },
    "start":  { "type": "float" },
    "kontur": { "type": "knn_vector",
                "dimension": 64, "space_type": "l2" }
  }}
}
```

<v-click>

```json
POST melodier/_doc
{
  "sang": "blinke",
  "start": 4,
  "kontur": [3.2, 3.2, 3.2, …, 2.5, 1.2, …]
}
```

</v-click>

</div>
<div class="small">
<v-clicks>

- Samme som **embeddings-søket** vi kjenner, bare at vektoren lager vi selv, ikke en modell
- **`dimension: 64`**: de 64 tallene fra forrige slide
- **Ett dokument per vindu**, med `sang` og `start`. Sangen er forelderen, vinduet er en passage.
- **`space_type: l2`**: avstand, ikke vinkel. Neste slide.

</v-clicks>
</div>
</div>

<!--
Fire sanger gir noen hundre dokumenter: hopp på 1 s og sju vinduslengder (3,5–10 s).
I produksjon: OpenSearch eller FAISS med HNSW.
-->

---
clicks: 3
---

# Hvorfor avstand (`l2`) og ikke <span class="accent">cosinus?</span>

<VecCompare :step="$clicks" class="mt-8" />

<div class="text-center sub mt-6 h-8">
<span v-if="$clicks === 0">Tre sanger på to toner hver. Du spiller C → G, litt surt. Hvilken sang er det?</span>
<span v-else-if="$clicks === 1">Trekk fra snittet (steg 2). To tall = en pil. Med 64 tall er det det samme, bare med 64 akser.</span>
<span v-else-if="$clicks === 2"><span class="os">cosinesimil</span> ser bare <em>retningen</em>. Lite steg opp og stort sprang opp blir like: uavgjort mellom A og B.</span>
<span v-else>Avstand (<span class="os">l2</span>) måler hvor langt det er mellom pilspissene. Størrelsen på spranget teller: A vinner.</span>
</div>

<!--
Cosinus ser bort fra lengden på vektoren. Det er riktig for tekst-embeddings, der lengden ikke betyr noe.
For melodier ER lengden informasjonen: et lite steg (+2) og et stort sprang (+7) peker samme vei, men er ulike melodier.
Cosinus skiller fortsatt opp fra ned (sang C får −1).
-->

---
clicks: 1
---

# Steg 4: hent 20 vinduer, få <span class="accent">sanger</span>

<div class="grid grid-cols-[1fr_2fr] gap-6 mt-6">
<div>

```json
GET melodier/_search
{
  "size": 20,
  "query": { "knn": { "kontur": {
    "vector": [-2.1, -2.1, 0.4, …],
    "k": 20
  }}},
  "_source": ["sang", "start"]
}
```

<div class="small mt-4">

**Overfetching:** samme sang treffer mange ganger (vinduer som overlapper, ulike lengder). Vi henter 20 vinduer og slår dem sammen til sanger i appen.

</div>
</div>
<div>

<OverFetch :step="$clicks" />

</div>
</div>

<!--
Ekte treff fra demo-indeksen: utdraget fra Blinke, spilt 5 halvtoner opp og litt surt (samme som på steg 2).
kNN er rask, men grov: tempo og start stemmer sjelden helt. Derfor rangerer vi på nytt med DTW i neste steg.
-->

---
clicks: 2
---

# Steg 5: <span class="accent">DTW</span> fikser tempoet

<div class="sub text-center -mt-2"><strong>D</strong>ynamic <strong>T</strong>ime <strong>W</strong>arping: «bøy tiden» så to kurver passer sammen.</div>

<DtwStretch :step="$clicks" class="mt-3" />

<div class="text-center sub mt-3 h-8">
<span v-if="$clicks === 0">Samme melodi, men du spiller saktere. Du kommer etter sangen.</span>
<span v-else-if="$clicks === 1">Sammenlign punkt for punkt: du er i utakt, så mange par blir <strong style="color:#ef6b6b">feil</strong>.</span>
<span v-else><strong>DTW</strong> lar hvert punkt finne sin tone i sangen. Linjene kan skrå, men aldri krysse: tiden går bare framover.</span>
</div>

<!--
Dette er hele idéen. Tenk to personer som går samme tur i ulikt tempo, med et strikk mellom seg.
Holder du en tone lenger, kobles flere av dine punkter til samme punkt i sangen (linjene vifter ut).
Går du fortere, hopper du over punkter i sangen.
Kost = summen av forskjellene langs linjene. Lav kost = samme melodi.
-->

---
clicks: 2
---

# Steg 5: slik <span class="accent">regner</span> DTW det ut

<DtwView :step="$clicks" class="mt-2" />

<div class="text-center sub mt-2 h-8">
<span v-if="$clicks === 0">Nå mot <em>hele</em> sangen: sangen bortover, det du spilte nedover. 40 % saktere og i en annen toneart.</span>
<span v-else-if="$clicks === 1">Hver rute: er tonen min lik sangens tone akkurat her? <strong>Lys = ja.</strong></span>
<span v-else>Finn den lyseste veien ned. Bratt = du spilte saktere. Der den starter og slutter = <strong>hvor i sangen</strong>.</span>
</div>


<!--
Stien her er de samme linjene som på forrige slide: hvert steg nedover er ett av dine punkter, kolonnen er punktet i sangen det kobles til.
Diagonalt = samme tempo. Brattere = du er saktere (flere rader per kolonne).
Den kan starte og slutte hvor som helst i sangen (subsequence DTW), og prøver alle tonearter −12..12.
Dynamic time warping: strekk og klem tiden så kurvene passer best mulig. Samme type algoritme som edit distance (Levenshtein), bare med tall i stedet for bokstaver.
Vi får to ting: HVOR GODT det passer (kost) og HVOR i sangen (start/slutt).
librosa.sequence.dtw(..., subseq=True) gjør dette i én linje.
-->

---
clicks: 1
---

# Steg 5: DTW stokker om <span class="accent">rekkefølgen</span>

<RerankView :step="$clicks" class="mt-4" />

<div class="text-center mt-6 h-12">
<div v-if="$clicks === 0" class="sub">kNN er rask, men grov: et vindu i feil sang ligner nok til å havne øverst.</div>
<div v-else class="sub">DTW sjekker hver kandidat nøye. Riktig sang vinner, og vi får vite <strong>hvor i sangen</strong>.<br/>Billig søk på <strong>alt</strong>, dyr sammenligning på <strong>litt</strong>.</div>
</div>

<OsNote term="rescore">Kjører en dyrere query på topp-N (<code>window_size</code>). Samme mønster, men DTW finnes ikke der, så vi gjør det i appen.</OsNote>

<!--
Ekte tall fra demo-indeksen: Blinke fra slag 4, spilt tre halvtoner opp.
kNN henter 20 vinduer; de blir til 2 sanger. Wonderful World har et vindu som ligner punkt for punkt, så den kommer først.
DTW på de to kandidatene: Blinke 0,20, Wonderful 0,51. Rekkefølgen snus.
Derfor heter det rerank: søkemotoren gir kandidater, appen bestemmer rekkefølgen.
Joakims poeng fra del 1: søkemotoren gjør grunnleggende indeksering og kNN, resten bygger vi utenpå.
-->

---

# Demo: <span class="accent">spill</span> en sang

<SearchDemo class="mt-1" />

<!--
Korpus: 4 sanger (Fader Jakob, Blinke lille stjerne, What a Wonderful World, Let It Be).
1. Trykk «Fader Jakob» og «Søk». kNN gir What a Wonderful World på #1, DTW flytter Fader Jakob opp.
2. Lydklipp: velg «Lydklipp» oppe til høyre og trykk «Søk med lydklipp». Hele klippet analyseres med en gang (maks 10 s fra første tone).
   Live: velg «Mikrofon», trykk «Lytt 10 s» og spill melodien på gitaren. Én tone om gangen, demp strengen før neste tone.
3. Backup: spill melodien på MIDI-keyboardet mens den tar opp. Da er tallene eksakte.
Klikk et treff for å høre utdraget den mener du spilte.
-->

---

# Tre måter å søke i <span class="accent">lyd</span>

<div class="cards mt-6">
<div class="card">
<div class="k">Shazam</div>
<h3>Fingerprinting</h3>
<p>«Hvilket <strong>opptak</strong> er dette?»</p>
<p class="sub">Samme lydfil, bare med støy rundt.</p>
<div class="os">≈ invertert indeks + term-søk</div>
</div>
<div class="card hot">
<div class="k">SoundHound · det vi bygde</div>
<h3>Melodisøk</h3>
<p>«Hvilken <strong>sang</strong> går sånn her?»</p>
<p class="sub">Du spiller selv. Ingen lydfil å sammenligne med.</p>
<div class="os">≈ knn_vector + rescore</div>
</div>
<div class="card">
<div class="k">CLAP o.l.</div>
<h3>Semantisk</h3>
<p>«Rolig gitar med regn i bakgrunnen»</p>
<p class="sub">Tekst og lyd i samme vektorrom.</p>
<div class="os">≈ CLIP fra del 1, bare med lyd</div>
</div>
</div>

<v-click>
<div class="text-center mt-8 text-lg">Lyd → <strong>tall</strong> → <strong>vinduer</strong> → <strong class="accent">kNN</strong> → <strong>rerank i appen</strong></div>
<div class="sub text-center mt-2">Det vanskelige er å gjøre lyd om til tall. Resten er søk dere allerede kan.</div>
</v-click>

<!--
Kobling til OpenSearch, hvis noen spør:
- Analyzer (lowercase, stemming) ≈ trekk fra snitt: samme melodi uansett toneart
- Invertert indeks + term ≈ Shazam-hasher
- Ingest pipeline (text_embedding) ≈ lyd → tall → vinduer → vektor
- Passage retrieval (avsnitt → artikkel) ≈ overlappende vinduer → sang
- knn_vector + HNSW ≈ 64 tall per vindu, l2
- rescore / rerank ≈ subsequence DTW i appen
- CLIP (tekst ↔ bilde) ≈ CLAP (tekst ↔ lyd)
-->

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
Men spiller du den selv, matcher ingenting: frekvensene er helt andre enn i originalopptaket.
-->

---
clicks: 3
---

# Shazam: fra stjerner til <span class="accent">treff</span>

<ShazamHash :step="$clicks" class="mt-6" />

<div class="text-center sub mt-4 h-8">
<span v-if="$clicks === 0">Lyden blir et kart av prikker. Det er alt Shazam tar vare på.</span>
<span v-else-if="$clicks === 1">Ett punkt er <strong>anker</strong>, og pares med naboer foran seg. Hvert par blir en kort kode: en hash.</span>
<span v-else-if="$clicks === 2">Hashene er <strong>ord</strong> i en invertert indeks: <span class="os">term</span>-søk på et <span class="os">keyword</span>-felt.</span>
<span v-else>Riktig sang = mange treff med <strong>samme tidsforskyvning</strong>. Da vet vi også hvor i sangen klippet er fra.</span>
</div>

<!--
Illustrasjon, ikke ekte tall.
Hvorfor par og ikke enkeltpunkter? Én tone alene finnes i alle sanger. To toner + avstanden mellom dem er mye mer unik.
Hvorfor tidsforskyvning? Hashene kan treffe tilfeldig i mange sanger, men bare i riktig sang ligger alle treffene på linje i tid.
Sammenlign med melodisøket: Shazam matcher eksakt opptak (samme frekvenser), melodisøket matcher formen (tonearten og tempoet kan være annerledes).
-->

---

# Enkelt, middels og <span class="accent">vanskelig</span>

<table class="ez"><tbody>
<tr><th></th><th></th><th>Verktøy</th></tr>
<tr><td>Lyd → tall når det er én tone om gangen (én gitarstreng, plystring)</td><td class="lvl e">Enkelt</td><td>librosa.pyin, CREPE</td></tr>
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
