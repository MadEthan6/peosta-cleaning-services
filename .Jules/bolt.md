## 2024-05-15 - Extracted internal functional components and memoized
**Learning:** When functional components are defined inside other functional components (like `JobCard` inside `ClientHistory`), they trigger a full unmount and remount on every parent render.
**Action:** Extract these component definitions outside the parent component, wrap them in `React.memo`, and explicitly pass required data as primitive props (e.g. `isSelected`) instead of using closures. Combine this with `useMemo` for derived lists to prevent cascading performance drops on simple state updates (like list selection).
