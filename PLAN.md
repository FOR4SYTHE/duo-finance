# 📋 Execution & Architecture Plan — Duo Finance

## Current Status & Audit
- **UI Design Phase:** In progress across core modules (Home, Budget, Spend Jar, Cartify, Calculator).
- **Client Stores:** Zustand + localStorage persistence in `src/store/` using clean schemas in `src/types/finance.ts`.
- **Portal Overlays & Layout:** Portaled modals to `document.body`, fluid typography, custom styling, responsive boundaries.

---

## 🚀 Post-UI Migration Plan: Supabase Backend & Insurance Tracker

Once all UI screens, interactions, and Zustand stores are 100% complete and approved, execute this backend migration plan.

### Phase 1: Supabase Initialization & Joint Household Auth
1. **Database Setup & Client Integration:**
   - Install `@supabase/supabase-js` and `@supabase/ssr`.
   - Configure Supabase environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
2. **Household & Auth RLS Schema:**
   - `households` (id, name, created_at)
   - `household_members` (id, household_id, user_id, role, created_at)
   - Enable Row Level Security (RLS) across all tables enforcing `household_id = (SELECT household_id FROM household_members WHERE user_id = auth.uid())`.
3. **Household Pairing Flow:**
   - User sign-up / login (Email Magic Link / OTP).
   - Generate 6-digit invite code for the relocating partner to join the household.
4. **Zustand Realtime Sync:**
   - Connect client Zustand stores (`useBudgetStore`, `useSpendStore`, `useCartifyStore`, `useBillsStore`) to sync mutations with Supabase and subscribe to Realtime changes.

---

### Phase 2: Insurance Tracker & Benefits Reader (Post-Supabase)

Plugs directly into the `household_id` Supabase migration model.

#### 1. Database Schema
- **`insurance_policies`** (Household-scoped, RLS protected):
  - `id` (uuid, primary key)
  - `household_id` (uuid, references `households(id)`)
  - `insurer_name` (text, e.g. "Maxicare", "PhilHealth")
  - `plan_name` (text, e.g. "Prime 100k")
  - `plan_type` (text: Life / HMO / Gov't Health / VUL / Critical Illness)
  - `premium_amount` (numeric)
  - `premium_frequency` (text: monthly / annual)
  - `coverage_amount` (numeric, nullable)
  - `dependents_count` (int, nullable)
  - `renewal_date` (date)
  - `status` (text: active / lapsed / cancelled)
  - `custom_fields` (jsonb for MBL, OPD limit, ER coverage, fund value)
- **`insurance_plan_templates`** (Public reference data, authenticated read):
  - `id` (uuid, primary key)
  - `insurer_name` (text)
  - `plan_name` (text)
  - `plan_type` (text)
  - `benefit_fields` (jsonb structured breakdown)
  - `last_updated` (date)

#### 2. Feature Tabs & Logic
- **Tab 1: Explore / Compare** — Browse `insurance_plan_templates` grouped by type. Includes "Log this as mine" pre-fill action.
- **Tab 2: My Plans** — CRUD policy log with custom statistics per plan type and dual currency conversion (PHP / ZAR).
- **Tab 3: Benefits Reader** — Matches policy against templates for read-only benefit breakdowns with policy-specific field override support.
- **Tab 4: What to Get (Gap Analyzer)** — Rule-based suggestions based on missing plan types (e.g., missing Life or dental cover).
- **Renewal Reminders Integration** — Policy `renewal_date` automatically feeds into the shared `Bills/Due-Date Calendar`.
- **Phase 2 Document Scanner (Optional)** — Upload policy PDF → Anthropic Claude API pre-fills form fields for user confirmation.

---

## 🔒 Verification & Quality Checklist
- Dual PHP/ZAR currency display across all insurance policy statistics and premiums.
- RLS security verification: Users can only view/edit policies belonging to their own `household_id`.
- Zero broken layouts on mobile & desktop (`100dvh`, intrinsic sizing, no clipped cards).
