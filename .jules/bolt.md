## 2024-05-24 - Extracting Components to Prevent Remounts
**Learning:** Defining functional components inside other functional components causes them to fully unmount and remount on every parent render, severely impacting performance.
**Action:** Extract these component definitions outside the parent component, explicitly pass required data as props (avoiding closures), and wrap the extracted component in `React.memo`.
