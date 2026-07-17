## 2024-05-24 - Debouncing Third-Party API Calls (Nominatim)
**Learning:** When integrating with the OpenStreetMap Nominatim API, text input searches must be debounced to prevent triggering rate limits. Furthermore, to prevent race conditions when input is rapidly cleared, ensure `clearTimeout` is placed at the very beginning of the handler, before any early returns.
**Action:** Use `useRef` to store the timeout ID and call `clearTimeout` immediately inside the change handler before evaluating the input's length. Set a 500ms timeout for the API fetch call.
