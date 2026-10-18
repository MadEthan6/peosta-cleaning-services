## 2026-10-18 - [Prevent Accidental Key Deletion in Upsert]
**Vulnerability:** The handleSaveStripe function overwrites existing `stripe_secret_key` with empty strings if not provided in the payload.
**Learning:** Upsert behavior on write-only fields replaces existing values.
**Prevention:** Conditionally include write-only variables in upsert payloads.
