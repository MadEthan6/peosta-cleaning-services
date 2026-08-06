## 2025-02-18 - Avoid dangerouslySetInnerHTML for Style Injection
**Vulnerability:** Found `dangerouslySetInnerHTML` being used to inject CSS animations inside `<style>` tags in React components.
**Learning:** While static string injection isn't directly exploitable, using `dangerouslySetInnerHTML` is considered an anti-pattern and can become an XSS vector if variables are later introduced into the template string.
**Prevention:** Always use standard template literals within a JSX `<style>` tag (e.g., `<style>{`...`}</style>`) to enforce secure coding habits and prevent potential XSS vulnerabilities.
