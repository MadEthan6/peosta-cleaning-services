# Handoff Report: Milestone 1 - Authentication & Onboarding Strategy

This report details the recommended strategy, codebase analysis, and specific file modifications required to implement the Authentication & Onboarding milestone for Peosta Cleaning Services.

---

## 1. Observation

Direct observations of the codebase reveal the following current structures and configuration limits:

### A. Supabase Client Initialization (`src/supabaseClient.js`)
* **Path**: `src/supabaseClient.js`
* **Current Code**:
  ```javascript
  import { createClient } from '@supabase/supabase-js';

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  ```
  Only a single persisted client is configured and exported, meaning any authentication API call will write to standard localStorage/sessionStorage.

### B. Public Registration Role Selector (`src/App.jsx`)
* **Path**: `src/App.jsx`
* **Current Default State (Line 25)**:
  ```javascript
  const [authRole, setAuthRole] = useState('employee');
  ```
* **Current UI Form (Lines 641–654)**:
  ```javascript
  {isRegistering && (
    <>
      <div className="form-group">
        <label className="form-label">Full Name</label>
        <input type="text" required value={authFullName} onChange={(e) => setAuthFullName(e.target.value)} className="form-input" placeholder="Jane Doe" />
      </div>
      <div className="form-group">
        <label className="form-label">Portal Role</label>
        <select value={authRole} onChange={(e) => setAuthRole(e.target.value)} className="form-input">
          <option value="employee">Cleaning Employee</option>
          <option value="owner">Company Owner</option>
        </select>
      </div>
    </>
  )}
  ```
  This allows anyone visiting the public frontend to register an account with `'employee'` or `'owner'` privileges, which is a major security flaw.

### C. Registration Form Navigation & Routing Flow (`src/App.jsx`)
* **Path**: `src/App.jsx`
* **Current Success Flow (Lines 168–171)**:
  ```javascript
  alert('Registration successful! Logging you in...');
  setUser(data.user);
  setIsRegistering(false);
  setCurrentTab('dashboard');
  ```
  This directly routes the user to the dashboard upon sign-up without confirming email verification status.

### D. Owner Dashboard View & Actions (`src/App.jsx`)
* **Path**: `src/App.jsx`
* **Current Layout checks (Lines 885–886)**:
  ```javascript
  {/* SUBTAB: CREATE NEW JOB (OWNER ONLY) */}
  {dashboardTab === 'new-job' && profile.role === 'owner' && (
  ```
  Only the "Create New Job" option exists as an owner-specific sub-tab. There is no employee creator section.

### E. Navigation Bar Layout (`src/components/Navbar.jsx`)
* **Path**: `src/components/Navbar.jsx`
* **Current Action Controls (Lines 53–80)**:
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
  The header has simple conditional rendering based solely on the existence of `user`, without role-based separation or menu dropdowns.

---

## 2. Logic Chain

The proposed strategic changes are justified as follows:

1. **Client Role Enforcement**: Since public users must only register as `'client'`, we must remove the role dropdown from the registration UI. Setting the default state of `authRole` to `'client'` ensures that the signup payload automatically uses this restricted value. Additionally, we should hardcode `'client'` in the database seeding operation (`supabase.from('profiles').upsert`) to guarantee security.
2. **Email Verification Notice**: If Supabase's email confirmation is enabled, a user's session lacks full validation until verification. By intercepting `data.user.email_confirmed_at` during signup, we can alert the user to check their email and prevent direct redirection to the dashboard. For returning unconfirmed users, we can render a persistent non-intrusive warning card in their dashboard and provide a one-click resend button using `supabase.auth.resend`.
3. **Non-persisting Session Client**: Because `supabase.auth.signUp()` normally logs in the newly registered account and overwrites the active local storage session, using the standard client would log out the owner during employee creation. By initializing a separate client with `persistSession: false`, the owner can execute employee registration asynchronously while preserving their owner session credentials. Seeding the `profiles` record can then be completed via the owner's primary client to respect RLS database permissions.
4. **Navbar Dropdown Refactoring**: The existing navigation layout has a static button targeting staff portal login. Passing the `profile` object (which contains the user's role) from `App.jsx` to `Navbar.jsx` allows the Navbar to inspect `profile.role` and render role-appropriate navigation options inside a dropdown menu.

---

## 3. Caveats

* **Supabase Auth Config**: This strategy assumes that the Supabase instance is configured with email confirmation enabled under Auth settings. If email confirmation is disabled in the Supabase Dashboard, `email_confirmed_at` will be populated immediately on registration, rendering the verification pending notice inactive.
* **RLS Policies**: The strategy assumes that the `profiles` table has Row Level Security policies allowing authenticated `owner` accounts to insert rows for other user IDs, and allowing new sign-ups to create their own initial profile.

---

## 4. Conclusion

We recommend the following actionable code changes to satisfy all Milestone 1 requirements:

### Task 1: Restrict Public Signup to Clients
1. In `src/App.jsx`, update the default state to `'client'`:
   ```javascript
   const [authRole, setAuthRole] = useState('client');
   ```
2. In `src/App.jsx`, delete the "Portal Role" form section (lines 647–653).
3. In `src/App.jsx` `handleRegister`, force the `'client'` role:
   ```javascript
   const { data, error } = await supabase.auth.signUp({
     email: authEmail,
     password: authPassword,
     options: {
       data: {
         full_name: authFullName,
         role: 'client'
       }
     }
   });
   ```

### Task 2: Email Verification Check/Notice
1. Update `handleRegister` in `src/App.jsx` to intercept unconfirmed users:
   ```javascript
   if (!data.user.email_confirmed_at) {
     alert('Registration successful! A verification link has been sent to your email. Please verify it to log in.');
     setIsRegistering(false);
     setCurrentTab('portal-login');
   } else {
     alert('Registration successful! Logging you in...');
     setUser(data.user);
     setIsRegistering(false);
     setCurrentTab('dashboard');
   }
   ```
2. Render a banner in `src/App.jsx` dashboard content if `user` exists but is unconfirmed:
   ```javascript
   {user && !user.email_confirmed_at && (
     <div className="verification-notice" style={{ padding: 16, backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #f59e0b', borderRadius: 8, margin: '16px 0' }}>
       <p><strong>Verification Pending:</strong> Please check your email to verify your account.</p>
       <button 
         onClick={async () => {
           const { error } = await supabase.auth.resend({ type: 'signup', email: user.email });
           alert(error ? error.message : 'Verification email resent!');
         }}
         className="btn btn-outline"
         style={{ marginTop: 8, borderColor: '#b45309', color: '#b45309' }}
       >
         Resend Email
       </button>
     </div>
   )}
   ```

### Task 3: Owner Login & Employee Account Creator
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
2. In `src/App.jsx`, add employee creation states:
   ```javascript
   const [empEmail, setEmpEmail] = useState('');
   const [empPassword, setEmpPassword] = useState('');
   const [empFullName, setEmpFullName] = useState('');
   const [isCreatingEmployee, setIsCreatingEmployee] = useState(false);
   ```
3. Add the `new-employee` tab to the owner's sidebar menu in `src/App.jsx` dashboard view:
   ```javascript
   {profile.role === 'owner' && (
     <div 
       onClick={() => setDashboardTab('new-employee')}
       className={`sidebar-item ${dashboardTab === 'new-employee' ? 'active' : ''}`}
     >
       <User size={20} /> Create Employee
     </div>
   )}
   ```
4. Define the submission handler using the secondary client:
   ```javascript
   import { createSecondaryClient } from './supabaseClient';

   const handleCreateEmployee = async (e) => {
     e.preventDefault();
     setIsCreatingEmployee(true);
     try {
       const secondarySupabase = createSecondaryClient();
       const { data, error } = await secondarySupabase.auth.signUp({
         email: empEmail,
         password: empPassword,
         options: {
           data: {
             full_name: empFullName,
             role: 'employee'
           }
         }
       });
       
       if (error) throw error;
       
       // Write to profiles table using the owner's active primary client
       const { error: profileError } = await supabase
         .from('profiles')
         .insert({
           id: data.user.id,
           full_name: empFullName,
           email: empEmail,
           role: 'employee'
         });
         
       if (profileError) throw profileError;
       
       alert(`Employee account for ${empFullName} created successfully!`);
       setEmpEmail('');
       setEmpPassword('');
       setEmpFullName('');
       setDashboardTab('jobs');
       fetchEmployees();
     } catch (err) {
       alert('Error creating employee: ' + err.message);
     } finally {
       setIsCreatingEmployee(false);
     }
   };
   ```

### Task 4: Navbar Dropdown Refactoring
1. Pass the `profile` object to `Navbar` inside `src/App.jsx`:
   ```javascript
   <Navbar 
     currentTab={currentTab} 
     setCurrentTab={setCurrentTab} 
     user={user} 
     profile={profile}
     onLogout={handleLogout} 
   />
   ```
2. Refactor `src/components/Navbar.jsx` to render dropdown menus for both logged-in and logged-out states:
   ```javascript
   import React, { useState } from 'react';
   import { Calendar, Shield, Sparkles, CreditCard, ChevronDown, User, LogOut, LayoutDashboard } from 'lucide-react';

   export default function Navbar({ currentTab, setCurrentTab, user, profile, onLogout }) {
     const [dropdownOpen, setDropdownOpen] = useState(false);

     return (
       <header className="glass-panel" style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--border-color)', padding: '16px 0' }}>
         <div className="container flex align-center justify-between">
           {/* Logo and Nav links as before */}
           ...
           
           <div className="flex align-center gap-4" style={{ position: 'relative' }}>
             {user ? (
               <div style={{ position: 'relative' }}>
                 <button 
                   onClick={() => setDropdownOpen(!dropdownOpen)}
                   className="btn btn-secondary"
                   style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: '0.9rem' }}
                 >
                   <User size={16} />
                   <span>{profile?.full_name || 'My Account'}</span>
                   <ChevronDown size={14} />
                 </button>
                 
                 {dropdownOpen && (
                   <>
                     <div onClick={() => setDropdownOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} />
                     <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '8px', backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)', width: '200px', zIndex: 100, display: 'flex', flexDirection: 'column', padding: '8px 0' }}>
                       <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-color)', marginBottom: '4px' }}>
                         <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Signed in as</p>
                         <p style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
                         <p style={{ fontSize: '0.75rem', textTransform: 'capitalize', color: 'var(--color-primary)', fontWeight: 600 }}>{profile?.role || 'User'}</p>
                       </div>
                       
                       <button onClick={() => { setCurrentTab('dashboard'); setDropdownOpen(false); }} style={{ background: 'none', border: 'none', textAlign: 'left', padding: '10px 16px', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, width: '100%', color: 'var(--color-secondary)' }}>
                         <LayoutDashboard size={16} /> Go to Dashboard
                       </button>
                       
                       <button onClick={() => { onLogout(); setDropdownOpen(false); }} style={{ background: 'none', border: 'none', textAlign: 'left', padding: '10px 16px', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, width: '100%', color: '#ef4444', borderTop: '1px solid var(--border-color)' }}>
                         <LogOut size={16} /> Logout
                       </button>
                     </div>
                   </>
                 )}
               </div>
             ) : (
               <div style={{ position: 'relative' }}>
                 <button 
                   onClick={() => setDropdownOpen(!dropdownOpen)}
                   className="btn btn-primary"
                   style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: '0.9rem' }}
                 >
                   <Shield size={16} />
                   <span>Portal Access</span>
                   <ChevronDown size={14} />
                 </button>
                 
                 {dropdownOpen && (
                   <>
                     <div onClick={() => setDropdownOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} />
                     <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '8px', backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)', width: '200px', zIndex: 100, display: 'flex', flexDirection: 'column', padding: '8px 0' }}>
                       <button onClick={() => { setCurrentTab('portal-login'); setDropdownOpen(false); }} style={{ background: 'none', border: 'none', textAlign: 'left', padding: '10px 16px', fontSize: '0.9rem', cursor: 'pointer', width: '100%', color: 'var(--color-secondary)' }}>
                         Client Portal (Sign In/Up)
                       </button>
                       <button onClick={() => { setCurrentTab('portal-login'); setDropdownOpen(false); }} style={{ background: 'none', border: 'none', textAlign: 'left', padding: '10px 16px', fontSize: '0.9rem', cursor: 'pointer', width: '100%', color: 'var(--color-secondary)', borderTop: '1px solid var(--border-color)' }}>
                         Staff Portal (Sign In)
                       </button>
                     </div>
                   </>
                 )}
               </div>
             )}
           </div>
         </div>
       </header>
     );
   }
   ```

---

## 5. Verification Method

To independently verify these recommendations, execute the following steps:

1. **Lint and Build Verifications**:
   Verify syntax correctness of all components using Vite's build tools:
   * Run command: `npm run lint`
   * Run command: `npm run build`
2. **Client Sign-Up Restrictions**:
   * Inspect the `portal-login` view in the browser (or review code implementation in the proposed `App.jsx` edits) and ensure the "Portal Role" dropdown is not present.
   * Trigger a client registration and confirm that the request payload to Supabase uses `role: 'client'`.
3. **Session Verification for Employee Creator**:
   * Log in as Owner (`ethanburds@gmail.com`) and navigate to the dashboard's "Create Employee" view.
   * Complete the employee creation form.
   * Verify that the owner remains logged in after the secondary client triggers `signUp`.
   * Verify that the database `profiles` table successfully registers the new user with `role: 'employee'`.
