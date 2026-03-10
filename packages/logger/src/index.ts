export interface Logger {
  info(message: string, context?: Record<string, string | number | boolean>): void;
  warn(message: string, context?: Record<string, string | number | boolean>): void;
  error(message: string, context?: Record<string, string | number | boolean>): void;
}

export const consoleLogger: Logger = {
  info(message, context) {
    console.info(message, context ?? {});
  },
  warn(message, context) {
    console.warn(message, context ?? {});
  },
  error(message, context) {
    console.error(message, context ?? {});
  }
};
