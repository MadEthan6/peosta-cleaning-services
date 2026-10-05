## 2024-05-24 - Optimizing React Render Cycles with Derived Boolean Props
**Learning:** When using React.memo on child list items (like `JobCard`), passing a global selection ID prop (e.g. `selectedId={selectedId}`) causes *all* list items to re-render whenever the selection changes, as the primitive value changes for everyone.
**Action:** Pass a derived boolean instead (e.g., `isSelected={selected?.id === job.id}`). This ensures that only the two affected components (the newly selected and previously selected items) have their primitive props changed, maximizing `React.memo` benefits.
