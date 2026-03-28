'use client';

import { useState, useMemo } from 'react';
import { useClips } from '@/hooks/use-clips';
import { useGroups } from '@/hooks/use-groups';
import { ClipGrid } from '@/components/clip-grid';
import { ClipEditor } from '@/components/clip-editor';
import { SearchBar } from '@/components/search-bar';
import { Clip } from '@/types/database';
import { Pin } from 'lucide-react';

export default function PinnedPage() {
  const { clips, loading, updateClip, togglePin, softDelete } = useClips({ showPinned: true });
  const { groups } = useGroups();
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClips = useMemo(() => {
    if (!searchQuery.trim()) return clips;
    const query = searchQuery.toLowerCase();
    return clips.filter(
      (clip) =>
        clip.content.toLowerCase().includes(query) ||
        clip.title?.toLowerCase().includes(query)
    );
  }, [clips, searchQuery]);

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
        <Pin className="h-6 w-6" />
        <h1 className="text-2xl font-semibold">Pinned Clips</h1>
      </div>

      <div className="max-w-md">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      <ClipGrid
        clips={filteredClips}
        groups={groups}
        onTogglePin={togglePin}
        onDelete={softDelete}
        onClipClick={setSelectedClip}
        emptyMessage={searchQuery ? 'No pinned clips match your search' : 'No pinned clips yet'}
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
