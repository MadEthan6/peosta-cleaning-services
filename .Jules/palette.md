## 2024-05-24 - Icon-Only Button Accessibility in Task Components
**Learning:** Found a pattern of missing `aria-label` and `title` attributes on icon-only buttons (like check, trash, and plus icons) across task-related components like TodoTasks. This makes it difficult for screen reader users to understand the button's purpose and for sighted users to understand disabled states.
**Action:** Always include both an `aria-label` for screen readers and a dynamic `title` for hover tooltips (especially to explain disabled states) when implementing icon-only buttons in task or list components.
