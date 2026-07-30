## 2024-05-15 - [Medium] Fix dangerouslySetInnerHTML usage
**Vulnerability:** The application was using `dangerouslySetInnerHTML` to inject CSS styles directly into a component. This is considered an insecure coding habit as it bypasses React's XSS protections. Even though it was used for static CSS, it establishes a dangerous pattern that could be copied by other developers and lead to XSS if used with dynamic user input.
**Learning:** Avoid using `dangerouslySetInnerHTML` in React whenever possible, especially for tasks that have safe alternatives.
**Prevention:** When injecting CSS rules directly into a component, prefer using standard template literals within a JSX `<style>` tag (e.g., `<style>{`...`}</style>`) to enforce secure coding habits and prevent potential XSS vulnerabilities.
