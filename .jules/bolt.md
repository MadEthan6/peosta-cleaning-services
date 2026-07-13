## 2025-02-28 - Debounce Nominatim API requests
**Learning:** The application uses OpenStreetMap Nominatim API for address autocompletion. The API has strict rate limits (1 request/second) and rapid, blocking policies. Direct onChange handlers on input fields triggered a request per keystroke.
**Action:** Implement debouncing with at least 500ms delay for all text inputs tied to Nominatim API to ensure compliance and avoid UI blocking.
