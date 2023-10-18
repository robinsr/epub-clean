import { observable, computed, action } from 'mobx';

export interface MenuOption<T> {
  label: string;
  value: T;
  key?: string;
}

export class SelectMenu<T> {

  @observable public selected: MenuOption<T>;
  @observable public options?: MenuOption<T>[];


  constructor (options: MenuOption<T>[] = []) {
    this.options = options;
  }

  static from<T>(opts: MenuOption<T>[]): SelectMenu<T> {
    return new SelectMenu<T>(opts);
  }

  @action select(value: string | number | T) {
    if (value && typeof value === 'number' && this.options.at(value)) {
      this.selected = this.options.at(value);
    }

    let matchesLabel = this.options.find(opt => Object.is(opt.label, value));
    let matchesValue = this.options.find(opt => Object.is(opt.value, value));

    if (matchesLabel || matchesValue) {
      this.selected = matchesLabel || matchesValue;
    }
  }

  @action clear() {
    this.selected = null;
  }

  @action load(items: MenuOption<T>[]) {
    this.selected = null;
    this.options = items;
  }

  is(obj: string | T): boolean {
    return this.isSelected(obj);
  }

  isSelected(obj: string | T): boolean {
    return this.selected && (
      Object.is(this.selected.label, obj) ||
      Object.is(this.selected.value, obj));
  }

  isNot(obj: string | T, strictEql = false): boolean {
    if (this.isEmpty && strictEql) return false;
    if (this.isEmpty && !strictEql) return true;

    return !this.isSelected(obj);
  }

  @computed get isEmpty(): boolean {
    return this.selected == null;
  }

  @computed get hasSelection(): boolean {
    return !!this.selected;
  }

  @computed get label(): string {
    return this.selected ? this.selected.label : null;
  }

  @computed get value(): T {
    return this.selected ? this.selected.value : null;
  }
}

export default SelectMenu;
