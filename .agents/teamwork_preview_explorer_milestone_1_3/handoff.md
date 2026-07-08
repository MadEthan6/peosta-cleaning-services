# Handoff Report: Milestone 1 - Authentication & Onboarding Analysis

## Summary
Analysis of the Peosta Cleaning Services portal's authentication, role division, and navigation structure reveals the exact strategies required to secure public client signup, integrate email verification, configure the Owner dashboard for staff creation, and replace Navbar buttons with a role-based dropdown. Additionally, a critical missing import (`Camera`) and an active data-privacy leak in the jobs fetching system were discovered.

---

## 1. Observation

### Client Public Signup & Role Selection
* In `src/App.jsx` (line 25), the default registration role is set to `'employee'`:
  ```javascript
  const [authRole, setAuthRole] = useState('employee');
  ```
* In `src/App.jsx` (lines 648-653), the registration form exposes a role selector allowing public users to choose `'employee'` or `'owner'`:
  ```javascript
  <div className="form-group">
    <label className="form-label">Portal Role</label>
    <select value={authRole} onChange={(e) => setAuthRole(e.target.value)} className="form-input">
      <option value="employee">Cleaning Employee</option>
      <option value="owner">Company Owner</option>
    </select>
  </div>
  ```
* In `src/App.jsx` (lines 142-175), `handleRegister` signs users up using whatever role state they selected in the dropdown:
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

### Email Verification Check
* In `src/App.jsx` (lines 59-79), the active auth session check redirects any logged-in user straight to the dashboard without checking `email_confirmed_at`:
  ```javascript
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      setUser(session.user);
      fetchProfile(session.user.id);
    }
  });
  ```
* The user's metadata contains an `email_confirmed_at` timestamp. If they have not clicked the verification link, this timestamp is `null` or `undefined`.

### Owner Login & Employee Account Creation
* In `src/supabaseClient.js` (lines 1-7), only a single default client is exported:
  ```javascript
  import { createClient } from '@supabase/supabase-js';

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  ```
* In `src/App.jsx` (lines 84-88), `fetchEmployees()` is only called if the user has the `'owner'` role:
  ```javascript
  if (profile.role === 'owner') {
    fetchEmployees();
  }
  ```
* The existing Owner Dashboard does not contain a form for creating new employees, nor does it instantiate a secondary non-persisting client.

### Navbar Buttons & Navigation
* In `src/components/Navbar.jsx` (lines 53-81), the profile is not received as a prop. Only `user` is passed to the component:
  ```javascript
  export default function Navbar({ currentTab, setCurrentTab, user, onLogout }) {
  ```
* If logged in, a generic "Portal Dashboard" button is shown, routing to `'dashboard'` irrespective of role (lines 56-62):
  ```javascript
  <button 
    onClick={() => setCurrentTab('dashboard')} 
    className="btn btn-secondary"
    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: '0.9rem' }}
  >
    <Shield size={16} /> Portal Dashboard
  </button>
  ```

### Critical Missing Import (Oxlint Finding)
* Running `npm run lint` generates the following error:
  ```
  ! react(jsx-no-undef): 'Camera' is not defined.
     ,-[src/App.jsx:866:30]
   865 |                           <h3 style={{ fontSize: '1.4rem', color: 'white', marginBottom: 20, display: 'flex', alignCenter: 'center', gap: 8 }}>
   866 |                             <Camera size={20} style={{ color: 'var(--color-primary-light)' }} /> Damage & Progress Photos
       :                              ^^^^^^
   867 |                           </h3>
  ```

### Job Leak (Security Privacy Flaw)
* In `src/App.jsx` (lines 108-127), if the profile belongs to a client, `fetchJobs` queries all rows from the `jobs` table without filtering:
  ```javascript
  const fetchJobs = async () => {
    if (!profile) return;
    setLoadingJobs(true);
    try {
      let query = supabase.from('jobs').select('*, employee:profiles(*)').order('scheduled_at', { ascending: true });
      
      // If employee, only show jobs assigned to them
      if (profile.role === 'employee') {
        query = query.eq('employee_id', profile.id);
      }

      const { data, error } = await query;
      // ...
  ```

---

## 2. Logic Chain

### Limit Public Signup to Clients
1. To prevent public users from creating employee or owner accounts (strict staff login), the role dropdown selector must be removed from `src/App.jsx` lines 648-653.
2. The initial state of `authRole` should be set to `'client'` at line 25, guaranteeing that `handleRegister` submits `'client'` by default.
3. As a safeguard, if the registering email is the pre-configured owner email (`ethanburds@gmail.com`), the application should override the signup role to `'owner'`.

### Email Verification Check
1. The Supabase Auth payload provides an `email_confirmed_at` field indicating whether the email is verified.
2. To restrict dashboard access to verified users only, the dashboard view at `src/App.jsx` line 704 must check if `user.email_confirmed_at` is populated.
3. If it is null/falsy, the system must render a "Verify Your Email" screen rather than the dashboard, including a `resend` link option and a sign-out trigger.

### Owner Dashboard Employee Creation
1. Calling `supabase.auth.signUp()` normally logs the newly signed-up user in, replacing the active browser session.
2. To allow the owner (`ethanburds@gmail.com`) to create credentials for new employees without getting logged out, we must configure a secondary Supabase client with `persistSession: false`.
3. The secondary client can perform the `signUp` operation statelessly.
4. Since the secondary client temporarily holds the new employee's session in memory for the callback, it should be used to write the user's profile row in `profiles` to satisfy the default RLS policy ("Users can insert their own profile") without using service role keys.
5. In `src/App.jsx`'s fetch profile logic, if the logging email is `ethanburds@gmail.com` and no database profile exists yet, the app should auto-provision a profile row with the `owner` role.

### Navbar Dropdown
1. The Navbar currently only receives the raw `user` session object, meaning it has no access to the user's profile (role) information.
2. Therefore, `src/App.jsx` must pass the `profile` object to `Navbar` as a prop.
3. `Navbar` should use internal React state to toggle a dropdown menu.
4. If logged in, the dropdown menu should direct the user to their role-specific dashboard link (e.g. "👑 Owner Dashboard", "🧹 Employee Dashboard", "👤 Client Dashboard") and a "Logout" action.
5. If logged out, the dropdown should present "👤 Client Portal" and "🧹 Staff Portal" routing options.

### Security Leak & Missing Imports
1. Because the `jobs` query in `fetchJobs` only filters by `employee_id` for employees, client accounts would fetch and view all cleaning jobs globally. We must add a filter mapping `client_email` to `profile.email`.
2. The missing import `Camera` must be added to the `'lucide-react'` import list at the top of `src/App.jsx` to prevent runtime crashes.

---

## 3. Caveats
* **RLS Policies**: This strategy assumes that either the owner has database permissions to insert/update employee profiles, or the secondary Supabase client (which logs in as the newly signed-up employee) can insert its own profile (the standard Supabase template behavior). If RLS policies are more restrictive, adjustments to the database rules may be needed.
* **Email Verification Configuration**: If email confirmation is disabled on the Supabase project backend, `email_confirmed_at` may remain null or behave differently. The project settings in Supabase must have "Confirm email" toggled on.

---

## 4. Conclusion
We recommend implementing the authentication and onboarding enhancements through the following precise strategies:

### Proposed Implementation Details

#### Task 1: Limit public signup to Clients
1. In `src/App.jsx` (line 25), initialize role to `'client'`:
   ```javascript
   const [authRole, setAuthRole] = useState('client');
   ```
2. Remove the `<div className="form-group">` selector for the portal role (lines 648-653) from `portal-login`.
3. In `handleRegister`, enforce:
   ```javascript
   const roleToAssign = authEmail === 'ethanburds@gmail.com' ? 'owner' : 'client';
   ```

#### Task 2: Email Verification Check
Insert an interceptor inside `App.jsx` at the top of the dashboard view:
```javascript
{currentTab === 'dashboard' && profile && (
  !user?.email_confirmed_at ? (
    <div className="container flex justify-center" style={{ padding: '80px 24px' }}>
      <div className="card text-center" style={{ maxWidth: 500 }}>
        <div style={{ color: 'var(--color-primary)', display: 'inline-flex', padding: 16, borderRadius: '50%', backgroundColor: 'rgba(13, 148, 136, 0.1)', marginBottom: 20 }}>
          <Mail size={48} />
        </div>
        <h2 style={{ fontSize: '1.75rem', color: 'white', marginBottom: 12 }}>Verify Your Email</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
          A verification link has been sent to <strong>{user.email}</strong>. Please check your inbox and verify your email to unlock your dashboard.
        </p>
        <div className="flex flex-col gap-4">
          <button onClick={async () => {
            const { error } = await supabase.auth.resend({ type: 'signup', email: user.email });
            if (error) alert('Error: ' + error.message);
            else alert('Verification email resent!');
          }} className="btn btn-primary">Resend Email</button>
          <button onClick={handleLogout} className="btn btn-outline">Cancel / Logout</button>
        </div>
      </div>
    </div>
  ) : (
    <div className="dashboard-container">
      {/* Existing dashboard layout... */}
    </div>
  )
)}
```

#### Task 3: Owner Configuration & Employee Creator
1. In `src/supabaseClient.js`, export the secondary client creator:
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
2. In `src/App.jsx`, implement the owner creation logic:
   ```javascript
   const [employeeEmail, setEmployeeEmail] = useState('');
   const [employeePassword, setEmployeePassword] = useState('');
   const [employeeFullName, setEmployeeFullName] = useState('');
   const [creatingEmployee, setCreatingEmployee] = useState(false);

   const handleCreateEmployee = async (e) => {
     e.preventDefault();
     setCreatingEmployee(true);
     try {
       const secondarySupabase = createSecondaryClient();
       const { data, error } = await secondarySupabase.auth.signUp({
         email: employeeEmail,
         password: employeePassword,
         options: { data: { full_name: employeeFullName, role: 'employee' } }
       });
       if (error) throw error;
       
       const { error: profileError } = await secondarySupabase
         .from('profiles')
         .insert({
           id: data.user.id,
           full_name: employeeFullName,
           email: employeeEmail,
           role: 'employee'
         });
       if (profileError) throw profileError;

       alert('Employee created successfully!');
       setEmployeeEmail('');
       setEmployeePassword('');
       setEmployeeFullName('');
       fetchEmployees();
     } catch (err) {
       alert('Error: ' + err.message);
     } finally {
       setCreatingEmployee(false);
     }
   };
   ```
3. Auto-provision the owner profile in `fetchProfile`:
   ```javascript
   const fetchProfile = async (uid, email) => {
     setLoadingProfile(true);
     try {
       let { data, error } = await supabase
         .from('profiles')
         .select('*')
         .eq('id', uid)
         .maybeSingle();

       if (!data && email === 'ethanburds@gmail.com') {
         const { data: newProfile, error: createError } = await supabase
           .from('profiles')
           .insert({ id: uid, email, full_name: 'Ethan Burds', role: 'owner' })
           .select()
           .single();
         if (createError) throw createError;
         data = newProfile;
       }
       if (error && !data) throw error;
       setProfile(data);
     } catch (err) {
       console.error(err.message);
     } finally {
       setLoadingProfile(false);
     }
   };
   ```

#### Task 4: Navbar Dropdown Navigation
1. Pass the `profile` prop to the `Navbar` component inside `src/App.jsx`.
2. Replace the Navbar buttons with dropdown components matching both authenticated (owner, employee, client) and unauthenticated (client sign-in, staff sign-in) views.

#### Extra Tasks: Missing Icon & Client Job Leak
1. Import `Camera` from `'lucide-react'` in `src/App.jsx`.
2. Update `fetchJobs` in `src/App.jsx` to filter by client email if role is `'client'`:
   ```javascript
   if (profile.role === 'employee') {
     query = query.eq('employee_id', profile.id);
   } else if (profile.role === 'client') {
     query = query.eq('client_email', profile.email);
   }
   ```

---

## 5. Verification Method

To verify these recommendations:
1. **Linter Check**: Run the command `npm.cmd run lint` to verify that no undefined variables (like `Camera`) persist.
2. **Build Check**: Run `npm.cmd run build` to guarantee successful compilation.
3. **Database Rules Inspection**: Confirm that the `profiles` table allows users to insert their own rows under RLS.
4. **Behavior Verification**: 
   - Verify that logging out the owner doesn't happen when creating an employee account in the owner dashboard.
   - Verify that client sign-up does not display role selection in the UI.
   - Verify that unverified email accounts show the email verification warning card on dashboard routing.
