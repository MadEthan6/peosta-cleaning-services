## 2024-06-25 - Extracted Inner Functional Components for Performance
**Learning:** Defining functional components inside other functional components (e.g. `const JobCard = () => ...` inside `ClientHistory`) triggers a full unmount and remount of the inner component on every render of the parent, which is terrible for performance and ruins smooth CSS transitions.
**Action:** Always extract inner component definitions outside of their parent component, explicitly pass required data via props, and use `React.memo` to prevent unnecessary re-renders.
