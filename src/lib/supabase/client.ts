import { createBrowserClient } from '@supabase/ssr';

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (supabaseClient) return supabaseClient;

  const isPublicDevice = typeof window !== 'undefined' 
    ? sessionStorage.getItem('is_public_device') === 'true'
    : false;

  supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: !isPublicDevice,
        storage: isPublicDevice ? {
          getItem: (key) => sessionStorage.getItem(key),
          setItem: (key, value) => sessionStorage.setItem(key, value),
          removeItem: (key) => sessionStorage.removeItem(key),
        } : undefined,
      },
    }
  );

  return supabaseClient;
}

export function resetClient() {
  supabaseClient = null;
}
