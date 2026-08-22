## 2024-05-19 - Extracted JobCard outside of ClientHistory component
**Learning:** Defining a functional component inside another functional component causes React to fully unmount and remount the inner component on every render of the parent component, leading to unnecessary DOM manipulation and performance bottlenecks.
**Action:** Always define functional components at the top level (outside of other functional components) and pass necessary state/data via props.
