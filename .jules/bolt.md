## 2024-05-24 - Extract inner functional components
**Learning:** Defining components like JobCard inside another component triggers full remounts for every item in the list whenever the parent state (like selected item) changes.
**Action:** Extract inner components to the module scope, wrap them in React.memo, and pass primitive boolean props (like `isSelected={selected?.id === job.id}`) instead of checking complex global state internally, maximizing memoization benefits.
