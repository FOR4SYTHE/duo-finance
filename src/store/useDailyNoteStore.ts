import { create } from 'zustand';
import { createClient } from '@/utils/supabase/client';
import { useAuthStore } from './useAuthStore';

export interface DailyNote {
    id: string;
    household_id: string;
    sender_id: string;
    caption: string | null;
    photo_url: string | null;
    color: string;
    font_size: number;
    created_at: string;
}

export interface NoteReaction {
    id: string;
    note_id: string;
    user_id: string;
    emoji: string;
    created_at: string;
}

interface DailyNoteState {
    notes: DailyNote[];
    reactions: NoteReaction[];
    isLoading: boolean;
    error: string | null;
    isInitialized: boolean;

    // Actions
    fetchNotesAndReactions: (householdId: string) => Promise<void>;
    sendNote: (householdId: string, caption: string | null, photoFile: File | null, color: string, fontSize: number, existingPhotoUrl?: string | null, editingNoteId?: string) => Promise<void>;
    deleteNote: (noteId: string) => Promise<void>;
    addReaction: (noteId: string, emoji: string) => Promise<void>;
    
    // Realtime Handlers (to be called by a hook/component)
    handleNoteInsert: (note: DailyNote) => void;
    handleNoteDelete: (noteId: string) => void;
    handleReactionInsert: (reaction: NoteReaction) => void;
    handleNoteUpdate: (note: DailyNote) => void;
}

export const useDailyNoteStore = create<DailyNoteState>((set, get) => ({
    notes: [],
    reactions: [],
    isLoading: false,
    error: null,
    isInitialized: false,

    fetchNotesAndReactions: async (householdId: string) => {
        set({ isLoading: true, error: null });
        try {
            const supabase = createClient();
            
            // Fetch all notes (up to 60 total in the household, due to the 30-per-person cap)
            const { data: notesData, error: notesError } = await supabase
                .from('partner_notes')
                .select('*')
                .eq('household_id', householdId)
                .order('created_at', { ascending: true });

            if (notesError) throw notesError;

            const noteIds = notesData?.map(n => n.id) || [];
            
            let reactionsData: NoteReaction[] = [];
            if (noteIds.length > 0) {
                const { data: rData, error: rError } = await supabase
                    .from('note_reactions')
                    .select('*')
                    .in('note_id', noteIds);
                if (rError) throw rError;
                reactionsData = rData as NoteReaction[];
            }

            set({ 
                notes: notesData as DailyNote[], 
                reactions: reactionsData,
                isLoading: false,
                isInitialized: true
            });
        } catch (err: any) {
            console.error("Error fetching notes:", err);
            set({ error: err.message, isLoading: false });
        }
    },

    sendNote: async (householdId: string, caption: string | null, photoFile: File | null, color: string, fontSize: number, existingPhotoUrl?: string | null, editingNoteId?: string) => {
        set({ isLoading: true, error: null });
        try {
            const supabase = createClient();
            const { user } = useAuthStore.getState();
            if (!user) throw new Error("Not authenticated");

            let photoUrl = null;
            if (photoFile) {
                const fileExt = photoFile.name.split('.').pop();
                const fileName = `${user.id}-${Math.random()}.${fileExt}`;
                
                const { data, error } = await supabase.storage
                    .from('daily_notes')
                    .upload(fileName, photoFile);
                    
                if (error) throw error;
                
                const { data: { publicUrl } } = supabase.storage
                    .from('daily_notes')
                    .getPublicUrl(fileName);
                    
                photoUrl = publicUrl;
            } else if (existingPhotoUrl) {
                photoUrl = existingPhotoUrl;
            }

            let query = supabase.from('partner_notes');
            let response;
            
            if (editingNoteId) {
                response = await query
                    .update({
                        caption,
                        photo_url: photoUrl,
                        color,
                        font_size: fontSize,
                    })
                    .eq('id', editingNoteId)
                    .select()
                    .single();
            } else {
                response = await query
                    .insert({
                        household_id: householdId,
                        sender_id: user.id,
                        caption,
                        photo_url: photoUrl,
                        color,
                        font_size: fontSize,
                    })
                    .select()
                    .single();
            }

            if (response.error) throw response.error;
            // Optimistic update handled by realtime subscription usually, 
            // but we can also just let realtime do it.
            set({ isLoading: false });
        } catch (err: any) {
            console.error("Error sending note:", err);
            set({ error: err.message, isLoading: false });
        }
    },

    deleteNote: async (noteId: string) => {
        set({ isLoading: true, error: null });
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('partner_notes')
                .delete()
                .eq('id', noteId);

            if (error) throw error;
            
            set(state => ({
                notes: state.notes.filter(n => n.id !== noteId),
                reactions: state.reactions.filter(r => r.note_id !== noteId),
                isLoading: false
            }));
        } catch (error: any) {
            console.error('Error deleting note:', error);
            set({ error: error.message, isLoading: false });
        }
    },

    addReaction: async (noteId: string, emoji: string) => {
        try {
            const supabase = createClient();
            const { user } = useAuthStore.getState();
            if (!user) return;

            // Optimistic insert
            const optimisticId = crypto.randomUUID();
            const optimisticReaction: NoteReaction = {
                id: optimisticId,
                note_id: noteId,
                user_id: user.id,
                emoji,
                created_at: new Date().toISOString()
            };
            
            set((state) => ({
                reactions: [...state.reactions, optimisticReaction]
            }));

            const { error } = await supabase
                .from('note_reactions')
                .insert({
                    note_id: noteId,
                    user_id: user.id,
                    emoji,
                });
                
            if (error) {
                // Revert on error
                set((state) => ({
                    reactions: state.reactions.filter(r => r.id !== optimisticId)
                }));
                throw error;
            }

            // Also send a notification to the note sender for the toast
            const targetNote = get().notes.find(n => n.id === noteId);
            if (targetNote && targetNote.sender_id !== user.id) {
                await supabase.from('notifications').insert({
                    household_id: targetNote.household_id,
                    from_user_id: user.id,
                    to_user_id: targetNote.sender_id,
                    type: 'note_reaction',
                    message: `Your partner reacted ${emoji} to your note!`,
                });
            }
        } catch (err: any) {
            console.error("Error adding reaction:", err);
        }
    },

    handleNoteInsert: (note: DailyNote) => set((state) => {
        // Simply append the new note to the list so they stack
        const exists = state.notes.some(n => n.id === note.id);
        if (exists) return state; // Avoid duplicate inserts from realtime
        return { notes: [...state.notes, note] };
    }),

    handleNoteUpdate: (updatedNote: DailyNote) => set((state) => ({
        notes: state.notes.map(n => n.id === updatedNote.id ? updatedNote : n)
    })),

    handleNoteDelete: (noteId: string) => set((state) => ({
        notes: state.notes.filter(n => n.id !== noteId),
        reactions: state.reactions.filter(r => r.note_id !== noteId)
    })),

    handleReactionInsert: (reaction: NoteReaction) => set((state) => {
        // Avoid duplicates if we optimistically inserted
        const exists = state.reactions.some(
            r => r.note_id === reaction.note_id && r.user_id === reaction.user_id && r.emoji === reaction.emoji && r.created_at === reaction.created_at
        );
        // Better check: just rely on ID if possible, but our optimistic ID won't match DB ID.
        // We'll just filter out any exact same emoji/user combination that happened in the last few seconds, or just append.
        // Easiest is just to append and filter duplicates by (note_id, user_id, emoji) if you don't want spam, 
        // but since they can react multiple times with same emoji, we should just let it be or find a way to reconcile optimistic.
        // For now, if we optimistically inserted, we might get double. 
        // Let's remove the optimistic one matching user+emoji roughly.
        const filtered = state.reactions.filter(r => !(r.user_id === reaction.user_id && r.emoji === reaction.emoji && r.id.length > 20)); // uuid is long
        return { reactions: [...filtered, reaction] };
    }),
}));
