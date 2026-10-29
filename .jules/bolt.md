
## 2024-07-26 - Optimize React list re-renders and filtering in ClientHistory
**Learning:** Defining functional components inside other functional components (like `JobCard` in `ClientHistory`) triggers a full unmount and remount on every parent render. Additionally, mapping over state arrays with `filter` on every render causes unnecessary recalculations and re-renders, especially on list selections.
**Action:** Always extract child functional components, pass explicit props (no parent closures), and wrap them in `React.memo`. When extracting arrays from state using `filter`, combine iterations and wrap them in `useMemo` to prevent redundant calculations during unrelated state updates.
