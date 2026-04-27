import { createBrowserClient } from '@supabase/ssr';
import { SUPABASE_AUTH_COOKIE_NAME, isPublicDevice } from './config';

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Returns all browser cookies as an array of { name, value } objects.
 * Returns an empty array in non-browser environments.
 */
function getBrowserCookies() {
  if (typeof document === 'undefined' || !document.cookie) {
    return [];
  }

  return document.cookie
    .split(';')
    .map((cookie) => cookie.trim())
    .filter(Boolean)
    .map((cookie) => {
      const separatorIndex = cookie.indexOf('=');
      const rawName = separatorIndex === -1 ? cookie : cookie.slice(0, separatorIndex);
      const rawValue = separatorIndex === -1 ? '' : cookie.slice(separatorIndex + 1);

      return {
        name: decodeURIComponent(rawName),
        value: decodeURIComponent(rawValue),
      };
    });
}

function serializeCookie(
  name: string,
  value: string,
  options: {
    domain?: string;
    expires?: Date;
    httpOnly?: boolean;
    maxAge?: number;
    path?: string;
    sameSite?: boolean | 'lax' | 'strict' | 'none';
    secure?: boolean;
  } = {}
) {
  const segments = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    `Path=${options.path ?? '/'}`,
  ];

  if (options.domain) {
    segments.push(`Domain=${options.domain}`);
  }

  if (typeof options.maxAge === 'number') {
    segments.push(`Max-Age=${options.maxAge}`);
  }

  if (options.expires) {
    segments.push(`Expires=${options.expires.toUTCString()}`);
  }

  if (options.sameSite) {
    const sameSiteValue =
      typeof options.sameSite === 'string'
        ? options.sameSite
        : options.sameSite === true
          ? 'strict'
          : 'lax';
    segments.push(`SameSite=${sameSiteValue}`);
  }

  if (options.secure) {
    segments.push('Secure');
  }

  if (options.httpOnly) {
    segments.push('HttpOnly');
  }

  return segments.join('; ');
}

/**
 * Writes cookies to document.cookie, respecting the device trust level.
 *
 * PUBLIC DEVICE:
 *   Strip Max-Age and Expires so the browser stores a session cookie.
 *   Session cookies are automatically deleted when the browser (not just
 *   the tab) is closed — no explicit cleanup needed.
 *
 * TRUSTED DEVICE (personal):
 *   Pass Max-Age through unchanged (Supabase SSR defaults to 400 days).
 *   The session persists across tab closes, browser restarts, and Chrome
 *   profile switches — exactly what the user wants.
 */
function setBrowserCookies(
  cookiesToSet: Array<{
    name: string;
    value: string;
    options?: {
      domain?: string;
      expires?: Date;
      httpOnly?: boolean;
      maxAge?: number;
      path?: string;
      sameSite?: boolean | 'lax' | 'strict' | 'none';
      secure?: boolean;
    };
  }>
) {
  if (typeof document === 'undefined') {
    return;
  }

  // Read the flag once per batch, not once per cookie — minor perf win.
  const isSessionOnly = isPublicDevice();

  cookiesToSet.forEach(({ name, value, options = {} }) => {
    const nextOptions = { ...options };

    if (isSessionOnly && value && nextOptions.maxAge !== 0) {
      // Public device: remove persistence markers → session cookie that
      // dies when the browser (not just the tab) is fully closed.
      delete nextOptions.maxAge;
      delete nextOptions.expires;
    }
    // Trusted device: nextOptions keeps maxAge intact → persistent cookie.

    document.cookie = serializeCookie(name, value, nextOptions);
  });
}

/**
 * Expire and delete all auth cookies for this app from document.cookie.
 * Only call this during an explicit sign-out — never on pagehide —
 * to avoid accidentally clearing cookies that are shared across tabs
 * within the same Chrome profile.
 */
export function clearAuthCookies() {
  if (typeof document === 'undefined') {
    return;
  }

  getBrowserCookies()
    .filter(
      ({ name }) =>
        name === SUPABASE_AUTH_COOKIE_NAME ||
        name.startsWith(`${SUPABASE_AUTH_COOKIE_NAME}.`)
    )
    .forEach(({ name }) => {
      document.cookie = serializeCookie(name, '', {
        expires: new Date(0),
        maxAge: 0,
        path: '/',
        sameSite: 'lax',
      });
    });
}

export function createClient() {
  if (supabaseClient) return supabaseClient;

  supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return getBrowserCookies();
        },
        setAll(cookiesToSet) {
          setBrowserCookies(cookiesToSet);
        },
      },
      cookieOptions: {
        name: SUPABASE_AUTH_COOKIE_NAME,
      },
      isSingleton: false,
    }
  );

  return supabaseClient;
}

export function resetClient() {
  supabaseClient = null;
}
