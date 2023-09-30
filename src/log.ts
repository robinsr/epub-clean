import { stdout } from 'node:process';
import { inspect } from 'node:util';
import { basename, relative } from 'node:path';
import { install } from 'source-map-support'
import config from 'config';
import colors from 'colors';
import * as R from 'remeda';
import log4js from 'log4js';
import { LoggingEvent } from 'log4js';
import { callerFn, getSourceTS }  from './caller.js';
import { LogConfig } from './program/config.js';

install();

let log_config = config.get<LogConfig>('logging');

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

let themeMap = R.pipe(log_config.levels,
  R.mapValues((val) => val.theme)
);

colors.setTheme(themeMap);

let levels = R.pipe(log_config.levels,
  R.mapValues((val) => ({ ...val, colour: 'cyan' }))
);

log4js.addLayout('console_layout', config => (l: LoggingEvent) => {
  let level = l.level.levelStr;
  let level_config = log_config.levels[level.toLowerCase()];
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


log4js.configure({ ...log_config, levels });

const defaultlog = log4js.getLogger('app');
const logdebug = log4js.getLogger('app.log');

logdebug.debug('Logging config', { ...log_config, levels });


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

const getConfiguredLevel = (logger: log4js.Logger) => {
  let levels = ['Trace', 'Debug', 'Info', 'Warn', 'Error', 'Fatal'];
  let log_level = levels.find(l => {
    return logger[`is${l}Enabled`]();
  });

  return log_level ? log_level.toLowerCase() : null;
}

const logger = {
  getLogger(filename: string) {
    let r = relative(import.meta.url, filename);
    let log_name = r.replaceAll('../', '').replace(/\/?[\w-_]+\.js/, '').replaceAll('/', '.');
    let logger = log4js.getLogger(log_name);
    let log_level = getConfiguredLevel(logger);

    if (!log_level) {
      logdebug.warn(`Logger ${log_name} not configured. Using default`);
      log_name = 'default';
      logger = defaultlog;
      log_level = getConfiguredLevel(defaultlog);
    }

    logdebug.info(`Using logger "${log_name}" (${log_level.toLowerCase()}) for file ${r}`);

    return logger;
  }
}

// let testlog = logger.getLogger(import.meta.url);
// testlog.info('I am the logger');

export { logger as default, difflog };

