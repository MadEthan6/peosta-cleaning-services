
## 2024-05-18 - Accessibility for icon-only destructive actions
**Learning:** Icon-only buttons used for destructive actions (like delete) in lists/tables are common in this app but often lack context. Without labels, screen reader users hear only "button", and mouse users get no hover context.
**Action:** Always add both `aria-label` (for screen readers) and a matching `title` (for mouse hover tooltips) to icon-only buttons, especially those using Lucide icons like `<Trash2 />`.
