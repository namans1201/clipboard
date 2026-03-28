'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Group } from '@/types/database';

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      setGroups((data as Group[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const createGroup = async (name: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('groups')
      .insert({
        name,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    await fetchGroups();
    return data;
  };

  const updateGroup = async (id: string, name: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('groups')
      .update({ name })
      .eq('id', id);

    if (error) throw error;
    await fetchGroups();
  };

  const deleteGroup = async (id: string) => {
    const supabase = createClient();
    
    // First, unassign clips from this group
    await supabase
      .from('clips')
      .update({ group_id: null })
      .eq('group_id', id);

    // Then delete the group
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchGroups();
  };

  return {
    groups,
    loading,
    error,
    refetch: fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
  };
}
