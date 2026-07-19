import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCurrencyStore } from '../src/store/useCurrencyStore';

// Mock the frankfurter API so we don't do real network requests
vi.mock('../src/lib/frankfurter', () => ({
  fetchExchangeRate: vi.fn().mockResolvedValue(0.5),
}));

describe('Calculator Logic', () => {
  beforeEach(() => {
    useCurrencyStore.setState({ displayValue: '0', primaryCurrency: 'PHP', exchangeRate: 0.27 });
  });

  const getStore = () => useCurrencyStore.getState();
  const append = (str: string) => str.split('').forEach(char => getStore().appendInput(char));
  const calc = () => getStore().executeCalculation();

  it('evaluates chained operations in standard math order', () => {
    // 5 + 3 * 2 = 11
    append('5+3*2');
    calc();
    expect(getStore().displayValue).toBe('11');
  });

  it('prevents double decimal points in a single number segment', () => {
    // 12.5.3 should remain 12.53 or 12.5 (our logic rejects the second decimal)
    append('12.5.3');
    expect(getStore().displayValue).toBe('12.53'); // Since the . is ignored, 3 is appended

    getStore().clearInput();
    append('10.5+2.5.');
    expect(getStore().displayValue).toBe('10.5+2.5'); // Second decimal in the second number is rejected
  });

  it('handles backspace after an operator is entered', () => {
    append('5+');
    getStore().deleteLast();
    expect(getStore().displayValue).toBe('5');
    append('*2');
    calc();
    expect(getStore().displayValue).toBe('10');
  });

  it('handles divide by zero gracefully', async () => {
    vi.useFakeTimers();
    append('10/0');
    calc();
    // It should set displayValue to 'Error' immediately
    expect(getStore().displayValue).toBe('Error');
    
    // After 1200ms it resets to '0'
    vi.advanceTimersByTime(1200);
    expect(getStore().displayValue).toBe('0');
    vi.useRealTimers();
  });

  it('handles percentages properly', () => {
    append('50+20%');
    calc();
    // 50 + (20/100) = 50.2
    expect(getStore().displayValue).toBe('50.2');
  });

  it('prevents overflow with very large numbers', () => {
    // E.g., 9999999999999999 * 9999999999999999
    append('9999999999999999*9999999999999999');
    calc();
    expect(getStore().displayValue).toBe('Error');
  });
});
