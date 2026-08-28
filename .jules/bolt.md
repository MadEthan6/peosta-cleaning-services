## 2024-05-18 - Extract nested functional components
**Learning:** Functional components defined inside other functional components trigger full unmounting and remounting of those inner components on every parent render. This is a common performance anti-pattern.
**Action:** Always define components at the module level (outside other components), pass necessary state as explicit props rather than relying on closures, and wrap them in `React.memo` if they depend on stable props to prevent unnecessary re-renders.
