## 2024-05-24 - Missing Accessible Labels on Icon-only Buttons
**Learning:** Icon-only action buttons (like delete or add task buttons) in checklist components frequently lack `aria-label`, `title`, and `aria-hidden` on the icons. This makes the UI inaccessible to screen reader users and missing visual tooltips for mouse users.
**Action:** When adding or reviewing icon-only buttons, always ensure they have an `aria-label` describing the action, a `title` for visual tooltips, and `aria-hidden="true"` on the child SVG icon to prevent screen readers from announcing it incorrectly.
