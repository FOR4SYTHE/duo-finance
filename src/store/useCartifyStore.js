"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCartifyStore = void 0;
const zustand_1 = require("zustand");
const middleware_1 = require("zustand/middleware");
const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 15);
};
exports.useCartifyStore = (0, zustand_1.create)()((0, middleware_1.persist)((set, get) => ({
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
        const newItem = {
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
        const newItem = {
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
}), {
    name: 'cartify-storage',
}));
