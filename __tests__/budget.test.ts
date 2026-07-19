import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useBudgetStore } from '../src/store/useBudgetStore';
import { calculateAllocations } from '../src/utils/budgetMath';
import { POST } from '../src/app/api/suggest-categories/route';
import { BudgetConfig } from '../src/types/finance';

describe('Budget Store & Math', () => {
    beforeEach(() => {
        // Reset Zustand store state before each test if needed
        // Assuming default targetAmount is 40000 and it comes with DEFAULT_CATEGORIES
        useBudgetStore.setState({
            config: { targetAmount: 40000, period: 'monthly', jarAllowedPercentage: 20 },
            categories: [] // Start empty for clean testing
        });
    });

    it('should add a category correctly (simulating manual, preset, or AI)', () => {
        const store = useBudgetStore.getState();
        store.addCategory({
            name: 'Test Category',
            icon: 'TestIcon',
            color: '#30D158',
            targetAmount: 5000
        });

        const newStore = useBudgetStore.getState();
        expect(newStore.categories.length).toBe(1);
        expect(newStore.categories[0].name).toBe('Test Category');
        expect(newStore.categories[0].targetAmount).toBe(5000);
        expect(newStore.categories[0].id).toBeDefined();
    });

    it('should correctly calculate allocated and unallocated amounts', () => {
        const config: BudgetConfig = { targetAmount: 20000, period: 'monthly', jarAllowedPercentage: 20 };
        
        const { displayAllocated, displayUnallocated } = calculateAllocations(config, [
            { id: '1', name: 'Rent', icon: 'Home', color: '#000', targetAmount: 10000 },
            { id: '2', name: 'Food', icon: 'Food', color: '#000', targetAmount: 5000 }
        ]);

        expect(displayAllocated).toBe(15000);
        expect(displayUnallocated).toBe(5000); // 20000 - 15000
    });

    it('should cap unallocated at 0 if allocated exceeds target', () => {
        const config: BudgetConfig = { targetAmount: 10000, period: 'monthly', jarAllowedPercentage: 20 };
        
        const { displayAllocated, displayUnallocated } = calculateAllocations(config, [
            { id: '1', name: 'Rent', icon: 'Home', color: '#000', targetAmount: 12000 }
        ]);

        expect(displayAllocated).toBe(12000);
        expect(displayUnallocated).toBe(0); // Cannot be negative
    });
});

describe('API Route - suggest-categories', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.resetModules();
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('should fallback gracefully (return 500 with error JSON) if GEMINI_API_KEY is missing', async () => {
        delete process.env.GEMINI_API_KEY;

        const req = new Request('http://localhost/api/suggest-categories', {
            method: 'POST',
            body: JSON.stringify({ currentCategories: [] })
        });

        const res = await POST(req);
        
        expect(res.status).toBe(500);
        
        const json = await res.json();
        expect(json.error).toBeDefined();
        expect(json.error).toContain('missing');
    });
});
