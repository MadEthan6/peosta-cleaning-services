## 2025-05-18 - Avoid dangerouslySetInnerHTML for Inline Styles
**Vulnerability:** XSS risk from using `dangerouslySetInnerHTML` to inject CSS styles into React components.
**Learning:** Developers sometimes use `dangerouslySetInnerHTML` for static `<style>` injection, not realizing it breaks secure React coding conventions and introduces potential risk if dynamic variables are ever added inside the template string.
**Prevention:** Always use standard JSX template literals within `<style>` tags (e.g., `<style>{\`...\`}</style>`) instead of `dangerouslySetInnerHTML` when adding component-level CSS.
