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
    await fetchClips();
    return data;
  };

  const updateClip = async (id: string, updates: Partial<Pick<Clip, 'content' | 'title' | 'group_id' | 'is_pinned'>>) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('clips')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    await fetchClips();
  };

  const togglePin = async (id: string, isPinned: boolean) => {
    await updateClip(id, { is_pinned: !isPinned });
  };

  const softDelete = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('clips')
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    await fetchClips();
  };

  const restore = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('clips')
      .update({ is_deleted: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    await fetchClips();
  };

  const permanentDelete = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('clips')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchClips();
  };

  return {
    clips,
    loading,
    error,
    refetch: fetchClips,
    createClip,
    updateClip,
    togglePin,
    softDelete,
    restore,
    permanentDelete,
  };
}
