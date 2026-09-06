## 2025-05-18 - Extracting Inner Components from Render Loop
**Learning:** Defining functional components (like `JobCard`) inside other functional components (like `ClientHistory`) causes the inner component to be completely unmounted and remounted on every parent render, leading to unnecessary DOM node thrashing.
**Action:** Extract inner component definitions outside of their parent components, explicitly pass required data as props (avoiding closures), and wrap the extracted components in `React.memo` to optimize rendering.
