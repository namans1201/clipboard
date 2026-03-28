import { createBrowserClient } from '@supabase/ssr';
import { SUPABASE_AUTH_COOKIE_NAME, isPublicDevice } from './config';

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;
let cleanupBound = false;

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

  const shouldUseSessionCookies = isPublicDevice();

  cookiesToSet.forEach(({ name, value, options = {} }) => {
    const nextOptions = { ...options };

    if (shouldUseSessionCookies && value && nextOptions.maxAge !== 0) {
      delete nextOptions.maxAge;
      delete nextOptions.expires;
    }

    document.cookie = serializeCookie(name, value, nextOptions);
  });
}

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

function bindPublicDeviceCleanup() {
  if (cleanupBound || typeof window === 'undefined') {
    return;
  }

  const handlePageHide = () => {
    if (!isPublicDevice()) {
      return;
    }

    clearAuthCookies();
    resetClient();
  };

  window.addEventListener('pagehide', handlePageHide);
  cleanupBound = true;
}

export function createClient() {
  if (supabaseClient) return supabaseClient;

  bindPublicDeviceCleanup();

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
