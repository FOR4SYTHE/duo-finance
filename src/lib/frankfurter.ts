export interface ExchangeRateData {
    rate: number;
    timestamp: number;
}

const CACHE_KEY = 'duo_currency_rate_cache';
const ONE_HOUR = 60 * 60 * 1000;

export async function fetchExchangeRate(base: 'PHP' | 'ZAR', target: 'PHP' | 'ZAR'): Promise<number> {
    if (base === target) return 1;

    // Attempt client-side cache retrieval
    if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const parsed: ExchangeRateData = JSON.parse(cached);
            if (Date.now() - parsed.timestamp < ONE_HOUR) {
                return parsed.rate;
            }
        }
    }

    try {
        // Frankfurter API requires no keys, highly performant
        const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=${base}&symbols=${target}`);
        if (!res.ok) throw new Error('API degraded');

        const data = await res.json();
        const rate = data.rates[target];

        if (typeof window !== 'undefined') {
            const cacheData: ExchangeRateData = { rate, timestamp: Date.now() };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        }

        return rate;
    } catch (error) {
        console.error('Exchange rate fetch failed, reading fallback data:', error);
        // Hard fallback standard asset rate if offline
        return base === 'PHP' ? 0.27 : 3.70;
    }
}