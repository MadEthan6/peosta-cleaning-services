## 2024-05-24 - Extracted nested React components
**Learning:** Defining functional components inside other functional components (like `JobCard` inside `ClientHistory`) triggers full unmounting and remounting on every parent render, leading to unnecessary DOM manipulation and lost component state.
**Action:** Extract nested component definitions outside the parent component, explicitly pass required data as props to avoid closures, and wrap the extracted component in `React.memo()` to maximize performance benefits.
