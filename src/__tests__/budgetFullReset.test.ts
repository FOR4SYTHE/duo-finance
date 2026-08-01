import { describe, it, expect, beforeEach } from 'vitest';
import { useBudgetStore } from '../store/useBudgetStore';
import { useSpendStore } from '../store/useSpendStore';
import { calculateHouseholdPulse, computeCategoryStatus, computeCategoryMemory } from '../utils/budgetPulse';

describe('Fresh Install Reset Simulation', () => {
    beforeEach(() => {
        useBudgetStore.getState().reset();
        useSpendStore.getState().clearEntries();
    });

    it('forces the Pulse to Setup state on a completely empty store', () => {
        const { config, categories } = useBudgetStore.getState();
        const { entries } = useSpendStore.getState();
        const bills: any[] = []; // empty bills store equivalent

        const pulse = calculateHouseholdPulse(
            config,
            categories,
            entries,
            bills,
            '2026-08',
            new Date(2026, 7, 15) // arbitrary mid-month date
        );

        expect(pulse.status).toBe('Setup');
    });

    it('forces default categories to Setup state and no memory on a completely empty store', () => {
        const { categories } = useBudgetStore.getState();
        
        // Grab a default category (e.g., Rent or Groceries)
        const cat = categories[0];
        
        // It should have targetAmount: 0 and no spendHistory
        expect(cat.targetAmount).toBe(0);
        expect(cat.spendHistory).toBeUndefined();

        const status = computeCategoryStatus(0, cat.targetAmount);
        expect(status.label).toBe('Setup');

        const memory = computeCategoryMemory(cat, [], '2026-08', (v) => v, '₱');
        expect(memory).toBeNull(); // Empty memory -> "No history yet" in UI
    });
});
