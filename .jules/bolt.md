
## 2026-08-11 - Optimize Array Iterations in React
**Learning:** When calculating derived state from arrays (e.g. totals from invoices), chaining `.filter().reduce()` causes redundant iterations and unnecessary processing on every re-render. Combining them into a single `.reduce()` inside a `useMemo` hook reduces iteration passes and correctly memoizes the expensive calculation, tying it only to changes in the target array.
**Action:** Use a single loop with `useMemo` instead of chaining multiple array methods for derived state to improve component render performance.
