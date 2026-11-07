## 2024-03-24 - Do not fetch secret keys to the frontend
**Vulnerability:** Frontend is fetching all columns from `business_settings` table, including `stripe_secret_key`, via `select('*')`.
**Learning:** Selecting `*` on tables with sensitive columns exposes those columns to the client network payload, creating an information leak.
**Prevention:** Always explicitly define non-secret columns in the `.select()` clause when fetching data from tables containing backend secrets (e.g. `business_settings`). Use conditional updates to avoid clearing secret keys when saving form data.
