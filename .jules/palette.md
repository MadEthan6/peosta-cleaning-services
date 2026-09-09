## 2025-02-12 - Added ARIA labels and tooltips to TodoTasks icon buttons
**Learning:** Icon-only buttons (like toggle task, delete, add) in TodoTasks.jsx lacked accessible labels, making them difficult for screen reader users and leaving non-obvious hover contexts.
**Action:** Always ensure icon-only buttons have an `aria-label` describing the action, a `title` for visual tooltips, and `aria-hidden="true"` on the child SVG icon to prevent screen readers from announcing it incorrectly.
