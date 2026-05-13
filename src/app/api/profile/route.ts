import { NextResponse } from 'next/server';
import type { ProfileData } from '@/components/profile-card';

/**
 * GET /api/profile
 * Returns the public profile shown in the login-page profile-card popup.
 * No auth — this is public-facing visitor info.
 */

const PROFILE: ProfileData = {
  name: 'Naman Shrimal',
  tagline: 'AI/ML & Full-Stack',
  avatar: '/naman-avatar.png',
  socials: {
    website:  'https://naman1201.vercel.app/',
    github:   'https://github.com/Namans12',
    linkedin: 'https://linkedin.com/in/naman-shrimal12/',
  },
};

/** Runtime-validate the shape so a bad edit here doesn't ship malformed JSON. */
function validate(p: ProfileData): string | null {
  if (typeof p.name    !== 'string' || !p.name.trim())    return 'name missing';
  if (typeof p.tagline !== 'string' || !p.tagline.trim()) return 'tagline missing';
  if (typeof p.avatar  !== 'string' || !p.avatar.startsWith('/')) return 'avatar must be a local path';
  if (!p.socials || typeof p.socials !== 'object')        return 'socials missing';
  for (const [k, v] of Object.entries(p.socials)) {
    if (v !== undefined && (typeof v !== 'string' || !/^https?:\/\//i.test(v))) {
      return `socials.${k} must be an http(s) URL`;
    }
  }
  return null;
}

export async function GET() {
  try {
    const err = validate(PROFILE);
    if (err) {
      return NextResponse.json(
        { error: `Profile validation failed: ${err}` },
        { status: 500 },
      );
    }
    return NextResponse.json(PROFILE, {
      status: 200,
      headers: {
        // Public, cache-friendly — profile doesn't change often
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
