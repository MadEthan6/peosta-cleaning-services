## 2025-07-25 - Prevent XSS in inline styling
**Vulnerability:** Use of `dangerouslySetInnerHTML` for inline stylistic changes inside React components.
**Learning:** Even if it is just CSS, `dangerouslySetInnerHTML` opens up vector for XSS vulnerabilities, and breaks safe coding patterns.
**Prevention:** Always use standard template literals within a JSX `<style>` tag (e.g., `<style>{\`...\`}</style>`) to enforce secure coding habits and prevent potential XSS vulnerabilities.