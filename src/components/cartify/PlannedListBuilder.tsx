"use client";

import { useState } from "react";
import { useCartifyStore } from "@/store/useCartifyStore";
import { Plus, ChevronRight, ListTodo } from "lucide-react";

export function PlannedListBuilder() {
    const { items, addPlannedItem, finishBuildingList } = useCartifyStore();
    const [newItemName, setNewItemName] = useState("");

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newItemName.trim()) {
            addPlannedItem(newItemName.trim());
            setNewItemName("");
        }
    };

    return (
        <div className="flex flex-col w-full min-h-full relative z-20 pb-10">
            <div className="flex items-center gap-3 mb-6 mt-4">
                <div className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center border border-white/[0.05]">
                    <ListTodo className="w-5 h-5 text-white/70" />
                </div>
                <div>
                    <h2 className="text-white text-lg font-medium tracking-tight">Build your list</h2>
                    <p className="text-white/50 text-xs">Add items to buy. Enter prices later.</p>
                </div>
            </div>

            <form onSubmit={handleAdd} className="flex gap-2 mb-8">
                <input 
                    type="text" 
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="e.g. Milk, Eggs, Bread..." 
                    className="flex-1 h-12 rounded-[16px] bg-white/[0.03] border border-white/[0.05] px-4 text-white placeholder-white/30 outline-none focus:border-white/20 transition-all text-sm"
                />
                <button 
                    type="submit"
                    disabled={!newItemName.trim()}
                    className="h-12 px-6 rounded-[16px] bg-white text-black font-medium disabled:opacity-50 disabled:bg-white/20 disabled:text-white/50 transition-all"
                >
                    Add
                </button>
            </form>

            <div className="flex-1 flex flex-col gap-2">
                {items.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                        <ListTodo className="w-8 h-8 mb-3" />
                        <span className="text-sm">List is empty</span>
                    </div>
                ) : (
                    items.map((item, idx) => (
                        <div key={item.id} className="w-full bg-white/[0.02] border border-white/[0.03] rounded-[16px] p-4 flex items-center gap-3">
                            <span className="text-white/30 text-xs w-4">{idx + 1}</span>
                            <span className="text-white text-sm flex-1">{item.name}</span>
                        </div>
                    ))
                )}
            </div>

            <button
                onClick={finishBuildingList}
                className="w-full mt-6 h-[60px] rounded-full bg-white text-black font-semibold text-base tracking-wide flex items-center justify-between px-6 hover:opacity-90 active:scale-[0.98] transition-all duration-300 group"
            >
                <span className="pl-2">Start Shopping</span>
                <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                    <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
                </div>
            </button>
        </div>
    );
}
