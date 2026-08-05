import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuthStore } from '@/store/useAuthStore';
import { useInsuranceStore } from '@/store/useInsuranceStore';

export function useRealtimeInsurance() {
    const { user } = useAuthStore();
    const { initialize, _hasHydrated } = useInsuranceStore();

    useEffect(() => {
        if (!user || !_hasHydrated) return;

        const supabase = createClient();

        const channel = supabase.channel('insurance-channel')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'medical_events' },
                () => {
                    initialize();
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'insurance_policies' },
                () => {
                    initialize();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, _hasHydrated, initialize]);
}
