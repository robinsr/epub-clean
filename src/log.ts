import { stdout } from 'node:process';
import { inspect } from 'node:util';
import { basename } from 'node:path';
import colors from 'colors';
import * as R from 'remeda';
import log4js from 'log4js';
import { LoggingEvent } from 'log4js';
import { callerFn, getSourceTS }  from './caller.js';
import { install } from 'source-map-support'

install();

import { config } from '@app-config/main';

let appconfig_loglevel = config.logging.log_level;


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

interface display_config {
  [key: string | number]: {
    order: number;
    prefix: string;
    theme: string | string[];
  }
}

const log_display: display_config = {
  'trace': { order: 5000, prefix: '[TRACE]', theme: 'gray' },
  'debug': { order: 10000, prefix: '[DEBUG]', theme: 'brightMagenta' },
  'info': { order: 20000, prefix: '[INFO]', theme: 'cyan' },
  'warn': { order: 30000, prefix: '[WARN]', theme: 'yellow' },
  'error': { order: 40000, prefix: '[ERROR]', theme: [ 'red', 'bold' ] },
  'fatal': { order: 50000, prefix: '[FATAL]', theme: [ 'red', 'inverse' ] },
  'diff': { order: 20000, prefix: '[DIFF]', theme: 'gray' },
  'added': { order: 55000, prefix: 'added:', theme: 'green' },
  'removed': { order: 55000, prefix: 'removed:', theme: 'red' },
  'success': { order: 55000, prefix: '[OK]', theme: [ 'green', 'inverse'] },
  'default': { order: 20000, prefix: '[LOG]', theme: [ 'blue', 'dim'] },
  'off': { order: Number.MAX_VALUE, prefix: '', theme: 'gray' },
}

let themeMap = R.pipe(log_display,
  R.mapValues((val) => val.theme)
);

let orderMap = R.pipe(log_display,
  R.mapValues((val) => ({ value: val.order, colour: 'cyan' }))
);

colors.setTheme(themeMap);


log4js.addLayout('console_layout', config => (l: LoggingEvent) => {
  let level = l.level.levelStr;
  let level_config = log_display[level.toLowerCase()];
  let color_code = level.toLowerCase() || 'default';
  //console.log(json(l));

  let source = getSourceTS({
    source: l.fileName,
    line: l.lineNumber,
    column: l.columnNumber
  });

  return [
    level_config.prefix[color_code],
    colors.gray(`(${l.categoryName}) ${basename(source.source)}:${source.line}:`),
    l.data.flat().map(json).join(' ')
  ].join(' ');
});

const log4js_category = (level) => ({
  appenders: [ 'console' ], level, enableCallStack: true
});

const log4js_config = {
  levels: orderMap,
  appenders: {
    console: { type: 'console', layout: { type: 'console_layout' } },
    stdout: { type: 'stdout' }
  },
  categories: {
    'default': log4js_category('error'),
    'main': log4js_category(appconfig_loglevel),
    'main.app': log4js_category(appconfig_loglevel),
    'main.task': log4js_category(appconfig_loglevel),
    'main.dom': log4js_category(appconfig_loglevel),
    'diff': { appenders: [ 'stdout' ], level: 'error' },
  },
};

log4js.configure(log4js_config);

const applog = log4js.getLogger('main.app');
const tasklog = log4js.getLogger('main.task');
const domlog = log4js.getLogger('main.dom');

applog.info(log4js_config);


class DiffLogger {
  protected out_stream: NodeJS.WritableStream = stdout;

  protected emit(...msg: any[]) {
    this.out_stream.write(msg.join(' '));
  }

  info(...msg: any[]) {
    this.emit(...[ ...msg, '\n']);
  }

  write(buffer: Uint8Array | string) {
    this.out_stream.write(buffer)
  }
}

const difflog = new DiffLogger();

export { applog as default, applog, tasklog, difflog, domlog };


// applog.log('trace', { prefix: '[TRACE]', theme: 'gray' });
// applog.log('debug', { prefix: '[DEBUG]', theme: 'brightMagenta' });
// applog.log('info', { prefix: '[INFO]', theme: 'cyan' });
// applog.log('warn', { prefix: '[WARN]', theme: 'yellow' });
// applog.log('error', { prefix: '[ERROR]', theme: [ 'red', 'bold' ] });
// applog.log('fatal', { prefix: '[FATAL]', theme: [ 'red', 'inverse' ] });
// applog.log('diff', { prefix: '[DIFF]', theme: 'gray' });
// applog.log('added', { prefix: '', theme: 'green' });
// applog.log('removed', { prefix: '', theme: 'red' });
// applog.log('success', { prefix: '[OK]', theme: [ 'green', 'inverse'] });
// applog.log('default', { prefix: '[LOG]', theme: [ 'blue', 'dim'] });
//
// process.exit(1)