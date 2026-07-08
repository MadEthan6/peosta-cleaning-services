# E2E Test Strategy & Infrastructure Document (TEST_INFRA.md)

This document outlines the End-to-End (E2E) testing strategy, infrastructure setup, and test case mapping for the Peosta Cleaning Services Portal Upgrade.

---

## 1. Objectives & Scope
The goal of this E2E test suite is to provide high-fidelity verification of the application's user flows, database integrations, and payment processes completely offline (using mocked endpoints), adhering to the **CODE_ONLY** network restriction. 

### Key Requirements Covered:
- **R1. Authentication & Onboarding**: Client sign-up & sign-in, strict staff login rules, and Navbar dropdown navigation.
- **R2. Booking & Recurring Cleanings**: Booking calendar, frequency selection, and simulated Stripe integration.
- **R3. Owner Settings & Local Rate Comparisons**: Dynamic pricing controls, competitor grid display, and database rate synchronization.
- **R4. Invoice Management & Employee Todo Lists**: Invoice panel tracking, Stripe payment links, and employee job checklists.
- **R5. Premium Portal Features**: Promo code discounts, client job history, tipping/ratings, and employee availability management.

---

## 2. Testing Framework & Offline Architecture

### Framework
- **Playwright** is utilized as the primary E2E testing framework due to its strong support for modern single-page applications (SPAs), auto-waiting mechanics, and page interception APIs.
- **Vite** is run locally on port `5173`.

### Offline Simulation (Mocks)
To comply with the offline requirement, the test suite intercepts all Supabase Auth and Database API requests (`**/auth/v1/**` and `**/rest/v1/**`) via Playwright's `page.route()` API. 
- **Mock Supabase Helper (`tests/mocks/mockSupabase.js`)**: Implements an in-memory database of profiles, jobs, checklist items, rates, and promo codes.
- **State Preservation**: Updates (e.g., ticking off tasks, modifying rates) mutate the state, allowing true E2E behaviors to be validated.

---

## 3. Test Cases Mapping (127 Total E2E Cases)

### Tier 1: Category-Partition (Feature Coverage) - 55 Test Cases
Category-Partition ensures every feature area (F1 to F11) has at least 5 test cases covering representative categories of behavior.

#### F1: Client Sign-Up & Auth Flow
- **F1-T1-01**: Public client registration with fresh email.
- **F1-T1-02**: Client registration with a duplicate email (verifies validation handling).
- **F1-T1-03**: Successful client sign-in with valid credentials.
- **F1-T1-04**: Client sign-in failure with invalid password.
- **F1-T1-05**: Client sign-out clears user session and redirects to home.

#### F2: Staff Login Security & Pre-configured Owner
- **F2-T1-01**: Pre-configured owner `ethanburds@gmail.com` logs in successfully.
- **F2-T1-02**: Public registration form rejects registration for owner email (role restriction check).
- **F2-T1-03**: Public registration form rejects signup for role `employee`.
- **F2-T1-04**: Owner session persists after reloading the page.
- **F2-T1-05**: Owner logs out, clearing the session and dashboard views.

#### F3: Owner Dashboard Employee Creation
- **F3-T1-01**: Owner manually creates a new employee account from the settings panel.
- **F3-T1-02**: Rejects employee creation if required fields (email, password) are empty.
- **F3-T1-03**: Rejects employee creation with a duplicate email address.
- **F3-T1-04**: Newly created employee can successfully sign in through the login portal.
- **F3-T1-05**: Client account is restricted from accessing the employee creation API/interface.

#### F4: Navbar Dropdown & Dashboard Redirection
- **F4-T1-01**: Navbar displays the Guest/Sign-in dropdown when unauthenticated.
- **F4-T1-02**: Authenticated client is redirected automatically to the Client Dashboard.
- **F4-T1-03**: Authenticated employee is redirected automatically to the Employee Dashboard.
- **F4-T1-04**: Authenticated owner is redirected automatically to the Owner Dashboard.
- **F4-T1-05**: Navbar redirects to home and resets options when the user signs out.

#### F5: Booking Calendar & Frequencies
- **F5-T1-01**: Select Standard package, 1500 sq ft, a valid future weekday, and a morning slot.
- **F5-T1-02**: Select Deep package, 2000 sq ft, weekend date, and afternoon slot.
- **F5-T1-03**: Select Commercial package, 5000 sq ft, and late afternoon slot.
- **F5-T1-04**: Book standard package with "Weekly" frequency selection.
- **F5-T1-05**: Book deep package with "Monthly" frequency selection.

#### F6: Stripe Checkout & Subscriptions Integration
- **F6-T1-01**: One-time cleaning booking initializes a standard Stripe checkout simulation.
- **F6-T1-02**: Recurring weekly cleaning booking initializes a Stripe Subscription flow.
- **F6-T1-03**: Custom invoice checkout button opens the Stripe checkout simulator page.
- **F6-T1-04**: Canceling the Stripe Checkout session redirects back with no changes saved.
- **F6-T1-05**: Completing Stripe Checkout creates a job record in the database marked as PAID.

#### F7: Owner Settings Rates & Competitor Grid
- **F7-T1-01**: Owner Settings dashboard renders the Peosta/Dubuque competitor rate comparison grid.
- **F7-T1-02**: Owner modifies Standard cleaning rate per sq ft.
- **F7-T1-03**: Owner modifies Deep cleaning rate per sq ft.
- **F7-T1-04**: Owner modifies Commercial cleaning rate per sq ft.
- **F7-T1-05**: Non-owner accounts cannot access the Rates Settings panel.

#### F8: Database Rates Synchronization
- **F8-T1-01**: Updated Rates write to the database successfully.
- **F8-T1-02**: Booking page fetches current pricing rates from the database on load.
- **F8-T1-03**: Estimated price slider updates standard estimate immediately upon sq ft change.
- **F8-T1-04**: Estimated price updates instantly when switching package tabs.
- **F8-T1-05**: DB synchronization error displays fallback rates without crashing the UI.

#### F9: Invoice Management Panel
- **F9-T1-01**: Owner generates a new custom invoice for a client.
- **F9-T1-02**: Invoice panel shows correct statuses (`unpaid`, `paid`) for listed invoices.
- **F9-T1-03**: Generate Stripe single-charge payment link for an invoice.
- **F9-T1-04**: Manually mark an unpaid invoice as paid.
- **F9-T1-05**: Filter invoice list by payment status.

#### F10: Employee Todo List Manager
- **F10-T1-01**: Employee checks off a task in their assigned job checklist.
- **F10-T1-02**: Employee unchecks a completed task.
- **F10-T1-03**: Owner appends a custom task to a specific job checklist.
- **F10-T1-04**: Owner deletes a task from the job checklist.
- **F10-T1-05**: Task completion progress bar calculates correct percentage updates.

#### F11: Premium Utilities
- **F11-T1-01**: Apply promo code `WELCOME10` to get 10% discount on checkout.
- **F11-T1-02**: Client dashboard lists historical completed cleanings.
- **F11-T1-03**: Client submits a 1-to-5 star rating for a completed job.
- **F11-T1-04**: Client adds a cleaner tip via Stripe payment.
- **F11-T1-05**: Employee toggles availability calendar slots in their dashboard.

---

### Tier 2: Boundary Value Analysis & Negative Testing - 55 Test Cases
BVA focuses on extreme inputs, boundary configurations, and invalid API requests.

#### F1: Client Sign-Up & Auth Flow (BVA)
- **F1-T2-01**: Password validation for too-short inputs.
- **F1-T2-02**: Signup with malformed email addresses (missing `@`, missing domain).
- **F1-T2-03**: Signup with empty text strings in full name.
- **F1-T2-04**: Sign-in attempt with non-existent client email.
- **F1-T2-05**: SQL injection script injection attempts inside input text fields.

#### F2: Staff Login Security & Pre-configured Owner (BVA)
- **F2-T2-01**: Owner login fails with incorrect password.
- **F2-T2-02**: Direct routing navigation attempts to `/dashboard` when not authenticated.
- **F2-T2-03**: Accessing dashboard with invalid session token in localStorage.
- **F2-T2-04**: Public registration request containing forged owner role metadata is rejected by Auth.
- **F2-T2-05**: Sign-in with blank/whitespace credentials is blocked client-side.

#### F3: Owner Dashboard Employee Creation (BVA)
- **F3-T2-01**: Creating employee account with password below minimum length.
- **F3-T2-02**: Creating employee with invalid email format.
- **F3-T2-03**: Creating employee with numeric/special characters inside the name.
- **F3-T2-04**: Create employee when database is temporarily offline (error handling verification).
- **F3-T2-05**: Creating employee profile with empty email field.

#### F4: Navbar Dropdown & Dashboard Redirection (BVA)
- **F4-T2-01**: Dropdown toggle response under ultra-low mobile layout viewports.
- **F4-T2-02**: Rapid double-clicking on dashboard redirection links.
- **F4-T2-03**: Accessing dashboard endpoints when server is unresponsive.
- **F4-T2-04**: Client tries to access Owner dashboard url pattern (unauthorized access redirection).
- **F4-T2-05**: Profile role modification on client side does not bypass backend role verification.

#### F5: Booking Calendar & Frequencies (BVA)
- **F5-T2-01**: Size slider at lower boundary: 500 sq ft.
- **F5-T2-02**: Size slider at upper boundary: 6,000 sq ft.
- **F5-T2-03**: Booking cleaning request on past date is disabled.
- **F5-T2-04**: Submit booking without selecting a time slot.
- **F5-T2-05**: Booking details with extremely long service addresses.

#### F6: Stripe Checkout & Subscriptions Integration (BVA)
- **F6-T2-01**: Stripe payment request with zero dollar price value (should be blocked).
- **F6-T2-02**: Card validation check: expired credit card year.
- **F6-T2-03**: Card validation check: invalid CVV length (e.g. 2 digits).
- **F6-T2-04**: Card validation check: invalid credit card number format.
- **F6-T2-05**: Submitting checkout forms multiple times simultaneously.

#### F7: Owner Settings Rates & Competitor Grid (BVA)
- **F7-T2-01**: Setting rate to zero dollars ($0.00) per sq ft is blocked or warns.
- **F7-T2-02**: Setting rate to negative values (e.g. -$0.01) is blocked.
- **F7-T2-03**: Setting rate to extremely high value (e.g. $10.00/sq ft) triggers limit warning.
- **F7-T2-04**: Submitting rates with decimal overflow (e.g. $0.12345/sq ft).
- **F7-T2-05**: Non-numeric rates settings input is blocked.

#### F8: Database Rates Synchronization (BVA)
- **F8-T2-01**: Booking calculator behavior when database rates table is empty (graceful fallback).
- **F8-T2-02**: Rates synchronization when page is loaded with laggy connection.
- **F8-T2-03**: Calculator handles extreme fractional rates calculations.
- **F8-T2-04**: Simultaneous rates edits by owner (race conditions).
- **F8-T2-05**: Modifying rates in database while client booking is actively in progress.

#### F9: Invoice Management Panel (BVA)
- **F9-T2-01**: Creating invoice with zero/negative dollar amount.
- **F9-T2-02**: Creating invoice with missing client email.
- **F9-T2-03**: Paying an invoice that is already marked paid.
- **F9-T2-04**: Stripe invoice checkout session timeout.
- **F9-T2-05**: Viewing invoice panel with large numbers of invoices.

#### F10: Employee Todo List Manager (BVA)
- **F10-T2-01**: Adding empty text task to checklist is blocked.
- **F10-T2-02**: Adding task description exceeding 300 characters.
- **F10-T2-03**: Checklist updates when network fails (reverts checkbox status).
- **F10-T2-04**: Deleting checklist item that is already completed.
- **F10-T2-05**: Deleting all tasks on the checklist.

#### F11: Premium Utilities (BVA)
- **F11-T2-01**: Apply promo code that has expired or been disabled.
- **F11-T2-02**: Apply non-existent promo code (displays invalid coupon message).
- **F11-T2-03**: Submitting rating out of bounds (e.g. 0 stars or 6 stars).
- **F11-T2-04**: Tipping cleaner negative or zero dollar amount.
- **F11-T2-05**: Toggling availability slot that has already passed.

---

### Tier 3: Pairwise & Cross-Feature Integration - 11 Test Cases
Pairwise integration testing validates that combinations of multiple feature systems work seamlessly.

- **T3-01**: **Auth & Booking**: Sign up a new client, immediately book a recurring standard cleaning, and verify checkout session contains the newly registered client profile details.
- **T3-02**: **Owner Creation & Employee Login**: Owner creates employee `jane@example.com` in owner dashboard, logs out, logs in as `jane@example.com`, and verifies access is restricted to Employee Dashboard.
- **T3-03**: **Rates Settings & Booking Estimate**: Owner updates Deep cleaning rate in Settings dashboard; Client opens Booking page, selects Deep cleaning, and verifies price estimate uses the newly set rate.
- **T3-04**: **Stripe & Job Creation**: Client completes booking payment; verify a job record is inserted in the DB with `payment_status` = 'paid' and assigned to `employee_id` = null.
- **T3-05**: **Owner Job Assignment & Employee View**: Owner creates a new job manually and assigns it to employee Jane; Jane logs in and verifies the new job is visible in her Todo List calendar.
- **T3-06**: **Checklist & Job Status**: Employee logs in, navigates to assigned job, checks all tasks complete; verify the job status updates to "completed" in the database.
- **T3-07**: **Promo Code & Booking Calculator**: Client applies promo code `WELCOME10` to a commercial cleaning booking; verify the estimated price drops by 10% on the calendar UI.
- **T3-08**: **Photos & Job History**: Employee uploads job completion photos to storage; client logs in, navigates to Job History, and verifies the uploaded photos are visible under that completed job.
- **T3-09**: **Tipping & Invoicing**: Client navigates to past completed job, submits a 20% tip; verify invoice entry details update `tip_amount` in DB.
- **T3-10**: **Availability & Assignment**: Employee toggles off availability for Tuesdays; Owner creates job for next Tuesday and verifies warning or exclusion of that employee in dropdown.
- **T3-11**: **Navbar Redirection & Session Change**: Logged-in employee clicks navbar logout, then logs in immediately as client; verify they are redirected to Client Dashboard instead of Employee Dashboard.

---

### Tier 4: Real-World Workloads & End-to-End User Journeys - 6 Test Cases
Tier 4 represents end-to-end customer, employee, and owner workflows modeled after actual user tasks.

- **T4-01: Standard Client Journey**:
  1. Client lands on home page.
  2. Registers for a new client account.
  3. Navigates to the booking calendar.
  4. Sizes standard home space (1800 sq ft), selects standard package, and picks a weekly frequency.
  5. Enters credit card details into Stripe checkout simulator.
  6. Successfully completes checkout and views their scheduled pending job in the Client Dashboard.

- **T4-02: Standard Employee Cleaning Cycle**:
  1. Cleaner logs in to their dashboard.
  2. Selects the assigned job for the day.
  3. Begins the job, updating status to `in_progress`.
  4. Inspects checklist, completes and checks off all tasks sequentially.
  5. Uploads job completion photos.
  6. Submits the job as `completed` and updates availability for the rest of the week.

- **T4-03: Full Owner Business Day Flow**:
  1. Owner logs in (`ethanburds@gmail.com`).
  2. Navigates to settings, increases the Commercial rate to $0.18 per sq ft.
  3. Creates a new promo code `CLEAN25` (25% discount).
  4. Registers a new employee (`cleaner1@peosta.com`).
  5. Manually creates a commercial job, assigns it to the new employee, and verifies it shows up as assigned.
  6. Views general invoice tracking list to monitor unpaid tasks.

- **T4-04: Non-Registered Client Invoice & Pay Journey**:
  1. Owner generates invoice for custom client name, email, and amount.
  2. Owner extracts generated invoice Stripe payment link.
  3. Guest client visits link directly (unauthenticated).
  4. Pays the custom invoice via Stripe Checkout.
  5. Verify the client receives payment success, and owner dashboard shows invoice payment status updated to `paid`.

- **T4-05: Clean-and-Feedback Customer Loop**:
  1. Client books a one-time cleaning.
  2. Employee completes the cleaning and checks off checklist.
  3. Client logs into dashboard, navigates to completed job history, views photos.
  4. Leaves a 5-star service rating.
  5. Pays a $15 cleaner tip using Stripe checkout.

- **T4-06: Coordination & Scheduling Sync**:
  1. Employee Jane logs in and updates availability calendar, turning off Wednesday.
  2. Owner schedules deep cleaning on Wednesday, checks employee list, and verifies Jane is flagged as unavailable.
  3. Owner schedules cleaning for Thursday instead, assigning Jane.
  4. Client applies a 10% coupon code, checks out, and Jane sees the cleaning in her dashboard.

---

## 4. Execution Commands
To run the E2E tests:
```bash
npm run test:e2e
```
This runs Playwright test suite against the mocked offline database environment using the configurations set in `tests/playwright.config.js`.
