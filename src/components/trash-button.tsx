'use client';

import { useTheme } from 'next-themes';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function TrashButton({ onClick }: { onClick?: () => void }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setMounted(true);
  }, []);

  const isDark = mounted && theme === 'dark';
  const isActive = pathname === '/trash';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) onClick();
    router.push('/trash');
  };

  return (
    <>
      <button type="button" className={`trash-button ${isActive ? 'active' : ''}`} onClick={handleClick}>
        <span className="button__text">Trash</span>
        <span className="button__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width={512} viewBox="0 0 512 512" height={512} className="svg">
            <title />
            <path style={{ fill: 'none', stroke: isDark ? '#fff' : '#323232', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 32 }} d="M112,112l20,320c.95,18.49,14.4,32,32,32H348c17.67,0,30.87-13.51,32-32l20-320" />
            <line y2={112} y1={112} x2={432} x1={80} style={{ stroke: isDark ? '#fff' : '#323232', strokeLinecap: 'round', strokeMiterlimit: 10, strokeWidth: 32 }} />
            <path style={{ fill: 'none', stroke: isDark ? '#fff' : '#323232', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 32 }} d="M192,112V72h0a23.93,23.93,0,0,1,24-24h80a23.93,23.93,0,0,1,24,24h0v40" />
            <line y2={400} y1={176} x2={256} x1={256} style={{ fill: 'none', stroke: isDark ? '#fff' : '#323232', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 32 }} />
            <line y2={400} y1={176} x2={192} x1={184} style={{ fill: 'none', stroke: isDark ? '#fff' : '#323232', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 32 }} />
            <line y2={400} y1={176} x2={320} x1={328} style={{ fill: 'none', stroke: isDark ? '#fff' : '#323232', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 32 }} />
          </svg>
        </span>
      </button>
      <style dangerouslySetInnerHTML={{__html: `
        .trash-button {
          --main-focus: #2d8cf0;
          --font-color: ${isDark ? '#dedede' : '#323232'};
          --bg-color-sub: ${isDark ? '#222' : '#dedede'};
          --bg-color: ${isDark ? '#323232' : '#eee'};
          --main-color: ${isDark ? '#dedede' : '#323232'};
          position: relative;
          width: 100%;
          height: 40px;
          cursor: pointer;
          display: flex;
          align-items: center;
          border: 2px solid var(--main-color);
          box-shadow: 4px 4px var(--main-color);
          background-color: var(--bg-color);
          border-radius: 10px;
          overflow: hidden;
          transition: all 0.3s;
        }

        .trash-button.active {
          background: var(--bg-color-sub);
        }

        .trash-button .button__text {
          transform: translateX(33px);
          color: var(--font-color);
          font-weight: 600;
          transition: all 0.3s;
        }

        .trash-button .button__icon {
          position: absolute;
          transform: translateX(calc(100% + 50px));
          height: 100%;
          width: 39px;
          background-color: var(--bg-color-sub);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
          right: 0;
        }

        .trash-button .svg {
          width: 20px;
          fill: var(--main-color);
        }

        .trash-button:hover {
          background: var(--bg-color);
        }

        .trash-button:hover .button__text {
          color: transparent;
        }

        .trash-button:hover .button__icon {
          width: calc(100% - 4px);
          transform: translateX(0);
        }

        .trash-button:active {
          transform: translate(3px, 3px);
          box-shadow: 0px 0px var(--main-color);
        }
      `}} />
    </>
  );
}
