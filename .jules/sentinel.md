## 2025-05-18 - Fix exposure of backend secrets in frontend query
**Vulnerability:** Supabase frontend queries using `.select('*')` on tables containing backend secrets (like `business_settings.stripe_secret_key`) expose these secrets in the frontend network payload.
**Learning:** Always explicitly specify non-secret columns when fetching data from tables containing backend secrets in frontend code. Avoid using `*` wildcards. For partial updates where the secret is write-only, conditionally include the secret field in the `upsert` payload only if it has been updated, preventing it from being accidentally overwritten with an empty string.
**Prevention:** Use `.select('id, stripe_publishable_key, updated_at')` instead of `.select('*')` when querying sensitive tables from the frontend.
