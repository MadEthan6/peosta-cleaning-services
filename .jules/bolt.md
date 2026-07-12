## 2026-07-12 - [Debounce External API Calls to Prevent Rate Limiting]
**Learning:** Synchronously fetching an external rate-limited API (like Nominatim OpenStreetMap) on every keystroke acts as an anti-pattern, causing rapid application blocking and 429 Too Many Requests errors.
**Action:** Always wrap text-input API calls with a debounce function (e.g. 500ms using `useRef` and `setTimeout`) to minimize unnecessary network requests and strictly adhere to third-party rate limits.
