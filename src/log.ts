import { stdout } from 'node:process';
import { inspect } from 'node:util';
import colors from 'colors';
import * as R from 'remeda';
//import { install as enableSrcMap } from 'source-map-support';

// TODO toggle this somehow
//enableSrcMap();

import callerFn from './caller.js';
const caller = callerFn(import.meta.url);

const json_options = {
  colors: true, depth: 12
}

const json = (obj: any): string => {
  let doInspect = R.anyPass(obj, [R.isObject, R.isArray, R.isDate, R.isFunction])
  if (doInspect) {
    return inspect(obj, json_options);
  }
  return obj;
}

enum log_level {
  silly = 6,
  trace = 5,
  debug = 4,
  info = 3,
  warn = 2,
  error = 1,
  fatal = 0
}

interface display_config {
  [key: string | number]: {
    prefix: string;
    theme: string | string[];
  }
}

const log_display: display_config = {
  [log_level.trace]: { prefix: '[TRACE]', theme: 'gray' },
  [log_level.debug]: { prefix: '[DEBUG]', theme: 'brightMagenta' },
  [log_level.info]: { prefix: '[INFO]', theme: 'cyan' },
  [log_level.warn]: { prefix: '[WARN]', theme: 'yellow' },
  [log_level.error]: { prefix: '[ERROR]', theme: [ 'red', 'bold' ] },
  [log_level.fatal]: { prefix: '[FATAL]', theme: [ 'red', 'inverse' ] },
  'added': { prefix: '', theme: 'green' },
  'removed': { prefix: '', theme: 'red' },
  'success': { prefix: '[OK]', theme: [ 'green', 'inverse'] },
  'default': { prefix: '[LOG]', theme: [ 'blue', 'dim'] },
}

let themeMap = R.pipe(log_display,
  R.mapKeys((key) => log_level[key] || key ),
  R.mapValues((val) => val.theme)
);

colors.setTheme(themeMap);

interface LogConfig {
  name?: string;
  level?: log_level;
  parent?: Logger;
}

export class Logger {
  name: string;
  level: log_level;
  parent: Logger
  #stream: NodeJS.WritableStream = stdout;

  constructor(props: LogConfig) {
    Object.assign(this, {name: '$', level: log_level.info }, props);
    this.name = props.name || this.name;
    this.parent = props.parent;

    let parent_levels = [];
    let p = this.parent;
    while (p !== undefined) {
      parent_levels.push(p.level);
      p = p.parent;
    }

    this.level = Math.min(...parent_levels, props.level);
  }

  private checkLevel(level: log_level) {
    return level <= this.level;
  }

  private prefix(level: log_level | string, label?: string): string {
    let { prefix } = log_display[level];
    let color_code = log_level[level] || level || 'default';

    return [
      `${prefix}`[color_code],
      colors.grey(`(${this.name}) ${label || caller()}:`)
    ].join(' ');
  }

  private emit(...msg: any[]) {
    this.#stream.write([
      this.prefix(log_level.debug, '(internal)'), msg.map(json).join(' '), '\n'
    ].join(' '));
  }

  private baseLogFunc(level: log_level | string, ...msg: any[]): void {
    if (typeof level !== 'string') {
      if (!this.checkLevel(level)) return;
    }

    this.#stream.write([
      this.prefix(level), msg.map(json).join(' '), '\n'
    ].join(' '));
  }

  log(...msg: any[]) {
    this.baseLogFunc('default', ...msg);
  }

  info(...msg: any[]) {
    this.baseLogFunc(log_level.info, ...msg);
  }

  warn(...msg: any[]) {
    this.baseLogFunc(log_level.warn, ...msg);
  }

  error(...msg: any[]) {
    this.baseLogFunc(log_level.error, ...msg);
  }

  debug(...msg: any[]) {
    this.baseLogFunc(log_level.debug, ...msg);
  }

  fatal(...msg: any[]) {
    this.baseLogFunc(log_level.fatal, ...msg);
  }

  success(...msg: any[]) {
    this.baseLogFunc('success', ...msg);
  }

  getSubLogger(config: LogConfig): Logger {
    return new Logger({
      name: `${this.name}:${config.name}`,
      level: config.level || this.level,
      parent: this
    })
  }
}

const base = new Logger({ level: log_level.debug });
const applog = base.getSubLogger({ name: 'CMD', level: log_level.info });
const tasklog = base.getSubLogger({ name: 'TASKS', level: log_level.warn });
const domlog  = base.getSubLogger({ name: 'DOM', level: log_level.error });

export { applog as default, applog, tasklog, domlog };
