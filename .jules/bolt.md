# Bolt Performance Journal
## 2024-05-19 - React Re-render Bottlenecks in Nested Definitions
**Learning:** Defining functional components inside other functional components (e.g., `JobCard` inside `ClientHistory`) forces React to completely recreate the component reference on every parent render, leading to full DOM unmounting and remounting rather than just updating changed props.
**Action:** Always define React components at the top level, outside of other components. Use `React.memo` and pass primitives (like `isSelected` booleans) instead of relying on closures for dynamic styling.
