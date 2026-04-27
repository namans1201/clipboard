'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient, resetClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import styled from 'styled-components';
import { Lock } from 'lucide-react';

const PUBLIC_DEVICE_SESSION_DURATION_MS = 15 * 60 * 1000;

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPublicDevice, setIsPublicDevice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (isPublicDevice) {
        await supabase.auth.updateUser({
          data: {
            is_public_device: true,
            public_session_expires_at: Date.now() + PUBLIC_DEVICE_SESSION_DURATION_MS,
          },
        });
      } else {
        await supabase.auth.updateUser({
          data: {
            is_public_device: false,
            public_session_expires_at: null,
          },
        });
      }

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
      <div className="login-container">
        <Suspense fallback={null}>
          <SessionExpiredNotice />
        </Suspense>

        <div className="card">
          <div className="title">Log in</div>
          <form className="form" onSubmit={handleLogin}>
            <input 
              className="input-field" 
              name="email" 
              placeholder="Email" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input 
              className="input-field" 
              name="password" 
              placeholder="Password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            <div className="shared-device">
              <label className="shared-device__label">
                <input 
                  type="checkbox" 
                  className="shared-device__checkbox" 
                  checked={isPublicDevice}
                  onChange={(e) => setIsPublicDevice(e.target.checked)}
                />
                <span className="shared-device__box"></span>
                <span className="shared-device__text flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Public/Shared Device
                </span>
              </label>
              <p className="text-[10px] text-zinc-500 mt-1.5 ml-[26px]">
                Auto-expires after 15 min & tab close
              </p>
            </div>
            
            <button className="submit-btn" type="submit" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--background);
  padding: 1rem;

  .card {
    background-color: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 32px 28px;
    width: 340px;
    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .title {
    font-size: 28px;
    font-weight: 800;
    color: var(--foreground);
    text-align: center;
    letter-spacing: -0.5px;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .input-field {
    width: 100%;
    padding: 12px 16px;
    border-radius: 8px;
    border: 2px solid var(--border);
    background-color: var(--background);
    color: var(--foreground);
    font-size: 14px;
    outline: none;
    transition: all 0.2s ease;
  }

  .input-field:focus {
    border-color: #73C0FC;
    box-shadow: 0 0 0 3px rgba(115, 192, 252, 0.2);
  }

  .input-field::placeholder {
    color: var(--muted-foreground);
  }

  .shared-device {
    margin-top: 4px;
    margin-bottom: 8px;
  }

  .shared-device__label {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
  }

  .shared-device__checkbox {
    display: none;
  }

  .shared-device__box {
    width: 16px;
    height: 16px;
    border: 2px solid var(--border);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .shared-device__checkbox:checked + .shared-device__box {
    background-color: #73C0FC;
    border-color: #73C0FC;
  }

  .shared-device__checkbox:checked + .shared-device__box::after {
    content: '';
    width: 4px;
    height: 8px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
    margin-bottom: 2px;
  }

  .shared-device__text {
    font-size: 13px;
    color: var(--foreground);
    font-weight: 500;
  }

  .submit-btn {
    background-color: var(--foreground);
    color: var(--background);
    border: none;
    border-radius: 8px;
    padding: 12px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 8px;
  }

  .submit-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    opacity: 0.9;
  }

  .submit-btn:active:not(:disabled) {
    transform: translateY(1px);
  }

  .submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;
