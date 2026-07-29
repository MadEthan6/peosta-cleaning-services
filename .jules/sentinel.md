## 2024-05-24 - [Avoid dangerouslySetInnerHTML for Static Content]
**Vulnerability:** Used `dangerouslySetInnerHTML` to inject static CSS into a React `<style>` component.
**Learning:** Even if the content is static and not exploitable in the current state, using `dangerouslySetInnerHTML` is an anti-pattern that violates secure coding principles and flags on Static Application Security Testing (SAST) tools.
**Prevention:** For static CSS injections or string values, use standard React children string interpolation (e.g. `<style>{`...`}</style>`) instead of `dangerouslySetInnerHTML`.
