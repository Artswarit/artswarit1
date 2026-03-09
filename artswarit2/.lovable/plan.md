
# Implementation Plan: Remaining Fixes for Artswarit Platform

## Overview
This plan addresses multiple interconnected issues across currency handling, project workflows, analytics, recommendations, and UI/UX improvements. The work is organized into logical phases to ensure stability.

---

## Phase 1: Currency Consistency (Critical)

### Problem Analysis
- Currency display mismatch: Some areas show USD symbol ($) with INR amounts
- Razorpay receiving USD instead of INR (gateway incompatibility)
- Artwork pricing shows incorrect conversion (e.g., $1 showing as ₹1 instead of ₹83.5)
- Milestone payment button and gateway amount mismatch

### Technical Changes

**1.1 Update Payment Gateway Hook**
- File: `src/hooks/usePaymentGateway.ts`
- Add centralized USD-to-INR conversion constant (83.5 rate)
- Add `convertToGatewayCurrency()` function for consistent Razorpay amount calculation
- Ensure `gatewayAmount` always returns INR for Razorpay

**1.2 Fix Milestone Payment Display**
- File: `src/components/payments/PayMilestoneButton.tsx`
- Use gateway-converted amount in "Pay" button text
- Ensure button shows exact INR amount that Razorpay will charge

**1.3 Fix Artwork Card Pricing**
- File: `src/components/artist-profile/ArtworkCardModern.tsx`
- Replace direct price display with `useCurrencyFormat` hook
- Ensure Premium unlock price shows correct INR conversion

**1.4 Fix Project Dashboard Budget Display**
- File: `src/pages/ClientDashboard.tsx`
- Replace hardcoded `$` symbol with `format()` from `useCurrencyFormat`
- Update completed projects budget display (line ~591)

**1.5 Update Edge Functions for Currency**
- Files: `supabase/functions/create-artwork-order/index.ts`, `supabase/functions/create-milestone-order/index.ts`
- Ensure all Razorpay orders are created with INR currency
- Add logging for currency conversion debugging

---

## Phase 2: Internal Scroll Fixes (UI Bug)

### Problem Analysis
Fixed heights on ScrollArea components create scroll traps and cut off content in:
- Project Quick View tab
- Files tab
- Chat tab
- Workflow tab

### Technical Changes

**2.1 Update ProjectDetailModal Scroll Areas**
- File: `src/components/dashboard/projects/ProjectDetailModal.tsx`
- Change `h-[350px]` and `h-[300px]` to use flexible height with `flex-1 min-h-0`
- Ensure parent containers use flexbox layout
- Update all four tab content areas:
  - Workflow tab (line 502): `h-[400px]` -> `flex-1 min-h-0 max-h-[60vh]`
  - Quick View tab (line 509): Similar update
  - Files tab (line 569): Similar update
  - Messages tab (line 609): Similar update

**2.2 Dashboard Scroll Improvements**
- Ensure main container in both Artist and Client dashboards allows natural scrolling
- Remove any conflicting `overflow-hidden` on parent containers

---

## Phase 3: Project Reference Files Visibility

### Problem Analysis
Reference files uploaded during project creation are stored in `projects.reference_files` (JSONB array of URLs), but the Files tab only queries the `project_files` table.

### Technical Changes

**3.1 Update CreateProjectForm to Insert File Records**
- File: `src/components/projects/CreateProjectForm.tsx`
- After uploading files to storage, also insert records into `project_files` table
- This ensures both storage and database tracking

```text
Current flow:
  Upload -> storage -> reference_files JSONB

New flow:
  Upload -> storage -> reference_files JSONB
                    -> project_files table (for Files tab visibility)
```

**3.2 Update ProjectDetailModal to Show Reference Files**
- File: `src/components/dashboard/projects/ProjectDetailModal.tsx`
- Merge files from `project_files` table with `reference_files` from project record
- Handle backward compatibility for projects created before the fix

---

## Phase 4: Following System and Recommendations

### Problem Analysis
- Recommendations use mock data instead of real user preferences
- Followed artists' work doesn't appear higher in Explore feed
- No personalization based on actual follows

### Technical Changes

**4.1 Update PersonalizedRecommendations Component**
- File: `src/components/recommendations/PersonalizedRecommendations.tsx`
- Fetch actual followed artists from `follows` table
- Query artworks from followed artists
- Score recommendations based on:
  - Follow status (highest priority)
  - User's liked categories
  - Engagement metrics (views, likes)

**4.2 Update Explore Page Sorting**
- File: `src/pages/Explore.tsx`
- Add optional "For You" sorting option
- When user is logged in, boost artworks from followed artists

**4.3 Database Query Pattern**
```text
1. Fetch followed artist IDs from `follows` table
2. Fetch artworks, marking those from followed artists
3. Sort: followed artists first, then by engagement score
```

---

## Phase 5: Artist Analytics Access Control

### Problem Analysis
- Analytics are accessible to all artists (should be premium-only for advanced)
- Analytics use hardcoded mock data
- No real-time updates after events

### Technical Changes

**5.1 Create Advanced Analytics Component**
- File: `src/components/dashboard/AdvancedAnalytics.tsx` (new)
- Premium-only detailed analytics with:
  - Revenue trends (line chart)
  - Engagement breakdown (pie chart)
  - Top performing artworks
  - Follower growth over time

**5.2 Update ArtworkManagement Analytics Button**
- File: `src/components/dashboard/ArtworkManagement.tsx`
- Add `isProArtist` check from `useArtistPlan` hook
- Show lock icon for non-premium artists
- Show upgrade prompt when clicked by non-premium

**5.3 Implement Real Analytics Data**
- File: `src/components/dashboard/ArtworkManagement.tsx`
- Replace mock `analyticsData` (lines 38-47) with real queries:
  - `totalViews`: Sum views from `artwork_views` table
  - `totalLikes`: Sum likes from `artwork_likes` table
  - `totalRevenue`: Sum from `transactions` or `payments` table
  - `totalFollowers`: Count from `follows` table

**5.4 Add Real-Time Subscription**
- Subscribe to `artwork_views`, `artwork_likes`, `follows` tables
- Refresh analytics data on changes

**5.5 Integrate EarningsAnalysis for Pro Artists**
- File: `src/components/dashboard/ArtistEarnings.tsx`
- Import and conditionally render `EarningsAnalysis` component for Pro artists
- Keep basic earnings view for free tier

---

## Phase 6: Additional Fixes

### 6.1 Saved Artworks Already Implemented
The SavedArtworks component exists and is integrated into ClientDashboard's "saved" tab.
- Verify real-time subscription works
- Test save/unsave from artist profile and explore page

### 6.2 Billing Address Form Context
- File: `src/components/billing/BillingAddressForm.tsx`
- This is for invoice generation, not payment processing
- Razorpay handles payment details; this is for tax invoices
- Add clarifying text: "Used for invoices and receipts only. Not required for payments."

---

## Implementation Order

1. **Currency Fixes (Critical)** - Phase 1
   - Prevents payment failures and user confusion
   - Estimated: 2-3 files, straightforward changes

2. **Scroll Fixes** - Phase 2
   - Quick UX improvement
   - Estimated: 1 file, CSS/layout changes

3. **Reference Files** - Phase 3
   - Important for artist-client workflow
   - Estimated: 2 files, database insert logic

4. **Analytics Gating** - Phase 5
   - Premium feature enforcement
   - Estimated: 3-4 files, conditional rendering + data fetching

5. **Recommendations** - Phase 4
   - Improves personalization
   - Estimated: 2 files, database queries

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/usePaymentGateway.ts` | Add conversion function |
| `src/components/payments/PayMilestoneButton.tsx` | Fix amount display |
| `src/components/artist-profile/ArtworkCardModern.tsx` | Fix price formatting |
| `src/pages/ClientDashboard.tsx` | Fix budget symbol |
| `src/components/dashboard/projects/ProjectDetailModal.tsx` | Fix scrolling, add reference files |
| `src/components/projects/CreateProjectForm.tsx` | Insert file records |
| `src/components/dashboard/ArtworkManagement.tsx` | Real analytics + gating |
| `src/components/dashboard/ArtistEarnings.tsx` | Add advanced analytics for Pro |
| `src/components/recommendations/PersonalizedRecommendations.tsx` | Real follow data |
| `src/pages/Explore.tsx` | Add "For You" boost |
| `src/components/billing/BillingAddressForm.tsx` | Add clarifying text |
| `supabase/functions/create-artwork-order/index.ts` | Ensure INR |

---

## Testing Checklist

- [ ] Indian user sees INR prices everywhere
- [ ] Razorpay checkout shows matching INR amount
- [ ] All project tabs scroll to bottom
- [ ] Reference files appear in Files tab
- [ ] Saved artworks appear instantly in client dashboard
- [ ] Non-premium artists see locked analytics
- [ ] Pro artists see advanced analytics with real data
- [ ] Followed artists appear higher in Explore

---

## Notes

- All currency conversions use single source: `useCurrencyFormat` hook
- Rate: $1 = ₹83.5 (configurable in CurrencyContext)
- Database stores USD, display converts based on user location
- Razorpay always receives INR (converted from USD base)
