## 2023-10-27 - Extract and Memoize Nested React List Components
**Learning:** Defining functional components (like `JobCard`) inside their parent components (like `ClientHistory`) triggers a full unmount and remount of all list items on every parent render (e.g., when merely selecting an item).
**Action:** Extract nested list components outside the parent, pass required data explicitly via props (avoiding closures), and wrap the extracted component in `React.memo` using derived primitive boolean props (like `isSelected`) to maximize memoization benefits.
