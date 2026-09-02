## 2024-09-02 - Extracting inline functional components to prevent unmounting/remounting
**Learning:** Defining functional components inline within other functional components (e.g., `const JobCard = () => ...` inside `ClientHistory`) triggers a full unmount and remount of the child on every parent render, leading to poor performance, especially for lists.
**Action:** Extract inline components outside the parent component, pass required data explicitly via props instead of relying on closures, and wrap the extracted component in `React.memo` to prevent unnecessary re-renders.
