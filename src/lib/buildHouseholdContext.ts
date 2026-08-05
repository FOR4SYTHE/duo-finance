import { useBudgetStore } from '@/store/useBudgetStore';
import { useSpendStore } from '@/store/useSpendStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { usePluginsStore } from '@/store/usePluginsStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useBillsStore } from '@/store/useBillsStore';
import { useCartifyStore } from '@/store/useCartifyStore';
import { useSubscriptionsStore } from '@/store/useSubscriptionsStore';
import { useChildCareStore } from '@/store/useChildCareStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { calculateAllocations } from '@/utils/budgetMath';

export function buildHouseholdContext(): string {
    // Read directly from stores
    const { config, categories } = useBudgetStore.getState();
    const { entries: _entries } = useSpendStore.getState();
    const { exchangeRate } = useCurrencyStore.getState();
    const { scratchpadContent, documents, relocationTasks, shippingRateZarPerKg, targetExchangeRate } = usePluginsStore.getState();
    const { user, partner, householdId } = useAuthStore.getState();
    const { bills: _bills } = useBillsStore.getState();
    const cartify = useCartifyStore.getState();
    const { subscriptions: _subscriptions } = useSubscriptionsStore.getState();

    // Safe defaults — stores may not be hydrated yet
    const goals: any[] = []; // Goals system temporarily disabled/migrated
    const entries = _entries || [];
    const bills = _bills || [];
    const trips = cartify.savedTrips || [];
    const subscriptions = _subscriptions || [];
    const { profile: childProfile, cachedData: childData, configuration: childConfig } = useChildCareStore.getState();
    const settings = useSettingsStore.getState();

    const today = new Date();
    const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const todayString = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // 1. Current Month Breakdown
    const monthEntries = entries.filter((e) => {
      const d = new Date(e.timestamp);
      return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    });
    const totalSpentThisMonth = monthEntries.reduce((s, e) => s + (e.currency === 'PHP' ? e.amount : e.amount / exchangeRate), 0);
    const { displayTarget: monthlyTarget } = calculateAllocations(config, categories, totalSpentThisMonth, currentMonthKey);
    const monthlyRemaining = Math.max(0, monthlyTarget - totalSpentThisMonth);

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

    const topCategories = (Object.entries(spendByCategory) as [string, number][])
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([cat, amount]) => `${cat}: ₱${Math.round(amount).toLocaleString()}`)
        .join(', ');

    // 3. Goals Progress
    const goalsSummary = goals.slice(0, 3).map((g: any) => {
        const pct = g.targetAmount > 0 ? Math.round((g.savedAmount / g.targetAmount) * 100) : 0;
        return `${g.name}: ${pct}% (₱${Math.round(g.savedAmount).toLocaleString()})`;
    }).join(' | ');

    // 4. Bills Summary
    const upcomingBills = bills.filter(b => !b.isPaid).map(b => `${b.name} (₱${b.amount}, Due: Day ${b.dueDay})`).join(', ');
    const paidBills = bills.filter(b => b.isPaid).length;

    // 5. Cartify Summary
    const activeCartify = cartify.isActive
        ? `Active Trip: ${cartify.items.length} items, ₱${cartify.items.reduce((s, i) => s + (i.unitPrice * i.quantity), 0).toLocaleString()} current total.` 
        : 'No active Cartify trip.';
    const pastTripsCount = trips.length;

    // 6. Subscriptions
    const activeSubs = subscriptions.map((s: any) => `${s.name} (₱${s.amount}/${s.cycle})`).join(', ');

    // 7. Child Care
    const selectedSchool = childData.schools.find(s => s.id === childConfig.selectedSchoolId);
    const childCareSummary = `${childProfile.nickname || 'Child'} (${childProfile.age || '?'}yo) in ${childProfile.location}. ${selectedSchool ? `School: ${selectedSchool.name} (₱${selectedSchool.monthlyTuition}/mo)` : 'No school selected.'}`;

    // 8. Document Vault & Relocation
    const vaultSummary = documents.length > 0 
        ? documents.map(d => `- ${d.title} (${d.category}, ${d.date})${d.amount ? ` ₱${d.amount}` : ''} [Tags: ${d.tags.join(', ')}]`).join('\n')
        : '';
    const completedTasks = relocationTasks.filter(t => t.completed).length;

    // 9. Recent Spend History (for itemized visibility)
    const recentSpendHistory = entries
        .slice()
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 20)
        .map(e => `- ₱${e.amount.toLocaleString()} (${e.currency}) on ${new Date(e.timestamp).toLocaleDateString()} | Category: ${e.category || 'None'} ${e.note ? `| Note: "${e.note}"` : ''}`)
        .join('\n');

    // Compile the final context string
    return `
=== SYSTEM AWARENESS & CAPABILITIES ===
You are DUO AI, the brain of this household management app. 
You currently have full READ access to: 
- User Profile & Authentication
- Budget System (Targets, allocated funds, categories, and goals)
- Spend Jar (All logged expenses and categories)
- Recurring Bills (Upcoming and paid bills)
- Cartify (Shopping trips and grocery tracking)
- Subscriptions
- Child Care (Schools, costs, activities)
- Relocation Hub (Master Move Checklist and shipping rates)
- Dream Board (Savings goals)
- Shared Scratchpad (Notes)
- Document Vault (Receipts, warranties, visas)
- Exchange Alerts (Forex targets)
- Vision Scanner (Can read uploaded receipts and product photos)

You DO NOT have access to:
- Changing App Settings for the user (you can only read data, not modify UI settings directly)

=== CURRENT CONTEXT ===
- Today's Date: ${todayString}

=== HOUSEHOLD PROFILE ===
- Primary User: ${user ? `${user.name} (${user.email})` : 'Guest / Not logged in'}
- Partner: ${partner ? `${partner.name} (${partner.email})` : 'None linked'}
- Household ID: ${householdId || 'Not connected'}

=== MONTHLY REPORT (${currentMonthKey}) ===
- Target Budget: ₱${monthlyTarget.toLocaleString()}
- Total Spent This Month: ₱${Math.round(totalSpentThisMonth).toLocaleString()}
- Remaining Budget: ₱${Math.round(monthlyRemaining).toLocaleString()}

=== OVERALL SPENDING SNAPSHOT ===
- Total Lifetime Spent: ₱${Math.round(totalSpentPhp).toLocaleString()}
${topCategories ? `- Top Lifetime Categories: ${topCategories}` : ''}
${goalsSummary ? `- Goals: ${goalsSummary}` : ''}

=== RECENT SPEND HISTORY (Latest 20 Entries) ===
${recentSpendHistory || 'No recent spending logged.'}

=== BILLS & SHOPPING ===
- Upcoming Bills: ${upcomingBills || 'None'}
- Bills Paid This Period: ${paidBills}
- Active Subscriptions: ${activeSubs || 'None'}
- Cartify Status: ${activeCartify} (Past trips: ${pastTripsCount})

=== CHILD CARE ===
- ${childCareSummary}

Current Exchange Rate (Frankfurter API):
- 1 ZAR = ₱${exchangeRate.toFixed(2)}
- 1 PHP = R${(1 / exchangeRate).toFixed(4)}
- FOREX TARGET ALERT: The user has set a target alert for 1 ZAR to hit ₱${targetExchangeRate?.toFixed(2) ?? 'N/A'}.

Recent Shared Scratchpad Notes:
${scratchpadContent?.substring(0, 1000).replace(/<[^>]*>?/gm, ' ') || 'None.'}

Document Vault Inventory:
${vaultSummary || 'No documents uploaded yet.'}

Relocation Progress:
- ${completedTasks}/${relocationTasks.length} tasks completed on the Master Move Checklist.
- Shipping Rate Est: ${shippingRateZarPerKg} ZAR/kg.

App Settings:
- Budget Alerts: ${settings.budgetAlerts ? 'ON' : 'OFF'}
- Reminders: ${settings.reminders ? 'ON' : 'OFF'}
`.trim();
}
