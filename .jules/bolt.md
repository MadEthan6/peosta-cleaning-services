## 2024-08-23 - Optimize derived state array processing
**Learning:** Chaining array methods like `.filter().reduce()` causes unnecessary multiple iterations over data sets, and omitting memoization leads to expensive recalculations on every unrelated state/tab change in the dashboard.
**Action:** Use a single loop inside `React.useMemo` to compute derived states to minimize iterations and prevent re-evaluation unless the source data array changes.
