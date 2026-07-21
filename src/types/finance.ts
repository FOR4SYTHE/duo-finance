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

export type BudgetPeriod = 'weekly' | 'monthly' | '3-months' | '6-months' | 'annually';

export interface BudgetSubCategory {
    id: string;
    name: string;
    amount: number;
}

export interface BudgetCategory {
    id: string;
    name: string;
    icon: string; // Component or identifier name
    color: string; // e.g., '#30D158'
    targetAmount: number; // Stored natively in canonical Monthly PHP
    subCategories?: BudgetSubCategory[];
}

export interface BudgetConfig {
    targetAmount: number; // Global target amount in canonical Monthly PHP
    period: BudgetPeriod; // Current selected display period
    jarAllowedPercentage: number; // Percentage of targetAmount allowed for extra spend
    runwayMultiplier?: number; // For Emergency Runway calculator
    cardSkin?: string; // Selected skin for the hero card
    cardName?: string; // Custom name for the hero card
    activeMonth?: string; // "YYYY-MM" for filtering expenses
    lastSeenMonth?: string; // Tracks the last calendar month the user opened the app
}
