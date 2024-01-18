import { pino } from "pino";

export enum LoggerType {
  Stdout = "stdout",
}

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
});
