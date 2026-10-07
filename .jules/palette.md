## 2024-10-07 - Accessible Icon-Only Buttons
**Learning:** Icon-only buttons without labels are frequently used but cause issues for screen reader users and users needing explicit descriptions.
**Action:** Always ensure icon-only buttons have an `aria-label` describing the action, a `title` for visual tooltips, and `aria-hidden="true"` on the child SVG icon to prevent screen readers from reading raw SVG markup.
