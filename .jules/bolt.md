## 2025-02-12 - Prevent Unnecessary Renders by Extracting Components
**Learning:** Defining a functional component inside another functional component's render body causes the nested component to fully unmount and remount on every parent render, leading to significant DOM thrashing and performance degradation, particularly in lists.
**Action:** Always extract child functional components to the module scope, pass required state as explicit props rather than relying on closures, and wrap the extracted component in `React.memo` to ensure it only re-renders when its specific props change.
