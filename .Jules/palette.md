## 2024-07-08 - Icon-only buttons lacking ARIA labels
**Learning:** Found a consistent pattern where icon-only buttons (like Trash, Chevron, Eye, and Close) were missing `aria-label` attributes across multiple components. This makes these actions inaccessible to screen reader users.
**Action:** Always ensure `aria-label` is present on any button that does not contain text.
