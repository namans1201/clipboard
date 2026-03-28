'use client';

import { useState, useEffect } from 'react';
import { Clip, Group } from '@/types/database';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Pin, Trash2, Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ClipEditorProps {
  clip: Clip | null;
  groups: Group[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (id: string, updates: Partial<Pick<Clip, 'content' | 'title' | 'group_id' | 'is_pinned'>>) => void;
  onTogglePin?: (id: string, isPinned: boolean) => void;
  onDelete?: (id: string) => void;
}

export function ClipEditor({
  clip,
  groups,
  open,
  onOpenChange,
  onUpdate,
  onTogglePin,
  onDelete,
}: ClipEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [groupId, setGroupId] = useState<string | null>(null);

  useEffect(() => {
    if (clip) {
      setTitle(clip.title || '');
      setContent(clip.content);
      setGroupId(clip.group_id);
      setIsEditing(false);
    }
  }, [clip]);

  if (!clip) return null;

  const selectedGroup = groups.find((g) => g.id === groupId);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(clip.content);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleSave = () => {
    onUpdate?.(clip.id, {
      title: title || null,
      content,
      group_id: groupId,
    });
    setIsEditing(false);
    toast.success('Clip updated');
  };

  const handleCancel = () => {
    setTitle(clip.title || '');
    setContent(clip.content);
    setGroupId(clip.group_id);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete?.(clip.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Clip Details</span>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <>
                  <Button variant="ghost" size="icon" onClick={handleCopy} title="Copy">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onTogglePin?.(clip.id, clip.is_pinned)}
                    title={clip.is_pinned ? 'Unpin' : 'Pin'}
                  >
                    <Pin className={cn('h-4 w-4', clip.is_pinned && 'fill-current')} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} title="Edit">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={handleDelete} title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="icon" onClick={handleSave} title="Save">
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleCancel} title="Cancel">
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Title (optional)</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px] font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label>Group</Label>
                <select
                  value={groupId || ''}
                  onChange={(e) => setGroupId(e.target.value || null)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">No group</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              {clip.title && (
                <div>
                  <Label className="text-muted-foreground text-xs">Title</Label>
                  <p className="font-medium">{clip.title}</p>
                </div>
              )}

              {selectedGroup && (
                <div>
                  <Label className="text-muted-foreground text-xs">Group</Label>
                  <p className="font-medium">{selectedGroup.name}</p>
                </div>
              )}

              <div>
                <Label className="text-muted-foreground text-xs">Content</Label>
                <pre className="mt-1 p-4 bg-muted rounded-md whitespace-pre-wrap break-words font-mono text-sm max-h-[400px] overflow-auto">
                  {clip.content}
                </pre>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
