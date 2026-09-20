## 2026-09-20 - Remove dangerouslySetInnerHTML Usage
**Vulnerability:** The `dangerouslySetInnerHTML` prop was used for injecting static CSS styling, which is an insecure coding habit that can lead to XSS vulnerabilities if dynamic data is ever introduced.
**Learning:** Even for static HTML or CSS styling injections, `dangerouslySetInnerHTML` should be avoided to enforce secure coding habits and prevent potential XSS vulnerabilities.
**Prevention:** Prefer using standard template literals within a JSX `<style>` tag (e.g., `<style>{`...`}</style>`).
