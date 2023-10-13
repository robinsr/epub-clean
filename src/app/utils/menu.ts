export interface MenuOption<T> {
  label: string;
  value: T;
  key?: string;
}

export class SelectMenu<T> {
  protected constructor (
    public options: MenuOption<T>[],
    public selected?: MenuOption<T>) {
  }

  static from<T>(opts: MenuOption<T>[]): SelectMenu<T> {
    return new SelectMenu<T>(opts);
  }

  select(value: number): SelectMenu<T>;
  select(value: string): SelectMenu<T>;
  select(value: string | number): SelectMenu<T> {
    if (value && Number.isInteger(value) && Object.hasOwn(this.options, value)) {
      return new SelectMenu([ ...this.options ], this.options.at(value as number));
    }

    let matchesLabel = this.options.find(opt => Object.is(opt.label, value));
    let matchesValue = this.options.find(opt => Object.is(opt.value, value));

    if (matchesLabel || matchesValue) {
      return new SelectMenu([ ...this.options ], matchesLabel || matchesValue);
    }

    throw new Error(`Menu selection error; No item matching [${value}]`);
  }

  clear(): SelectMenu<T> {
    return new SelectMenu([ ...this.options ]);
  }

  is(obj: string | T): boolean {
    return this.isSelected(obj);
  }

  isSelected(obj: string | T): boolean {
    return this.selected && (
      Object.is(this.selected.label, obj) ||
      Object.is(this.selected.value, obj));
  }

  isEmpty(): boolean {
    return this.selected == null;
  }

  hasSelection(): boolean {
    return !!this.selected;
  }

  getLabel(): string {
    return this.selected ? this.selected.label : null;
  }

  getValue(): T {
    return this.selected ? this.selected.value : null;
  }

  getProperty(key: string): any {
    return this.hasSelection() ? this.selected[key] : null;
  }
}
