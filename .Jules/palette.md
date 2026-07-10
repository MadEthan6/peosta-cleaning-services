## 2024-07-10 - Dynamic Tooltips on Disabled Icon Buttons
**Learning:** Found an accessibility and UX issue pattern where icon-only buttons (like 'Add Task' or 'Delete') lack context, especially when disabled. Without tooltips, users (and screen readers via aria-labels) do not know why an action is unavailable.
**Action:** Always add dynamic `title` attributes that explain the disabled state (e.g. "Enter task name to add") alongside standard `aria-label` attributes for icon-only interactive elements.
