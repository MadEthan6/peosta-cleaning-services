## 2026-10-04 - Optimize ClientHistory rendering and memoization
**Learning:** Extracting functional components defined inside other functional components and wrapping them in `React.memo` (while explicitly passing derived props) prevents massive, unnecessary DOM unmounting and remounting on every parent render.
**Action:** Always define React components outside their parent to maintain object identity across renders and use `useMemo` to prevent expensive redundant list derivations during unrelated state updates.
