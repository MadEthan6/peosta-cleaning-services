## 2024-05-15 - DangerouslySetInnerHTML Found
**Vulnerability:** XSS vulnerability through `dangerouslySetInnerHTML`.
**Learning:** Found dangerouslySetInnerHTML being used in `src/App.jsx` for injecting CSS styles.
**Prevention:** Avoid `dangerouslySetInnerHTML` for CSS styling injections and use standard template literals within a JSX `<style>` tag instead.
## 2024-05-15 - Data Leak in OwnerSettings.jsx
**Vulnerability:** Fetching unnecessary columns from `business_settings` potentially exposes sensitive secrets (`stripe_secret_key`).
**Learning:** Using `select('*')` on tables containing secrets like `business_settings` exposes them to the client's browser.
**Prevention:** Explicitly specify only the needed columns (e.g., `select('stripe_publishable_key')`) when querying data via Supabase in frontend components.
