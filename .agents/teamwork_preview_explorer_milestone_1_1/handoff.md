# Handoff Report: Milestone 1 - Authentication & Onboarding Strategy

This report outlines the observations, logical reasoning, and recommended strategy for implementing the refactored authentication, onboarding, and dashboard access flow.

---

## 1. Observation

Direct observations made within the codebase are detailed below:

### A. Signup and Role Assignment
* In `src/App.jsx` line 25, the initial state for the authentication role is set to `'employee'`:
  ```javascript
  const [authRole, setAuthRole] = useState('employee');
  ```
* In `src/App.jsx` lines 648–653, the registration UI includes a select dropdown allowing public registrants to choose their role:
  ```javascript
  <div className="form-group">
    <label className="form-label">Portal Role</label>
    <select value={authRole} onChange={(e) => setAuthRole(e.target.value)} className="form-input">
      <option value="employee">Cleaning Employee</option>
      <option value="owner">Company Owner</option>
    </select>
  </div>
  ```
* In `src/App.jsx` lines 142–175 (`handleRegister`), the signup process passes the state `authRole` to user metadata and writes it directly to the database:
  ```javascript
  const { data, error } = await supabase.auth.signUp({
    email: authEmail,
    password: authPassword,
    options: {
      data: {
        full_name: authFullName,
        role: authRole
      }
    }
  });
  ```

### B. Email Verification
* In `src/App.jsx` lines 59–79, the active session is initialized and subscription listeners are defined, but no checks are performed on `user.email_confirmed_at`:
  ```javascript
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  ```

### C. Supabase Client & Employee Creation
* In `src/supabaseClient.js` lines 1–7, only a single Supabase client is created and exported:
  ```javascript
  import { createClient } from '@supabase/supabase-js';

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  ```
* No employee creation form or sidebar tab exists within the Owner Dashboard UI of `src/App.jsx`.

### D. Navigation
* In `src/components/Navbar.jsx` lines 53–80, the portal navigation is handled by a single button with no dropdown capabilities:
  ```javascript
  <div className="flex align-center gap-4">
    {user ? (
      <>
        <button 
          onClick={() => setCurrentTab('dashboard')} 
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: '0.9rem' }}
        >
          <Shield size={16} /> Portal Dashboard
        </button>
        <button 
          onClick={onLogout} 
          className="btn btn-outline"
          style={{ padding: '8px 16px', fontSize: '0.9rem' }}
        >
          Logout
        </button>
      </>
    ) : (
      <button 
        onClick={() => setCurrentTab('portal-login')} 
        className="btn btn-primary"
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: '0.9rem' }}
      >
        <Shield size={16} /> Employee Portal
      </button>
    )}
  </div>
  ```

---

## 2. Logic Chain

Based on the observed code, here is the rationale for the recommended implementation strategy:

1. **Client Signup Hardening**: 
   * Since any public registrant can currently choose the `owner` or `employee` role using the select input in `App.jsx`, removing the select dropdown is necessary to prevent authorization bypass.
   * Setting the initial `authRole` state to `'client'` ensures the default role for any registration is always `'client'`.
   * Intercepting `authEmail` during the signup submit handler to check for `ethanburds@gmail.com` allows the owner to register and secure the `'owner'` role, while ensuring all other signups default to `'client'`.

2. **Email Verification Notice**:
   * If a user registers, Supabase creates the auth record but marks `email_confirmed_at` as null until the verification link is clicked.
   * To prevent unverified users from accessing any authenticated dashboard pages, we can check if `user` exists but `user.email_confirmed_at` is falsy.
   * Displaying a custom verification notice card with a "Resend Verification Email" button (calling `supabase.auth.resend`) is a user-friendly way to prompt action and verify accounts.

3. **Owner's Employee Creator with Secondary Client**:
   * If the owner attempts to register an employee using the primary `supabase` client instance, Supabase will save the newly created session, replacing the owner's active session and logging them out.
   * Initializing a secondary Supabase client with `{ auth: { persistSession: false } }` resolves this by allowing the owner to invoke `auth.signUp` for the employee without affecting their own active cookie/localStorage session.
   * However, since the secondary client is not authenticated with the owner's session, RLS policies could prevent it from inserting records into the `profiles` table. Thus, the strategy should use the secondary client only for the authentication signup step, and the primary `supabase` client (which maintains the active owner session) to write the profile record.

4. **Dropdown Navbar Navigation**:
   * Replacing the single "Employee Portal" button with a relative-positioned container and using a React ref + state ensures robust dropdown behavior without requiring additional libraries.
   * Modifying the dropdown contents based on the `user` and `profile` states allows appropriate menu items: login options when logged out, and role-based dashboard links when logged in.

---

## 3. Caveats

* **Database Constraints**: The proposed solution assumes there are no database constraints or trigger actions that override the `role` column in the `profiles` table upon creation.
* **RLS Policies**: If Row Level Security is active, we assume that owners have authorization to insert profiles for employees.
* **Vite Env Variables**: The secondary client requires access to `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. These must be correctly loaded in the environment.

---

## 4. Conclusion

The recommended implementation strategy consists of:

### Action 1: Limit public signup strictly to Clients
* Set default role state in `src/App.jsx`:
  ```javascript
  const [authRole, setAuthRole] = useState('client');
  ```
* Remove the `select` element containing role options from `src/App.jsx`.
* In `handleRegister` in `src/App.jsx`, derive the signup role:
  ```javascript
  const resolvedRole = authEmail.trim().toLowerCase() === 'ethanburds@gmail.com' ? 'owner' : 'client';
  ```

### Action 2: Add Email Verification Check/Notice
* Add a conditional render check in `src/App.jsx`:
  ```javascript
  if (user && !user.email_confirmed_at) {
    return <EmailVerificationNotice user={user} handleLogout={handleLogout} />;
  }
  ```
* Implement the resend function:
  ```javascript
  const handleResendVerification = async () => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email
    });
    if (error) alert(error.message);
    else alert('Verification email resent!');
  };
  ```

### Action 3: Owner Dashboard Employee Creator
* Export a non-persisting client factory function from `src/supabaseClient.js`:
  ```javascript
  export const createSecondaryClient = () => {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
  };
  ```
* Add the `create-employee` view inside the Owner Dashboard in `src/App.jsx`, providing fields for full name, email, and password.
* Implement the submission handler:
  ```javascript
  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    const tempSupabase = createSecondaryClient();
    const { data, error } = await tempSupabase.auth.signUp({
      email: empEmail,
      password: empPassword,
      options: { data: { full_name: empFullName, role: 'employee' } }
    });
    if (error) throw error;

    // Insert profile using main authenticated owner client
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: data.user.id, full_name: empFullName, email: empEmail, role: 'employee' });
    if (profileError) throw profileError;
    alert('Employee created successfully!');
  };
  ```

### Action 4: Dropdown Navigation in Navbar
* Modify `src/components/Navbar.jsx` to receive `profile` and `setIsRegistering`.
* Replace the "Employee Portal" / "Portal Dashboard" buttons with a relative-positioned div containing a dropdown toggle.
* Style the dropdown menu utilizing the custom CSS system values for backgrounds (`white`), border colors (`var(--border-color)`), and shadow levels (`var(--shadow-lg)`).
* Correct a critical security bug in `fetchJobs` in `src/App.jsx`: if the role is `'client'`, restrict fetched jobs using `.eq('client_email', profile.email)` to prevent data leakage.

---

## 5. Verification Method

To verify these changes after implementation:

1. **Verify Role Restrictions**:
   * Inspect the public signup view. Confirm that no role dropdown exists.
   * Register a new dummy account. Check the Supabase console (`auth.users` and `profiles` table) to verify it is assigned the `client` role.
2. **Verify Owner Configuration**:
   * Register or log in with `ethanburds@gmail.com`.
   * Inspect the database `profiles` entry to confirm the role is set to `owner`.
3. **Verify Employee Account Creator**:
   * Log in as `ethanburds@gmail.com`. Navigate to the "Create Employee Account" tab.
   * Register a test employee.
   * Verify that the owner's active login session is NOT logged out.
   * Verify that the database contains the new employee auth and profile entries.
4. **Verify Dropdown & Notice**:
   * Register a client and verify the notice card appears if email confirmation is enabled and the email is unverified.
   * Verify dropdown menus render, open, close, and redirect properly when logged out (Sign In / Register) and when logged in (Dashboard / Logout).
