'use client';

import { useState, useMemo } from 'react';
import { useClips } from '@/hooks/use-clips';
import { useGroups } from '@/hooks/use-groups';
import { ClipGrid } from '@/components/clip-grid';
import { SearchBar } from '@/components/search-bar';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
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

  const filteredClips = useMemo(() => {
    if (!searchQuery.trim()) return clips;
    const query = searchQuery.toLowerCase();
    return clips.filter(
      (clip) =>
        clip.content.toLowerCase().includes(query) ||
        clip.title?.toLowerCase().includes(query)
    );
  }, [clips, searchQuery]);

  const handlePermanentDelete = () => {
    if (confirmDeleteId) {
      permanentDelete(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Trash2 className="h-6 w-6" />
        <h1 className="text-2xl font-semibold">Trash</h1>
      </div>

      <p className="text-muted-foreground">
        Deleted clips can be restored or permanently deleted.
      </p>

      <div className="max-w-md">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

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
            <Button variant="destructive" onClick={handlePermanentDelete}>
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
