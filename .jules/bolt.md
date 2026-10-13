
## 2024-05-18 - Prevent list rendering churn
**Learning:** Defining inline functional components (e.g., `JobCard`) inside parent components causes full unmounting and remounting on every parent render. Chaining `.filter()` calls on arrays inside the render body also redundantly recalculates derived lists when unrelated state (like selection) changes.
**Action:** Extract list item components outside their parent, pass primitive props (e.g., `isSelected={selected?.id === item.id}` instead of closures), and wrap them in `React.memo`. Combine multiple `.filter()` iterations into a single loop wrapped in `useMemo` when dividing arrays into multiple lists.
