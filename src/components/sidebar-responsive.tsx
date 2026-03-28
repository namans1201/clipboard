'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Clipboard, Pin, Trash2, FolderPlus, Lock, Plus, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useGroups } from '@/hooks/use-groups';
import { clearAuthCookies, createClient, resetClient } from '@/lib/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { groups, createGroup } = useGroups();
  const [newGroupName, setNewGroupName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleLock = async () => {
    const supabase = createClient();

    try {
      await supabase.auth.signOut();
    } finally {
      clearAuthCookies();
      resetClient();
      sessionStorage.clear();
      window.location.href = '/login';
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || isCreating) return;
    
    setIsCreating(true);
    try {
      await createGroup(newGroupName.trim());
      setNewGroupName('');
      setIsDialogOpen(false);
      toast.success('Group created!');
    } catch (error) {
      // Error toast is handled in useGroups for duplicate names
      if (error instanceof Error && error.message !== 'Duplicate group name') {
        toast.error('Failed to create group');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const navItems = [
    { href: '/', label: 'All Clips', icon: Clipboard },
    { href: '/pinned', label: 'Pinned', icon: Pin },
  ];

  return (
    <>
      <div className="p-4 border-b">
        <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105" onClick={onNavigate}>
          <Image 
            src="/logo.png" 
            alt="Clipboard Easy Logo" 
            width={32} 
            height={32}
            className="rounded"
            priority
          />
          <span className="font-semibold text-lg">Clipboard Easy</span>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3 py-4 smooth-scroll">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <Separator className="my-4" />

        <div className="space-y-2">
          <div className="flex items-center justify-between px-3">
            <span className="text-xs font-semibold text-sidebar-foreground/70 uppercase">Groups</span>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:bg-accent hover:text-accent-foreground h-6 w-6">
                <Plus className="h-3 w-3" />
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Group</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateGroup} className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <Label htmlFor="group-name">Group Name</Label>
                    <Input
                      id="group-name"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="e.g., Work, Personal"
                      autoFocus
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreating || !newGroupName.trim()}>
                      {isCreating ? 'Creating...' : 'Create'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-1">
            {groups.map((group) => {
              const isActive = pathname === `/group/${group.id}`;
              return (
                <Link
                  key={group.id}
                  href={`/group/${group.id}`}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                      : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
                  )}
                >
                  <FolderPlus className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{group.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </ScrollArea>

      {/* Bottom section with Trash and Lock */}
      <div className="p-3 border-t space-y-2">
        <Link
          href="/trash"
          onClick={onNavigate}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors w-full',
            pathname === '/trash'
              ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
              : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
          )}
        >
          <Trash2 className="h-4 w-4 flex-shrink-0" />
          <span>Trash</span>
        </Link>
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={handleLock}
        >
          <Lock className="h-4 w-4 mr-2" />
          Lock
        </Button>
      </div>
    </>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger aria-label="Open navigation menu" className="md:hidden fixed top-4 left-4 z-50 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:pointer-events-none bg-background/80 backdrop-blur-sm shadow-md hover:bg-accent hover:text-accent-foreground h-10 w-10">
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <aside className="flex flex-col h-full bg-sidebar">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r bg-sidebar flex-col h-screen gpu-accelerated">
        <SidebarContent />
      </aside>
    </>
  );
}
