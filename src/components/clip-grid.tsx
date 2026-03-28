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
}: ClipGridProps) {
  if (clips.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 contain-layout">
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
        />
      ))}
    </div>
  );
}

export const ClipGrid = memo(ClipGridComponent);
