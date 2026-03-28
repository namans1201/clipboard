'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Clipboard, Pin, Trash2, FolderPlus, Lock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useGroups } from '@/hooks/use-groups';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
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

export function Sidebar() {
  const pathname = usePathname();
  const { groups, createGroup } = useGroups();
  const [newGroupName, setNewGroupName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handlePanicLock = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    
    try {
      await createGroup(newGroupName.trim());
      setNewGroupName('');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  const navItems = [
    { href: '/', label: 'All Clips', icon: Clipboard },
    { href: '/pinned', label: 'Pinned', icon: Pin },
    { href: '/trash', label: 'Trash', icon: Trash2 },
  ];

  return (
    <aside className="w-64 border-r bg-sidebar flex flex-col h-screen gpu-accelerated">
      <div className="p-4 border-b">
        <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105">
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
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Separator className="my-4" />

        <div className="space-y-2">
          <div className="flex items-center justify-between px-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Groups
            </span>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger className="inline-flex items-center justify-center h-6 w-6 rounded-md hover:bg-sidebar-accent/50 transition-colors">
                <Plus className="h-4 w-4" />
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Group</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="groupName">Group Name</Label>
                    <Input
                      id="groupName"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="e.g., Datastack"
                      autoFocus
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <nav className="space-y-1">
            {groups.map((group) => {
              const isActive = pathname === `/group/${group.id}`;
              return (
                <Link
                  key={group.id}
                  href={`/group/${group.id}`}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  )}
                >
                  <FolderPlus className="h-4 w-4" />
                  {group.name}
                </Link>
              );
            })}
            {groups.length === 0 && (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                No groups yet
              </p>
            )}
          </nav>
        </div>
      </ScrollArea>

      <div className="p-3 border-t space-y-2">
        <Button
          variant="destructive"
          className="w-full justify-start gap-2"
          onClick={handlePanicLock}
        >
          <Lock className="h-4 w-4" />
          Lock & Logout
        </Button>
      </div>
    </aside>
  );
}
