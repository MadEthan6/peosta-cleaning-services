# Project: Peosta Cleaning Services Portal Upgrade

## Architecture
The application is a full-stack React SPA built with Vite, styled with a modern custom CSS system, and powered by Supabase for database & authentication. It integrates Stripe for subscription billing, single-charge invoice payments, and employee tipping.

### Database Schema (Supabase)
1. **profiles**:
   - `id` (uuid, primary key, references auth.users)
   - `full_name` (text)
   - `email` (text)
   - `role` (text: 'client', 'employee', 'owner')
   - `availability` (jsonb: array of active days/time slots)
2. **jobs**:
   - `id` (uuid, primary key)
   - `client_name` (text)
   - `client_email` (text)
   - `client_phone` (text)
   - `address` (text)
   - `service_package` (text)
   - `scheduled_at` (timestamp with time zone)
   - `price` (numeric)
   - `status` (text: 'pending', 'assigned', 'in_progress', 'completed')
   - `payment_status` (text: 'unpaid', 'paid')
   - `employee_id` (uuid, references profiles.id)
   - `rating` (integer, 1-5)
   - `tip_amount` (numeric)
   - `completed_photos` (text[])
3. **rates**:
   - `id` (uuid, primary key)
   - `package_type` (text: 'standard', 'deep', 'commercial', unique)
   - `price_per_sq_ft` (numeric)
   - `updated_at` (timestamp)
4. **promo_codes**:
   - `code` (text, primary key)
   - `discount_percent` (integer)
   - `active` (boolean)
5. **job_tasks**:
   - `id` (uuid, primary key)
   - `job_id` (uuid, references jobs.id)
   - `task_description` (text)
   - `completed` (boolean)
   - `updated_at` (timestamp)

### Stripe Integration Contracts
- **Subscriptions**: Selecting Weekly, Bi-weekly, or Monthly cleanings creates a Stripe Subscription.
- **One-time payments**: Selecting a single clean or custom invoice initiates a standard Stripe Checkout session.
- **Tipping**: Client tips cleaner after completion via Stripe charge.

---

## Milestones

| # | Name | Scope | Dependencies | Status | Conv ID |
|---|------|-------|-------------|--------|---------|
| 1 | Authentication & Onboarding | Supabase client auth, strict staff login, client registration with email verification, owner panel employee creation, navbar dropdown navigation. | None | IN_PROGRESS | 1e0c6d65-8470-444d-bdb0-0a4a12123fd4 |
| 2 | Dynamic Settings & Rates | Pricing settings panel in Owner Dashboard, Database sync for rates, Dubuque/Peosta competitor card, Calendar.jsx fetches rates dynamically. | M1 | PLANNED | TBD |
| 3 | Booking & Stripe Billing | Stripe Subscription creation for recurring cleanings, Stripe Checkout for one-time booking and invoice payments, tipping checkout integration. | M1, M2 | PLANNED | TBD |
| 4 | Job Checklists & Employee Flow | Owner creates task checklists per job, employee checks off tasks, uploads job photos to Supabase Storage, and sets availability calendar. | M1 | PLANNED | TBD |
| 5 | Premium Utilities & History | Promo/Discount codes (backend + UI), client dashboard for job history, text/PDF receipt generator, cleaner ratings (1-5 stars). | M1, M2, M3 | PLANNED | TBD |

---

## Code Layout
- `src/App.jsx`: State management, tab routing, auth state, dashboard dashboard layouts.
- `src/components/Navbar.jsx`: Navigation header containing dropdown menu.
- `src/components/Calendar.jsx`: Interactive booking page calendar.
- `src/components/JobChecklist.jsx`: Checklist item renderer for employees.
- `src/components/PhotoUploader.jsx`: Job photo upload utility.
- `src/components/Chat.jsx`: Chat messenger for employees & owner.
- `src/supabaseClient.js`: Supabase JS SDK configuration.
