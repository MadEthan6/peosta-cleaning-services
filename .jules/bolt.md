## 2024-05-15 - React Component Definition in Render Loop
**Learning:** Functional components like `JobCard` defined inside a parent component (`ClientHistory`) will trigger full unmounting and remounting on every parent render, defeating React's reconciliation process and hurting performance significantly when the parent re-renders frequently (e.g. from state changes like `setSelected`).
**Action:** Extract inline components outside of the parent, explicitly pass required data via props, and use `React.memo` to maximize rendering efficiency. Always derive boolean states like `isSelected` instead of passing a global state `selected` to all items.

## 2024-05-15 - Chaining array operations in React Render
**Learning:** Derived state (like `.filter()`) executed on every render inside a React component will cause unnecessary recalculations during unrelated state updates, which can be computationally expensive on larger lists.
**Action:** Wrap derived states with `useMemo(() => data.filter(...), [data])` to prevent redundant recalculation.
