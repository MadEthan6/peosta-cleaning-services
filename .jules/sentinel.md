## 2023-10-27 - [Exposing Secret Keys via select('*')]
**Vulnerability:** Fetching rows using `.select('*')` on tables like `business_settings` exposes sensitive data like `stripe_secret_key` to the frontend client.
**Learning:** Supabase queries on the frontend must explicitly define only the safe columns required (e.g., `.select('stripe_publishable_key')`). Relying on `*` is inherently risky when tables hold a mix of public and secret data.
**Prevention:** Always use column-specific `.select(...)` statements for tables that might store secrets. Do not use `*` unless the table is guaranteed to only contain public data.
