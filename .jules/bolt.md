## 2025-07-23 - Nominatim API Debouncing
**Learning:** OpenStreetMap Nominatim API enforces strict rate limits (1 request per second). Implementing a 500ms debounce using `React.useRef` + `setTimeout` on input events prevents accidental IP blocking and ensures responsive typing experiences.
**Action:** Always wrap third-party geocoding API text searches in a debounce function, utilizing `useRef` to store timeout IDs to bypass React rendering cycles.
