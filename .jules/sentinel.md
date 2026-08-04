## 2024-08-04 - [React Security Enhancement: Replacing dangerouslySetInnerHTML in Style Tags]
**Vulnerability:** Static CSS injection was performed using `dangerouslySetInnerHTML`. While not immediately exploitable with static strings, it establishes a poor pattern that could lead to XSS if dynamic values are ever introduced.
**Learning:** `dangerouslySetInnerHTML` is often mistakenly used as a shortcut for injecting inline styles in React components.
**Prevention:** Always use standard template literals within a JSX `<style>` tag (e.g., `<style>{\`...\`}</style>`) to enforce secure coding habits and mitigate potential XSS vectors.
