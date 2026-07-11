## 2024-05-18 - OpenStreetMap Nominatim Rate Limits
**Learning:** The frontend makes calls to `nominatim.openstreetmap.org` for address suggestions, which has strict rate limits (1 request/second) and rapid blocking if exceeded.
**Action:** Always ensure that text input searches hitting the OpenStreetMap Nominatim API are debounced (e.g., using a 500ms `setTimeout` with `useRef`) to prevent triggering rate limits.
