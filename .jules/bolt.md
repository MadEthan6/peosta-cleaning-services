## 2024-03-21 - [Extract Inner Component Definitions]
**Learning:** Defining React functional components inside other components (like `JobCard` inside `ClientHistory`) causes full unmounting and remounting on every parent render, completely negating standard React reconciliation and destroying internal state.
**Action:** Extract inner component definitions outside the parent component, explicitly pass required data as props (avoiding closures), and wrap the extracted component in `React.memo` to maximize performance benefits.
