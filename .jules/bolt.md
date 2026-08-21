## 2024-05-24 - Extracted Component Definitions from Render Loops
**Learning:** Defining React components (like `JobCard`) inside the parent component's body causes full unmounting and remounting on every render because the component function reference changes.
**Action:** Always define child functional components at the file scope (outside the parent component) and pass necessary state explicitly via props to prevent unnecessary DOM churn and React render thrashing.
