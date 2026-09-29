## 2024-05-20 - Icon-only buttons lack ARIA labels
**Learning:** Found several components (like JobChecklist, TodoTasks, etc.) using `lucide-react` icons inside `<button>` elements without accessible names. Screen readers will just announce "button" with no context for actions like delete/trash.
**Action:** When adding or modifying icon-only buttons, always ensure they have an `aria-label` describing the action, a `title` for visual tooltips, and `aria-hidden="true"` on the child SVG icon to prevent screen readers from announcing it incorrectly (as per memory).
