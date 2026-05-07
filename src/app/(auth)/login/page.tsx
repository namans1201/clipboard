'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { createClient, resetClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import styled from 'styled-components';
import { Lock } from 'lucide-react';

const PUBLIC_DEVICE_SESSION_DURATION_MS = 15 * 60 * 1000;

/* Extend Document type for View Transition API */
type DocWithVT = Document & {
  startViewTransition?: (cb: () => void) => { ready: Promise<void> };
};

function SessionExpiredNotice() {
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get('reason') === 'session_expired') {
      toast.warning('Your session has expired. Please sign in again.');
    }
  }, [searchParams]);
  return null;
}

export default function LoginPage() {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [isPublicDevice, setIsPublicDevice] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [mounted, setMounted]           = useState(false);
  const router                          = useRouter();
  const { resolvedTheme, setTheme }     = useTheme();

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === 'dark';

  /* Moon/sun toggle with View Transition ripple */
  const handleThemeToggle = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextDark = e.target.checked;
      const label    = (e.currentTarget as HTMLElement).closest('label');
      let x = window.innerWidth  / 2;
      let y = window.innerHeight / 2;
      if (label) {
        const r = label.getBoundingClientRect();
        x = r.left + r.width  / 2;
        y = r.top  + r.height / 2;
      }
      const apply = () => setTheme(nextDark ? 'dark' : 'light');
      const doc   = document as DocWithVT;
      if (!doc.startViewTransition) { apply(); return; }
      const vt = doc.startViewTransition(apply);
      vt.ready.then(() => {
        document.documentElement.style.setProperty('--x', `${x}px`);
        document.documentElement.style.setProperty('--y', `${y}px`);
      });
    },
    [setTheme],
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isPublicDevice) {
        sessionStorage.setItem('is_public_device', 'true');
      } else {
        sessionStorage.removeItem('is_public_device');
      }
      resetClient();
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await supabase.auth.updateUser({
        data: isPublicDevice
          ? { is_public_device: true,  public_session_expires_at: Date.now() + PUBLIC_DEVICE_SESSION_DURATION_MS }
          : { is_public_device: false, public_session_expires_at: null },
      });
      toast.success('Logged in successfully!');
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StyledWrapper>
      <Suspense fallback={null}>
        <SessionExpiredNotice />
      </Suspense>

      {/* ── Moon / Sun theme toggle ── */}
      <label className="moon-toggle" aria-label="Toggle theme">
        {mounted && (
          <input
            type="checkbox"
            checked={isDark}
            onChange={handleThemeToggle}
          />
        )}
        <div />
      </label>

      {/* ── Hero title ── */}
      <div className="title-block">
        <hr className="title-hr" />
        <section className="title-section">
          <div className="dot" /><div className="dot" />
          <div className="dot" /><div className="dot" />
          <h1>
            <strong>Clip</strong><strong>:</strong><span>:</span><span>Clap</span>
          </h1>
        </section>
        <hr className="title-hr" />
      </div>

      {/* ── Login card ── */}
      <div className="card-wrapper">
        <div className="flip-card__front">
          <div className="card-title">Log in</div>
          <form className="flip-card__form" onSubmit={handleLogin}>
            <input
              className="flip-card__input"
              name="email"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="flip-card__input"
              name="password"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="public-device">
              <label className="gl-checkbox">
                <input
                  className="gl-checkbox__input"
                  type="checkbox"
                  checked={isPublicDevice}
                  onChange={(e) => setIsPublicDevice(e.target.checked)}
                />
                <span className="gl-checkbox__box">
                  <svg className="gl-checkbox__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span className="gl-checkbox__label">
                  <Lock size={13} className="lock-icon" />
                  Public/Shared Device
                </span>
              </label>
              <p className="device-hint">Auto-expires after 15 min &amp; tab close</p>
            </div>

            <button className="flip-card__btn" type="submit" disabled={isLoading}>
              {isLoading ? 'Signing in…' : "Let's go!"}
            </button>
          </form>
        </div>
      </div>
    </StyledWrapper>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */

const StyledWrapper = styled.div`
  /* ── Light tokens ── */
  --if: #2d8cf0;
  --fc: #323232;
  --fcs: #666;
  --bg: #fff;
  --mc: #323232;
  --card-bg: lightgrey;
  --hint: #555;

  /* ── Title section tokens (from original design) ── */
  --dot-color:  hsla(230, 25%, 75%, 1);
  --line-color: hsla(230, 35%, 92.5%, 1);
  --text-top:   hsla(240, 25%, 10%, 1);
  --text-bot:   hsla(240, 25%, 25%, 1);
  --text-circle:hsla(240, 25%, 25%, 1);
  --toggle-color: hsla(230, 25%, 10%, 1);

  /* ── Dark overrides ── */
  .dark & {
    --if:  #3ca0e6;
    --fc:  #e2eaf3;
    --fcs: #7a96b8;
    --bg:  #1a2538;
    --mc:  #e2eaf3;
    --card-bg: #2c4a6e;
    --hint: #7a96b8;

    --dot-color:   hsla(230, 25%, 90%, 1);
    --line-color:  hsla(230, 25%, 15%, .75);
    --text-top:    hsla(240, 60%, 90%, 1);
    --text-bot:    hsla(240, 60%, 95%, 1);
    --text-circle: hsla(240, 60%, 95%, .15);
    --toggle-color: hsla(230, 25%, 75%, 1);
  }

  /* ── Page shell ── */
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  background-color: var(--background);
  padding: 2rem 1rem;

  /* ──────────────────────────────────────────────
     Moon / Sun toggle
  ────────────────────────────────────────────── */
  .moon-toggle {
    position: fixed;
    top: 14px;
    left: 50%;
    transform: translateX(-50%) scale(0.6);
    cursor: pointer;
    z-index: 50;
  }

  .moon-toggle input { display: none; }

  .moon-toggle input + div {
    border-radius: 50%;
    width: 36px;
    height: 36px;
    position: relative;
    box-shadow: inset 16px -16px 0 0 var(--toggle-color);
    transform: scale(1) rotate(-2deg);
    transition: box-shadow .5s ease 0s, transform .4s ease .1s;
  }

  .moon-toggle input + div::before {
    content: '';
    width: inherit;
    height: inherit;
    border-radius: inherit;
    position: absolute;
    left: 0; top: 0;
    background: light-dark(transparent, var(--toggle-color));
    transition: background .3s ease;
  }

  .moon-toggle input + div::after {
    content: '';
    width: 8px; height: 8px;
    border-radius: 50%;
    margin: -4px 0 0 -4px;
    position: absolute;
    top: 50%; left: 50%;
    box-shadow:
      0 -23px 0 var(--toggle-color), 0 23px 0 var(--toggle-color),
      23px 0 0 var(--toggle-color), -23px 0 0 var(--toggle-color),
      15px 15px 0 var(--toggle-color), -15px 15px 0 var(--toggle-color),
      15px -15px 0 var(--toggle-color), -15px -15px 0 var(--toggle-color);
    transform: scale(0);
    transition: all .3s ease;
  }

  .moon-toggle input:checked + div {
    box-shadow: inset 32px -32px 0 0 var(--background);
    transform: scale(.5) rotate(0deg);
    transition: transform .3s ease .1s, box-shadow .2s ease 0s;
  }

  .moon-toggle input:checked + div::before {
    background: var(--toggle-color);
    transition: background .3s ease .1s;
  }

  .moon-toggle input:checked + div::after {
    transform: scale(1.5);
    transition: transform .5s ease .15s;
  }

  /* ──────────────────────────────────────────────
     Hero title block
  ────────────────────────────────────────────── */
  .title-block {
    width: 100%;
  }

  .title-hr {
    border: none;
    height: 1px;
    width: 100%;
    margin: 0;
    background-color: var(--line-color);
  }

  .title-section {
    width: clamp(320px, 60vw, 780px);
    aspect-ratio: 1.55 / 0.5;
    min-height: 140px;
    margin: auto;
    text-align: center;
    place-items: center;
    display: grid;
    position: relative;
  }

  /* corner dots */
  .dot {
    height: 5px; width: 5px;
    background-color: var(--dot-color);
    position: absolute;
    z-index: 1;
    border-radius: 50%;
    box-shadow: 0 0 0 3px var(--background);

    &:nth-child(1) { top: -2px;    left: -2px;  }
    &:nth-child(2) { top: -2px;    right: -2px; }
    &:nth-child(3) { bottom: -2px; right: -2px; }
    &:nth-child(4) { bottom: -2px; left: -2px;  }
  }

  /* vertical rule lines */
  .title-section::before,
  .title-section::after {
    content: '';
    position: absolute;
    height: 100dvh;
    width: 1px;
    background-color: var(--line-color);
  }
  .title-section::before { left: 0; }
  .title-section::after  { right: 0; }

  /* h1 typography */
  h1 {
    font-family: var(--font-instrument-sans), 'Instrument Sans', sans-serif;
    font-optical-sizing: auto;
    font-weight: 700;
    font-style: normal;
    font-variation-settings: "wdth" 95;
    font-size: clamp(36px, 7vw, 80px);
    line-height: 1.05;
    margin: 0;
    text-align: left;
  }

  /* "board." — gradient text */
  h1 span {
    background-image: linear-gradient(180deg, var(--text-top) 0%, var(--text-bot) 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  /* "Clip" — circle SVG overlay */
  h1 strong {
    display: inline-block;
    color: transparent;
    background-image: url('https://assets.codepen.io/165585/circle-bg_1.svg');
    background-color: var(--text-circle);
    background-size: 400px;
    background-position: 50% 80%;
    background-blend-mode: overlay;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 0.015em;
  }

  /* ──────────────────────────────────────────────
     Login card
  ────────────────────────────────────────────── */
  .card-wrapper {
    display: flex;
    justify-content: center;
    margin-top: -2px;
  }

  .flip-card__front {
    padding: 40px 36px 36px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: var(--card-bg);
    gap: 24px;
    border-radius: 5px;
    border: 2px solid var(--mc);
    box-shadow: 6px 6px var(--mc);
    width: 400px;
  }

  .card-title {
    font-size: 32px;
    font-weight: 900;
    text-align: center;
    color: var(--fc);
  }

  .flip-card__form {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .flip-card__input {
    width: 100%;
    height: 48px;
    border-radius: 5px;
    border: 2px solid var(--mc);
    background-color: var(--bg);
    box-shadow: 4px 4px var(--mc);
    font-size: 16px;
    font-weight: 600;
    color: var(--fc);
    padding: 5px 14px;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .flip-card__input::placeholder { color: var(--fcs); opacity: 0.8; }
  .flip-card__input:focus {
    border-color: var(--if);
    box-shadow: 4px 4px var(--if);
  }

  .flip-card__btn {
    margin: 4px 0;
    width: 140px;
    height: 48px;
    border-radius: 5px;
    border: 2px solid var(--mc);
    background-color: var(--bg);
    box-shadow: 4px 4px var(--mc);
    font-size: 18px;
    font-weight: 600;
    color: var(--fc);
    cursor: pointer;
    transition: box-shadow 0.15s ease, transform 0.15s ease, opacity 0.15s ease;
  }

  .flip-card__btn:hover:not(:disabled) { opacity: 0.88; }
  .flip-card__btn:active:not(:disabled) {
    box-shadow: 0 0 var(--mc);
    transform: translate(3px, 3px);
  }
  .flip-card__btn:disabled { opacity: 0.6; cursor: not-allowed; }

  /* ──────────────────────────────────────────────
     Public device row
  ────────────────────────────────────────────── */
  .public-device {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .device-hint {
    font-size: 10px;
    color: var(--hint);
    margin-left: 30px;
  }

  /* ── gl-checkbox ── */
  .gl-checkbox {
    display: inline-flex;
    align-items: center;
    gap: 0.65rem;
    cursor: pointer;
    user-select: none;
  }

  .gl-checkbox__input {
    position: absolute;
    opacity: 0;
    width: 0; height: 0;
    pointer-events: none;
  }

  .gl-checkbox__box {
    width: 22px; height: 22px; min-width: 22px;
    border-radius: 7px;
    background: rgba(0, 0, 0, 0.04);
    border: 2px solid var(--mc);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    transition:
      background 0.3s ease, border-color 0.3s ease,
      box-shadow 0.3s ease,
      transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .gl-checkbox__box::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, rgba(200,240,96,.45) 0%, transparent 70%);
    opacity: 0;
    transform: scale(0);
    transition: opacity 0.3s ease, transform 0.4s ease;
  }

  .gl-checkbox:hover .gl-checkbox__box { border-color: #6ab0f5; transform: scale(1.06); }

  .gl-checkbox__input:checked ~ .gl-checkbox__box {
    background: linear-gradient(135deg, #c8f060, #60f0b8);
    border-color: transparent;
    box-shadow: 0 0 0 3px rgba(200,240,96,.25), 0 4px 14px rgba(200,240,96,.35);
    transform: scale(1.05);
  }
  .gl-checkbox__input:checked ~ .gl-checkbox__box::before { opacity: 1; transform: scale(1.5); }

  .gl-checkbox__check {
    width: 13px; height: 13px;
    color: #080a0f;
    stroke-dasharray: 24;
    stroke-dashoffset: 24;
    transition: stroke-dashoffset 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s;
  }
  .gl-checkbox__input:checked ~ .gl-checkbox__box .gl-checkbox__check { stroke-dashoffset: 0; }

  .gl-checkbox__label {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--fc);
    transition: color 0.25s ease;
  }
  .lock-icon { flex-shrink: 0; }
`;
