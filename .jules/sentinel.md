## 2024-10-21 - Prevent frontend exposure of secret keys
**Vulnerability:** The Stripe secret key (`stripe_secret_key`) was being fetched from the database and exposed to the frontend browser in `src/components/OwnerSettings.jsx`.
**Learning:** Even for owner or admin dashboards, secret keys meant for backend operations should never be fetched or stored in frontend state. They can easily be extracted by the user.
**Prevention:** Only select required public fields (e.g. `stripe_publishable_key`) when fetching configuration from the database on the frontend. Treat secret keys as write-only in the frontend UI, and conditionally update them without fetching their current values.
