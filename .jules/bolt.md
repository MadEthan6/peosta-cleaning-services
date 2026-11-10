## 2024-05-18 - Memoize Expensive Derived State
**Learning:** Found redundant array filtering and reduction operations (like summing unpaid/paid invoices or filtering upcoming/past jobs) executing on every re-render in React components. This occurs when these derivations are declared directly in the component body without `useMemo`.
**Action:** When filtering or reducing arrays derived from state (like `invoices` or `jobs`), wrap the computations in `useMemo` with the source array as the dependency. This prevents expensive recalculations during unrelated state updates.
