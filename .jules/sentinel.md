## 2024-05-24 - Frontend Exposure of Stripe Secret Keys
**Vulnerability:** Stripe secret keys (`stripe_secret_key`) were being unintentionally fetched into frontend state via a `select('*')` query on the `business_settings` table within `OwnerSettings.jsx`.
**Learning:** Using `select('*')` on database tables containing sensitive operational credentials can leak these secrets to the frontend application memory, exposing them to attackers through tools like browser developer extensions or memory dumps.
**Prevention:** Avoid `select('*')` on tables containing sensitive fields. Explicitly request only the non-sensitive columns required for frontend operation. Never manage sensitive API secrets directly from client-side state.
