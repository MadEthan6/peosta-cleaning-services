## 2025-02-18 - Avoid fetching sensitive data using select('*')
**Vulnerability:** Fetching all columns `select('*')` on tables like `business_settings` exposes potentially sensitive, unrelated data columns to the frontend client.
**Learning:** Supabase frontend clients can easily inspect network traffic. Using `select('*')` retrieves all columns and loads them into memory on the user's browser, leading to potential data leakage of configuration settings not intended for a specific view.
**Prevention:** Always specify exactly which columns are needed in `select()` statements, especially for tables containing sensitive configuration data. Never use `select('*')` on sensitive tables to adhere to the principle of least privilege.
