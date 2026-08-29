## YYYY-MM-DD - Fetching sensitive configuration fields exposes them to the client
**Vulnerability:** The application fetches sensitive database fields, like `stripe_secret_key`, directly to the frontend inside `src/components/OwnerSettings.jsx` via `supabase.from('business_settings').select('*')`.
**Learning:** Returning all columns (`select('*')`) on tables with sensitive configuration data exposes secrets to the client browser, violating the principle of least privilege.
**Prevention:** Always explicitly specify required, safe columns in frontend data fetching (e.g., `select('id, stripe_publishable_key')`). Ensure that operations requiring secrets (like `stripe_secret_key`) are performed strictly on the backend.
