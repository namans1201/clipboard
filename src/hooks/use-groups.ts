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
    
    // Optimistic update - add to local state immediately
    if (data) {
      setGroups(prev => [...prev, data as Group]);
    }
    
    return data;
  };

  const updateGroup = async (id: string, name: string) => {
    const supabase = createClient();
    
    // Optimistic update
    const previousGroups = groups;
    setGroups(prev => prev.map(g => g.id === id ? { ...g, name } : g));
    
    const { error } = await supabase
      .from('groups')
      .update({ name })
      .eq('id', id);

    if (error) {
      // Rollback on error
      setGroups(previousGroups);
      throw error;
    }
  };

  const deleteGroup = async (id: string) => {
    const supabase = createClient();
    
    // ON DELETE SET NULL is already in schema, so just delete the group
    // The database will automatically set group_id to NULL for related clips
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    // Optimistic update - remove from local state immediately
    setGroups(prev => prev.filter(g => g.id !== id));
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
