## 2024-05-15 - Icon-only buttons accessibility
**Learning:** Icon-only buttons using lucide-react icons need both `aria-label` (for screen readers) and `title` (for mouse hover tooltips), as well as `aria-hidden="true"` on the icons themselves to avoid screen reader clutter.
**Action:** Always verify icon-only buttons have these three accessibility attributes.
