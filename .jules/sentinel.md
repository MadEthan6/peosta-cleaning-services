## 2024-05-18 - Client-side Exposure of Stripe Secret Key
**Vulnerability:** The frontend Supabase client exposed `stripe_secret_key` via a `.select('*')` query on the `business_settings` table.
**Learning:** Selecting all columns on configuration tables leaks sensitive secrets like Stripe secret keys to the client payload, which can be viewed in network inspection tools.
**Prevention:** Always restrict query selectors to required public fields (e.g. `select('stripe_publishable_key')`) and never manage or update secret keys in frontend state.
