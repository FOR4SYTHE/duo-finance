# MASTER HANDOFF DOCUMENT — DUO FINANCE

> **Date:** July 29, 2026  
> **Target:** AI Agent Handoff & Continuum State  
> **Status:** Global Settings, App Security Lock, Subscriptions Manager, and Haptic feedback have been fully built, wired to Zustand stores, and polished. The application is now ready for core backend feature work (Spend Jar, Cartify, Monthly Budget).

---

## 1. Executive Summary & Core Milestones Achieved

### A. Global State & Persistence (`src/store/`)
- **`useSettingsStore.ts`**: Built a global Zustand store with `persist` middleware to track all App Preferences, Notifications, and Security settings (FaceID, PIN, Lock Timeouts, Start Week on Monday, etc.).
- **`useSubscriptionsStore.ts`**: Built a persistent Zustand store to replace the mock `MOCK_SUBS` array. Manages adding/removing subscriptions and calculating dynamic monthly totals.

### B. Security & App Lock (`src/components/security/AppLockScreen.tsx`)
- **Global Inactivity Lock**: Built a top-level overlay (`fixed inset-0 z-[9999]`) injected directly into `src/app/layout.tsx`.
- **Visibility Listener**: It actively listens to `visibilitychange`. When the user leaves the app/browser and returns, it calculates the time away against their chosen `lockTimeout` (Immediately, 1 min, 5 min).
- **Security UI**: A premium dark screen featuring a 4-digit PIN pad and a "Use FaceID" button (UI prepped for native WebAuthn). Mock unlock triggers upon successful 4-digit entry.

### C. Subscriptions Manager (`src/components/profile/AddSubscriptionSheet.tsx`)
- **Add Subscription Portal**: Built a beautiful Framer Motion bottom-sheet modal using `createPortal` (portalled to `document.body` to avoid nested transform clipping).
- **Flow**: Users can select a curated preset (Netflix, Gym) or enter a "Custom" name, use the custom Numpad to assign the monthly cost in PHP, and save it to the global store.
- **Dynamic Updates**: The `SubscriptionsPage` map was refactored to read from the store, and the total monthly cost card now instantly updates (with dual-currency ZAR conversions).

### D. Settings Pages Polish & Fixes (`src/app/profile/*`)
- **Toggle Fixes**: Completely rebuilt the CSS for toggle switches so the inner circle never overlaps/clips the pill border when active (green).
- **Removed Glows**: Stripped the ambient screen-wide colored glows from all settings sub-pages for a cleaner, darker aesthetic.
- **Haptics Utility (`src/lib/haptics.ts`)**: Built a `triggerHaptic('light' | 'medium' | 'heavy')` utility. It reads the global `haptics` state before firing `navigator.vibrate()`. Wired this into every toggle switch and Numpad tap.
- **Custom Sign Out Modal**: Removed native browser `confirm()` dialogue. Built a sleek, custom red-tinted Framer Motion Sign Out modal at the bottom of the Profile page.
- **Dark Mode Strategy**: Affirmed that a true Light Mode is deferred to v2 due to the app's reliance on Apple-style spatial dark UI. Tapping the Dark Mode toggle now triggers a haptic bump, snaps back instantly, and displays a toast: *"Duo is optimized for Dark Mode (Light Mode coming soon)"*.
- **Bug Fix**: Resolved `toggleMockPartner is not defined` ReferenceError in `ProfilePage`.

---

## 2. File & Component Map

| File Path | Description | Key Changes / State |
| :--- | :--- | :--- |
| `src/store/useSettingsStore.ts` | Global Settings | Persistent store for FaceID, PIN, timeouts, notifications, and preferences. |
| `src/store/useSubscriptionsStore.ts` | Subscriptions | Persistent store tracking user's active recurring subscriptions. |
| `src/components/security/AppLockScreen.tsx` | Global Lock Overlay | Injected in `layout.tsx`. Listens to `visibilitychange` to trigger PIN/FaceID. |
| `src/components/profile/AddSubscriptionSheet.tsx` | Add Sub Modal | Portalled Framer Motion sheet with presets and a custom Numpad. |
| `src/lib/haptics.ts` | Haptics Utility | Checks `useSettingsStore` before firing `navigator.vibrate()`. |
| `src/app/profile/biometrics/page.tsx` | Biometrics Settings | Wired to `useSettingsStore`. Toggles fixed, glows removed. |
| `src/app/profile/notifications/page.tsx` | Notifications Settings | Wired to `useSettingsStore`. Toggles fixed, glows removed. |
| `src/app/profile/preferences/page.tsx` | App Preferences | Handles Dark Mode rejection toast, haptics toggle. |
| `src/app/profile/subscriptions/page.tsx` | Subscriptions List | Refactored to map global store data. Triggers Add Sub Sheet. |
| `src/app/profile/page.tsx` | Profile Root | Added custom Sign Out confirmation modal. Fixed `toggleMockPartner` bug. |

---

## 3. Strict Guidelines for Next Agent

1. **Native UI Ban:** NEVER use native browser `alert()`, `confirm()`, or `prompt()`. All alerts and confirmations must be custom built components that match the dark, premium Apple spatial aesthetic.
2. **Portals for Overlays:** Any full-screen modal or sheet (like `AddSubscriptionSheet`) MUST use `createPortal(..., document.body)` to ensure it breaks out of `framer-motion` layout transforms.
3. **Performance Audit Rule:** Everything built moving forward MUST undergo a performance audit before completion. The UI must remain buttery smooth, lite, and fast at all times. Avoid excessive `backdrop-blur` on repeated list items.
4. **Dark Mode Only:** The app is strictly optimized for Dark Mode. Do not attempt to implement Light Mode (white backgrounds) without a massive redesign phase.
5. **Dual Currency Everywhere:** Every instance of a currency display must show the secondary currency implicitly.

---

## 4. Immediate Next Task (Start of Next Chat)

1. **Begin Core Workflow Modules:**
   - With the foundational settings, navigation, and security complete, the next major focus should be the **Spend Jar** (everyday tracking) or the **Budget Module** (monthly allocations).
   - Prioritize connecting these to global Zustand stores before worrying about Supabase backend.

---

🚀 **MISSION STATUS:** Handoff updated & saved to `HANDOFF.md`. Ready to switch chat sessions!  
⚡️ **NEXT STEP:** [Architect / Builder] - Begin building the Spend Jar or Budget Manager in a new chat session.  
🔥 **MANTRA:** BEYOND PLUS ULTRA!
