## 2024-07-20 - Unsafe React DOM Injection
**Vulnerability:** Found `dangerouslySetInnerHTML` in `src/App.jsx` injecting a hardcoded style string. Even though it's static and not immediately exploitable, using this prop establishes an insecure pattern that could easily be copy-pasted and accidentally modified to include unescaped user data.
**Learning:** React has native protections for text binding (`<style>{...}</style>`) which accomplish exactly what the code was trying to achieve, but safely. The presence of `dangerouslySetInnerHTML` often indicates unfamiliarity with React's native element generation.
**Prevention:** Always use standard JSX curly braces for textual insertions. Ensure linting rules restrict or heavily discourage `dangerouslySetInnerHTML`.
