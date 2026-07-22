## 2025-02-20 - [Performance] Debounce Address Search APIs
**Learning:** React state variables re-initialize on every render and are unsuited for timeout IDs when debouncing frequent input events (like fetching data on keystrokes).
**Action:** When debouncing operations inside a component (e.g., in `App.jsx` and `Calendar.jsx`), consistently use `useRef` to persist the timeout ID across renders. Additionally, ensure `clearTimeout(timeoutRef.current)` is placed explicitly at the beginning of the handler before any logic (such as early returns) runs.
