

export interface MenuOption {
  label: string;
  value: string;
}

export class SelectMenu {
  selected: MenuOption;

  constructor(public options: MenuOption[]) {
  }

  static fromOptions(opts: MenuOption[]) {
    return new SelectMenu(opts);
  }

  select(str: string) {
    if (str) {
      this.selected = this.options.find(opt => {
        return opt.value === str || opt.label === str;
      });
    }
  }

  clear() {
    this.selected = null;
  }

  is(str: string) {
    return this.selected && (
      this.selected.value === str ||
      this.selected.label === str);
  }

  isEmpty() {
    return this.selected == null;
  }

  getLabel() {
    return this.selected ? this.selected.label : null;
  }

  getValue() {
    return this.selected ? this.selected.value : null;
  }
}

