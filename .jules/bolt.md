## 2026-07-30 - [Extract Inner Component]
**Learning:** Defining a functional component inside another functional component causes the inner component to be completely unmounted and remounted on every state change of the parent.
**Action:** Always extract inner component definitions outside the parent component scope.
