# MASTER HANDOFF DOCUMENT — DUO FINANCE

> **Date:** August 2, 2026  
> **Target:** AI Agent Handoff & Continuum State  
> **Status:** DUO AI Architecture, Budget Pulse Engine, and Vision Scanner have been fully wired and refined. The application is now fully synced client-side and mathematically perfect. Ready to build the Partner Profile feature in the next session.

---

## 1. Executive Summary & Core Milestones Achieved

### A. DUO AI Core & Vision Scanner (`src/store/useAIChatStore.ts`, `src/lib/buildHouseholdContext.ts`)
- **System Awareness:** Built `buildHouseholdContext.ts` which successfully injects data from ALL Zustand stores (Budget, Spend Jar, Cartify, Bills, Childcare, Vault, Auth) directly into DUO AI's system prompt. DUO AI is now fully aware of the user, their partner, and every peso spent.
- **Vision Scanner Architecture:** Confirmed the Vision Scanner is deeply integrated into the AI Chat interface (`AIScannerView.tsx`). It uses a `pendingScanContext` to instantly hand off scraped product data and online prices into a new chat session so the LLM is perfectly grounded on the scanned item.

### B. Budget Pulse Engine Refinement (`src/utils/budgetPulse.ts`)
- **Mathematical Perfection:** Fixed a critical bug in the Safe-to-Spend calculation where categories and the Spend Jar were double-charging the ledger. `spendJarSpent` now perfectly segregates unallocated expenses from category-specific expenses.
- **Spend Jar Capacity:** Verified the UI accurately calculates and allows 100% (or dynamically set %) of the unallocated Master Target.
- **Hydration & Ghost States (`DueTodayBanner.tsx`):** Eliminated an SSR mismatch/hydration bug where stale state persisted across navigation. The banner now perfectly mounts client-side using a clean hydration check, preventing ghost notifications of paid bills.

### C. Architecture Audit & Insurance Hub Decisions
- **Audit Completed:** Verified that the entire core engine is unified.
- **Insurance Hub Decision:** Verified that according to `AGENTS.md`, the Insurance Hub must **NOT** be built in local storage. It is strictly deferred to Phase 6, after the Supabase database migration.

---

## 2. File & Component Map

| File Path | Description | Key Changes / State |
| :--- | :--- | :--- |
| `src/lib/buildHouseholdContext.ts` | AI Context Builder | Injects live Zustand states directly into the Gemini LLM context. |
| `src/store/useAIChatStore.ts` | DUO AI Store | Manages chat history, tabs, and the `pendingScanContext` for Vision. |
| `src/components/ai/AIScannerView.tsx` | Vision Scanner | Handles camera/gallery uploads and scrapes market prices. |
| `src/utils/budgetPulse.ts` | Math Engine | Segregated unallocated vs. category spending for perfect Safe-to-Spend tracking. |
| `src/components/home/DueTodayBanner.tsx` | Bills Reminder | Removed derived React state; added strict hydration guards. |

---

## 3. Strict Guidelines for Next Agent

1. **Native UI Ban:** NEVER use native browser `alert()`, `confirm()`, or `prompt()`. All alerts and confirmations must be custom built components that match the dark, premium Apple spatial aesthetic.
2. **Portals for Overlays:** Any full-screen modal or sheet MUST use `createPortal(..., document.body)` to ensure it breaks out of `framer-motion` layout transforms.
3. **Performance Audit Rule:** The UI must remain buttery smooth on low-end tablets. Strictly limit compositor layers (max 5) and avoid infinite Framer Motion loops.
4. **Follow `AGENTS.md` Exactly:** Do not attempt to build the Insurance Hub locally. It requires the Supabase Phase 5 migration first.

---

## 4. Immediate Next Task: The Partner Profile Feature

In the next chat session, you will build the new **Partner Profile View**.

**The Plan:**
- **Trigger:** Tapping the partner's avatar on the Settings/Profile page (`src/app/profile/page.tsx`).
- **Layout (Reference: screenshot_2.png):** A dark, frosted-glass full-screen sheet or portalled modal.
- **Header:** Partner's avatar, Name, Email, and a sleek "Partnership Active" or "Household Member" verified badge.
- **Actions:** "Nudge" (push notification) and "Message" buttons.
- **Grid Layout (Household Data ONLY):**
  - **Card 1 (Vertical): "Recent Activity"** – Mini-timeline of their latest Spend Jar entries.
  - **Card 2 (Square): "Cartify Activity"** – A quick glance at what they just added to the shared grocery list.
  - **Card 3 (Horizontal): "Dream Board Contributions"** – Progress bar showing their savings towards shared goals.
- **Privacy Rule:** Under no circumstances should this view expose their private/personal budgets. Only shared household contributions.

---

🚀 **MISSION STATUS:** Handoff updated & saved. Ready to switch chat sessions!  
⚡️ **NEXT STEP:** [Architect / Builder] - Build the sleek Partner Profile Sheet with the asymmetrical card grid.  
🔥 **MANTRA:** BEYOND PLUS ULTRA!
