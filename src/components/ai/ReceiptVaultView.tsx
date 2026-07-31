import { useState, useRef } from 'react';
import { usePluginsStore, VaultDocument } from '@/store/usePluginsStore';
import { useAIChatStore } from '@/store/useAIChatStore';
import { Upload, Receipt, FileCheck, Plane, Search, Trash2, ArrowLeft, Loader2, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ReceiptVaultView() {
    const { documents, addDocument, deleteDocument } = usePluginsStore();
    const { setActiveTab } = useAIChatStore();
    const [isUploading, setIsUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedDoc, setSelectedDoc] = useState<VaultDocument | null>(null);

    const getCategoryIcon = (category: string) => {
        switch(category) {
            case 'receipt': return <Receipt className="w-5 h-5 text-emerald-400" />;
            case 'warranty': return <FileCheck className="w-5 h-5 text-blue-400" />;
            case 'visa': return <Plane className="w-5 h-5 text-purple-400" />;
            default: return <Receipt className="w-5 h-5 text-white/50" />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch(category) {
            case 'receipt': return 'bg-emerald-500/10 border-emerald-500/20';
            case 'warranty': return 'bg-blue-500/10 border-blue-500/20';
            case 'visa': return 'bg-purple-500/10 border-purple-500/20';
            default: return 'bg-white/5 border-white/10';
        }
    };

    // Helper: compress image to a tiny thumbnail (max 200px)
    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_SIZE = 200;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.5));
                };
                img.onerror = reject;
                img.src = e.target?.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // Compress thumbnail for UI
            const thumbnailBase64 = await compressImage(file);

            // Get original file as base64 purely for sending to AI (we discard it after)
            const reader = new FileReader();
            reader.readAsDataURL(file);
            
            reader.onload = async () => {
                const base64Data = reader.result as string;
                const base64Content = base64Data.split(',')[1];

                const res = await fetch('/api/ai/scan-document', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        image: base64Content,
                        mimeType: file.type
                    })
                });

                if (!res.ok) throw new Error('Failed to scan document');
                const data = await res.json();

                const newDoc: VaultDocument = {
                    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                    title: data.title || 'Untitled Document',
                    category: data.category || 'other',
                    date: data.date || new Date().toISOString().split('T')[0],
                    amount: data.amount,
                    tags: data.tags || [],
                    thumbnailBase64,
                    currency: 'PHP'
                };

                addDocument(newDoc);
                setIsUploading(false);
            };
        } catch (error) {
            console.error(error);
            setIsUploading(false);
        }
    };

    const filteredDocs = documents.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="flex flex-col h-full bg-[#050505] relative w-full items-center">
            
            {/* Header */}
            <div className="w-full max-w-4xl px-6 pt-8 pb-6 flex flex-col gap-6 border-b border-white/[0.05] shrink-0 sticky top-0 z-10 bg-[#050505]/80 backdrop-blur-xl">
                
                <div className="flex items-center justify-between">
                    <button 
                        onClick={() => setActiveTab('plugins')}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-white/70" />
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-[14px] transition-colors disabled:opacity-50"
                    >
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        <span>{isUploading ? 'Scanning AI...' : 'Upload Document'}</span>
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        accept="image/*" 
                        className="hidden" 
                    />
                </div>

                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Document Vault</h2>
                    <p className="text-[14px] text-white/50">Receipts, warranties, and visa docs auto-tagged by DUO AI.</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input 
                        type="text" 
                        placeholder="Search by store, category, or tags..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-colors"
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 w-full max-w-4xl px-6 py-6 overflow-y-auto custom-scrollbar pb-32">
                {documents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center mt-10">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                            <ImageIcon className="w-8 h-8 text-white/20" />
                        </div>
                        <h3 className="text-white font-medium text-lg mb-1">Your vault is empty</h3>
                        <p className="text-white/40 text-sm max-w-[250px]">Upload a photo of any receipt or document. AI will automatically read and sort it.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {filteredDocs.map((doc) => (
                            <motion.div 
                                layoutId={`doc-${doc.id}`}
                                key={doc.id}
                                onClick={() => setSelectedDoc(doc)}
                                className={`flex flex-col p-4 rounded-2xl border cursor-pointer hover:border-white/30 transition-colors group ${getCategoryColor(doc.category)} bg-white/[0.02]`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-2 rounded-lg border ${getCategoryColor(doc.category)} bg-black/20`}>
                                        {getCategoryIcon(doc.category)}
                                    </div>
                                    {doc.thumbnailBase64 && (
                                        <div className="w-10 h-10 rounded-md overflow-hidden opacity-50 group-hover:opacity-100 transition-opacity">
                                            <img src={doc.thumbnailBase64} alt="Thumbnail" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                                <h4 className="text-white font-semibold text-[15px] truncate mb-1">{doc.title}</h4>
                                {doc.amount ? (
                                    <span className="text-white/70 text-[13px] font-medium mb-3">₱{doc.amount.toLocaleString()}</span>
                                ) : (
                                    <span className="text-white/50 text-[13px] font-medium mb-3">{doc.date}</span>
                                )}
                                <div className="flex flex-wrap gap-1.5 mt-auto">
                                    {doc.tags.slice(0, 2).map((tag, i) => (
                                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70 uppercase tracking-wider">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Sheet Overlay */}
            <AnimatePresence>
                {selectedDoc && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                        onClick={() => setSelectedDoc(null)}
                    >
                        <motion.div 
                            layoutId={`doc-${selectedDoc.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className={`w-full max-w-md p-6 rounded-3xl border border-white/10 bg-[#111] shadow-2xl flex flex-col gap-6`}
                        >
                            <div className="flex justify-between items-start">
                                <div className={`p-3 rounded-xl border ${getCategoryColor(selectedDoc.category)} bg-black/40`}>
                                    {getCategoryIcon(selectedDoc.category)}
                                </div>
                                <button onClick={() => setSelectedDoc(null)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                    <ArrowLeft className="w-4 h-4 text-white/70 rotate-[-90deg]" />
                                </button>
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">{selectedDoc.title}</h3>
                                {selectedDoc.amount && <div className="text-3xl font-light text-white tracking-tight">₱{selectedDoc.amount.toLocaleString()}</div>}
                                <div className="text-[14px] text-white/50 mt-1">Date: {selectedDoc.date}</div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {selectedDoc.tags.map((tag, i) => (
                                    <span key={i} className="text-[12px] px-3 py-1 rounded-full bg-white/10 text-white/80 uppercase tracking-wider font-medium">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <div className="w-full h-px bg-white/5 my-2" />

                            <button 
                                onClick={() => {
                                    deleteDocument(selectedDoc.id);
                                    setSelectedDoc(null);
                                }}
                                className="w-full py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold text-[14px] transition-colors flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" /> Delete Document
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
