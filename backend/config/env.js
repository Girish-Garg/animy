import { z } from "zod";

// Schema for the backend's environment. Required vars fail startup if missing;
// optional ones are validated only when present.
const envSchema = z.object({
  MONGO_URI: z.string().min(1, "is required (MongoDB connection string)"),
  CLERK_SECRET_KEY: z.string().min(1, "is required (Clerk secret key)"),
  CLERK_PUBLISHABLE_KEY: z.string().min(1, "is required (Clerk publishable key)"),
  Video_API_BASE_URL: z.string().url("must be a valid URL (external video API base)"),

  PORT: z.coerce.number().int().positive().default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  FRONTEND_URL: z.string().url().optional(),
  SENTRY_DSN: z.string().optional(),
  CORS_EXTRA_ORIGINS: z.string().optional(),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
}).passthrough();

/**
 * Validates the environment and returns the parsed config. Throws an Error with
 * a readable, multi-line message listing every problem (so a misconfigured
 * deploy fails fast with a clear reason instead of a cryptic runtime error).
 */
export function validateEnv(env = process.env) {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid or missing environment variables:\n${details}`);
  }
  return result.data;
}
