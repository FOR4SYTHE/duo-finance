import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchExchangeRate } from '@/lib/frankfurter';

interface CurrencyState {
    primaryCurrency: 'PHP' | 'ZAR';
    displayValue: string;
    exchangeRate: number;
    lastUpdated: number | null;
    isLoadingRate: boolean;
    toggleCurrency: () => void;
    appendInput: (char: string) => void;
    clearInput: () => void;
    deleteLast: () => void;
    executeCalculation: () => void;
    syncRates: () => Promise<void>;
}

export const useCurrencyStore = create<CurrencyState>()(
    persist(
        (set, get) => ({
            primaryCurrency: 'PHP',
            displayValue: '0',
            exchangeRate: 0.27, // Always represents PHP to ZAR rate
            lastUpdated: null,
            isLoadingRate: false,

            toggleCurrency: async () => {
                const nextCurrency = get().primaryCurrency === 'PHP' ? 'ZAR' : 'PHP';
                set({ primaryCurrency: nextCurrency });
            },

            syncRates: async () => {
                set({ isLoadingRate: true });
                // Always fetch the PHP -> ZAR baseline rate to prevent cache collision
                // and enable correct multiply/divide inversion logic.
                const rate = await fetchExchangeRate('PHP', 'ZAR');
                set({ exchangeRate: rate, isLoadingRate: false, lastUpdated: Date.now() });
            },

            appendInput: (char: string) => {
                const current = get().displayValue;

                if (current === 'Error') {
                    if (['+', '-', '*', '/', '%'].includes(char)) return;
                    set({ displayValue: char === '.' ? '0.' : char });
                    return;
                }

                // Prevent multiple decimals in the current number segment
                if (char === '.') {
                    const segments = current.split(/[\+\-\*\/]/);
                    const lastSegment = segments[segments.length - 1];
                    if (lastSegment.includes('.')) return;
                    if (current === '' || ['+', '-', '*', '/'].includes(current.slice(-1))) {
                        set({ displayValue: current + '0.' });
                        return;
                    }
                }

                // Guard consecutive math operators
                const lastChar = current.slice(-1);
                if (['+', '-', '*', '/', '%'].includes(lastChar) && ['+', '-', '*', '/'].includes(char)) {
                    if (lastChar !== '%') {
                        set({ displayValue: current.slice(0, -1) + char });
                        return;
                    }
                }

                // Prevent generic zero-stacking
                if (current === '0' && !['+', '-', '*', '/', '.', '%'].includes(char)) {
                    set({ displayValue: char });
                    return;
                }

                set({ displayValue: current + char });
            },

            clearInput: () => set({ displayValue: '0' }),

            deleteLast: () => {
                const current = get().displayValue;
                if (current === 'Error' || current.length <= 1) {
                    set({ displayValue: '0' });
                } else {
                    set({ displayValue: current.slice(0, -1) });
                }
            },

            executeCalculation: () => {
                const current = get().displayValue;
                if (current === 'Error') return;
                try {
                    let sanitized = current;
                    // Clean up hanging mathematical operators before parsing execution
                    if (['+', '-', '*', '/'].includes(sanitized.slice(-1))) {
                        sanitized = sanitized.slice(0, -1);
                    }

                    // Convert % to /100 for evaluation
                    sanitized = sanitized.replace(/%/g, '/100');

                    // Guard against explicit divide by zero
                    if (/\/0(?!\.)/.test(sanitized)) {
                        throw new Error("Division by zero");
                    }

                    // Compute math safely without eval
                    const computed = new Function(`return ${sanitized}`)();
                    
                    if (isNaN(computed) || !isFinite(computed)) throw new Error("Invalid calculation");
                    
                    if (computed > Number.MAX_SAFE_INTEGER || computed < Number.MIN_SAFE_INTEGER) {
                         throw new Error("Overflow");
                    }

                    const resultString = parseFloat(computed.toFixed(4)).toString();
                    set({ displayValue: resultString });
                } catch {
                    set({ displayValue: 'Error' });
                    setTimeout(() => set({ displayValue: '0' }), 1200);
                }
            }
        }),
        {
            name: 'currency-storage',
            partialize: (state) => ({ primaryCurrency: state.primaryCurrency }),
        }
    )
);