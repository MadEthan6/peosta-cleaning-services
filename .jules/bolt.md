## 2024-05-18 - [Add debounce for Nominatim API]
**Learning:** Nominatim API requires debouncing due to strict rate limits (1 req/sec). Un-debounced searches could block requests.
**Action:** Always wrap Nominatim fetch calls with a debouncing mechanism to prevent hitting rate limit issues and improving API load time.
