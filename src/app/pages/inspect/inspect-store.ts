import { inspect } from 'node:util';
import { createContext, useContext } from 'react';
import { action, autorun, computed, flow, makeObservable, observable, toJS } from 'mobx';
import SelectMenu from '../../utils/menu.js';
import {
  file_op_options,
  subcommand_opts,
  EpubContext,
  MenuSelections,
  InspectState, InspectUI,
} from './inspect-model.js';
import { EpubFile } from '../../../epub/mimetypes.js';
import { EpubPackage } from '../../../epub/manifest.js';
import { Stack } from '@datastructures-js/stack';
import { getDirectoryList, getManifest } from '../../../epub/fs.js';
import { objPick } from '../../../util/collection.js';
import { nanoid } from 'nanoid';

import logger from '../../../util/log.js';

const log = logger.getLogger(import.meta.url);


class EpubDataStore implements EpubContext {
  private rootStore: InspectState;

  @observable
  public dir: EpubFile[] = [];

  @observable
  public manifest: EpubPackage = {}

  @observable
  public path: string = '';

  constructor(path: string | null, rootStore: InspectState) {
    this.rootStore = rootStore;

    this.path = path;
  }

  @flow.bound
  *fetchDirContents() {
    let files = yield getDirectoryList(this.path);
    this.dir = files;
    // files.forEach(file => {
    //   this.dir.push(file);
    // });
    //this.dir = await getDirectoryList(this.path);
    // getDirectoryList(this.path)
    //   .then(files => files.forEach(file => {
    //     //this.observableDir.
    //     this.observableDir.push(file);
    //   }));
  }

  async fetchManifest() {
    let manifest = await getManifest(this.path);
    this.manifest = manifest;
  }

  [inspect.custom](depth, opts, inspect) {
    return objPick(this, [ 'dir', 'manifest', 'path' ]);
   }
}

class SelectionStore implements MenuSelections {
  private rootStore: InspectState;

  subcommand = new SelectMenu<string>(subcommand_opts);
  operation = new SelectMenu<string>(file_op_options);
  file = new SelectMenu<EpubFile>([]);

  constructor(rootStore: InspectState) {
    this.rootStore = rootStore;
  }

  [inspect.custom](depth, opts, inspect) {
    return toJS(this);
    //return objPick(this, [ 'subcommand', 'file', 'operation' ]);
   }
}

class UIStore implements InspectUI {
  private rootStore: InspectState;

  //@observable
  messages: Stack<object> = new Stack<object>();
  //@observable
  _location: string = ''

  constructor(rootStore: InspectState) {
    this.rootStore = rootStore;

    makeObservable(this, {
      messages: observable,
      location: computed,
      _location: observable,
      focus: computed,
      setLocation: action,
      logMessage: action,
    });
  }

  //@action
  setLocation(path: string) {
    this._location = path;
  }

  //@computed
  get location(): string {
    let { subcommand, file, operation } = this.rootStore.selections;
    return this.rootStore.tick + [ subcommand, file, operation ]
      .map(i => i?.value)
      .filter(v => v)
      .join('/')
  }

  //@computed
  get focus(): string {
    return '#main-menu';
  }

  //@action
  logMessage(...obj: any[]) {
    log.debug('InspectStore#logMessage', obj);
    this.messages.push(Array.isArray(obj) ? { msg: obj } : obj);
  }

  [inspect.custom](depth, opts, inspect) {
    return objPick(this, [ 'location', 'focus' ]);
  }
}

export class RootStore implements InspectState {
  @observable tick: number;
  selections: SelectionStore;
  epub: EpubDataStore;
  ui: UIStore;

  constructor(epubPath?: string) {
    this.selections = new SelectionStore(this);
    this.ui = new UIStore(this);
    this.epub = new EpubDataStore(epubPath, this);
    this.tick = Date.now();

    if (epubPath) {
      this.epub.fetchDirContents();
    }
    autorun(() => {
      log.debug('subcommand location:', this.ui.location);
    });
  }

  @action tock() {
    this.tick = Date.now();
  }
}

const test_book = '/Users/ryan/iCloudDrive/Books/library/TEST_BOOK.epub';

export const AppContext = createContext<InspectState | null>(null);
export const Provider = AppContext.Provider;

export const useStore = () => {
  const store = useContext(AppContext);
  if (!store) {
    throw new Error('No store');
  }
  return store;
}

