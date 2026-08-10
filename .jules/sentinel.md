## 2024-05-24 - Removed dangerouslySetInnerHTML
**Vulnerability:** Found `dangerouslySetInnerHTML` being used for a static style block in `src/App.jsx`.
**Learning:** Even though the style block was statically defined without dynamic variables (mitigating immediate XSS risks), it's a security anti-pattern. If future developers added dynamic interpolation, it could lead to XSS.
**Prevention:** Used standard string children in `<style>{`...`}</style>` components. Avoid `dangerouslySetInnerHTML` whenever standard React DOM capabilities apply, especially for static content.