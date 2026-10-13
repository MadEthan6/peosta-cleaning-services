## 2024-05-24 - Stripe Secret Key Frontend Exposure
**Vulnerability:** Stripe secret key is fetched and kept in frontend state in `src/components/OwnerSettings.jsx`.
**Learning:** Even if the page is behind authentication and only meant for owners, fetching secrets into the frontend browser exposes them to interception or debugging tools.
**Prevention:** Stripe secret keys must be strictly handled in backend operations to prevent frontend exposure. Never fetch or store them in frontend state. When updating via `.upsert()`, use conditional logic to only update the secret key if a new one is provided.
