import { useSettingsStore } from "@/store/useSettingsStore";

export const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
  const isEnabled = useSettingsStore.getState().haptics;
  if (!isEnabled) return;
  
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    if (style === 'light') navigator.vibrate(10);
    else if (style === 'medium') navigator.vibrate(20);
    else if (style === 'heavy') navigator.vibrate([20, 30, 20]);
  }
};
