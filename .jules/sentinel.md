## 2024-05-15 - Prevent Stripe Secret Key Leakage
**Vulnerability:** Stripe secret key was fetched from the database using `.select('*')` and stored in client-side state, potentially exposing it in network payloads. The upsert logic also required the secret key to be present to prevent overwriting it with an empty string during partial updates.
**Learning:** Always explicitly list non-sensitive columns when fetching data containing secrets to prevent network exposure. Treat secret keys as write-only on the frontend.
**Prevention:** Use `.select('id, col1, col2')` instead of `.select('*')` for tables with secrets. Conditionally include secrets in upsert payloads only if they are explicitly updated, allowing for safe partial updates of other settings without needing the secret key in state.
