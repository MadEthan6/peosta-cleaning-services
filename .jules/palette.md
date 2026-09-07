## 2024-05-18 - Icon-Only Buttons Require ARIA Labels
**Learning:** Found multiple instances of icon-only buttons (like Calendar navigation, Invoice deletion, and Toast close buttons) that lacked accessible names.
**Action:** When creating or reviewing icon-only buttons, always ensure they have an `aria-label` describing the action, a `title` for visual tooltips, and `aria-hidden="true"` on the SVG icon itself to prevent screen readers from announcing it incorrectly.
