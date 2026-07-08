## 2026-07-07T19:34:21Z

<USER_REQUEST>
You are teamwork_preview_worker. Your task is to set up the E2E testing infrastructure and write the initial E2E test strategy.

Working directory: C:/Users/ethan/Documents/antigravity/charming-rutherford/
Target files:
- C:/Users/ethan/Documents/antigravity/charming-rutherford/TEST_INFRA.md (Create this file at project root)
- C:/Users/ethan/Documents/antigravity/charming-rutherford/tests/playwright.config.js (Playwright configuration)
- C:/Users/ethan/Documents/antigravity/charming-rutherford/tests/mocks/mockSupabase.js (Supabase request interceptor and mock responses)
- C:/Users/ethan/Documents/antigravity/charming-rutherford/package.json (Add "test:e2e": "playwright test" script to package.json)

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Instructions:
1. Write TEST_INFRA.md at the project root based on the user requirements (R1 to R5) and the 11 feature areas:
   - F1: Client Sign-Up & Auth Flow
   - F2: Staff Login Security & Pre-configured Owner
   - F3: Owner Dashboard Employee Creation
   - F4: Navbar Dropdown & Dashboard Redirection
   - F5: Booking Calendar & Frequencies
   - F6: Stripe Checkout & Subscriptions Integration
   - F7: Owner Settings Rates & Competitor Grid
   - F8: Database Rates Synchronization
   - F9: Invoice Management Panel
   - F10: Employee Todo List Manager
   - F11: Premium Utilities (Promo Codes, Job History, Cleaner Tipping/Ratings, availability toggling)
   Map these to a 4-tier test case approach (Category-Partition, BVA, Pairwise, Real-world workloads) with counts:
   - Tier 1: 5 * 11 = 55 test cases
   - Tier 2: 5 * 11 = 55 test cases
   - Tier 3: 11 test cases
   - Tier 4: 6 test cases
   - Total: 127 E2E test cases.

2. Create tests/playwright.config.js. It must configure:
   - Test directory: './tests/e2e'
   - Base URL: 'http://localhost:5173'
   - local webServer: 'npx.cmd vite --port 5173' (or similar command to start the Vite dev server locally)
   - Browser options (e.g. use Chromium).

3. Create tests/mocks/mockSupabase.js. This helper script should intercept and mock all Supabase API calls (auth, profiles, jobs, checklist_items, rates, promo_codes) using page.route() in Playwright, ensuring the E2E tests run offline (CODE_ONLY) without hitting the actual remote database. Include standard responses for:
   - Successful client registration & sign-in.
   - Restricting staff registrations.
   - Fetching rates, jobs, checklist items, and promo codes.
   - Updating checklist items and database rates.

4. Add the "test:e2e" script to package.json so that running "npm.cmd run test:e2e" runs Playwright.

5. Create a simple placeholder test tests/e2e/sanity.spec.js that uses mockSupabase.js to mock Supabase, visits the home page, and checks that the title or header is correct.

6. Run the sanity test via npm.cmd run test:e2e to verify the E2E setup compiles and runs. Document the command run and result output.

Create a handoff report at C:/Users/ethan/Documents/antigravity/charming-rutherford/.agents/worker_setup_infra/handoff.md when complete. Do not edit any application source files in src/ or public/.

</USER_REQUEST>
