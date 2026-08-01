import { ExpenseEntry } from "@/types/finance";

export const getEffectiveCurrentMonth = (): string => {
    const now = new Date();
    // If it's the 1st of the month, and before 3 AM, treat it as the previous month
    if (now.getDate() === 1 && now.getHours() < 3) {
        now.setMonth(now.getMonth() - 1);
    }
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

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
