'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Clipboard, Pin, FolderPlus, Plus, Menu } from 'lucide-react';
import { TrashButton } from '@/components/trash-button';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useGroups } from '@/hooks/use-groups';
import { useCompact } from '@/contexts/compact-context';
import { CompactToggle } from '@/components/compact-toggle';
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
import { SidebarToggle } from '@/components/sidebar-toggle';
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { groups, createGroup } = useGroups();
  const { compact, setCompact } = useCompact();
  const [newGroupName, setNewGroupName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

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
      if (error instanceof Error && error.message !== 'Duplicate group name') {
        toast.error('Failed to create group');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const navItems = [
    { href: '/',       label: 'All Clips', icon: Clipboard },
    { href: '/pinned', label: 'Pinned',    icon: Pin       },
  ];

  return (
    <>
      {/* ── Header: logo + compact toggle ── */}
      <div className="p-4 border-b flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 transition-transform hover:scale-105"
          onClick={onNavigate}
        >
          <Image
            src="/logo.png"
            alt="ClipClap Logo"
            width={52}
            height={52}
            className="w-14 h-14 object-contain bg-transparent border-0 shadow-none"
            priority
            unoptimized
          />
          <span className="font-semibold text-lg">ClipClap</span>
        </Link>

        {/* grid / list view toggle */}
        <CompactToggle checked={compact} onChange={setCompact} />
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
                      {isCreating ? 'Creating…' : 'Create'}
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

      {/* ── Bottom: Trash only (Lock moved to top-right corner) ── */}
      <div className="p-3 border-t">
        <TrashButton onClick={onNavigate} />
      </div>
    </>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed]   = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger
          aria-label="Open navigation menu"
          className="md:hidden fixed top-4 left-4 z-50 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:pointer-events-none bg-background/80 backdrop-blur-sm shadow-md hover:bg-accent hover:text-accent-foreground h-10 w-10"
        >
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <aside className="flex flex-col h-full bg-sidebar">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar — width animates between 16rem (open) and 0 (collapsed) */}
      <aside
        className={cn(
          'hidden md:flex border-r bg-sidebar flex-col h-screen gpu-accelerated overflow-hidden',
          'transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          collapsed ? 'w-0 border-r-0' : 'w-64',
        )}
        aria-hidden={collapsed}
      >
        <SidebarContent />
      </aside>

      {/* Neomorphic toggle — vertically centred on the sidebar's right edge */}
      <SidebarToggle
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />
    </>
  );
}
