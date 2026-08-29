
## 2024-05-24 - Extract inner functional components
**Learning:** Defining a functional component (like JobCard) inside a parent functional component (like ClientHistory) causes the inner component to be completely recreated, unmounted, and remounted on every parent render, killing performance.
**Action:** Extract nested functional components outside their parent, pass necessary data as props, and wrap them in `React.memo` to optimize rendering.
