## 2024-05-18 - Avoid Component Definitions Inside Functional Components
**Learning:** Defining functional components inside other functional components (e.g., `const JobCard = () => ...` inside `ClientHistory`) triggers full unmounting and remounting on every parent render.
**Action:** Extract these component definitions outside the parent component to optimize React rendering performance.
