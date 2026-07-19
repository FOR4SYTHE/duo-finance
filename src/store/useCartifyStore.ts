import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartifyItem } from '@/types/finance';

export type CartifyMode = 'simple' | 'unplanned' | 'planned';

interface CartifyState {
    isActive: boolean;
    isBuildingList: boolean;
    mode: CartifyMode;
    budget: number; // in PHP
    items: CartifyItem[];
    activeCategory: string | null;
    
    // Actions
    startTrip: (budget: number, mode: CartifyMode) => void;
    finishBuildingList: () => void;
    endTrip: () => void;
    setActiveCategory: (category: string | null) => void;
    
    // Item Actions
    addPlannedItem: (name: string, category?: string) => void;
    addItem: (name: string, category: string | undefined, price: number, quantity?: number) => void;
    updateItemPrice: (id: string, price: number) => void;
    incrementQuantity: (id: string) => void;
    decrementQuantity: (id: string) => void;
    removeItem: (id: string) => void;
}

const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 15);
};

export const useCartifyStore = create<CartifyState>()(
    persist(
        (set, get) => ({
            isActive: false,
            isBuildingList: false,
            mode: 'simple',
            budget: 0,
            items: [],
            activeCategory: null,

            startTrip: (budget, mode) => set({ 
                isActive: true, 
                isBuildingList: mode === 'planned',
                budget, 
                mode, 
                items: [], 
                activeCategory: null 
            }),

            finishBuildingList: () => set({ isBuildingList: false }),

            endTrip: () => set({ 
                isActive: false, 
                isBuildingList: false,
                budget: 0, 
                mode: 'simple', 
                items: [], 
                activeCategory: null 
            }),

            setActiveCategory: (category) => set({ activeCategory: category }),

            addPlannedItem: (name, category) => {
                const newItem: CartifyItem = {
                    id: generateId(),
                    name,
                    category,
                    unitPrice: 0,
                    quantity: 0,
                    amount: 0,
                    currency: 'PHP',
                    status: 'still-need',
                    timestamp: Date.now()
                };
                set({ items: [...get().items, newItem] });
            },

            addItem: (name, category, price, quantity = 1) => {
                const newItem: CartifyItem = {
                    id: generateId(),
                    name,
                    category,
                    unitPrice: price,
                    quantity,
                    amount: price * quantity,
                    currency: 'PHP',
                    status: 'in-cart',
                    timestamp: Date.now()
                };
                set({ items: [...get().items, newItem] });
            },

            updateItemPrice: (id, price) => {
                set((state) => ({
                    items: state.items.map(item => {
                        if (item.id === id) {
                            const newQuantity = item.quantity === 0 ? 1 : item.quantity;
                            return {
                                ...item,
                                unitPrice: price,
                                quantity: newQuantity,
                                amount: price * newQuantity,
                                status: 'in-cart'
                            };
                        }
                        return item;
                    })
                }));
            },

            incrementQuantity: (id) => {
                set((state) => ({
                    items: state.items.map(item => {
                        if (item.id === id && item.status === 'in-cart') {
                            const newQuantity = item.quantity + 1;
                            return {
                                ...item,
                                quantity: newQuantity,
                                amount: item.unitPrice * newQuantity
                            };
                        }
                        return item;
                    })
                }));
            },

            decrementQuantity: (id) => {
                set((state) => ({
                    items: state.items.map(item => {
                        if (item.id === id && item.status === 'in-cart') {
                            const newQuantity = item.quantity - 1;
                            if (newQuantity <= 0) {
                                // Revert to still-need
                                return {
                                    ...item,
                                    unitPrice: 0,
                                    quantity: 0,
                                    amount: 0,
                                    status: 'still-need'
                                };
                            }
                            return {
                                ...item,
                                quantity: newQuantity,
                                amount: item.unitPrice * newQuantity
                            };
                        }
                        return item;
                    })
                }));
            },

            removeItem: (id) => {
                set((state) => ({
                    items: state.items.filter(item => item.id !== id)
                }));
            }
        }),
        {
            name: 'cartify-storage',
        }
    )
);
