"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useBudgetStore } from "@/store/useBudgetStore";
import { useSpendStore } from "@/store/useSpendStore";
import { useCartifyStore } from "@/store/useCartifyStore";
import { useBillsStore } from "@/store/useBillsStore";
import { useGoalsStore } from "@/store/useGoalsStore";
import { createClient } from "@/utils/supabase/client";

const SYNC_COOLDOWN_MS = 30_000; // 30 seconds between background syncs

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initializeAuth = useAuthStore(state => state.initialize);
  const initializeCurrency = useCurrencyStore(state => state.initialize);
  const initializeSettings = useSettingsStore(state => state.initialize);
  const initializeBudget = useBudgetStore(state => state.initialize);
  const initializeSpend = useSpendStore(state => state.initialize);
  const initializeCartify = useCartifyStore(state => state.initializeCartify);
  const initializeBills = useBillsStore(state => state.initialize);
  const initializeGoals = useGoalsStore(state => state.initialize);
  
  const initializingRef = useRef(false);
  const lastSyncRef = useRef(0);
  const pathname = usePathname();

  // Core sync function with optional throttle bypass
  const syncAll = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && now - lastSyncRef.current < SYNC_COOLDOWN_MS) return;
    if (initializingRef.current) return; // Already running

    lastSyncRef.current = now;
    initializingRef.current = true;
    await initializeAuth();
    await initializeCurrency();
    await initializeSettings();
    await initializeBudget();
    await initializeSpend();
    await initializeCartify();
    await initializeBills();
    await initializeGoals();
    setTimeout(() => { initializingRef.current = false; }, 100);
  }, [initializeAuth, initializeCurrency, initializeSettings, initializeBudget, initializeSpend, initializeCartify, initializeBills, initializeGoals]);

  // 1. Initial load + auth state changes (force = true, always immediate)
  useEffect(() => {
    const supabase = createClient();

    syncAll(true); // First load — always fetch

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      syncAll(true); // Auth events (login/logout) bypass throttle
    });

    return () => { subscription.unsubscribe(); };
  }, [syncAll]);

  // Shared ref for the budget debounce timeout — syncAll can kill pending stale writes
  const budgetDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Kill any pending budget write before syncing to prevent stale overwrites
  const safeSyncAll = useCallback(async (force = false) => {
    if (budgetDebounceRef.current) {
      clearTimeout(budgetDebounceRef.current);
      budgetDebounceRef.current = null;
    }
    return syncAll(force);
  }, [syncAll]);

  // 2. Route navigation sync (throttled — respects 30s cooldown)
  useEffect(() => {
    safeSyncAll();
  }, [pathname, safeSyncAll]);

  // 3. Tab focus / app unlock sync (throttled)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        safeSyncAll();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => { document.removeEventListener("visibilitychange", handleVisibilityChange); };
  }, [safeSyncAll]);

  // Sync Budget Store to Supabase with conflict detection
  useEffect(() => {
    const unsub = useBudgetStore.subscribe((state, prevState) => {
      if (initializingRef.current) return;
      // Exclude lastSyncedAt and notifications from change detection to avoid feedback loops
      if (
        state.config === prevState.config && 
        state.categories === prevState.categories
      ) {
        return;
      }
      
      if (budgetDebounceRef.current) clearTimeout(budgetDebounceRef.current);
      budgetDebounceRef.current = setTimeout(async () => {
        budgetDebounceRef.current = null;
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        
        const { data: profile } = await supabase.from('profiles').select('household_id').eq('id', session.user.id).single();
        if (!profile?.household_id) return;

        // Fetch-before-write: check if someone else wrote since our last sync
        const localLastSync = useBudgetStore.getState().lastSyncedAt;
        const { data: serverBudget } = await supabase
          .from('budgets')
          .select('updated_at')
          .eq('household_id', profile.household_id)
          .single();

        if (serverBudget?.updated_at) {
          const serverTime = new Date(serverBudget.updated_at).getTime();
          if (serverTime > localLastSync) {
            // CONFLICT: server has a newer write from another device
            // Re-fetch the truth instead of overwriting it
            initializingRef.current = true;
            await useBudgetStore.getState().initialize();
            setTimeout(() => { initializingRef.current = false; }, 100);
            
            // Notify the user
            useBudgetStore.getState().addNotification({
              title: 'Sync Conflict',
              message: 'Your partner made a change at the same time — your edit wasn\'t saved. Please re-enter it.',
              read: false,
              type: 'alert',
            });
            return;
          }
        }

        // No conflict — safe to write
        const currentState = useBudgetStore.getState();
        const now = new Date().toISOString();
        await supabase.from('budgets').upsert({
          household_id: profile.household_id,
          period: currentState.config.period || 'monthly',
          hero_target: currentState.config.targetAmount || 0,
          categories: currentState.categories,
          config: currentState.config,
          updated_at: now
        }, { onConflict: 'household_id' });

        // Update local sync timestamp so future conflict checks are accurate
        useBudgetStore.setState({ lastSyncedAt: new Date(now).getTime() });
      }, 1500);
    });

    return () => {
      unsub();
      if (budgetDebounceRef.current) clearTimeout(budgetDebounceRef.current);
    };
  }, []);

  return <>{children}</>;
}
