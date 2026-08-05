"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Camera, Send, Plus, X, Image as ImageIcon, StickyNote, Minus, Type, Edit2, Trash2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useDailyNoteStore } from "@/store/useDailyNoteStore";
import { useRealtimeNote } from "@/hooks/useRealtimeNote";
import { processAndCompressImage } from "@/utils/imageUpload";

const EMOJI_LIST = ["❤️", "😂", "🔥", "🥺", "✨", "🎉", "👍", "😍", "🌸", "🌷", "🦋", "👀", "🙌", "💀", "😭"];

const NOTE_COLORS = [
    { id: 'white', value: '#ffffff' },
    { id: 'pink', value: '#ffe4e6' },
    { id: 'blue', value: '#e0f2fe' },
    { id: 'green', value: '#dcfce7' },
    { id: 'yellow', value: '#fef08a' },
];

export default function NotePage() {
    const router = useRouter();
    const { user: authUser, partner: authPartner, householdId } = useAuthStore();
    const { notes, reactions, fetchNotesAndReactions, sendNote, addReaction, deleteNote, isLoading } = useDailyNoteStore();
    
    // Initialize realtime listeners
    useRealtimeNote();

    const [isComposing, setIsComposing] = useState(false);
    const [caption, setCaption] = useState("");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedColor, setSelectedColor] = useState(NOTE_COLORS[0].value);
    const [fontSize, setFontSize] = useState(24);
    const [activeTab, setActiveTab] = useState<'partner' | 'mine'>('partner');
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (householdId) {
            fetchNotesAndReactions(householdId);
        }
    }, [householdId, fetchNotesAndReactions]);

    const partnerNote = notes.find(n => n.sender_id !== authUser?.id);
    const myNote = notes.find(n => n.sender_id === authUser?.id);
    
    useEffect(() => {
        if (partnerNote && !myNote) setActiveTab('partner');
        else if (myNote && !partnerNote) setActiveTab('mine');
    }, [partnerNote?.id, myNote?.id]);

    const displayNote = activeTab === 'partner' ? partnerNote : myNote;
    const isViewingMine = activeTab === 'mine';
    const displayNoteReactions = reactions.filter(r => r.note_id === displayNote?.id);

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const dataUrl = await processAndCompressImage(file);
            setSelectedImage(dataUrl);
            setIsComposing(true);
        }
    };

    const handleSend = async () => {
        if (!householdId || (!caption && !imageFile && !selectedImage)) return;
        await sendNote(householdId, caption, imageFile, selectedColor, fontSize, selectedImage);
        setIsComposing(false);
        setCaption("");
        setSelectedImage(null);
        setImageFile(null);
        setSelectedColor(NOTE_COLORS[0].value);
        setFontSize(24);
    };

    const handleEdit = () => {
        if (!myNote) return;
        setCaption(myNote.caption || "");
        setSelectedColor(myNote.color || NOTE_COLORS[0].value);
        setFontSize(myNote.font_size || 24);
        setSelectedImage(myNote.photo_url);
        setIsComposing(true);
    };

    const handleReaction = async (emoji: string) => {
        if (!displayNote) return;
        await addReaction(displayNote.id, emoji);
        setShowEmojiPicker(false);
    };

    return (
        <main className="min-h-[100dvh] bg-[#f5f5f7] relative overflow-hidden flex flex-col items-center">
            {/* Minimal Header */}
            <header className="w-full max-w-[400px] mx-auto px-6 py-4 flex items-center justify-between z-20 absolute top-0 left-0 right-0">
                <button 
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-full bg-black/5 backdrop-blur-md flex items-center justify-center transition-transform hover:scale-105"
                >
                    <ChevronLeft className="w-6 h-6 text-black/70" />
                </button>
                <span className="text-[#3a3a3c] text-[13px] font-bold tracking-widest uppercase">
                    today
                </span>
                <div className="w-10 h-10" />
            </header>

            {/* Note Content */}
            <div className="flex-1 w-full max-w-[400px] mx-auto flex flex-col items-center justify-center px-6 relative pt-20 pb-24">
                <AnimatePresence mode="wait">
                    {!isComposing ? (
                        <motion.div
                            key="view-mode"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full flex flex-col items-center"
                        >
                            {/* Tabs (only show if at least one note exists) */}
                            {(partnerNote || myNote) && (
                                <div className="flex bg-black/5 rounded-full p-1 mb-6">
                                    <button
                                        onClick={() => setActiveTab('partner')}
                                        className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-colors ${activeTab === 'partner' ? 'bg-white shadow-sm text-black' : 'text-black/50 hover:text-black/80'}`}
                                    >
                                        {authPartner?.name?.split(' ')[0] || 'Partner'}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('mine')}
                                        className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-colors ${activeTab === 'mine' ? 'bg-white shadow-sm text-black' : 'text-black/50 hover:text-black/80'}`}
                                    >
                                        You
                                    </button>
                                </div>
                            )}

                            {displayNote ? (
                                <div className="relative w-full max-w-[320px]">
                                    <div 
                                        style={{ backgroundColor: displayNote.color || '#ffffff' }}
                                        className="p-6 rounded-[32px] shadow-[0_20px_40px_rgba(0,0,0,0.08)] flex flex-col items-center relative transition-colors duration-500"
                                    >
                                        {displayNote.photo_url && (
                                            <div className="w-full aspect-[4/5] rounded-[20px] overflow-hidden bg-black/5 mb-6 relative shadow-sm">
                                                <img 
                                                    src={displayNote.photo_url} 
                                                    alt="Note attachment" 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        {displayNote.caption && (
                                            <p 
                                                className="text-[#1d1d1f] text-center px-2 leading-relaxed whitespace-pre-wrap font-gloria font-bold"
                                                style={{ fontSize: `${displayNote.font_size || 24}px` }}
                                            >
                                                {displayNote.caption}
                                            </p>
                                        )}

                                        {/* Reactions display */}
                                        {displayNoteReactions.length > 0 && (
                                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-1 min-w-full z-10">
                                                {displayNoteReactions.map((r, i) => (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        key={r.id || i}
                                                        className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full shadow-md flex items-center justify-center text-[18px] border border-black/5"
                                                    >
                                                        {r.emoji}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Sender Pins (Top Corners) */}
                                        {isViewingMine && (
                                            <>
                                                <button 
                                                    onClick={() => deleteNote(displayNote.id)}
                                                    className="absolute -top-4 -left-4 w-10 h-10 bg-white/95 backdrop-blur-md rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-black/5 flex items-center justify-center text-red-500 hover:scale-110 transition-transform z-20"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={handleEdit}
                                                    className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-tr from-[#30D158] to-[#34C759] rounded-full shadow-[0_8px_16px_rgba(48,209,88,0.3)] flex items-center justify-center text-white hover:scale-110 transition-transform z-20"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                            </>
                                        )}

                                        {/* Viewer Pins (Bottom Corners) */}
                                        {!isViewingMine && (
                                            <>
                                                <button 
                                                    onClick={() => deleteNote(displayNote.id)}
                                                    className="absolute -bottom-4 -left-4 w-10 h-10 bg-white/95 backdrop-blur-md rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-black/5 flex items-center justify-center text-red-500 hover:scale-110 transition-transform z-20"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                                    className="absolute -bottom-4 -right-4 w-12 h-12 bg-gradient-to-tr from-[#0A84FF] to-[#60A5FA] rounded-full shadow-[0_8px_16px_rgba(10,132,255,0.3)] flex items-center justify-center text-white hover:scale-110 transition-transform z-20"
                                                >
                                                    <Plus className="w-6 h-6" />
                                                </button>
                                            </>
                                        )}

                                        {/* Emoji Picker Popover */}
                                        <AnimatePresence>
                                            {showEmojiPicker && !isViewingMine && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                                    className="absolute -bottom-24 -right-2 bg-white/95 backdrop-blur-xl rounded-[24px] shadow-2xl p-3 flex gap-2 overflow-x-auto max-w-[280px] hide-scrollbar border border-black/5 z-30"
                                                >
                                                    {EMOJI_LIST.map(emoji => (
                                                        <button
                                                            key={emoji}
                                                            onClick={() => handleReaction(emoji)}
                                                            className="text-[28px] hover:scale-125 transition-transform px-1"
                                                        >
                                                            {emoji}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <div className="text-center mt-12 text-[#86868b] text-[12px] font-medium tracking-wide uppercase">
                                        Sent by {isViewingMine ? 'You' : (authPartner?.name?.split(' ')[0] || 'Partner')}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-[#86868b] flex flex-col items-center">
                                    <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-black/5 to-black/10 flex items-center justify-center mb-6 shadow-inner">
                                        <StickyNote className="w-8 h-8 text-black/20" />
                                    </div>
                                    <p className="text-[17px] font-semibold text-[#1d1d1f]">No notes today</p>
                                    <p className="text-[14px] mt-2 opacity-70">Nothing left for you yet.</p>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="compose-mode"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full flex flex-col items-center max-w-[340px]"
                        >
                            <div 
                                style={{ backgroundColor: selectedColor }}
                                className="p-6 rounded-[32px] shadow-2xl w-full flex flex-col items-center transition-colors duration-300 relative border border-black/5"
                            >
                                <button onClick={() => {
                                    setIsComposing(false);
                                    setSelectedImage(null);
                                    setImageFile(null);
                                }} className="absolute -top-3 -right-3 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10">
                                    <X className="w-4 h-4" />
                                </button>
                                
                                <textarea
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value.slice(0, 1000))}
                                    placeholder="Write something manic..."
                                    className="w-full min-h-[140px] bg-transparent border-none focus:outline-none text-center font-gloria font-bold text-[#1d1d1f] placeholder:text-black/20 resize-none leading-relaxed"
                                    style={{ fontSize: `${fontSize}px` }}
                                />
                                <div className="text-[10px] text-black/30 font-bold uppercase tracking-wider mb-6">
                                    {caption.length}/1000
                                </div>

                                {selectedImage && (
                                    <div className="w-full aspect-[4/5] rounded-[20px] overflow-hidden bg-black/5 mb-6 relative shadow-sm group">
                                        <img src={selectedImage} alt="Draft" className="w-full h-full object-cover" />
                                        <button 
                                            onClick={() => {
                                                setSelectedImage(null);
                                                setImageFile(null);
                                            }}
                                            className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                {/* Tools Row */}
                                <div className="w-full flex items-center justify-between mt-auto pt-4 border-t border-black/5">
                                    {/* Color Picker */}
                                    <div className="flex items-center gap-1.5">
                                        {NOTE_COLORS.map(color => (
                                            <button
                                                key={color.id}
                                                onClick={() => setSelectedColor(color.value)}
                                                className={`w-5 h-5 rounded-full border shadow-sm transition-transform ${selectedColor === color.value ? 'scale-125 border-black/20' : 'border-black/5 hover:scale-110'}`}
                                                style={{ backgroundColor: color.value }}
                                            />
                                        ))}
                                    </div>

                                    {/* Tools */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center bg-black/5 rounded-full overflow-hidden mr-2">
                                            <button 
                                                onClick={() => setFontSize(prev => Math.max(16, prev - 4))}
                                                className="w-8 h-8 flex items-center justify-center text-black/60 hover:bg-black/10 transition-colors"
                                            >
                                                <Minus className="w-3.5 h-3.5" />
                                            </button>
                                            <Type className="w-3 h-3 text-black/40" />
                                            <button 
                                                onClick={() => setFontSize(prev => Math.min(48, prev + 4))}
                                                className="w-8 h-8 flex items-center justify-center text-black/60 hover:bg-black/10 transition-colors"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        {!selectedImage && (
                                            <button 
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-black/60 hover:bg-black/10 transition-colors"
                                            >
                                                <ImageIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={handleSend}
                                    disabled={isLoading || (!caption && !selectedImage)}
                                    className="w-full py-4 mt-6 bg-gradient-to-r from-black to-[#2c2c2e] text-white rounded-[20px] font-bold text-[16px] flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(0,0,0,0.2)] disabled:opacity-50 disabled:shadow-none hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    {isLoading ? 'Sending...' : 'Send Note'}
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImageSelect}
            />

            {/* Floating Action Button (Only show if not composing) */}
            <AnimatePresence>
                {!isComposing && (
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        className="fixed bottom-8 left-0 right-0 flex justify-center z-20 pointer-events-none"
                    >
                        <div className="pointer-events-auto">
                            <button
                                onClick={() => setIsComposing(true)}
                                className="bg-gradient-to-r from-black to-[#2c2c2e] text-white px-8 py-4 rounded-full font-bold text-[16px] shadow-[0_16px_32px_rgba(0,0,0,0.3)] flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                            >
                                <Plus className="w-5 h-5" />
                                {myNote ? 'Replace Note' : 'Write a Note'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
