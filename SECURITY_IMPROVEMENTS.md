# Security Recommendations for Public Device Mode

## Current Implementation ✅
- Session cookies (no max-age/expires)
- Auto-cleanup on pagehide event
- Panic lock button
- Auto-lock after 5 minutes
- Blur on tab hidden

## Additional Server-Side Hardening 🔒

### 1. Server-Enforced Short Sessions
Create a Supabase Edge Function to enforce short-lived sessions:

```typescript
// supabase/functions/create-public-session/index.ts
import { createClient } from '@supabase/supabase-js'

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { email, password } = await req.json()

  // Sign in
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) return Response.json({ error }, { status: 401 })

  // Set session to expire in 15 minutes for public devices
  await supabase.auth.admin.updateUserById(
    data.user.id,
    {
      app_metadata: {
        public_device_session: true,
        session_expires_at: Date.now() + (15 * 60 * 1000) // 15 minutes
      }
    }
  )

  return Response.json({ data })
})
```

### 2. Row-Level Security Time-Based Policies

Add time-check to RLS policies:

```sql
-- Update clips policy
CREATE POLICY "Users can view their own clips with time check"
    ON public.clips FOR SELECT
    USING (
        auth.uid() = user_id 
        AND (
            (auth.jwt() -> 'app_metadata' ->> 'public_device_session')::boolean IS NOT TRUE
            OR (auth.jwt() -> 'app_metadata' ->> 'session_expires_at')::bigint > EXTRACT(EPOCH FROM NOW()) * 1000
        )
    );
```

### 3. Middleware Session Validation

Add to `src/lib/supabase/middleware.ts`:

```typescript
export async function validateSession(request: NextRequest) {
  const supabase = createServerClient(...)
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    const metadata = session.user.app_metadata
    if (metadata.public_device_session) {
      const expiresAt = metadata.session_expires_at
      if (Date.now() > expiresAt) {
        await supabase.auth.signOut()
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }
  }
}
```

### 4. Client-Side Session Heartbeat

Check session validity on interval:

```typescript
// src/hooks/use-session-heartbeat.ts
export function useSessionHeartbeat() {
  useEffect(() => {
    if (!isPublicDevice()) return

    const interval = setInterval(async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getSession()
      
      if (data.session) {
        const expiresAt = data.session.user.app_metadata.session_expires_at
        if (Date.now() > expiresAt) {
          await supabase.auth.signOut()
          window.location.href = '/login'
        }
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])
}
```

### 5. Inactivity Detection Enhancement

Current: 5 minute auto-lock (client-side only)
Better: Server tracks last activity

```sql
-- Add to users table
ALTER TABLE auth.users ADD COLUMN last_activity_at TIMESTAMPTZ DEFAULT NOW();

-- Create function to update activity
CREATE OR REPLACE FUNCTION update_user_activity()
RETURNS void AS $$
BEGIN
  UPDATE auth.users
  SET last_activity_at = NOW()
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Call from middleware on each request
```

### 6. IP Address Binding (Advanced)

```typescript
// Store IP on login
const clientIP = request.headers.get('x-forwarded-for')
await supabase.auth.admin.updateUserById(userId, {
  app_metadata: {
    public_device_ip: clientIP
  }
})

// Validate on each request
if (session.user.app_metadata.public_device_ip !== currentIP) {
  // Session hijacking detected
  await supabase.auth.signOut()
}
```

## Implementation Priority

### High Priority (Implement First):
1. ✅ Session cookies (already done)
2. ✅ Panic lock (already done)
3. ✅ Auto-lock (already done)
4. **Server-enforced session expiry** (15 minutes)
5. **RLS time-based policies**

### Medium Priority:
6. Session heartbeat validation
7. Middleware session checks
8. Last activity tracking

### Low Priority (If Needed):
9. IP address binding
10. Device fingerprinting
11. Multi-factor authentication requirement

## Current Security Score: 7/10

With server-enforced sessions: **9/10**

## Notes

**Why server-side is critical:**
- Client-side security can be bypassed
- Browser lifecycle events are unreliable
- Cookies can be manually copied
- Server is the source of truth

**Trade-offs:**
- Server enforcement = more complexity
- But: Much better security posture
- Worth it if public device mode is important

## Quick Win: Add This Now

In `src/lib/supabase/client.ts`:

```typescript
// Add session expiry metadata on login
export async function loginPublicDevice(email: string, password: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error

  // Mark session as public device with expiry
  const expiresAt = Date.now() + (15 * 60 * 1000) // 15 min
  await supabase.auth.updateUser({
    data: {
      public_device_session: true,
      session_expires_at: expiresAt
    }
  })

  return data
}
```

This provides server-trackable metadata without Edge Functions!
