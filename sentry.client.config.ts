import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn: SENTRY_DSN,
  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',
  // Sample rate for errors (0-1)
  tracesSampleRate: 0.1,
  // Automatically strip local variables in production
  sendDefaultPii: false,
  // Environment
  environment: process.env.NODE_ENV,
})

export default Sentry
