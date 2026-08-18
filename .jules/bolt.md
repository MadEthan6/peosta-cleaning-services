## 2024-05-24 - Extract inner functional components to prevent full unmount/remount
**Learning:** Defining functional components inside other functional components (like `JobCard` inside `ClientHistory`) triggers full unmounting and remounting on every parent render, leading to performance issues and lost state/focus.
**Action:** Extract inner component definitions outside the parent component, and pass required data/handlers as props.
