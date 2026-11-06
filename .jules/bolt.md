## 2023-11-06 - [Avoid chained array methods on render]
**Learning:** In components like `InvoiceManager.jsx` and `ClientOverview.jsx`, chained array methods like `.filter().reduce()` are executed on every render, recalculating derived state (e.g. `totalUnpaid` or `totalSpent`).
**Action:** Use `useMemo` to memoize these expensive recalculations and only re-run when the source array changes.
