
## 2026-09-24 - Extracted inline JobCard to prevent unnecessary re-renders
**Learning:** Defining a functional component (like `JobCard`) inside another functional component (`ClientHistory`) causes it to be re-created on every parent render. This defeats React's diffing algorithm, unmounting and remounting the component entirely.
**Action:** Extract nested components to the top level, pass necessary closures/state explicitly via props (e.g., `isSelected`), and wrap the extracted component in `React.memo` to maximize rendering performance when only specific elements change.
