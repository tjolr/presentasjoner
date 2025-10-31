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

```javascript {1-4|5-10}
// JavaScript Template Literals (runtime)
const color = "red";
const size = "medium";
const className = `${color}-${size}`; // "red-medium"

// Template literal types i TypeScript (type level)
type Color = "red" | "green" | "blue";
type Size = "small" | "medium" | "large";
type ColoredSize = `${Color}-${Size}`;
// Result: 'red-small' | 'red-medium' | 'red-large' | ...
```

---

```typescript {1-5|1-10|12-16}
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

<div v-click="1" v-click.hide="4">

```typescript {1-5|1-10|11-20}
// Problem: Alle IDs er bare strings
const getJournal = async (patientId: string, journalId: string) =>
  await fetch(`api/patient/${patientId}/journal/${journalId}`);

const patientId = "12345";
const journalId = "67890";

await getJournal(journalId, patientId); // Feil rekkefølge!
```

</div>

<div v-click="4">

```typescript {1-5|1-10|11-20}
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

</div>
