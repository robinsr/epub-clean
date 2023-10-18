import config from 'config';
import { point } from './string.js';

export interface LogAppenders {
  [name: string]: {
    type: string;
    layout?: {
      type: string;
    },
    [prop: string]: any;
  }
}

export type LogLevels = "trace" | "debug" | "info" | "warn" | "error" | "fatal" | "diff" | "added" | "removed" | "success" | "default" | "off"

export type LogLevelConfig = {
  [L in LogLevels]?: {
    value: number;
    prefix: string;
    theme: string | string[];
  }
}

export interface LogCategories {
  [name: string]: {
    appenders: string[],
    level: string;
    enableCallStack: boolean;
  }
}

export interface LogConfig {
  appenders: LogAppenders;
  categories: LogCategories;
  levels: LogLevelConfig;
}

export interface AppConfig {
  logging: LogConfig;
}

interface ConfigFlags {
  debug_logging: boolean;
  device: string | null;
}

console.log('Configuration directory: ' + config.util.getEnv('NODE_CONFIG_DIR'));

export const node_env = config.util.getEnv('NODE_ENV');
export const flags = <ConfigFlags>config.get('flags');
export const log_config = <LogConfig>config.get('logging');

if (node_env !== 'production') {
  console.log('Config flags:', flags);
}
