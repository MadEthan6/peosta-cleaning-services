## 2024-05-16 - Avoid dangerouslySetInnerHTML
**Vulnerability:** Use of `dangerouslySetInnerHTML` for CSS injection in React components.
**Learning:** Even for static HTML or CSS, `dangerouslySetInnerHTML` in React poses a security risk if the content is ever parameterized, and it violates secure coding standards for React applications.
**Prevention:** Use standard template literals within a JSX `<style>` tag (e.g., `<style>{...}</style>`) to inject CSS rules securely.
