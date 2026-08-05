## 2024-08-05 - Replace dangerouslySetInnerHTML with Template Literals
**Vulnerability:** Found `dangerouslySetInnerHTML` being used to inject CSS rules directly in `src/App.jsx`.
**Learning:** Even for static styling, using `dangerouslySetInnerHTML` can form bad coding habits and occasionally open paths to XSS if dynamics are introduced later. Standard JSX templates are safer.
**Prevention:** Avoid `dangerouslySetInnerHTML` everywhere. Prefer standard template literals within a JSX `<style>` tag (e.g., `<style>{...}</style>`).
