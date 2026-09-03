## 2024-05-24 - React List Rendering Bottleneck
**Learning:** Defining large components inside parent render functions completely bypasses React reconciliation because a new component reference is created every render, forcing costly DOM unmount/remount cycles.
**Action:** Always extract inner component definitions to the module scope and wrap them in `React.memo` (alongside stable props) when mapping over large arrays.
