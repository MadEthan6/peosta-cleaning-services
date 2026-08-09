## 2023-11-20 - Extracting Inline Components
**Learning:** Defining functional components inside other functional components (e.g., `JobCard` inside `ClientHistory`) triggers full unmounting and remounting on every parent render, severely impacting performance.
**Action:** Always extract inner component definitions outside the parent component, and pass required closures via props (like `isSelected`). Ensure extraction doesn't accidentally remove the component entirely when using diff tools!
