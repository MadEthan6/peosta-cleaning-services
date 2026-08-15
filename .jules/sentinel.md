## 2025-02-18 - Avoid dangerouslySetInnerHTML
**Vulnerability:** Use of `dangerouslySetInnerHTML` for static CSS in App.jsx.
**Learning:** Even for static hardcoded strings, `dangerouslySetInnerHTML` is flagged by SAST tools and sets a bad precedent in React applications.
**Prevention:** Always use standard JSX text children `<style>{`...`}</style>` for internal CSS to enforce secure coding habits and mitigate potential XSS vectors if dynamic data is ever introduced.
