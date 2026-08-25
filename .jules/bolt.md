## 2024-08-25 - Prevent Unnecessary Remounts by Extracting Nested Components
**Learning:** Defining functional components (like `JobCard`) inside other functional components (like `ClientHistory`) triggers a full unmount and remount of the nested component on every parent render, severely degrading performance.
**Action:** Always extract inner component definitions outside of their parent components. Pass required data explicitly via props rather than relying on closures from the parent component's scope. Use `React.memo` for further optimization if applicable.
