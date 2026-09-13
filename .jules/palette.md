## 2025-02-12 - Icon-only Button Accessibility
**Learning:** Icon-only buttons for pagination/calendar navigation frequently lack accessible names and can confuse screen reader users if the SVG icon is read aloud incorrectly.
**Action:** Always ensure icon-only buttons have an `aria-label` describing the action, a `title` for visual tooltips, and `aria-hidden="true"` on the child SVG icon to prevent screen readers from announcing it incorrectly.
