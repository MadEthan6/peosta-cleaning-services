## 2024-10-16 - Prevent secret key overwriting
**Vulnerability:** Empty inputs for write-only fields (like Stripe Secret Key) were overwriting existing keys in the database via `.upsert()`.
**Learning:** Omitted fields in `.upsert()` payloads do not overwrite existing columns, allowing safe partial updates.
**Prevention:** Conditionally include write-only fields in the `.upsert()` payload only if they have been explicitly populated, preventing accidental overwriting with empty strings.

## 2024-10-16 - Stop fetching secret keys to the frontend
**Vulnerability:** The Stripe Secret Key was fetched to the frontend and set in state.
**Learning:** `select('*')` on tables like `business_settings` fetches sensitive data to the client's browser.
**Prevention:** Avoid `select('*')` on tables with sensitive data. Explicitly specify only the needed columns to prevent exposing secret keys to the frontend.
