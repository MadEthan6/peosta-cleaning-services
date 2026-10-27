## 2024-10-27 - [Title]
**Learning:** [Insight]
**Action:** [How to apply next time]
## 2024-10-27 - Extract nested functional components to prevent excessive re-renders
**Learning:** Defining functional components inside other functional components (like `JobCard` inside `ClientHistory`) is an anti-pattern. It causes the nested component to be recreated and fully remounted on every parent render.
**Action:** Extract nested components outside the parent component, explicitly pass required data as props (avoiding closures), and wrap the extracted component in `React.memo`. For derived boolean props (e.g., `isSelected={selected?.id === job.id}`), this maximizes memoization benefits.
