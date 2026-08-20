## 2024-08-20 - Prevent component recreation in renders
**Learning:** Defining functional components inside other components triggers full unmounting and remounting on every render, which is a significant performance anti-pattern.
**Action:** Always extract functional component definitions outside their parent components and pass state via props.
