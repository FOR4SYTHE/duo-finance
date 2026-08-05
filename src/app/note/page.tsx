"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Camera, Send, Plus, X, Image as ImageIcon, StickyNote, Minus, Type, Edit2, Trash2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useDailyNoteStore } from "@/store/useDailyNoteStore";
import { useRealtimeNote } from "@/hooks/useRealtimeNote";
import { processAndCompressImage } from "@/utils/imageUpload";

const EMOJI_LIST = ["❤️", "😂", "🔥", "🥺", "✨", "🎉", "👍", "😍", "🌸", "🌷", "🦋", "👀", "🙌", "💀", "😭"];
const NOTE_LIMIT = 30; // Set to 30 for production. User can test by manually altering this.

const NOTE_COLORS = [
    { id: 'white', value: '#ffffff' },
    { id: 'pink', value: '#ffe4e6' },
    { id: 'blue', value: '#e0f2fe' },
    { id: 'green', value: '#dcfce7' },
    { id: 'yellow', value: '#fef08a' },
];

// Helper to format date string
const getLocalYMD = (date: Date) => {
    return date.toLocaleDateString('en-CA'); // YYYY-MM-DD local
};

export default function NotePage() {
    const router = useRouter();
    const { user: authUser, partner: authPartner, householdId } = useAuthStore();
    const { notes, reactions, fetchNotesAndReactions, sendNote, addReaction, deleteNote, isLoading } = useDailyNoteStore();
    
    useRealtimeNote();

    const [isComposing, setIsComposing] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [caption, setCaption] = useState("");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [showEmojiPickerFor, setShowEmojiPickerFor] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState(NOTE_COLORS[0].value);
    const [fontSize, setFontSize] = useState(24);
    
    // Cap Dialog State
    const [showCapDialog, setShowCapDialog] = useState(false);
    
    // FAB Menu State
    const [showFabMenu, setShowFabMenu] = useState(false);
    
    const todayYMD = getLocalYMD(new Date());

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (householdId) {
            fetchNotesAndReactions(householdId);
        }
    }, [householdId, fetchNotesAndReactions]);

    // Mark the latest partner note as seen
    useEffect(() => {
        if (notes.length > 0) {
            const partnerNotes = notes.filter(n => n.sender_id !== authUser?.id);
            if (partnerNotes.length > 0) {
                const latest = partnerNotes[partnerNotes.length - 1];
                localStorage.setItem('last_seen_note_id', latest.id);
            }
        }
    }, [notes, authUser]);

    // Notes for active date (Today only)
    const activeDateNotes = useMemo(() => {
        return notes.filter(n => getLocalYMD(new Date(n.created_at)) === todayYMD);
    }, [notes, todayYMD]);

    const partnerNotes = activeDateNotes.filter(n => n.sender_id !== authUser?.id);
    const myNotes = activeDateNotes.filter(n => n.sender_id === authUser?.id);

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const dataUrl = await processAndCompressImage(file);
            setSelectedImage(dataUrl);
            setIsComposing(true);
        }
    };

    const attemptSend = () => {
        if (!householdId || (!caption && !imageFile && !selectedImage)) return;
        
        // Check if editing (editing doesn't increase total count)
        if (editingNoteId) {
            executeSend();
            return;
        }

        // Count my total notes across ALL days
        const myTotalNotes = notes.filter(n => n.sender_id === authUser?.id).length;
        if (myTotalNotes >= NOTE_LIMIT) {
            setShowCapDialog(true);
        } else {
            executeSend();
        }
    };

    const executeSend = async () => {
        if (!householdId) return;
        
        let oldestNoteId = null;
        if (showCapDialog) {
            // Find oldest note to delete
            const myAllNotes = notes.filter(n => n.sender_id === authUser?.id).sort((a, b) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
            if (myAllNotes.length > 0) {
                oldestNoteId = myAllNotes[0].id;
            }
        }

        setShowCapDialog(false);

        if (oldestNoteId) {
            await deleteNote(oldestNoteId);
        }

        await sendNote(householdId, caption, imageFile, selectedColor, fontSize, selectedImage, editingNoteId || undefined);
        
        setIsComposing(false);
        setEditingNoteId(null);
        setCaption("");
        setSelectedImage(null);
        setImageFile(null);
        setSelectedColor(NOTE_COLORS[0].value);
        setFontSize(24);
    };

    const handleEdit = (note: any) => {
        if (note.sender_id !== authUser?.id) return;
        setEditingNoteId(note.id);
        setCaption(note.caption || "");
        setSelectedColor(note.color || NOTE_COLORS[0].value);
        setFontSize(note.font_size || 24);
        setSelectedImage(note.photo_url);
        setIsComposing(true);
    };

    const handleReaction = async (noteId: string, emoji: string) => {
        await addReaction(noteId, emoji);
        setShowEmojiPickerFor(null);
    };

    const getHeaderDateLabel = () => {
        return new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }).toUpperCase();
    };

    const renderNoteCard = (note: any, isMine: boolean) => {
        const noteReactions = reactions.filter(r => r.note_id === note.id);
        const senderProfile = isMine ? authUser : authPartner;
        
        return (
            <div key={note.id} className="w-full flex flex-col items-center">
                {/* Sender Avatar & Name */}
                <div className="w-full max-w-[280px] flex items-center justify-center gap-2 mb-3">
                    {senderProfile?.avatar ? (
                        <img src={senderProfile.avatar} alt="Avatar" className="w-6 h-6 rounded-full object-cover bg-black/5" />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-black/40">
                                {senderProfile?.name?.charAt(0) || (isMine ? 'U' : 'P')}
                            </span>
                        </div>
                    )}
                    <span className="text-[11px] font-bold tracking-widest text-black/40 uppercase">
                        {senderProfile?.name?.split(' ')[0] || (isMine ? 'You' : 'Partner')}
                    </span>
                </div>
                <div 
                    style={{ backgroundColor: note.color || '#ffffff' }}
                    className="w-full max-w-[280px] p-5 rounded-[24px] shadow-[0_8px_24px_rgba(0,0,0,0.06)] flex flex-col items-center relative transition-colors duration-500"
                >
                    {note.photo_url && (
                        <div className="w-full aspect-[4/5] rounded-[16px] overflow-hidden bg-black/5 mb-4 relative shadow-sm">
                            <img 
                                src={note.photo_url} 
                                alt="Note attachment" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    
                    {note.caption && (
                        <p 
                            className={`font-gloria text-center leading-relaxed text-black/90 w-full whitespace-pre-wrap`}
                            style={{ fontSize: `${note.font_size || 24}px` }}
                        >
                            {note.caption}
                        </p>
                    )}

                    {/* Action Pins */}
                    {isMine ? (
                        <>
                            <button 
                                onClick={() => deleteNote(note.id)}
                                className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-red-500 hover:scale-110 active:scale-95 transition-transform"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => handleEdit(note)}
                                className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-black/70 hover:scale-110 active:scale-95 transition-transform"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={() => setShowEmojiPickerFor(showEmojiPickerFor === note.id ? null : note.id)}
                            className="absolute -bottom-3 -right-3 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-black/70 hover:scale-110 active:scale-95 transition-transform"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    )}
                </div>
                
                {/* Meta Row */}
                <div className="w-full max-w-[280px] mt-2 flex items-center justify-between px-2">
                    <span className="text-[11px] font-medium text-black/40">
                        {new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    
                    {noteReactions.length > 0 && (
                        <div className="flex gap-1">
                            {noteReactions.map((r, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-6 h-6 bg-white rounded-full shadow-sm flex items-center justify-center text-[12px] border border-black/5"
                                >
                                    {r.emoji}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Inline Emoji Picker */}
                <AnimatePresence>
                    {showEmojiPickerFor === note.id && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="w-full max-w-[280px] mt-2 bg-white rounded-3xl shadow-sm border border-black/5 p-4 grid grid-cols-5 gap-y-4 gap-x-2"
                        >
                            {EMOJI_LIST.map((emoji) => (
                                <button
                                    key={emoji}
                                    onClick={() => handleReaction(note.id, emoji)}
                                    className="text-2xl hover:scale-125 active:scale-95 transition-transform flex items-center justify-center h-8"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <main className="absolute inset-0 bg-[#f5f5f7] overflow-y-auto overflow-x-hidden flex flex-col items-center z-40">
            <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImageSelect}
            />
            
            {/* Header */}
            <header className="w-full max-w-[400px] mx-auto px-6 py-4 flex items-center justify-between z-20 sticky top-0 bg-[#f5f5f7]/80 backdrop-blur-xl border-b border-black/5">
                <button 
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center transition-transform hover:scale-105"
                >
                    <ChevronLeft className="w-6 h-6 text-black/70" />
                </button>
                
                {/* Date Header */}
                <div className="flex items-center justify-center flex-1">
                    <span className="text-[#3a3a3c] text-[13px] font-bold tracking-widest uppercase text-center">
                        {getHeaderDateLabel()}
                    </span>
                </div>
                
                <div className="w-10 h-10" />
            </header>

            {/* Note Content */}
            <div className="flex-1 w-full max-w-[400px] mx-auto flex flex-col px-6 pt-8 pb-32">
                <AnimatePresence mode="wait">
                    {!isComposing ? (
                        <motion.div
                            key={`feed-${todayYMD}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="w-full flex flex-col gap-10"
                        >
                            {activeDateNotes.length === 0 ? (
                                <div className="flex flex-col items-center justify-center pt-24 opacity-40">
                                    <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mb-4">
                                        <StickyNote className="w-6 h-6 text-black" />
                                    </div>
                                    <span className="text-[15px] font-bold text-black">No notes this day</span>
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-col gap-12 w-full items-center pb-8">
                                        {activeDateNotes.map(n => renderNoteCard(n, n.sender_id === authUser?.id))}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="compose-mode"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full flex flex-col items-center"
                        >
                            <div className="w-full flex justify-end mb-4">
                                <button 
                                    onClick={() => {
                                        setIsComposing(false);
                                        setEditingNoteId(null);
                                        setCaption("");
                                        setSelectedImage(null);
                                        setImageFile(null);
                                    }}
                                    className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-black/50 hover:bg-black/10 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div 
                                style={{ backgroundColor: selectedColor }}
                                className="w-full max-w-[320px] p-6 rounded-[32px] shadow-[0_20px_40px_rgba(0,0,0,0.08)] flex flex-col items-center relative transition-colors duration-500"
                            >
                                {selectedImage && (
                                    <div className="w-full aspect-[4/5] rounded-[20px] overflow-hidden bg-black/5 mb-6 relative">
                                        <img 
                                            src={selectedImage} 
                                            alt="Preview" 
                                            className="w-full h-full object-cover"
                                        />
                                        <button 
                                            onClick={() => { setSelectedImage(null); setImageFile(null); }}
                                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                                
                                <textarea
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value.slice(0, 1000))}
                                    placeholder={selectedImage ? "Add a caption..." : "Write a note..."}
                                    style={{ fontSize: `${fontSize}px` }}
                                    className="w-full min-h-[140px] bg-transparent resize-none outline-none font-gloria text-center placeholder:text-black/20 text-black/90 leading-relaxed overflow-hidden"
                                />
                            </div>

                            <div className="w-full max-w-[320px] mt-6 bg-white rounded-3xl p-2 shadow-sm border border-black/5 flex items-center gap-2">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex-1 h-12 rounded-2xl bg-[#f5f5f7] flex items-center justify-center text-black/60 hover:bg-black/5 transition-colors"
                                >
                                    <ImageIcon className="w-5 h-5" />
                                </button>
                                
                                <div className="flex-1 h-12 rounded-2xl bg-[#f5f5f7] flex items-center justify-between px-3 text-black/60">
                                    <button 
                                        onClick={() => setFontSize(Math.max(16, fontSize - 2))}
                                        className="w-8 h-8 flex items-center justify-center hover:bg-black/5 rounded-full"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <Type className="w-4 h-4 opacity-50" />
                                    <button 
                                        onClick={() => setFontSize(Math.min(48, fontSize + 2))}
                                        className="w-8 h-8 flex items-center justify-center hover:bg-black/5 rounded-full"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="w-full max-w-[320px] mt-2 bg-white rounded-3xl p-2 shadow-sm border border-black/5 flex items-center gap-2 justify-between">
                                {NOTE_COLORS.map(color => (
                                    <button
                                        key={color.id}
                                        onClick={() => setSelectedColor(color.value)}
                                        style={{ backgroundColor: color.value }}
                                        className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor === color.value ? 'border-black scale-110' : 'border-black/5 hover:scale-105'}`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={attemptSend}
                                disabled={isLoading || (!caption && !selectedImage)}
                                className="w-full max-w-[320px] h-14 bg-black text-white rounded-full mt-8 font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100 active:scale-[0.98] transition-transform"
                            >
                                <Send className="w-5 h-5" />
                                {editingNoteId ? 'Update Note' : 'Send Note'}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Floating Compose Button & Menu */}
            <AnimatePresence>
                {!isComposing && (
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        className="fixed bottom-8 right-6 z-20 flex flex-col items-end gap-3"
                    >
                        <button
                            onClick={() => {
                                setIsComposing(true);
                                setEditingNoteId(null);
                                setShowFabMenu(false); // Just in case state exists, but we won't need it.
                            }}
                            className="h-14 w-14 bg-black text-white rounded-full font-bold shadow-[0_16px_32px_rgba(0,0,0,0.4)] flex items-center justify-center active:scale-95 transition-transform relative z-30"
                        >
                            <Plus className="w-6 h-6" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 30-Note Cap Dialog Overlay */}
            <AnimatePresence>
                {showCapDialog && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center px-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCapDialog(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-[320px] bg-white rounded-3xl p-6 shadow-[0_24px_48px_rgba(0,0,0,0.2)] flex flex-col items-center text-center"
                        >
                            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                                <StickyNote className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-black mb-2">Note Limit Reached</h3>
                            <p className="text-[14px] text-black/60 leading-relaxed mb-6">
                                You've reached your {NOTE_LIMIT} note limit. Sending this note will automatically delete your oldest saved note. Proceed?
                            </p>
                            <div className="flex w-full gap-3">
                                <button
                                    onClick={() => setShowCapDialog(false)}
                                    className="flex-1 h-12 rounded-xl bg-black/5 font-bold text-black/70 hover:bg-black/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={executeSend}
                                    disabled={isLoading}
                                    className="flex-1 h-12 rounded-xl bg-black font-bold text-white hover:bg-black/90 transition-colors flex items-center justify-center"
                                >
                                    {isLoading ? 'Sending...' : 'Proceed'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
}
