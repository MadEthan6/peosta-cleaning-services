## 2023-10-24 - Inline Component Definitions trigger full remounts
**Learning:** Defining a functional component (like JobCard) inside a parent component's render function (like ClientHistory) triggers a full unmount and remount of all instances on every single state update of the parent. This destroys local state and is significantly slower than standard re-renders.
**Action:** Always extract inner component declarations out to the module scope. If it needs parent state, pass it explicitly via props.
