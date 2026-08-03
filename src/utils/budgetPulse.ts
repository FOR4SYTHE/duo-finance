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
            // Spend Jar (unallocated) should ONLY count expenses that do not belong to a dedicated category.
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

export function computeCategoryStatus(
    spent: number, 
    target: number,
    isFixedObligation: boolean = false,
    categoryId: string = '',
    bills: Bill[] = [],
    activeMonth: string = '', // YYYY-MM
    currentDate: Date = new Date()
): { label: string; color: string; bg: string } {
    if (isFixedObligation) {
        const linkedBills = bills.filter(b => b.budgetCategoryId === categoryId);
        
        if (linkedBills.length > 0) {
            const allPaid = linkedBills.every(b => b.isPaid);
            if (allPaid) {
                return { label: 'PAID', color: 'text-[#30D158]', bg: 'bg-[#30D158]/20 border-[#30D158]/30' };
            }
            
            if (!activeMonth) {
                return { label: 'DUE', color: 'text-white/50', bg: 'bg-white/10 border-white/5' };
            }

            const [yearStr, monthStr] = activeMonth.split('-');
            const year = parseInt(yearStr, 10);
            const month = parseInt(monthStr, 10) - 1;
            const activeMonthStart = new Date(year, month, 1).getTime();
            const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getTime();
            const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

            const isOverdue = linkedBills.some(b => {
                if (b.isPaid) return false;
                const cappedDueDay = Math.min(b.dueDay, lastDayOfMonth);
                if (activeMonthStart < currentMonthStart) return true;
                if (activeMonthStart === currentMonthStart && currentDate.getDate() > cappedDueDay) return true;
                return false;
            });

            if (isOverdue) {
                return { label: 'OVERDUE', color: 'text-[#FF453A]', bg: 'bg-[#FF453A]/20 border-[#FF453A]/30' };
            }
        } else {
            // Fallback to spent >= target if no specific bills are linked yet, but it's marked as fixed
            if (spent >= target && target > 0) {
                return { label: 'PAID', color: 'text-[#30D158]', bg: 'bg-[#30D158]/20 border-[#30D158]/30' };
            }
        }

        return { label: 'DUE', color: 'text-white/50', bg: 'bg-white/10 border-white/5' };
    }

    if (target <= 0) return { label: 'Setup', color: 'text-white/50', bg: 'bg-white/10 border-white/5' };
    
    const ratio = spent / target;
    if (ratio >= 0.9) return { label: 'Over', color: 'text-[#FF453A]', bg: 'bg-[#FF453A]/20 border-[#FF453A]/30' };
    if (ratio >= 0.6) return { label: 'Tight', color: 'text-[#E8A33D]', bg: 'bg-[#E8A33D]/20 border-[#E8A33D]/30' };
    return { label: 'On Track', color: 'text-[#30D158]', bg: 'bg-[#30D158]/20 border-[#30D158]/30' };
}

export function computeCategoryMemory(cat: BudgetCategory, allEntries: ExpenseEntry[], activeMonth: string, getPrimaryValue: (val: number) => number, primarySymbol: string): string | null {
    // Collect historical spent values (from snapshot or compute on the fly if not snapshotted)
    // We only care about months before activeMonth.
    // For simplicity, we just look at the last 3 months where spendHistory exists.
    if (!cat.spendHistory || Object.keys(cat.spendHistory).length === 0) return null;
    
    const pastMonths = Object.keys(cat.spendHistory)
        .filter(m => m < activeMonth)
        .sort((a, b) => b.localeCompare(a)); // descending
        
    if (pastMonths.length === 0) return null;
    
    // Take up to 3 most recent past months
    const recent = pastMonths.slice(0, 3);
    const sum = recent.reduce((acc, m) => acc + cat.spendHistory![m], 0);
    const avg = sum / recent.length;
    
    const displayAvg = getPrimaryValue(avg).toLocaleString(undefined, {maximumFractionDigits: 0});
    return `Usually ${primarySymbol}${displayAvg} / mo`;
}
