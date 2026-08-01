import { BudgetConfig, BudgetCategory, ExpenseEntry } from "@/types/finance";
import { Bill } from "@/store/useBillsStore";

export type PulseStatus = 'Excellent' | 'On Track' | 'Tight' | 'Over' | 'Archived' | 'Setup';

export interface PulseResult {
    safeToSpendToday: number;
    idealDailyAverage: number;
    ratio: number;
    status: PulseStatus;
    unpaidBillsCount: number;
    daysRemaining: number;
}

export function calculateHouseholdPulse(
    config: BudgetConfig,
    categories: BudgetCategory[],
    monthEntries: ExpenseEntry[],
    bills: Bill[],
    activeMonth: string, // YYYY-MM
    currentDate: Date = new Date()
): PulseResult {
    // 1. Calculate time variables
    const [yearStr, monthStr] = activeMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1; // 0-indexed

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const totalDaysInMonth = lastDayOfMonth.getDate();

    let daysRemaining = 0;
    
    // Check if activeMonth is in the past, present, or future relative to currentDate
    const activeMonthStart = new Date(year, month, 1).getTime();
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getTime();

    if (activeMonthStart < currentMonthStart) {
        // Archived month
        daysRemaining = 0;
    } else if (activeMonthStart > currentMonthStart) {
        // Future month
        daysRemaining = totalDaysInMonth;
    } else {
        // Current month
        daysRemaining = totalDaysInMonth - currentDate.getDate() + 1; 
        // +1 because today is a usable day
    }

    // 2. Sum category targets and spent
    let totalCategoryBudgets = 0;
    let totalCategorySpent = 0;
    
    const categoryNames = new Set(categories.map(c => c.name.toLowerCase()));

    categories.forEach(cat => {
        // Retrieve historical target if available, otherwise current
        const target = cat.targetHistory?.[activeMonth] !== undefined 
            ? cat.targetHistory[activeMonth] 
            : cat.targetAmount;
        totalCategoryBudgets += target;
    });

    let spendJarSpent = 0;
    monthEntries.forEach(entry => {
        if (entry.category && categoryNames.has(entry.category.toLowerCase())) {
            totalCategorySpent += entry.amount;
        } else {
            spendJarSpent += entry.amount;
        }
    });

    // 3. Spend Jar Unallocated Pool
    const historicalMasterTarget = config.targetHistory?.[activeMonth] !== undefined 
        ? config.targetHistory[activeMonth] 
        : config.targetAmount;
        
    const unallocatedAmount = Math.max(0, historicalMasterTarget - totalCategoryBudgets);
    const jarAllowedPercentage = config.jarAllowedPercentage || 20;
    const allowedSpendJar = unallocatedAmount * (jarAllowedPercentage / 100);
    const unusedSpendJar = Math.max(0, allowedSpendJar - spendJarSpent);

    // 4. Unpaid Bills
    // We only count bills as unpaid if they are not marked isPaid.
    // In a real multi-month system, isPaid might need to be tracked per month, 
    // but for now, we follow the schema amendment.
    const unpaidBills = bills.filter(b => !b.isPaid);
    const unpaidBillsTotal = unpaidBills.reduce((sum, b) => sum + b.amount, 0);

    // 5. Calculate Safe Remaining
    const safeRemaining = (totalCategoryBudgets - totalCategorySpent) 
                        + unusedSpendJar 
                        - unpaidBillsTotal;

    // 6. Calculate Final Metrics
    if (daysRemaining <= 0) {
        return {
            safeToSpendToday: 0,
            idealDailyAverage: 0,
            ratio: 0,
            status: 'Archived',
            unpaidBillsCount: unpaidBills.length,
            daysRemaining: 0
        };
    }

    const safeToSpendToday = safeRemaining / daysRemaining;
    const idealDailyAverage = (totalCategoryBudgets + allowedSpendJar) / totalDaysInMonth;

    if (idealDailyAverage <= 0) {
        return {
            safeToSpendToday: 0,
            idealDailyAverage: 0,
            ratio: 0,
            status: 'Setup',
            unpaidBillsCount: unpaidBills.length,
            daysRemaining
        };
    }

    const ratio = safeToSpendToday / idealDailyAverage;

    let status: PulseStatus = 'Excellent';
    if (ratio >= 1.0) status = 'Excellent';
    else if (ratio >= 0.75) status = 'On Track';
    else if (ratio >= 0.25) status = 'Tight';
    else status = 'Over';

    return {
        safeToSpendToday,
        idealDailyAverage,
        ratio,
        status,
        unpaidBillsCount: unpaidBills.length,
        daysRemaining
    };
}
