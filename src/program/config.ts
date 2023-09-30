export interface LogAppenders {
  [name: string]: {
    type: string;
    layout?: {
      type: string;
    }
  }
}

type LogLevels = "trace" | "debug" | "info" | "warn" | "error" | "fatal" | "diff" | "added" | "removed" | "success" | "default" | "off"

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
