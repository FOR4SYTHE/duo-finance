# 🔬 Full-App Performance Audit

> Comprehensive scan of every file in the app for GPU-heavy operations, animation bottlenecks, and rendering inefficiencies — specifically targeting **mobile/tablet lag** on devices like the Huawei MatePad SE.

---

## ✅ Issues Already Fixed (This Session)

| Component | What was fixed |
|---|---|
| [NotificationCenter.tsx](file:///home/bnkxx/vibe-sandbox/duo-finance/src/components/home/NotificationCenter.tsx) | Removed `backdrop-blur-sm` on overlay, stripped `layout` + `popLayout` from mapped items, simplified enter/exit animations |
| [profile/page.tsx](file:///home/bnkxx/vibe-sandbox/duo-finance/src/app/profile/page.tsx) | Removed WebGL shader, noise overlays, 6× `backdrop-blur`, animated `filter:blur()`, excessive `layout` props. Fixed avatar stretch with `layout="position"`. Fixed drag lag with ref-based DOM updates |

---

## 🔴 Critical — Will Cause Noticeable Lag on Tablets/Phones

### 1. Bottom Navigation Bar — Persistent `backdrop-blur-2xl`
**File:** [Navigation.tsx](file:///home/bnkxx/vibe-sandbox/duo-finance/src/components/Navigation.tsx#L40)
```
bg-[#121212]/80 backdrop-blur-2xl
```
**Why it hurts:** This nav bar is **always visible** on every single page. `backdrop-blur-2xl` (40px blur radius) forces the GPU to composite and blur every pixel behind it on **every frame** — including during scroll. On a mid-range tablet, this alone can drop frames from 60fps to ~30fps during fast scrolling.

**Fix:** Replace with solid `bg-[#121212]` or very slightly transparent `bg-[#121212]/95` (no visible difference since it sits over dark content anyway). Remove `backdrop-blur-2xl` entirely.

---

### 2. WelcomeShader (WebGL) — Still Active on 5 Auth Pages
**File:** [WelcomeShader.tsx](file:///home/bnkxx/vibe-sandbox/duo-finance/src/components/auth/WelcomeShader.tsx)
**Used on:** `welcome`, `login`, `signup`, `setup`, `forgot-password`

**Why it hurts:** Runs a full WebGL fragment shader at 60fps via `requestAnimationFrame`. The shader calculates 4 orb positions with `pow()` per pixel per frame. On low-end GPUs this is the single heaviest operation in the entire app.

**Fix:** Replace with static CSS `radial-gradient` layers (same approach used to fix the Profile page). The visual effect is nearly identical — subtle green ambient glow — but at zero ongoing GPU cost. Auth pages are one-time flows, so the impact is lower priority than the nav bar, but it still affects first impressions.

---

### 3. LiveTripTracker Orb — 8× `mix-blend-screen` + Multiple `blur` Layers
**File:** [LiveTripTracker.tsx](file:///home/bnkxx/vibe-sandbox/duo-finance/src/components/cartify/LiveTripTracker.tsx#L260-L294)

**Why it hurts:** The "atom rings" orb effect stacks **8 elements** with `mix-blend-screen` and `blur-[2.5px]` / `blur-[6px]` / `blur-[12px]`, all nested inside a `motion.div` with `animate={{ rotate: 360 }}` running infinitely. Every frame, the GPU must:
1. Blur each ring element individually
2. Composite 8 blend-mode layers
3. Apply a full 360° rotation transform

This runs **continuously** during an active Cartify trip — exactly when the user is actively interacting.

**Fix:** Pre-render the orb as a static image/SVG asset, or use a single CSS `conic-gradient` with `animation: spin` in CSS (hardware-accelerated, no compositing overhead). Alternatively, drastically reduce to 2 blur layers max.

---

### 4. Cartify Item List — `popLayout` + `layout` on Mapped Swipeable Items
**File:** [LiveTripTracker.tsx](file:///home/bnkxx/vibe-sandbox/duo-finance/src/components/cartify/LiveTripTracker.tsx#L616-L638)

```jsx
<AnimatePresence mode="popLayout">
    {sortedItems.map((item) => (
        <motion.div layout ...>
```

**Why it hurts:** `popLayout` forces Framer Motion to extract exiting items from the DOM flow and recalculate layout positions for every remaining item. Combined with `layout` on each item (which uses scale-based FLIP), this causes O(n) layout thrashings when adding/removing a single item from a list of n items. On a 20+ item grocery list, this creates visible jank.

**Fix:** Remove `layout` from mapped items entirely. Use simple `opacity + y` enter/exit animations. Replace `popLayout` with default `AnimatePresence` mode.

---

### 5. CashbackDealsRadar — `backdrop-blur-3xl` on Main Card
**File:** [CashbackDealsRadar.tsx](file:///home/bnkxx/vibe-sandbox/duo-finance/src/components/home/CashbackDealsRadar.tsx#L54)

```
bg-black/60 backdrop-blur-3xl
```

**Why it hurts:** `backdrop-blur-3xl` is **64px** blur radius — the absolute heaviest blur available. This is applied to the full modal card that covers most of the screen.

**Fix:** Replace with solid `bg-[#0A0A0C]`. The card already has enough depth via shadows/borders.

---

## 🟡 Moderate — Contributes to Overall Heaviness

### 6. Animated `filter: "blur()"` in Framer Motion Transitions (8 Files)
**Files:** `setup`, `login`, `signup`, `forgot-password`, `TripSetup`, `ChildCareOnboarding`, `MyPlansTab`

**Why it hurts:** Animating CSS `filter: blur()` forces the browser to rasterize + blur the element on every animation frame. Unlike `opacity` or `transform` (which are compositor-only), `filter` triggers paint on every frame.

**Fix:** Replace all `filter: "blur(Xpx)"` animations with simple `opacity` + `y` transitions. The blur-to-focus effect is barely noticeable at typical animation speeds (0.3s) and not worth the GPU cost.

---

### 7. Multiple `backdrop-blur` on MonthlySummary + YearlySummary Cards
**Files:**
- [MonthlySummary.tsx](file:///home/bnkxx/vibe-sandbox/duo-finance/src/components/home/MonthlySummary.tsx) — 5× `backdrop-blur-2xl`
- [YearlySummary.tsx](file:///home/bnkxx/vibe-sandbox/duo-finance/src/components/home/YearlySummary.tsx) — 6× `backdrop-blur-2xl`
- [BillsCalendar.tsx](file:///home/bnkxx/vibe-sandbox/duo-finance/src/components/home/BillsCalendar.tsx) — `backdrop-blur-xl` on sticky header

**Why it hurts:** Each `backdrop-blur-2xl` card forces independent compositing. When 5-6 of these render simultaneously on a summary page, the GPU is blur-compositing ~5 full-card-sized regions. This is especially painful on scrollable content where the sticky header blur runs continuously.

**Fix:** Replace all card `backdrop-blur-2xl` with solid `bg-[#111]` or `bg-[#0F0F0F]`. Replace sticky header `backdrop-blur-xl` with solid `bg-[#050505]`.

---

### 8. Home Page — `hue-rotate` Filter Animation
**File:** [page.tsx](file:///home/bnkxx/vibe-sandbox/duo-finance/src/app/page.tsx#L470-L479)

```jsx
animate={{ filter: ["hue-rotate(0deg)", "hue-rotate(360deg)"] }}
```

**Why it hurts:** Animating `filter: hue-rotate()` via Framer Motion triggers paint on every frame for the "AI" label text. While the element is small, it's on the Home page (most visited) and runs infinitely.

**Fix:** Replace with a CSS `@keyframes` animation using `animation: hue-spin 4s linear infinite` in pure CSS — this can be hardware-accelerated and doesn't go through Framer Motion's JS scheduler.

---

### 9. ChildCare Page — Large `blur-[120px]` + `mix-blend-screen` Ambient Orbs
**File:** [childcare/page.tsx](file:///home/bnkxx/vibe-sandbox/duo-finance/src/app/childcare/page.tsx#L19-L20)

```
blur-[120px] opacity-10 mix-blend-screen
blur-[100px] opacity-5 mix-blend-screen
```

**Why it hurts:** Two massive (120px, 100px) CSS blur operations with blend modes. These are static (don't animate), but the initial paint is expensive and the blend mode forces continuous compositing on scroll.

**Fix:** Replace with CSS `radial-gradient` equivalents — identical visual result, zero blur/blend cost.

---

### 10. `readAsDataURL` for Profile Image Upload
**File:** [profile/page.tsx](file:///home/bnkxx/vibe-sandbox/duo-finance/src/app/profile/page.tsx#L38-L41)

**Why it hurts:** `readAsDataURL` converts the entire image file to a base64 string, which for a high-resolution phone photo (3-8MB) creates a massive string that must be parsed, stored in React state, and decoded by the `<img>` tag on every render.

**Fix:** Use `URL.createObjectURL(file)` instead — it creates a lightweight blob URL that the browser can stream directly without base64 encoding overhead. Remember to call `URL.revokeObjectURL()` on cleanup.

---

## 🟢 Low Priority — Minor but Worth Noting

### 11. BorderBeam Component — Infinite Rotation on 300% Oversized Gradient
**File:** [BorderBeam.tsx](file:///home/bnkxx/vibe-sandbox/duo-finance/src/components/ui/BorderBeam.tsx#L40-L55)

Rotates a 300%×300% `conic-gradient` div infinitely. It's masked to only show a thin border edge, so the visual payload is tiny, but the GPU is rotating a much larger element. Used on multiple cards across Profile and other pages.

**Fix:** Consider replacing with a CSS `@property` animated gradient (zero-DOM approach) or a single `border-image` with `animation`.

---

### 12. Home Page `setInterval` for Insurance Card Toggle
**File:** [page.tsx](file:///home/bnkxx/vibe-sandbox/duo-finance/src/app/page.tsx#L92-L96)

```jsx
const interval = setInterval(() => {
    setShowInsuranceFamily(prev => !prev);
}, 4500);
```

A `setInterval` toggling React state every 4.5 seconds. This triggers a full component re-render of the entire Home page every 4.5s even if the insurance card isn't visible.

**Fix:** Use `IntersectionObserver` to only run the interval when the card is in the viewport, or move the state into the card component itself so only the card re-renders.

---

## 📋 Summary — Priority Order

| Priority | Item | Impact | Effort |
|---|---|---|---|
| 🔴 1 | Navigation `backdrop-blur-2xl` | Every page, every scroll | 2 min |
| 🔴 2 | LiveTripTracker orb (8× blend + blur + rotation) | Active Cartify trips | 15 min |
| 🔴 3 | Cartify list `popLayout` + `layout` on items | Adding items to cart | 5 min |
| 🔴 4 | CashbackDealsRadar `backdrop-blur-3xl` | Opening deals modal | 2 min |
| 🟡 5 | Auth pages WelcomeShader (5 pages) | First-time/login flows | 10 min |
| 🟡 6 | Animated `filter: blur()` (8 files) | Page transitions | 15 min |
| 🟡 7 | MonthlySummary/YearlySummary blur cards | Viewing reports | 10 min |
| 🟡 8 | Home `hue-rotate` animation | Home page always-on | 3 min |
| 🟡 9 | ChildCare ambient blur orbs | ChildCare page load | 3 min |
| 🟡 10 | `readAsDataURL` for profile photo | Photo upload moment | 3 min |
| 🟢 11 | BorderBeam oversized rotation | Multiple pages | 10 min |
| 🟢 12 | Home `setInterval` re-renders | Home page idle | 5 min |

> **Estimated total fix time: ~80 minutes** for a buttery-smooth, zero-jank experience across all screens and all devices.
