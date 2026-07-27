## 2024-05-24 - React Anti-Pattern: Component within Component
**Learning:** Found `JobCard` component defined inside `ClientHistory` functional component. This causes `JobCard` to be unmounted and remounted on every render of `ClientHistory`, destroying its state and causing unnecessary DOM updates.
**Action:** Always define React components outside of other components, or use `useMemo`/`useCallback` if they truly need to be inline (though extracting is usually better).
