import { stdout } from 'node:process';
import { basename, relative } from 'node:path';
import { install } from 'source-map-support'
import colors from 'colors';
import * as R from 'remeda';
import log4js from 'log4js';
import { LoggingEvent } from 'log4js';
import { callerFn, getSourceTS }  from './caller.js';
import { flags, log_config, LogLevels } from './config.js';
import { point, json } from './string.js';

install();

const debug_log_level = log_config.categories['debug_log'].level;

if (debug_log_level !== 'off') {
  console.log(point(`Debug logging enabled at ${debug_log_level}`, 5));
}

const caller = callerFn(import.meta.url);

let themeMap = R.pipe(log_config.levels,
  R.mapValues((val) => val.theme)
);

colors.setTheme(themeMap);

let levels = R.pipe(log_config.levels,
  R.mapValues((val) => ({ ...val, colour: 'cyan' }))
);

log4js.addLayout('console_layout', config => (log_event: LoggingEvent) => {
  let debug_logger = log4js.getLogger('debug_log');
  let level = log_event.level.levelStr;
  let level_config = log_config.levels[level.toLowerCase()];
  let color_code = level.toLowerCase() || 'default';
  let call_location = 'unknown';

  if (debug_logger.isTraceEnabled()) {
    // Do not use debug_logger directly here; will create infinite loop!
    console.log('Logging event:', json(log_event));
  }

  if (log_event.fileName) {
    let source = getSourceTS({
      source: log_event.fileName,
      line: log_event.lineNumber,
      column: log_event.columnNumber
    });

    call_location = `${basename(source.source)}:${source.line}`;
  }

  return [
    level_config.prefix[color_code],
    colors.gray(`(${log_event.categoryName}) ${call_location}:`),
    // log_event.data.flat().map(json).join(' ')
    log_event.data.map(json).join(' ')
  ].join(' ');
});


log4js.configure({ ...log_config, levels });

const default_logger = log4js.getLogger('app');
const debug_logger = log4js.getLogger('debug_log');

debug_logger.debug('Logging config', { ...log_config, levels });


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

const getConfiguredLevel = (logger: log4js.Logger): LogLevels => {
  let levels = Object.keys(log_config.levels) as LogLevels[];
  let log_level = levels.find(lev => {
    return logger.isLevelEnabled(lev);
  });

  return log_level || 'off';
}

const logger = {
  getLogger(filename: string) {
    let r = relative(import.meta.url, filename);
    let log_name = r.replaceAll('../', '').replace(/\/?[\w-_]+\.js/, '').replaceAll('/', '.');
    let logger = log4js.getLogger(log_name);
    let log_level = getConfiguredLevel(logger);

    if (!log_level) {
      log_level = getConfiguredLevel(default_logger);
      debug_logger.warn(`Logger ${log_name} not configured. Using "default" (${log_level})`);
      return default_logger;
    }

    debug_logger.info(`Using logger "${log_name}" (${log_level.toLowerCase()}) for file ${r}`);

    return logger;
  }
}

// let testlog = logger.getLogger(import.meta.url);
// testlog.info('I am the logger');

export { logger as default, difflog };

