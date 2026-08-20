## 2024-08-20 - Icon-only buttons lack ARIA labels
**Learning:** Found several icon-only buttons (like delete buttons with Trash2, close buttons with ✕, show/hide password buttons with Eye/EyeOff) that lack ARIA labels, making them inaccessible to screen readers.
**Action:** When implementing icon-only buttons, standard UX/a11y practice is to include both an `aria-label` for screen readers and a dynamic `title` attribute for hover tooltips (especially to explain what the button does).
