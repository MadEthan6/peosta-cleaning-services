## 2024-05-15 - Unintentional Exposure of Secrets via Frontend select('*')
**Vulnerability:** Stripe secret key was fetched on the frontend via `supabase.from('business_settings').select('*')` and held in React state, despite being unused in the UI.
**Learning:** Using `select('*')` on configuration tables with sensitive data exposes those secrets directly to the client browser via network requests and React state. Unused API keys and backend-only secrets must never be queried by frontend components.
**Prevention:** Avoid `select('*')` on sensitive tables; explicitly specify needed columns (e.g., `select('stripe_publishable_key')`). Automatically remove unused state variables and cleanup obsolete component logic.
