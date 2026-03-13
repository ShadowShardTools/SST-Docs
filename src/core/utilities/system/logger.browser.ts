import type { Logger } from "../../types/Logger.js";

type LogLevel = "debug" | "info" | "warn" | "error";

const levelWeights: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function format(scope: string, level: LogLevel, message: string) {
  return `[${scope}] ${level.toUpperCase()}: ${message}`;
}

const defaultLevel: LogLevel = "info";

export const createLogger = (scope: string): Logger => {
  const minWeight = levelWeights[defaultLevel];

  return {
    debug(message: string) {
      if (levelWeights.debug >= minWeight) {
        console.debug(format(scope, "debug", message));
      }
    },
    info(message: string) {
      if (levelWeights.info >= minWeight) {
        console.info(format(scope, "info", message));
      }
    },
    warn(message: string) {
      if (levelWeights.warn >= minWeight) {
        console.warn(format(scope, "warn", message));
      }
    },
    error(message: string) {
      if (levelWeights.error >= minWeight) {
        console.error(format(scope, "error", message));
      }
    },
  };
};
