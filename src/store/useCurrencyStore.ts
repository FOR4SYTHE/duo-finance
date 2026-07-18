import { create } from 'zustand';
import { fetchExchangeRate } from '@/lib/frankfurter';

interface CurrencyState {
    primaryCurrency: 'PHP' | 'ZAR';
    displayValue: string;
    exchangeRate: number;
    isLoadingRate: boolean;
    toggleCurrency: () => void;
    appendInput: (char: string) => void;
    clearInput: () => void;
    deleteLast: () => void;
    executeCalculation: () => void;
    syncRates: () => Promise<void>;
}

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
    primaryCurrency: 'PHP',
    displayValue: '0',
    exchangeRate: 0.27, // Initial default baseline
    isLoadingRate: false,

    toggleCurrency: async () => {
        const nextCurrency = get().primaryCurrency === 'PHP' ? 'ZAR' : 'PHP';
        set({ primaryCurrency: nextCurrency, isLoadingRate: true });

        // Dynamically retrieve the new reverse conversion rate
        const target = nextCurrency === 'PHP' ? 'ZAR' : 'PHP';
        const rate = await fetchExchangeRate(nextCurrency, target);
        set({ exchangeRate: rate, isLoadingRate: false });
    },

    syncRates: async () => {
        set({ isLoadingRate: true });
        const base = get().primaryCurrency;
        const target = base === 'PHP' ? 'ZAR' : 'PHP';
        const rate = await fetchExchangeRate(base, target);
        set({ exchangeRate: rate, isLoadingRate: false });
    },

    appendInput: (char: string) => {
        const current = get().displayValue;

        // Prevent generic zero-stacking
        if (current === '0' && !['+', '-', '*', '/', '.'].includes(char)) {
            set({ displayValue: char });
            return;
        }

        // Guard consecutive math operators
        const lastChar = current.slice(-1);
        if (['+', '-', '*', '/'].includes(lastChar) && ['+', '-', '*', '/'].includes(char)) {
            set({ displayValue: current.slice(0, -1) + char });
            return;
        }

        set({ displayValue: current + char });
    },

    clearInput: () => set({ displayValue: '0' }),

    deleteLast: () => {
        const current = get().displayValue;
        if (current.length <= 1) {
            set({ displayValue: '0' });
        } else {
            set({ displayValue: current.slice(0, -1) });
        }
    },

    executeCalculation: () => {
        const current = get().displayValue;
        try {
            // Clean up hanging mathematical operators before parsing execution
            let sanitized = current;
            if (['+', '-', '*', '/'].includes(sanitized.slice(-1))) {
                sanitized = sanitized.slice(0, -1);
            }

            // Compute math safely without eval issues
            const computed = new Function(`return ${sanitized}`)();
            if (isNaN(computed) || !isFinite(computed)) throw new Error();

            // Format response float thresholds gently
            const resultString = Number(computed.toFixed(4)).toString();
            set({ displayValue: resultString });
        } catch {
            set({ displayValue: 'Error' });
            setTimeout(() => set({ displayValue: '0' }), 1200);
        }
    }
}));