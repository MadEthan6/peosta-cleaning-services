## 2024-07-24 - Invoice Manager Memoization
**Learning:** Heavy `.filter().reduce()` operations inside React components run on every render.
**Action:** Combine operations and wrap them in `useMemo` to prevent recalculation when unrelated state changes occur, and loop only once instead of twice.
