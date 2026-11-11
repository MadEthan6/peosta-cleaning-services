
## 2025-02-23 - Avoid redundant array filtering in frequently re-rendering components
**Learning:** React components that render lists often compute derived arrays (e.g., separating "upcoming" and "past" jobs via `.filter()`). Without memoization, these operations run synchronously during *every* render cycle, even for unrelated state updates (like merely clicking an item to set `selected`).
**Action:** Wrap such array derivations in `useMemo` with the original data array as the dependency when the component involves other interactive state that frequently triggers re-renders. Always ensure to add comments explaining the specific performance optimization in the code.
