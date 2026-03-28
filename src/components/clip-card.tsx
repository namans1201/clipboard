'use client';

import { memo, useState } from 'react';
import { Clip, Group } from '@/types/database';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pin, Copy, Trash2, RotateCcw, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ClipCardProps {
  clip: Clip;
  groups: Group[];
  onTogglePin?: (id: string, isPinned: boolean) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
  onRestore?: (id: string) => Promise<void> | void;
  onPermanentDelete?: (id: string) => Promise<void> | void;
  onClick?: (clip: Clip) => void;
  isTrashView?: boolean;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function ClipCardComponent({
  clip,
  groups,
  onTogglePin,
  onDelete,
  onRestore,
  onPermanentDelete,
  onClick,
  isTrashView = false,
}: ClipCardProps) {
  const group = groups.find((g) => g.id === clip.group_id);
  const [isWorking, setIsWorking] = useState(false);

  const runAction = async (
    action: (() => Promise<void> | void) | undefined,
    fallbackMessage: string,
    successMessage?: string
  ) => {
    if (!action || isWorking) return;

    setIsWorking(true);

    try {
      await action();

      if (successMessage) {
        toast.success(successMessage);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, fallbackMessage));
    } finally {
      setIsWorking(false);
    }
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(clip.content);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleTogglePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await runAction(
      () => onTogglePin?.(clip.id, clip.is_pinned),
      'Failed to update clip',
      clip.is_pinned ? 'Clip unpinned' : 'Clip pinned'
    );
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await runAction(() => onDelete?.(clip.id), 'Failed to delete clip', 'Clip moved to trash');
  };

  const handleRestore = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await runAction(() => onRestore?.(clip.id), 'Failed to restore clip', 'Clip restored');
  };

  const handlePermanentDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPermanentDelete?.(clip.id);
  };

  const previewContent = clip.content.slice(0, 200) + (clip.content.length > 200 ? '...' : '');
  const cardLabel = `Clip: ${clip.title || previewContent.substring(0, 50)}${clip.content.length > 50 ? '...' : ''}`;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Make card keyboard accessible
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(clip);
    }
  };

  return (
    <Card
      data-testid="clip-card"
      className={cn(
        'relative group transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        onClick && 'cursor-pointer hover:border-primary/50',
        clip.is_pinned && 'border-primary/30 bg-primary/5'
      )}
      onClick={() => onClick?.(clip)}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      aria-label={cardLabel}
    >
      {clip.is_pinned && (
        <div className="absolute top-2 right-2">
          <Pin className="h-4 w-4 text-primary fill-primary" />
        </div>
      )}

      <CardContent className="p-4">
        {clip.title && (
          <h3 className="font-medium mb-2 truncate">{clip.title}</h3>
        )}
        <pre className="text-sm text-muted-foreground whitespace-pre-wrap break-words font-mono bg-muted/50 p-2 rounded max-h-32 overflow-hidden">
          {previewContent}
        </pre>
      </CardContent>

      <CardFooter className="p-3 sm:p-4 pt-0 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {group && (
            <Badge variant="secondary" className="text-xs shrink-0">
              {group.name}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground truncate">
            {formatDistanceToNow(new Date(clip.created_at), { addSuffix: true })}
          </span>
        </div>

        <div
          className={cn(
            'flex items-center gap-1 transition-opacity will-change-opacity shrink-0',
            isTrashView ? 'opacity-100' : 'opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100'
          )}
        >
          {isTrashView ? (
            <>
              <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-8 sm:w-8 touch-manipulation" onClick={handleRestore} title="Restore" disabled={isWorking}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-8 sm:w-8 text-destructive touch-manipulation" onClick={handlePermanentDelete} title="Delete permanently" disabled={isWorking}>
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-8 sm:w-8 touch-manipulation" onClick={handleCopy} title="Copy" disabled={isWorking}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-8 sm:w-8 touch-manipulation" onClick={handleTogglePin} title={clip.is_pinned ? 'Unpin' : 'Pin'} disabled={isWorking}>
                <Pin className={cn('h-4 w-4', clip.is_pinned && 'fill-current')} />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-8 sm:w-8 text-destructive touch-manipulation" onClick={handleDelete} title="Delete" disabled={isWorking}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

export const ClipCard = memo(ClipCardComponent);
