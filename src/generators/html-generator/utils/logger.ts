import { stdout, stderr } from "node:process";

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

export interface Logger {
  debug(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

const defaultLevel: LogLevel =
  (process.env.HTML_GENERATOR_LOG_LEVEL as LogLevel | undefined) ?? "info";

export const createLogger = (scope: string): Logger => {
  const minWeight = levelWeights[defaultLevel];

  return {
    debug(message: string) {
      if (levelWeights.debug >= minWeight) {
        stdout.write(`${format(scope, "debug", message)}\n`);
      }
    },
    info(message: string) {
      if (levelWeights.info >= minWeight) {
        stdout.write(`${format(scope, "info", message)}\n`);
      }
    },
    warn(message: string) {
      if (levelWeights.warn >= minWeight) {
        stderr.write(`${format(scope, "warn", message)}\n`);
      }
    },
    error(message: string) {
      if (levelWeights.error >= minWeight) {
        stderr.write(`${format(scope, "error", message)}\n`);
      }
    },
  };
};
