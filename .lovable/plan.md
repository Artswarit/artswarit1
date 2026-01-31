

# Comprehensive Platform Enhancement Implementation Plan

This plan addresses 20 identified issues across the platform, organized into logical implementation phases.

---

## Phase 1: Authentication & Security Enhancements

### 1.1 Email Change Feature (Issue 6.2)
**Location**: `src/components/dashboard/ArtistSettings.tsx` and `src/components/dashboard/ClientSettings.tsx`

**Implementation**:
- Add new "Change Email" card in both settings pages
- Use Supabase's `supabase.auth.updateUser({ email: newEmail })` API
- Include verification step that sends confirmation to new email
- Show current email with edit button
- Add loading state and success/error handling

### 1.2 Account Recovery Options (Issue 6.3)
**Location**: Settings pages and new `src/components/settings/RecoveryOptions.tsx`

**Implementation**:
- Add recovery phone number field to settings
- Generate and display backup recovery codes (store hash in DB)
- Allow users to regenerate codes (invalidates old ones)
- Store phone number in profiles table

**Database Migration Required**:
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS recovery_phone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS recovery_codes_hash text;
```

### 1.3 Two-Factor Authentication (Issue 9.4)
**Location**: Settings pages and new TOTP components

**Implementation**:
- Create `src/components/settings/TwoFactorSetup.tsx` component
- Use Supabase's MFA enrollment APIs
- QR code generation for authenticator apps
- Backup codes generation and secure storage
- Replace placeholder toggle with actual 2FA setup flow

---

## Phase 2: Explore Page Improvements

### 2.1 Infinite Scroll (Issue 5.1)
**Location**: `src/pages/Explore.tsx`

**Implementation**:
- Replace pagination with IntersectionObserver-based infinite scroll
- Load 12 items initially, then 12 more on scroll
- Add loading spinner at bottom during fetch
- Preserve scroll position on filter changes

**Key Changes**:
- Remove `Pagination` component import
- Add `useRef` for observer target element
- Implement `useIntersectionObserver` hook or inline logic
- Update `currentArtworks` to accumulate data

### 2.2 Location-Based Search (Issue 5.2)
**Location**: `src/components/explore/TopFilters.tsx` and `src/components/explore/ArtistFilters.tsx`

**Implementation**:
- Add "Near Me" button that requests geolocation
- Store user's coordinates in state
- Filter artists by proximity using location field
- Add distance indicator on artist cards
- Fallback for denied geolocation permissions

### 2.3 Recently Viewed Section (Issue 5.3)
**Location**: `src/pages/Explore.tsx` and new hook `src/hooks/useRecentlyViewed.ts`

**Implementation**:
- Create hook to track recently viewed artworks/artists in localStorage
- Maximum 10 items, newest first, no duplicates
- Add "Recently Viewed" section above main content
- Horizontal scrollable carousel display
- Clear all button

**Database Migration Required**:
```sql
CREATE TABLE IF NOT EXISTS recently_viewed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  item_type text NOT NULL, -- 'artwork' or 'artist'
  item_id uuid NOT NULL,
  viewed_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, item_type, item_id)
);
```

---

## Phase 3: Artist Profile Enhancements

### 3.1 Completed Projects Count (Issue 4.5)
**Location**: `src/pages/ArtistProfile.tsx` and `src/components/artist-profile/ArtistHeader.tsx`

**Implementation**:
- Already fetching `completedProjectsCount` - ensure it's passed to header
- Add prominently in stats section alongside followers/likes
- Icon: `Briefcase` or `CheckCircle`

### 3.2 Response Time Indicator (Issue 4.2)
**Location**: `src/pages/ArtistProfile.tsx` and `src/components/artist-profile/ArtistHeader.tsx`

**Implementation**:
- Query `messages` table for artist's response times
- Calculate average time between received and sent messages
- Display "Usually responds within X hours/days"
- Edge function to calculate and cache response time

**Database Migration Required**:
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avg_response_hours integer;
```

### 3.3 Portfolio Category Filters (Issue 4.3)
**Location**: `src/components/artist-profile/ArtistTabs.tsx`

**Implementation**:
- Add category filter chips above artwork grid
- Extract unique categories from artist's artworks
- Filter displayed artworks by selected category
- "All" option to reset filter
- Persist filter selection in URL params

### 3.4 Service Packages Display (Issue 4.1)
**Location**: `src/components/artist-profile/ArtistTabs.tsx` (Services tab)

**Implementation**:
- Redesign services display with tiered cards (Basic/Standard/Premium)
- Add visual hierarchy with different styling per tier
- Include features list per package
- Prominent pricing display
- "Request This Package" CTA buttons

---

## Phase 4: Client Dashboard Enhancements

### 4.1 Payment Receipt History (Issue 3.4)
**Location**: `src/components/dashboard/ClientPayments.tsx`

**Implementation**:
- Already has InvoiceDownload component - verify it works
- Fetch complete transaction history from `payments` table
- Add date range filter
- Export all receipts as ZIP option

### 4.2 Bookmark/Favorite Artworks (Issue 3.3)
**Location**: New `src/hooks/useSavedArtworks.ts` and artwork cards

**Implementation**:
- Add bookmark icon to artwork cards
- Create saved_artworks table
- Add "Saved Artworks" section in Client Dashboard
- Toggle save/unsave functionality

**Database Migration Required**:
```sql
CREATE TABLE IF NOT EXISTS saved_artworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  artwork_id uuid NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, artwork_id)
);
```

### 4.3 Project Search/Filter (Issue 3.1)
**Location**: `src/pages/ClientDashboard.tsx` (Projects tab)

**Implementation**:
- Make the existing search input functional (currently just UI)
- Add filter dropdowns: Status, Artist, Date Range, Budget Range
- Debounced search on title and description
- Sort options: Newest, Oldest, Budget High/Low

---

## Phase 5: Artist Dashboard Enhancements

### 5.1 Payout Schedule Display (Issue 2.6)
**Location**: `src/components/dashboard/ArtistBilling.tsx`

**Implementation**:
- Add "Payout Schedule" card
- Display: "Payouts are processed every Friday"
- Show pending payout amount
- Estimated next payout date
- Minimum payout threshold info

### 5.2 Portfolio Reordering (Issue 2.4)
**Location**: `src/components/dashboard/ArtworkManagement.tsx`

**Implementation**:
- Add drag-and-drop capability using existing `@hello-pangea/dnd`
- Save sort order to `artworks.sort_order` column
- Toggle between reorder mode and normal view
- Visual indicators during drag

**Database Migration Required**:
```sql
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;
```

### 5.3 Availability Calendar (Issue 2.3)
**Location**: New `src/components/dashboard/AvailabilityCalendar.tsx`

**Implementation**:
- Add to Artist Profile or Settings tab
- Calendar component showing available/busy dates
- Toggle vacation mode
- Block specific date ranges
- Show availability status on public profile

**Database Migration Required**:
```sql
CREATE TABLE IF NOT EXISTS artist_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text NOT NULL DEFAULT 'available', -- 'available', 'busy', 'vacation'
  note text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(artist_id, date)
);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_on_vacation boolean DEFAULT false;
```

---

## Phase 6: Payments & Transactions

### 6.1 Partial Payment Option (Issue 8.2)
**Location**: `src/components/projects/MilestoneCard.tsx` and payment edge functions

**Implementation**:
- Allow clients to pay a percentage of milestone
- Track paid vs remaining amounts
- Update milestone status to "partially_paid"
- Show payment progress bar on milestones
- Modify `create-milestone-order` edge function

**Database Changes**:
```sql
ALTER TABLE project_milestones ADD COLUMN IF NOT EXISTS amount_paid numeric DEFAULT 0;
```

---

## Phase 7: Reporting & Blocking Features

### 7.1 Report Content UI (Issue 9.1)
**Location**: New `src/components/reports/ReportDialog.tsx`

**Implementation**:
- Create report dialog component
- Add "Report" option to artwork cards and profiles
- Reason selection: Spam, Inappropriate, Copyright, Other
- Optional description field
- Call existing `report-content` edge function
- Success confirmation

**Integration Points**:
- `src/components/artwork/ArtworkCard.tsx` - dropdown menu
- `src/pages/ArtistProfile.tsx` - profile actions
- `src/pages/ArtworkDetails.tsx` - artwork page

### 7.2 Block User Feature (Issue 9.2)
**Location**: New `src/components/blocks/BlockUserButton.tsx` and hook

**Implementation**:
- Add block button on user profiles and in messaging
- Create user_blocks table
- Filter blocked users from messaging and discovery
- Show blocked users list in settings
- Unblock functionality

**Database Migration Required**:
```sql
CREATE TABLE IF NOT EXISTS user_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  reason text,
  UNIQUE(blocker_id, blocked_id)
);
```

---

## Phase 8: Role Checking Consolidation (Issue 10.1)

### 8.1 Centralize Role Logic
**Location**: New `src/hooks/useUserRole.ts`

**Implementation**:
- Create centralized hook for role checking
- Export role constants and type guards
- Replace scattered role checks across components
- Include utility functions: `isArtist()`, `isClient()`, `isPro()`, `isAdmin()`

```typescript
// src/hooks/useUserRole.ts
export const USER_ROLES = {
  ARTIST: 'artist',
  PREMIUM: 'premium', 
  CLIENT: 'client',
  ADMIN: 'admin'
} as const;

export function useUserRole() {
  const { profile } = useProfile();
  
  return {
    role: profile?.role,
    isArtist: profile?.role === 'artist' || profile?.role === 'premium',
    isClient: profile?.role === 'client',
    isPro: profile?.role === 'premium',
    isAdmin: profile?.is_admin === true
  };
}
```

---

## Database Migrations Summary

All required schema changes in one migration:

```sql
-- Recovery options
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS recovery_phone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS recovery_codes_hash text;

-- Response time tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avg_response_hours integer;

-- Vacation mode
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_on_vacation boolean DEFAULT false;

-- Artwork ordering
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;

-- Partial payments
ALTER TABLE project_milestones ADD COLUMN IF NOT EXISTS amount_paid numeric DEFAULT 0;

-- Recently viewed
CREATE TABLE IF NOT EXISTS recently_viewed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  item_type text NOT NULL,
  item_id uuid NOT NULL,
  viewed_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, item_type, item_id)
);

-- Saved artworks
CREATE TABLE IF NOT EXISTS saved_artworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  artwork_id uuid NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, artwork_id)
);

-- Artist availability
CREATE TABLE IF NOT EXISTS artist_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text NOT NULL DEFAULT 'available',
  note text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(artist_id, date)
);

-- User blocks
CREATE TABLE IF NOT EXISTS user_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  reason text,
  UNIQUE(blocker_id, blocked_id)
);

-- Enable RLS on new tables
ALTER TABLE recently_viewed ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own recently viewed" ON recently_viewed
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own saved artworks" ON saved_artworks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Artists can manage their availability" ON artist_availability
  FOR ALL USING (auth.uid() = artist_id);

CREATE POLICY "Public can view artist availability" ON artist_availability
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their blocks" ON user_blocks
  FOR ALL USING (auth.uid() = blocker_id);
```

---

## New Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/hooks/useUserRole.ts` | Centralized role checking |
| `src/hooks/useRecentlyViewed.ts` | Recently viewed tracking |
| `src/hooks/useSavedArtworks.ts` | Artwork bookmarking |
| `src/hooks/useBlockedUsers.ts` | User blocking functionality |
| `src/hooks/useArtistAvailability.ts` | Availability calendar data |
| `src/components/reports/ReportDialog.tsx` | Content reporting UI |
| `src/components/blocks/BlockUserButton.tsx` | Block user action |
| `src/components/settings/TwoFactorSetup.tsx` | 2FA enrollment |
| `src/components/settings/RecoveryOptions.tsx` | Recovery codes/phone |
| `src/components/settings/ChangeEmailForm.tsx` | Email change form |
| `src/components/dashboard/AvailabilityCalendar.tsx` | Availability management |
| `src/components/explore/RecentlyViewed.tsx` | Recently viewed section |

---

## Files to Modify

| File Path | Changes |
|-----------|---------|
| `src/pages/Explore.tsx` | Infinite scroll, recently viewed |
| `src/pages/ExploreArtists.tsx` | Location-based filtering |
| `src/pages/ArtistProfile.tsx` | Response time, completed projects |
| `src/pages/ClientDashboard.tsx` | Project search/filter |
| `src/components/dashboard/ArtistSettings.tsx` | Email change, 2FA, recovery |
| `src/components/dashboard/ClientSettings.tsx` | Email change, recovery |
| `src/components/dashboard/ArtworkManagement.tsx` | Drag-and-drop reordering |
| `src/components/dashboard/ArtistBilling.tsx` | Payout schedule |
| `src/components/artist-profile/ArtistTabs.tsx` | Category filters, service packages |
| `src/components/artist-profile/ArtistHeader.tsx` | Response time, vacation badge |
| `src/components/artwork/ArtworkCard.tsx` | Bookmark, report buttons |
| `src/components/explore/TopFilters.tsx` | Near me button |

---

## Implementation Priority

1. **Critical** (Do First):
   - 9.1 Report Content UI - Safety feature
   - 9.2 Block User - Safety feature
   - 10.1 Role Consolidation - Code quality

2. **High Priority**:
   - 5.1 Infinite Scroll - UX improvement
   - 3.1 Project Search - Usability
   - 4.5 Completed Projects - Already have data

3. **Medium Priority**:
   - 6.2 Email Change
   - 3.3 Bookmark Artworks
   - 4.2 Response Time
   - 4.3 Portfolio Filters
   - 2.4 Portfolio Reordering

4. **Lower Priority**:
   - 5.2 Location Search - Requires geolocation
   - 5.3 Recently Viewed
   - 2.3 Availability Calendar
   - 9.4 Two-Factor Auth - Complex
   - 6.3 Recovery Options
   - 8.2 Partial Payments

