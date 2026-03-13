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

const envLogLevel =
  typeof process !== "undefined"
    ? ((process.env.HTML_GENERATOR_LOG_LEVEL as LogLevel | undefined) ??
      undefined)
    : undefined;
const defaultLevel: LogLevel = envLogLevel ?? "info";

function writeStdout(message: string) {
  if (typeof process !== "undefined" && process?.stdout?.write) {
    process.stdout.write(`${message}\n`);
    return;
  }
  if (typeof console !== "undefined" && console.log) {
    console.log(message);
  }
}

function writeStderr(message: string) {
  if (typeof process !== "undefined" && process?.stderr?.write) {
    process.stderr.write(`${message}\n`);
    return;
  }
  if (typeof console !== "undefined" && console.error) {
    console.error(message);
  }
}

export const createLogger = (scope: string): Logger => {
  const minWeight = levelWeights[defaultLevel];

  return {
    debug(message: string) {
      if (levelWeights.debug >= minWeight) {
        writeStdout(format(scope, "debug", message));
      }
    },
    info(message: string) {
      if (levelWeights.info >= minWeight) {
        writeStdout(format(scope, "info", message));
      }
    },
    warn(message: string) {
      if (levelWeights.warn >= minWeight) {
        writeStderr(format(scope, "warn", message));
      }
    },
    error(message: string) {
      if (levelWeights.error >= minWeight) {
        writeStderr(format(scope, "error", message));
      }
    },
  };
};
