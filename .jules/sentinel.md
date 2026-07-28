## 2024-07-28 - Avoid dangerouslySetInnerHTML for CSS
**Vulnerability:** Usage of `dangerouslySetInnerHTML` for static CSS injections in React.
**Learning:** Even if the injected string is a hardcoded static string containing CSS, using `dangerouslySetInnerHTML` normalizes an insecure pattern and sets a precedent that might lead to XSS vulnerabilities if user data is later interpolated into it.
**Prevention:** Prefer using standard template literals within a JSX `<style>` tag (e.g., `<style>{`...`}</style>`) to enforce secure coding habits.
