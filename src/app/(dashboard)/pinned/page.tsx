'use client';

import { useState, useMemo, useTransition } from 'react';
import { useClips } from '@/hooks/use-clips';
import { useGroups } from '@/hooks/use-groups';
import { ClipGrid } from '@/components/clip-grid';
import { ClipGridSkeleton } from '@/components/clip-card-skeleton';
import { ClipEditor } from '@/components/clip-editor';
import { SearchBar } from '@/components/search-bar';
import { Clip } from '@/types/database';
import { Pin } from 'lucide-react';

export default function PinnedPage() {
  const { clips, loading, updateClip, togglePin, softDelete } = useClips({ showPinned: true });
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

  const handleSearchChange = (value: string) => {
    startTransition(() => {
      setSearchQuery(value);
    });
  };

  const handleClipClick = (clip: Clip) => {
    startTransition(() => {
      setSelectedClip(clip);
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Pin className="h-6 w-6 animate-pulse" />
            <div className="h-8 bg-muted rounded w-48 animate-pulse" />
          </div>
          <div className="h-10 bg-muted rounded w-64 animate-pulse" />
          <ClipGridSkeleton count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 smooth-scroll">
      <div className="flex items-center gap-3">
        <Pin className="h-5 w-5 sm:h-6 sm:w-6" />
        <h1 className="text-xl sm:text-2xl font-semibold">Pinned Clips</h1>
      </div>

      <div className="max-w-md">
        <SearchBar value={searchQuery} onChange={handleSearchChange} />
      </div>

      {isPending && <div className="h-1 bg-primary/20 animate-pulse rounded" />}

      <ClipGrid
        clips={filteredClips}
        groups={groups}
        onTogglePin={togglePin}
        onDelete={softDelete}
        onClipClick={handleClipClick}
        emptyMessage={searchQuery ? 'No pinned clips match your search' : 'No pinned clips yet'}
      />

      <ClipEditor
        key={selectedClip?.id ?? 'empty'}
        clip={selectedClip}
        groups={groups}
        open={!!selectedClip}
        onOpenChange={(open) => !open && setSelectedClip(null)}
        onUpdate={updateClip}
        onTogglePin={togglePin}
        onDelete={async (id) => {
          await softDelete(id);
          setSelectedClip(null);
        }}
      />
    </div>
  );
}
