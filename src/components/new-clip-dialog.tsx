'use client';

import { useState } from 'react';
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
import { Plus, ClipboardPaste } from 'lucide-react';
import { toast } from 'sonner';

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

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setContent(text);
      toast.success('Pasted from clipboard');
    } catch {
      toast.error('Failed to read clipboard. Please paste manually.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className="inline-flex items-center justify-center h-10 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
        <Plus className="h-4 w-4 mr-2" />
        New Clip
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Clip</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newTitle">Title (optional)</Label>
            <Input
              id="newTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title..."
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="newContent">Content</Label>
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
            <Textarea
              id="newContent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your content here..."
              className="min-h-[150px] font-mono"
              required
            />
          </div>

          <div className="space-y-2">
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

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Clip'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
