import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { SUPABASE_AUTH_COOKIE_NAME } from './config';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        name: SUPABASE_AUTH_COOKIE_NAME,
      },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // --- Server-enforced public-device session expiry ---
  // If the user stamped a public_session_expires_at timestamp on login and it
  // has now passed, sign them out immediately and redirect to login.
  // This enforcement runs on *every* server request, so no client-side bypass
  // is possible — even if the browser tab stays open indefinitely.
  if (user) {
    const expiresAt: number | undefined =
      user.user_metadata?.public_session_expires_at;
    const isPublicDeviceSession: boolean =
      user.user_metadata?.is_public_device === true;

    if (isPublicDeviceSession && expiresAt && Date.now() > expiresAt) {
      // Sign out server-side and redirect to login with an explanatory param.
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('reason', 'session_expired');
      const redirectResponse = NextResponse.redirect(url);
      // Clear the auth cookie so the browser session is fully terminated.
      redirectResponse.cookies.set(SUPABASE_AUTH_COOKIE_NAME, '', {
        maxAge: 0,
        path: '/',
      });
      return redirectResponse;
    }
  }

  // Protected routes – redirect to login if not authenticated
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from login
  if (user && request.nextUrl.pathname.startsWith('/login')) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
