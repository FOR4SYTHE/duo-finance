// Shared Expense Entry mapping for both Spend Jar and Cartify
export interface ExpenseEntry {
    id: string;
    amount: number; // total amount (e.g. price * quantity) in PHP
    currency: 'PHP' | 'ZAR';
    category?: string;
    note?: string; // Optional short note for Spend Jar
    timestamp: number;
    trip_id?: string;
}

// Cartify specific item which maps 1:1 to an ExpenseEntry
export interface CartifyItem extends ExpenseEntry {
    name: string;
    unitPrice: number; // Single item price (null if unpriced/still-need)
    quantity: number;
    status: 'still-need' | 'in-cart';
    isVatable?: boolean; // True for standard 12% VAT, False for VAT-exempt (raw produce/meat/fish)
}

// Budget configuration for the global app
export type BudgetPeriod = 'weekly' | 'monthly' | '3-months' | '6-months' | 'annually';

export interface BudgetConfig {
    targetAmount: number; // Target amount in PHP
    period: BudgetPeriod;
    jarAllowedPercentage: number; // Percentage of targetAmount allowed for extra spend
}
