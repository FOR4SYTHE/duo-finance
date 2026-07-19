import { BudgetPeriod, BudgetCategory, BudgetConfig } from "@/types/finance";

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

export function calculateAllocations(config: BudgetConfig, categories: BudgetCategory[]) {
    const displayTarget = getDisplayValue(config.targetAmount, config.period);
    const displayAllocated = categories.reduce((sum, cat) => sum + getDisplayValue(cat.targetAmount, config.period), 0);
    const displayUnallocated = Math.max(0, displayTarget - displayAllocated);
    
    return {
        displayTarget,
        displayAllocated,
        displayUnallocated
    };
}
