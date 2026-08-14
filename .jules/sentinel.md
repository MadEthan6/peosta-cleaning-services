## 2024-08-14 - Replace dangerouslySetInnerHTML with secure JSX style blocks
**Vulnerability:** Use of `dangerouslySetInnerHTML` for static CSS in React components.
**Learning:** Even for static HTML or CSS styling injections, using `dangerouslySetInnerHTML` in React is a bad practice as it doesn't enforce secure coding habits and could lead to potential XSS vulnerabilities if dynamic data is ever introduced.
**Prevention:** When injecting CSS rules directly into a component, prefer using standard template literals within a JSX `<style>` tag (e.g., `<style>{...}</style>`) to enforce secure coding habits and prevent potential XSS vulnerabilities.
