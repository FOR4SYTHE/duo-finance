import React from "react";

export interface TabItem {
    id: string;
    icon?: React.ReactNode;
    label: string;
    activeClass: string;
    hoverClass: string;
}

export function PillTabRow({ tabs, activeTab, onSelect }: { tabs: TabItem[], activeTab: string | null, onSelect: (id: string) => void }) {
    return (
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2 w-full shrink-0">
            {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onSelect(isActive ? '' : tab.id)}
                        className={`flex items-center gap-1.5 px-3 py-2.5 rounded-full whitespace-nowrap transition-all duration-300 text-sm shrink-0 border ${
                            isActive
                                ? `font-medium ${tab.activeClass}` 
                                : `bg-white/[0.02] text-white/50 border-white/[0.05] hover:bg-white/[0.05] ${tab.hoverClass}`
                        }`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
