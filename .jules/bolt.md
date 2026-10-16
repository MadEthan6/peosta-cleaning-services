## 2024-05-28 - React Memoization and Extraction in ClientHistory
**Learning:** Defining a functional component (`JobCard`) inside the parent `ClientHistory` causes React to completely unmount and remount every mapped list item whenever the parent re-renders (e.g. when simply selecting a job). This is a massive hidden performance drain on O(N) components.
**Action:** Always define child functional components *outside* the parent body. Wrap them in `React.memo` and pass derived boolean primitives instead of the full active state object to prevent full O(N) re-renders.

## 2024-05-28 - Combined Reduce Filtering in React List Views
**Learning:** Using multiple chained `.filter()` calls to derive segregated state lists (e.g. `upcoming` and `past` jobs) creates redundant O(2N) loops on every render, which is wasteful when standard state selection updates occur.
**Action:** Use a single `reduce` pass to partition arrays and wrap the logic in `useMemo` dependent on the fetched array so it only calculates on fresh data loads.
