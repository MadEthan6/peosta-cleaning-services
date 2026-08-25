## 2023-10-27 - Remove dangerouslySetInnerHTML usage
**Vulnerability:** Use of `dangerouslySetInnerHTML` for static HTML/CSS injection.
**Learning:** Even for static content, `dangerouslySetInnerHTML` is an anti-pattern and can become a potential XSS vulnerability if modified later.
**Prevention:** Always use standard template literals within a JSX `<style>` tag for injecting CSS rules.
