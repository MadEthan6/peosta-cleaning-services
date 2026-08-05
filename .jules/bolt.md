## 2025-02-12 - Extracted nested components
**Learning:** React re-renders unmount and remount components if they are defined inline, leading to significant DOM thrashing and performance degradation, especially in lists.
**Action:** Always extract child component definitions (`const JobCard = ...`) outside of parent components (`const ClientHistory = ...`) and optionally use `React.memo` to optimize rendering.
