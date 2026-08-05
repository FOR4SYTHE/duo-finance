import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuthStore } from '@/store/useAuthStore';
import { useDailyNoteStore } from '@/store/useDailyNoteStore';

export function useRealtimeNote() {
    const { user } = useAuthStore();
    const { 
        fetchNotesAndReactions, 
        handleNoteInsert, 
        handleNoteDelete, 
        handleNoteUpdate,
        handleReactionInsert,
        isInitialized 
    } = useDailyNoteStore();

    useEffect(() => {
        if (!user) return;
        
        // We need the household ID to fetch initial notes
        // For simplicity, we just fetch notes when this hook mounts if not initialized
        // Assuming we can get householdId from user metadata or another store, 
        // but typically it's fetched per component.
        // Wait, the hook can just listen to all partner_notes changes where household_id matches?
        // RLS already filters events for the user's household in postgres_changes if we don't specify household_id filter, 
        // OR we can just let RLS do the work. (Actually Supabase realtime requires careful RLS setup or explicit filters)
        
        const supabase = createClient();

        const channel = supabase.channel('daily-notes-channel')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'partner_notes' },
                (payload) => {
                    handleNoteInsert(payload.new as any);
                }
            )
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'partner_notes' },
                (payload) => {
                    handleNoteDelete(payload.old.id);
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'partner_notes' },
                (payload) => {
                    handleNoteUpdate(payload.new as any);
                }
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'note_reactions' },
                (payload) => {
                    handleReactionInsert(payload.new as any);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, handleNoteInsert, handleNoteDelete, handleReactionInsert]);
}
