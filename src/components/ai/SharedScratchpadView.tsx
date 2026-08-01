import { useRef, useEffect } from 'react';
import { Bold, Italic, List, ListOrdered, Underline, Eraser, ArrowLeft } from 'lucide-react';
import { usePluginsStore } from '@/store/usePluginsStore';
import { useAIChatStore } from '@/store/useAIChatStore';
import { DuoAIIcon } from '@/components/ui/DuoAIIcon';

export function SharedScratchpadView() {
    const editorRef = useRef<HTMLDivElement>(null);
    const { scratchpadContent, setScratchpadContent } = usePluginsStore();
    const { setActiveTab } = useAIChatStore();

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== scratchpadContent) {
            editorRef.current.innerHTML = scratchpadContent || '';
        }
    }, []); // Hydrate once

    const handleInput = () => {
        if (editorRef.current) {
            setScratchpadContent(editorRef.current.innerHTML);
        }
    };

    const format = (command: string) => {
        document.execCommand(command, false);
        handleInput();
        editorRef.current?.focus();
    };

    return (
        <div className="flex flex-col h-full bg-[#050505] relative w-full items-center">
            {/* Header */}
            <div className="w-full max-w-3xl px-6 py-6 flex items-center justify-between border-b border-white/[0.05] shrink-0">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setActiveTab('plugins')}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-white/70" />
                    </button>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        <span className="text-emerald-400 text-xl">📝</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Shared Scratchpad</h2>
                        <p className="text-[13px] text-white/50">Your notes are automatically synced with DUO AI.</p>
                    </div>
                </div>
                
                {/* Ask AI shortcut */}
                <button 
                    onClick={() => setActiveTab('chat')}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[13px] font-semibold text-white/80 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <DuoAIIcon className="w-[14px] h-[14px] text-emerald-400" forceState="star-idle" />
                    <span>Ask DUO</span>
                </button>
            </div>

            {/* Toolbar */}
            <div className="w-full max-w-3xl px-4 py-2 flex items-center gap-1 border-b border-white/[0.05] bg-[#0A0A0A] shrink-0 sticky top-0 z-10">
                <button onClick={() => format('bold')} className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors" title="Bold"><Bold size={16} /></button>
                <button onClick={() => format('italic')} className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors" title="Italic"><Italic size={16} /></button>
                <button onClick={() => format('underline')} className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors" title="Underline"><Underline size={16} /></button>
                <div className="w-px h-5 bg-white/10 mx-2" />
                <button onClick={() => format('insertUnorderedList')} className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors" title="Bullet List"><List size={16} /></button>
                <button onClick={() => format('insertOrderedList')} className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors" title="Numbered List"><ListOrdered size={16} /></button>
                <div className="flex-1" />
                <button onClick={() => format('removeFormat')} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white/80 transition-colors" title="Clear Formatting"><Eraser size={16} /></button>
            </div>

            {/* Editor Area */}
            <div className="flex-1 w-full max-w-3xl px-6 py-8 overflow-y-auto custom-scrollbar pb-32 cursor-text" onClick={() => editorRef.current?.focus()}>
                <div 
                    ref={editorRef}
                    onInput={handleInput}
                    contentEditable
                    suppressContentEditableWarning
                    className="w-full min-h-full outline-none text-[16px] leading-[1.8] text-white/90 font-medium whitespace-pre-wrap
                    [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4 [&>ul>li]:mb-1
                    [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4 [&>ol>li]:mb-1
                    [&>b]:text-white [&>b]:font-bold [&>strong]:text-white [&>strong]:font-bold
                    [&>i]:text-white/80 [&>em]:text-white/80
                    [&>u]:underline [&>u]:underline-offset-4
                    empty:before:content-['Type_your_notes_here...'] empty:before:text-white/30 empty:before:pointer-events-none"
                />
            </div>
        </div>
    );
}
