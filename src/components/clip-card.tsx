'use client';

import { memo } from 'react';
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
  onTogglePin?: (id: string, isPinned: boolean) => void;
  onDelete?: (id: string) => void;
  onRestore?: (id: string) => void;
  onPermanentDelete?: (id: string) => void;
  onClick?: (clip: Clip) => void;
  isTrashView?: boolean;
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

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(clip.content);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleTogglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTogglePin?.(clip.id, clip.is_pinned);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(clip.id);
  };

  const handleRestore = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRestore?.(clip.id);
  };

  const handlePermanentDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPermanentDelete?.(clip.id);
  };

  const previewContent = clip.content.slice(0, 200) + (clip.content.length > 200 ? '...' : '');

  return (
    <Card
      className={cn(
        'cursor-pointer hover:border-primary/50 transition-colors relative group',
        clip.is_pinned && 'border-primary/30 bg-primary/5'
      )}
      onClick={() => onClick?.(clip)}
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

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {group && (
            <Badge variant="secondary" className="text-xs">
              {group.name}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(clip.created_at), { addSuffix: true })}
          </span>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity will-change-opacity">
          {isTrashView ? (
            <>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRestore} title="Restore">
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handlePermanentDelete} title="Delete permanently">
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy} title="Copy">
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleTogglePin} title={clip.is_pinned ? 'Unpin' : 'Pin'}>
                <Pin className={cn('h-4 w-4', clip.is_pinned && 'fill-current')} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleDelete} title="Delete">
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
