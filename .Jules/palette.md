## 2024-03-22 - Icon-only Buttons Missing Accessibility
**Learning:** Multiple components (InvoiceManager, TodoTasks, JobChecklist, Calendar) contain icon-only buttons (like Trash2, ChevronLeft, ChevronRight) that lack `aria-label` or `title` attributes, making them inaccessible to screen readers and lacking tooltips for mouse users.
**Action:** Add `aria-label` and `title` to all icon-only buttons.
