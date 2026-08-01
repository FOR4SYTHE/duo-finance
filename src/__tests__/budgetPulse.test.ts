import { describe, it, expect } from 'vitest';
import { calculateHouseholdPulse } from '../utils/budgetPulse';
import { BudgetConfig, BudgetCategory, ExpenseEntry } from '../types/finance';
import { Bill } from '../store/useBillsStore';

describe('Household Pulse Logic', () => {
    const mockConfig: BudgetConfig = {
        targetAmount: 100000,
        period: 'monthly',
        jarAllowedPercentage: 20
    };

    const mockCategories: BudgetCategory[] = [
        { id: '1', name: 'Rent', targetAmount: 30000, icon: '', color: '' },
        { id: '2', name: 'Groceries', targetAmount: 20000, icon: '', color: '' }
    ];

    it('calculates safeToSpendToday handling mid-month correctly', () => {
        // Unallocated = 100k - 50k = 50k
        // Jar Pool = 20% of 50k = 10k
        // Ideal Daily = (50k targets + 10k jar) / 30 = 60k / 30 = 2000/day.

        // If today is the 16th of a 30-day month, daysRemaining = 15.
        // Spent: Rent (15k), Groceries (10k), Jar (0). Total spent = 25k.
        // Safe Remaining = (50k budgets - 25k spent) + 10k jar - 0 bills = 35k.
        // Safe to spend today = 35k / 15 days = 2333.33/day.

        const monthEntries: ExpenseEntry[] = [
            { id: 'e1', amount: 15000, category: 'Rent', timestamp: 1693872000000, currency: 'PHP' },
            { id: 'e2', amount: 10000, category: 'Groceries', timestamp: 1694304000000, currency: 'PHP' }
        ];

        const mockCurrentDate = new Date(2023, 8, 16); // Sept 16, 2023. Sept has 30 days.

        const result = calculateHouseholdPulse(
            mockConfig,
            mockCategories,
            monthEntries,
            [], // no bills
            '2023-09',
            mockCurrentDate
        );

        expect(result.daysRemaining).toBe(15);
        expect(result.idealDailyAverage).toBe(2000);
        expect(result.safeToSpendToday).toBeCloseTo(35000 / 15);
        
        // Ratio = 2333 / 2000 = 1.16 -> Excellent
        expect(result.status).toBe('Excellent');
    });

    it('factors out already paid bills', () => {
        const mockCurrentDate = new Date(2023, 8, 16); 

        const bills: Bill[] = [
            { id: 'b1', name: 'Internet', amount: 2000, currency: 'PHP', dueDay: 20, category: 'Utilities', isRecurring: true, reminderEnabled: false, isPaid: false },
            { id: 'b2', name: 'Water', amount: 1000, currency: 'PHP', dueDay: 25, category: 'Utilities', isRecurring: true, reminderEnabled: false, isPaid: true } // Paid, should not be subtracted
        ];

        const result = calculateHouseholdPulse(
            mockConfig,
            mockCategories,
            [], // 0 spent
            bills,
            '2023-09',
            mockCurrentDate
        );

        // Safe remaining: 50k targets + 10k jar - 2000 unpaid bills = 58,000
        // safeToSpendToday = 58,000 / 15 = 3866.66
        expect(result.safeToSpendToday).toBeCloseTo(58000 / 15);
        expect(result.unpaidBillsCount).toBe(1);
    });

    it('handles archived months by returning 0s', () => {
        const mockCurrentDate = new Date(2023, 9, 5); // Oct 5

        const result = calculateHouseholdPulse(
            mockConfig,
            mockCategories,
            [], 
            [],
            '2023-09', // September is past
            mockCurrentDate
        );

        expect(result.daysRemaining).toBe(0);
        expect(result.status).toBe('Archived');
        expect(result.safeToSpendToday).toBe(0);
    });
    it('returns Setup status for zero budget edge case', () => {
        const mockCurrentDate = new Date(2023, 8, 5);
        const zeroConfig = { ...mockConfig, targetAmount: 0 };
        const result = calculateHouseholdPulse(
            zeroConfig,
            [], // 0 categories
            [], 
            [],
            '2023-09',
            mockCurrentDate
        );

        expect(result.status).toBe('Setup');
        expect(result.idealDailyAverage).toBe(0);
        expect(result.ratio).toBe(0);
    });

    it('evaluates exact boundary values for each band (1.0, 0.75, 0.25)', () => {
        // Ideal Daily Average = (50k targets + 10k jar) / 30 = 2000/day.
        // Days remaining = 15.
        // We will mock total spent to achieve exactly the right remaining safe amount.
        const mockCurrentDate = new Date(2023, 8, 16); 
        
        // 1.0 Boundary (Safe Remaining = 30k) -> 30k / 15 = 2000
        // Spent = 50k targets + 10k jar - 30k = 30k spent.
        const exactExcellentResult = calculateHouseholdPulse(
            mockConfig, mockCategories,
            [{ id: 'e1', amount: 30000, category: 'Rent', timestamp: 1693872000000, currency: 'PHP' }], 
            [], '2023-09', mockCurrentDate
        );
        expect(exactExcellentResult.ratio).toBe(1.0);
        expect(exactExcellentResult.status).toBe('Excellent');

        // 0.75 Boundary (Safe Remaining = 22.5k) -> 22.5k / 15 = 1500
        // Spent = 60k - 22.5k = 37.5k spent.
        const exactOnTrackResult = calculateHouseholdPulse(
            mockConfig, mockCategories,
            [{ id: 'e2', amount: 37500, category: 'Rent', timestamp: 1693872000000, currency: 'PHP' }], 
            [], '2023-09', mockCurrentDate
        );
        expect(exactOnTrackResult.ratio).toBe(0.75);
        expect(exactOnTrackResult.status).toBe('On Track');

        // 0.25 Boundary (Safe Remaining = 7.5k) -> 7.5k / 15 = 500
        // Spent = 60k - 7.5k = 52.5k spent.
        const exactTightResult = calculateHouseholdPulse(
            mockConfig, mockCategories,
            [{ id: 'e3', amount: 52500, category: 'Rent', timestamp: 1693872000000, currency: 'PHP' }], 
            [], '2023-09', mockCurrentDate
        );
        expect(exactTightResult.ratio).toBe(0.25);
        expect(exactTightResult.status).toBe('Tight');
    });

    it('evaluates a genuinely negative safe_to_spend_today (real deficit)', () => {
        const mockCurrentDate = new Date(2023, 8, 16); 
        
        // Target is 60k, let's spend 80k.
        // Safe Remaining = -20k
        // safeToSpend = -20k / 15 = -1333.33
        const deficitResult = calculateHouseholdPulse(
            mockConfig, mockCategories,
            [{ id: 'e1', amount: 80000, category: 'Rent', timestamp: 1693872000000, currency: 'PHP' }], 
            [], '2023-09', mockCurrentDate
        );

        expect(deficitResult.safeToSpendToday).toBeLessThan(0);
        expect(deficitResult.ratio).toBeLessThan(0);
        expect(deficitResult.status).toBe('Over');
    });

    it('dynamically calculates days-in-month for February (Leap Year vs Non-Leap Year)', () => {
        // Non-Leap Year: Feb 2023
        const resultNonLeap = calculateHouseholdPulse(
            mockConfig, mockCategories, [], [], '2023-02', new Date(2023, 1, 15) // Feb 15
        );
        // Total days = 28. Feb 15 -> days remaining = 28 - 15 + 1 = 14
        expect(resultNonLeap.daysRemaining).toBe(14);
        
        // Leap Year: Feb 2024
        const resultLeap = calculateHouseholdPulse(
            mockConfig, mockCategories, [], [], '2024-02', new Date(2024, 1, 15) // Feb 15
        );
        // Total days = 29. Feb 15 -> days remaining = 29 - 15 + 1 = 15
        expect(resultLeap.daysRemaining).toBe(15);
    });
});
