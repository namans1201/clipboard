'use client';

import { useState, useMemo, useTransition } from 'react';
import { useClips } from '@/hooks/use-clips';
import { useGroups } from '@/hooks/use-groups';
import { ClipGrid } from '@/components/clip-grid';
import { ClipGridSkeleton } from '@/components/clip-card-skeleton';
import { ClipEditor } from '@/components/clip-editor';
import { NewClipDialog } from '@/components/new-clip-dialog';
import { SearchBar } from '@/components/search-bar';
import { Clip } from '@/types/database';

export default function HomePage() {
  const { clips, loading, createClip, updateClip, togglePin, softDelete } = useClips();
  const { groups } = useGroups();
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
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

  const handleClipClick = (clip: Clip) => {
    startTransition(() => {
      setSelectedClip(clip);
    });
  };

  const handleSearchChange = (value: string) => {
    startTransition(() => {
      setSearchQuery(value);
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <div className="h-10 bg-muted rounded w-64 animate-pulse" />
          <ClipGridSkeleton count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 smooth-scroll">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <SearchBar value={searchQuery} onChange={handleSearchChange} />
        </div>
        <NewClipDialog groups={groups} onCreateClip={createClip} />
      </div>

      {isPending && <div className="h-1 bg-primary/20 animate-pulse rounded" />}

      <ClipGrid
        clips={filteredClips}
        groups={groups}
        onTogglePin={togglePin}
        onDelete={softDelete}
        onClipClick={handleClipClick}
        emptyMessage={searchQuery ? 'No clips match your search' : 'No clips yet. Create your first clip!'}
      />

      <ClipEditor
        clip={selectedClip}
        groups={groups}
        open={!!selectedClip}
        onOpenChange={(open) => !open && setSelectedClip(null)}
        onUpdate={updateClip}
        onTogglePin={togglePin}
        onDelete={(id) => {
          softDelete(id);
          setSelectedClip(null);
        }}
      />
    </div>
  );
}
