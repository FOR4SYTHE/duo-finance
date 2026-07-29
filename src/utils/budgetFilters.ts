import { ExpenseEntry } from "@/types/finance";

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
