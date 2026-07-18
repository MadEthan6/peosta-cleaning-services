## 2024-07-18 - Improved accessibility on TodoTasks icon buttons
**Learning:** Icon-only buttons for toggling, deleting, and adding tasks lacked proper accessible names, making them difficult to use for screen reader users. The disabled state on the add task button was also missing a tooltip for context.
**Action:** Always include an `aria-label` and `title` (for tooltip hover) on icon-only buttons. Use dynamic values based on application state (e.g., if a task is completed vs not) to give precise context to users.
