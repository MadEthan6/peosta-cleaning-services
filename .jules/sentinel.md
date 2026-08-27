## 2024-05-01 - Prevent Over-fetching in Client Components
**Vulnerability:** Supabase `select('*')` on sensitive tables (like `business_settings`) can expose secrets or configuration info to the client browser.
**Learning:** Avoid `select('*')` on tables with sensitive data. Even if only some fields are used in the UI, the client browser receives the entire object in memory, opening the possibility for data leakage.
**Prevention:** Always explicitly list required columns when querying database tables with sensitive information (e.g., `select('stripe_publishable_key, stripe_secret_key')`). Adhere to the principle of least privilege.
