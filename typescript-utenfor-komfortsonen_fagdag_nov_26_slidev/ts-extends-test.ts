type User = {
  id: UserId;
  name: string;
  email: string;
};

declare const __brand: unique symbol;
type Brand<T, B> = T & { [__brand]: B };

type UserId = Brand<string, "UserId">;

type UserMap = Record<UserId, User>;

// type UserMap = Record<UserId, User>;

type inferTEst = UserMap & { age: number };

import { ActivityProps, CSSProperties } from "react";
type Activity = ActivityProps["children"];

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

const { useStyle: useCustomStyle } = createThemedStyle<CustomTheme>();

const customContainerStyle = useCustomStyle((theme) => ({
  backgroundColor: theme.custom.color,
}));

const customButtonStyle = useCustomStyle((theme) => ({
  color: theme.custom.color,
}));

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
      // kommenterer ut for å ikke få error i hele fila
      // const _exhaustiveCheck: never = color;
      // return _exhaustiveCheck;
      return "";
  }
};

type ArrayItemType<T> = T extends (infer E)[] ? E : never;

const persons = [
  { name: "Ola Nordmann", age: 34 },
  { name: "Kari Hansen", age: 51 },
];
type Person = ArrayItemType<typeof persons>;

const routes: Record<string, `/${string}`> = {
  hjem: "/",
  profil: "/users/:id",
  dashboard: "/dashboard",
} as const;
/*  
Record<string, `/${string}`>
Ulempe: typen blir bred, og vi mister informasjon om at det kun er strenger som starter med "/" 😕
*/

const routesWithoutTypes = {
  hjem: "/",
  profil: "/users/:id",
  dashboard: "/dashboard",
} as const;

/* 
{
    hjem: string;
    profil: string;
    dashboard: string;
}
Bedre, men ikke optimalt 🤔 Vi har mistet kravet om at routes må starte med "/"
*/

const routesSatisfies = {
  hjem: "/",
  profil: "/users/:id",
  dashboard: "/dashboard",
} satisfies Record<string, `/${string}`>;

/* 
{
    hjem: "/";
    profil: "/users/:id";
    dashboard: "/dashboard";
}
Med satisfies har vi bevart type-sikkerhet og informasjon om at det kun er strenger som starter med "/" 🤩
*/

// Felles base
type BaseColumn = {
  id: string;
  label: string;
};

// Når kolonnen er redigerbar
type EditableColumn = BaseColumn & {
  isEditable: true;
  placeholder: string;
  onEdit: (value: string) => void;
};

// Når kolonnen IKKE er redigerbar
type NonEditableColumn = BaseColumn & {
  isEditable?: false | undefined;
  placeholder?: never;
  onEdit?: never;
};

type EnhancedNonEditableColumn = BaseColumn & {
  isEditable: false;
} & {
  [key in keyof Pick<EditableColumn, "placeholder" | "onEdit">]?: never;
};

// Kombinert variant
type Column = EditableColumn | EnhancedNonEditableColumn;

const nameCol: EditableColumn = {
  id: "name",
  label: "Navn",
  isEditable: true,
  placeholder: "Skriv inn navn",
  onEdit: (v) => console.log(v),
};

const idCol: Column = {
  id: "id",
  label: "Bruker-ID",
  isEditable: false,
};

const badCol: Column = {
  id: "email",
  label: "E-post",
  isEditable: false,
  placeholder: "Ikke lov her", // ❌ Type '"Ikke lov her"' is not assignable to type 'never'
  onEdit: () => {}, // ❌ Type '() => void' is not assignable to type 'undefined'
};
