'use client';

import { memo, useState } from 'react';
import { Clip, Group } from '@/types/database';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pin, Copy, Trash2, RotateCcw, X, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ClipCardProps {
  clip: Clip;
  groups: Group[];
  onTogglePin?: (id: string, isPinned: boolean) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
  onRestore?: (id: string) => Promise<void> | void;
  onPermanentDelete?: (id: string) => Promise<void> | void;
  onClick?: (clip: Clip) => void;
  isTrashView?: boolean;
  searchQuery?: string;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

// Highlight search text in content
function highlightText(text: string, query: string) {
  if (!query.trim()) return text;
  
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return parts.map((part, i) => 
    part.toLowerCase() === query.toLowerCase() 
      ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">{part}</mark>
      : part
  );
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
  searchQuery = '',
}: ClipCardProps) {
  const group = groups.find((g) => g.id === clip.group_id);
  const [isWorking, setIsWorking] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

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

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowQuickView(true);
  };

  // Dynamic content preview - less content = shorter card
  const contentLength = clip.content.length;
  const maxPreviewLength = contentLength < 100 ? contentLength : 200;
  const previewContent = clip.content.slice(0, maxPreviewLength) + (clip.content.length > maxPreviewLength ? '...' : '');
  
  const cardLabel = `Clip: ${clip.title || previewContent.substring(0, 50)}${clip.content.length > 50 ? '...' : ''}`;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(clip);
    }
  };

  // Determine card height class based on content
  const getContentHeightClass = () => {
    if (contentLength < 50) return 'max-h-12';
    if (contentLength < 100) return 'max-h-20';
    if (contentLength < 200) return 'max-h-28';
    return 'max-h-32';
  };

  return (
    <>
      <Card
        data-testid="clip-card"
        className={cn(
          'relative group transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 h-fit',
          onClick && 'cursor-pointer hover:border-primary/50',
          clip.is_pinned && 'border-primary/30 bg-primary/5'
        )}
        onClick={() => onClick?.(clip)}
        onKeyDown={handleKeyDown}
        tabIndex={onClick ? 0 : undefined}
        role={onClick ? 'button' : undefined}
        aria-label={cardLabel}
      >
        {/* Top right icons - Pin indicator and Quick View */}
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {!isTrashView && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
              onClick={handleQuickView}
              title="Quick view"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
          )}
          {clip.is_pinned && (
            <Pin className="h-4 w-4 text-primary fill-primary" />
          )}
        </div>

        <CardContent className="p-4 pt-3">
          {clip.title && (
            <h3 className="font-medium mb-2 truncate pr-16">
              {searchQuery ? highlightText(clip.title, searchQuery) : clip.title}
            </h3>
          )}
          <pre className={cn(
            'text-sm text-muted-foreground whitespace-pre-wrap break-words font-mono bg-muted/50 p-2 rounded overflow-hidden',
            getContentHeightClass()
          )}>
            {searchQuery ? highlightText(previewContent, searchQuery) : previewContent}
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

      {/* Quick View Dialog */}
      <Dialog open={showQuickView} onOpenChange={setShowQuickView}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{clip.title || 'Clip Preview'}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <pre className="p-4 bg-muted rounded-md whitespace-pre-wrap break-words font-mono text-sm">
              {clip.content}
            </pre>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowQuickView(false)}>
              Close
            </Button>
            <Button onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const ClipCard = memo(ClipCardComponent);
