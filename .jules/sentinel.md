## 2024-05-15 - Prevent sensitive data leakage in Supabase queries
**Vulnerability:** Fetching and storing Stripe secret keys in the frontend state.
**Learning:** Selecting all columns (`select('*')`) from sensitive tables (like `business_settings`) can expose secrets (like `stripe_secret_key`) to the browser, violating the principle of least privilege and risking credential theft if the frontend is compromised or inspected by users.
**Prevention:** Explicitly specify non-sensitive columns in `select()` statements (e.g., `select('stripe_publishable_key')`) and never store secret keys in frontend state. Secret keys should only be handled in backend edge functions or secure server environments.
