import { Search, Plus, ExternalLink, FileText, FolderLock, Plane, BarChart3, Target, Pin } from 'lucide-react';
import { useAIChatStore } from '@/store/useAIChatStore';
import { usePluginsStore } from '@/store/usePluginsStore';

export function PluginsView() {
    const { setActiveTab } = useAIChatStore();
    const { pinnedPlugins, togglePinnedPlugin } = usePluginsStore();

    const householdPlugins = [
        {
            id: 'scratchpad',
            name: 'Scratchpad',
            description: 'A rich-text notepad synced directly with DUO AI.',
            icon: <FileText className="w-5 h-5 text-white" />,
            color: 'bg-emerald-500',
            active: true
        },
        {
            id: 'receipt-vault',
            name: 'Receipt & Doc Vault',
            description: 'AI-scanned storage for warranties, visas, and household receipts.',
            icon: <FolderLock className="w-5 h-5 text-white" />,
            color: 'bg-blue-500',
            active: true
        },
        {
            id: 'relocation-hub',
            name: 'Relocation Hub',
            description: 'Flight tracker, shipping calculator, and SA to PH move checklist.',
            icon: <Plane className="w-5 h-5 text-white" />,
            color: 'bg-purple-500',
            active: true
        }
    ];

    const financePlugins = [
        {
            id: 'exchange-alerts',
            name: 'Smart Exchange Alerts',
            description: 'Get notified when the ZAR to PHP rate hits your target.',
            icon: <BarChart3 className="w-5 h-5 text-white" />,
            color: 'bg-orange-500',
            active: true
        },
        {
            id: 'dream-board',
            name: 'Dream Board Goals',
            description: 'Visual savings tracker for big purchases and Boracay trips.',
            icon: <Target className="w-5 h-5 text-white" />,
            color: 'bg-rose-500',
            active: true
        }
    ];

    const PluginCard = ({ plugin }: { plugin: any }) => {
        const isPinned = pinnedPlugins.includes(plugin.id);
        return (
            <div 
                onClick={() => {
                    if (plugin.active) {
                        setActiveTab(plugin.id as any);
                    } else {
                        // Placeholder for future routing
                    }
                }}
                className={`flex items-start gap-4 p-4 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] transition-all group cursor-pointer hover:border-white/20 relative`}
            >
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        togglePinnedPlugin(plugin.id);
                    }}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isPinned ? 'bg-white/10' : 'bg-transparent hover:bg-white/5 opacity-0 group-hover:opacity-100'}`}
                >
                    <Pin className={`w-4 h-4 ${isPinned ? 'text-white' : 'text-white/40'}`} />
                </button>

                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${plugin.color}`}>
                    {plugin.icon}
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-1 pr-8">
                    <h3 className="text-[15px] font-semibold text-white truncate">{plugin.name}</h3>
                    <p className="text-[13px] text-white/50 line-clamp-2 leading-snug">{plugin.description}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-[#050505] relative w-full items-center overflow-y-auto pb-32">
            
            {/* Header */}
            <div className="w-full max-w-4xl px-6 pt-16 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Plugins</h1>
                    <p className="text-[15px] text-white/50">Work with DUO AI across your favorite household tools.</p>
                </div>
                
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input 
                        type="text" 
                        placeholder="Search plugins" 
                        className="w-full md:w-64 bg-white/5 border border-white/10 rounded-full py-2 pl-9 pr-4 text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-colors"
                    />
                </div>
            </div>

            {/* Content Grids */}
            <div className="w-full max-w-4xl px-6 flex flex-col gap-10">
                
                {/* Household Management */}
                <section>
                    <h2 className="text-[12px] font-bold text-white/40 uppercase tracking-wider mb-4 pl-1">Household Management</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {householdPlugins.map(p => <PluginCard key={p.id} plugin={p} />)}
                    </div>
                </section>

                {/* Finance & Goals */}
                <section>
                    <h2 className="text-[12px] font-bold text-white/40 uppercase tracking-wider mb-4 pl-1">Finance & Goals</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {financePlugins.map(p => <PluginCard key={p.id} plugin={p} />)}
                    </div>
                </section>

            </div>
        </div>
    );
}
