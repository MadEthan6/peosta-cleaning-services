## 2024-07-12 - Missing accessible labels on icon-only buttons
**Learning:** Found a recurring pattern across the app where icon-only buttons (like `Trash2` for deleting items or `ChevronLeft`/`ChevronRight` for navigation) were missing `aria-label` and `title` attributes. This breaks accessibility for screen reader users and fails to provide tooltip context for mouse users.
**Action:** When implementing icon-only buttons, always ensure they include both an `aria-label` describing the action for screen readers and a dynamic `title` attribute for visual tooltips.
