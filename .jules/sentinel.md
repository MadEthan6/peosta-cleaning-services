## 2025-02-27 - Remove dangerouslySetInnerHTML
**Vulnerability:** The `dangerouslySetInnerHTML` React prop was being used to inject static CSS via a string template in `src/App.jsx`.
**Learning:** While the input string in this specific instance was static (and thus not an active XSS vulnerability), using `dangerouslySetInnerHTML` establishes a dangerous pattern. If future developers added dynamic string interpolation to that CSS block, it could introduce a severe Cross-Site Scripting (XSS) vulnerability.
**Prevention:** Avoid `dangerouslySetInnerHTML` for CSS injection. Standard template literals inside a JSX `<style>` tag (e.g., `<style>{...}</style>`) natively support rendering text strings safely and eliminate this risk vector.
