## 2024-03-24 - Accessibility improvements for icon-only buttons
**Learning:** I found multiple icon-only buttons (`<Trash2 />` mostly for deletion) missing `aria-label`, `title`, and `aria-hidden="true"` on the SVG. These are essential for screen readers and helpful for sighted users as tooltips.
**Action:** When adding or modifying icon-only buttons, always include `aria-label`, `title`, and `aria-hidden="true"` on the icon itself.
