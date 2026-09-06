## 2025-03-09 - Client-side Exposure of Secret Keys via `select('*')`
**Vulnerability:** Frontend components were retrieving all columns from sensitive database tables (e.g., `business_settings`) using `select('*')`. This caused sensitive fields, such as the `stripe_secret_key`, to be fetched and potentially exposed to the client's browser.
**Learning:** Frontend state and API calls should never request or handle backend secret keys, even if the user is authenticated as an admin. The principle of least privilege applies to data fetching.
**Prevention:** Avoid using `select('*')` on tables containing mixed public/sensitive data. Explicitly specify only the required non-sensitive columns (e.g., `select('stripe_publishable_key')`).
