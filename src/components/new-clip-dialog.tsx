'use client';

import { useState, useRef } from 'react';
import { Group } from '@/types/database';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, ClipboardPaste, Maximize2, Minimize2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface NewClipDialogProps {
  groups: Group[];
  onCreateClip: (content: string, title?: string, groupId?: string) => Promise<void>;
}

export function NewClipDialog({ groups, onCreateClip }: NewClipDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setContent(text);
      toast.success('Pasted from clipboard');
    } catch {
      toast.error('Failed to read clipboard. Please paste manually.');
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!content.trim()) {
      toast.error('Content is required');
      return;
    }

    setIsLoading(true);
    try {
      await onCreateClip(content, title || undefined, groupId);
      setTitle('');
      setContent('');
      setGroupId(undefined);
      setIsFullscreen(false);
      setOpen(false);
      toast.success('Clip created!');
    } catch (error) {
      toast.error('Failed to create clip');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setTitle('');
      setContent('');
      setGroupId(undefined);
      setIsFullscreen(false);
    }
    setOpen(newOpen);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter to save, Shift+Enter for new line
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (content.trim()) {
        handleSubmit();
      }
    }
    // Shift+Enter allows default textarea behavior (new line)
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className="inline-flex items-center justify-center h-10 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
        <Plus className="h-4 w-4 mr-2" />
        New Clip
      </DialogTrigger>
      <DialogContent className={cn(
        'flex flex-col transition-all duration-200',
        isFullscreen 
          ? 'max-w-[95vw] w-[95vw] h-[90vh] max-h-[90vh]' 
          : 'max-w-lg max-h-[85vh]'
      )}>
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between pr-8">
            <span>Create New Clip</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 space-y-4">
          <div className="space-y-2 flex-shrink-0">
            <Label htmlFor="newTitle">Title (optional)</Label>
            <Input
              id="newTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title..."
            />
          </div>

          <div className="space-y-2 flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between flex-shrink-0">
              <Label htmlFor="newContent">Content</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Enter to save, Shift+Enter for new line
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handlePasteFromClipboard}
                >
                  <ClipboardPaste className="h-4 w-4 mr-1" />
                  Paste
                </Button>
              </div>
            </div>
            <Textarea
              ref={textareaRef}
              id="newContent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste your content here..."
              className={cn(
                'font-mono resize-none flex-1',
                isFullscreen ? 'min-h-[300px]' : 'min-h-[150px] max-h-[40vh]'
              )}
              required
            />
          </div>

          <div className="space-y-2 flex-shrink-0">
            <Label>Group (optional)</Label>
            <select
              value={groupId || ''}
              onChange={(e) => setGroupId(e.target.value || undefined)}
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

          <div className="flex justify-end gap-2 flex-shrink-0 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !content.trim()}>
              {isLoading ? 'Creating...' : 'Create Clip'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
