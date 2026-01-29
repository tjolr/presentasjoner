interface OptionValue {
  value: string | number;
  label: string;
}

type ValueTypeMap = {
  text: string | undefined;
  number: number | undefined | null;
  date: string | Date | null;
  option: OptionValue | undefined;
};

type ColumnType = keyof ValueTypeMap;

type BaseColumnProps<TData, TType extends ColumnType> = {
  id: keyof TData;
  header: string;
  accessorFn: (row: TData) => ValueTypeMap[TType];
  sortable?: boolean;
  filterable?: boolean;
  size?: number;
  render?: (value: ValueTypeMap[TType], row: TData) => string;
};

type EditableColumnProps<TData, TType extends ColumnType> = BaseColumnProps<
  TData,
  TType
> & {
  editable: true;
  isReadonlyFn: (row: TData) => boolean;
  placeholder: string;
  onChange: (value: ValueTypeMap[TType], row: TData) => void;
};

type NonEditableColumnProps<TData, TType extends ColumnType> = BaseColumnProps<
  TData,
  TType
> & {
  editable?: false;
} & {
  [key in keyof Pick<
    EditableColumnProps<TData, TType>,
    "isReadonlyFn" | "placeholder" | "onChange"
  >]?: never;
};

type ColumnProps<TData, TType extends ColumnType> =
  | EditableColumnProps<TData, TType>
  | NonEditableColumnProps<TData, TType>;

interface Column<TData, TType extends ColumnType> {
  id: keyof TData;
  header: string;
  getValue: (row: TData) => ValueTypeMap[TType];
  size: number;
  sortable: boolean;
  filterable: boolean;
  render?: (value: ValueTypeMap[TType], row: TData) => string;
  meta: {
    type: TType;
    editable: boolean;
    isReadonly?: (row: TData) => boolean;
    placeholder?: string;
    onChange?: (value: ValueTypeMap[TType], row: TData) => void;
  };
}

const DEFAULT_SIZES: Record<ColumnType, number> = {
  text: 150,
  number: 100,
  date: 120,
  option: 200,
};

type IsEditable<T> = T extends { editable: true } ? true : false;

function createColumnForType<TData extends object, TType extends ColumnType>(
  type: TType,
  props: ColumnProps<TData, TType>
): Column<TData, TType> {
  const isEditable = props.editable === true;

  return {
    id: props.id,
    header: props.header,
    getValue: props.accessorFn,
    size: props.size || DEFAULT_SIZES[type],
    sortable: props.sortable !== undefined ? props.sortable : true,
    filterable: props.filterable !== undefined ? props.filterable : true,
    ...(props.render && { render: props.render }),
    meta: {
      type,
      editable: isEditable,
      ...(isEditable && {
        isReadonly: props.isReadonlyFn,
        placeholder: props.placeholder,
        onChange: props.onChange,
      }),
    },
  };
}

type ColumnFactoryMethods<TData> = {
  [TType in ColumnType]: (
    props: ColumnProps<TData, TType>
  ) => Column<TData, TType>;
};

export function createColumnFactory<TData extends object = never>() {
  const columnFactory = {
    text: (props: ColumnProps<TData, "text">) =>
      createColumnForType("text", props),
    number: (props: ColumnProps<TData, "number">) =>
      createColumnForType("number", props),
    date: (props: ColumnProps<TData, "date">) =>
      createColumnForType("date", props),
    option: (props: ColumnProps<TData, "option">) =>
      createColumnForType("option", props),
  } satisfies ColumnFactoryMethods<TData>;

  return columnFactory;
}

interface Produkt {
  id: string;
  navn: string;
  pris: number;
  kategori: OptionValue;
  leverandør: OptionValue;
  mottaksdato: Date;
  utgåttVare?: boolean;
}

const columnFactory = createColumnFactory<Produkt>();

const columns = [
  columnFactory.text({
    id: "navn",
    header: "Produktnavn",
    accessorFn: (row) => row.navn,
    filterable: true,
    render: (value, row) => `<span class="font-bold">${value}</span>`,
  }),
  columnFactory.option({
    id: "kategori",
    header: "Kategori",
    accessorFn: (row) => row.kategori,
    filterable: true,
    render: (value, row) =>
      `<span class="px-2 py-1 rounded-md bg-blue-100 text-blue-800">
           ${value?.value} - ${value?.label}
          </span>`,
  }),
  columnFactory.option({
    id: "leverandør",
    header: "Leverandør",
    accessorFn: (row) => row.leverandør,
    editable: true,
    isReadonlyFn: (row) => row.utgåttVare ?? false,
    placeholder: "Velg leverandør",
    onChange: (value, row) =>
      console.log(`Endret leverandør for ${row.navn} til ${value?.label}`),
  }),
  columnFactory.number({
    id: "pris",
    header: "Pris",
    accessorFn: (row) => row.pris,
    editable: false,
    render: (value, row) => `<span class="text-green-600">${value} kr</span>`,
  }),
  columnFactory.date({
    id: "mottaksdato",
    header: "Mottaksdato",
    accessorFn: (row) => row.mottaksdato,
    size: 180,
    sortable: false,
  }),
];
