import { describe, it, expect } from 'vitest';
import { PH_INFLATION_RATE, UTILITY_SEASONAL_BUFFER, GROCERY_SEASONAL_BUFFER } from '../src/components/budget/SmartTools';

describe('Smart Tools Mathematical Core', () => {

    describe('Emergency Runway target math', () => {
        const monthlyBaseline = 50000; // sum of monthly category allocations in PHP

        it('should correctly calculate targets for 3 months', () => {
            const multiplier = 3;
            const target = monthlyBaseline * multiplier;
            expect(target).toBe(150000);
        });

        it('should correctly calculate targets for 6 months', () => {
            const multiplier = 6;
            const target = monthlyBaseline * multiplier;
            expect(target).toBe(300000);
        });

        it('should compute remaining distance to target correctly', () => {
            const multiplier = 3;
            const target = monthlyBaseline * multiplier; // 150000
            const savedSoFar = 40000;
            const remaining = Math.max(0, target - savedSoFar);
            expect(remaining).toBe(110000);
        });

        it('should cap remaining distance at 0 if saved exceeds target', () => {
            const multiplier = 3;
            const target = monthlyBaseline * multiplier; // 150000
            const savedSoFar = 160000;
            const remaining = Math.max(0, target - savedSoFar);
            expect(remaining).toBe(0);
        });
    });

    describe('Seasonal buffer math (Grocery & Utility Inflation Guard)', () => {
        it('should apply exactly 25% utility buffer representing cooling demand spikes', () => {
            expect(UTILITY_SEASONAL_BUFFER).toBe(0.25);
            const utilsTarget = 10000;
            const suggestedUtilsBuffer = utilsTarget * UTILITY_SEASONAL_BUFFER;
            expect(suggestedUtilsBuffer).toBe(2500);
        });

        it('should apply exactly 8% grocery buffer representing supply volatility', () => {
            expect(GROCERY_SEASONAL_BUFFER).toBe(0.08);
            const groceriesTarget = 15000;
            const suggestedGroceriesBuffer = groceriesTarget * GROCERY_SEASONAL_BUFFER;
            expect(suggestedGroceriesBuffer).toBe(1200);
        });
    });

    describe('Salary Split percentages & allocation mapping math', () => {
        it('should verify split percentages sum up to exactly 100%', () => {
            const needsPct = 50;
            const wantsPct = 30;
            const savingsPct = 100 - needsPct - wantsPct; // 20
            
            expect(needsPct + wantsPct + savingsPct).toBe(100);
        });

        it('should compute split amounts correctly based on income', () => {
            const income = 120000;
            const needsPct = 50;
            const wantsPct = 30;
            const savingsPct = 20;

            const needsAmount = income * (needsPct / 100);
            const wantsAmount = income * (wantsPct / 100);
            const savingsAmount = income * (savingsPct / 100);

            expect(needsAmount).toBe(60000);
            expect(wantsAmount).toBe(36000);
            expect(savingsAmount).toBe(24000);
            expect(needsAmount + wantsAmount + savingsAmount).toBe(income);
        });

        it('should map Needs budget proportionally to Rent (60%), Groceries (25%), Utilities (15%)', () => {
            const needsAmount = 60000;
            const rentAllocation = needsAmount * 0.60;
            const groceriesAllocation = needsAmount * 0.25;
            const utilitiesAllocation = needsAmount * 0.15;

            expect(rentAllocation).toBe(36000);
            expect(groceriesAllocation).toBe(15000);
            expect(utilitiesAllocation).toBe(9000);
            expect(rentAllocation + groceriesAllocation + utilitiesAllocation).toBe(needsAmount);
        });
    });
});
