## 2026-10-30 - Memoizing inline functional components
**Learning:** Defining a functional component inside another functional component triggers full unmounting and remounting of the child on every parent render, destroying DOM nodes and state.
**Action:** Always extract functional component definitions outside their parent component, explicitly pass required data as props (avoiding closures), and wrap the extracted component in `React.memo` to maximize memoization benefits.
