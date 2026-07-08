# Scope: Milestone 1: Authentication & Onboarding

## Architecture
Peosta Cleaning Services is a React SPA built with Vite and Supabase. The authentication and onboarding flow will be refactored as follows:
- **Supabase Auth & Profiles Table**: Maintain email/password authentication using Supabase. The `profiles` table stores the `role` ('client', 'employee', 'owner') and `full_name`.
- **Public Client Sign Up**: The public registration form will be restricted to registering `client` profiles only. Email verification will be integrated using Supabase Auth (checking `email_confirmed_at` or displaying a verification notice).
- **Strict Staff Login**: Registration for `employee` and `owner` roles will be removed from the public frontend.
- **Owner Dashboard (Employee Creation)**: A new section in the Owner Dashboard will allow the Owner (`ethanburds@gmail.com`) to enter an email, password, and full name to create a new employee. A temporary Supabase client with `persistSession: false` will be used to invoke `signUp` for the new employee without disrupting the Owner's active session.
- **Dropdown Navigation**: The "Employee Portal" button in the Navbar will be replaced with a Client Sign-In dropdown. If logged in, users will see links to their respective dashboards. If not, they can choose to sign in/register, which will guide them to the appropriate portal view.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | File Audit & Design Plan | Analyze current authentication, profiles schema, and Navbar implementation. | None | DONE |
| 2 | Client Sign-up Refactoring | Modify registration to default to client, integrate email verification checks/notices. | M1.1 | PLANNED |
| 3 | Strict Staff Login & Pre-config | Restrict public signup. Ensure Owner account `ethanburds@gmail.com` logs into Owner Dashboard. | M1.2 | PLANNED |
| 4 | Owner Dashboard Employee Creator | Add form in Owner Dashboard to create employees using a non-persisting secondary Supabase client. | M1.3 | PLANNED |
| 5 | Dropdown Navigation UI | Implement dropdown in Navbar for login/role-based dashboard navigation. | M1.4 | PLANNED |

## Interface Contracts
### Supabase Auth ↔ Profiles Schema
- Supabase Auth User Metadata:
  - `full_name`: string
  - `role`: 'client' | 'employee' | 'owner'
- Database `profiles` Row:
  - `id`: uuid (references auth.users.id)
  - `full_name`: text
  - `email`: text
  - `role`: text ('client', 'employee', 'owner')

### Secondary Supabase Client (Employee Creator)
- Function: `createEmployeeAccount(email, password, full_name)`
- Implementation: Creates a Supabase client with `{ auth: { persistSession: false } }` to trigger `signUp`.
