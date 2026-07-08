## 2026-07-08T02:33:23Z
You are worker_1, a teamwork_preview_worker.
Your working directory is C:/Users/ethan/Documents/antigravity/charming-rutherford/.agents/worker_milestone_1_1/.
Your task is to implement Milestone 1: Authentication & Onboarding for Peosta Cleaning Services.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Scope of Milestone 1 changes:
1. Public Client Sign Up:
   - In src/App.jsx, default authRole state to 'client' (remove option to select employee or owner from the portal-login page).
   - In handleRegister, assign role 'client' to all public registrants except ethanburds@gmail.com which gets role 'owner'.
   - Check if email_confirmed_at on user is present. If user is logged in but not confirmed, show a verification notice page instead of the dashboard, allowing resending verification email using supabase.auth.resend and a logout action.
2. Owner Login & Employee Account Creation:
   - Enable owner login (email ethanburds@gmail.com). In fetchProfile, if profile doesn't exist for this email, auto-insert a profile with role='owner'.
   - Add a tab/panel in Owner Dashboard called "Create Employee Account" (or "Create Employee").
   - Export createSecondaryClient function from src/supabaseClient.js configured with `{ auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }`.
   - Use the secondary client in Owner Dashboard to sign up new employees without disrupting owner's active session. Seed the new employee's profile in the profiles table with role='employee' using this secondary client.
3. Dropdown Navigation:
   - Pass user profile to Navbar.jsx.
   - Replace the static "Employee Portal" / "Portal Dashboard" button with a dropdown component.
   - Dropdown should show:
     - For unauthenticated users: "Client Portal" (renders portal-login tab as client) and "Staff Portal" (renders portal-login tab as employee).
     - For logged-in users: Dashboard links based on role (Client Dashboard, Employee Dashboard, Owner Dashboard) and Logout button.
4. Security & Bug Fixes:
   - Import Camera from 'lucide-react' in src/App.jsx.
   - Filter jobs in fetchJobs: if the role is 'client', filter by client_email matching profile.email.

Reference the Explorer handoffs at:
- C:/Users/ethan/Documents/antigravity/charming-rutherford/.agents/teamwork_preview_explorer_milestone_1_1/handoff.md
- C:/Users/ethan/Documents/antigravity/charming-rutherford/.agents/teamwork_preview_explorer_milestone_1_2/handoff.md
- C:/Users/ethan/Documents/antigravity/charming-rutherford/.agents/teamwork_preview_explorer_milestone_1_3/handoff.md

Verify your changes:
- Run 'npm run lint' and ensure it passes.
- Run 'npm run build' to ensure the React application builds cleanly.
- Document verification command and output in your handoff.md.
