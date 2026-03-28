'use client';

import { useState, useMemo, useTransition } from 'react';
import { useClips } from '@/hooks/use-clips';
import { useGroups } from '@/hooks/use-groups';
import { ClipGrid } from '@/components/clip-grid';
import { ClipGridSkeleton } from '@/components/clip-card-skeleton';
import { SearchBar } from '@/components/search-bar';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function TrashPage() {
  const { clips, loading, restore, permanentDelete } = useClips({ showTrashed: true });
  const { groups } = useGroups();
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filteredClips = useMemo(() => {
    if (!searchQuery.trim()) return clips;
    const query = searchQuery.toLowerCase();
    return clips.filter(
      (clip) =>
        clip.content.toLowerCase().includes(query) ||
        clip.title?.toLowerCase().includes(query)
    );
  }, [clips, searchQuery]);

  const handleSearchChange = (value: string) => {
    startTransition(() => {
      setSearchQuery(value);
    });
  };

  const handlePermanentDelete = async () => {
    if (!confirmDeleteId || isDeleting) return;

    setIsDeleting(true);

    try {
      await permanentDelete(confirmDeleteId);
      setConfirmDeleteId(null);
      toast.success('Clip permanently deleted');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete clip');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Trash2 className="h-6 w-6 animate-pulse" />
            <div className="h-8 bg-muted rounded w-32 animate-pulse" />
          </div>
          <div className="h-6 bg-muted rounded w-96 animate-pulse" />
          <div className="h-10 bg-muted rounded w-64 animate-pulse" />
          <ClipGridSkeleton count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 smooth-scroll">
      <div className="flex items-center gap-3">
        <Trash2 className="h-5 w-5 sm:h-6 sm:w-6" />
        <h1 className="text-xl sm:text-2xl font-semibold">Trash</h1>
      </div>

      <p className="text-sm sm:text-base text-muted-foreground">
        Deleted clips can be restored or permanently deleted.
      </p>

      <div className="max-w-md">
        <SearchBar value={searchQuery} onChange={handleSearchChange} />
      </div>

      {isPending && <div className="h-1 bg-primary/20 animate-pulse rounded" />}

      <ClipGrid
        clips={filteredClips}
        groups={groups}
        onRestore={restore}
        onPermanentDelete={setConfirmDeleteId}
        isTrashView
        emptyMessage={searchQuery ? 'No trashed clips match your search' : 'Trash is empty'}
      />

      <Dialog open={!!confirmDeleteId} onOpenChange={() => setConfirmDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Permanently?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This clip will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handlePermanentDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
