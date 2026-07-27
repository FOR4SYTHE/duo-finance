# MASTER HANDOFF DOCUMENT — DUO FINANCE

> **Date:** July 27, 2026  
> **Target:** AI Agent Handoff & Continuum State  
> **Status:** All requested UI, Physics, Auth, and Layout tasks fully aligned, verified, and complete.

---

## 1. Executive Summary & Core Milestones Achieved

### A. Onboarding, Auth & Setup Flow (`/welcome`, `/login`, `/signup`, `/setup`, `/forgot-password`)
- **Cinematic Blur-Reveal Entrance Animations:** Rebuilt entrance transitions across all auth pages using Apple-style bezier curves (`ease: [0.16, 1, 0.3, 1]`) combined with an initial `filter: blur(12px)` and vertical drift (`y: 20 -> 0`).
- **Shader Optimization:** Mouse-tracking logic disabled inside `WelcomeShader` to prevent frame drops on mobile/tablets; background green orbs drift autonomously at 60fps.
- **Strict 1-Screen Viewport Fit:** Auth layouts adjusted to guarantee a single-screen view with zero vertical scrolling required across all screen dimensions (`100dvh`).
- **Updated Tagline:** `"Build better money habits with the person who matters most."` on the Welcome screen.
- **Password Recovery Route (`/forgot-password`):** Dedicated password reset page created matching the luxury glassmorphic design system and linked directly from the Login screen ("Forgot Password?").

### B. Home Page & Spend Jar Card Redesign (`/src/app/page.tsx`)
- **Hero Art Upgrade:** Replaced the default Lucide piggy bank icon with a 3D "SPEND MACHINE" hero illustration (`/public/images/spend-machine.webp`).
- **Row-Based Card Layout:** 
  - **Left (`w-[45%]`):** Spend Machine hero illustration scaling beyond container bounds with a linear gradient edge-mask (`[mask-image:linear-gradient(to_right,black_60%,transparent_100%)]`) to eliminate solid image edges.
  - **Right (`w-[55%]`):** Text ("Spend Jar", PHP total spent, ZAR total spent) neatly right-aligned.
- **Card Interaction Mode:** Changed from page navigation to an interactive dashboard card. Tapping anywhere on the card triggers the coin fountain effect directly on the Home screen.
- **Tactile Feedback & Touch Defense:** Added `group-active:scale-[0.92]` on the machine illustration for a tactile press feel, along with `[-webkit-tap-highlight-color:transparent]` and `select-none` to eliminate mobile tap boxes.

### C. Spend Machine Coin Explosion Physics (`/src/components/home/AnimatedPiggyBank.tsx`)
- **Continuous Rain Removed:** Legacy infinite loop removed; coins now trigger on-demand via the `'spew-coins'` custom window event.
- **Fountain Physics Arc:** Coins explode upward out of the machine (`angle: 230° - 310°`, `velocity: 100-180px`), hit a peak, float, and accelerate downward with horizontal drift.
- **Dynamic Rotation & Fading:** Coins spin rapidly during ascent (`rotate: 0 -> 360°`), slowing down during descent (`360° -> 540°`), with a smooth 3-stage opacity fade (`[0, 1, 0]`).
- **Z-Index Layering:** Coins rendered at `z-[30]` to pop in front of the machine art and card text.
- **TypeScript & Build Safety:** Resolved array keyframe mismatch and type definition issues to ensure Vercel production build success (`npm run build`).

---

## 2. File & Component Map

| File Path | Description | Key Changes / State |
| :--- | :--- | :--- |
| `src/app/page.tsx` | Home Page Shell | Spend Jar card redesign, row layout, gradient mask, tap events. |
| `src/components/home/AnimatedPiggyBank.tsx` | Coin Physics Component | Custom event listener, 3-point keyframe physics, `z-[30]` layering. |
| `src/app/welcome/page.tsx` | Welcome Screen | Updated tagline, shader performance optimization. |
| `src/app/login/page.tsx` | Login Screen | Cinematic blur animations, link to `/forgot-password`. |
| `src/app/signup/page.tsx` | Signup Screen | Cinematic blur animations, 1-screen viewport alignment. |
| `src/app/setup/page.tsx` | Household Setup Screen | Household sharing buttons animated with Apple bezier curves. |
| `src/app/forgot-password/page.tsx` | Password Recovery Screen | NEW screen created, full glassmorphism UI & simulation. |
| `public/images/spend-machine.webp` | Hero Asset | 3D "SPEND MACHINE" artwork. |

---

## 3. Strict Guidelines for Next Agent

1. **Do Not Re-add Continuous Rain:** The Spend Jar coin animation MUST remain an on-demand event-driven burst triggered by the user, not a looping continuous rain.
2. **Keep 1-Screen Viewport Fit on Auth:** Never introduce vertical overflow/scrolling on `/welcome`, `/login`, `/signup`, `/setup`, or `/forgot-password`.
3. **Preserve Dynamic Color-Coding:** The Spend Jar card math (`percentageRef`, green -> amber -> red budget health indicators) must remain intact.
4. **Vercel Build Shield:** Always ensure array lengths in Framer Motion `animate` props match the `times` array length exactly (e.g. 3 keyframes = 3 timing values).

---

## 4. Next Recommended Phase

Following the project build order in `AGENTS.md`:
1. **Phase 2 — Budgeting Module:** Category tiles, period allocation, and Relocation Estimator integration.
2. **Phase 3 — Spend Jar Detailed Log (`/jar`):** Full transaction log, category breakdown, quick-add flow.
3. **Phase 4 — Cartify:** Live shopping trip budget tracker.
4. **Phase 5 — AI Corner:** Gemini 3.6 Flash vision scanning & grounded token-by-token streaming chat.
5. **Phase 6 — Supabase Auth & Household RLS Migration.**

---

🚀 **MISSION STATUS:** Master Handoff Aligned & Saved to `HANDOFF.md`  
⚡️ **NEXT STEP:** [Architect] - Ready to commence next requested module or feature pass.  
🔥 **MANTRA:** BEYOND PLUS ULTRA!
