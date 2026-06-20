/**
 * Safely extracts a human-readable message from a Clerk error, preferring the
 * longMessage, then message, then a fallback. Replaces the unsafe
 * `err.errors[0].longMessage` access repeated across the auth forms.
 */
export function clerkErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  return err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || fallback;
}
