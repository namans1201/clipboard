'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, resetClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clipboard, Lock } from 'lucide-react';
import { toast } from 'sonner';

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
      // Set public device flag BEFORE creating client
      if (isPublicDevice) {
        sessionStorage.setItem('is_public_device', 'true');
      } else {
        sessionStorage.removeItem('is_public_device');
      }

      // Reset client to pick up new storage settings
      resetClient();
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Clipboard className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Clipboard Easy</CardTitle>
          <CardDescription>
            Sign in to access your clips across devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="youremail@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
              <Checkbox
                id="publicDevice"
                checked={isPublicDevice}
                onCheckedChange={(checked) => setIsPublicDevice(checked === true)}
              />
              <div className="flex-1">
                <label
                  htmlFor="publicDevice"
                  className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  This is a public/shared device
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  Session will expire on inactivity and tab close
                </p>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
