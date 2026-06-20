import pino from "pino";

const isProd = process.env.NODE_ENV === "production";

// Structured logger: pretty + colorized in dev, JSON in prod (for log
// aggregation). Sensitive fields are redacted if they ever get logged.
const logger = pino({
  level: process.env.LOG_LEVEL || (isProd ? "info" : "debug"),
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "password",
      "newPassword",
      "currentPassword",
    ],
    censor: "[redacted]",
  },
  transport: isProd
    ? undefined
    : {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "SYS:HH:MM:ss", ignore: "pid,hostname" },
      },
});

export default logger;
