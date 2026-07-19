const assert = require('assert');

// Extracted Calculator Logic from useCurrencyStore.ts
function createCalculator() {
    let displayValue = '0';
    let primaryCurrency = 'PHP';
    let exchangeRate = 0.2680; // Hardcoded mock rate

    return {
        get displayValue() { return displayValue; },
        get primaryCurrency() { return primaryCurrency; },
        get exchangeRate() { return exchangeRate; },
        toggleCurrency: () => {
            primaryCurrency = primaryCurrency === 'PHP' ? 'ZAR' : 'PHP';
        },
        appendInput: (char) => {
            const current = displayValue;
            if (current === 'Error') {
                if (['+', '-', '*', '/', '%'].includes(char)) return;
                displayValue = char === '.' ? '0.' : char;
                return;
            }
            if (char === '.') {
                const segments = current.split(/[\+\-\*\/]/);
                const lastSegment = segments[segments.length - 1];
                if (lastSegment.includes('.')) return;
                if (current === '' || ['+', '-', '*', '/'].includes(current.slice(-1))) {
                    displayValue = current + '0.';
                    return;
                }
            }
            const lastChar = current.slice(-1);
            if (['+', '-', '*', '/', '%'].includes(lastChar) && ['+', '-', '*', '/'].includes(char)) {
                if (lastChar !== '%') {
                    displayValue = current.slice(0, -1) + char;
                    return;
                }
            }
            if (current === '0' && !['+', '-', '*', '/', '.', '%'].includes(char)) {
                displayValue = char;
                return;
            }
            displayValue = current + char;
        },
        deleteLast: () => {
            const current = displayValue;
            if (current === 'Error' || current.length <= 1) {
                displayValue = '0';
            } else {
                displayValue = current.slice(0, -1);
            }
        },
        executeCalculation: () => {
            const current = displayValue;
            if (current === 'Error') return;
            try {
                let sanitized = current;
                if (['+', '-', '*', '/'].includes(sanitized.slice(-1))) {
                    sanitized = sanitized.slice(0, -1);
                }
                sanitized = sanitized.replace(/%/g, '/100');
                if (/\/0(?!\.)/.test(sanitized)) {
                    throw new Error("Division by zero");
                }
                const computed = new Function(`return ${sanitized}`)();
                if (isNaN(computed) || !isFinite(computed)) throw new Error("Invalid calculation");
                if (computed > Number.MAX_SAFE_INTEGER || computed < Number.MIN_SAFE_INTEGER) {
                    throw new Error("Overflow");
                }
                displayValue = parseFloat(computed.toFixed(4)).toString();
            } catch {
                displayValue = 'Error';
            }
        },
        // Mimic the UI derived state logic exactly as it is in Calculator.tsx
        getConvertedAmount: () => {
            const numericValue = Number(displayValue || 0);
            return primaryCurrency === 'PHP' 
                ? numericValue * exchangeRate 
                : numericValue / exchangeRate;
        }
    };
}

const tests = [
    {
        name: 'Currency Swap correctly inverts calculation direction',
        run: () => {
            const calc = createCalculator();
            // Start with PHP primary. Type 500.
            '500'.split('').forEach(calc.appendInput);
            
            // Expected ZAR = 500 * 0.2680 = 134
            const initialConverted = calc.getConvertedAmount();
            assert.strictEqual(initialConverted.toFixed(2), '134.00');

            // Swap currency to make ZAR primary
            calc.toggleCurrency();
            assert.strictEqual(calc.primaryCurrency, 'ZAR');

            // Now displayValue is still "500", but it means 500 ZAR. 
            // Expected PHP = 500 / 0.2680 = ~1865.67
            const swappedConverted = calc.getConvertedAmount();
            assert.strictEqual(swappedConverted.toFixed(2), '1865.67');
        }
    }
];

let passed = 0;
tests.forEach(t => {
    try {
        t.run();
        console.log(`✅ PASS: ${t.name}`);
        passed++;
    } catch(e) {
        console.log(`❌ FAIL: ${t.name}`);
        console.log(`   Expected: ${e.expected}, Got: ${e.actual}`);
    }
});
console.log(`\nResult: ${passed}/${tests.length} passed.`);
