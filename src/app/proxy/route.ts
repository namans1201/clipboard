import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function GET(request: NextRequest) {
  return await updateSession(request);
}
