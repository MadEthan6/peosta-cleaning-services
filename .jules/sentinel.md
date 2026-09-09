## 2024-09-09 - XSS Risk in React styling
**Vulnerability:** Found `dangerouslySetInnerHTML` being used to inject static CSS rules directly into a component.
**Learning:** Even for static styling, using `dangerouslySetInnerHTML` is an insecure coding practice in React and can lead to XSS vulnerabilities if the input ever becomes dynamic.
**Prevention:** Always prefer using standard template literals within a JSX `<style>` tag (e.g., `<style>{\`...\`}</style>`) to enforce secure coding habits.
