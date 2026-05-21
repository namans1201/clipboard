'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Clip } from '@/types/database';

interface UseClipsOptions {
  groupId?: string | null;
  showPinned?: boolean;
  showTrashed?: boolean;
}

export function useClips(options: UseClipsOptions = {}) {
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClips = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('clips')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (options.showTrashed) {
        query = query.eq('is_deleted', true);
      } else {
        query = query.eq('is_deleted', false);
      }

      if (options.showPinned) {
        query = query.eq('is_pinned', true);
      }

      if (options.groupId) {
        query = query.eq('group_id', options.groupId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setClips((data as Clip[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clips');
    } finally {
      setLoading(false);
    }
  }, [options.groupId, options.showPinned, options.showTrashed]);

  useEffect(() => {
    fetchClips();
  }, [fetchClips]);

  // ── Realtime subscription ──────────────────────────────────────────
  // Listens for INSERT / UPDATE / DELETE on the clips table so the UI
  // stays in sync across tabs and devices without manual refresh.
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('clips-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clips' },
        () => {
          // Re-fetch to keep the list consistent with server state.
          // This is lightweight because Supabase returns only the
          // rows matching our filters.
          fetchClips();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchClips]);

  const createClip = async (content: string, title?: string, groupId?: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('clips')
      .insert({
        content,
        title: title || null,
        group_id: groupId || null,
        user_id: user.id,
        is_pinned: false,
        is_deleted: false,
      })
      .select()
      .single();

    if (error) throw error;
    
    // Optimistic update — realtime will also fire but this gives instant feedback
    if (data) {
      setClips(prev => [data as Clip, ...prev]);
    }
    
    return data;
  };

  const updateClip = async (
    id: string,
    updates: Partial<Pick<Clip, 'content' | 'title' | 'group_id' | 'is_pinned' | 'is_locked' | 'width_span' | 'height_span'>>,
  ) => {
    const supabase = createClient();
    
    // Optimistic update
    const previousClips = clips;
    setClips(prev => {
      const updated = prev.map(clip => 
        clip.id === id 
          ? { ...clip, ...updates, updated_at: new Date().toISOString() }
          : clip
      );
      
      // If is_pinned changed, re-sort to move pinned clips to top
      if ('is_pinned' in updates) {
        return updated.sort((a, b) => {
          // Pinned first
          if (a.is_pinned !== b.is_pinned) {
            return a.is_pinned ? -1 : 1;
          }
          // Then by created_at (most recent first)
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
      }
      
      return updated;
    });
    
    const { error } = await supabase
      .from('clips')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      // Rollback on error
      setClips(previousClips);
      throw error;
    }
  };

  const togglePin = async (id: string, isPinned: boolean) => {
    await updateClip(id, { is_pinned: !isPinned });
  };

  /**
   * Persist a clip's grid spans after a corner-drag resize. Thin wrapper
   * around updateClip so the page-level handler signature stays small.
   */
  const resizeClip = async (id: string, width_span: number, height_span: number) => {
    await updateClip(id, { width_span, height_span });
  };

  /**
   * Flip the internal-lock flag. Card UI renders a "locked cover" until
   * unlocked — see ClipCard's locked branch.
   */
  const toggleLock = async (id: string, isLocked: boolean) => {
    await updateClip(id, { is_locked: !isLocked });
  };

  const softDelete = async (id: string) => {
    const supabase = createClient();
    
    // Optimistic update - remove from view immediately
    const previousClips = clips;
    setClips(prev => prev.filter(clip => clip.id !== id));
    
    const { error } = await supabase
      .from('clips')
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      // Rollback on error
      setClips(previousClips);
      throw error;
    }
  };

  const restore = async (id: string) => {
    const supabase = createClient();
    
    // Optimistic update - remove from trash view
    const previousClips = clips;
    setClips(prev => prev.filter(clip => clip.id !== id));
    
    const { error } = await supabase
      .from('clips')
      .update({ is_deleted: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      // Rollback on error
      setClips(previousClips);
      throw error;
    }
  };

  const permanentDelete = async (id: string) => {
    const supabase = createClient();
    
    // Optimistic update - remove immediately
    const previousClips = clips;
    setClips(prev => prev.filter(clip => clip.id !== id));
    
    const { error } = await supabase
      .from('clips')
      .delete()
      .eq('id', id);

    if (error) {
      // Rollback on error
      setClips(previousClips);
      throw error;
    }
  };

  return {
    clips,
    loading,
    error,
    refetch: fetchClips,
    createClip,
    updateClip,
    togglePin,
    toggleLock,
    resizeClip,
    softDelete,
    restore,
    permanentDelete,
  };
}
