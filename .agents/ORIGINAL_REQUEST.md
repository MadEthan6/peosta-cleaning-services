# Original User Request

## Initial Request — 2026-07-08T02:26:46Z

<USER_REQUEST>
An upgraded full-stack website and portal for Peosta Cleaning Services featuring client signup, recurring scheduling, Stripe subscription billing, owner settings with local rate comparisons, employee todo management, and premium portal utilities.

Working directory: C:/Users/ethan/Documents/antigravity/charming-rutherford
Integrity mode: development

## Requirements

### R1. Authentication & Onboarding
- **Public Client Sign Up**: Clients can register and sign in. Email verification must be integrated using Supabase Auth.
- **Strict Staff Login**: Public signup is disabled for employees and the owner.
  - Owner login is pre-configured for email `ethanburds@gmail.com` with a password.
  - The Owner can manually create employee accounts and credentials directly from the Owner Dashboard.
- **Dropdown Navigation**: Replace the static employee portal button with a client sign-in dropdown that directs users to their respective dashboards (Client, Employee, or Owner) based on their role.

### R2. Booking & Recurring Cleanings
- **Interactive Calendar Upgrade**: Clients can schedule cleanings and choose a frequency: One-time, Weekly, Bi-weekly, or Monthly.
- **Stripe Subscription Integration**: Selecting a recurring frequency automatically creates a recurring Stripe subscription. Custom single-clean invoices are paid via standard single-charge Stripe Checkout.

### R3. Owner Settings & Local Rate Comparisons
- **Dynamic Pricing Controls**: Implement backend settings in the Owner Dashboard to customize the cost per square foot for Standard, Deep, and Commercial cleanings.
- **Local Competitor Comparison UI**: Display a neat local pricing guideline in the settings dashboard based on typical Peosta/Dubuque market rates:
  - *Standard cleanings*: $0.10 – $0.15 per sq ft (Dubuque average: $35–$75/hr)
  - *Deep cleanings*: $0.18 – $0.25 per sq ft
  - *Commercial cleanings*: $0.13 – $0.18 per sq ft
- **Database Synchronization**: Rates must be saved to the database and fetched dynamically by `Calendar.jsx` to calculate booking estimates.

### R4. Invoice Management & Employee Todo Lists
- **Invoice Tracking**: Create an invoice management panel where the owner can generate invoices, monitor payment statuses (`unpaid`, `paid`), and send Stripe payment links to clients.
- **Employee Todo Manager**: An employee-facing todo checklist linked to each job, customizable by the owner. Employees can check off tasks as they complete them.

### R5. Premium Portal Features
- **Discount & Promo Codes**: Clients can enter coupon codes (e.g., `WELCOME10` for 10% off) during checkout. The owner can configure valid promo codes and discount percentages in the backend settings.
- **Client Job History & Receipts**: Clients can log in to view past and upcoming bookings, download text/PDF billing receipts, and see completed job photos uploaded by their assigned cleaners.
- **Cleaner Tipping & Ratings**: Clients can tip their assigned cleaners via Stripe after a job is marked complete, and rate their service on a 1-to-5 star scale.
- **Employee Availability & Calendars**: Employees can toggle their available days/time slots in their dashboard and view a calendar of their assigned cleanings.

## Verification Plan

### Automated Tests
- Validate React compilation build:
  ```bash
  npm run build
  ```

### Manual Verification Rubric
1. **Dropdown & Auth Flow**:
   - Verify client registration requires email verification.
   - Verify logging in as `ethanburds@gmail.com` opens the Owner Dashboard.
   - Verify employees cannot register via the public frontend, but the owner can add new employee logins in the dashboard.
2. **Dynamic Rates & Competitor comparison**:
   - Change the cost per sq ft in the Owner Settings next to the competitor rate grid, and verify the updated rate is immediately reflected on the public Booking page calculator.
3. **Recurring Bookings**:
   - Book a cleaning with a recurring frequency and verify it redirects to/triggers a Stripe Subscription checkout.
4. **Promo Codes & Tipping**:
   - Apply a code and verify price updates. Tip a cleaner and verify it initiates a Stripe charge.

## Acceptance Criteria

### Security & Build Integrity
- [ ] `npm run build` compiles with zero warnings or errors.
- [ ] Supabase connection credentials are read strictly from `.env` (already gitignored).

### Features & User Experience
- [ ] Dropdown sign-in menu works on the navbar.
- [ ] Owner logs in with `ethanburds@gmail.com`.
- [ ] Recurring options (weekly, bi-weekly, monthly) are available in the scheduler.
- [ ] Stripe checkout redirect initiates successfully for both subscriptions and single invoices.
- [ ] Cost-per-sq-ft settings are modifiable in the Owner Dashboard and sync with the frontend calculator.
- [ ] Competitor rate card is displayed next to pricing configurations in the owner dashboard settings.
- [ ] Employees can check off assigned job todo tasks.
- [ ] Clients can apply active promo codes, view past job receipts, and rate/tip their assigned cleaner.
- [ ] Employees can manage their availability calendar.
</USER_REQUEST>
