## 2025-02-28 - Avoid defining components inside components
**Learning:** Defining a functional React component (like `JobCard`) inside another functional component (`ClientHistory`) forces full unmounting and remounting of all instances of the child component on every render of the parent.
**Action:** Always extract child component definitions outside of parent components and pass state via props. Wrap them in `React.memo` to prevent unnecessary re-renders.
