## 2024-06-12 - Extracted Nested Components

**Learning:** Defining a functional component (`JobCard`) inside another functional component (`ClientHistory`) forces the nested component to be fully unmounted and remounted on every parent render cycle, degrading performance.
**Action:** Always define React components at the top level outside of other components, and use `React.memo` when passing them props like `isSelected` to prevent unnecessary re-renders.
