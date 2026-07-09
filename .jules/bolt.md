## 2025-02-28 - Nominatim API Rate Limits and Search Inputs
**Learning:** OpenStreetMap Nominatim is rate-limited (absolute max 1 request/second) and aggressively blocks rapid requests. Without debouncing, search inputs directly hitting the API on every keystroke cause rapid blocking, failing address auto-complete entirely and degrading app experience.
**Action:** Implement debouncing (e.g. 500ms `setTimeout`) on all text inputs that trigger 3rd party API lookups.
