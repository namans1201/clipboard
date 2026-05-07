'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = resolvedTheme === 'dark';

  return (
    <Wrapper>
      <div
        className={`tdnn${isDark ? '' : ' day'}`}
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        role="button"
        tabIndex={0}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        onKeyDown={(e) => e.key === 'Enter' && setTheme(isDark ? 'light' : 'dark')}
      >
        <div className={`moon${isDark ? '' : ' sun'}`} />
      </div>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: fixed;
  top: 16px;
  right: 20px;
  z-index: 50;

  .tdnn {
    /* scale the whole toggle via font-size */
    font-size: 18%;
    cursor: pointer;
    position: relative;
    height: var(--toggleHeight, 16em);
    width:  var(--toggleWidth,  30em);
    border-radius: var(--toggleHeight, 16em);
    transition: all 500ms ease-in-out;
    background: #423966;
    outline: none;
  }

  .tdnn:focus-visible {
    box-shadow: 0 0 0 3px rgba(100, 160, 255, 0.6);
  }

  .day {
    background: #FFBF71;
  }

  .moon {
    position: absolute;
    display: block;
    border-radius: 50%;
    transition: all 400ms ease-in-out;

    top: 3em;
    left: 3em;
    transform: rotate(-75deg);
    width:  10em;
    height: 10em;
    background: #423966;
    box-shadow:
      3em 2.5em 0 0em #D9FBFF inset,
      rgba(255,255,255,.1)  0em  -7em 0 -4.5em,
      rgba(255,255,255,.1)  3em   7em 0 -4.5em,
      rgba(255,255,255,.1)  2em  13em 0 -4em,
      rgba(255,255,255,.1)  6em   2em 0 -4.1em,
      rgba(255,255,255,.1)  8em   8em 0 -4.5em,
      rgba(255,255,255,.1)  6em  13em 0 -4.5em,
      rgba(255,255,255,.1) -4em   7em 0 -4.5em,
      rgba(255,255,255,.1) -1em  10em 0 -4.5em;
  }

  .sun {
    top: 4.5em;
    left: 18em;
    transform: rotate(0deg);
    width:  7em;
    height: 7em;
    background: #fff;
    box-shadow:
      3em 3em 0 5em #fff inset,
      0    -5em 0 -2.7em #fff,
      3.5em -3.5em 0 -3em  #fff,
      5em    0    0 -2.7em #fff,
      3.5em  3.5em 0 -3em  #fff,
      0      5em  0 -2.7em #fff,
      -3.5em 3.5em 0 -3em  #fff,
      -5em   0    0 -2.7em #fff,
      -3.5em -3.5em 0 -3em #fff;
  }
`;
