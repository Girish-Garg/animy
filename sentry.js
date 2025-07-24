import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://7602a9b3f72e16262ed8a1433b43489d@o4509724094431232.ingest.us.sentry.io/4509724099346432",
  integrations: [Sentry.browserTracingIntegration(),],
  tracesSampleRate: 0.2,
});
