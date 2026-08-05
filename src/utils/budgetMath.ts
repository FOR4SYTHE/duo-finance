import { BudgetPeriod, BudgetCategory, BudgetConfig, ExpenseEntry } from "@/types/finance";

// Cache buster for Turbopack HMR
const periodMultipliers: Record<BudgetPeriod, number> = {
    'weekly': 4.333,
    'monthly': 1,
    '3-months': 0.3333,
    '6-months': 0.1666,
    'annually': 0.0833
};

export function getDisplayValue(monthlyValue: number, period: BudgetPeriod) {
    return monthlyValue / periodMultipliers[period];
}

export function getCanonicalValue(displayValue: number, period: BudgetPeriod) {
    return displayValue * periodMultipliers[period];
}

export function getHistoricalTarget(history: Record<string, number> | undefined, currentTarget: number, requestedMonth: string | undefined): number {
    if (!history || !requestedMonth) return currentTarget;
    if (history[requestedMonth] !== undefined) return history[requestedMonth];
    
    // Find latest month in history that is <= requestedMonth
    const pastMonths = Object.keys(history).filter(m => m <= requestedMonth).sort();
    if (pastMonths.length > 0) {
        return history[pastMonths[pastMonths.length - 1]];
    }
    
    // If no past months, find the earliest future month in history
    const futureMonths = Object.keys(history).filter(m => m > requestedMonth).sort();
    if (futureMonths.length > 0) {
        return history[futureMonths[0]];
    }
    
    return currentTarget;
}

export function calculateAllocations(config: BudgetConfig, categories: BudgetCategory[], totalSpent: number, activeMonth?: string) {
    const historicalTarget = getHistoricalTarget(config.targetHistory, config.targetAmount, activeMonth);
    const displayTarget = getDisplayValue(historicalTarget, config.period);
    
    const displayAllocated = categories.reduce((sum, cat) => {
        const catTarget = getHistoricalTarget(cat.targetHistory, cat.targetAmount, activeMonth);
        return sum + getDisplayValue(catTarget, config.period);
    }, 0);
    const displayUnallocated = Math.max(0, displayTarget - displayAllocated - totalSpent);
    
    return {
        displayTarget,
        displayAllocated,
        displayUnallocated
    };
}

export const filterEntriesByMonth = (entries: ExpenseEntry[], monthKey: string): ExpenseEntry[] => {
    // monthKey is in format "YYYY-MM"
    return entries.filter(entry => {
        const d = new Date(entry.timestamp);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return key === monthKey;
    });
};

export const sumByCategory = (entries: ExpenseEntry[], categoryName: string): number => {
    return entries
        .filter(e => e.category?.toLowerCase() === categoryName.toLowerCase())
        .reduce((sum, e) => sum + e.amount, 0);
};
