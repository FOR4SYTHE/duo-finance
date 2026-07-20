import { describe, it, expect, beforeEach } from 'vitest';
import { useCartifyStore } from '../src/store/useCartifyStore';

describe('Cartify Store tests', () => {
    beforeEach(() => {
        useCartifyStore.getState().endTrip();
    });

    it('should setup mode and budget correctly', () => {
        const store = useCartifyStore.getState();
        store.startTrip(1000, 'planned');
        const state = useCartifyStore.getState();
        expect(state.isActive).toBe(true);
        expect(state.mode).toBe('planned');
        expect(state.budget).toBe(1000);
        expect(state.isBuildingList).toBe(true);
    });

    it('should add planned items in still-need status', () => {
        const store = useCartifyStore.getState();
        store.startTrip(1000, 'planned');
        store.addPlannedItem('Milk', 'Dairy');
        const state = useCartifyStore.getState();
        expect(state.items.length).toBe(1);
        expect(state.items[0].name).toBe('Milk');
        expect(state.items[0].status).toBe('still-need');
        expect(state.items[0].unitPrice).toBe(0);
        expect(state.items[0].quantity).toBe(0);
        expect(state.items[0].amount).toBe(0);
    });

    it('should update item price and transition to in-cart', () => {
        const store = useCartifyStore.getState();
        store.startTrip(1000, 'planned');
        store.addPlannedItem('Milk', 'Dairy');
        let state = useCartifyStore.getState();
        const milkId = state.items[0].id;
        
        store.updateItemPrice(milkId, 150);
        state = useCartifyStore.getState();
        expect(state.items[0].status).toBe('in-cart');
        expect(state.items[0].unitPrice).toBe(150);
        expect(state.items[0].quantity).toBe(1);
        expect(state.items[0].amount).toBe(150);
    });

    it('should increment and decrement quantity correctly', () => {
        const store = useCartifyStore.getState();
        store.startTrip(1000, 'planned');
        store.addPlannedItem('Milk', 'Dairy');
        let state = useCartifyStore.getState();
        const milkId = state.items[0].id;
        
        store.updateItemPrice(milkId, 150);
        store.incrementQuantity(milkId);
        state = useCartifyStore.getState();
        expect(state.items[0].quantity).toBe(2);
        expect(state.items[0].amount).toBe(300);

        store.decrementQuantity(milkId);
        state = useCartifyStore.getState();
        expect(state.items[0].quantity).toBe(1);
        expect(state.items[0].amount).toBe(150);
    });

    it('should handle zero-quantity reversion logic correctly', () => {
        const store = useCartifyStore.getState();
        store.startTrip(1000, 'planned');
        store.addPlannedItem('Milk', 'Dairy');
        let state = useCartifyStore.getState();
        const milkId = state.items[0].id;
        
        store.updateItemPrice(milkId, 150);
        store.decrementQuantity(milkId);
        state = useCartifyStore.getState();
        expect(state.items[0].quantity).toBe(0);
        expect(state.items[0].status).toBe('still-need');
        expect(state.items[0].unitPrice).toBe(0);
        expect(state.items[0].amount).toBe(0);
    });

    it('should remove items correctly', () => {
        const store = useCartifyStore.getState();
        store.startTrip(1000, 'planned');
        store.addPlannedItem('Milk', 'Dairy');
        let state = useCartifyStore.getState();
        const milkId = state.items[0].id;
        
        store.removeItem(milkId);
        state = useCartifyStore.getState();
        expect(state.items.length).toBe(0);
    });
});
