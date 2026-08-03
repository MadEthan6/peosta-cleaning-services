## 2024-08-03 - Replace dangerouslySetInnerHTML with secure style injection
**Vulnerability:** Use of `dangerouslySetInnerHTML` for CSS styling injections in React components, which can introduce XSS vulnerabilities if user-generated content or variables are unsafely included in the styling string.
**Learning:** React provides standard `<style>` tags for safely interpolating template literals directly, which mitigates the risk associated with explicitly bypassing React's built-in XSS protections using `dangerouslySetInnerHTML`.
**Prevention:** Always avoid `dangerouslySetInnerHTML`. For inline styles or embedded CSS stylesheets, use template literals inside a `<style>` tag, like `<style>{`...`}</style>`.
