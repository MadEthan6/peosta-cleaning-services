## 2024-05-15 - React.memo in list components
**Learning:** Extracting list item components from the parent rendering scope and passing explicit boolean equality checks (e.g. `isSelected={selected?.id === job.id}`) instead of passing the selected state directly avoids unnecessary full re-renders of non-selected items.
**Action:** Always define components outside their parent component when iterating loops. Pass computed primitive boolean values instead of whole state objects when wrapping extracted item components in `React.memo` to maximize memoization benefits.
