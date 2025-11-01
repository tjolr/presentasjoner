---
theme: default
background: "#1a1a1a"
class: text-center
highlighter: shiki
lineNumbers: true
drawings:
  persist: false
transition: slide-left
title: TypeScript utenfor komfortsonen
mdc: true
---

# TypeScript utenfor komfortsonen

---

# Template Literals i TypeScript

TypeScript kan utlede og validere template literal types:

```typescript {1-4|5-10|12-16|17-21|23-27}{maxHeight:'380px'}
// JavaScript Template Literals (runtime)
const color = "red";
const size = "medium";
const className = `${color}-${size}`; // "red-medium"

// Template literal types i TypeScript (type level)
type Color = "red" | "green" | "blue";
type Size = "small" | "medium" | "large";
type ColoredSize = `${Color}-${Size}`;
// Result: 'red-small' | 'red-medium' | 'red-large' | ...

// Eksempel 1: Event Handler Types
type Action = "click" | "hover" | "focus" | "blur" | "change";
type EventHandler = `on${Capitalize<Action>}`;
// Result: "onClick" | "onHover" | "onFocus" | "onBlur" | "onChange"

function handleEvent(event: EventHandler) {
  // Type-safe event handling
}
handleEvent("onClick"); // ✅
handleEvent("click"); // 🚫

// Eksempel 2: CSS Class Variants
type Variant = "primary" | "secondary" | "danger";
type Size = "sm" | "md" | "lg";
type ButtonClass = `btn-${Variant}-${Size}`;
// Result: "btn-primary-sm" | "btn-primary-md" | "btn-secondary-lg" | ...
```

---

# Branded Types

```typescript {1-2|1-7|9-12|9-14|9-17|9-21|9-24}{maxHeight:'380px'}
const getJournal = async (patientId: string, journalId: string) =>
  await fetch(`api/patient/${patientId}/journal/${journalId}`);

const patientId = "12345";
const journalId = "67890";

await getJournal(journalId, patientId); // Feil rekkefølge!

// Løsning: Branded Types
declare const __brand: unique symbol;
type Brand<T, B> = T & { [__brand]: B };

type PatientId = Brand<string, "PatientId">;
type JournalId = Brand<string, "JournalId">;

const getJournal = async (patientId: PatientId, journalId: JournalId) =>
  await fetch(`api/patient/${patientId}/journal/${journalId}`);

const patientId = "12345" as PatientId;
const journalId = "67890" as JournalId;

// Type error: Argument of type 'JournalId' is not assignable to parameter of type 'PatientId'
await getJournal(journalId, patientId); // 🚫 Type error!
```

---

# Typeof & Keyof

```typescript {1-4|1-13|15-23|15-31|31-47|31-56|54-63}{maxHeight:'400px'}
const minKonto = {
  saldo: 100,
  eier: "Ola Normann",
};

type KontoInferred = typeof minKonto;

/*
type KontoInferred = {
  saldo: number;
  eier: string;
}
*/

interface KontoSkjema {
  id: string;
  eier: {
    fornavn: string;
    etternavn: string;
  };
  saldo: number;
  transaksjoner: unknown[];
}

type SkjemaFelter = keyof KontoSkjema;

/*
type SkjemaFelter = "id" | "eier" | "saldo" | "transaksjoner"
*/

export const DebounceConstants = {
  createNewRow: {
    none: 0,
    veryShort: 200,
    short: 1000,
    medium: 5000,
    long: 15000,
  },
  cellEdited: {
    short: 300,
    medium: 750,
    long: 1200,
    maxWait: 30000,
  },
} as const;

export type CreateNewRowDebounceTime =
  keyof typeof DebounceConstants.createNewRow;

/*
type CreateNewRowDebounceTime = "none" | "veryShort" | "short" | "medium" | "long"
*/

function debounceNewRow(delay: CreateNewRowDebounceTime) {
  const timeout = DebounceConstants.createNewRow[delay];
  return timeout;
}

debounceNewRow("short"); // ✅
debounceNewRow("nonexistent"); // 🚫 Type error!
```
