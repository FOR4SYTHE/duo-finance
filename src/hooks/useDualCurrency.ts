import { useCurrencyStore } from "@/store/useCurrencyStore";

export function useDualCurrency() {
  const { exchangeRate, primaryCurrency } = useCurrencyStore();
  
  const isPhp = primaryCurrency === 'PHP';
  const primarySymbol = isPhp ? '₱' : 'R';
  const secondarySymbol = isPhp ? 'R' : '₱';
  
  const getPrimaryValue = (valInPhp: number) => isPhp ? valInPhp : valInPhp * exchangeRate;
  const getSecondaryValue = (valInPhp: number) => isPhp ? valInPhp * exchangeRate : valInPhp;

  return {
    exchangeRate,
    primaryCurrency,
    isPhp,
    primarySymbol,
    secondarySymbol,
    getPrimaryValue,
    getSecondaryValue
  };
}
