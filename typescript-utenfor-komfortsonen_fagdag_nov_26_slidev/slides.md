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

---

# Bruk Extends for å stille krav til generics

```typescript {1-3|1-17|1-23}{maxHeight:'400px'}
interface ListProps<T extends { id: number }> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T extends { id: number }>({ items, renderItem }: ListProps<T>) {
  return (
    <>
      {items.map(item => (
        <div key={item.id}>  {/* TypeScript knows 'id' exists */}
          {renderItem(item)}
        </div>
      ))}
    </>
  );
}

// ✅ Works
<List items={[{ id: 1, name: "Alice" }]} renderItem={item => item.name} />

// ❌ Compile error - missing 'id'
<List items={[{ name: "Alice" }]} renderItem={item => item.name} />
```

---

# Never for å filtrere ut uønskede typer

```typescript {1-2|4-7|9-16|18-21|23-29}{maxHeight:'400px'}
// Grunnleggende: Filtrer typer fra union
type RemoveStrings<T> = T extends string ? never : T;

type OnlyNumbers = RemoveStrings<string | number | boolean>;
/*
type OnlyNumbers = number | boolean
*/

// Eksempel: Fjern passord-felter fra bruker
type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
};

type RemovePasswordFields<T> = {
  [K in keyof T]: K extends `${string}password${string}` ? never : T[K];
};
// Problem: password blir 'never', men nøkkelen eksisterer fortsatt

// Løsning: Bruk 'as' for å fjerne nøkkelen helt
type OmitByKeyPattern<T, Pattern extends string> = {
  [K in keyof T as K extends Pattern ? never : K]: T[K];
};

type SafeUser = OmitByKeyPattern<User, `${string}password${string}`>;
// Result: { id: number; name: string; email: string; createdAt: Date }
```

---

# Bruk never for å sørge for at alle valg er dekket i en switch-case

```typescript {maxHeight:'400px'}
type Color = "red" | "green" | "blue" | "yellow";

const getColorHex = (color: Color): string => {
  switch (color) {
    case "red":
      return "#FF0000";
    case "green":
      return "#00FF00";
    case "blue":
      return "#0000FF";
    default:
      const _exhaustiveCheck: never = color;
      // 🚫 Type '"yellow"' is not assignable to type 'never'.ts(2322)
      return _exhaustiveCheck;
  }
};
```

---

# Infer for å ekstrahere typer

```typescript {maxHeight:'400px'}
// Fra React sin typedefinisjon
// @types/react/index.d.ts

type ContextType<C extends Context<any>> = C extends Context<infer T>
  ? T
  : never;

function createContext<T>(defaultValue: T): Context<T>;

const MyContext = createContext({ foo: "bar" });

type MyContextType = ContextType<typeof MyContext>;

/*
type MyContextType = { foo: string }
*/
```

---

# Lagre en generisk variabel i konstant for gjenbruk

```typescript {1-21|23-30|23-44|44-70}{maxHeight:'420px'}
import { CSSProperties } from "react";

type BaseTheme = {
  color: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  font: {
    family: string;
    size: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
};

const createThemedStyle = <TTheme extends BaseTheme>() => {
  const useStyle = (fn: (theme: TTheme) => CSSProperties) => {
    // Mock implementation
    return {} as CSSProperties;
  };

  return { useStyle };
};

// Lagre Theme i variabelen useStyle
const { useStyle } = createThemedStyle();

const containerStyle = useStyle((theme) => ({
  backgroundColor: theme.color.background,
  padding: theme.spacing.lg,
}));

const buttonStyle = useStyle((theme) => ({
  color: theme.color.primary,
  padding: theme.spacing.md,
  fontSize: theme.font.size,
}));

type CustomTheme = BaseTheme & {
  custom: {
    color: string;
  };
};

// Her lagrer vi customTheme i variabelen useCustomStyle
const { useStyle: useCustomStyle } = createThemedStyle<CustomTheme>();

const customContainerStyle = useCustomStyle((theme) => ({
  backgroundColor: theme.custom.color,
}));

const customButtonStyle = useCustomStyle((theme) => ({
  color: theme.custom.color,
}));
```

---

# Discriminated Union

```typescript {1-3|1-20|6-26|27-60|35-60}{maxHeight:'420px'}
interface BaseTransaksjon {
  belop: number;
  dato: Date;
}

interface UttaksTransaksjon extends BaseTransaksjon {
  type: "uttak";
  fraKonto: string;
}

interface InnskuddsTransaksjon extends BaseTransaksjon {
  type: "innskudd";
  tilKonto: string;
}

interface OverføringsTransaksjon extends BaseTransaksjon {
  type: "overføring";
  fraKonto: string;
  tilKonto: string;
}

type Transaksjon =
  | UttaksTransaksjon
  | InnskuddsTransaksjon
  | OverføringsTransaksjon;

// Samme eksempel, men med Zod
import { z } from "zod";

const baseTransaksjonSchema = z.object({
  belop: z.number(),
  dato: z.date(),
});

const uttaksTransaksjonSchema = baseTransaksjonSchema.extend({
  type: z.literal("uttak"),
  fraKonto: z.string(),
});

const innskuddsTransaksjonSchema = baseTransaksjonSchema.extend({
  type: z.literal("innskudd"),
  tilKonto: z.string(),
});

const overføringsTransaksjonSchema = baseTransaksjonSchema.extend({
  type: z.literal("overføring"),
  fraKonto: z.string(),
  tilKonto: z.string(),
});

const transaksjonSchema = z.discriminatedUnion("type", [
  uttaksTransaksjonSchema,
  innskuddsTransaksjonSchema,
  overføringsTransaksjonSchema,
]);

type Transaksjon = z.infer<typeof transaksjonSchema>;
```

---

## Eksempler på Discriminated Union i Tanstack Query

```typescript {1-15|4-28|29-43|44-58|59-71|72-84|86-91|93-102}{maxHeight:'440px'}
// Eksempler på Discriminated union i Tanstack Query
// @tanstack/query-core/build/modern/hydration-[id].d.ts

interface QueryObserverPendingResult<TData = unknown, TError = DefaultError>
  extends QueryObserverBaseResult<TData, TError> {
  data: undefined;
  error: null;
  isError: false;
  isPending: true;
  isLoadingError: false;
  isRefetchError: false;
  isSuccess: false;
  isPlaceholderData: false;
  status: "pending";
}
interface QueryObserverLoadingResult<TData = unknown, TError = DefaultError>
  extends QueryObserverBaseResult<TData, TError> {
  data: undefined;
  error: null;
  isError: false;
  isPending: true;
  isLoading: true;
  isLoadingError: false;
  isRefetchError: false;
  isSuccess: false;
  isPlaceholderData: false;
  status: "pending";
}
interface QueryObserverLoadingErrorResult<
  TData = unknown,
  TError = DefaultError
> extends QueryObserverBaseResult<TData, TError> {
  data: undefined;
  error: TError;
  isError: true;
  isPending: false;
  isLoading: false;
  isLoadingError: true;
  isRefetchError: false;
  isSuccess: false;
  isPlaceholderData: false;
  status: "error";
}
interface QueryObserverRefetchErrorResult<
  TData = unknown,
  TError = DefaultError
> extends QueryObserverBaseResult<TData, TError> {
  data: TData;
  error: TError;
  isError: true;
  isPending: false;
  isLoading: false;
  isLoadingError: false;
  isRefetchError: true;
  isSuccess: false;
  isPlaceholderData: false;
  status: "error";
}
interface QueryObserverSuccessResult<TData = unknown, TError = DefaultError>
  extends QueryObserverBaseResult<TData, TError> {
  data: TData;
  error: null;
  isError: false;
  isPending: false;
  isLoading: false;
  isLoadingError: false;
  isRefetchError: false;
  isSuccess: true;
  isPlaceholderData: false;
  status: "success";
}
interface QueryObserverPlaceholderResult<TData = unknown, TError = DefaultError>
  extends QueryObserverBaseResult<TData, TError> {
  data: TData;
  isError: false;
  error: null;
  isPending: false;
  isLoading: false;
  isLoadingError: false;
  isRefetchError: false;
  isSuccess: true;
  isPlaceholderData: true;
  status: "success";
}

type QueryObserverResult<TData = unknown, TError = DefaultError> =
  | DefinedQueryObserverResult<TData, TError>
  | QueryObserverLoadingErrorResult<TData, TError>
  | QueryObserverLoadingResult<TData, TError>
  | QueryObserverPendingResult<TData, TError>
  | QueryObserverPlaceholderResult<TData, TError>;

// Bruker discriminated union for å ugyldiggjøre branches uten å ha getNext..
// Tanstack Query @tanstack/query-core/build/modern/hydration-[id].d.ts
type FetchInfiniteQueryPages<TQueryFnData = unknown, TPageParam = unknown> =
  | {
      pages?: never;
    }
  | {
      pages: number;
      getNextPageParam: GetNextPageParamFunction<TPageParam, TQueryFnData>;
    };
```

---

# Mapped lookup type

```typescript {1-9|1-12|1-18|11-26|20-50|28-50}{maxHeight:'420px'}
type FeltTypeMap = {
  tall: number;
  tekst: string;
  prosent: number;
  flervalg: {
    id: number;
    beskrivelse: string;
  };
};

type FeltKeys = keyof FeltTypeMap;
// type FeltKeys = "tall" | "tekst" | "prosent" | "flervalg"

type Felt<T extends FeltKeys> = {
  verdi: FeltTypeMap[T];
  valider: (verdi: FeltTypeMap[T]) => boolean;
  formatterVisning: (verdi: FeltTypeMap[T]) => string;
};

const opprettFelt = <T extends FeltKeys = never>(params: Felt<T>) => {
  return {
    verdi: params.verdi,
    valider: params.valider,
    formatterVisning: params.formatterVisning,
  };
};

const prosentFelt = opprettFelt<"prosent">({
  verdi: 0.25,
  valider: (x) => x >= -1 && x <= 1,
  formatterVisning: (x) => x.toString(),
});

const tekstFelt = opprettFelt<"tekst">({
  verdi: "hei",
  valider: (x) => x.length > 0,
  formatterVisning: (x) => x,
});

const tallFelt = opprettFelt<"tall">({
  verdi: 123,
  valider: (x) => x > 0,
  formatterVisning: (x) => x.toString(),
});

const flervalgFelt = opprettFelt<"flervalg">({
  verdi: { beskrivelse: "hei", id: 5 },
  valider: (x) => x.beskrivelse.length > 0,
  formatterVisning: (x) => `${x.id} - ${x.beskrivelse}`,
});
```
