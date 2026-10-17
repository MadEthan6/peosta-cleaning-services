
## 2024-05-14 - React Performance: Component Definitions & Array Derivations
**Learning:** Defining components (like `JobCard`) inside other functional components causes them to unmount and remount completely on every parent render. Deriving filtered arrays directly in the component body (like `jobs.filter(...)`) causes redundant calculations every time state changes (even unrelated state like `selected`).
**Action:** Extract nested component definitions outside their parent components, pass required data explicitly via props (avoiding closures), and wrap them in `React.memo` with primitive props when possible. Wrap expensive array derivations (like filtering lists) in `useMemo` so they only recalculate when their dependencies change.
