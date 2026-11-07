## 2025-05-18 - Optimize chained arrays operations
**Learning:** React state transformations that chain `.filter()` and `.reduce()` runs the array loops O(2n) or O(3n) times which is sub-optimal and runs every render unmemoized.
**Action:** Always combine array operations via `.reduce()` iterating once and `useMemo()` on the array.
