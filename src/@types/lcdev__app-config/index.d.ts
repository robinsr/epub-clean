// AUTO GENERATED CODE
// Run app-config with 'generate' command to regenerate this file

import '@app-config/main';

export interface Config {
  logging: Logging;
}

export interface Logging {
  log_level: LogLevel;
}

export enum LogLevel {
  Debug = 'debug',
  Error = 'error',
  Fatal = 'fatal',
  Info = 'info',
  Off = 'off',
  Warn = 'warn',
}

// augment the default export from app-config
declare module '@app-config/main' {
  export interface ExportedConfig extends Config {}
}
