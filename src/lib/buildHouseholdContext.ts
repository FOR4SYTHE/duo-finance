import { useBudgetStore } from '@/store/useBudgetStore';
import { useSpendStore } from '@/store/useSpendStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { usePluginsStore } from '@/store/usePluginsStore';

export function buildHouseholdContext(): string {
    // Read directly from stores
    const { config, categories, goals } = useBudgetStore.getState();
    const { entries } = useSpendStore.getState();
    const { exchangeRate } = useCurrencyStore.getState();
    const { scratchpadContent } = usePluginsStore.getState();

    // 1. Budget Summary
    const period = config.period;
    const targetBudget = config.targetAmount || 0;
    const allocated = categories.reduce((sum, cat) => sum + (cat.targetAmount || 0), 0);
    const unallocated = Math.max(0, targetBudget - allocated);

    // 2. Spending Summary (Basic rollup of all entries for context)
    const totalSpentPhp = entries.reduce((sum, entry) => {
        return sum + (entry.currency === 'PHP' ? entry.amount : entry.amount / exchangeRate);
    }, 0);
    
    // Group spend by category
    const spendByCategory = entries.reduce((acc, entry) => {
        if (!entry.category) return acc;
        const amountPhp = entry.currency === 'PHP' ? entry.amount : entry.amount / exchangeRate;
        acc[entry.category] = (acc[entry.category] || 0) + amountPhp;
        return acc;
    }, {} as Record<string, number>);

    // Top 3 categories
    const topCategories = Object.entries(spendByCategory)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([cat, amount]) => `${cat}: ₱${Math.round(amount).toLocaleString()}`)
        .join(', ');

    // 3. Goals Progress
    const goalsSummary = goals.slice(0, 3).map(g => {
        const pct = g.targetAmount > 0 ? Math.round((g.savedAmount / g.targetAmount) * 100) : 0;
        return `${g.name}: ${pct}% (₱${Math.round(g.savedAmount).toLocaleString()})`;
    }).join(' | ');

    // Compile the final context string
    return `
Household Snapshot:
- Budget Period: ${period}
- Target Budget: ₱${targetBudget.toLocaleString()}
- Allocated: ₱${allocated.toLocaleString()} | Unallocated: ₱${unallocated.toLocaleString()}
- Total Spent: ₱${Math.round(totalSpentPhp).toLocaleString()}
${topCategories ? `- Top Spend Categories: ${topCategories}` : ''}
${goalsSummary ? `- Goals: ${goalsSummary}` : ''}
- Exchange Rate: 1 PHP = ${exchangeRate.toFixed(4)} ZAR

${scratchpadContent ? `Shared Scratchpad Notes (Read these to assist the user):\n${scratchpadContent.replace(/<[^>]*>?/gm, ' ')}` : ''}
`.trim();
}
