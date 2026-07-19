# AGENTS.md — Couple Budget & Currency App

> Handoff/build guide for AI coding agents (Gemini, Antigravity, Cursor, etc).
> This document is the single source of truth for the product. Read it fully before writing code. If a decision isn't covered here, default to the simplest, most usable option and flag the assumption rather than guessing silently.

---

## 1. Project Overview

A personal finance app for a couple relocating together in the Philippines — one partner is Filipino, the other is from South Africa and relocating soon. Built first for the two of them, designed well enough to become a portfolio case study and, eventually, a public product.

**Core use cases:**
1. Quick calculations that always show both PHP and ZAR side by side.
2. Country-specific budgeting for moving in together and running a household.
3. A continuous "Spend Jar" that logs everyday spending against the set budget, week by week or month by month.
4. A live shopping-trip budget tracker ("Cartify") for grocery/retail runs.
5. (Later) A camera-based shopping assistant that identifies items and surfaces curated buying options.

**Non-negotiable usability bar:** every core action must be usable by a "lazy" person or an older person with no tech background — one thumb, minimal taps, nothing hidden behind menus for the primary action.

**Global rule — applies everywhere in the app:** any time a price or amount is shown, display both **PHP** and **ZAR** together. Never show a bare number without its converted counterpart, even in secondary UI (list rows, totals, warnings, notifications).

---

## 2. Design Direction

**Aesthetic:** Apple-style premium — clean, quiet, confident. Reference points: Apple's own apps (Wallet, Weather), Airbnb's booking flow. Not flashy, not maximalist. Typography-led, generous whitespace, restrained motion.

**Principles to follow:**
- One clear primary action per screen. If a screen has more than one obvious next step, it's doing too much.
- Numbers are the hero. Budget totals, converted amounts, and warnings should be the largest, highest-contrast thing on screen — everything else recedes.
- Color carries meaning, not decoration: use a green→amber→red gradient for budget health, not just a binary switch. Keep the rest of the palette neutral (near-black text, soft neutral backgrounds, one restrained accent color).
- Motion should be functional, not ambient: number count-ups, a subtle shift when a budget crosses a threshold, a smooth transition when swapping currencies. Avoid gratuitous animation — it should never get in the way of a one-tap action.
- Do not default to generic AI-generated design tropes (cream background + terracotta accent, near-black + neon accent, or a broadsheet/newspaper layout with numbered sections). Pick a palette and type pairing deliberately suited to this brief — a real financial/calm app, not a marketing landing page.
- Respect accessibility basics: visible focus states, sufficient contrast, reduced-motion support, large tap targets (this app will be used by an older, less tech-fluent user).

**Copy voice:** plain, direct, active. "You're over budget by ₱300 / R21" not "Budget threshold exceeded." Errors and warnings explain what happened and what to do next — never vague, never apologetic filler.

**STRICT RULE — no bland or plain UI, ever.** Every screen must read as premium: modern component architecture, deliberate spacing and hierarchy, real depth (soft shadows/elevation, not flat blocks), considered micro-interactions, and components that look designed, not scaffolded. "Functional but plain" is a failing result, not an acceptable intermediate step — flat, default-looking, or boilerplate-feeling UI (unstyled-looking buttons, default form inputs, generic card grids with no visual identity) does not meet the bar even if every value on screen is technically correct.

Before reporting any UI work as done, self-check it against this list — if any answer is "no," it isn't done yet:
- Does this screen have one clear visual hero (a number, a chart, a status) rather than everything competing at the same weight?
- Do buttons, inputs, and cards look like designed components (custom radius, elevation, spacing) rather than unstyled or default-library-looking elements?
- Is there at least one considered detail beyond bare function — the signature glow, a smooth transition, a thoughtful empty state — that a generic scaffold wouldn't have?
- Would this screen look at home next to the reference apps discussed earlier in this project (Revolut, Apple Wallet-style dark fintech UI), not next to a basic Bootstrap/shadcn starter left unstyled?

If a UI change can't honestly clear all four, it goes back for another pass before being marked complete.

**Color nuance — "one hero color moment," not a colorful app.** The restraint principle above still holds, but restraint isn't the same as monochrome. Premium fintech references (Apple Wallet-style card stacks, colorful gradient payment cards against a neutral dark shell) get their luxury feel from *one* saturated, deliberate color moment per screen — a single hero card or focal element — while everything surrounding it stays neutral and quiet. Apply that here: the neutral dark palette from Section 2 is the shell for 95% of the UI; a single hero element per screen (the main budget-health card on Home, for instance) can carry a richer, more saturated color tied to meaning (status/category), as long as the chrome around it doesn't compete. Curved, soft-edged cards; circular icon-buttons with a label beneath (not text-in-a-pill buttons); and a floating, rounded/capsule-shaped bottom navigation bar are all part of this same visual language — lean into all three.

**Responsive & adaptive layout — non-negotiable.** The "phone frame" bezel used in early design mockups/screenshots was a presentation device for reviewing designs — it must never be a hardcoded container in the shipped app. Every screen must fluidly adapt to whatever viewport it's actually running in: real mobile browsers (using `100dvh` and safe-area-inset padding, not a fixed pixel height), and desktop web (content reflows sensibly — e.g. a centered, comfortably-read column — rather than either stretching edge-to-edge or staying trapped in a tiny mobile-width box on a wide screen). Nothing should ever require scrolling to reveal a primary action (like a "Start Trip" or "Confirm" button) that should be visible without scrolling on a normal device viewport. Any modal or overlay must be a true full-screen layer with correct stacking (above the persistent bottom nav, not bleeding through it), and any floating action button must be positioned relative to the app's content container, not raw browser/viewport coordinates. Test and confirm this at more than one viewport size, not just the sandbox's default render.

---

## 3. Tech Stack

- **Frontend:** Next.js + React + Tailwind CSS (v4 — use `@import "tailwindcss";` and `@theme` for custom design tokens, not legacy v3 `@tailwind base/components/utilities` directives or `bg-[var(--...)]` arbitrary syntax). Motion via Framer Motion (and GSAP only if a specific animation needs it).
- **Backend/data:** Supabase free tier — Postgres + Auth, shared between two accounts (the couple shares budget data).
- **Hosting:** Vercel free tier.
- **Currency rates:** Frankfurter API (free, no key, ECB-based) as primary; exchangerate-api.com free tier as fallback. Cache rate + timestamp; refresh hourly, not per keystroke.
- **Vision/scanning (Phase 5 only):** Google Cloud Vision API free tier, or a vision-capable LLM call (Gemini or Claude) sent the photo directly, prompted to identify the item and generate a search query.
- **Budget/AI check-ins (optional, later):** a single LLM call at period-end (Spend Jar) or trip-end (Cartify) — never per-entry — summarizing status and suggesting adjustments. Keep these rare and cheap to stay within free tiers.

**Everything must run on free tiers only.** Flag any feature that would require a paid API before building it, and propose a free-tier-compatible alternative or a scoped-down mock version instead.

---

## 4. Feature Specs

### 4.0 App Shell — Home & Navigation (build this scaffold first, across all sections)

Right now only the Calculator exists in isolation, with no context for what pressing "Confirm Amount" leads to. Before going deeper on any single feature, build the navigational shell that makes the whole app legible as one product — every section reachable, even before it's functional.

**Bottom navigation:** a floating, rounded/capsule-shaped bar (not a flat edge-to-edge bar) with icon + label for: Home, Calculator, Budget, Spend Jar, Cartify. The active tab gets a filled pill highlight behind its icon. Keep the Shopping Scanner (4.5) off the tab bar entirely for now — it doesn't exist yet, and a dead tab undercuts the premium feel. Surface it instead as a "Coming soon" tile on Home.

**Home screen:**
- Header: a simple greeting + notification icon, understated (not a big focal element).
- Hero card: an overall household budget-health snapshot for the active period, dual currency, using the green→amber→red status language — this is the one screen-level element allowed the richer "hero color moment" treatment described in Section 2.
- Quick actions row: circular icon-buttons with a label beneath, matching the reference pattern exactly — Calculate, Log Spend (routes into Spend Jar's quick-add), Start Trip (routes into Cartify), Scan (visually present but disabled/locked with a "coming soon" state).
- Section cards below, one per feature area (Budgeting, Spend Jar, Cartify, Scanner) — tapping any of them navigates to that section's screen.

**Scaffolding rule:** sections other than the Calculator do not need working logic yet — static or mock data is completely fine at this stage. But the "no bland UI" strict rule from Section 2 applies in full to every placeholder screen too. A scaffolded screen should look like a real, premium screen with sample data in it, not a gray "coming soon" box. The point of this phase is to see the whole app's shape and feel, so every placeholder needs to actually look finished even though it isn't wired up.

**Context this creates:** once this shell exists, the Calculator's "Confirm Amount" action has a clear destination — it's the shared amount-entry UI referenced in 4.3, so confirming there should read naturally as "log this amount," not float with no explanation.

### 4.1 Calculator + Live Currency Converter (Phase 1)

- Standard four-function calculator (+ %), nothing scientific.
- As the user types and after `=`, show the result in the primary currency, with a secondary line beneath showing the live converted amount in the other currency (e.g. `999 PHP` → `R266.67`).
- One tap/icon to swap which currency is primary; the whole app should remember this preference per user. **Swapping must actually recompute the conversion in the correct direction (multiply vs. divide), not just relabel the currency on a cached number — this broke once already during the build, so this needs a dedicated test case.**
- Cache the exchange rate locally with a "rates as of [time]" label so it still works offline with the last-known rate.
- This is the fastest, simplest feature — ship it first and cleanly before touching anything else.

### 4.2 Budgeting Module (Phase 2)

- Categories: food, utilities, rent, needs, medication, insurance (extensible list).
- Time-period toggle: weekly / monthly / every 3–6 months / annually, with entries auto-converting between periods (e.g. a weekly figure shown as its monthly equivalent).
- This module is where the couple *sets* their target budget per category/period. The *actual* running totals against that target are populated by real logged spend from the Spend Jar (4.3) and Cartify (4.4) — see the shared data model note below. This module should not maintain its own separate, disconnected "spent so far" number.
- Simple visual breakdown (donut or stacked bar) per category, always in dual currency.
- **Move-in cost estimator** (Airbnb-style inputs): number of adults/children, expected duration → outputs an estimated one-time setup cost plus an ongoing monthly baseline. Reserve this Airbnb-style selector specifically for setup/rent-type categories — it doesn't map cleanly to categories like medication or insurance.
- Cost-of-living reference data: for v1, use a small curated/hardcoded table of PH cost ranges (rent by city, average utilities, etc.) rather than depending on a paid cost-of-living API. Accuracy and control matter more than automation here.

### 4.3 Spend Jar — Continuous Spend Tracker (Phase 3)

The everyday counterpart to a savings piggy bank, but for outgoing spend: instead of dropping money into savings, every purchase gets "dropped into the jar," and the jar fills up against the budget set in 4.2 over the current week or month.

- **Quick-add is the whole interaction:** one persistent shortcut (home screen or floating action), tap it, enter an amount, optionally add a short note and/or category — nothing required beyond the amount. This must be reachable in one or two taps from anywhere in the app.
- **Accumulation window:** entries roll up automatically within whatever period (weekly/monthly) is active in the Budgeting Module — this is not a separate budget the user has to configure twice.
- **Visual:** a filling jar or progress ring showing accumulated spend vs. the period's set budget, always dual currency, using the same green→amber→red health language as the rest of the app.
- **AI check-in:** at period end, or on demand via a "how are we doing?" tap, a single LLM call summarizes whether they're under, on track, or over budget, plus one or two plain-language observations (e.g. biggest category this period, if categorized). One call per check, never per entry, to stay free-tier friendly.
- **Shared data model with Cartify (4.4):** build a single underlying "expense entries" table (amount, currency, category, timestamp, optional `trip_id`) that powers both features. Spend Jar is that table aggregated over a week/month; a Cartify trip is a burst of entries tagged with the same trip_id and shown with a live countdown instead of a period total. Building this shared model now avoids duplicating logging logic later.

### 4.4 Cartify — Shopping Trip Budget Tracker (Phase 4)

**Start a trip:** one primary button. Ask two things only: budget amount (numeric keypad, same style as the calculator), and a single toggle — Simple or Organized.

**Simple mode (default, "lazy" path):** no categories, no pre-planning, **and no category UI of any kind, ever** — this is the key distinction from Unplanned below. A big running total ("₱2,000 left / R533 left") at the top. Adding an item is exactly: tap "+", type price, done. This is the primary, fastest path and must never require more taps than this, and must never surface a category picker, chip, or grouping — that complexity belongs entirely to Organized mode.

**Organized mode** splits into two further sub-modes, chosen at trip start. Both sub-modes of Organized must visibly and functionally differ from Simple — if an Organized mode screen looks identical to Simple, something is wrong; category selection must always be present and required in both Organized sub-modes below:

- **Unplanned (organized-on-the-fly):** no pre-trip list. Pick a top-level category (Groceries, Clothes, Furniture, etc. — large tappable icons, not a dropdown). Inside, a persistent "current subcategory" chip (e.g. "Dairy") tags every price entered until changed. Switching subcategory is a single tap → icon grid → tap — it must never interrupt or gate the act of adding a price.

- **Planned (pre-listed):** before the trip even starts, the user builds a shopping list — categories and/or specific items they intend to buy, no prices yet — plus the trip budget. At the store, this becomes a live list of tappable rows:
  - Unpriced/"still need" items are visually distinct (e.g. dimmed/outlined) from priced/"in cart" items.
  - Tapping an unpriced item opens the same price-entry keypad used elsewhere in the app; confirming a price moves that item into the "in cart" state and it starts counting against the budget.
  - Each priced item gets a **+ / − stepper**: **+** adds another unit at the same price (fast path for buying multiples; tapping the row itself lets you edit the price if it differs). **−** decrements the quantity; if it reaches zero, the item reverts to its unpriced "still need" state rather than disappearing — it stays on the list so it can be logged again without rebuilding it.
  - **Swipe left** on any item (priced or not) fully removes it from the list entirely — this is the only action that deletes the item outright, distinct from `−` which only decrements/reverts it.
  - An always-available "+" floating action button lets the user log an item that wasn't on the original pre-trip list, for anything unplanned that comes up mid-trip.

**Budget health display:**
- Color gradient (green → amber ~80% → red at/over), not a binary indicator.
- Haptic buzz (`navigator.vibrate` or native haptics) the instant the total crosses 100%.
- When over budget: show the itemized list sorted by price descending (most expensive items surfaced first) rather than just a red number.

**Suggestions when over budget** (rule-based, no AI needed for v1):
- Flag likely-duplicate-ish items within a category (e.g. multiple similarly-priced items in Snacks).
- In categorized mode, surface which *category* is the biggest contributor to the overage, not just a single item.
- Optional v2: a single end-of-trip LLM call sending the item list + prices + budget, asking for 2–3 short plain-language suggestions — call this once per trip on request, never per item, to stay cheap.

**Preference persistence:** Simple vs. Organized (and Planned vs. Unplanned within Organized) should be a saved per-user preference, not a per-trip prompt — the couple may prefer different modes.

### 4.5 Shopping Scanner (Phase 5 — build last, scope carefully)

- User photographs an item (e.g. an oven). A vision call (Vision API or a vision-capable LLM) identifies the item and generates a smart search query.
- Present results as a "bento box" grid: image, short description, price, link, location — not a generic search results list.
- **Scoping reality check:** a true live price-comparison/deal-aggregation engine across PH retailers is its own full product and will exceed any free tier if built for real. For v1: either (a) generate the search query and deep-link out to retailer search pages (Lazada, Shopee, local appliance stores) rather than scraping/aggregating results yourself, or (b) build a polished bento-grid UI with a handful of hardcoded real examples (oven, fridge, aircon) and be explicit in the portfolio case study that live aggregation is a v2 roadmap item.

---

## 5. Build Order

1. **App Shell (4.0) — build this next.** Home screen, bottom navigation, and premium-looking placeholder screens for every section. Nothing beyond the Calculator needs to be functional yet, but everything needs to be reachable and look finished.
2. Calculator + currency converter (dual PHP/ZAR display, swappable, correctly recalculated in both directions) — already underway; finish polishing this alongside the shell since it's the reference implementation for the design system.
3. Budgeting Module — categories, periods, move-in cost estimator (planning/target-setting only at this stage).
4. Spend Jar — the shared expense-entries data model, quick-add flow, and period accumulation. This is simpler than Cartify and unlocks it, so build it first.
5. Cartify — shopping trip tracker built on the same expense-entries model as Spend Jar, Simple mode first, then Categorized.
6. Shopping scanner — scoped per the note above; treat as a stretch/polish feature, not core v1.

Do not start full functionality on Phase 3 onward until the App Shell (step 1) is in place — seeing the whole app's shape first is the point of this reordering.

---

## 6. Handoff Notes for the Agent

- This project was scoped through a design/ideation conversation with Claude; this file is the complete distillation of that conversation. Treat it as the brief — don't re-litigate the scoping decisions above (e.g. why the scanner is scoped down, why Simple mode is the default) unless something here is genuinely infeasible.
- If you hit a decision not covered here, default to: simplest option, most usable for a non-technical user, free-tier compatible. State the assumption you made rather than silently picking one.
- Keep the PHP/ZAR dual-display rule and the Apple-style premium aesthetic consistent across every phase — these are the two threads that should never regress as features get added.
- Prefer small, working increments (Phase 1 fully working before Phase 2 starts) over building all four phases in parallel.
- **No bland or plain UI is acceptable at any phase.** See the strict rule and self-check list in Section 2 — run it before marking any screen or component as finished, not just at the end of the project.
- **Always verify before reporting success.** A dev server that won't boot in the sandbox means visual claims can't be self-verified — say so plainly and hand off for a screenshot rather than describing unseen output as working. Logic (calculator math, currency conversion direction, budget math) CAN be verified without a browser via unit tests run directly in the sandbox — there's no excuse to skip that verification. And a passing test suite only proves something if a test actually targets the specific bug that was reported; add one when a bug is fixed, don't just point at unrelated tests passing.