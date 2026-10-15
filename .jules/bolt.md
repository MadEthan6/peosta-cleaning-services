## 2024-10-24 - Do not define inner functional components inside render loops
**Learning:** Defining a functional component (like `JobCard`) inside a parent component (like `ClientHistory`) triggers a full unmount and remount of the inner component on every parent render, defeating React reconciliation and hurting performance.
**Action:** Extract inner components outside the parent component, explicitly pass required data as props (avoiding closures), and wrap the extracted component in `React.memo`.
