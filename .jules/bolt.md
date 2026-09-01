## 2026-09-01 - Extract inner components and memoize
**Learning:** Defining components inside other functional components causes unnecessary full unmounting and remounting on every parent render.
**Action:** Extract nested components, pass required data explicitly via props instead of relying on closures, and wrap in React.memo.
