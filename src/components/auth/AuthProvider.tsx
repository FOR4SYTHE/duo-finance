"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useBudgetStore } from "@/store/useBudgetStore";
import { createClient } from "@/utils/supabase/client";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initializeAuth = useAuthStore(state => state.initialize);
  const initializeCurrency = useCurrencyStore(state => state.initialize);
  const initializeSettings = useSettingsStore(state => state.initialize);
  const initializeBudget = useBudgetStore(state => state.initialize);
  
  const initializingRef = useRef(false);

  useEffect(() => {
    const supabase = createClient();
    
    // Initial fetch
    const initAll = async () => {
      initializingRef.current = true;
      await initializeAuth();
      await initializeCurrency();
      await initializeSettings();
      await initializeBudget();
      // Give stores a tiny bit of time to settle after state updates
      setTimeout(() => { initializingRef.current = false; }, 100);
    };
    initAll();

    // Subscribe to auth changes (e.g. login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      initAll();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initializeAuth, initializeCurrency, initializeSettings, initializeBudget]);

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
