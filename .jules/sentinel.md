## 2026-07-11 - [Remove dangerouslySetInnerHTML]
**Vulnerability:** Found `dangerouslySetInnerHTML` being used in `src/App.jsx` to inject a style block for toast notifications.
**Learning:** Even though the injected content was static CSS, using `dangerouslySetInnerHTML` bypasses React's XSS protections and can be flagged by security audits.
**Prevention:** Avoid using `dangerouslySetInnerHTML` for static content. Use standard JSX elements (like `<style>{...}</style>`) or move styles to external CSS files.
