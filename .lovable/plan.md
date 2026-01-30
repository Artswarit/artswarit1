
# Payment & Billing Features Audit and Enhancement Plan

## Current State

The platform has a functional dual-gateway payment system:
- **Razorpay**: Milestone payments (client pays artist)
- **Stripe**: Pro Artist subscriptions (₹499/month)

However, several billing and account management features are missing from both dashboards.

---

## Missing Features to Implement

### 1. Artist Dashboard - Add "Billing" Tab

Add a new tab between "Earnings" and "Settings" to house:

**Payment Account Section** (use existing `ArtistPaymentStatus` component):
- Bank account status and details
- Enable/update payment details button
- KYC verification status

**Payout History Section**:
- List of completed payouts to bank
- Each row shows: Date, Amount, Milestone Title, Status
- Filter by date range

**Subscription Billing** (for Pro artists):
- Stripe billing history
- Next billing date
- Update payment method (via Stripe portal)

---

### 2. Client Dashboard - Add "Billing" Tab

Transform the existing "Payments" tab into a more complete "Billing" section:

**Payment History** (already exists, enhance):
- Add downloadable PDF receipts/invoices
- Add billing address display

**Billing Details Section** (new):
- Billing address form (name, address, city, country, postal code)
- GST/Tax ID field (for Indian businesses)
- Save changes to profile

**Payment Methods** (future consideration):
- Show saved cards (if Razorpay supports tokenization)

---

### 3. Fix Inconsistencies

- Update `EnablePaymentsDialog` from "12%" to match actual 15% Starter fee
- Implement PDF invoice generation for both artist and client

---

## Technical Implementation

### New Files to Create:
- `src/components/dashboard/ArtistBilling.tsx` - New billing tab component
- `src/components/billing/PayoutHistory.tsx` - Payout history list
- `src/components/billing/BillingAddressForm.tsx` - Client billing address form
- `src/components/billing/InvoiceDownload.tsx` - Invoice PDF generation

### Files to Modify:
- `src/pages/ArtistDashboard.tsx` - Add new "Billing" tab
- `src/pages/ClientDashboard.tsx` - Enhance payments section with billing address
- `src/components/payments/EnablePaymentsDialog.tsx` - Fix fee percentage text

### Database Changes (if needed):
- Add `billing_address` JSONB column to profiles table (or create billing_details table)
- Consider adding `gst_number` column for Indian tax compliance

---

## Priority Order

1. **High Priority**: Add `ArtistPaymentStatus` to Artist Dashboard (component exists, just not rendered)
2. **High Priority**: Fix 12% vs 15% inconsistency in EnablePaymentsDialog
3. **Medium Priority**: Create Artist Billing tab with payout history
4. **Medium Priority**: Add billing address form to Client Dashboard
5. **Lower Priority**: Invoice PDF generation

---

## Technical Notes

- The `ArtistPaymentStatus` and `EnablePaymentsDialog` components already exist and work - they just need to be integrated into the Artist Dashboard
- Payout history can be fetched from the existing `payments` table where `artist_id` matches
- Stripe portal already supports billing history - just needs a dedicated link
- PDF generation could use browser's print-to-PDF or a library like `jspdf`
