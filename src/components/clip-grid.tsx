'use client';

import { memo } from 'react';
import { Clip, Group } from '@/types/database';
import { ClipCard } from './clip-card';

interface ClipGridProps {
  clips: Clip[];
  groups: Group[];
  onTogglePin?: (id: string, isPinned: boolean) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
  onRestore?: (id: string) => Promise<void> | void;
  onPermanentDelete?: (id: string) => Promise<void> | void;
  onClipClick?: (clip: Clip) => void;
  isTrashView?: boolean;
  emptyMessage?: string;
  searchQuery?: string;
  compact?: boolean;
}

function ClipGridComponent({
  clips,
  groups,
  onTogglePin,
  onDelete,
  onRestore,
  onPermanentDelete,
  onClipClick,
  isTrashView = false,
  emptyMessage = 'No clips yet',
  searchQuery = '',
  compact = false,
}: ClipGridProps) {
  if (clips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-2">
        <span className="text-4xl">📋</span>
        <span className="text-sm">{emptyMessage}</span>
      </div>
    );
  }

  return (
    <div className={compact
      ? 'flex flex-col gap-3'
      : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start'
    }>
      {clips.map((clip) => (
        <ClipCard
          key={clip.id}
          clip={clip}
          groups={groups}
          onTogglePin={onTogglePin}
          onDelete={onDelete}
          onRestore={onRestore}
          onPermanentDelete={onPermanentDelete}
          onClick={onClipClick}
          isTrashView={isTrashView}
          searchQuery={searchQuery}
          compact={compact}
        />
      ))}
    </div>
  );
}

export const ClipGrid = memo(ClipGridComponent);
