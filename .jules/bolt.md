## 2026-09-14 - Extract inner components and use primitive props for memoization
**Learning:** Defining functional components inside other components triggers full unmounting/remounting. Additionally, passing complex global objects to memoized children reduces memoization benefits compared to passing primitive derived values.
**Action:** Extract inner components and pass primitive derived props (e.g., isSelected) instead of global selection objects to maximize React.memo effectiveness.
