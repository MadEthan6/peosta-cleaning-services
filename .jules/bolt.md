## 2026-11-03 - Memoize Array Operations in Render
**Learning:** Found array `.filter()` and `.reduce()` operations running synchronously on every re-render in InvoiceManager (and potentially other files). This can cause poor performance as lists grow, especially when filtering involves string matching or formatting.
**Action:** Always wrap `.filter()` and `.reduce()` derived state in `useMemo` when working with lists fetched from Supabase, so calculations are skipped unless the underlying array data actually changes.
