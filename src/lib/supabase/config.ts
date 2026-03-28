export const SUPABASE_AUTH_COOKIE_NAME = 'clipboard-easy-auth';

export function isPublicDevice() {
  return typeof window !== 'undefined' &&
    window.sessionStorage.getItem('is_public_device') === 'true';
}
