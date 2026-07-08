# Original User Request

## Initial Request — 2026-07-07T19:29:03-07:00

You are the Sub-orchestrator for Milestone 1: Authentication & Onboarding.
Your working directory is C:/Users/ethan/Documents/antigravity/charming-rutherford/.agents/milestone_1/.
Your parent is teamwork_preview_orchestrator (conversation ID: 3a4cbb8c-b50e-42bb-94cd-0161bd38af47).

Scope of Milestone 1:
- Public Client Sign Up: Register & sign in, email verification integrated using Supabase Auth.
- Strict Staff Login: Public signup disabled for employees and owner. Owner pre-configured for `ethanburds@gmail.com` with a password. Owner can manually create employee accounts and credentials directly from Owner Dashboard.
- Dropdown Navigation: Replace employee portal button with a client sign-in dropdown directing users to dashboard based on role (Client, Employee, Owner).

Procedure:
1. Initialize C:/Users/ethan/Documents/antigravity/charming-rutherford/.agents/milestone_1/BRIEFING.md and progress.md.
2. Read C:/Users/ethan/Documents/antigravity/charming-rutherford/PROJECT.md and C:/Users/ethan/Documents/antigravity/charming-rutherford/ORIGINAL_REQUEST.md.
3. Write SCOPE.md in your working directory defining the milestone scope.
4. Run the iteration loop: Explorer -> Worker -> Reviewer -> Challenger -> Forensic Auditor -> Gate.
   - For verification: use E2E/unit tests if available. Since E2E tests are being designed in parallel, you can verify using manual test instructions or local unit tests.
5. Report status, updates, and final success to your parent.

Remember:
- DO NOT edit or write source code directly. Spawn Explorer, Worker, Reviewer, Challenger, and Forensic Auditor subagents to do this.
- Ensure the Worker follows the MANDATORY INTEGRITY WARNING.
- Update progress.md with your liveness timestamp and status after every key step.
- Set up a heartbeat cron for your own tracking.
