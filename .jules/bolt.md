## 2024-05-24 - Prevent JobCard component remounts in ClientHistory
**Learning:** Defining functional components like `JobCard` directly inside a parent component like `ClientHistory` triggers a full unmount and remount on every parent render, defeating React's reconciliation process.
**Action:** Always extract inner components to the module scope, pass necessary closure state explicitly as props (e.g., passing `isSelected` instead of referencing parent state), and wrap the extracted component in `React.memo` to optimize rendering.
