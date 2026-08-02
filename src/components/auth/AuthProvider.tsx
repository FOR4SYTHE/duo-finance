"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useBudgetStore } from "@/store/useBudgetStore";
import { createClient } from "@/utils/supabase/client";

const SYNC_COOLDOWN_MS = 30_000; // 30 seconds between background syncs

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initializeAuth = useAuthStore(state => state.initialize);
  const initializeCurrency = useCurrencyStore(state => state.initialize);
  const initializeSettings = useSettingsStore(state => state.initialize);
  const initializeBudget = useBudgetStore(state => state.initialize);
  
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
    setTimeout(() => { initializingRef.current = false; }, 100);
  }, [initializeAuth, initializeCurrency, initializeSettings, initializeBudget]);

  // 1. Initial load + auth state changes (force = true, always immediate)
  useEffect(() => {
    const supabase = createClient();

    syncAll(true); // First load — always fetch

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      syncAll(true); // Auth events (login/logout) bypass throttle
    });

    return () => { subscription.unsubscribe(); };
  }, [syncAll]);

  // 2. Route navigation sync (throttled — respects 30s cooldown)
  useEffect(() => {
    syncAll();
  }, [pathname, syncAll]);

  // 3. Tab focus / app unlock sync (throttled)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncAll();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => { document.removeEventListener("visibilitychange", handleVisibilityChange); };
  }, [syncAll]);

  // Sync Budget Store to Supabase automatically when it changes
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const unsub = useBudgetStore.subscribe((state, prevState) => {
      if (initializingRef.current) return;
      if (
        state.config === prevState.config && 
        state.categories === prevState.categories && 
        state.goals === prevState.goals
      ) {
        return;
      }
      
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        
        const { data: profile } = await supabase.from('profiles').select('household_id').eq('id', session.user.id).single();
        if (profile?.household_id) {
          await supabase.from('budgets').upsert({
            household_id: profile.household_id,
            period: state.config.period || 'monthly',
            hero_target: state.config.targetAmount || 0,
            categories: state.categories,
            goals: state.goals,
            config: state.config,
            updated_at: new Date().toISOString()
          }, { onConflict: 'household_id' });
        }
      }, 1500); // Debounce saves for 1.5s
    });

    return () => {
      unsub();
      clearTimeout(timeout);
    };
  }, []);

  return <>{children}</>;
}
