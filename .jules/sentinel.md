## 2024-11-11 - Prevent leaking of Stripe Secret Key
**Vulnerability:** The application was fetching all columns from the `business_settings` table (including `stripe_secret_key`) on the frontend to populate Owner settings.
**Learning:** Selecting all columns (`select('*')`) from tables containing backend secrets can accidentally leak those secrets to the browser network payload, where any user with access to that endpoint/component can view them.
**Prevention:** Always explicitly select only the non-secret columns required for the frontend (e.g., `select('id, stripe_publishable_key')`). If updating a secret key, use conditional inclusion in `.upsert()` payloads rather than fetching the current secret key state to populate forms.
