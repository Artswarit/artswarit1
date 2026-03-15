

# Mobile UI Polish & Visual Audit Plan

## 1. Critical Build Fix (Blocking)

**File:** `src/pages/ClientDashboard.tsx` (lines 212-214)

`useRealtimeSync` calls reference `fetchNotifications` and `fetchSavedArtistsCount` before they are declared (lines 215, 229). Move the two `useRealtimeSync` calls to after the function declarations (after line 238).

---

## 2. Dashboard Tab Navigation — Mobile Polish

**File:** `src/pages/ClientDashboard.tsx` (lines 580-735) and `src/pages/ArtistDashboard.tsx` (lines 199-233)

Current issues on mobile:
- Tab triggers have inconsistent heights (`min-h-[80px]` on TabsList is excessive)
- Icons at `h-5 w-5` are too large for mobile tabs; text at `11px` is cramped
- 10 tabs in a horizontal scroll with no visual affordance for scrolling

Fixes:
- Standardize tab icon size to `h-4 w-4` on mobile, `h-[18px] w-[18px]` on sm+
- Reduce TabsList `min-h` to `min-h-[56px]` on mobile
- Set tab trigger padding to `px-2.5 py-2.5` on mobile, `px-5 py-3` on sm+
- Add `gap-1` on mobile, `gap-1.5` on sm+ between icon and label
- Ensure all tab triggers have `min-w-[72px]` on mobile for consistent sizing
- Add subtle scroll-snap with `snap-center` (already present, keep)

---

## 3. Buttons — Consistent Sizing & States

**Files:** `src/pages/ClientDashboard.tsx`, `src/components/dashboard/projects/ProjectDetailModal.tsx`

Audit findings:
- Mixed button heights: `h-7`, `h-8`, `h-9`, `h-10`, `h-11`, `h-12` — no system
- Some buttons lack `min-h-[44px]` touch target on mobile
- "View" buttons at `h-7` are too small for touch

Fixes:
- Standardize: small actions = `h-9 min-h-[44px]` on mobile, primary CTAs = `h-10 min-h-[44px]`
- All buttons get `rounded-xl` consistently (currently mixed `rounded-lg`, `rounded-xl`, `rounded-2xl`)
- Active/inactive states for action buttons: add `aria-pressed` styling and `data-[state=active]` visual cue with filled background
- Ensure `font-semibold` on all action buttons, `font-bold` on primary CTAs

---

## 4. Spacing & Alignment — 4px/8px Scale

**Files:** Multiple dashboard components

Fixes:
- Normalize all `gap-*` values to multiples of 1 (4px): `gap-1`, `gap-2`, `gap-3`, `gap-4`, `gap-6`
- Remove fractional padding like `p-3.5` — use `p-3` or `p-4`
- Icon + text vertical alignment: ensure all `flex items-center` pairs use consistent `gap-2` (8px)
- Project cards: standardize to `p-4` on mobile, `p-5` on sm+ (currently mixed `p-3`, `p-4`, `p-5`)

---

## 5. Typography Standardization

Fixes:
- Section headers: `text-base font-bold` on mobile, `text-lg font-bold` on sm+ (currently mixed `font-semibold`, `font-black`, `font-bold`)
- Body/meta text: `text-xs` for metadata, `text-sm` for body — remove `text-[10px]` and `text-[11px]` instances, replace with `text-xs`
- Card titles: `text-sm font-semibold` on mobile, `text-base font-semibold` on sm+
- Stat numbers: `text-lg font-bold` on mobile, `text-2xl font-bold` on sm+ (normalize from `text-xl` / `text-3xl` / `text-4xl` extremes)

---

## 6. Icon Sizing — Uniform Standard

Fixes:
- Inline icons (next to text): `h-4 w-4` universally (currently mixed `h-3`, `h-3.5`, `h-4`, `h-5`, `h-6`)
- Section header icons: `h-5 w-5`
- Stat card icons: `h-5 w-5` on mobile, `h-6 w-6` on desktop
- Ensure all icon + text combos use `flex items-center gap-2`

---

## 7. Project Detail Modal — Mobile Optimization

**File:** `src/components/dashboard/projects/ProjectDetailModal.tsx`

Current issues:
- Header section uses `text-3xl sm:text-5xl` — too large on mobile
- Stat cards use `rounded-[2.5rem]` and `p-8` — too much padding and radius on mobile
- Inner tab navigation has `rounded-[2rem]` — overwhelming on small screens

Fixes:
- Header title: `text-xl sm:text-3xl` on mobile
- Stat cards: `rounded-2xl p-4 sm:p-6` on mobile, keep `rounded-[2rem] p-8` on desktop
- Inner tabs: `rounded-xl` on mobile, `rounded-2xl` on desktop
- Reduce header padding: `pt-8 pb-6 px-4 sm:px-8` on mobile
- Content sections: `px-4 sm:px-8` on mobile instead of `px-6 sm:px-12`

---

## 8. Dashboard Header KPI Cards — Mobile

**File:** `src/components/dashboard/DashboardHeader.tsx`

Fixes:
- Grid: change `grid-cols-1 xs:grid-cols-2` to `grid-cols-2` always on mobile for a tighter 2x2 layout
- Card padding: `p-3 sm:p-5` (currently `p-5 sm:p-6`)
- Icon containers: `p-2.5 rounded-xl` on mobile, `p-3 rounded-2xl` on desktop
- Stat label: `text-[10px]` → `text-xs` for readability
- Followers button: reduce oversized `min-h-[48px]` to `min-h-[44px]`

---

## 9. White Space & Card Separation

Fixes:
- Add `border border-border/40` to all project list cards that currently only have `border-gray-100`
- Add `shadow-sm` to cards missing it
- Ensure consistent `space-y-4` between card groups on mobile
- Project sections ("In Progress" / "Completed"): upgrade from `rounded-lg` to `rounded-2xl` with `shadow-sm`

---

## 10. Overview Stats Cards — Breathing Room

**File:** `src/pages/ClientDashboard.tsx` (lines 740-812)

Fixes:
- Change `grid-cols-3 gap-2` to `grid-cols-3 gap-3` on mobile for more breathing room
- Reduce inner padding from `p-3 sm:p-5` to `p-3 sm:p-4` — keep it compact but not cramped
- Background icons: keep at reduced opacity, no changes needed

---

## Summary of Files to Edit

1. `src/pages/ClientDashboard.tsx` — Build fix + tab/button/spacing polish
2. `src/pages/ArtistDashboard.tsx` — Tab navigation polish
3. `src/components/dashboard/DashboardHeader.tsx` — KPI card mobile sizing
4. `src/components/dashboard/projects/ProjectDetailModal.tsx` — Modal mobile optimization
5. `src/index.css` — No changes needed (existing utilities are sufficient)

All changes are CSS/Tailwind class adjustments only. No logic changes except the build-blocking declaration order fix.

