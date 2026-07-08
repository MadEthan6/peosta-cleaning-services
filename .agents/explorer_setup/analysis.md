# E2E Test Strategy & App Setup Analysis

## Executive Summary
This report explores the codebase of Peosta Cleaning Services at `C:/Users/ethan/Documents/antigravity/charming-rutherford`, inventories the current feature implementations, evaluates the available shell environment, and defines the proposed E2E testing architecture using **Playwright**.

---

## 1. Current App Setup & Technologies
The codebase is a Single Page Application (SPA) built using **Vite + React (v19)** and **Supabase (JavaScript SDK)** for backend integration.

### Core Dependencies (from `package.json`):
- **React**: `^19.2.7` / **React DOM**: `^19.2.7`
- **Supabase Client**: `@supabase/supabase-js` (`^2.110.1`)
- **Icons**: `lucide-react` (`^1.23.0`)
- **Build Tools**: `vite` (`^8.1.1`), `@vitejs/plugin-react` (`^6.0.3`), `oxlint` (`^1.71.0`), `vite-plugin-javascript-obfuscator` (`^3.1.0`), `gh-pages` (`^6.3.0`)

### Routing & Navigation:
- **No Client-side Router**: Navigation is managed dynamically using React state (`currentTab` in `App.jsx`). Available tabs: `'home'`, `'book'`, `'pay'`, `'portal-login'`, `'dashboard'`.
- **Database & Storage Connection**: Read from `.env` keys (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) in `supabaseClient.js`.

---

## 2. Shell Environment & Runtime Verification
We verified the available runtimes and commands on the Windows host machine:
- **Node.js**: Version `v24.18.0` is installed and fully functional.
- **npm**: Version `11.16.0` is available.
  - *PowerShell Constraint*: Direct execution of global scripts (e.g., `npm` or `npx`) is blocked by the Windows execution policy (`npm.ps1 cannot be loaded because running scripts is disabled on this system`).
  - *Resolution*: Run npm commands using `.cmd` explicitly (e.g., `npm.cmd run build`, `npx.cmd playwright --version`).
- **Playwright / Vitest**: Both frameworks are available globally or on-demand via `npx.cmd` (`playwright` v1.61.1, `vitest` v4.1.10).
- **Compilation Check**: Running `npm.cmd run build` successfully compiles the client SPA in `267ms` into the `dist/` directory.

---

## 3. Feature Inventory Status (from ORIGINAL_REQUEST.md)
The following grid outlines the state of each requirement in the current codebase:

| Req ID | Requirement Name | Code Location / Status | Implementation State |
| :--- | :--- | :--- | :--- |
| **R1.1** | Public Client Sign Up | `App.jsx` (lines 142-175) | ⚠️ **Partial**: Implemented via Supabase Auth, but lacks proper public restrictions. |
| **R1.2** | Strict Staff Login | `App.jsx` (lines 177-191) | ❌ **Missing**: Anyone can register as Employee or Owner via the dropdown selector in `portal-login`. |
| **R1.3** | Pre-configured Owner Login | `PROJECT.md` / `App.jsx` | ⚠️ **Pre-requisite**: Pre-configured email is `ethanburds@gmail.com`. |
| **R1.4** | Dropdown Navigation Menu | `Navbar.jsx` (lines 53-80) | ❌ **Missing**: Navbar only has static "Employee Portal" or "Portal Dashboard" buttons; client dropdown is not implemented. |
| **R2.1** | Interactive Booking Calendar | `Calendar.jsx` (lines 88-265) | ⚠️ **Partial**: Basic calendar booking is in place, but recurring frequency selection is missing. |
| **R2.2** | Stripe Subscription & Checkout | `App.jsx` (lines 201-281) | ❌ **Simulated**: Payments are simulated locally. No real Stripe checkout redirects or subscription hooks are implemented. |
| **R3.1** | Dynamic Pricing Controls | `App.jsx` | ❌ **Missing**: Owner setting panel to modify square-foot cleaning rates does not exist yet. |
| **R3.2** | Local Competitor Comparison UI| `App.jsx` | ❌ **Missing**: Guidelines for Peosta/Dubuque competitor rates are not present. |
| **R3.3** | Database Sync for Rates | `Calendar.jsx` (lines 4-8) | ❌ **Missing**: Pricing packages are hardcoded in `Calendar.jsx`. They do not fetch from the Supabase `rates` table. |
| **R4.1** | Invoice Tracking Panel | `App.jsx` / `pay` tab | ⚠️ **Partial**: Client can input a payment amount, but the owner panel cannot yet generate or manage invoice links. |
| **R4.2** | Employee Todo Manager | `JobChecklist.jsx` |  **Complete**: Employees can check off items, which syncs with the `checklist_items` table. |
| **R5.1** | Discount & Promo Codes | `App.jsx` / `Calendar.jsx` | ❌ **Missing**: No promo code forms or database validation. |
| **R5.2** | Client Job History & Receipts | `App.jsx` | ❌ **Missing**: Client portal/dashboard does not exist (only Employee/Owner dashboard). |
| **R5.3** | Cleaner Tipping & Ratings | `App.jsx` | ❌ **Missing**: No tipping/rating interface exists. |
| **R5.4** | Employee Availability | `PROJECT.md` / `App.jsx` | ❌ **Missing**: Employees cannot toggle available slots. |

---

## 4. Critical Bugs & Risks Identified
During read-only inspection, we discovered the following issues:
1. **Critical Undefined Variable Crash**:
   - In `src/App.jsx` line 866, the `<Camera size={20} />` element is rendered.
   - However, `Camera` is **not imported** from `lucide-react` in the imports section (lines 8-13).
   - **Impact**: Opening the active job view in the Employee Dashboard will trigger a fatal JavaScript crash (`ReferenceError: Camera is not defined`), preventing employees from completing jobs or viewing checklists.
2. **Security Vulnerability (Public Role Selection)**:
   - In the registration tab (`portal-login` in `App.jsx`), a `<select>` dropdown allows anyone registering to claim the role of "Company Owner" or "Cleaning Employee".
   - **Impact**: Malicious users can register as Owner and gain access to all client jobs, assign jobs, and view chat histories.
3. **Hardcoded Rates in Calendar**:
   - The pricing packages in `Calendar.jsx` are hardcoded. If the owner updates rates in the database, the public booking price estimation calculator will not reflect them until sync code is added.

---

## 5. E2E Testing Strategy & Environment
Given that this application communicates directly with a live remote Supabase instance (`https://ikrpobckicztrekvzvij.supabase.co`) and we are operating in a **CODE_ONLY (network-restricted)** environment:
1. **Framework Choice**: **Playwright** is recommended.
   - *Rationale*: Playwright offers first-class support for network interception (`page.route`), allowing us to intercept all database queries and auth requests to Supabase and respond with local mock JSON payloads. This eliminates external network dependency, speeds up test execution, and guarantees clean state.
2. **Environment Simulation**:
   - Run a local static Vite development server: `npx.cmd vite --port 5173`.
   - Execute Playwright against the local server: `npx.cmd playwright test`.
   - Setup a `testData.js` fixture file with deterministic test profiles (Owner, Client, Employee) and jobs to mimic the database state.

---

## 6. Proposed Directory Layout & Architecture
We suggest creating a dedicated `tests/` directory in the project root:

```
C:/Users/ethan/Documents/antigravity/charming-rutherford/tests/
├── e2e/
│   ├── auth.spec.js                # Tests R1: client register, staff signin restrictions, routing logic
│   ├── booking.spec.js             # Tests R2: package pricing, calendar slots, payment redirect logic
│   ├── rates.spec.js               # Tests R3: rate card sync and dynamic calculator updates
│   ├── checklists.spec.js          # Tests R4: employee task completion syncing
│   └── premium.spec.js             # Tests R5: promo codes, tipping, availability toggling
├── mocks/
│   ├── mockSupabase.js             # Playwright router to intercept and mock Supabase REST API responses
│   └── testData.js                 # Mock database rows (profiles, jobs, checklists, promo_codes)
└── playwright.config.js            # Playwright browser configurations & local server hook
```

### Verification Plan Command Sequence:
- **Build compilation sanity**: `npm.cmd run build`
- **Lint validation**: `npm.cmd run lint`
- **Playwright Test Execution**: `npx.cmd playwright test` (will load configurations from `tests/playwright.config.js`)
