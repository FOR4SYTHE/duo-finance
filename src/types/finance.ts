// Shared Expense Entry mapping for both Spend Jar and Cartify
export interface ExpenseEntry {
    id: string;
    amount: number; // total amount (e.g. price * quantity) in PHP
    currency: 'PHP' | 'ZAR';
    category?: string;
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
