## 2024-07-24 - Avoid dangerouslySetInnerHTML for Inline Styles
**Vulnerability:** Found `dangerouslySetInnerHTML` being used for injecting dynamic CSS rules into a `<style>` tag in `src/App.jsx`.
**Learning:** Even though injecting static CSS might seem harmless, using `dangerouslySetInnerHTML` violates strict secure coding habits in React applications.
**Prevention:** Always use standard template literals within a JSX `<style>` tag (e.g., `<style>{...}</style>`) instead of `dangerouslySetInnerHTML` for inline styles to prevent potential XSS vulnerabilities.
