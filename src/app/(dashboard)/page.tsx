'use client';

import { useMemo, useTransition, useState } from 'react';
import { useClips } from '@/hooks/use-clips';
import { useGroups } from '@/hooks/use-groups';
import { useCompact } from '@/contexts/compact-context';
import { useDebounce } from '@/hooks/use-debounce';
import { ClipGrid } from '@/components/clip-grid';
import { ClipEditor } from '@/components/clip-editor';
import { NewClipDialog } from '@/components/new-clip-dialog';
import { SearchBar } from '@/components/search-bar';
import { ErrorDisplay } from '@/components/error-display';
import { DashboardLoader } from '@/components/dashboard-loader';
import { Clip } from '@/types/database';

export default function HomePage() {
  const { clips, loading, error: clipsError, refetch: refetchClips, createClip, updateClip, togglePin, softDelete } = useClips();
  const { groups, error: groupsError } = useGroups();
  const { compact } = useCompact();
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 200);
  const [isPending, startTransition] = useTransition();

  const filteredClips = useMemo(() => {
    if (!debouncedQuery.trim()) return clips;
    const query = debouncedQuery.toLowerCase();
    return clips.filter(
      (clip) =>
        clip.content.toLowerCase().includes(query) ||
        clip.title?.toLowerCase().includes(query)
    );
  }, [clips, debouncedQuery]);

  const handleClipClick = (clip: Clip) => {
    startTransition(() => setSelectedClip(clip));
  };

  const handleSearchChange = (value: string) => {
    startTransition(() => setSearchQuery(value));
  };

  if (loading) return <DashboardLoader />;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 smooth-scroll">
      {(clipsError || groupsError) && (
        <ErrorDisplay error={clipsError || groupsError} onRetry={refetchClips} />
      )}

      {/* ── Top bar: Search + New Clip ── */}
      <div className="flex items-center gap-2 pr-[200px]">
        {/* search bar — fills available space up to a max */}
        <div className="flex-1 min-w-0">
          <SearchBar value={searchQuery} onChange={handleSearchChange} />
        </div>
        {/* + button immediately after the bar */}
        <NewClipDialog groups={groups} onCreateClip={createClip} />
      </div>

      {isPending && <div className="h-1 bg-primary/20 animate-pulse rounded" />}

      <ClipGrid
        clips={filteredClips}
        groups={groups}
        onTogglePin={togglePin}
        onDelete={softDelete}
        onClipClick={handleClipClick}
        emptyMessage={debouncedQuery ? 'No clips match your search' : 'No clips yet. Create your first clip!'}
        searchQuery={debouncedQuery}
        compact={compact}
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
