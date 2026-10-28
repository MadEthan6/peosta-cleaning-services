## YYYY-MM-DD - [Title]
**Vulnerability:** Stripe secret key `stripe_secret_key` can be mistakenly overwritten if omitted in an `upsert` when `stripeSecretKey` is empty. The `handleSaveStripe` was doing exactly this without checking if the key was filled.
**Learning:** In Supabase `upsert`, omitted fields are not updated, meaning it's safer to conditionally add the field to the payload if it is non-empty rather than including an empty string. The memory hint about this was very accurate.
**Prevention:** Avoid passing empty strings for keys during upserts. Use conditionally built objects for upserts.
