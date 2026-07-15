## 2024-05-18 - Debouncing Nominatim API Calls
**Learning:** The OpenStreetMap Nominatim API enforces strict rate limiting (1 request/second). Firing requests on every keystroke during address autocomplete causes rapid IP blocking, rendering the feature unusable.
**Action:** Always debounce text input searches (e.g., using a 500ms `setTimeout` with `useRef` or a debounce utility) when integrating with external APIs with strict rate limits, particularly OpenStreetMap.
