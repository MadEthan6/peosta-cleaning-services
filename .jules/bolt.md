## 2026-08-30 - React Inline Functional Component Antipattern
**Learning:** Defining a functional component inside another functional component (like JobCard inside ClientHistory) triggers full unmounting and remounting on every parent render, severely impacting performance and causing potential loss of component state/focus.
**Action:** Extract these definitions outside the parent component, pass required data explicitly via props (avoiding closures), and wrap the extracted component in React.memo.
