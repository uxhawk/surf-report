/**
 * Base URL for Supabase auth redirects (OAuth, signup email, password reset `redirectTo`).
 * Must be listed in Supabase → Authentication → URL Configuration → Redirect URLs.
 *
 * If sign-in on another device (e.g. phone over LAN) still sends you to production,
 * that URL is not allowlisted. Add the exact base (see SETUP.md) or set
 * VITE_AUTH_REDIRECT_TO in .env.local to a stable URL you add there (e.g. nip.io).
 */
export function getAuthRedirectBaseUrl() {
  const explicit = import.meta.env.VITE_AUTH_REDIRECT_TO
  if (typeof explicit === 'string' && explicit.trim() !== '') {
    const t = explicit.trim()
    return t.endsWith('/') ? t : `${t}/`
  }
  return new URL(import.meta.env.BASE_URL, window.location.origin).href
}
