'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useClips } from '@/hooks/use-clips';
import { useGroups } from '@/hooks/use-groups';
import { ClipGrid } from '@/components/clip-grid';
import { ClipEditor } from '@/components/clip-editor';
import { NewClipDialog } from '@/components/new-clip-dialog';
import { SearchBar } from '@/components/search-bar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clip } from '@/types/database';
import { FolderOpen, Pencil, Trash2, Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function GroupPage() {
  const params = useParams();
  const groupId = params.id as string;
  
  const { clips, loading, createClip, updateClip, togglePin, softDelete } = useClips({ groupId });
  const { groups, updateGroup, deleteGroup } = useGroups();
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const group = groups.find((g) => g.id === groupId);

  const filteredClips = useMemo(() => {
    if (!searchQuery.trim()) return clips;
    const query = searchQuery.toLowerCase();
    return clips.filter(
      (clip) =>
        clip.content.toLowerCase().includes(query) ||
        clip.title?.toLowerCase().includes(query)
    );
  }, [clips, searchQuery]);

  const handleStartEdit = () => {
    if (group) {
      setEditName(group.name);
      setIsEditing(true);
    }
  };

  const handleSaveEdit = async () => {
    if (editName.trim() && group) {
      await updateGroup(group.id, editName.trim());
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName('');
  };

  const handleDeleteGroup = async () => {
    if (group) {
      await deleteGroup(group.id);
      window.location.href = '/';
    }
  };

  if (!group && !loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <p className="text-muted-foreground">Group not found</p>
      </div>
    );
  }

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderOpen className="h-6 w-6" />
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-9 w-48"
                autoFocus
              />
              <Button variant="ghost" size="icon" onClick={handleSaveEdit}>
                <Check className="h-4 w-4 text-green-600" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleCancelEdit}>
                <X className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-semibold">{group?.name}</h1>
              <Button variant="ghost" size="icon" onClick={handleStartEdit}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
        <NewClipDialog groups={groups} onCreateClip={(content, title) => createClip(content, title, groupId)} />
      </div>

      <ClipGrid
        clips={filteredClips}
        groups={groups}
        onTogglePin={togglePin}
        onDelete={softDelete}
        onClipClick={setSelectedClip}
        emptyMessage={searchQuery ? 'No clips match your search' : 'No clips in this group yet'}
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

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Group?</DialogTitle>
            <DialogDescription>
              This will delete the group &quot;{group?.name}&quot;. Clips in this group will be moved to ungrouped.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteGroup}>
              Delete Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
