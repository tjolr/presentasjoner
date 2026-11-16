# Faggruppe Søkelab – multimodalt søk (utkast)

## Oppsett
- **Del 1 (Joachim, ~15 min):** grunnleggende multimodalt søk, ulike typer søk (tekst→bilde, bilde→bilde, tekst→lyd …), søk i metadata laget med transkribering, VLM, OCR og klassifisering.
- **Del 2 (Tjøl):** musikk og lydsøk, både teori og praksis. Case: «vi lager en SoundHound-klone».

## Publikum
Utviklere som kan søk og OpenSearch, ikke musikere. All musikkteori forklares som tall: tangent = MIDI-tall, melodi = liste med tall, høyere = + konstant.

## Mål for del 2
- Forklare hvorfor lydsøk er vanskelig: kontinuerlige lydbølger, ikke diskrete symboler.
- Begynne med det enkle tilfellet (MIDI: diskrete noter) og gå videre til ekte lyd.
- Søkekonsepter som skal fram: **vektorsøk** (repetisjon), **overfetching** og **query reranking** i applikasjonskoden.
- Live: spille gitar eller MIDI-keyboard, ta opp et klipp og søke med det.

## Tre måter å søke i lyd på
| Type | Spørsmål | Teknikk | Vanskelighet |
|---|---|---|---|
| Audio fingerprinting (Shazam) | «Hvilket opptak er dette?» (eksakt utsnitt) | Spektrogram-topper som hashes (Wang 2003) | Lett å forklare, robust |
| Query-by-humming (SoundHound/Midomi) | «Hvilken sang har denne melodien?» | Pitch-kontur, normalisering, vinduer, vektorsøk, DTW-rerank | Middels |
| Semantisk (CLAP o.l.) | «Rolig gitar med regn» | Felles tekst- og lyd-embedding | Lett å bruke, «magisk» |

## Pipeline for query-by-humming
1. **Indeks:** MIDI-filer gir melodien som noter. Pitch samples hvert ~30 ms.
2. **Normalisering:** trekk fra median-pitch (toneart blir uvesentlig) og regn i halvtoner.
3. **Overlappende vinduer:** f.eks. 5 s med 2 s hopp, resamplet til 64 punkter som blir én vektor.
4. **Query:** lydopptak → pitch (pYIN/CREPE, eller Basic Pitch fra lyd til MIDI) → samme normalisering → vektor.
5. **kNN med overfetching:** hent 20 når vi skal vise 5.
6. **Rerank med subsequence DTW:** gir hvor godt queryen passer (cost) og hvor i sangen den passer.

Kjernen i fortellingen: **lyd → symbolsk (pitch/MIDI) → søk**. Når lyden er gjort om til noter, er resten likt som for MIDI.

## Mulige sidespor
- **Stem separation** (Demucs): skille vokal, bass, gitar og trommer. Gir renere input til melodi- og akkordanalyse.
- **Akkordgjenkjenning, så Nashville-tall:** chroma → akkordmaler → finne toneart → tall relativt til tonearten. Tallene er uavhengige av toneart, akkurat som pitch-normaliseringen.

## Åpne spørsmål
- Hvor lang tid har vi på del 2?
- Ekte OpenSearch, eller vektorsøk i Python med numpy?
- Hvilket sangkorpus? (20–50 kjente sanger som MIDI)
