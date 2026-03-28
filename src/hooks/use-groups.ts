'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Group } from '@/types/database';
import { toast } from 'sonner';

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [deletedGroups, setDeletedGroups] = useState<Group[]>([]);
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
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      setGroups((data as Group[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDeletedGroups = useCallback(async () => {
    const supabase = createClient();

    try {
      const { data, error: fetchError } = await supabase
        .from('groups')
        .select('*')
        .eq('is_deleted', true)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      setDeletedGroups((data as Group[]) || []);
    } catch (err) {
      console.error('Failed to fetch deleted groups:', err);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
    fetchDeletedGroups();
  }, [fetchGroups, fetchDeletedGroups]);

  const createGroup = async (name: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check for duplicate names (case-insensitive)
    const normalizedName = name.trim().toLowerCase();
    const isDuplicate = groups.some(g => g.name.toLowerCase() === normalizedName);
    if (isDuplicate) {
      toast.error('A group with this name already exists');
      throw new Error('Duplicate group name');
    }

    const { data, error } = await supabase
      .from('groups')
      .insert({
        name: name.trim(),
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
    
    // Check for duplicate names (case-insensitive), excluding current group
    const normalizedName = name.trim().toLowerCase();
    const isDuplicate = groups.some(g => g.id !== id && g.name.toLowerCase() === normalizedName);
    if (isDuplicate) {
      toast.error('A group with this name already exists');
      throw new Error('Duplicate group name');
    }
    
    // Optimistic update
    const previousGroups = groups;
    setGroups(prev => prev.map(g => g.id === id ? { ...g, name: name.trim() } : g));
    
    const { error } = await supabase
      .from('groups')
      .update({ name: name.trim() })
      .eq('id', id);

    if (error) {
      // Rollback on error
      setGroups(previousGroups);
      throw error;
    }
  };

  const deleteGroup = async (id: string) => {
    const supabase = createClient();
    
    // Soft delete the group
    const { error } = await supabase
      .from('groups')
      .update({ is_deleted: true })
      .eq('id', id);

    if (error) throw error;
    
    // Move from groups to deletedGroups
    const deletedGroup = groups.find(g => g.id === id);
    if (deletedGroup) {
      setGroups(prev => prev.filter(g => g.id !== id));
      setDeletedGroups(prev => [...prev, { ...deletedGroup, is_deleted: true }]);
    }
  };

  const restoreGroup = async (id: string) => {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('groups')
      .update({ is_deleted: false })
      .eq('id', id);

    if (error) throw error;
    
    // Move from deletedGroups to groups
    const restoredGroup = deletedGroups.find(g => g.id === id);
    if (restoredGroup) {
      setDeletedGroups(prev => prev.filter(g => g.id !== id));
      setGroups(prev => [...prev, { ...restoredGroup, is_deleted: false }]);
    }
  };

  const permanentDeleteGroup = async (id: string) => {
    const supabase = createClient();
    
    // ON DELETE SET NULL is already in schema, so just delete the group
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    // Remove from deletedGroups
    setDeletedGroups(prev => prev.filter(g => g.id !== id));
  };

  return {
    groups,
    deletedGroups,
    loading,
    error,
    refetch: fetchGroups,
    refetchDeleted: fetchDeletedGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    restoreGroup,
    permanentDeleteGroup,
  };
}
