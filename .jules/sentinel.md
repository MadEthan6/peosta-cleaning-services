## 2024-05-15 - [Exposed Sensitive Data in `business_settings`]
**Vulnerability:** The client fetched `business_settings` using `select('*')`, which exposed the sensitive column `stripe_secret_key` to the frontend.
**Learning:** Never use `select('*')` on tables containing sensitive settings, keys, or tokens. Always explicitly select only the public columns required by the UI.
**Prevention:** Change `select('*')` to `select('stripe_publishable_key, ...')` to avoid implicitly sending secrets over the network.
